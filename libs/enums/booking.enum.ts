export enum BookingCategory {
	PROPERTY = 'PROPERTY',
	TOUR = 'TOUR',
}

export enum BookingStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export enum PaymentProvider {
	STRIPE = 'STRIPE',
}

export enum PaymentStatus {
	PENDING = 'PENDING',
	SUCCEEDED = 'SUCCEEDED',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
}
