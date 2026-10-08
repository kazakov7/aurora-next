import re

# 1. Update agent.service.ts
with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.service.ts', 'r') as f:
    service_content = f.read()

service_addition = """
	public async getMemberAgent(memberId: string): Promise<Agent> {
		const { shapeIntoMongoObjectId } = require('../../libs/config');
		const result = await this.agentModel
			.findOne({ memberId: shapeIntoMongoObjectId(memberId), verificationStatus: AgentVerificationStatus.APPROVED })
			.exec();
		if (!result) throw new BadRequestException('Approved agent not found for member');
		return result as unknown as Agent;
	}
"""
service_content = service_content.replace(
    'public async getMyAgentApplications',
    service_addition + '\n\tpublic async getMyAgentApplications'
)

with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.service.ts', 'w') as f:
    f.write(service_content)

# 2. Update agent.resolver.ts
with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.resolver.ts', 'r') as f:
    resolver_content = f.read()

resolver_addition = """
	@Query(() => Agent)
	public async getMemberAgent(@Args('memberId') memberId: string): Promise<Agent> {
		return this.agentService.getMemberAgent(memberId);
	}
"""
resolver_content = resolver_content.replace(
    'public async getMyAgentApplications',
    resolver_addition + '\n\tpublic async getMyAgentApplications'
)

with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.resolver.ts', 'w') as f:
    f.write(resolver_content)

