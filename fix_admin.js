const fs = require('fs');

let code = fs.readFileSync('pages/_admin/agent-verification/index.tsx', 'utf-8');

const targetStr = `      const input: RejectAgentApplicationInput = {
        _id: id,
        comment: reason || "Application rejected",
      };`;

const newStr = `      const input: RejectAgentApplicationInput = {
        _id: id,
        rejectionReason: reason || "Application rejected",
      };`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('pages/_admin/agent-verification/index.tsx', code);
    console.log("Fixed RejectAgentApplicationInput in admin");
} else {
    // If exact spacing is off:
    code = code.replace(/comment:\s*reason\s*\|\|\s*"Application rejected",/g, 'rejectionReason: reason || "Application rejected",');
    fs.writeFileSync('pages/_admin/agent-verification/index.tsx', code);
    console.log("Fixed using regex");
}
