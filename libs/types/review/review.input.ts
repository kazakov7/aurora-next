import { ReviewGroup, ReviewStatus } from '../../enums/review.enum';

export interface RatingInput {
	reviewGroup: ReviewGroup;
	reviewRefId: string;
	reviewRating: number;
}

export interface AllDestinationReviewsSearch {
	reviewStatus?: ReviewStatus;
	text?: string;
}

export interface AllDestinationReviewsInquiry {
	page: number;
	limit: number;
	search: AllDestinationReviewsSearch;
}
