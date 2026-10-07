import React, { useState, useEffect } from 'react';
import { Stack, Box, Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../../../apollo/user/mutation';
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
	const device = useDeviceDetect();
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
		onCompleted: (data) => {
			setNotifications(data?.getMyNotifications?.list || []);
			setTotal(data?.getMyNotifications?.metaCounter?.[0]?.total || 0);
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	const { refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setUnreadCount(data?.getUnreadNotificationCount || 0);
		},
	});

	const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllNotificationsAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

	/** LIFECYCLES **/
	useEffect(() => {
		refetch({ input: inquiry });
	}, [inquiry]);

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
				variables: { input: { _id: id } },
			});
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
			case 'TOUR':
				return 'explore';
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
			case 'TOUR':
				return 'tour-icon';
			case 'SYSTEM':
			default:
				return 'system-icon';
		}
	};

	if (device === 'mobile') {
		return <Stack className="profile-notifications">Mobile View Not Implemented</Stack>;
	}

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
					<button className="mark-all-btn" onClick={handleMarkAllAsRead}>
						<span className="material-symbols-outlined">done_all</span>
						Mark all as read
					</button>
				</Stack>
			</Stack>

			<Stack className="notifications-list-container">
				{notifications.length === 0 ? (
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
										<strong>{notif.authorId || 'AURA'}</strong> {notif.notificationTitle}
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
									<button className="action-btn">Follow Back</button>
								)}
								{notif.notificationType === 'BOOKING' && (
									<button className="action-btn-primary">View Booking</button>
								)}
								<button className="more-btn" onClick={() => handleMarkAsRead(notif._id)}>
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
