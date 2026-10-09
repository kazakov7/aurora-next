const fs = require('fs');
let code = fs.readFileSync('pages/_admin/index.tsx', 'utf-8');

// I will just completely replace the line
code = code.replace(
  /<td><strong style={{color: '#1a2b49'}}>{booking\.bookingCurrency === 'KRW' \? '₩' : '}[^<]*<\/strong><\/td>/g,
  `<td><strong style={{color: '#1a2b49'}}>{booking.bookingCurrency === 'KRW' ? '₩' : '$'}{booking.bookingTotalPrice.toLocaleString()}</strong></td>`
);

fs.writeFileSync('pages/_admin/index.tsx', code);
console.log("Fixed again");
