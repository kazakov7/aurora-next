with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.service.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { lookupMember } from '../../libs/config';",
    "import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';"
)
content = content.replace(
    "const { shapeIntoMongoObjectId } = require('../../libs/config');",
    ""
)

with open('/Users/dadakhonovich/Desktop/AURORA/apps/aurora-api/src/components/agent/agent.service.ts', 'w') as f:
    f.write(content)
