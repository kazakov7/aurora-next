with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.service.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "if (!result) throw new BadRequestException('Approved agent not found for member');",
    ""
)

with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.service.ts', 'w') as f:
    f.write(content)
