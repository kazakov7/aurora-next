import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getJwtToken } from '../auth';
import { Notification } from '../types/notification/notification';

interface UseNotificationRealtimeProps {
	memberId?: string;
	onNotification: (notification: Notification) => void;
}

type NotificationListener = (notification: Notification) => void;

/** One socket is shared by every subscriber so the same page never opens duplicate connections **/
let sharedSocket: Socket | null = null;
let sharedToken = '';
const listeners = new Set<NotificationListener>();

const getSocketUrl = (): string => {
	const baseUrl = (process.env.NEXT_PUBLIC_AURORA_SOCKET_URL || process.env.NEXT_PUBLIC_API_SOCKET_URL || 'http://127.0.0.1:3007').replace(/\/$/, '');
	return baseUrl.endsWith('/chat') ? baseUrl : `${baseUrl}/chat`;
};

const closeSharedSocket = (): void => {
	sharedSocket?.disconnect();
	sharedSocket = null;
	sharedToken = '';
};

const openSharedSocket = (token: string): void => {
	if (sharedSocket && sharedToken === token) return;
	closeSharedSocket();
	sharedToken = token;
	sharedSocket = io(getSocketUrl(), { auth: { token }, transports: ['websocket'], reconnection: true, reconnectionAttempts: 8 });
	sharedSocket.on('notification:new', (notification: Notification) => {
		listeners.forEach((listener) => listener(notification));
	});
};

export const useNotificationRealtime = ({ memberId, onNotification }: UseNotificationRealtimeProps): void => {
	useEffect(() => {
		const token = getJwtToken();
		if (!memberId || !token) return;
		openSharedSocket(token);
		listeners.add(onNotification);
		return () => {
			listeners.delete(onNotification);
			if (!listeners.size) closeSharedSocket();
		};
	}, [memberId, onNotification]);
};
