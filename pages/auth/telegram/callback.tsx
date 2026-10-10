import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApolloError, useMutation } from '@apollo/client';
import { TELEGRAM_AUTH } from '../../../apollo/user/mutation';
import { setJwtToken, updateUserInfo } from '../../../libs/auth';
import { consumeTelegramAuthorizationState, getTelegramRedirectUri } from '../../../libs/auth/social';

/** Backend Messages that are safe and useful to show as-is **/
const TELEGRAM_USER_MESSAGES = [
	'Telegram authentication is not configured!',
	'Telegram authorization code, redirect URI, or PKCE verifier is invalid or expired.',
	'Telegram authentication is temporarily unavailable. Please try again.',
	'Telegram authentication failed. Please try again.',
];

const getCallbackErrorMessage = (error: unknown): string => {
	const message = error instanceof ApolloError ? error.graphQLErrors?.[0]?.message : '';
	if (message && TELEGRAM_USER_MESSAGES.includes(message)) return message;
	return 'Telegram sign-in could not be completed. Please return and try again.';
};

const TelegramCallbackPage: NextPage = () => {
	const router = useRouter();
	const [message, setMessage] = useState('Completing Telegram sign-in…');
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
			fail(providerError === 'access_denied' ? 'Telegram sign-in was cancelled.' : 'Telegram sign-in could not be completed.');
			return;
		}
		if (!pending) {
			fail('This Telegram sign-in request is invalid or has expired. Please start again.');
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
				fail(getCallbackErrorMessage(error));
			}
		})();
	}, [router, router.isReady, telegramAuth]);

	return (
		<>
			<Head>
				<title>Telegram sign-in — AURORA</title>
			</Head>
			<main className="auth-callback-status" aria-live="polite">
				<p>{message}</p>
				{failed && (
					<Link href="/account/login" className="auth-callback-back">
						Back to sign in
					</Link>
				)}
			</main>
		</>
	);
};

export default TelegramCallbackPage;
