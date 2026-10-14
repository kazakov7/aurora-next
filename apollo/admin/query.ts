import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberEmail
				memberNick
				memberFullName
				memberImage
				memberDesc
				memberAddress
				memberFollowers
				memberFollowings
				memberLikes
				memberViews
				memberComments
				memberProperties
				memberTours
				memberArticles
				memberPoints
				memberRank
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_APPLICATIONS_BY_ADMIN = gql`
	query GetAgentApplications($input: AgentApplicationsInquiry!) {
		getAgentApplications(input: $input) {
			list {
				_id
				memberId
				agentType
				companyName
				businessNumber
				companyAddress
				companyDesc
				verificationStatus
				rejectionReason
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberEmail
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const GET_ALL_PROPERTIES_BY_ADMIN = gql`
	query GetAllPropertiesByAdmin($input: AllPropertiesInquiry!) {
		getAllPropertiesByAdmin(input: $input) {
			list {
				_id
				memberId
				destinationId
				propertyType
				propertyName
				propertyDesc
				propertyStatus
				propertyCity
				propertyAddress
				pricePerNight
				currency
				maxGuests
				bedrooms
				beds
				bathrooms
				propertyRating
				propertyReviews
				propertyComments
				propertyImages
				propertyViews
				propertyLikes
				propertyBookings
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberEmail
					memberPhone
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *          TOUR          *
 *************************/

export const GET_ALL_TOURS_BY_ADMIN = gql`
	query GetAllToursByAdmin($input: AllToursInquiry!) {
		getAllToursByAdmin(input: $input) {
			list {
				_id
				memberId
				destinationId
				tourName
				tourDesc
				tourStatus
				tourPrice
				tourCurrency
				tourStartDate
				tourEndDate
				tourCapacity
				tourReservedSeats
				tourImages
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *       DESTINATION      *
 *************************/

export const GET_ALL_DESTINATIONS_BY_ADMIN = gql`
	query GetAllDestinationsByAdmin($input: AdminDestinationsInquiry!) {
		getAllDestinationsByAdmin(input: $input) {
			list {
				_id
				destinationStatus
				destinationName
				destinationSlug
				destinationCountry
				latitude
				longitude
				destinationImages
				destinationDesc
				destinationViews
				destinationLikes
				destinationComments
				destinationReviews
				destinationRating
				destinationProperties
				destinationTours
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const GET_NOTICES_BY_ADMIN = gql`
	query GetNoticesByAdmin($input: NoticesInquiry!) {
		getNoticesByAdmin(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         BOOKING        *
 *************************/

export const GET_ALL_BOOKINGS_BY_ADMIN = gql`
	query GetAllBookingsByAdmin($input: BookingsInquiry!) {
		getAllBookingsByAdmin(input: $input) {
			list {
				_id
				memberId
				bookingCategory
				bookingStatus
				cancelledAt
				bookingRefId
				checkIn
				checkOut
				bookingGuests
				bookingTotalPrice
				bookingCurrency
				bookingNote
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberEmail
				}
				propertyData {
					_id
					propertyName
					propertyImages
				}
				tourData {
					_id
					tourName
					tourImages
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *     SUPPORT TICKET     *
 *************************/

export const GET_ALL_SUPPORT_TICKETS_BY_ADMIN = gql`
	query GetAllSupportTicketsByAdmin($input: SupportTicketsInquiry!) {
		getAllSupportTicketsByAdmin(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *    COMMENT & REVIEW    *
 *************************/

export const GET_ALL_COMMENTS_BY_ADMIN = gql`
	query GetAllCommentsByAdmin($input: AllCommentsInquiry!) {
		getAllCommentsByAdmin(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_DESTINATION_REVIEWS_BY_ADMIN = gql`
	query GetAllDestinationReviewsByAdmin($input: AllDestinationReviewsInquiry!) {
		getAllDestinationReviewsByAdmin(input: $input) {
			list {
				_id
				reviewStatus
				reviewRefId
				reviewRating
				reviewContent
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
