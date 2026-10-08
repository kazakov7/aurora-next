const fs = require('fs');
let code = fs.readFileSync('apollo/user/mutation.ts', 'utf-8');

const oldMutation = `export const SUBMIT_AGENT_APPLICATION = gql\`
	mutation SubmitAgentApplication($input: AgentInput!) {
		submitAgentApplication(input: $input) {
			_id
			memberId
			agentType
			companyName
			businessNumber
			companyAddress
			verificationStatus
			rejectionReason
			createdAt
			updatedAt
		}
	}
\`;`;

const newMutation = `export const SUBMIT_AGENT_APPLICATION = gql\`
	mutation SubmitAgentApplication($input: AgentInput!) {
		submitAgentApplication(input: $input) {
			_id
			memberId
			agentType
			verificationStatus
			createdAt
			updatedAt
		}
	}
\`;`;

if (code.includes(oldMutation)) {
    code = code.replace(oldMutation, newMutation);
    fs.writeFileSync('apollo/user/mutation.ts', code);
    console.log("Fixed SUBMIT_AGENT_APPLICATION mutation");
} else {
    console.log("Could not find the exact mutation string");
}
