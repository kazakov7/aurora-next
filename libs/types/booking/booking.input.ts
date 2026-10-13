import { BookingCategory, BookingStatus } from '../../enums/booking.enum';

export interface BISearch {
	bookingStatusList?: BookingStatus[];
	bookingCategory?: BookingCategory;
}

export interface BookingsInquiry {
	page: number;
	limit: number;
	search?: BISearch;
}

export interface CancelBookingByAdminInput {
	_id: string;
	cancelReason: string;
}
