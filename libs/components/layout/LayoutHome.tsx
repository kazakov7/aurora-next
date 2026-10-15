import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import MobileBottomNav from '../common/MobileBottomNav';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useAuthSession from '../../hooks/useAuthSession';
import { useI18n } from '../../i18n';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const { t } = useI18n();
		const authChecked = useAuthSession();

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>{t('meta.homeTitle')}</title>
						<meta name="title" content={t('meta.homeMetaTitle')} />
					</Head>
					<div id="mobile-wrap">
						<Top />
						<main id="main">
							<Component {...props} authChecked={authChecked} />
						</main>
						<Footer />
						<MobileBottomNav />
					</div>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>{t('meta.homeTitle')}</title>
						<meta name="title" content={t('meta.homeMetaTitle')} />
					</Head>
					<div id="pc-wrap">
						<Top />
						<main id="main">
							<Component {...props} authChecked={authChecked} />
						</main>
						<Footer />
					</div>
				</>
			);
		}
	};
};

export default withLayoutMain;
