import React, { useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ChatMessenger from '../../libs/components/chat/ChatMessenger';
import { getJwtToken } from '../../libs/auth';
import { sweetLoginRequiredAlert } from '../../libs/sweetAlert';

const ChatPage: NextPage = () => {
	const router = useRouter();

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady || getJwtToken()) return;
		void (async () => {
			await sweetLoginRequiredAlert('Please log in first to access messages.');
			await router.push({ pathname: '/account/login', query: { referrer: router.asPath } });
		})();
	}, [router.isReady]);

	return (
		<>
			<Head>
				<title>Messages — AURORA Travel Marketplace</title>
				<meta
					name="description"
					content="Real-time community and direct messages for authenticated AURORA members."
				/>
			</Head>

			<div id="chat-page">
				<ChatMessenger />
			</div>
		</>
	);
};

export default withLayoutBasic(ChatPage);
