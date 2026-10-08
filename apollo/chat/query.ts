import { gql } from '@apollo/client';

export const GET_MY_CHATS = gql`
	query GetMyChats($input: ChatsInquiry!) {
		getMyChats(input: $input) {
			list {
				_id
				chatType
				memberOneId
				memberTwoId
				lastMessage
				lastMessageAt
				unreadCount
				memberOneData {
					_id
					memberType
					memberNick
					memberFullName
					memberImage
					memberDesc
					memberAddress
				}
				memberTwoData {
					_id
					memberType
					memberNick
					memberFullName
					memberImage
					memberDesc
					memberAddress
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MESSAGES = gql`
	query GetMessages($input: MessagesCursorInquiry!) {
		getMessages(input: $input) {
			list {
				_id
				chatId
				senderId
				messageType
				messageContent
				clientMessageId
				createdAt
				updatedAt
				senderData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			nextCursor
		}
	}
`;
