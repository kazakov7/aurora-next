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
	comment?: string;
}

export interface AgentInput {
	agentType: AgentType;
	companyName: string;
	businessNumber: string;
	companyAddress: string;
}
