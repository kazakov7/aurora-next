import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SignIn from '../../libs/components/account/SignIn';
import SignUp from '../../libs/components/account/SignUp';

const JoinPage: NextPage = () => {
	const router = useRouter();
	const [activeView, setActiveView] = useState<'signin' | 'signup'>('signin');

	useEffect(() => {
		if (router.isReady) {
			const viewQuery = router.query.view;
			if (viewQuery === 'signup') {
				setActiveView('signup');
			} else if (viewQuery === 'signin') {
				setActiveView('signin');
			}
		}
	}, [router.isReady, router.query.view]);

	const switchToSignUp = () => {
		setActiveView('signup');
		router.push({ pathname: '/account/join', query: { ...router.query, view: 'signup' } }, undefined, {
			shallow: true,
			scroll: false,
		});
	};

	const switchToSignIn = () => {
		setActiveView('signin');
		router.push({ pathname: '/account/join', query: { ...router.query, view: 'signin' } }, undefined, {
			shallow: true,
			scroll: false,
		});
	};

	return (
		<>
			<Head>
				<title>
					{activeView === 'signin'
						? 'AURA Travel — Sign In'
						: 'AURA Travel — Sign Up'}
				</title>
				<meta
					name="description"
					content="Sign in or register for your AURA Travel luxury exploration account."
				/>
			</Head>

			<div className="auth-page-container">
				{activeView === 'signin' ? (
					<SignIn onSwitchToSignUp={switchToSignUp} />
				) : (
					<SignUp onSwitchToSignIn={switchToSignIn} />
				)}
			</div>
		</>
	);
};

export default withLayoutBasic(JoinPage);
