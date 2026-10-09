const fs = require('fs');
let code = fs.readFileSync('pages/checkout/index.tsx', 'utf-8');

code = code.replace(/bookingGuests: Number\(guests\)/g, 'bookingGuests: Number(guests) || 1');
code = code.replace(/guests: Number\(guests\)/g, 'guests: Number(guests) || 1');

fs.writeFileSync('pages/checkout/index.tsx', code);
console.log("Added guest fallback");
