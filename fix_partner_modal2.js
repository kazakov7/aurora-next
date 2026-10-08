const fs = require('fs');
let code = fs.readFileSync('libs/components/mypage/PartnerModal.tsx', 'utf-8');

const oldStr = `	const pendingApplication = data?.getMyAgentApplications?.list?.find(
		(application: { status: AgentVerificationStatus }) => application.status === AgentVerificationStatus.PENDING,
	);`;

const newStr = `	const pendingApplication = data?.getMyAgentApplications?.list?.find(
		(application: { verificationStatus: AgentVerificationStatus }) => application.verificationStatus === AgentVerificationStatus.PENDING,
	);`;

if (code.includes(oldStr)) {
    code = code.replace(oldStr, newStr);
    fs.writeFileSync('libs/components/mypage/PartnerModal.tsx', code);
    console.log("Fixed successfully.");
} else {
    console.log("Could not find the string.");
}
