import React, { useState } from 'react';
import FollowButton from "../common/FollowButton";
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { Following } from '../../types/follow/follow';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MemberFollowingProps {
	member: Member;
	onFollowingCountChange?: (count: number) => void;
}

const MemberFollowing: React.FC<MemberFollowingProps> = ({ member, onFollowingCountChange }) => {
	const router = useRouter();
	const currentUser = useReactiveVar(userVar);

	const [page, setPage] = useState<number>(1);
	const [followStatusMap, setFollowStatusMap] = useState<Record<string, boolean>>({});

	/** APOLLO REQUESTS **/
	const [subscribeMutation] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation] = useMutation(UNSUBSCRIBE);

	const { data, loading, refetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: page,
				limit: 10,
				search: {
					followerId: member?._id || '',
				},
			},
		},
		skip: !member?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (resData) => {
			const totalCount = resData?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0;
			if (onFollowingCountChange) {
				onFollowingCountChange(totalCount);
			}
		},
	});

	const followingsList: Following[] = data?.getMemberFollowings?.list || [];
	const total: number = data?.getMemberFollowings?.metaCounter?.[0]?.total || 0;
	const totalPages = Math.ceil(total / 10) || 1;

	/** HANDLERS **/
	const handleToggleFollow = async (e: React.MouseEvent, targetId: string, currentFollowing: boolean) => {
		e.stopPropagation();
		if (!currentUser?._id) {
			sweetMixinErrorAlert('Please log in first.');
			router.push('/account/login');
			return;
		}

		if (currentUser._id === targetId) {
			sweetMixinErrorAlert('You cannot follow yourself.');
			return;
		}

		try {
			if (currentFollowing) {
				await unsubscribeMutation({ variables: { input: targetId } });
				setFollowStatusMap((prev) => ({ ...prev, [targetId]: false }));
				sweetTopSmallSuccessAlert('Unfollowed.', 700);
			} else {
				await subscribeMutation({ variables: { input: targetId } });
				setFollowStatusMap((prev) => ({ ...prev, [targetId]: true }));
				sweetTopSmallSuccessAlert('Following!', 700);
			}
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err?.message || 'Action failed.');
		}
	};

	const memberName = member?.memberFullName || member?.memberNick || 'Member';

	return (
		<div className="member-content-area">
			{/* Content Header & Search / Sort Filter */}
			<div className="follow-header-section">
				<div className="header-top">
					<div className="title-group">
						<h2>Following</h2>
						<span className="count-badge">{total} accounts</span>
					</div>
					<p className="subtitle">Sanctuaries, expeditions, and creators {memberName} follows.</p>
				</div>
				
				{/* Search and Sort Filter Bar */}
				<div className="header-filters">
					<div className="search-box">
						<span className="material-symbols-outlined search-icon">search</span>
						<input
							type="text"
							placeholder={`Search accounts ${memberName} follows...`}
						/>
					</div>
					<button className="sort-btn" type="button">
						<span className="sort-label">Sort by:</span>
						<span className="sort-value">Recently Added</span>
						<span className="material-symbols-outlined">expand_more</span>
					</button>
				</div>
			</div>

			{loading && followingsList.length === 0 ? (
				<p className="member-profile-state">Loading followed members...</p>
			) : followingsList.length > 0 ? (
				<div className="member-follow-list-container">
					{followingsList.map((following) => {
						const fData = following.followingData;
						if (!fData) return null;

						const isFollowing =
							followStatusMap[fData._id] !== undefined
								? followStatusMap[fData._id]
								: following?.meFollowed?.[0]?.myFollowing || false;

						const isSelf = currentUser?._id === fData._id;

						return (
							<div
								key={following._id}
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
											{/* Placeholder for verified icon and role badge if applicable */}
											<span className="role-badge">Member</span>
										</div>
										<div className="meta-row">
											<span className="handle">@{fData.memberNick}</span>
											<span className="dot">·</span>
											<span className="location">
												<span className="material-symbols-outlined">pin_drop</span>
												AURA Explorer
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
						<span className="material-symbols-outlined">person_add</span>
					</div>
					<h3>Not following anyone yet</h3>
					<p>{memberName} is not following any public explorers yet.</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="pagination-wrapper">
					<span className="pagination-info">
						Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} accounts
					</span>
					<div className="pagination-pills">
						<button
							type="button"
							className="nav-arrow-btn"
							aria-label="Previous page"
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
							aria-label="Next page"
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

export default MemberFollowing;
