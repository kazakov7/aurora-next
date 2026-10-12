import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: AdminUpdateMemberInput!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberPhone
			memberEmail
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			updatedAt
		}
	}
`;

export const APPROVE_AGENT_APPLICATION = gql`
	mutation ApproveAgentApplication($input: String!) {
		approveAgentApplication(input: $input) {
			_id
			memberId
			agentType
			verificationStatus
			updatedAt
		}
	}
`;

export const REJECT_AGENT_APPLICATION = gql`
	mutation RejectAgentApplication($input: RejectAgentApplicationInput!) {
		rejectAgentApplication(input: $input) {
			_id
			memberId
			agentType
			verificationStatus
			rejectionReason
			updatedAt
		}
	}
`;

export const REVOKE_AGENT_BY_ADMIN = gql`
	mutation RevokeAgentByAdmin($input: RevokeAgentInput!) {
		revokeAgentByAdmin(input: $input) {
			_id
			memberId
			agentType
			verificationStatus
			rejectionReason
			updatedAt
		}
	}
`;

/**************************
 *      DESTINATION       *
 *************************/

export const UPDATE_DESTINATION_BY_ADMIN = gql`
	mutation UpdateDestinationByAdmin($input: DestinationUpdate!) {
		updateDestinationByAdmin(input: $input) {
			_id
			destinationStatus
			destinationName
			destinationSlug
			destinationCountry
			latitude
			longitude
			destinationImages
			destinationDesc
			updatedAt
		}
	}
`;

export const REMOVE_DESTINATION_BY_ADMIN = gql`
	mutation RemoveDestinationByAdmin($destinationId: String!) {
		removeDestinationByAdmin(destinationId: $destinationId)
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const UPDATE_PROPERTY_STATUS_BY_ADMIN = gql`
	mutation UpdatePropertyStatusByAdmin($input: UpdatePropertyStatusInput!) {
		updatePropertyStatusByAdmin(input: $input) {
			_id
			propertyStatus
			updatedAt
		}
	}
`;

export const REMOVE_PROPERTY_BY_ADMIN = gql`
	mutation RemovePropertyByAdmin($propertyId: String!) {
		removePropertyByAdmin(propertyId: $propertyId) {
			_id
			propertyStatus
		}
	}
`;

/**************************
 *          TOUR          *
 *************************/

export const UPDATE_TOUR_STATUS_BY_ADMIN = gql`
	mutation UpdateTourStatusByAdmin($input: UpdateTourStatusInput!) {
		updateTourStatusByAdmin(input: $input) {
			_id
			tourStatus
			updatedAt
		}
	}
`;

export const REMOVE_TOUR_BY_ADMIN = gql`
	mutation RemoveTourByAdmin($tourId: String!) {
		removeTourByAdmin(tourId: $tourId) {
			_id
			tourStatus
		}
	}
`;

/**************************
 *      DESTINATION REVIEW*
 *************************/

export const REMOVE_DESTINATION_REVIEW_BY_ADMIN = gql`
	mutation RemoveDestinationReviewByAdmin($reviewId: String!) {
		removeDestinationReviewByAdmin(reviewId: $reviewId) {
			_id
			reviewStatus
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($commentId: String!) {
		removeCommentByAdmin(commentId: $commentId) {
			_id
			commentStatus
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($articleId: String!) {
		removeBoardArticleByAdmin(articleId: $articleId) {
			_id
			articleStatus
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const UPDATE_NOTICE_BY_ADMIN = gql`
	mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
		updateNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			updatedAt
		}
	}
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
	mutation RemoveNoticeByAdmin($noticeId: String!) {
		removeNoticeByAdmin(noticeId: $noticeId)
	}
`;

/**************************
 *     SUPPORT TICKET     *
 *************************/

export const UPDATE_SUPPORT_TICKET_BY_ADMIN = gql`
	mutation UpdateSupportTicketByAdmin($input: SupportTicketUpdate!) {
		updateSupportTicketByAdmin(input: $input) {
			_id
			ticketCategory
			ticketStatus
			ticketName
			ticketEmail
			ticketSubject
			ticketMessage
			ticketAttachment
			ticketReply
			repliedAt
			memberId
			createdAt
			updatedAt
		}
	}
`;
