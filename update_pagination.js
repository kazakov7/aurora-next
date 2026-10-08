const fs = require('fs');

let code = fs.readFileSync('pages/property/index.tsx', 'utf-8');

// 1. Import Pagination and Stack if not present
if (!code.includes("import Pagination from '@mui/material/Pagination';")) {
    code = code.replace("import React,", "import { Pagination, Stack, Typography } from '@mui/material';\nimport React,");
}

// 2. Modify handlePaginationChange
const oldHandler = `	const handlePaginationChange = async (newPage: number) => {
		const updated = { ...searchFilter, page: newPage };
		setSearchFilter(updated);
		setCurrentPage(newPage);
		await router.push(
			{
				pathname: '/property',
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
				pathname: '/property',
				query: { input: JSON.stringify(updated) },
			},
			undefined,
			{ scroll: false },
		);
	};`;
code = code.replace(oldHandler, newHandler);

// 3. Replace the pagination HTML
const oldPaginationHtmlStart = `{/* Pagination Controls */}`;
const oldPaginationHtmlEnd = `</main>`; // We'll just replace everything between these two and put </main> back
const startIndex = code.indexOf(oldPaginationHtmlStart);
const endIndex = code.indexOf(`</main>`, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `{/* Pagination Controls */}
						{totalPages > 0 && (
							<Stack className="pagination-config" sx={{ mt: '50px', alignItems: 'center' }}>
								{properties.length !== 0 && (
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

								{properties.length !== 0 && (
									<Stack className="total-result" sx={{ mt: 2 }}>
										<Typography variant="body2" color="text.secondary">
											Total {total} propert{total > 1 ? 'ies' : 'y'} available
										</Typography>
									</Stack>
								)}
							</Stack>
						)}
					`;
    code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
}

fs.writeFileSync('pages/property/index.tsx', code);
console.log("Updated pagination in aurora-next property page.");
