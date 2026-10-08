with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.resolver.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "@Query(() => Agent)",
    "@Query(() => Agent, { nullable: true })"
)

with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.resolver.ts', 'w') as f:
    f.write(content)
