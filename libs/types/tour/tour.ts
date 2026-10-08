import { TourStatus } from '../../enums/tour.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../destination/destination';

export interface Tour {
	_id: string;
	memberId: string;
	destinationId?: string;
	tourName: string;
	tourDesc?: string;
	tourStatus: TourStatus;
	tourPrice: number;
	tourCurrency: string;
	tourStartDate: Date | string;
	tourEndDate: Date | string;
	tourCapacity: number;
	tourReservedSeats?: number;
	tourDepartureCountry?: string;
	tourDepartureCity?: string;
	tourDeparturePlace?: string;
	tourDestinationCity?: string;
	tourImages: string[];
	tourAdditionalInfo?: string;
	tourViews: number;
	tourLikes: number;
	tourComments?: number;
	tourRating?: number;
	tourReviews?: number;
	deletedAt?: Date | string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface Tours {
	list: Tour[];
	metaCounter: TotalCounter[];
}
