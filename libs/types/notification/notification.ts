import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { TotalCounter } from '../destination/destination';

export interface Notification {
	_id: string;
	receiverId: string;
	authorId?: string;
	authorData?: {
		_id: string;
		memberNick?: string;
		memberFullName?: string;
		memberImage?: string;
	};
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationRefId?: string;
	notificationTitle: string;
	notificationDesc?: string;
	createdAt: Date;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}
