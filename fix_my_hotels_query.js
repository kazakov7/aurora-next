const fs = require('fs');

let code = fs.readFileSync('libs/components/mypage/agent/MyHotels.tsx', 'utf-8');

// Replace the search payload in MyHotels
code = code.replace(
    /search: \{\s*\.\.\.\(search && \{ text: search \}\),\s*\.\.\.\(propertyType && \{ propertyType \}\),\s*\.\.\.\(propertyStatus && \{ propertyStatus \}\),\s*\}/g,
    `search: {
          ...(propertyStatus && { propertyStatus }),
        }`
);

fs.writeFileSync('libs/components/mypage/agent/MyHotels.tsx', code);
console.log("Fixed MyHotels query payload");
