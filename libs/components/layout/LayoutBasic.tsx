import React, { useEffect } from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

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
