const fs = require('fs');
let content = fs.readFileSync('libs/components/mypage/MyProfileSidebar.tsx', 'utf8');
content = content.replace(/{[\s\n]*id: "history",[\s\n]*label: "Visited hotels",[\s\n]*icon: "explore",[\s\n]*trailingIcon: "chevron_right",[\s\n]*},[\s\n]*{[\s\n]*id: "visitedTours",[\s\n]*label: "Visited tours",[\s\n]*icon: "tour",[\s\n]*trailingIcon: "chevron_right",[\s\n]*label: "Visited hotels",[\s\n]*icon: "explore",[\s\n]*trailingIcon: "chevron_right",[\s\n]*},/g, 
`{
      id: "history",
      label: "Visited hotels",
      icon: "explore",
      trailingIcon: "chevron_right",
    },
    {
      id: "visitedTours",
      label: "Visited tours",
      icon: "map",
      trailingIcon: "chevron_right",
    },`);
fs.writeFileSync('libs/components/mypage/MyProfileSidebar.tsx', content);
