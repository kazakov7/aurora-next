import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getJwtToken } from '../auth';
import { Notification } from '../types/notification/notification';

interface UseNotificationRealtimeProps {
	memberId?: string;
	onNotification: (notification: Notification) => void;
}

export const useNotificationRealtime = ({ memberId, onNotification }: UseNotificationRealtimeProps): void => {
	useEffect(() => {
		const token = getJwtToken();
		if (!memberId || !token) return;
		const baseUrl = process.env.NEXT_PUBLIC_AURORA_SOCKET_URL || process.env.NEXT_PUBLIC_API_SOCKET_URL || 'http://127.0.0.1:3007';
		const socketUrl = baseUrl.replace(/\/$/, '').endsWith('/chat') ? baseUrl.replace(/\/$/, '') : `${baseUrl.replace(/\/$/, '')}/chat`;
		const socket = io(socketUrl, { auth: { token }, transports: ['websocket'], reconnection: true, reconnectionAttempts: 8 });
		socket.on('notification:new', onNotification);
		return () => {
			socket.disconnect();
		};
	}, [memberId, onNotification]);
};
