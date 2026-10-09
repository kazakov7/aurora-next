const fs = require('fs');

let code = fs.readFileSync('apollo/user/query.ts', 'utf-8');

code = code.replace(
    /authorData \{\s*_id\s*memberNick\s*memberFullName\s*memberImage\s*\}/,
    `authorData {
					memberNick
					memberFullName
					memberImage
				}`
);

fs.writeFileSync('apollo/user/query.ts', code);
console.log("Fixed GET_MY_NOTIFICATIONS query");
