const fs = require('fs');
let code = fs.readFileSync('pages/tour/index.tsx', 'utf-8');

// 1. Import MUI components
if (!code.includes("import Pagination from '@mui/material/Pagination';") && !code.includes("Pagination, Stack, Typography")) {
    code = code.replace("import React,", "import { Pagination, Stack, Typography } from '@mui/material';\nimport React,");
}

// 2. Change limit in defaultInput from 12 to 6
code = code.replace(/limit:\s*12/, "limit: 6");

// Also change the Math.max fallback limit if any
code = code.replace(/searchFilter\.limit \|\| 12/g, "searchFilter.limit || 6");

// 3. Update handlePaginationChange
const oldHandler = `	const handlePaginationChange = async (newPage: number) => {
		const updated = { ...searchFilter, page: newPage };
		setSearchFilter(updated);
		setCurrentPage(newPage);
		await router.push(
			{
				pathname: '/tour',
				query: { input: JSON.stringify(updated) },
			},
			undefined,
			{ scroll: false },
		);
	};`;

const newHandler = `	const handlePaginationChange = async (event: React.ChangeEvent<unknown>, newPage: number) => {
		const updated = { ...searchFilter, page: newPage };
		setSearchFilter(updated);
		setCurrentPage(newPage);
		await router.push(
			{
				pathname: '/tour',
				query: { input: JSON.stringify(updated) },
			},
			undefined,
			{ scroll: false },
		);
	};`;
code = code.replace(oldHandler, newHandler);

// 4. Replace pagination HTML
const oldHtmlStart = `{/* Pagination Controls */}`;
const oldHtmlEnd = `</main>`;
const startIndex = code.indexOf(oldHtmlStart);
const endIndex = code.indexOf(oldHtmlEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `{/* Pagination Controls */}
						{totalPages > 0 && (
							<Stack className="pagination-config" sx={{ mt: '50px', alignItems: 'center' }}>
								{tours.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={totalPages}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{tours.length !== 0 && (
									<Stack className="total-result" sx={{ mt: 2 }}>
										<Typography variant="body2" color="text.secondary">
											Total {total} journey{total > 1 ? 's' : ''} available
										</Typography>
									</Stack>
								)}
							</Stack>
						)}
					`;
    code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
}

fs.writeFileSync('pages/tour/index.tsx', code);
console.log("Updated pagination in tour/index.tsx");
