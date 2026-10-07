import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SignUp from '../../libs/components/account/SignUp';

const SignUpPage: NextPage = () => {
	const router = useRouter();

	return (
		<>
			<Head>
				<title>AURA Travel — Sign Up</title>
				<meta name="description" content="Create your AURA Travel luxury exploration account." />
			</Head>

			<div className="auth-page-container">
				<SignUp onSwitchToSignIn={() => router.push('/account/login')} />
			</div>
		</>
	);
};

export default withLayoutBasic(SignUpPage);
