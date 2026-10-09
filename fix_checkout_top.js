const fs = require('fs');

let code = fs.readFileSync('pages/checkout/index.tsx', 'utf-8');

// 1. Remove the custom header HTML we just added
const customHeaderRegex = /      <header className="checkout-header">[\s\S]*?<\/header>/;
code = code.replace(customHeaderRegex, "      <Top />");

// 2. Add Top import
if (!code.includes('import Top')) {
    code = code.replace(
        "import Head from \"next/head\";",
        "import Head from \"next/head\";\nimport Top from \"../../libs/components/Top\";"
    );
}

// 3. Make sure the root element has id="pc-wrap" so Top gets its CSS
code = code.replace(
    /<div className="checkout-page-root">/,
    '<div id="pc-wrap" className="checkout-page-root">'
);

fs.writeFileSync('pages/checkout/index.tsx', code);
console.log("Restored Top and added id='pc-wrap'");
