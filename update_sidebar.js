const fs = require('fs');

let code = fs.readFileSync('libs/components/mypage/MyProfileSidebar.tsx', 'utf-8');

// We need to fetch agentData for all users to check application status
code = code.replace(
    /skip: user\?\.memberType !== "AGENT",\s*variables: \{\s*input: \{\s*page: 1,\s*limit: 1,\s*search: \{ verificationStatus: AgentVerificationStatus\.APPROVED \},\s*\},\s*\}/,
    `variables: {
      input: {
        page: 1,
        limit: 1,
        search: {},
      },
    }`
);

// We need to determine the status of the latest application
const newLogic = `  const latestApplication = agentData?.getMyAgentApplications?.list?.[0];
  const myAgentType = latestApplication?.verificationStatus === AgentVerificationStatus.APPROVED ? latestApplication.agentType : null;
  const hasPending = latestApplication?.verificationStatus === AgentVerificationStatus.PENDING;
  const hasRejected = latestApplication?.verificationStatus === AgentVerificationStatus.REJECTED;
  const isApprovedAgent = user?.memberType === "AGENT" && myAgentType;

  // Partner tab label
  let partnerTabLabel = "Become a Partner";
  if (hasPending || hasRejected) {
    partnerTabLabel = "Agent Application";
  }`;

code = code.replace(
    /const myAgentType = agentData\?\.getMyAgentApplications\?\.list\?\.\[0\]\?\.agentType;/,
    newLogic
);

// Now we insert the partner tab just above settings? The prompt says "Place the new entry logically near My Page management/settings items"
// Settings is the last in navItems. I can add it to navItems dynamically.
const insertNavItems = `    {
      id: "settings",
      label: "Settings",
      icon: "tune",
    },
  ];
  
  if (user?.memberType === "USER" && !isApprovedAgent) {
      navItems.splice(navItems.length - 1, 0, {
          id: "partner",
          label: partnerTabLabel,
          icon: "storefront",
      });
  }`;

code = code.replace(
    /\{\s*id: "settings",\s*label: "Settings",\s*icon: "tune",\s*},\s*\];/,
    insertNavItems
);

// And below, where the Agent tabs are rendered:
// The code uses `isApprovedAgent` instead of `user?.memberType === "AGENT" && myAgentType` directly in JSX.
code = code.replace(
    /user\?\.memberType === "AGENT" && myAgentType/g,
    "isApprovedAgent"
);

fs.writeFileSync('libs/components/mypage/MyProfileSidebar.tsx', code);
console.log("Updated MyProfileSidebar.tsx");
