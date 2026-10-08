import decodeJWT from 'jwt-decode';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { DEFAULT_USER_AVATAR } from '../config';
import { useRouter } from 'next/router';



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
			memberAuthType: claims.memberAuthType ?? '',

			memberPhone: claims.memberPhone ?? '',
			memberEmail: claims.memberEmail ?? '',
			memberNick: claims.memberNick ?? '',
			memberFullName: claims.memberFullName ?? '',
			memberImage: claims.memberImage || DEFAULT_USER_AVATAR,
			memberAddress: claims.memberAddress ?? '',
			memberDesc: claims.memberDesc ?? '',

			memberFollowers: claims.memberFollowers ?? 0,
			memberFollowings: claims.memberFollowings ?? 0,
			memberLikes: claims.memberLikes ?? 0,
			memberViews: claims.memberViews ?? 0,
			memberComments: claims.memberComments ?? 0,

			memberProperties: claims.memberProperties ?? 0,
			memberTours: claims.memberTours ?? 0,
			memberArticles: claims.memberArticles ?? 0,

			memberPoints: claims.memberPoints ?? 0,
			memberRank: claims.memberRank ?? 0,
		});

		return true;
	} catch (err) {
		console.warn('Invalid JWT token', err);
		return false;
	}
};
export const logOut = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('accessToken');
		localStorage.setItem('logout', Date.now().toString());

		window.location.href = '/';
	}
};
