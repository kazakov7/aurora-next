import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SignIn from '../../libs/components/account/SignIn';
import { useI18n } from '../../libs/i18n';

const LoginPage: NextPage = () => {
	const { t } = useI18n();
	const router = useRouter();

	return (
		<>
			<Head>
				<title>{t('auth.meta.signInTitle')}</title>
				<meta name="description" content={t('auth.meta.signInDescription')} />
			</Head>

			<div className="auth-page-container">
				<SignIn onSwitchToSignUp={() => router.push('/account/signup')} />
			</div>
		</>
	);
};

export default withLayoutBasic(LoginPage);
