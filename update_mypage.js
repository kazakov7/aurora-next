const fs = require('fs');

let code = fs.readFileSync('pages/mypage/index.tsx', 'utf-8');

code = code.replace(
    /import MyProfileSettings from '\.\.\/\.\.\/libs\/components\/mypage\/MyProfileSettings';/,
    "import MyProfileSettings from '../../libs/components/mypage/MyProfileSettings';\nimport AgentApplicationPage from '../../libs/components/mypage/AgentApplicationPage';"
);

code = code.replace(
    /const allowedCategories = \['articles', 'followers', 'following', 'wishlist', 'bookings', 'history', 'notifications', 'settings', 'myHotels', 'myTours', 'reservations'\];/,
    "const allowedCategories = ['articles', 'followers', 'following', 'wishlist', 'bookings', 'history', 'notifications', 'settings', 'partner', 'myHotels', 'myTours', 'reservations'];"
);

code = code.replace(
    /case 'settings':\s*return 'Settings — AURA Profile';/,
    "case 'settings':\n\t\t\t\treturn 'Settings — AURA Profile';\n\t\t\tcase 'partner':\n\t\t\t\treturn 'Partner Application — AURA Profile';"
);

code = code.replace(
    /\{category === 'settings' && <MyProfileSettings \/>\}/,
    "{category === 'settings' && <MyProfileSettings />}\n\t\t\t\t\t\t\t{category === 'partner' && <AgentApplicationPage />}"
);

fs.writeFileSync('pages/mypage/index.tsx', code);
console.log("Updated mypage/index.tsx");
