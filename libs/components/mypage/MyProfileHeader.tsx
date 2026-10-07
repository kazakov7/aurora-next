import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';

interface MyProfileHeaderProps {
	onCategoryChange?: (category: string) => void;
}

const MyProfileHeader: React.FC<MyProfileHeaderProps> = ({ onCategoryChange }) => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const handleNav = (cat: string) => {
		if (onCategoryChange) {
			onCategoryChange(cat);
		} else {
			router.push({ pathname: '/mypage', query: { category: cat } }, undefined, { shallow: true });
		}
	};

	const profileImg = getImageUrl(
		user?.memberImage,
		'https://lh3.googleusercontent.com/aida-public/AB6AXuD4vyptABW0pmGW8x65jOnepXVgFEEFAOgdcLKjRIreFomCkEOtF3c66VayDXgtHxDj4RF2uoeOqJ4RMZp12I07W2cMR2UeiNknh2OBpFyqyDn4VJbjfx6z-Xjer2eqTKrAD_UUwcPsMvEiLhdyGuQPBvcXBOuOQf2Wl_o_w6RzLcAPj33G0Lmx6IEuU7LduOCbUgD8MaWC89aIaA8sMl36bxyq9Ti3mSRJMv5uW9UNP11m5Rs5UytG',
	);

	const userNick = user?.memberNick || 'Elena Rostova';
	const userAddress = user?.memberAddress || 'Valais, Switzerland';
	const userDesc =
		user?.memberDesc ||
		'Documenting high alpine routes, architectural retreats, and remote coastlines across 42 countries. Contributing editor for Alpine Dispatch.';

	return (
		<section className="profile-header-card">
			{/* Left: Explorer Bio & Avatar */}
			<div className="header-left-bio">
				<div className="avatar-wrapper">
					<img
						className="avatar-img"
						src={profileImg}
						alt={userNick}
					/>
					<span className="avatar-check-badge">
						<span className="material-symbols-outlined">check</span>
					</span>
				</div>
				<div className="bio-details">
					<div className="name-row">
						<h1>{userNick}</h1>
						<span className="verified-badge">
							<span className="material-symbols-outlined">verified</span>
							Verified Explorer
						</span>
					</div>
					<div className="meta-row">
						<span>@{userNick.toLowerCase().replace(/\s+/g, '')}</span>
						<span className="bullet-dot"></span>
						<span className="location-info">
							<span className="material-symbols-outlined">location_on</span>
							{userAddress}
						</span>
					</div>
					<p className="bio-text">{userDesc}</p>
				</div>
			</div>

			{/* Center: Statistics with Dividers */}
			<div className="header-center-stats">
				<button
					type="button"
					className="stat-item"
					onClick={() => handleNav('articles')}
				>
					<span className="stat-number">{(user as any)?.memberArticles ?? 24}</span>
					<span className="stat-label">Articles</span>
				</button>
				<div className="stat-divider"></div>
				<button
					type="button"
					className="stat-item"
					onClick={() => handleNav('followers')}
				>
					<span className="stat-number">
						{(user as any)?.memberFollowers ? `${(user as any).memberFollowers}` : '8.4k'}
					</span>
					<span className="stat-label">Followers</span>
				</button>
				<div className="stat-divider"></div>
				<button
					type="button"
					className="stat-item"
					onClick={() => handleNav('following')}
				>
					<span className="stat-number">
						{(user as any)?.memberFollowings ? `${(user as any).memberFollowings}` : '412'}
					</span>
					<span className="stat-label">Following</span>
				</button>
			</div>

			{/* Right: Actions */}
			<div className="header-right-actions">
				<button
					type="button"
					className="edit-profile-btn"
					onClick={() => handleNav('settings')}
				>
					<span className="material-symbols-outlined">edit</span>
					<span>Edit Profile</span>
				</button>
				<button
					type="button"
					className="settings-icon-btn"
					aria-label="Account Settings"
					onClick={() => handleNav('settings')}
				>
					<span className="material-symbols-outlined">settings</span>
				</button>
			</div>
		</section>
	);
};

export default MyProfileHeader;
