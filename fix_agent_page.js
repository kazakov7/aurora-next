const fs = require('fs');

let code = fs.readFileSync('libs/components/mypage/AgentApplicationPage.tsx', 'utf-8');

const targetStr = `{latestApp?.verificationStatus === AgentVerificationStatus.REJECTED && !isFormVisible && (`;

const newStr = `{latestApp?.verificationStatus === AgentVerificationStatus.APPROVED && !isFormVisible && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #dce2f7", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>{getStatusBadge(latestApp.verificationStatus)}</div>
          <h3 style={{ fontSize: "20px", color: "#141b2b", margin: 0 }}>You are an AURA Partner</h3>
          <p style={{ fontSize: "14px", color: "#3f4850", margin: 0 }}>Your application has been approved. If your sidebar has not updated, please refresh the page to access your Agent Workspace.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "8px", alignSelf: "flex-start", height: "40px", padding: "0 24px", background: "#006194", color: "#fff", borderRadius: "8px", fontWeight: 600, border: "none", cursor: "pointer" }}>
            Refresh Page
          </button>
        </div>
      )}

      {latestApp?.verificationStatus === AgentVerificationStatus.REJECTED && !isFormVisible && (`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('libs/components/mypage/AgentApplicationPage.tsx', code);
console.log("Fixed AgentApplicationPage.tsx");
