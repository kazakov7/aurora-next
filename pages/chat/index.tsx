import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ChatMessenger from '../../libs/components/chat/ChatMessenger';

const ChatPage: NextPage = () => {
	return (
		<>
			<Head>
				<title>Concierge Chat — AURA Travel Marketplace</title>
				<meta
					name="description"
					content="Direct encrypted concierge and traveler communications across AURA sanctuaries and partners."
				/>
			</Head>

			<div id="chat-page">
				<ChatMessenger />
			</div>
		</>
	);
};

export default withLayoutBasic(ChatPage);
