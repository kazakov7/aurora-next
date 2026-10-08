const fs = require('fs');

let code = fs.readFileSync('libs/components/member/MemberSidebar.tsx', 'utf-8');

const targetStr = `        <button
          type="button"
          className={\`nav-tab-btn \${activeTab === "products" ? "active" : ""}\`}
          onClick={() => onTabChange("products")}
        >
          <div className="tab-left">
            <span className="material-symbols-outlined">person_add</span>
            <span>Hotels</span>
          </div>
          <span className="tab-badge">{formatCount(followingCount)}</span>
        </button>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, "");
    fs.writeFileSync('libs/components/member/MemberSidebar.tsx', code);
    console.log("Fixed MemberSidebar duplicate tab");
} else {
    console.log("Could not find string");
}
