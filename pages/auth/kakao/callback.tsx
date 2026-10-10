import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { KAKAO_AUTH } from '../../../apollo/user/mutation';
import { setJwtToken, updateUserInfo } from '../../../libs/auth';
import { consumeKakaoAuthorizationState, getKakaoRedirectUri } from '../../../libs/auth/social';
import { useI18n } from '../../../libs/i18n';

const KakaoCallbackPage: NextPage = () => {
	const { t } = useI18n();
	const router = useRouter();
	const [message, setMessage] = useState(t('auth.kakao.completing'));
	const processedRef = useRef(false);
	const [kakaoAuth] = useMutation(KAKAO_AUTH);

	useEffect(() => {
		if (!router.isReady || processedRef.current) return;
		processedRef.current = true;
		const code = typeof router.query.code === 'string' ? router.query.code : '';
		const state = typeof router.query.state === 'string' ? router.query.state : '';
		const providerError = typeof router.query.error === 'string' ? router.query.error : '';
		const redirectTarget = consumeKakaoAuthorizationState(state);

		if (providerError || !code) {
			setMessage(providerError === 'access_denied' ? t('auth.kakao.cancelled') : t('auth.kakao.failed'));
			return;
		}
		if (!redirectTarget) {
			setMessage(t('auth.kakao.invalidRequest'));
			return;
		}
		void (async () => {
			try {
				const { data } = await kakaoAuth({
					variables: { input: { code, redirectUri: getKakaoRedirectUri() } },
				});
				const member = data?.kakaoAuth;
				if (!member?.accessToken) throw new Error('KAKAO_AUTH_FAILED');
				setJwtToken(member.accessToken);
				updateUserInfo(member.accessToken);
				await router.replace(redirectTarget);
			} catch {
				setMessage(t('auth.kakao.failedRetry'));
			}
		})();
	}, [kakaoAuth, router, router.isReady, router.query.code, router.query.error, router.query.state]);

	return (
		<>
			<Head><title>{t('auth.kakao.metaTitle')}</title></Head>
			<main className="auth-callback-status" aria-live="polite"><p>{message}</p></main>
		</>
	);
};

export default KakaoCallbackPage;
