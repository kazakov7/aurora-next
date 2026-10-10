import React, { useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ChatMessenger from '../../libs/components/chat/ChatMessenger';
import { getJwtToken } from '../../libs/auth';
import { sweetLoginRequiredAlert } from '../../libs/sweetAlert';
import { useI18n } from '../../libs/i18n';

const ChatPage: NextPage = () => {
	const { t } = useI18n();
	const router = useRouter();

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady || getJwtToken()) return;
		void (async () => {
			await sweetLoginRequiredAlert(t('chat.page.loginRequired'));
			await router.push({ pathname: '/account/login', query: { referrer: router.asPath } });
		})();
	}, [router.isReady]);

	return (
		<>
			<Head>
				<title>{t('chat.page.metaTitle')}</title>
				<meta
					name="description"
					content={t('chat.page.metaDescription')}
				/>
			</Head>

			<div id="chat-page">
				<ChatMessenger />
			</div>
		</>
	);
};

export default withLayoutBasic(ChatPage);
