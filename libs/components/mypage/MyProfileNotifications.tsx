import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, Box, Pagination } from '@mui/material';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_FOLLOWING_IDS, GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ, SUBSCRIBE } from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { MemberType } from '../../enums/member.enum';
import { sweetErrorHandling } from '../../sweetAlert';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useNotificationRealtime } from '../../hooks/useNotificationRealtime';
import { useI18n } from '../../i18n';

interface NotificationsInquiry {
	page: number;
	limit: number;
	search: {
		notificationStatus?: NotificationStatus;
	};
}

const PAGE_LIMIT = 10;

const CONTENT_ROUTES: Partial<Record<NotificationGroup, string>> = {
	[NotificationGroup.PROPERTY]: '/property/detail',
	[NotificationGroup.TOUR]: '/tour/detail',
	[NotificationGroup.ARTICLE]: '/community/detail',
};

const MyProfileNotifications = () => {
	const { t, formatRelativeTime } = useI18n();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

	/** URL STATE **/
	const page = Math.max(1, Number(router.query.page) || 1);
	const statusFilter = router.query.status === NotificationStatus.WAIT ? NotificationStatus.WAIT : undefined;
	const inquiry = useMemo<NotificationsInquiry>(() => ({
		page,
		limit: PAGE_LIMIT,
		search: statusFilter ? { notificationStatus: statusFilter } : {},
	}), [page, statusFilter]);

	/** APOLLO REQUESTS **/
	const { loading, data, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		skip: !user?._id,
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	const { data: unreadData, refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		skip: !user?._id,
	});

	const notifications: Notification[] = data?.getMyNotifications?.list || [];
	const total: number = data?.getMyNotifications?.metaCounter?.[0]?.total || 0;
	const unreadCount: number = unreadData?.getUnreadNotificationCount || 0;
	const hasFollowNotifications = notifications.some((notif) => notif.notificationType === NotificationType.FOLLOW);

	const { data: followingData, refetch: refetchFollowing } = useQuery(GET_MY_FOLLOWING_IDS, {
		fetchPolicy: 'network-only',
		skip: !user?._id || !hasFollowNotifications,
		// The JWT following count goes stale after new follows, so keep a wider window
		variables: { input: { page: 1, limit: Math.max(user?.memberFollowings ?? 0, 100), search: { followerId: user?._id } } },
	});
	const followingIds = useMemo(
		() => new Set<string>((followingData?.getMemberFollowings?.list ?? []).map((follow: { followingId: string }) => follow.followingId)),
		[followingData],
	);

	const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllNotificationsAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
	const [subscribe] = useMutation(SUBSCRIBE);

	const handleRealtimeNotification = useCallback(() => {
		void refetch();
		void refetchUnread();
	}, [refetch, refetchUnread]);
	useNotificationRealtime({ memberId: user?._id, onNotification: handleRealtimeNotification });

	/** HANDLERS **/
	const updateQuery = (next: { page?: number; status?: NotificationStatus }) => {
		const query: Record<string, string> = { category: 'notifications' };
		const nextStatus = 'status' in next ? next.status : statusFilter;
		const nextPage = next.page ?? page;
		if (nextStatus) query.status = nextStatus;
		if (nextPage > 1) query.page = String(nextPage);
		void router.push({ pathname: '/mypage', query }, undefined, { shallow: true, scroll: false });
	};

	/** LIFECYCLES **/
	useEffect(() => {
		if (loading || !data || notifications.length || page === 1) return;
		updateQuery({ page: Math.max(1, Math.ceil(total / PAGE_LIMIT)) });
	}, [loading, data]);

	const handleFilterChange = (status?: NotificationStatus) => {
		updateQuery({ status, page: 1 });
	};

	const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
		updateQuery({ page: value });
	};

	const handleMarkAsRead = async (id: string) => {
		try {
			await markNotificationAsRead({
				variables: { input: { notificationId: id } },
			});
			await refetch();
			await refetchUnread();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleNotificationExpand = async (notification: Notification) => {
		setExpandedNotificationId((current) => current === notification._id ? null : notification._id);
		if (notification.notificationStatus === NotificationStatus.WAIT) {
			await handleMarkAsRead(notification._id);
		}
	};

	const getNotificationLink = (notification: Notification): string | null => {
		const { notificationType, notificationGroup, notificationRefId, authorId } = notification;
		if (notificationType === NotificationType.BOOKING) {
			if (user?.memberType === MemberType.ADMIN) return '/_admin/bookings';
			// Owner notifications are authored by the guest; the guest's own notification has no author
			return authorId ? '/mypage?category=reservations' : '/mypage?category=bookings';
		}
		// A support notification opens the request with the reply; for an admin, the support desk
		if (notificationType === NotificationType.SUPPORT) {
			if (user?.memberType === MemberType.ADMIN) return '/_admin/support';
			return notificationRefId ? `/mypage?category=requests&ticket=${notificationRefId}` : '/mypage?category=requests';
		}
		const contentRoute = CONTENT_ROUTES[notificationGroup];
		if (contentRoute && notificationRefId && [NotificationType.LIKE, NotificationType.COMMENT, NotificationType.REVIEW].includes(notificationType)) {
			return `${contentRoute}?id=${notificationRefId}`;
		}
		return null;
	};

	const handleNotificationAction = async (notification: Notification) => {
		if (notification.notificationType === NotificationType.FOLLOW && notification.authorId) {
			try {
				await subscribe({ variables: { input: notification.authorId }, refetchQueries: ['GetMember'] });
				await refetchFollowing();
				await refetch();
			} catch (err) {
				await sweetErrorHandling(err);
			}
			return;
		}
		const link = getNotificationLink(notification);
		if (link) {
			if (notification.notificationStatus === NotificationStatus.WAIT) await handleMarkAsRead(notification._id);
			await router.push(link);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllNotificationsAsRead();
			await refetch();
			await refetchUnread();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const getIconForType = (type: string) => {
		switch (type) {
			case 'LIKE':
				return 'favorite';
			case 'COMMENT':
				return 'chat_bubble';
			case 'FOLLOW':
				return 'person_add';
			case 'BOOKING':
				return 'hotel';
			case 'REVIEW':
				return 'explore';
			case 'MESSAGE':
				return 'mail';
			case 'SUPPORT':
				return 'support_agent';
			case 'SYSTEM':
			default:
				return 'auto_awesome';
		}
	};

	const getIconColorForType = (type: string) => {
		switch (type) {
			case 'LIKE':
				return 'like-icon';
			case 'COMMENT':
				return 'comment-icon';
			case 'FOLLOW':
				return 'follow-icon';
			case 'BOOKING':
				return 'booking-icon';
			case 'REVIEW':
				return 'tour-icon';
			case 'MESSAGE':
				return 'comment-icon';
			case 'SYSTEM':
			default:
				return 'system-icon';
		}
	};

	return (
		<Stack className="profile-notifications">
			<Stack className="notifications-top-bar" direction="row" justifyContent="space-between" alignItems="center">
				<Stack className="title-box" direction="row" alignItems="center" spacing={2}>
					<h2>{t('navigation.notifications')}</h2>
					{unreadCount > 0 && (
						<Box className="unread-badge">
							<Box className="dot" />
							{t('profile.notifications.unreadCount', { unreadCount })}
						</Box>
					)}
				</Stack>
				<Stack className="actions-box" direction="row" alignItems="center" spacing={2}>
					<Stack className="filter-tabs" direction="row">
						<button
							className={`filter-btn ${!inquiry.search.notificationStatus ? 'active' : ''}`}
							onClick={() => handleFilterChange(undefined)}
						>
							{t('profile.notifications.all')}
						</button>
						<button
							className={`filter-btn ${inquiry.search.notificationStatus === NotificationStatus.WAIT ? 'active' : ''}`}
							onClick={() => handleFilterChange(NotificationStatus.WAIT)}
						>
							{t('profile.notifications.tabUnread', { unreadCount })}
						</button>
					</Stack>
					<button className="mark-all-btn" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
						<span className="material-symbols-outlined">done_all</span>
						{t('profile.notifications.markAllAsRead')}
					</button>
				</Stack>
			</Stack>

			<Stack className="notifications-list-container">
				{loading && !data ? (
					<Box className="empty-state"><span className="loading-spinner" /><p>{t('profile.notifications.loading')}</p></Box>
				) : notifications.length === 0 ? (
					<Box className="empty-state">
						<span className="material-symbols-outlined">notifications_off</span>
						<p>{t('profile.notifications.empty')}</p>
					</Box>
				) : (
					notifications.map((notif) => (
						<Stack
							key={notif._id}
							className={`notification-item ${notif.notificationStatus === NotificationStatus.WAIT ? 'unread' : 'read'}`}
							onClick={() => void handleNotificationExpand(notif)}
							direction="row"
							justifyContent="space-between"
							alignItems="center"
						>
							<Stack className="item-left" direction="row" alignItems="center" spacing={2}>
								<Box className={`icon-wrapper ${getIconColorForType(notif.notificationType)}`}>
									<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
										{getIconForType(notif.notificationType)}
									</span>
								</Box>
								<Stack className="item-content">
									<div className="title">
									<strong>{notif.notificationTitle}</strong>
									</div>
									{notif.authorData && <span className="sender">{notif.authorData.memberFullName || notif.authorData.memberNick}</span>}
									{expandedNotificationId === notif._id && notif.notificationDesc && <span className="desc">“{notif.notificationDesc}”</span>}
									<span className="time">{formatRelativeTime(notif.createdAt)}</span>
								</Stack>
							</Stack>
							<Stack className="item-right" direction="row" alignItems="center" spacing={1}>
								{notif.notificationStatus === NotificationStatus.WAIT && (
									<Box className="unread-dot" />
								)}
								{notif.notificationType === 'FOLLOW' && notif.authorId && followingData && !followingIds.has(notif.authorId) && (
									<button className="action-btn" onClick={(event) => { event.stopPropagation(); void handleNotificationAction(notif); }}>{t('profile.notifications.followBack')}</button>
								)}
								{notif.notificationType === 'BOOKING' && (
									<button className="action-btn-primary" onClick={(event) => { event.stopPropagation(); void handleNotificationAction(notif); }}>{t('profile.notifications.viewBooking')}</button>
								)}
								{notif.notificationType !== 'BOOKING' && getNotificationLink(notif) && (
									<button className="action-btn-primary" onClick={(event) => { event.stopPropagation(); void handleNotificationAction(notif); }}>{t('common.view')}</button>
								)}
								<button className="more-btn" aria-label={t('profile.notifications.markRead')} disabled={notif.notificationStatus === NotificationStatus.READ} onClick={(event) => { event.stopPropagation(); void handleMarkAsRead(notif._id); }}>
									<span className="material-symbols-outlined">check</span>
								</button>
							</Stack>
						</Stack>
					))
				)}
			</Stack>

			{total > 0 && (
				<Stack className="pagination-wrapper" alignItems="center">
					<Pagination
						count={Math.ceil(total / inquiry.limit)}
						page={inquiry.page}
						onChange={handlePaginationChange}
						shape="circular"
						color="primary"
						getItemAriaLabel={(type, page, selected) =>
							type === 'page'
								? t(selected ? 'common.pagination.currentPage' : 'common.pagination.goToPage', { page })
								: t(`common.pagination.${type}`)
						}
					/>
					<p className="pagination-text">
						{t('profile.notifications.showingRange', { page: (inquiry.page - 1) * inquiry.limit + 1, math: Math.min(inquiry.page * inquiry.limit, total), total })}
					</p>
				</Stack>
			)}
		</Stack>
	);
};

export default MyProfileNotifications;
