export interface ChatMessage {
	id: string;
	senderId: string;
	senderName: string;
	senderAvatar: string;
	text: string;
	time: string;
	isOutgoing?: boolean;
	attachment?: {
		fileName: string;
		fileSize: string;
		fileType: 'pdf' | 'image' | 'doc';
	};
}

export interface PropertyItem {
	id: string;
	title: string;
	location: string;
	price: string;
	rating: number;
	image: string;
}

export interface SharedFileItem {
	id: string;
	fileName: string;
	fileSize: string;
	type: 'pdf' | 'image' | 'doc';
}

export interface ChatConversation {
	id: string;
	name: string;
	avatar?: string;
	icon?: string;
	isOnline?: boolean;
	role: 'partner' | 'traveler' | 'global';
	roleBadge?: string;
	subtitle?: string;
	lastMessage: string;
	lastTime: string;
	unreadCount?: number;
	verified?: boolean;
	location?: string;
	bio?: string;
	messages: ChatMessage[];
	properties?: PropertyItem[];
	sharedFiles?: SharedFileItem[];
}
