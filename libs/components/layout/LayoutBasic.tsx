import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useAuthSession from '../../hooks/useAuthSession';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		useAuthSession();

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>AURA Hotels &amp; Sanctuaries</title>
						<meta name="title" content="AURA Hotels" />
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
						<title>AURA Hotels &amp; Sanctuaries</title>
						<meta name="title" content="AURA Hotels" />
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
