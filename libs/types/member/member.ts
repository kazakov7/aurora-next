import { MemberType, MemberStatus, MemberAuthType } from '../../enums/member.enum';
import { TotalCounter } from '../destination/destination';

export interface MeFollowed {
	followingId: string;
	followerId: string;
	myFollowing: boolean;
}

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone: string;
	memberEmail?: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberDesc?: string;
	memberAddress?: string;
	memberFollowers: number;
	memberFollowings: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberProperties: number;
	memberTours: number;
	memberArticles: number;
	memberPoints: number;
	memberRank: number;
	lastLoginAt?: Date;
	accessToken?: string;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meFollowed?: MeFollowed[];
}

export interface Members {
	list: Member[];
	metaCounter: TotalCounter[];
}
