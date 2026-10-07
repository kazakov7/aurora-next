import { DestinationStatus } from '../../enums/destination.enum';
import { Direction } from '../../enums/common.enum';

export interface DestinationSearch {
	status?: DestinationStatus;
	country?: string;
	text?: string;
}

export interface DestinationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: DestinationSearch;
}

export interface DestinationInput {
	destinationName: string;
	destinationSlug: string;
	destinationCountry: string;
	destinationImages: string[];
	latitude?: number;
	longitude?: number;
	destinationDesc?: string;
}
