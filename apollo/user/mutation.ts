import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberEmail
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			accessToken
			createdAt
			updatedAt
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberEmail
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			accessToken
			createdAt
			updatedAt
		}
	}
`;

export const GOOGLE_AUTH = gql`
	mutation GoogleAuth($input: GoogleAuthInput!) {
		googleAuth(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberEmail
			memberNick
			memberFullName
			memberImage
			accessToken
		}
	}
`;

export const KAKAO_AUTH = gql`
	mutation KakaoAuth($input: KakaoAuthInput!) {
		kakaoAuth(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberEmail
			memberNick
			memberFullName
			memberImage
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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

export const SUBMIT_AGENT_APPLICATION = gql`
	mutation SubmitAgentApplication($input: AgentInput!) {
		submitAgentApplication(input: $input) {
			_id
			memberId
			agentType
			verificationStatus
			createdAt
			updatedAt
		}
	}
`;

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
		}
	}
`;

/**************************
 *      DESTINATION       *
 *************************/

export const CREATE_DESTINATION = gql`
	mutation CreateDestination($input: DestinationInput!) {
		createDestination(input: $input) {
			_id
			destinationStatus
			destinationName
			destinationSlug
			destinationCountry
			latitude
			longitude
			destinationImages
			destinationDesc
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_DESTINATION = gql`
	mutation LikeTargetDestination($destinationId: String!) {
		likeTargetDestination(destinationId: $destinationId) {
			_id
			destinationLikes
		}
	}
`;

export const CREATE_DESTINATION_REVIEW = gql`
	mutation CreateDestinationReview($input: DestinationReviewInput!) {
		createDestinationReview(input: $input) {
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
		}
	}
`;

export const UPDATE_DESTINATION_REVIEW = gql`
	mutation UpdateDestinationReview($input: DestinationReviewUpdate!) {
		updateDestinationReview(input: $input) {
			_id
			reviewRating
			reviewContent
			updatedAt
		}
	}
`;

export const REMOVE_DESTINATION_REVIEW = gql`
	mutation RemoveDestinationReview($reviewId: String!) {
		removeDestinationReview(reviewId: $reviewId) {
			_id
			reviewStatus
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const CREATE_PROPERTY = gql`
	mutation CreateProperty($input: CreatePropertyInput!) {
		createProperty(input: $input) {
			_id
			propertyName
			propertyType
			propertyStatus
			propertyCity
			propertyAddress
			pricePerNight
			currency
			maxGuests
			bedrooms
			beds
			bathrooms
			propertyImages
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PROPERTY = gql`
	mutation UpdateProperty($input: UpdatePropertyInput!) {
		updateProperty(input: $input) {
			_id
			propertyName
			propertyType
			propertyStatus
			propertyCity
			pricePerNight
			propertyImages
			updatedAt
		}
	}
`;

export const LIKE_TARGET_PROPERTY = gql`
	mutation LikeTargetProperty($propertyId: String!) {
		likeTargetProperty(propertyId: $propertyId) {
			_id
			propertyLikes
		}
	}
`;

/**************************
 *          TOUR          *
 *************************/

export const CREATE_TOUR = gql`
	mutation CreateTour($input: TourInput!) {
		createTour(input: $input) {
			_id
			tourName
			tourStatus
			tourPrice
			tourCurrency
			tourStartDate
			tourEndDate
			tourCapacity
			tourImages
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_TOUR = gql`
	mutation UpdateTour($input: TourUpdateInput!) {
		updateTour(input: $input) {
			_id
			tourName
			tourStatus
			tourPrice
			tourStartDate
			tourEndDate
			updatedAt
		}
	}
`;

export const LIKE_TARGET_TOUR = gql`
	mutation LikeTargetTour($tourId: String!) {
		likeTargetTour(tourId: $tourId) {
			_id
			tourLikes
		}
	}
`;

/**************************
 *        BOOKING         *
 *************************/

export const CANCEL_BOOKING = gql`
	mutation CancelBooking($bookingId: String!) {
		cancelBooking(bookingId: $bookingId) {
			_id
			bookingStatus
			cancelledAt
		}
	}
`;

export const CANCEL_TOUR_BOOKING = gql`
	mutation CancelTourBooking($bookingId: String!) {
		cancelTourBooking(bookingId: $bookingId) {
			_id
			bookingStatus
			cancelledAt
		}
	}
`;

export const START_PROPERTY_PAYMENT = gql`
	mutation StartPropertyPayment($input: StartPropertyPaymentInput!) {
	startPropertyPayment(input: $input) {
			clientSecret
			payment {
				_id
				bookingId
				paymentStatus
			}
		}
	}
`;

export const START_TOUR_PAYMENT = gql`
	mutation StartTourPayment($input: StartTourPaymentInput!) {
	startTourPayment(input: $input) {
			clientSecret
			payment {
				_id
				bookingId
				paymentStatus
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleTitle
			articleContent
			articleImage
			updatedAt
		}
	}
`;

export const LIKE_TARGET_ARTICLE = gql`
	mutation LikeTargetArticle($input: String!) {
		likeTargetArticle(input: $input) {
			_id
			articleLikes
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentContent
			updatedAt
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const MARK_NOTIFICATION_AS_READ = gql`
	mutation MarkNotificationAsRead($input: MarkNotificationAsReadInput!) {
		markNotificationAsRead(input: $input) {
			_id
			notificationStatus
		}
	}
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
	mutation MarkAllNotificationsAsRead {
		markAllNotificationsAsRead
	}
`;

/**************************
 *          CHAT          *
 *************************/

export const GET_OR_CREATE_DIRECT_CHAT = gql`
	mutation GetOrCreateDirectChat($memberTwoId: String!) {
		getOrCreateDirectChat(memberTwoId: $memberTwoId) {
			_id
			chatType
			memberOneId
			memberTwoId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const CREATE_NOTICE = gql`
	mutation CreateNotice($input: NoticeInput!) {
		createNotice(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         UPLOAD         *
 *************************/

export const IMAGE_UPLOADER = gql`
	mutation ImageUploader($file: Upload!, $target: String) {
		imageUploader(file: $file, target: $target)
	}
`;

export const IMAGES_UPLOADER = gql`
	mutation ImagesUploader($files: [Upload!]!, $target: String) {
		imagesUploader(files: $files, target: $target)
	}
`;
