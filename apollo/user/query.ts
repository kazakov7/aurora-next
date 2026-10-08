import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/


export const GET_MEMBER = gql`
	query GetMember($input: String!) {
		getMember(input: $input) {
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
			lastLoginAt
			accessToken
			deletedAt
			createdAt
			updatedAt
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`;

export const GET_PROPERTY_HOST = gql`
	query GetPropertyHost($input: String!) {
		getMember(input: $input) {
			_id
			memberType
			memberNick
			memberFullName
			memberImage
			memberDesc
			memberAddress
			memberFollowers
			memberProperties
			memberTours
			memberArticles
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`;

export const GET_ALL_MEMBERS = gql`
	query GetAllMembers($input: MembersInquiry!) {
		getAllMembers(input: $input) {
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
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_HOME_EXPLORERS = gql`
	query GetHomeExplorers($input: MembersInquiry!) {
		getAllMembers(input: $input) {
			list {
				_id
				memberType
				memberNick
				memberFullName
				memberImage
				memberDesc
				memberFollowers
				memberProperties
				memberTours
				memberArticles
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
		}
	}
`;

export const GET_MY_AGENT_APPLICATIONS = gql`
	query GetMyAgentApplications($input: AgentApplicationsInquiry!) {
		getMyAgentApplications(input: $input) {
			list {
				_id
				memberId
				agentType
				status
				comment
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				followingData {
					_id
					memberType
					memberStatus
					memberNick
					memberFullName
					memberImage
					memberAddress
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				followerData {
					_id
					memberType
					memberStatus
					memberNick
					memberFullName
					memberImage
					memberAddress
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      DESTINATION       *
 *************************/

export const GET_DESTINATIONS = gql`
	query GetDestinations($input: DestinationsInquiry!) {
		getDestinations(input: $input) {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_DESTINATION = gql`
	query GetDestination($destinationId: String!) {
		getDestination(destinationId: $destinationId) {
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
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_DESTINATION_REVIEWS = gql`
	query GetDestinationReviews($destinationId: String!, $input: DestinationReviewsInquiry!) {
		getDestinationReviews(destinationId: $destinationId, input: $input) {
			list {
				_id
				memberId
				bookingId
				reviewGroup
				reviewRefId
				reviewRating
				reviewContent
				reviewStatus
				createdAt
				updatedAt
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

/**************************
 *        PROPERTY        *
 *************************/

export const GET_PROPERTIES = gql`
	query GetProperties($input: PropertiesInquiry!) {
		getProperties(input: $input) {
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
				amenities
				propertyImages
				propertyViews
				propertyLikes
				propertyBookings
				propertyRating
				propertyReviews
				propertyComments
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PROPERTY = gql`
	query GetProperty($propertyId: String!) {
		getProperty(propertyId: $propertyId) {
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
			amenities
			propertyImages
			propertyViews
			propertyLikes
			propertyBookings
			propertyRating
			propertyReviews
			propertyComments
			createdAt
			updatedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquery!) {
		getFavorites(input: $input) {
			list {
				_id
				propertyType
				propertyName
				propertyDesc
				propertyCity
				propertyAddress
				pricePerNight
				currency
				propertyImages
				propertyViews
				propertyLikes
				propertyRating
				propertyReviews
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquery!) {
		getVisited(input: $input) {
			list {
				_id
				propertyType
				propertyName
				propertyDesc
				propertyCity
				propertyAddress
				pricePerNight
				currency
				propertyImages
				propertyViews
				propertyLikes
				propertyRating
				propertyReviews
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PROPERTIES = gql`
	query GetAgentProperties($input: AgentPropertiesInquiry!) {
		getAgentProperties(input: $input) {
			list {
				_id
				propertyType
				propertyName
				propertyCity
				propertyAddress
				pricePerNight
				currency
				propertyStatus
				propertyImages
				propertyViews
				propertyLikes
				propertyBookings
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
 *          TOUR          *
 *************************/

export const GET_TOURS = gql`
	query GetTours($input: ToursInquiry!) {
		getTours(input: $input) {
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
				tourDepartureCountry
				tourDepartureCity
				tourDeparturePlace
				tourDestinationCity
				tourImages
				tourAdditionalInfo
				tourViews
				tourLikes
				tourComments
				tourRating
				tourReviews
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_TOUR = gql`
	query GetTour($tourId: String!) {
		getTour(tourId: $tourId) {
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
			tourDepartureCountry
			tourDepartureCity
			tourDeparturePlace
			tourDestinationCity
			tourImages
			tourAdditionalInfo
			tourViews
			tourLikes
			tourComments
			tourRating
			tourReviews
			createdAt
			updatedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_FAVORITE_TOURS = gql`
	query GetFavoriteTours($input: OrdinaryTourInquiry!) {
		getFavoriteTours(input: $input) {
			list {
				_id
				tourName
				tourDesc
				tourPrice
				tourCurrency
				tourImages
				tourStartDate
				tourEndDate
				tourDepartureCity
				tourDestinationCity
				tourRating
				tourReviews
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED_TOURS = gql`
	query GetVisitedTours($input: OrdinaryTourInquiry!) {
		getVisitedTours(input: $input) {
			list {
				_id
				tourName
				tourDesc
				tourPrice
				tourCurrency
				tourImages
				tourStartDate
				tourEndDate
				tourDepartureCity
				tourDestinationCity
				tourRating
				tourReviews
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_TOURS = gql`
	query GetAgentTours($input: AgentToursInquiry!) {
		getAgentTours(input: $input) {
			list {
				_id
				tourName
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
 *        BOOKING         *
 *************************/

export const GET_MY_BOOKINGS = gql`
	query GetMyBookings($input: BookingsInquiry!) {
		getMyBookings(input: $input) {
			list {
				_id
				memberId
				bookingCategory
				bookingStatus
				bookingRefId
				checkIn
				checkOut
				bookingGuests
				bookingTotalPrice
				bookingCurrency
				bookingNote
				createdAt
				updatedAt
				propertyData {
					_id
					propertyName
					propertyImages
					propertyCity
					propertyAddress
					pricePerNight
					currency
					propertyRating
				}
				tourData {
					_id
					tourName
					tourImages
					tourPrice
					tourCurrency
					tourDepartureCity
					tourDestinationCity
					tourRating
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PROPERTY_BOOKINGS = gql`
	query GetAgentPropertyBookings($input: BookingsInquiry!) {
		getAgentPropertyBookings(input: $input) {
			list {
				_id
				memberId
				bookingCategory
				bookingStatus
				bookingRefId
				checkIn
				checkOut
				bookingGuests
				bookingTotalPrice
				bookingCurrency
				createdAt
				memberData {
					_id
					memberNick
					memberPhone
					memberFullName
				}
				propertyData {
					_id
					propertyName
					propertyCity
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_TOUR_BOOKINGS = gql`
	query GetMyTourBookings($input: BookingsInquiry!) {
		getMyTourBookings(input: $input) {
			list {
				_id
				memberId
				bookingCategory
				bookingStatus
				bookingRefId
				checkIn
				checkOut
				bookingGuests
				bookingTotalPrice
				bookingCurrency
				createdAt
				tourData {
					_id
					tourName
					tourImages
					tourPrice
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_TOUR_BOOKINGS = gql`
	query GetAgentTourBookings($input: BookingsInquiry!) {
		getAgentTourBookings(input: $input) {
			list {
				_id
				memberId
				bookingCategory
				bookingStatus
				bookingRefId
				checkIn
				checkOut
				bookingGuests
				bookingTotalPrice
				bookingCurrency
				createdAt
				memberData {
					_id
					memberNick
					memberPhone
					memberFullName
				}
				tourData {
					_id
					tourName
				}
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

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
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
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($articleId: String!) {
		getBoardArticle(articleId: $articleId) {
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
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
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

/**************************
 *      NOTIFICATION      *
 *************************/

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				receiverId
				authorId
				notificationType
				notificationStatus
				notificationGroup
				notificationRefId
				notificationTitle
				notificationDesc
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
	query GetUnreadNotificationCount {
		getUnreadNotificationCount
	}
`;

/**************************
 *          CHAT          *
 *************************/

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
				createdAt
				updatedAt
				memberOneData {
					_id
					memberNick
					memberImage
				}
				memberTwoData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_GLOBAL_CHAT = gql`
	query GetGlobalChat {
		getGlobalChat {
			_id
			chatType
			createdAt
			updatedAt
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
					memberImage
				}
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

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
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
 *     TRAVEL HISTORY     *
 *************************/

export const GET_MY_TRAVEL_HISTORIES = gql`
	query GetMyTravelHistories($input: TravelHistoriesInquiry!) {
		getMyTravelHistories(input: $input) {
			list {
				_id
				memberId
				bookingId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberEmail
				memberDesc
				memberAddress
				memberFollowers
				memberFollowings
				memberArticles
				memberPoints
				memberLikes
				memberViews
				memberComments
				memberProperties
				memberTours
				memberRank
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;
