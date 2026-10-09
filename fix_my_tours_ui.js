const fs = require('fs');
let code = fs.readFileSync('libs/components/mypage/agent/MyTours.tsx', 'utf-8');

code = code.replace(
    /type="text"/g,
    `type="text"\n              disabled\n              title="Text search not supported by backend yet"`
);

fs.writeFileSync('libs/components/mypage/agent/MyTours.tsx', code);
console.log("Disabled unsupported filters in MyTours");
