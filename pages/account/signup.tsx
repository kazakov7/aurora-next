import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SignUp from '../../libs/components/account/SignUp';
import { useI18n } from '../../libs/i18n';

const SignUpPage: NextPage = () => {
	const { t } = useI18n();
	const router = useRouter();

	return (
		<>
			<Head>
				<title>{t('auth.meta.signUpTitle')}</title>
				<meta name="description" content={t('auth.meta.signUpDescription')} />
			</Head>

			<div className="auth-page-container">
				<SignUp onSwitchToSignIn={() => router.push('/account/login')} />
			</div>
		</>
	);
};

export default withLayoutBasic(SignUpPage);
