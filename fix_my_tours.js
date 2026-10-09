const fs = require('fs');

let code = fs.readFileSync('libs/components/mypage/agent/MyTours.tsx', 'utf-8');

if (!code.includes('sweetErrorHandling')) {
    code = code.replace(
        "import moment from \"moment\";",
        "import moment from \"moment\";\nimport { sweetErrorHandling } from \"../../../../libs/sweetAlert\";"
    );

    code = code.replace(
        /const \{ data, loading \} = useQuery\(GET_AGENT_TOURS, \{([\s\S]*?)variables:/,
        "const { data, loading } = useQuery(GET_AGENT_TOURS, {$1onError: (err) => sweetErrorHandling(err),\n    variables:"
    );
    
    fs.writeFileSync('libs/components/mypage/agent/MyTours.tsx', code);
    console.log("Added sweetErrorHandling to MyTours");
}
