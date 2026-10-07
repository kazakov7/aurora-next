import React, { useEffect } from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';

const withLayoutMain = (Component: any) => {
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
						<title>AURA Travel — Go Somewhere Extraordinary</title>
						<meta name="title" content="AURA Travel" />
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
						<title>AURA Travel — Go Somewhere Extraordinary</title>
						<meta name="title" content="AURA Travel" />
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

export default withLayoutMain;
