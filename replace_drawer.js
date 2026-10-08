const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/_admin/users/index.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add import if not present
if (!content.includes('UserDrawer')) {
	content = content.replace(
		"import withAdminLayout from '../../libs/components/layout/LayoutAdmin';",
		"import withAdminLayout from '../../libs/components/layout/LayoutAdmin';\nimport UserDrawer from '../../libs/components/admin/UserDrawer';"
	);
}

// Replace the slide-out drawer
const startMarker = "{/* SLIDE-OUT INSPECTION DRAWER */}";
const startIndex = content.indexOf(startMarker);

if (startIndex !== -1) {
	const endMarker = "</div>\n\t);\n};";
	const endIndex = content.lastIndexOf(endMarker);
	
	if (endIndex !== -1) {
		const newDrawer = `{/* SLIDE-OUT INSPECTION DRAWER */}
			{isDrawerOpen && selectedMember && (
				<UserDrawer 
					selectedMember={selectedMember} 
					closeDrawer={closeDrawer} 
					handleStatusUpdate={handleStatusUpdate} 
				/>
			)}
		`;
		content = content.substring(0, startIndex) + newDrawer + content.substring(endIndex);
	}
}

fs.writeFileSync(filePath, content);
console.log('Replaced drawer!');
