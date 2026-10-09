const fs = require('fs');
let code = fs.readFileSync('libs/components/mypage/agent/MyHotels.tsx', 'utf-8');

code = code.replace(
    /type="text"/g,
    `type="text"\n              disabled\n              title="Text search not supported by backend yet"`
);

code = code.replace(
    /onChange=\{\(e\) => setPropertyType\(e.target.value as PropertyType\)\}/g,
    `onChange={(e) => setPropertyType(e.target.value as PropertyType)}\n              disabled\n              title="Type filter not supported by backend yet"`
);

fs.writeFileSync('libs/components/mypage/agent/MyHotels.tsx', code);
console.log("Disabled unsupported filters in MyHotels");
