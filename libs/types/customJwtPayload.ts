import { MemberAuthType, MemberStatus, MemberType } from "../enums/member.enum";

export interface CustomJwtPayload {
	_id: string;

	memberType: MemberType | '';
	memberStatus: MemberStatus | '';
	memberAuthType: MemberAuthType | '';

	memberPhone?: string;
	memberEmail?: string;
	memberNick?: string;
	memberFullName?: string;
	memberImage?: string;
	memberDesc?: string;
	memberAddress?: string;

	memberFollowers?: number;
	memberFollowings?: number;
	memberLikes?: number;
	memberViews?: number;
	memberComments?: number;
	memberProperties?: number;
	memberTours?: number;
	memberArticles?: number;
	memberPoints?: number;
	memberRank?: number;
	accessToken?: string

	iat?: number;
	exp?: number;
}