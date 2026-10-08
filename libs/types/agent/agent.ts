import { AgentType, AgentVerificationStatus } from '../../enums/agent.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../destination/destination';

export interface Agent {
	_id: string;
	memberId: string;
	agentType: AgentType;
	companyName: string;
	businessNumber: string;
	companyAddress: string;
	companyDesc?: string;
	verificationStatus: AgentVerificationStatus;
	rejectionReason?: string;
	memberData?: Member;
	createdAt: Date;
	updatedAt: Date;
}

export interface Agents {
	list: Agent[];
	metaCounter: TotalCounter[];
}
