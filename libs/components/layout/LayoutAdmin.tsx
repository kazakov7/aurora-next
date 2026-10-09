import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import Link from 'next/link';
import { DEFAULT_USER_AVATAR, REACT_APP_API_URL } from '../../config';

const withAdminLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const activePath = router.pathname.replace('/_admin/', '');

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			if (user && user.memberType !== 'ADMIN') {
				router.push('/');
			}
		}, [user, router]);

		if (!user || user.memberType !== 'ADMIN') {
			return null;
		}

		return (
			<>
				<Head>
					<title>AURA Administration</title>
				</Head>
				<div id="admin-wrap">
					{/* Fixed Sidebar */}
					<aside className="admin-sidebar">
						<div className="sidebar-top">
							<div className="brand-box">
								<img 
									className="brand-logo" 
									src="https://lh3.googleusercontent.com/aida/AEtjO1W1K6QgRnqnCBSOsQgGSQ0AHWLruC8qQguSGrysm_yUEtf5MJk1szkz_z7-xdbLSqiqxG2AcI145Y5ksnIyFyG4pF-klY8_cEHuNRi3HPAV7P5qJW1xWmI4UV8ZW8Qulvx0oeENCrkTZXYcAtyRsptPbm5fLDBEL6Xjie4nFcL1bPm9olgp1HgABejrPBn-1-PP_7UbJqqhnVgEzIZ8wAIuvqCRvVeUCPgv2RV_ZQmON2Ze5ZAFWYwnsQE" 
									alt="AURA" 
								/>
								<div className="brand-text-box">
									<span className="brand-title">AURA</span>
									<span className="brand-subtitle">Admin</span>
								</div>
							</div>
							
							<nav className="sidebar-nav">
								<div className="nav-group">
									<span className="group-label">General</span>
									<Link href="/_admin" className={`nav-item ${router.pathname === '/_admin' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">grid_view</span>
										<span>Overview</span>
									</Link>
								</div>
								
								<div className="nav-group">
									<span className="group-label">Management</span>
									<Link href="/_admin/users" className={`nav-item ${activePath === 'users' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">group</span>
										<span>Members</span>
									</Link>
									<Link href="/_admin/agent-verification" className={`nav-item ${activePath === 'agent-verification' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">verified_user</span>
										<span>Agent Verification</span>
									</Link>
									<Link href="/_admin/properties" className={`nav-item ${activePath === 'properties' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">hotel</span>
										<span>Hotels</span>
									</Link>
									<Link href="/_admin/tours" className={`nav-item ${activePath === 'tours' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">explore</span>
										<span>Tours</span>
									</Link>
									<Link href="/_admin/destinations" className={`nav-item ${activePath === 'destinations' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">map</span>
										<span>Destinations</span>
									</Link>
									<Link href="/_admin/bookings" className={`nav-item ${activePath === 'bookings' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">calendar_month</span>
										<span>Bookings</span>
									</Link>
								</div>
								
								<div className="nav-group">
									<span className="group-label">Content</span>
									<Link href="/_admin/community" className={`nav-item ${activePath === 'community' ? 'active' : ''}`}>
										<span className="material-symbols-outlined">forum</span>
										<span>Community</span>
									</Link>
									<Link href="/_admin/cs" className={`nav-item ${activePath.startsWith('cs') ? 'active' : ''}`}>
										<span className="material-symbols-outlined">campaign</span>
										<span>Notices</span>
									</Link>
								</div>
								
							</nav>
						</div>

					</aside>

					<div className="admin-content-wrapper">
						{/* Fixed Header */}
						<header className="admin-header">
							<div className="header-left">
								<div className="breadcrumb">
									<span className="material-symbols-outlined">home</span>
									<span>/</span>
									<span className="current-page">Administration Portal</span>
								</div>
							</div>
							
							<div className="header-right">
								<div className="user-profile">
									<div className="user-info">
										<span className="user-name">{user.memberNick}</span>
										<span className="user-role">{user.memberType}</span>
									</div>
									<img 
										className="user-avatar" 
										src={user.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : DEFAULT_USER_AVATAR} 
										alt="Profile" 
									/>
								</div>
							</div>
						</header>

						{/* Main View */}
						<main className="admin-main">
							<Component {...props} />
						</main>
					</div>
				</div>
			</>
		);
	};
};

export default withAdminLayout;
