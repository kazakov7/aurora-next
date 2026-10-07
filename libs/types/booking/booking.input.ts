import { BookingCategory, BookingStatus } from '../../enums/booking.enum';
import { Direction } from '../../enums/common.enum';

export interface BISearch {
	bookingCategory?: BookingCategory;
	bookingStatus?: BookingStatus;
	memberId?: string;
	text?: string;
}

export interface BookingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: BISearch;
}
