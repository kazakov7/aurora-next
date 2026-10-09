import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

export const themeVar = makeVar({});

export const initialUser: CustomJwtPayload = {
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',

	memberPhone: '',
	memberEmail: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberDesc: '',
	memberAddress: '',

	memberFollowers: 0,
	memberFollowings: 0,
	memberLikes: 0,
	memberViews: 0,
	memberComments: 0,
	memberProperties: 0,
	memberTours: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberRank: 0,
};

export const userVar = makeVar<CustomJwtPayload>(initialUser);

export const socketVar = makeVar<WebSocket | null>(null);
