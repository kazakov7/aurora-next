import decodeJWT from 'jwt-decode';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';

export function getJwtToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
	return '';
}

export function setJwtToken(token: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('accessToken', token);
		localStorage.setItem('login', Date.now().toString());
	}
}

export const updateUserInfo = (jwtToken: string) => {
	if (!jwtToken) return false;

	try {
		const claims = decodeJWT<CustomJwtPayload>(jwtToken);
		userVar({
			_id: claims._id ?? '',
			memberType: claims.memberType ?? '',
			memberStatus: claims.memberStatus ?? '',
			memberAuthType: claims.memberAuthType,
			memberPhone: claims.memberPhone ?? '',
			memberNick: claims.memberNick ?? '',
			memberFullName: claims.memberFullName ?? '',
			memberImage: claims.memberImage || '/img/profile/defaultUser.svg',
			memberAddress: claims.memberAddress ?? '',
			memberDesc: claims.memberDesc ?? '',
		});
	} catch (err) {
		console.warn('Invalid JWT token', err);
	}
};

export const logOut = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('accessToken');
		localStorage.setItem('logout', Date.now().toString());
	}
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
	});
	if (typeof window !== 'undefined') {
		window.location.reload();
	}
};
