import { gql } from '@apollo/client';

export const GET_OR_CREATE_DIRECT_CHAT = gql`
	mutation GetOrCreateDirectChat($memberTwoId: String!) {
		getOrCreateDirectChat(memberTwoId: $memberTwoId) {
			_id
			chatType
			memberOneId
			memberTwoId
			memberOneData {
				_id
				memberType
				memberNick
				memberFullName
				memberImage
			}
			memberTwoData {
				_id
				memberType
				memberNick
				memberFullName
				memberImage
			}
		}
	}
`;

export const MARK_CHAT_AS_READ = gql`
	mutation MarkChatAsRead($chatId: String!) {
		markChatAsRead(chatId: $chatId) {
			_id
			unreadCount
		}
	}
`;

export const DELETE_MY_CHAT = gql`
	mutation DeleteMyChat($chatId: String!) {
		deleteMyChat(chatId: $chatId)
	}
`;
