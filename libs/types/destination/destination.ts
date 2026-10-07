import { DestinationStatus } from '../../enums/destination.enum';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Destination {
	_id: string;
	destinationStatus: DestinationStatus;
	destinationName: string;
	destinationSlug: string;
	destinationCountry: string;
	latitude?: number;
	longitude?: number;
	destinationImages: string[];
	destinationDesc?: string;
	destinationViews: number;
	destinationLikes: number;
	destinationComments: number;
	destinationReviews: number;
	destinationRating: number;
	destinationProperties: number;
	destinationTours: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
}

export interface Destinations {
	list: Destination[];
	metaCounter: TotalCounter[];
}
