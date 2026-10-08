const fs = require('fs');
let code = fs.readFileSync('apollo/user/mutation.ts', 'utf-8');

const oldMutation = `export const SUBMIT_AGENT_APPLICATION = gql\`
	mutation SubmitAgentApplication($input: AgentInput!) {
		submitAgentApplication(input: $input) {
			_id
			memberId
			agentType
			status
			comment
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

if (code.includes(oldMutation)) {
    code = code.replace(oldMutation, newMutation);
    fs.writeFileSync('apollo/user/mutation.ts', code);
    console.log("Fixed SUBMIT_AGENT_APPLICATION mutation");
} else {
    // maybe spacing is different, let's just do a string replace on status and comment
    let partialCode = code.replace(/status\s+comment\s+createdAt/g, "verificationStatus\n\t\trejectionReason\n\t\tcreatedAt");
    if (partialCode !== code) {
        fs.writeFileSync('apollo/user/mutation.ts', partialCode);
        console.log("Fixed SUBMIT_AGENT_APPLICATION mutation via partial replace");
    } else {
        console.log("Could not fix mutation");
    }
}
