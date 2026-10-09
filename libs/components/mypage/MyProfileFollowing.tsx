import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Following } from '../../types/follow/follow';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import FollowButton from '../common/FollowButton';

const MyProfileFollowing: React.FC = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [sortOrder, setSortOrder] = useState<'recent' | 'name'>('recent');
	// Map to track local toggle overrides: targetId -> isFollowing
	const [followStatusMap, setFollowStatusMap] = useState<Record<string, boolean>>({});

	/** APOLLO REQUESTS **/
	const [subscribeMutation] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation] = useMutation(UNSUBSCRIBE);

	const { data, loading, error, refetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 50,
				search: {
					followerId: user?._id || '',
				},
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const followingsList: Following[] = data?.getMemberFollowings?.list || [];
	const total = data?.getMemberFollowings?.metaCounter?.[0]?.total ?? followingsList.length;

	/** HANDLERS **/
	const handleToggleFollow = async (targetId: string, targetNick: string, currentlyFollowing: boolean) => {
		if (!user?._id) {
			sweetMixinErrorAlert('Please log in first.');
			return;
		}

		try {
			if (currentlyFollowing) {
				setFollowStatusMap((prev) => ({ ...prev, [targetId]: false }));
				await unsubscribeMutation({ variables: { input: targetId }, refetchQueries: ['GetMember'] });
			} else {
				setFollowStatusMap((prev) => ({ ...prev, [targetId]: true }));
				await subscribeMutation({ variables: { input: targetId }, refetchQueries: ['GetMember'] });
			}
			await refetch();
		} catch (err: any) {
			// Rollback state on error
			setFollowStatusMap((prev) => ({ ...prev, [targetId]: currentlyFollowing }));
			sweetMixinErrorAlert(err.message || 'Operation failed.');
		}
	};

	// Filter & Sort
	const processedList = [...followingsList]
		.filter((item: Following) => {
			const target = item?.followingData;
			const nick = (target?.memberNick || '').toLowerCase();
			const fullName = (target?.memberFullName || '').toLowerCase();
			const q = searchTerm.trim().toLowerCase();
			if (!q) return true;
			return nick.includes(q) || fullName.includes(q);
		})
		.sort((a: Following, b: Following) => {
			if (sortOrder === 'name') {
				const nameA = (a?.followingData?.memberNick || '').toLowerCase();
				const nameB = (b?.followingData?.memberNick || '').toLowerCase();
				return nameA.localeCompare(nameB);
			}
			// Recent (createdAt DESC)
			const dateA = new Date(a.createdAt || 0).getTime();
			const dateB = new Date(b.createdAt || 0).getTime();
			return dateB - dateA;
		});

	return (
		<div>
			{/* Top Control Bar */}
			<div className="section-top-bar">
				<div className="title-group">
					<h2>Following</h2>
					<span className="counter-pill">{total} following</span>
				</div>
				<div className="bar-actions">
					<div className="search-box">
						<span className="material-symbols-outlined">search</span>
						<input
							type="text"
							placeholder="Search following..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="custom-select-box">
						<select
							value={sortOrder}
							onChange={(e) => setSortOrder(e.target.value as 'recent' | 'name')}
						>
							<option value="recent">Recently Followed</option>
							<option value="name">Name A–Z</option>
						</select>
						<span className="material-symbols-outlined">expand_more</span>
					</div>
				</div>
			</div>

			{/* Wide List Panel */}
			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>Loading followed accounts...</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>Following list is unavailable</h3><p>{error.message}</p></div>
			) : processedList.length > 0 ? (
				<div className="list-panel-container">
					{processedList.map((item: Following) => {
						const target = item?.followingData;
						const targetId = target?._id || item.followingId;
						const targetNick = target?.memberFullName || target?.memberNick || 'AURA member';
						const handle = `@${(target?.memberNick || 'member').toLowerCase().replace(/\s+/g, '')}`;
						const targetLocation = target?.memberAddress || target?.memberType || 'Location not provided';
						const targetImg = getImageUrl(target?.memberImage, DEFAULT_USER_AVATAR);

						// Determine following status: local override or default true (since they are in following list)
						const isCurrentlyFollowing =
							targetId in followStatusMap ? followStatusMap[targetId] : true;

						return (
							<div key={item._id || targetId} className="list-row-item">
								<div className="user-info-left">
									<img src={targetImg} alt={targetNick} className="avatar-circle" />
									<div className="text-details">
										<div className="name-badge-row">
											<span className="user-name">{targetNick}</span>
										</div>
										<p className="handle-sub">
											{handle} · {targetLocation}
										</p>
									</div>
								</div>

								<div className="actions-right">
									<FollowButton 
										isFollowing={isCurrentlyFollowing} 
										onClick={() => handleToggleFollow(targetId, targetNick, isCurrentlyFollowing)} 
									/>
									<button
										type="button"
										className="more-options-btn"
										aria-label="Account options"
										onClick={() => router.push(`/member?memberId=${targetId}`)}
									>
										<span className="material-symbols-outlined">more_horiz</span>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">person_search</span>
					</div>
					<h3>{searchTerm ? 'No matching accounts found' : 'Not following anyone yet'}</h3>
					<p>
						{searchTerm
							? `No following accounts match "${searchTerm}".`
							: 'Explore luxury sanctuaries, tour partners, and editors across the world to follow.'}
					</p>
				</div>
			)}
		</div>
	);
};

export default MyProfileFollowing;
