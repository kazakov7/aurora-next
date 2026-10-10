import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { AUTH_TOKEN_ERRORS, clearAuthSession, getJwtToken } from '../auth';
import { getChatSocketUrl } from '../config';
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

const closeSharedSocket = (): void => {
	sharedSocket?.disconnect();
	sharedSocket = null;
	sharedToken = '';
};

const openSharedSocket = (token: string): void => {
	if (sharedSocket && sharedToken === token) return;
	closeSharedSocket();
	sharedToken = token;
	// auth callback re-reads the token on every reconnect so a refreshed JWT is used
	sharedSocket = io(getChatSocketUrl(), { auth: (cb) => cb({ token: getJwtToken() }), transports: ['websocket'], reconnection: true, reconnectionAttempts: 8 });
	sharedSocket.on('chat:error', (payload: { message?: string }) => {
		if (payload?.message && AUTH_TOKEN_ERRORS.includes(payload.message)) {
			closeSharedSocket();
			clearAuthSession();
		}
	});
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
