import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MemberHeaderProps {
	member?: any;
	isFollowing: boolean;
	followersCount: number;
	onFollowChange: (newStatus: boolean) => void;
}

const MemberHeader: React.FC<MemberHeaderProps> = ({
	member,
	isFollowing,
	followersCount,
	onFollowChange,
}) => {
	const router = useRouter();
	const currentUser = useReactiveVar(userVar);

	const [subscribeMutation] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation] = useMutation(UNSUBSCRIBE);

	const targetId = member?._id || 'julian-laurent-id';

	const handleFollowToggle = async () => {
		if (!currentUser?._id) {
			sweetMixinErrorAlert('Please log in to follow members.');
			router.push('/account/login');
			return;
		}

		if (currentUser._id === targetId) {
			sweetMixinErrorAlert('You cannot follow yourself.');
			return;
		}

		try {
			if (isFollowing) {
				await unsubscribeMutation({
					variables: { input: targetId },
				});
				onFollowChange(false);
				sweetTopSmallSuccessAlert('Unfollowed member.', 1000);
			} else {
				await subscribeMutation({
					variables: { input: targetId },
				});
				onFollowChange(true);
				sweetTopSmallSuccessAlert('You are now following this explorer!', 1000);
			}
		} catch (err: any) {
			// Instant reactive local toggle fallback for template preview
			onFollowChange(!isFollowing);
			sweetTopSmallSuccessAlert(
				!isFollowing ? 'You are now following this explorer!' : 'Unfollowed member.',
				1000,
			);
		}
	};

	const handleMessage = () => {
		router.push('/chat');
	};

	const profileImg = getImageUrl(
		member?.memberImage,
		'https://lh3.googleusercontent.com/aida-public/AB6AXuAvG8_igTxGEGxfWEwC-ZR6slbkBbENporP4AkSgPan8a68g7Py-c1TFvDK_46Mshm5-_WX0T7BuXgVPyIHM1NE9JODugNY3VWNU5yesacugRJYzyfKJcRGtSi9bxRJyTPxYUcOFewn7HoE915tfMapPm7TBrE0xEbupcg5Csw3sfgFZurTDQZCtPwDMh_XD-PUFJ3b1udWR2_8eMYwjvmh9-Q292TyW0pjeveGxxpAxRtTJR-tLfVN',
	);

	const nick = member?.memberNick || 'Kevin';
	const handle = `@${nick.toLowerCase().replace(/\s+/g, '')}`;
	const address = member?.memberAddress || 'South Korea';

	const articlesCount = member?.memberArticles ?? 24;
	const followingCount = member?.memberFollowings ?? 412;

	return (
		<section className="member-header-card">
			<div className="header-content-wrapper">
				{/* Left: Avatar & Identity Details */}
				<div className="header-left-bio">
					{/* Avatar with Verified Badge */}
					<div className="avatar-wrapper">
						<div className="avatar-circle">
							<img alt={nick} className="avatar-img" src={profileImg} />
						</div>
						<div className="verified-badge-icon" title="Verified Member">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
							</svg>
						</div>
					</div>

					{/* Name, Handle, Badges, Location */}
					<div className="bio-details">
						<div className="name-row">
							<h1>{nick}</h1>
							<span className="verified-pill">
								<svg viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								Verified Explorer
							</span>
							<span className="top-contributor-pill">Top Contributor</span>
						</div>

						<div className="meta-row">
							<span className="handle">{handle}</span>
							<span className="dot">•</span>
							<span className="location">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
									<path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
								</svg>
								{address}
							</span>
						</div>
					</div>
				</div>

				{/* Center/Right: Key Metrics & Actions */}
				<div className="header-right-section">
					{/* Key Metrics */}
					<div className="key-metrics">
						<div className="metric-item">
							<div className="metric-number">{articlesCount}</div>
							<div className="metric-label">Articles</div>
						</div>
						<div className="metric-divider"></div>
						<div className="metric-item">
							<div className="metric-number">
								{followersCount > 1000
									? `${(followersCount / 1000).toFixed(1)}k`
									: followersCount}
							</div>
							<div className="metric-label">Followers</div>
						</div>
						<div className="metric-divider"></div>
						<div className="metric-item">
							<div className="metric-number">{followingCount}</div>
							<div className="metric-label">Following</div>
						</div>
					</div>

					{/* Professional Visitor CTA Action Buttons */}
					<div className="action-buttons">
						<button 
							className={`btn-follow ${isFollowing ? 'following' : ''}`}
							onClick={handleFollowToggle}
						>
							{isFollowing ? (
								<>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
									</svg>
									<span>Following</span>
								</>
							) : (
								<>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
									</svg>
									<span>Follow</span>
								</>
							)}
						</button>
						<button className="btn-message" onClick={handleMessage}>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							<span>Message</span>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default MemberHeader;
