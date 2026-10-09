import { AgentType } from '../../enums/agent.enum';
import { TotalCounter } from '../destination/destination';
import { Member } from '../member/member';

export interface RankingInquiry {
	destinationId?: string;
	limit?: number;
}

export interface TopAgentsInquiry {
	agentType: AgentType;
	limit?: number;
}

export interface RankingAgent {
	_id: string;
	memberId: string;
	agentType: AgentType;
	companyName: string;
	companyDesc?: string;
	memberData?: Member;
}

export interface RankingList<T> {
	list: T[];
	metaCounter?: TotalCounter[];
}
