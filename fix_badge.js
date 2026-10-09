const fs = require('fs');
let code = fs.readFileSync('libs/components/layout/LayoutAdmin.tsx', 'utf-8');

// Add GET_UNREAD_NOTIFICATION_COUNT import
if (!code.includes('GET_UNREAD_NOTIFICATION_COUNT')) {
    code = code.replace(
        "import { useReactiveVar } from '@apollo/client';",
        "import { useQuery, useReactiveVar } from '@apollo/client';\nimport { GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';"
    );
}

// Add query
if (!code.includes('unreadData')) {
    code = code.replace(
        "const activePath = router.pathname.replace('/_admin/', '');",
        "const activePath = router.pathname.replace('/_admin/', '');\n\n\t\tconst { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {\n\t\t\tfetchPolicy: 'network-only',\n\t\t\tskip: !user?._id,\n\t\t});\n\t\tconst unreadCount = unreadData?.getUnreadNotificationCount || 0;"
    );
}

// Replace badge
code = code.replace(
    /<span className="notif-badge"><\/span>/,
    `{unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}`
);

fs.writeFileSync('libs/components/layout/LayoutAdmin.tsx', code);
console.log("Fixed LayoutAdmin.tsx badge");
