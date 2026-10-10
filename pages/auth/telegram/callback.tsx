import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApolloError, useMutation } from '@apollo/client';
import { TELEGRAM_AUTH } from '../../../apollo/user/mutation';
import { setJwtToken, updateUserInfo } from '../../../libs/auth';
import { consumeTelegramAuthorizationState, getTelegramRedirectUri } from '../../../libs/auth/social';
import { useI18n } from '../../../libs/i18n';

/** Backend Messages that are safe and useful to show; they are matched here and translated through serverErrors.* **/
const TELEGRAM_USER_MESSAGES = [
	'Telegram authentication is not configured!',
	'Telegram authorization code, redirect URI, or PKCE verifier is invalid or expired.',
	'Telegram authentication is temporarily unavailable. Please try again.',
	'Telegram authentication failed. Please try again.',
];

const getCallbackServerMessage = (error: unknown): string => {
	const message = error instanceof ApolloError ? error.graphQLErrors?.[0]?.message : '';
	return message && TELEGRAM_USER_MESSAGES.includes(message) ? message : '';
};

const TelegramCallbackPage: NextPage = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const [message, setMessage] = useState(t('auth.telegram.completing'));
	const [failed, setFailed] = useState(false);
	const processedRef = useRef(false);
	const [telegramAuth] = useMutation(TELEGRAM_AUTH);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady || processedRef.current) return;
		processedRef.current = true;
		const code = typeof router.query.code === 'string' ? router.query.code : '';
		const state = typeof router.query.state === 'string' ? router.query.state : '';
		const providerError = typeof router.query.error === 'string' ? router.query.error : '';
		// Always consume the pending request so a state/verifier can never be replayed
		const pending = consumeTelegramAuthorizationState(state);

		const fail = (text: string) => {
			setFailed(true);
			setMessage(text);
		};

		if (providerError || !code) {
			fail(providerError === 'access_denied' ? t('auth.telegram.cancelled') : t('auth.telegram.failed'));
			return;
		}
		if (!pending) {
			fail(t('auth.telegram.invalidRequest'));
			return;
		}

		void (async () => {
			try {
				const { data } = await telegramAuth({
					variables: {
						input: { code, redirectUri: getTelegramRedirectUri(), codeVerifier: pending.codeVerifier },
					},
				});
				const member = data?.telegramAuth;
				if (!member?.accessToken) throw new Error('TELEGRAM_AUTH_FAILED');
				setJwtToken(member.accessToken);
				updateUserInfo(member.accessToken);
				await router.replace(pending.redirectTarget);
			} catch (error) {
				fail(tError(getCallbackServerMessage(error), 'auth.telegram.failedRetry'));
			}
		})();
	}, [router, router.isReady, telegramAuth]);

	return (
		<>
			<Head>
				<title>{t('auth.telegram.metaTitle')}</title>
			</Head>
			<main className="auth-callback-status" aria-live="polite">
				<p>{message}</p>
				{failed && (
					<Link href="/account/login" className="auth-callback-back">
						{t('auth.telegram.backToSignIn')}
					</Link>
				)}
			</main>
		</>
	);
};

export default TelegramCallbackPage;
