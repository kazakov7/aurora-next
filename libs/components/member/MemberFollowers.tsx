import React, { useState } from 'react';
import FollowButton from "../common/FollowButton";
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { Follower } from '../../types/follow/follow';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useI18n } from '../../i18n';

interface MemberFollowersProps {
	member: Member;
	onFollowersCountChange?: (count: number) => void;
}

const MemberFollowers: React.FC<MemberFollowersProps> = ({ member, onFollowersCountChange }) => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const currentUser = useReactiveVar(userVar);

	const [page, setPage] = useState<number>(1);
	const [followStatusMap, setFollowStatusMap] = useState<Record<string, boolean>>({});

	/** APOLLO REQUESTS **/
	const [subscribeMutation] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation] = useMutation(UNSUBSCRIBE);

	const { data, loading, refetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: page,
				limit: 10,
				search: {
					followingId: member?._id || '',
				},
			},
		},
		skip: !member?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (resData) => {
			const totalCount = resData?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0;
			if (onFollowersCountChange) {
				onFollowersCountChange(totalCount);
			}
		},
	});

	const followersList: Follower[] = data?.getMemberFollowers?.list || [];
	const total: number = data?.getMemberFollowers?.metaCounter?.[0]?.total || 0;
	const totalPages = Math.ceil(total / 10) || 1;

	/** HANDLERS **/
	const handleToggleFollow = async (e: React.MouseEvent, targetId: string, currentFollowing: boolean) => {
		e.stopPropagation();
		if (!currentUser?._id) {
			sweetMixinErrorAlert(t('common.pleaseLogInFirst'));
			router.push('/account/login');
			return;
		}

		if (currentUser._id === targetId) {
			sweetMixinErrorAlert(t('common.cannotFollowYourself'));
			return;
		}

		try {
			if (currentFollowing) {
				await unsubscribeMutation({ variables: { input: targetId } });
				setFollowStatusMap((prev) => ({ ...prev, [targetId]: false }));
				sweetTopSmallSuccessAlert(t('member.unfollowed'), 700);
			} else {
				await subscribeMutation({ variables: { input: targetId } });
				setFollowStatusMap((prev) => ({ ...prev, [targetId]: true }));
				sweetTopSmallSuccessAlert(t('member.followed'), 700);
			}
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'common.actionFailed'));
		}
	};

	const memberName = member?.memberFullName || member?.memberNick || t('common.member');

	return (
		<div className="member-content-area">
			{/* Content Header & Search / Sort Filter */}
			<div className="follow-header-section">
				<div className="header-top">
					<div className="title-group">
						<h2>{t('common.followers')}</h2>
						<span className="count-badge">{t('member.accountsCount', { total })}</span>
					</div>
					<p className="subtitle">{t('member.followers.intro', { memberName })}</p>
				</div>
				
				{/* Search and Sort Filter Bar */}
				<div className="header-filters">
					<div className="search-box">
						<span className="material-symbols-outlined search-icon">search</span>
						<input
							type="text"
							placeholder={t('member.followers.searchPlaceholder', { memberName })}
						/>
					</div>
					<button className="sort-btn" type="button">
						<span className="sort-label">{t('common.sortBy')}</span>
						<span className="sort-value">{t('member.recentlyAdded')}</span>
						<span className="material-symbols-outlined">expand_more</span>
					</button>
				</div>
			</div>

			{loading && followersList.length === 0 ? (
				<p className="member-profile-state">{t('member.followers.loadingFollowers')}</p>
			) : followersList.length > 0 ? (
				<div className="member-follow-list-container">
					{followersList.map((follower) => {
						const fData = follower.followerData;
						if (!fData) return null;

						const isFollowing =
							followStatusMap[fData._id] !== undefined
								? followStatusMap[fData._id]
								: follower?.meFollowed?.[0]?.myFollowing || false;

						const isSelf = currentUser?._id === fData._id;

						return (
							<div
								key={follower._id}
								className="follow-list-row"
								onClick={() => router.push(`/member?memberId=${fData._id}`)}
							>
								<div className="row-left">
									<div className="avatar-box">
										<img
											src={getImageUrl(fData.memberImage, DEFAULT_USER_AVATAR)}
											alt={fData.memberFullName || fData.memberNick}
										/>
									</div>
									<div className="user-details">
										<div className="name-row">
											<h4>{fData.memberFullName || fData.memberNick}</h4>
											<span className="role-badge">{t('common.member')}</span>
										</div>
										<div className="meta-row">
											<span className="handle">@{fData.memberNick}</span>
											<span className="dot">·</span>
											<span className="location">
												<span className="material-symbols-outlined">pin_drop</span>
												{t('member.auroraExplorer')}
											</span>
										</div>
									</div>
								</div>

								<div className="row-right">
									{!isSelf && (
										<FollowButton
											isFollowing={isFollowing}
											onClick={(e) => handleToggleFollow(e, fData._id, isFollowing)}
											size="sm"
										/>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="articles-empty-card">
					<div className="empty-icon-box">
						<span className="material-symbols-outlined">group</span>
					</div>
					<h3>{t('member.followers.noFollowersYet')}</h3>
					<p>{t('member.followers.emptyText', { memberName })}</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="pagination-wrapper">
					<span className="pagination-info">
						{t('member.showingAccounts', { page: (page - 1) * 10 + 1, math: Math.min(page * 10, total), total })}
					</span>
					<div className="pagination-pills">
						<button
							type="button"
							className="nav-arrow-btn"
							aria-label={t('common.previousPage')}
							disabled={page === 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							<span className="material-symbols-outlined">chevron_left</span>
						</button>

						{Array.from({ length: totalPages }).map((_, i) => {
							const p = i + 1;
							return (
								<button
									key={p}
									type="button"
									className={`page-num-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							);
						})}

						<button
							type="button"
							className="nav-arrow-btn"
							aria-label={t('common.nextPage')}
							disabled={page === totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						>
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemberFollowers;
