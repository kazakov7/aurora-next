import { PropertyType, PropertyStatus } from '../../enums/property.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../destination/destination';

export interface Property {
	_id: string;
	memberId: string;
	destinationId?: string;
	propertyType: PropertyType;
	propertyName: string;
	propertyDesc?: string;
	propertyStatus: PropertyStatus;
	propertyCity?: string;
	propertyAddress?: string;
	pricePerNight: number;
	currency: string;
	maxGuests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	amenities: string[];
	propertyImages: string[];
	propertyViews: number;
	propertyLikes: number;
	propertyBookings: number;
	propertyRating: number;
	propertyReviews: number;
	propertyComments: number;
	deletedAt?: Date;
	createdAt: Date | string;
	updatedAt: Date | string;
	accessToken?: string;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface Properties {
	list: Property[];
	metaCounter: TotalCounter[];
}
