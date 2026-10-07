export const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';
export const REACT_APP_API_GRAPHQL_URL = process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
export const REACT_APP_API_WS = process.env.REACT_APP_API_WS || 'ws://127.0.0.1:3007';

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const getImageUrl = (imagePath?: string, fallback: string = ''): string => {
	if (!imagePath) return fallback;
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
	return `${REACT_APP_API_URL}/${imagePath}`;
};
