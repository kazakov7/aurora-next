import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/router';
import { GET_MY_CHATS, GET_MESSAGES } from '../../../apollo/chat/query';
import { DELETE_MY_CHAT, GET_OR_CREATE_DIRECT_CHAT, MARK_CHAT_AS_READ } from '../../../apollo/chat/mutation';
import { userVar } from '../../../apollo/store';
import { AUTH_TOKEN_ERRORS, clearAuthSession, getJwtToken } from '../../auth';
import { getChatSocketUrl } from '../../config';
import { sweetErrorAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import ChatSidebar from './ChatSidebar';
import ChatThread from './ChatThread';
import ChatDossier from './ChatDossier';
import { ChatConversation, ChatMessage } from './chat.types';
import { useI18n } from '../../i18n';

const CHAT_PAGE_SIZE = 50;
const CHAT_LIST_INPUT = { page: 1, limit: 100, sort: 'lastMessageAt', direction: 'DESC', search: {} };

const upsertMessage = (items: ChatMessage[], message: ChatMessage): ChatMessage[] => {
	const index = items.findIndex((item) => item._id === message._id || (message.clientMessageId && item.clientMessageId === message.clientMessageId));
	if (index === -1) return [...items, message].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
	return items.map((item, itemIndex) => (itemIndex === index ? message : item));
};

const ChatMessenger: React.FC = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const apolloClient = useApolloClient();
	const socketRef = useRef<Socket | null>(null);
	const activeChatIdRef = useRef('');
	const conversationsRef = useRef<ChatConversation[]>([]);
	const openedMemberIdRef = useRef('');
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [transientConversation, setTransientConversation] = useState<ChatConversation | null>(null);
	const [activeChatId, setActiveChatId] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [nextCursor, setNextCursor] = useState<string | undefined>();
	const [historyError, setHistoryError] = useState('');
	const [directChatError, setDirectChatError] = useState('');
	const [socketStatus, setSocketStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
	const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatConversation | null>(null);
	const [deleteError, setDeleteError] = useState('');
	const [mobileShowThread, setMobileShowThread] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data: chatsData, loading: chatsLoading, error: chatsError, refetch: refetchChats } = useQuery(GET_MY_CHATS, {
		variables: { input: CHAT_LIST_INPUT },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		skip: !user._id,
	});
	const { data: messagesData, loading: messagesLoading, error: messagesError, fetchMore } = useQuery(GET_MESSAGES, {
		variables: { input: { chatId: activeChatId, limit: CHAT_PAGE_SIZE } },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		skip: !activeChatId,
	});
	const [getOrCreateDirectChat] = useMutation(GET_OR_CREATE_DIRECT_CHAT);
	const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);
	const [deleteMyChat, { loading: deletingChat }] = useMutation(DELETE_MY_CHAT);

	/** LIFECYCLES **/
	useEffect(() => {
		setConversations(chatsData?.getMyChats?.list || []);
	}, [chatsData]);

	useEffect(() => {
		if (transientConversation && conversations.some((chat) => chat._id === transientConversation._id)) {
			setTransientConversation(null);
		}
	}, [conversations, transientConversation]);

	useEffect(() => {
		conversationsRef.current = conversations;
	}, [conversations]);

	useEffect(() => {
		const payload = messagesData?.getMessages;
		if (!payload) return;
		const responseChatId = payload.list?.[0]?.chatId;
		if (responseChatId && responseChatId !== activeChatIdRef.current) return;
		setMessages(payload.list || []);
		setNextCursor(payload.nextCursor || undefined);
	}, [messagesData]);

	useEffect(() => {
		activeChatIdRef.current = activeChatId;
		if (!activeChatId) return;
		setMessages([]);
		setNextCursor(undefined);
		socketRef.current?.emit('chat:join', { chatId: activeChatId });
		setConversations((previous) => previous.map((chat) => (chat._id === activeChatId ? { ...chat, unreadCount: 0 } : chat)));
		void markChatAsRead({ variables: { chatId: activeChatId } });
	}, [activeChatId, markChatAsRead]);

	useEffect(() => {
		if (!user._id || !router.isReady) return;
		const requestedChatId = typeof router.query.chatId === 'string' ? router.query.chatId : '';
		if (requestedChatId && conversations.some((chat) => chat._id === requestedChatId)) {
			setActiveChatId(requestedChatId);
			setMobileShowThread(true);
			return;
		}
		if (!activeChatId && conversations.length) setActiveChatId(conversations[0]._id);
	}, [activeChatId, conversations, router.isReady, router.query.chatId, user._id]);

	useEffect(() => {
		const memberId = typeof router.query.memberId === 'string'
			? router.query.memberId
			: typeof router.query.recipientId === 'string'
				? router.query.recipientId
				: '';
		if (!memberId || !user._id || memberId === user._id || openedMemberIdRef.current === memberId) return;
		openedMemberIdRef.current = memberId;
		void (async () => {
			try {
				setDirectChatError('');
				const result = await getOrCreateDirectChat({ variables: { memberTwoId: memberId } });
				const chatId = result.data?.getOrCreateDirectChat?._id;
				if (!chatId) throw new Error(t('chat.messenger.openFailed'));
				const refreshedChats = await refetchChats();
				setConversations(refreshedChats.data?.getMyChats?.list || []);
				setTransientConversation(result.data?.getOrCreateDirectChat as ChatConversation);
				setActiveChatId(chatId);
				setMobileShowThread(true);
				void router.replace({ pathname: '/chat', query: { chatId } }, undefined, { shallow: true });
			} catch (error) {
				openedMemberIdRef.current = '';
				setDirectChatError(tError(error, 'chat.messenger.openFailed'));
			}
		})();
	}, [getOrCreateDirectChat, refetchChats, router, router.query.memberId, router.query.recipientId, user._id]);

	useEffect(() => {
		const token = getJwtToken();
		if (!user._id || !token) return;
		// auth callback re-reads the token on every reconnect so a refreshed JWT is used
		const socket = io(getChatSocketUrl(), { auth: (cb) => cb({ token: getJwtToken() }), transports: ['websocket'], reconnection: true, reconnectionAttempts: 8 });
		socketRef.current = socket;
		socket.on('connect', () => {
			setSocketStatus('connected');
			if (activeChatIdRef.current) socket.emit('chat:join', { chatId: activeChatIdRef.current });
		});
		socket.io.on('reconnect_attempt', () => setSocketStatus('reconnecting'));
		socket.on('disconnect', () => setSocketStatus('disconnected'));
		socket.on('connect_error', () => setSocketStatus('disconnected'));
		socket.on('chat:error', (payload: { message?: string }) => {
			// Server rejected the token (expired, blocked or deleted member): end the stale session
			if (payload?.message && AUTH_TOKEN_ERRORS.includes(payload.message)) {
				socket.disconnect();
				clearAuthSession();
				void sweetErrorAlert(t(Message.SESSION_EXPIRED));
			}
		});
		socket.on('message:new', (message: ChatMessage) => {
			if (!message?._id || !message.chatId) return;
			if (message.chatId === activeChatIdRef.current) setMessages((previous) => upsertMessage(previous, message));
			setConversations((previous) => previous.map((chat) => chat._id === message.chatId ? {
				...chat,
				lastMessage: message.messageContent,
				lastMessageAt: message.createdAt,
				unreadCount: message.senderId !== user._id && message.chatId !== activeChatIdRef.current ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
			} : chat));
			void refetchChats();
		});
		socket.on('chat:deleted', (payload: { chatId?: string }) => {
			const chatId = payload?.chatId;
			if (!chatId) return;
			const remaining = conversationsRef.current.filter((chat) => chat._id !== chatId);
			conversationsRef.current = remaining;
			setConversations(remaining);
			if (activeChatIdRef.current === chatId) {
				const globalChatId = remaining.find((chat) => chat.chatType === 'GLOBAL')?._id || '';
				setMessages([]);
				setNextCursor(undefined);
				setTransientConversation(null);
				setActiveChatId(globalChatId);
				setMobileShowThread(false);
				void router.replace({ pathname: '/chat', query: globalChatId ? { chatId: globalChatId } : {} }, undefined, { shallow: true });
			}
			void refetchChats();
		});
		return () => {
			socket.removeAllListeners();
			socket.disconnect();
			if (socketRef.current === socket) socketRef.current = null;
		};
	}, [refetchChats, user._id]);

	/** HANDLERS **/
	const handleSelectConversation = (chatId: string) => {
		setTransientConversation(null);
		setActiveChatId(chatId);
		setMobileShowThread(true);
		void router.replace({ pathname: '/chat', query: { chatId } }, undefined, { shallow: true });
	};

	const handleBackToConversations = () => {
		setMobileShowThread(false);
		void router.replace({ pathname: '/chat' }, undefined, { shallow: true });
	};

	const handleViewProfile = (conversation: ChatConversation) => {
		const peerId = conversation.memberOneId === user._id ? conversation.memberTwoId : conversation.memberOneId;
		if (peerId) void router.push(`/member?memberId=${peerId}`);
	};

	const removeConversationFromCache = (chatId: string) => {
		apolloClient.cache.updateQuery(
			{ query: GET_MY_CHATS, variables: { input: CHAT_LIST_INPUT } },
			(cached: any) => {
				if (!cached?.getMyChats) return cached;
				const list = (cached.getMyChats.list || []).filter((chat: ChatConversation) => chat._id !== chatId);
				const total = cached.getMyChats.metaCounter?.[0]?.total;
				return {
					...cached,
					getMyChats: {
						...cached.getMyChats,
						list,
						metaCounter: typeof total === 'number' ? [{ ...cached.getMyChats.metaCounter[0], total: Math.max(0, total - 1) }] : cached.getMyChats.metaCounter,
					},
				};
			},
		);
	};

	const handleDeleteChat = async () => {
		if (!chatPendingDeletion || deletingChat) return;
		try {
			setDeleteError('');
			const result = await deleteMyChat({ variables: { chatId: chatPendingDeletion._id } });
			if (!result.data?.deleteMyChat) throw new Error(t('chat.messenger.deleteFailed'));

			removeConversationFromCache(chatPendingDeletion._id);
			const remaining = conversationsRef.current.filter((chat) => chat._id !== chatPendingDeletion._id);
			conversationsRef.current = remaining;
			setConversations(remaining);
			if (activeChatIdRef.current === chatPendingDeletion._id) {
				const globalChatId = remaining.find((chat) => chat.chatType === 'GLOBAL')?._id || '';
				setMessages([]);
				setNextCursor(undefined);
				setTransientConversation(null);
				setActiveChatId(globalChatId);
				setMobileShowThread(false);
				await router.replace({ pathname: '/chat', query: globalChatId ? { chatId: globalChatId } : {} }, undefined, { shallow: true });
			}
			setChatPendingDeletion(null);
			await refetchChats();
		} catch (error) {
			setDeleteError(tError(error, 'chat.messenger.deleteFailed'));
		}
	};

	const handleSendMessage = async (messageContent: string): Promise<boolean> => {
		const socket = socketRef.current;
		if (!socket?.connected || !activeChatId) return false;
		const clientMessageId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
		return await new Promise((resolve) => {
			socket.timeout(10_000).emit('message:send', { chatId: activeChatId, messageContent, clientMessageId }, (error: Error | null, response?: { ok: boolean; message?: ChatMessage }) => {
				if (error || !response?.ok || !response.message) return resolve(false);
				setMessages((previous) => upsertMessage(previous, response.message!));
				void refetchChats();
				resolve(true);
			});
		});
	};

	const handleLoadOlder = async () => {
		if (!nextCursor || !activeChatId) return;
		try {
			setHistoryError('');
			const result = await fetchMore({ variables: { input: { chatId: activeChatId, limit: CHAT_PAGE_SIZE, before: nextCursor } } });
			const payload = result.data?.getMessages;
			if (!payload) return;
			setMessages((previous) => [...payload.list, ...previous]);
			setNextCursor(payload.nextCursor || undefined);
		} catch {
			setHistoryError(t('chat.messenger.historyFailed'));
		}
	};

	if (!user._id) return <div className="chat-empty-state"><p>{t('chat.messenger.signInRequired')}</p></div>;

	const activeConversation = conversations.find((chat) => chat._id === activeChatId)
		|| (transientConversation?._id === activeChatId ? transientConversation : undefined);
	return (
		<div className="messenger-container">
			<div className={`messenger-grid ${mobileShowThread ? 'mobile-view-thread' : 'mobile-view-list'}`}>
				<ChatSidebar conversations={conversations} activeId={activeChatId} currentMemberId={user._id} loading={chatsLoading} error={directChatError || chatsError?.message} onSelect={handleSelectConversation} onViewProfile={handleViewProfile} onRequestDelete={(conversation) => { setDeleteError(''); setChatPendingDeletion(conversation); }} />
				<ChatThread conversation={activeConversation} messages={messages} currentMemberId={user._id} loading={messagesLoading} error={directChatError || historyError || messagesError?.message} hasOlderMessages={Boolean(nextCursor)} socketStatus={socketStatus} onLoadOlder={handleLoadOlder} onSendMessage={handleSendMessage} onBackToConversations={handleBackToConversations} />
				<ChatDossier conversation={activeConversation} currentMemberId={user._id} />
			</div>
			{chatPendingDeletion ? <div className="chat-delete-modal-backdrop" role="presentation"><div className="chat-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-chat-title"><h2 id="delete-chat-title">{t('chat.messenger.deleteTitle')}</h2><p>{t('chat.messenger.deleteText')}</p>{deleteError ? <p className="chat-delete-error">{deleteError}</p> : null}<div className="chat-delete-actions"><button type="button" onClick={() => setChatPendingDeletion(null)} disabled={deletingChat}>{t('common.cancel')}</button><button type="button" className="confirm-delete-chat" onClick={() => void handleDeleteChat()} disabled={deletingChat}>{deletingChat ? t('chat.messenger.deleting') : t('chat.deleteChat')}</button></div></div></div> : null}
		</div>
	);
};

export default ChatMessenger;
