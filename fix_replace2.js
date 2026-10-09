const fs = require('fs');
let code = fs.readFileSync('pages/_admin/index.tsx', 'utf-8');
code = code.replace(/'\$\$'/g, "'$'");
fs.writeFileSync('pages/_admin/index.tsx', code);
