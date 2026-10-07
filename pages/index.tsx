import React from 'react';
import type { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import Hero from '../libs/components/homepage/Hero';
import TrendingDestinations from '../libs/components/homepage/TrendingDestinations';
import SpecialStays from '../libs/components/homepage/SpecialStays';
import Experiences from '../libs/components/homepage/Experiences';
import CommunityCurators from '../libs/components/homepage/CommunityCurators';
import TravelPartners from '../libs/components/homepage/TravelPartners';
import LiveDispatches from '../libs/components/homepage/LiveDispatches';

const Home: NextPage = () => {
	return (
		<div className="home-page-container">
			<Hero />
			<TrendingDestinations />
			<SpecialStays />
			<Experiences />
			<CommunityCurators />
			<TravelPartners />
			<LiveDispatches />
		</div>
	);
};

export default withLayoutMain(Home);
