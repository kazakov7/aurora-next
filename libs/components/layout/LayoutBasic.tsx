import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useAuthSession from '../../hooks/useAuthSession';
import { useI18n } from '../../i18n';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const { t } = useI18n();
		useAuthSession();

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>{t('meta.defaultTitle')}</title>
						<meta name="title" content={t('meta.defaultMetaTitle')} />
					</Head>
					<div id="mobile-wrap">
						<Top />
						<main id="main">
							<Component {...props} />
						</main>
						<Footer />
					</div>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>{t('meta.defaultTitle')}</title>
						<meta name="title" content={t('meta.defaultMetaTitle')} />
					</Head>
					<div id="pc-wrap">
						<Top />
						<main id="main">
							<Component {...props} />
						</main>
						<Footer />
					</div>
				</>
			);
		}
	};
};

export default withLayoutBasic;
