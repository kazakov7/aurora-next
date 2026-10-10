import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import MyProfileHeader from '../../libs/components/mypage/MyProfileHeader';
import MyProfileSidebar from '../../libs/components/mypage/MyProfileSidebar';
import MyProfileArticles from '../../libs/components/mypage/MyProfileArticles';
import MyProfileFollowers from '../../libs/components/mypage/MyProfileFollowers';
import MyProfileFollowing from '../../libs/components/mypage/MyProfileFollowing';
import MyProfileWishlist from '../../libs/components/mypage/MyProfileWishlist';
import MyProfileBookings from '../../libs/components/mypage/MyProfileBookings';
import MyProfileVisitedTours from "../../libs/components/mypage/MyProfileVisitedTours";
import MyProfileHistory from '../../libs/components/mypage/MyProfileHistory';
import MyProfileNotifications from '../../libs/components/mypage/MyProfileNotifications';
import MyProfileSettings from '../../libs/components/mypage/MyProfileSettings';
import AgentApplicationPage from '../../libs/components/mypage/AgentApplicationPage';
import MyHotels from '../../libs/components/mypage/agent/MyHotels';
import MyTours from '../../libs/components/mypage/agent/MyTours';
import Reservations from '../../libs/components/mypage/agent/Reservations';
import { useI18n } from '../../libs/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { appleEase } from '../../libs/motion/transitions';

const MyPage: NextPage = () => {
	const { t } = useI18n();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const allowedCategories = ['articles', 'followers', 'following', 'wishlist', 'bookings', 'history', 'visitedTours', 'notifications', 'settings', 'partner', 'myHotels', 'myTours', 'reservations'];
	const requestedCategory = (router.query?.category as string) || 'articles';
	const category = allowedCategories.includes(requestedCategory) ? requestedCategory : 'articles';

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.isReady && !user._id) {
			if (!getJwtToken()) {
				router.replace('/account/login').then();
			}
		}
	}, [router.isReady, user._id]);

	useEffect(() => {
		if (router.isReady && requestedCategory !== category) {
			router.replace({ pathname: '/mypage', query: { category } }, undefined, { shallow: true });
		}
	}, [category, requestedCategory, router]);

	const handleCategoryChange = (newCategory: string) => {
		router.push(
			{
				pathname: '/mypage',
				query: { category: newCategory },
			},
			undefined,
			{ shallow: true, scroll: false },
		);
	};

	const getPageTitle = () => {
		switch (category) {
			case 'articles':
				return t('profile.page.titleArticles');
			case 'followers':
				return t('profile.page.titleFollowers');
			case 'following':
				return t('profile.page.titleFollowing');
			case 'wishlist':
				return t('profile.page.titleWishlist');
			case 'bookings':
				return t('profile.page.titleBookings');
			case 'history':
				return t('profile.page.titleHistory');
			case 'notifications':
				return t('profile.page.titleNotifications');
			case 'settings':
				return t('profile.page.titleSettings');
			case 'partner':
				return t('profile.page.titlePartner');
			case 'myHotels':
				return t('profile.page.titleMyHotels');
			case 'myTours':
				return t('profile.page.titleMyTours');
			case 'reservations':
				return t('profile.page.titleReservations');
			default:
				return t('profile.page.titleDefault');
		}
	};

	return (
		<>
			<Head>
				<title>{getPageTitle()}</title>
				<meta name="description" content={t('profile.page.metaDescription')} />
			</Head>

			<div id="my-profile-page">
				<div className="my-profile-container">
					{/* 1. TOP PROFILE HEADER */}
					<MyProfileHeader onCategoryChange={handleCategoryChange} />

					{/* 2. MAIN TWO-COLUMN LAYOUT */}
					<div className="profile-main-layout">
						{/* Permanent Left Sidebar */}
						<MyProfileSidebar
							activeCategory={category}
							onCategoryChange={handleCategoryChange}
						/>

						{/* Dynamic Content Area */}
						<main className="profile-content-area">
							<AnimatePresence mode="wait">
								<motion.div
									key={category}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									transition={{ duration: 0.22, ease: appleEase }}
								>
									{category === 'articles' && <MyProfileArticles />}
									{category === 'followers' && <MyProfileFollowers />}
									{category === 'following' && <MyProfileFollowing />}
									{category === 'wishlist' && <MyProfileWishlist />}
									{category === 'bookings' && <MyProfileBookings />}
									{category === "history" && <MyProfileHistory />}
									{category === "visitedTours" && <MyProfileVisitedTours />}
									{category === 'notifications' && <MyProfileNotifications />}
									{category === 'settings' && <MyProfileSettings />}
									{category === 'partner' && <AgentApplicationPage />}
									{category === 'myHotels' && <MyHotels />}
									{category === 'myTours' && <MyTours />}
									{category === 'reservations' && <Reservations />}
								</motion.div>
							</AnimatePresence>
						</main>
					</div>
				</div>
			</div>
		</>
	);
};

export default withLayoutBasic(MyPage);
