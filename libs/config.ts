export const REACT_APP_API_URL = process.env.NEXT_PUBLIC_AURORA_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3007';
export const REACT_APP_API_GRAPHQL_URL = process.env.NEXT_PUBLIC_AURORA_GRAPHQL_URL || process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
export const REACT_APP_API_WS = process.env.NEXT_PUBLIC_AURORA_SOCKET_URL || process.env.REACT_APP_API_WS || 'ws://127.0.0.1:3007';
/** Socket.IO chat namespace URL; accepts http(s)/ws(s) bases with or without the /chat suffix **/
export const getChatSocketUrl = (): string => {
	const baseUrl = (process.env.NEXT_PUBLIC_AURORA_SOCKET_URL || process.env.NEXT_PUBLIC_API_SOCKET_URL || REACT_APP_API_URL).replace(/\/$/, '');
	return baseUrl.endsWith('/chat') ? baseUrl : `${baseUrl}/chat`;
};
/** Canonical amenity values (match the majority of stored listing data); shared by filters and agent forms **/
export const PROPERTY_AMENITY_OPTIONS = [
	'WiFi',
	'Air Conditioning',
	'Parking',
	'Heating',
	'Breakfast',
	'Elevator',
	'Kitchen',
	'Washing Machine',
	'Ocean View',
	'Gym',
	'Pool',
	'Room Service',
	'Luggage Storage',
	'TV',
	'Private Garden',
];

/** Platform-wide USD price filter bounds **/
export const PLATFORM_CURRENCY = 'USD';
export const PRICE_FILTER_MIN = 50;
export const PRICE_FILTER_MAX = 1000;
export const PRICE_FILTER_STEP = 10;

export const DEFAULT_USER_AVATAR = '/img/profile/default-user.png';
export const DEFAULT_PROPERTY_IMAGE = '/img/banner/hero-hotels.jpg';
export const DEFAULT_TOUR_IMAGE = '/img/banner/hero-tour.jpg';
export const DEFAULT_DESTINATION_IMAGE = '/img/banner/hero_traveler.jpg';
export const DEFAULT_ARTICLE_IMAGE = '/img/banner/hero_traveler.jpg';

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const getImageUrl = (imagePath?: string, fallback: string = ''): string => {
	if (!imagePath) return fallback;
	if (imagePath.startsWith('/')) return imagePath;
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
	return `${REACT_APP_API_URL}/${imagePath}`;
};
