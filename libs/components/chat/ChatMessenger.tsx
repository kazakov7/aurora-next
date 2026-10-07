import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatThread from './ChatThread';
import ChatDossier from './ChatDossier';
import { initialConversations } from './chat.data';
import { ChatConversation, ChatMessage } from './chat.types';

const ChatMessenger: React.FC = () => {
	const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
	const [activeId, setActiveId] = useState<string>('global');

	const activeConversation =
		conversations.find((c) => c.id === activeId) || conversations[0];

	const handleSelectConversation = (id: string) => {
		setActiveId(id);
		// Mark unread as read
		setConversations((prev) =>
			prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
		);
	};

	const handleSendMessage = (conversationId: string, text: string) => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const ampm = hours >= 12 ? 'pm' : 'am';
		const formattedHours = hours % 12 || 12;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

		const newMsg: ChatMessage = {
			id: `msg-${Date.now()}`,
			senderId: 'me',
			senderName: 'Elena Rostova',
			senderAvatar:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuDQzVRKp7lfd8XGtJsOnedswVg26UIs-0VBB2iOqfrZXuqq5XaEtWT-a4SPvkAS87kGZh3YvPnTAd4qxCrHzw3k6ZnNVQmYvk8nsJOc_nnbImal1rB-WHdznXOZi2Wgpgf8qSN8jc5w6sAiUsSWB6X097mWEGNHQyr4O2f7YTljk_u7qvP62Gj9otoiMkzZHCl4XC67QuAAkIWcQb7BQyjrfAYECjwEB4i-7Co6iC-HjCKul_6wMBlJ',
			text,
			time: timeStr,
			isOutgoing: true,
		};

		setConversations((prev) =>
			prev.map((c) => {
				if (c.id === conversationId) {
					return {
						...c,
						lastMessage: text,
						lastTime: timeStr,
						messages: [...c.messages, newMsg],
					};
				}
				return c;
			}),
		);
	};

	return (
		<div className="messenger-container">
			<div className="messenger-grid">
				{/* COLUMN 1: SIDEBAR */}
				<ChatSidebar
					conversations={conversations}
					activeId={activeId}
					onSelect={handleSelectConversation}
				/>

				{/* COLUMN 2: ACTIVE CONVERSATION THREAD */}
				<ChatThread
					conversation={activeConversation}
					onSendMessage={handleSendMessage}
				/>

				{/* COLUMN 3: MEMBER DOSSIER PANEL */}
				<ChatDossier conversation={activeConversation} />
			</div>
		</div>
	);
};

export default ChatMessenger;
