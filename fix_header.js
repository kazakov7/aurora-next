const fs = require('fs');
let code = fs.readFileSync('libs/components/mypage/MyProfileHeader.tsx', 'utf-8');

code = code.replace(/import PartnerModal from "\.\/PartnerModal";/, "");
code = code.replace(/const \[partnerModalOpen, setPartnerModalOpen\] = useState\(false\);/, "");

code = code.replace(
    /onClick=\{\(\) => setPartnerModalOpen\(true\)\}/,
    `onClick={() => handleNav("partner")}`
);

code = code.replace(
    /<PartnerModal\s*isOpen=\{partnerModalOpen\}\s*onClose=\{\(\) => setPartnerModalOpen\(false\)\}\s*\/>/,
    ""
);

fs.writeFileSync('libs/components/mypage/MyProfileHeader.tsx', code);
console.log("Fixed MyProfileHeader.tsx");
