const fs = require('fs');

function fixFile(filePath, defaultImg) {
    let code = fs.readFileSync(filePath, 'utf-8');

    // Add getImageUrl import if not present
    if (!code.includes('getImageUrl')) {
        code = code.replace(
            "import { useRouter } from \"next/router\";",
            "import { useRouter } from \"next/router\";\nimport { getImageUrl } from \"../../../../libs/config\";"
        );
    }

    // Replace the image src logic
    // src={prop.propertyImages?.[0] ? `${process.env.REACT_APP_API_URL}/${prop.propertyImages[0]}` : "/img/placeholder.png"}
    
    code = code.replace(
        /src=\{[^\{]*\?\s*`\$\{process\.env\.REACT_APP_API_URL\}\/\$\{.*?\}\`\s*:\s*".*?"\}/g,
        (match) => {
            // Find what property is used, e.g. prop.propertyImages[0] or tour.tourImages[0]
            if (match.includes('prop.propertyImages')) {
                return `src={getImageUrl(prop?.propertyImages?.[0], "${defaultImg}")}`;
            } else if (match.includes('tour.tourImages')) {
                return `src={getImageUrl(tour?.tourImages?.[0], "${defaultImg}")}`;
            }
            return match;
        }
    );

    fs.writeFileSync(filePath, code);
    console.log(`Fixed ${filePath}`);
}

fixFile('libs/components/mypage/agent/MyHotels.tsx', '/img/placeholder.png');
fixFile('libs/components/mypage/agent/MyTours.tsx', '/img/placeholder.png');
