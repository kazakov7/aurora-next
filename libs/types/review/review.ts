import { ReviewGroup, ReviewStatus } from '../../enums/review.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../destination/destination';

export interface Review {
	_id: string;
	memberId: string;
	bookingId?: string;
	reviewGroup: ReviewGroup;
	reviewRefId: string;
	reviewRating: number;
	reviewContent?: string;
	reviewStatus: ReviewStatus;
	memberData?: Member;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Reviews {
	list: Review[];
	metaCounter: TotalCounter[];
}
