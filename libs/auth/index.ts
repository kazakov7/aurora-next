import decodeJWT from 'jwt-decode';
import { initialUser, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { DEFAULT_USER_AVATAR } from '../config';
import { Member } from '../types/member/member';

export const ACCESS_TOKEN_KEY = 'accessToken';

/** Backend messages (Messages enum) that mean the stored token is no longer accepted **/
export const AUTH_TOKEN_ERRORS = [
	'jwt expired',
	'invalid signature',
	'jwt malformed',
	'invalid token',
	'You are not authenticated, please login first!',
	'Your session has expired, please login again!',
	'Bearer token is not provided!',
];

export const isTokenExpired = (jwtToken: string): boolean => {
	try {
		const { exp } = decodeJWT<CustomJwtPayload>(jwtToken);
		return !!exp && exp * 1000 <= Date.now();
	} catch (err) {
		return true;
	}
};

export function getJwtToken(): string {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
		if (token && isTokenExpired(token)) {
			localStorage.removeItem(ACCESS_TOKEN_KEY);
			return '';
		}
		return token;
	}
	return '';
}

export function setJwtToken(token: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(ACCESS_TOKEN_KEY, token);
	}
}

export const updateUserInfo = (jwtToken: string) => {
	if (!jwtToken || isTokenExpired(jwtToken)) return false;

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

export const updateUserFromMember = (member: Member): void => {
	userVar({
		_id: member._id,
		memberType: member.memberType,
		memberStatus: member.memberStatus,
		memberAuthType: member.memberAuthType,
		memberPhone: member.memberPhone ?? '',
		memberEmail: member.memberEmail ?? '',
		memberNick: member.memberNick ?? '',
		memberFullName: member.memberFullName ?? '',
		memberImage: member.memberImage || DEFAULT_USER_AVATAR,
		memberAddress: member.memberAddress ?? '',
		memberDesc: member.memberDesc ?? '',
		memberFollowers: member.memberFollowers ?? 0,
		memberFollowings: member.memberFollowings ?? 0,
		memberLikes: member.memberLikes ?? 0,
		memberViews: member.memberViews ?? 0,
		memberComments: member.memberComments ?? 0,
		memberProperties: member.memberProperties ?? 0,
		memberTours: member.memberTours ?? 0,
		memberArticles: member.memberArticles ?? 0,
		memberPoints: member.memberPoints ?? 0,
		memberRank: member.memberRank ?? 0,
	});
};
export const clearAuthSession = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(ACCESS_TOKEN_KEY);
	}
	userVar({ ...initialUser });
};

export const logOut = (): void => {
	if (typeof window !== 'undefined') {
		clearAuthSession();
		window.location.href = '/';
	}
};
