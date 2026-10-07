import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SignIn from '../../libs/components/account/SignIn';

const LoginPage: NextPage = () => {
	const router = useRouter();

	return (
		<>
			<Head>
				<title>AURA Travel — Sign In</title>
				<meta name="description" content="Sign in to your AURA Travel account." />
			</Head>

			<div className="auth-page-container">
				<SignIn onSwitchToSignUp={() => router.push('/account/signup')} />
			</div>
		</>
	);
};

export default withLayoutBasic(LoginPage);
