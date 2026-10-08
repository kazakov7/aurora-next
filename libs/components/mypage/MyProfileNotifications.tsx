import React, { useEffect, useState } from 'react';
import { Stack, Box, Pagination } from '@mui/material';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ, SUBSCRIBE } from '../../../apollo/user/mutation';
import { Notification, Notifications } from '../../types/notification/notification';
import { NotificationStatus } from '../../enums/notification.enum';
import { sweetErrorHandling } from '../../sweetAlert';
import { useRouter } from 'next/router';
import moment from 'moment';

interface NotificationsInquiry {
	page: number;
	limit: number;
	search: {
		notificationStatus?: NotificationStatus;
	};
}

const MyProfileNotifications = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const [inquiry, setInquiry] = useState<NotificationsInquiry>({
		page: 1,
		limit: 10,
		search: {},
	});

	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [unreadCount, setUnreadCount] = useState<number>(0);

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

	const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllNotificationsAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
	const [subscribe] = useMutation(SUBSCRIBE);

	useEffect(() => {
		setNotifications(data?.getMyNotifications?.list || []);
		setTotal(data?.getMyNotifications?.metaCounter?.[0]?.total || 0);
	}, [data]);

	useEffect(() => {
		setUnreadCount(unreadData?.getUnreadNotificationCount || 0);
	}, [unreadData]);

	/** HANDLERS **/
	const handleFilterChange = (status?: NotificationStatus) => {
		setInquiry({
			...inquiry,
			page: 1,
			search: { notificationStatus: status },
		});
	};

	const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setInquiry({ ...inquiry, page: value });
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

	const handleNotificationAction = async (notification: Notification) => {
		if (notification.notificationStatus === NotificationStatus.WAIT) {
			await handleMarkAsRead(notification._id);
		}
		if (notification.notificationType === 'FOLLOW' && notification.authorId) {
			try {
				await subscribe({ variables: { input: notification.authorId }, refetchQueries: ['GetMember'] });
				await refetch();
			} catch (err) {
				await sweetErrorHandling(err);
			}
			return;
		}
		if (notification.notificationType === 'BOOKING') {
			await router.push({ pathname: '/mypage', query: { category: 'bookings' } });
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
					<h2>Notifications</h2>
					{unreadCount > 0 && (
						<Box className="unread-badge">
							<Box className="dot" />
							{unreadCount} unread
						</Box>
					)}
				</Stack>
				<Stack className="actions-box" direction="row" alignItems="center" spacing={2}>
					<Stack className="filter-tabs" direction="row">
						<button
							className={`filter-btn ${!inquiry.search.notificationStatus ? 'active' : ''}`}
							onClick={() => handleFilterChange(undefined)}
						>
							All
						</button>
						<button
							className={`filter-btn ${inquiry.search.notificationStatus === NotificationStatus.WAIT ? 'active' : ''}`}
							onClick={() => handleFilterChange(NotificationStatus.WAIT)}
						>
							Unread ({unreadCount})
						</button>
					</Stack>
					<button className="mark-all-btn" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
						<span className="material-symbols-outlined">done_all</span>
						Mark all as read
					</button>
				</Stack>
			</Stack>

			<Stack className="notifications-list-container">
				{loading && !data ? (
					<Box className="empty-state"><span className="loading-spinner" /><p>Loading notifications...</p></Box>
				) : notifications.length === 0 ? (
					<Box className="empty-state">
						<span className="material-symbols-outlined">notifications_off</span>
						<p>No notifications found.</p>
					</Box>
				) : (
					notifications.map((notif) => (
						<Stack
							key={notif._id}
							className={`notification-item ${notif.notificationStatus === NotificationStatus.WAIT ? 'unread' : 'read'}`}
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
									{notif.notificationDesc && <span className="desc">“{notif.notificationDesc}”</span>}
									<span className="time">{moment(notif.createdAt).fromNow()}</span>
								</Stack>
							</Stack>
							<Stack className="item-right" direction="row" alignItems="center" spacing={1}>
								{notif.notificationStatus === NotificationStatus.WAIT && (
									<Box className="unread-dot" />
								)}
								{notif.notificationType === 'FOLLOW' && (
									<button className="action-btn" onClick={() => void handleNotificationAction(notif)}>Follow Back</button>
								)}
								{notif.notificationType === 'BOOKING' && (
									<button className="action-btn-primary" onClick={() => void handleNotificationAction(notif)}>View Booking</button>
								)}
								<button className="more-btn" aria-label="Mark notification as read" disabled={notif.notificationStatus === NotificationStatus.READ} onClick={() => handleMarkAsRead(notif._id)}>
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
					/>
					<p className="pagination-text">
						Showing {(inquiry.page - 1) * inquiry.limit + 1}–
						{Math.min(inquiry.page * inquiry.limit, total)} of {total} notifications
					</p>
				</Stack>
			)}
		</Stack>
	);
};

export default MyProfileNotifications;
