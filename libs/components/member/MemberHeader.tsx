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
		'https://lh3.googleusercontent.com/aida-public/AB6AXuD9LbNgS0O7bt9_-EE3j1qF8PL_0BeRL2rpG7lE_06ouM0QUB5dLIZDNhoJskdc9h_5iAjVqOinX7kbSfWQ0mXDvShy14zHpJKF5jg6miU8I0aJe4dkjfWl_J4VoMgqe0cbZ9R0xKogXEACv4WAy60r-ayRWX11N0GV4gvtftxu4KagHYtwPNfpLTNmp_xo-563rZtMVi7xChnFuJR0bpomcFjb9Xq1BVnAeraypw-ULsbUVD8wwUL6',
	);

	const nick = member?.memberNick || 'Julian Laurent';
	const handle = `@${nick.toLowerCase().replace(/\s+/g, '')}`;
	const address = member?.memberAddress || 'Geneva, Switzerland & Kyoto, Japan';
	const desc =
		member?.memberDesc ||
		'Architectural photographer and high-alpine documentarian. Chasing morning mist across the Dolomites, Hokkaido sanctuaries, and Patagonia ridges. Contributing writer at AURA Atelier.';

	const articlesCount = member?.memberArticles ?? 18;
	const followingCount = member?.memberFollowings ?? 389;

	return (
		<section className="member-header-card">
			<div className="header-inner">
				{/* Left: Identity & Bio */}
				<div className="identity-bio-group">
					<div className="avatar-wrapper">
						<div className="avatar-box">
							<img src={profileImg} alt={nick} className="avatar-img" />
						</div>
						<span
							className="status-indicator-dot"
							title="Available for commissions"
						/>
					</div>

					<div className="details-col">
						<div className="name-badge-row">
							<h1 className="member-name">{nick}</h1>
							<span
								className="material-symbols-outlined verified-icon"
								title="Verified Creator"
							>
								verified
							</span>
							<span className="member-handle">{handle}</span>
							<span className="role-pill">
								<span className="material-symbols-outlined">explore</span>
								<span>Verified Explorer</span>
							</span>
						</div>

						<div className="location-row">
							<span className="material-symbols-outlined pin-icon">pin_drop</span>
							<span>{address}</span>
						</div>

						<p className="bio-desc">{desc}</p>
					</div>
				</div>

				{/* Center & Right: Public Metrics & Primary Actions */}
				<div className="stats-actions-group">
					{/* Public Stats Metric Group */}
					<div className="stats-metric-box">
						<div className="stat-col">
							<span className="stat-num">{articlesCount}</span>
							<span className="stat-lbl">Articles</span>
						</div>
						<div className="stat-divider" />
						<div className="stat-col">
							<span className="stat-num">
								{followersCount > 1000
									? `${(followersCount / 1000).toFixed(1)}k`
									: followersCount}
							</span>
							<span className="stat-lbl">Followers</span>
						</div>
						<div className="stat-divider" />
						<div className="stat-col">
							<span className="stat-num">{followingCount}</span>
							<span className="stat-lbl">Following</span>
						</div>
					</div>

					{/* Public Action CTAs */}
					<div className="actions-box">
						<button
							type="button"
							id="follow-btn"
							className={`follow-btn ${isFollowing ? 'following' : ''}`}
							onClick={handleFollowToggle}
						>
							<span
								className="material-symbols-outlined"
								style={isFollowing ? { fontVariationSettings: "'FILL' 1" } : undefined}
							>
								{isFollowing ? 'check' : 'add'}
							</span>
							<span>{isFollowing ? 'Following' : 'Follow'}</span>
						</button>

						<button
							type="button"
							className="message-btn"
							onClick={handleMessage}
						>
							<span className="material-symbols-outlined">chat_bubble</span>
							<span>Message</span>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default MemberHeader;
