const fs = require('fs');
let code = fs.readFileSync('pages/checkout/index.tsx', 'utf-8');

const uuidFunc = `
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
`;

code = code.replace(
    'const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;',
    'const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;\n' + uuidFunc
);

code = code.replace(
    /const idempotencyKey = window\.crypto\?\.randomUUID \? window\.crypto\.randomUUID\(\) : Math\.random\(\)\.toString\(36\)\.substring\(7\);/g,
    'const idempotencyKey = generateUUID();'
);

fs.writeFileSync('pages/checkout/index.tsx', code);
console.log("UUID generator injected");
