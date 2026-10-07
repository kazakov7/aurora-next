import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyProfileHeader from '../../libs/components/mypage/MyProfileHeader';
import MyProfileSidebar from '../../libs/components/mypage/MyProfileSidebar';
import MyProfileArticles from '../../libs/components/mypage/MyProfileArticles';
import MyProfileFollowers from '../../libs/components/mypage/MyProfileFollowers';
import MyProfileFollowing from '../../libs/components/mypage/MyProfileFollowing';
import MyProfileWishlist from '../../libs/components/mypage/MyProfileWishlist';
import MyProfileBookings from '../../libs/components/mypage/MyProfileBookings';
import MyProfileHistory from '../../libs/components/mypage/MyProfileHistory';
import MyProfileNotifications from '../../libs/components/mypage/MyProfileNotifications';
import MyProfileSettings from '../../libs/components/mypage/MyProfileSettings';

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const category = (router.query?.category as string) || 'articles';

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.isReady && !user._id) {
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) {
				router.push('/account/join').then();
			}
		}
	}, [router.isReady, user._id]);

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
				return 'My Articles — AURA Profile';
			case 'followers':
				return 'Followers — AURA Profile';
			case 'following':
				return 'Following — AURA Profile';
			case 'wishlist':
				return 'My Wishlist — AURA Profile';
			case 'bookings':
				return 'My Bookings — AURA Profile';
			case 'history':
				return 'Travel History — AURA Profile';
			case 'notifications':
				return 'Notifications — AURA Profile';
			case 'settings':
				return 'Settings — AURA Profile';
			default:
				return 'My Profile — AURA Travel';
		}
	};

	return (
		<>
			<Head>
				<title>{getPageTitle()}</title>
				<meta name="description" content="Manage your AURA Travel profile, bookings, articles, and wishlist." />
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
							{category === 'articles' && <MyProfileArticles />}
							{category === 'followers' && <MyProfileFollowers />}
							{category === 'following' && <MyProfileFollowing />}
							{category === 'wishlist' && <MyProfileWishlist />}
							{category === 'bookings' && <MyProfileBookings />}
							{category === 'history' && <MyProfileHistory />}
							{category === 'notifications' && <MyProfileNotifications />}
							{category === 'settings' && <MyProfileSettings />}
						</main>
					</div>
				</div>
			</div>
		</>
	);
};

export default withLayoutBasic(MyPage);
