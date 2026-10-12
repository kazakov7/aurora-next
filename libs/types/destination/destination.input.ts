import { DestinationStatus } from '../../enums/destination.enum';
import { Direction } from '../../enums/common.enum';

export interface DestinationSearch {
	destinationCountry?: string;
	/** Exact country names, e.g. every country of a continent **/
	destinationCountryList?: string[];
	text?: string;
}

export interface DestinationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: DestinationSearch;
}

export interface AdminDestinationSearch extends DestinationSearch {
	destinationStatus?: DestinationStatus;
}

export interface AdminDestinationsInquiry extends Omit<DestinationsInquiry, 'search'> {
	search: AdminDestinationSearch;
}

export interface DestinationInput {
	destinationName: string;
	destinationCountry: string;
	destinationImages: string[];
	latitude?: number;
	longitude?: number;
	destinationDesc?: string;
}
