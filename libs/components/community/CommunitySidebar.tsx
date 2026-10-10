import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { getImageUrl, DEFAULT_USER_AVATAR } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import FollowButton from '../common/FollowButton';
import { useI18n } from '../../i18n';

export interface HostItem {
	id: string;
	name: string;
	avatar?: string;
	subtitle: string;
}

export interface AgencyItem {
	id: string;
	name: string;
	avatar?: string;
	icon: string;
	subtitle: string;
}

interface CommunitySidebarProps {
	realOwners?: HostItem[];
	realAgencies?: AgencyItem[];
	isLoading?: boolean;
	hasError?: boolean;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
	realOwners = [],
	realAgencies = [],
	isLoading = false,
	hasError = false,
}) => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const currentUser = useReactiveVar(userVar);

	const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
	const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});

	/** APOLLO REQUESTS **/
	const [subscribeMutation] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation] = useMutation(UNSUBSCRIBE);

	const { data: followingsData, refetch: refetchFollowings } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 100,
				search: {
					followerId: currentUser?._id || '',
				},
			},
		},
		skip: !currentUser?._id,
	});

	const followingSet = new Set(
		followingsData?.getMemberFollowings?.list?.map((f: any) => f.followingId) || []
	);

	/** HANDLERS **/
	const handleToggleFollow = async (e: React.MouseEvent, targetId: string) => {
		e.preventDefault();
		e.stopPropagation();

		if (!currentUser?._id) {
			sweetMixinErrorAlert(t('community.sidebar.loginToFollow'));
			router.push({
				pathname: '/account/login',
				query: { referrer: router.asPath },
			});
			return;
		}

		if (currentUser._id === targetId) {
			sweetMixinErrorAlert(t('common.cannotFollowYourself'));
			return;
		}

		if (updatingMap[targetId]) return;

		const isCurrentlyFollowing =
			followOverrides[targetId] !== undefined
				? followOverrides[targetId]
				: followingSet.has(targetId);

		const nextStatus = !isCurrentlyFollowing;
		setFollowOverrides((prev) => ({ ...prev, [targetId]: nextStatus }));
		setUpdatingMap((prev) => ({ ...prev, [targetId]: true }));

		try {
			if (isCurrentlyFollowing) {
				await unsubscribeMutation({ variables: { input: targetId } });
			} else {
				await subscribeMutation({ variables: { input: targetId } });
			}
			await refetchFollowings?.();
		} catch (err: any) {
			// Revert on error
			setFollowOverrides((prev) => ({ ...prev, [targetId]: isCurrentlyFollowing }));
			sweetMixinErrorAlert(tError(err, 'common.actionFailed'));
		} finally {
			setUpdatingMap((prev) => ({ ...prev, [targetId]: false }));
		}
	};

	const hotelOwners = realOwners.slice(0, 10);
	const tourAgencies = realAgencies.slice(0, 10);

	return (
		<aside className="community-sidebar-column">
			{/* 1. HOTEL HOSTS CARD */}
			<div className="sidebar-ranking-card">
				<div className="card-header-bar">
					<div className="header-left">
						<span className="material-symbols-outlined header-icon">apartment</span>
						<div>
							<h3 className="section-title">{t('community.sidebar.hotelHosts')}</h3>
							<p className="section-subtitle">{t('community.sidebar.hostsSubtitle')}</p>
						</div>
					</div>
					<Link href="/property" className="view-all-link">
						{t('community.sidebar.explore')}
					</Link>
				</div>

				{hotelOwners.length > 0 ? (
					<ul className="ranked-rows-list">
						{hotelOwners.map((owner, idx) => {
							const isSelf = currentUser?._id === owner.id;
							const isFollowing =
								followOverrides[owner.id] !== undefined
									? followOverrides[owner.id]
									: followingSet.has(owner.id);

							return (
								<li key={owner.id} className="ranked-item-row">
									<Link href={`/member?memberId=${owner.id}`} className="item-profile-info">
										<span className="rank-number">{idx + 1}</span>
										<img
											className="user-avatar"
											src={getImageUrl(owner.avatar, DEFAULT_USER_AVATAR)}
											alt={owner.name}
										/>
										<div className="user-text-meta">
											<span className="user-name">{owner.name}</span>
											<span className="sub-line">{owner.subtitle}</span>
										</div>
									</Link>

									{!isSelf && (
										<div className="item-action-box">
											<FollowButton
												size="sm"
												isFollowing={isFollowing}
												isLoading={Boolean(updatingMap[owner.id])}
												onClick={(e) => handleToggleFollow(e, owner.id)}
											/>
										</div>
									)}
								</li>
							);
						})}
					</ul>
				) : (
					<p className="section-subtitle">
						{isLoading
							? t('community.sidebar.loadingHosts')
							: hasError
							? t('community.sidebar.hostsError')
							: t('community.sidebar.hostsEmpty')}
					</p>
				)}
			</div>

			{/* 2. TOUR ORGANIZERS CARD */}
			<div className="sidebar-ranking-card">
				<div className="card-header-bar">
					<div className="header-left">
						<span className="material-symbols-outlined header-icon">explore</span>
						<div>
							<h3 className="section-title">{t('community.sidebar.tourOrganizers')}</h3>
							<p className="section-subtitle">{t('community.sidebar.organizersSubtitle')}</p>
						</div>
					</div>
					<Link href="/tour" className="view-all-link">
						{t('community.sidebar.explore')}
					</Link>
				</div>

				{tourAgencies.length > 0 ? (
					<ul className="ranked-rows-list">
						{tourAgencies.map((agency) => {
							const isSelf = currentUser?._id === agency.id;
							const isFollowing =
								followOverrides[agency.id] !== undefined
									? followOverrides[agency.id]
									: followingSet.has(agency.id);

							return (
								<li key={agency.id} className="ranked-item-row">
									<Link href={`/member?memberId=${agency.id}`} className="item-profile-info">
										{agency.avatar ? (
											<img
												className="user-avatar"
												src={getImageUrl(agency.avatar, DEFAULT_USER_AVATAR)}
												alt={agency.name}
											/>
										) : (
											<div className="agency-icon-box">
												<span className="material-symbols-outlined">{agency.icon}</span>
											</div>
										)}
										<div className="user-text-meta">
											<span className="user-name">{agency.name}</span>
											<span className="sub-line">{agency.subtitle}</span>
										</div>
									</Link>

									{!isSelf && (
										<div className="item-action-box">
											<FollowButton
												size="sm"
												isFollowing={isFollowing}
												isLoading={Boolean(updatingMap[agency.id])}
												onClick={(e) => handleToggleFollow(e, agency.id)}
											/>
										</div>
									)}
								</li>
							);
						})}
					</ul>
				) : (
					<p className="section-subtitle">
						{isLoading
							? t('community.sidebar.loadingOrganizers')
							: hasError
							? t('community.sidebar.organizersError')
							: t('community.sidebar.organizersEmpty')}
					</p>
				)}
			</div>
		</aside>
	);
};

export default CommunitySidebar;
