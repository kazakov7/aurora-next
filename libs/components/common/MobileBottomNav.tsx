import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useI18n } from '../../i18n';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const MobileBottomNav = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useI18n();
	const user = useReactiveVar(userVar);

	if (device !== 'mobile') return null;

	const pathname = router.pathname;

	const navItems = [
		{
			key: 'home',
			href: '/',
			label: t('navigation.home'),
			icon: 'home',
			active: pathname === '/',
		},
		{
			key: 'hotels',
			href: '/property',
			label: t('navigation.hotels'),
			icon: 'hotel',
			active: pathname.startsWith('/property'),
		},
		{
			key: 'tours',
			href: '/tour',
			label: t('navigation.tours'),
			icon: 'explore',
			active: pathname.startsWith('/tour'),
		},
		{
			key: 'destinations',
			href: '/destination',
			label: t('navigation.destinations'),
			icon: 'map',
			active: pathname.startsWith('/destination'),
		},
		{
			key: 'profile',
			href: user?._id ? '/mypage' : '/account/join',
			label: user?._id ? t('navigation.profile') : t('auth.login'),
			icon: 'person',
			active: pathname.startsWith('/mypage') || pathname.startsWith('/account'),
		},
	];

	return (
		<nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
			<div className="mobile-bottom-nav-inner">
				{navItems.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						className={`mobile-bottom-nav-item ${item.active ? 'active' : ''}`}
					>
						<div className="icon-wrapper">
							<span className="material-symbols-outlined nav-icon">{item.icon}</span>
							{item.active && <span className="active-dot" />}
						</div>
						<span className="nav-label">{item.label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
};

export default MobileBottomNav;
