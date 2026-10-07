import re

with open('libs/components/chat/chat.data.ts', 'r') as f:
    content = f.read()

# Fix the end
end_bad = """	{
];

		id: 'global',
		name: 'Global Chat',
		icon: 'public',
		role: 'global',
		roleBadge: 'Community Lounge',
		subtitle: 'Community Lounge',
		lastMessage: 'Aria: The mist over Kyoto this morning was surreal...',
		lastTime: '10:14 am',
		unreadCount: 12,
		messages: [
			{
				id: 'gm1',
				senderId: 'aria',
				senderName: 'Aria',
				senderAvatar: '',
				text: 'The mist over Kyoto this morning was surreal... recommend early walk near Arashiyama bamboo grove.',
				time: '10:14 am',
			},
		],
	},"""

# Replace it with correct format
content = content.replace(end_bad, "];")

# Now extract the global block and put it at the top
global_block = """	{
		id: 'global',
		name: 'Global Chat',
		icon: 'public',
		role: 'global',
		roleBadge: 'Community Lounge',
		subtitle: 'Community Lounge',
		lastMessage: 'Aria: The mist over Kyoto this morning was surreal...',
		lastTime: '10:14 am',
		unreadCount: 12,
		messages: [
			{
				id: 'gm1',
				senderId: 'aria',
				senderName: 'Aria',
				senderAvatar: '',
				text: 'The mist over Kyoto this morning was surreal... recommend early walk near Arashiyama bamboo grove.',
				time: '10:14 am',
			},
		],
	},
"""

content = content.replace("export const initialConversations: ChatConversation[] = [", "export const initialConversations: ChatConversation[] = [\n" + global_block)

with open('libs/components/chat/chat.data.ts', 'w') as f:
    f.write(content)

