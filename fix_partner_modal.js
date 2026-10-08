const fs = require('fs');
let code = fs.readFileSync('libs/components/mypage/PartnerModal.tsx', 'utf-8');

code = code.replace(
    /(application:\s*\{\s*)status(\s*:\s*AgentVerificationStatus\s*\})\s*=>\s*application\.status/g, 
    "$1verificationStatus$2 => application.verificationStatus"
);

fs.writeFileSync('libs/components/mypage/PartnerModal.tsx', code);
console.log("Fixed PartnerModal.tsx");
