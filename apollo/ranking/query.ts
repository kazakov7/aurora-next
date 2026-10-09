import { gql } from '@apollo/client';

const DESTINATION_RANKING_FIELDS = `
	_id
	destinationStatus
	destinationName
	destinationSlug
	destinationCountry
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
`;

const PROPERTY_RANKING_FIELDS = `
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
	
	meLiked { memberId likeRefId myFavorite }
`;

const TOUR_RANKING_FIELDS = `
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
	
	meLiked { memberId likeRefId myFavorite }
`;

const MEMBER_RANKING_FIELDS = `
	_id
	memberType
	memberStatus
	memberAuthType
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
	meFollowed { followingId followerId myFollowing }
`;

const META_COUNTER_FIELDS = `metaCounter { total }`;

export const GET_TRENDING_DESTINATIONS = gql`
	query GetTrendingDestinations($input: RankingInquiry) {
		getTrendingDestinations(input: $input) { list { ${DESTINATION_RANKING_FIELDS} } ${META_COUNTER_FIELDS} }
	}
`;

export const GET_POPULAR_DESTINATIONS_BY_BOOKINGS = gql`
	query GetPopularDestinationsByBookings($input: RankingInquiry) {
		getPopularDestinationsByBookings(input: $input) { list { ${DESTINATION_RANKING_FIELDS} } ${META_COUNTER_FIELDS} }
	}
`;

export const GET_TOP_PROPERTIES = gql`
	query GetTopProperties($input: RankingInquiry) {
		getTopProperties(input: $input) { list { ${PROPERTY_RANKING_FIELDS} } ${META_COUNTER_FIELDS} }
	}
`;

export const GET_TOP_TOURS = gql`
	query GetTopTours($input: RankingInquiry) {
		getTopTours(input: $input) { list { ${TOUR_RANKING_FIELDS} } ${META_COUNTER_FIELDS} }
	}
`;

export const GET_TOP_TRAVELERS = gql`
	query GetTopTravelers($input: RankingInquiry) {
		getTopTravelers(input: $input) { list { ${MEMBER_RANKING_FIELDS} } ${META_COUNTER_FIELDS} }
	}
`;

export const GET_TOP_AGENTS = gql`
	query GetTopAgents($input: TopAgentsInquiry!) {
		getTopAgents(input: $input) {
			list {
				_id
				memberId
				agentType
				companyName
				companyDesc
				memberData { ${MEMBER_RANKING_FIELDS} }
			}
			${META_COUNTER_FIELDS}
		}
	}
`;
