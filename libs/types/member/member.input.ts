import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';

export interface MemberInput {
	memberNick: string;
	memberPassword: string;
	memberFullName?: string;
}

export interface LoginInput {
	memberNick: string;
	memberPassword: string;
}

export interface MemberUpdate {
	_id?: string;
	memberNick?: string;
	memberFullName?: string;
	memberPhone?: string;
	memberDesc?: string;
	memberImage?: string;
	memberAddress?: string;
}

export interface AdminUpdateMemberInput {
	_id: string;
	memberStatus?: MemberStatus;
	memberNick?: string;
	memberFullName?: string;
	memberEmail?: string;
	memberPhone?: string;
	memberDesc?: string;
	memberImage?: string;
	memberAddress?: string;
}

interface MISearch {
	memberStatus?: MemberStatus;
	memberType?: MemberType;
	memberAuthType?: MemberAuthType;
	text?: string;
}

export interface MembersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: MISearch;
}
