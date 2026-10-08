export type ChatRole = 'partner' | 'traveler' | 'global';

export interface ChatMember {
	_id: string;
	memberType: 'USER' | 'AGENT' | 'ADMIN';
	memberNick?: string;
	memberFullName?: string;
	memberImage?: string;
	memberDesc?: string;
	memberAddress?: string;
	meFollowed?: Array<{ myFollowing: boolean }>;
}

export interface ChatConversation {
	_id: string;
	chatType: 'DIRECT' | 'GLOBAL';
	memberOneId?: string;
	memberTwoId?: string;
	lastMessage?: string;
	lastMessageAt?: string;
	unreadCount?: number;
	memberOneData?: ChatMember;
	memberTwoData?: ChatMember;
}

export interface ChatMessage {
	_id: string;
	chatId: string;
	senderId: string;
	messageType: 'TEXT' | 'IMAGE';
	messageContent?: string;
	clientMessageId?: string;
	createdAt: string;
	updatedAt: string;
	senderData?: Pick<ChatMember, '_id' | 'memberNick' | 'memberFullName' | 'memberImage'>;
}
