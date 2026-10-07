import { PropertyType, PropertyStatus } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

export interface PricePerNightRange {
	start?: number;
	end?: number;
}

export interface PropertySearch {
	memberId?: string;
	destinationId?: string[];
	propertyCityList?: string[];
	propertyTypeList?: PropertyType[];
	minGuests?: number;
	bedrooms?: number;
	beds?: number;
	amenities?: string[];
	pricePerNightRange?: PricePerNightRange;
	checkIn?: Date;
	checkOut?: Date;
	text?: string;
}

export interface PropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PropertySearch;
}

export interface AgentPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		propertyStatus?: PropertyStatus;
	};
}

export interface AllPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		propertyStatus?: PropertyStatus;
		propertyTypeList?: PropertyType[];
	};
}

export interface CreatePropertyInput {
	destinationId?: string;
	propertyType: PropertyType;
	propertyName: string;
	propertyDesc?: string;
	propertyCity: string;
	propertyAddress: string;
	pricePerNight: number;
	currency?: string;
	maxGuests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	amenities: string[];
	propertyImages: string[];
}
