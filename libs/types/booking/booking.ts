import { BookingCategory, BookingStatus } from '../../enums/booking.enum';
import { Member } from '../member/member';
import { Property } from '../property/property';
import { Tour } from '../tour/tour';
import { TotalCounter } from '../destination/destination';

export interface Booking {
	_id: string;
	memberId: string;
	bookingCategory: BookingCategory;
	bookingStatus: BookingStatus;
	bookingRefId: string;
	checkIn?: Date;
	checkOut?: Date;
	bookingGuests: number;
	bookingTotalPrice: number;
	bookingCurrency: string;
	bookingNote?: string;
	cancelledAt?: Date;
	expiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
	propertyData?: Property;
	tourData?: Tour;
}

export interface Bookings {
	list: Booking[];
	metaCounter: TotalCounter[];
}
