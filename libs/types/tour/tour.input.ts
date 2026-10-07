import { TourStatus } from '../../enums/tour.enum';
import { Direction } from '../../enums/common.enum';

export interface TourPriceRange {
	start: number;
	end: number;
}

export interface TourStartDateRange {
	start: string;
	end: string;
}

export interface TourSearch {
	memberId?: string;
	destinationId?: string;
	tourDepartureCity?: string;
	tourDestinationCity?: string;
	tourStartDateRange?: TourStartDateRange;
	tourPriceRange?: TourPriceRange;
	minAvailableSeats?: number;
	text?: string;
}

export interface ToursInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: TourSearch;
}

export interface AgentToursInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		tourStatus?: TourStatus;
	};
}

export interface AllToursInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		tourStatus?: TourStatus;
	};
}

export interface TourInput {
	destinationId?: string;
	tourName: string;
	tourDesc?: string;
	tourPrice: number;
	tourCurrency?: string;
	tourStartDate: Date;
	tourEndDate: Date;
	tourCapacity: number;
	tourDepartureCountry?: string;
	tourDepartureCity?: string;
	tourDeparturePlace?: string;
	tourDestinationCity?: string;
	tourImages: string[];
	tourAdditionalInfo?: string[];
}
