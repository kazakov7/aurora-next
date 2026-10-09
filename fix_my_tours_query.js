const fs = require('fs');

let code = fs.readFileSync('libs/components/mypage/agent/MyTours.tsx', 'utf-8');

// Replace the search payload in MyTours
code = code.replace(
    /search: \{\s*\.\.\.\(search && \{ text: search \}\),\s*\.\.\.\(tourStatus && \{ tourStatus \}\),\s*\}/g,
    `search: {
          ...(tourStatus && { tourStatus }),
        }`
);

fs.writeFileSync('libs/components/mypage/agent/MyTours.tsx', code);
console.log("Fixed MyTours query payload");
