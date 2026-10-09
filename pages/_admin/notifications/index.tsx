import React, { useCallback, useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { userVar } from '../../../apollo/store';
import { GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_AS_READ, MARK_NOTIFICATION_AS_READ } from '../../../apollo/user/mutation';
import { Notification, Notifications } from '../../../libs/types/notification/notification';
import { NotificationStatus, NotificationType } from '../../../libs/enums/notification.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { useNotificationRealtime } from '../../../libs/hooks/useNotificationRealtime';

interface GetMyNotificationsData {
	getMyNotifications: Notifications;
}

interface NotificationsInquiry {
	page: number;
	limit: number;
	search: { notificationStatus?: NotificationStatus };
}

const PAGE_LIMIT = 10;

const formatDate = (value?: Date | string): string => {
	if (!value) return '—';
	const date = new Date(isNaN(Number(value)) ? value : Number(value));
	return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/** Admins receive SYSTEM notifications only for agent applications (see notifyActiveAdmins callers) **/
const getAdminLink = (notification: Notification): string | null => {
	if (notification.notificationType === NotificationType.BOOKING) return '/_admin/bookings';
	if (notification.notificationType === NotificationType.SYSTEM) return '/_admin/agent-verification';
	return null;
};

const AdminNotificationsPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** URL STATE **/
	const page = Math.max(1, Number(router.query.page) || 1);
	const status = router.query.status === NotificationStatus.WAIT ? NotificationStatus.WAIT : 'ALL';
	const input = useMemo<NotificationsInquiry>(() => ({
		page,
		limit: PAGE_LIMIT,
		search: status === 'ALL' ? {} : { notificationStatus: status },
	}), [page, status]);

	/** APOLLO REQUESTS **/
	const { data, loading, error, refetch } = useQuery<GetMyNotificationsData>(GET_MY_NOTIFICATIONS, {
		variables: { input },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		skip: !user?._id,
	});
	const { data: unreadData, refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		fetchPolicy: 'network-only',
		skip: !user?._id,
	});
	const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllNotificationsAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

	const notifications = data?.getMyNotifications?.list ?? [];
	const total = data?.getMyNotifications?.metaCounter?.[0]?.total ?? 0;
	const unreadCount: number = unreadData?.getUnreadNotificationCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
	const startItem = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
	const endItem = Math.min(page * PAGE_LIMIT, total);

	const handleRealtimeNotification = useCallback(() => {
		void refetch();
		void refetchUnread();
	}, [refetch, refetchUnread]);
	useNotificationRealtime({ memberId: user?._id, onNotification: handleRealtimeNotification });

	/** HANDLERS **/
	const updateQuery = (next: { page?: number; status?: NotificationStatus | 'ALL' }) => {
		const query: Record<string, string> = {};
		const nextStatus = next.status ?? status;
		const nextPage = next.page ?? page;
		if (nextStatus !== 'ALL') query.status = nextStatus;
		if (nextPage > 1) query.page = String(nextPage);
		void router.push({ pathname: '/_admin/notifications', query }, undefined, { shallow: true });
	};

	/** LIFECYCLES **/
	useEffect(() => {
		if (loading || !data || notifications.length || page === 1) return;
		updateQuery({ page: totalPages });
	}, [loading, data]);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markNotificationAsRead({ variables: { input: { notificationId } } });
			await refetch();
			await refetchUnread();
		} catch (err) {
			await sweetErrorHandling(err);
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

	const handleOpen = async (notification: Notification, link: string) => {
		if (notification.notificationStatus === NotificationStatus.WAIT) await handleMarkAsRead(notification._id);
		await router.push(link);
	};

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Notifications</h1>
					<p>Agent applications, booking updates and other platform events addressed to administrators.</p>
				</div>
			</div>

			<section className="admin-table-section">
				<div className="table-header">
					<div className="header-left"><h2>Inbox</h2><span className="table-badge">{unreadCount} Unread</span></div>
					<div className="header-right">
						<div className="filter-select-group">
							<select className="filter-select" value={status} onChange={(event) => updateQuery({ status: event.target.value as NotificationStatus | 'ALL', page: 1 })}>
								<option value="ALL">All notifications</option>
								<option value={NotificationStatus.WAIT}>Unread only</option>
							</select>
						</div>
						<button className="export-btn" type="button" disabled={unreadCount === 0} onClick={() => void handleMarkAllAsRead()}>
							<span className="material-symbols-outlined">done_all</span>
							Mark all as read
						</button>
					</div>
				</div>

				<div className="table-container">
					<table className="admin-table">
						<thead><tr><th>Type</th><th>Notification</th><th>From</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
						<tbody>
							{loading && !data ? (
								<tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px' }}>Loading notifications...</td></tr>
							) : error ? (
								<tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#ba1a1a' }}>{error.message}</td></tr>
							) : notifications.length === 0 ? (
								<tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px' }}>No notifications found.</td></tr>
							) : notifications.map((notification) => {
								const isUnread = notification.notificationStatus === NotificationStatus.WAIT;
								const link = getAdminLink(notification);
								return (
									<tr key={notification._id}>
										<td><span className={`badge-pill ${notification.notificationType === NotificationType.BOOKING ? 'sky' : 'indigo'}`}>{notification.notificationType}</span></td>
										<td>
											<strong>{notification.notificationTitle}</strong>
											{notification.notificationDesc ? <div className="item-text">{notification.notificationDesc}</div> : null}
										</td>
										<td>{notification.authorData?.memberNick ?? notification.authorData?.memberFullName ?? 'System'}</td>
										<td><span className="date-text">{formatDate(notification.createdAt)}</span></td>
										<td><span className={`status-pill ${isUnread ? 'amber' : 'emerald'}`}><span className="dot" /> {isUnread ? 'UNREAD' : 'READ'}</span></td>
										<td>
											<div className="actions-group">
												{link ? <button className="text-btn" type="button" onClick={() => void handleOpen(notification, link)}>Open</button> : null}
												<button className="icon-btn success" type="button" aria-label="Mark notification as read" disabled={!isUnread} onClick={() => void handleMarkAsRead(notification._id)}>
													<span className="material-symbols-outlined">check</span>
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				<div className="table-footer">
					<span>Showing {startItem}–{endItem} of {total} notifications</span>
					<div className="pagination">
						<button className="page-btn square" type="button" disabled={page === 1 || loading} onClick={() => updateQuery({ page: page - 1 })}><span className="material-symbols-outlined">chevron_left</span></button>
						<span className="page-btn active">{page}</span>
						<button className="page-btn square" type="button" disabled={page >= totalPages || loading} onClick={() => updateQuery({ page: page + 1 })}><span className="material-symbols-outlined">chevron_right</span></button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default withAdminLayout(AdminNotificationsPage);
