const fs = require('fs');

const updateWidget = (filePath) => {
	let content = fs.readFileSync(filePath, 'utf-8');

	// Add useRouter import if not exists
	if (!content.includes('useRouter')) {
		content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useRouter } from 'next/router';");
	}

	// Add router = useRouter() inside component
	const componentRegex = /(const [A-Za-z]+Widget = \([^)]+\) => \{)/;
	if (!content.includes('const router = useRouter()')) {
		content = content.replace(componentRegex, "$1\n\tconst router = useRouter();");
	}

	// Update handleReserve
	const handleReserveRegex = /(const handleReserve = async \(\) => \{)([\s\S]*?)(^\t\};)/m;
	const newHandleReserve = `$1
		if (!user?._id) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		router.push('/checkout');
$3`;
	
	// actually replacing the entire function is tricky with regex, let's just do a string replace
	const handleReserveStart = 'const handleReserve = async () => {';
	const idxStart = content.indexOf(handleReserveStart);
	if (idxStart !== -1) {
		const idxEnd = content.indexOf('	};', idxStart);
		const replacement = `const handleReserve = async () => {
		if (!user?._id) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		router.push('/checkout');`;
		content = content.substring(0, idxStart) + replacement + content.substring(idxEnd);
	}

	// Disable the PropertyPaymentModal since we redirect
	content = content.replace(/\{clientSecret \? <[^>]+> : null\}/, '');
	
	fs.writeFileSync(filePath, content);
};

updateWidget('libs/components/property/detail/PropertyReservationWidget.tsx');
updateWidget('libs/components/tour/detail/TourReservationWidget.tsx');
console.log('Widgets updated!');
