import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import FollowButton from '../common/FollowButton';
import { useI18n } from '../../i18n';

interface MemberHeaderProps {
	member: Member;
	isFollowing: boolean;
	followersCount: number;
	articlesCount: number;
	onFollowChange: (newStatus: boolean) => void;
}

const MemberHeader: React.FC<MemberHeaderProps> = ({
	member,
	isFollowing,
	followersCount,
	articlesCount,
	onFollowChange,
}) => {
	const { t, tError, formatNumber } = useI18n();
	const router = useRouter();
	const currentUser = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [subscribeMutation, { loading: subscribing }] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);

	const targetId = member?._id;
	const isOwnProfile = currentUser?._id === targetId;

	const formatCount = (count: number) => {
		return formatNumber(count || 0, { notation: 'compact', maximumFractionDigits: 1 });
	};

	/** HANDLERS **/
	const handleFollowToggle = async () => {
		if (!currentUser?._id) {
			sweetMixinErrorAlert(t('member.header.loginToFollow'));
			router.push('/account/login');
			return;
		}

		if (isOwnProfile) {
			sweetMixinErrorAlert(t('common.cannotFollowYourself'));
			return;
		}

		try {
			if (isFollowing) {
				await unsubscribeMutation({
					variables: { input: targetId },
					refetchQueries: ['GetMemberFollowers', 'GetMemberFollowings', 'GetMember'],
				});
				onFollowChange(false);
			} else {
				await subscribeMutation({
					variables: { input: targetId },
					refetchQueries: ['GetMemberFollowers', 'GetMemberFollowings', 'GetMember'],
				});
				onFollowChange(true);
			}
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'common.actionFailed'));
		}
	};

	const handleMessageClick = async () => {
		if (!currentUser?._id) {
			sweetMixinErrorAlert(t('member.header.loginToMessage'));
			router.push('/account/login');
			return;
		}

		if (isOwnProfile) {
			sweetMixinErrorAlert(t('member.header.cannotMessageYourself'));
			return;
		}

		if (!targetId) return;
		void router.push(`/chat?memberId=${targetId}`);
	};

	return (
		<section className="member-header-card">
			<div className="header-content-wrapper">
				{/* Left: Identity & Bio */}
				<div className="header-left-bio">
					<div className="avatar-wrapper">
						<div className="avatar-circle">
							<img
								className="avatar-img"
								src={getImageUrl(member?.memberImage, DEFAULT_USER_AVATAR)}
								alt={member?.memberFullName || member?.memberNick || t('common.member')}
							/>
						</div>
						<span className="online-dot" title={t('member.header.availableExplorer')}></span>
					</div>

					<div className="bio-details">
						<div className="name-row">
							<h1>{member?.memberFullName || member?.memberNick}</h1>
							<span
								className="material-symbols-outlined verified-icon"
								title={t('member.header.verifiedCreator')}
							>
								verified
							</span>
							<span className="member-handle">@{member?.memberNick}</span>
							<span className="explorer-badge">
								<span className="material-symbols-outlined">explore</span>
								<span>{t('member.header.verifiedExplorer')}</span>
							</span>
						</div>

						<div className="location-row">
							<span className="material-symbols-outlined">pin_drop</span>
							<span>{member?.memberAddress || t('common.locationNotProvided')}</span>
						</div>

						<p className="bio-text">
							{member?.memberDesc || t('member.header.noBio')}
						</p>
					</div>
				</div>

				{/* Center & Right: Public Metrics & Primary Actions */}
				<div className="header-right-section">
					<div className="key-metrics">
						<div className="metric-item">
							<span className="metric-number">{articlesCount}</span>
							<span className="metric-label">{t('common.articles')}</span>
						</div>
						<div className="metric-divider"></div>
						<div className="metric-item">
							<span className="metric-number">{formatCount(followersCount)}</span>
							<span className="metric-label">{t('common.followers')}</span>
						</div>
						<div className="metric-divider"></div>
						<div className="metric-item">
							<span className="metric-number">{formatCount(member?.memberFollowings || 0)}</span>
							<span className="metric-label">{t('common.followButton.following')}</span>
						</div>
					</div>

					{!isOwnProfile && (
						<div className="action-buttons">
							<FollowButton
								isFollowing={isFollowing}
								isLoading={subscribing || unsubscribing}
								onClick={handleFollowToggle}
							/>
							<button
								type="button"
								className="btn-message"
								onClick={handleMessageClick}
							>
								<span className="material-symbols-outlined">chat_bubble</span>
								<span>{t('common.message')}</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default MemberHeader;
