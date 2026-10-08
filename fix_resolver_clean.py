with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.resolver.ts', 'r') as f:
    content = f.read()

content = content.replace(
"""	@UseGuards(AuthGuard)
	@Query(() => Agents)
	
	@Query(() => Agent, { nullable: true })
	public async getMemberAgent(@Args('memberId') memberId: string): Promise<Agent> {
		return this.agentService.getMemberAgent(memberId);
	}

	public async getMyAgentApplications""",
"""	@Query(() => Agent, { nullable: true })
	public async getMemberAgent(@Args('memberId') memberId: string): Promise<Agent> {
		return this.agentService.getMemberAgent(memberId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Agents)
	public async getMyAgentApplications"""
)

with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.resolver.ts', 'w') as f:
    f.write(content)
