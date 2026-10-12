import { AgentType, AgentVerificationStatus } from '../../enums/agent.enum';
import { Direction } from '../../enums/common.enum';

interface AgentSearch {
	agentType?: AgentType;
	verificationStatus?: AgentVerificationStatus;
}

export interface AgentApplicationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: AgentSearch;
}

export interface RejectAgentApplicationInput {
	_id: string;
	rejectionReason: string;
}

export interface RevokeAgentInput {
	_id: string;
	revokeReason: string;
}

export interface AgentInput {
	agentType: AgentType;
	companyName: string;
	businessNumber: string;
	companyAddress: string;
	companyDesc?: string;
}
