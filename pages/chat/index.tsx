import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ChatMessenger from '../../libs/components/chat/ChatMessenger';

const ChatPage: NextPage = () => {
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
