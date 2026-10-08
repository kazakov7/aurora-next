import React, { useState } from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN, REMOVE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AllBoardArticlesInquiry, BoardArticleUpdate } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert, sweetConfirmAlert } from '../../../libs/sweetAlert';

const AdminCommunityPage: NextPage = () => {
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [selectedArticle, setSelectedArticle] = useState<BoardArticle | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	
	// Form state for Edit Drawer
	const [formStatus, setFormStatus] = useState<BoardArticleStatus>(BoardArticleStatus.PUBLISHED);

	const [searchFilter, setSearchFilter] = useState<AllBoardArticlesInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setArticles(data?.getAllBoardArticlesByAdmin?.list || []);
			setTotal(data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total || 0);
		},
	});

	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	/** HANDLERS **/


	const handleCategoryChange = (val: string) => {
		setSearchFilter((prev) => ({
			...prev,
			search: { ...prev.search, articleCategory: val === 'all' ? undefined : (val as BoardArticleCategory) },
			page: 1,
		}));
	};

	const handleStatusChange = (val: string) => {
		setSearchFilter((prev) => ({
			...prev,
			search: { ...prev.search, articleStatus: val === 'all' ? undefined : (val as BoardArticleStatus) },
			page: 1,
		}));
	};

	const resetFilters = () => {
		setSearchFilter({
			page: 1,
			limit: 10,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		});
		refetch();
	};

	const openEditDrawer = (article: BoardArticle) => {
		setSelectedArticle(article);
		setFormStatus(article.articleStatus);
		setIsDrawerOpen(true);
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedArticle(null);
	};

	const handleSave = async () => {
		try {
			if (selectedArticle) {
				const updateInput: BoardArticleUpdate = {
					_id: selectedArticle._id,
					articleStatus: formStatus,
				};
				await updateBoardArticleByAdmin({
					variables: { input: updateInput },
				});
				sweetTopSmallSuccessAlert('Article status updated!', 800);
			}
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handleDelete = async (id: string) => {
		if (await sweetConfirmAlert('Are you sure you want to delete this article?')) {
			try {
				await removeBoardArticleByAdmin({ variables: { articleId: id } });
				sweetTopSmallSuccessAlert('Article deleted!', 800);
				refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(err.message);
			}
		}
	};

	const exportCSV = () => {
		if (!articles || articles.length === 0) {
			sweetMixinErrorAlert('No data to export');
			return;
		}
		const headers = ['ID', 'Title', 'Category', 'Status', 'Likes', 'Views', 'Comments', 'Created Date'];
		const rows = articles.map((a) => [
			a._id,
			`"${a.articleTitle.replace(/"/g, '""')}"`,
			a.articleCategory,
			a.articleStatus,
			a.articleLikes,
			a.articleViews,
			a.articleComments,
			new Date(a.createdAt).toLocaleDateString(),
		]);

		const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `aura_community_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const totalPages = Math.ceil(total / searchFilter.limit) || 1;
	const startItem = total === 0 ? 0 : (searchFilter.page - 1) * searchFilter.limit + 1;
	const endItem = Math.min(searchFilter.page * searchFilter.limit, total);

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Community Management</h1>
					<p>Monitor and moderate community discussions, guides, and news.</p>
				</div>
				<div className="header-actions">
					<button className="export-btn" type="button" onClick={exportCSV}>
						<span className="material-symbols-outlined">download</span>
						Export CSV
					</button>
				</div>
			</div>

			<section className="admin-table-section">
				<div className="table-header">
					<div className="header-left">
						<h2>Directory</h2>
						<span className="table-badge">{total} Articles</span>
					</div>
					<div className="header-right">

						<div className="filter-select-group">
							<select className="filter-select" onChange={(e) => handleCategoryChange(e.target.value)}>
								<option value="all">All Categories</option>
								<option value={BoardArticleCategory.DESTINATION}>Destination</option>
								<option value={BoardArticleCategory.HOTEL}>Hotel</option>
								<option value={BoardArticleCategory.TOUR}>Tour</option>
								<option value={BoardArticleCategory.GUIDE}>Guide</option>
								<option value={BoardArticleCategory.NEWS}>News</option>
							</select>
							<select className="filter-select" onChange={(e) => handleStatusChange(e.target.value)}>
								<option value="all">All Statuses</option>
								<option value={BoardArticleStatus.PUBLISHED}>Published</option>
								<option value={BoardArticleStatus.DELETED}>Deleted</option>
							</select>
							<button className="reset-filter-btn" type="button" onClick={resetFilters}>
								<span className="material-symbols-outlined">filter_alt_off</span>
								Reset
							</button>
						</div>
					</div>
				</div>

				<div className="table-container">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Thread Title</th>
								<th>Category</th>
								<th>Metrics</th>
								<th>Status</th>
								<th>Created Date</th>
								<th style={{ width: 120, textAlign: 'right' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										Loading...
									</td>
								</tr>
							) : articles.length === 0 ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										No articles found.
									</td>
								</tr>
							) : (
								articles.map((article) => (
									<tr key={article._id}>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												<span style={{ fontWeight: 600, color: '#141b2b' }}>{article.articleTitle}</span>
												<span style={{ fontSize: 13, color: '#707881' }}>By {article.memberId || 'Unknown'}</span>
											</div>
										</td>
										<td>
											<span className="badge-pill indigo">{article.articleCategory}</span>
										</td>
										<td>
											<div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#707881' }}>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span>
													{article.articleLikes}
												</span>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
													{article.articleViews}
												</span>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>chat_bubble</span>
													{article.articleComments}
												</span>
											</div>
										</td>
										<td>
											<span
												className={`status-pill ${
													article.articleStatus === BoardArticleStatus.PUBLISHED ? 'emerald' : 'cancelled'
												}`}
											>
												<span className="dot"></span>
												{article.articleStatus}
											</span>
										</td>
										<td>
											<span style={{ fontSize: 13, color: '#707881' }}>
												{new Date(article.createdAt).toLocaleDateString()}
											</span>
										</td>
										<td style={{ textAlign: 'right' }}>
											<div style={{ display: 'inline-flex', gap: 6 }}>
												<button
													type="button"
													onClick={() => openEditDrawer(article)}
													style={{
														padding: '6px',
														borderRadius: '6px',
														border: 'none',
														background: '#f1f3ff',
														color: '#006194',
														cursor: 'pointer',
													}}
												>
													<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
														visibility
													</span>
												</button>
												<button
													type="button"
													onClick={() => handleDelete(article._id)}
													style={{
														padding: '6px',
														borderRadius: '6px',
														border: 'none',
														background: '#ffdad6',
														color: '#ba1a1a',
														cursor: 'pointer',
													}}
												>
													<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
														delete
													</span>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="table-footer">
					<span>
						Showing {startItem}–{endItem} of {total} records
					</span>
					<div className="pagination">
						<button
							className="page-btn square"
							disabled={searchFilter.page === 1}
							type="button"
							onClick={() => setSearchFilter((prev) => ({ ...prev, page: prev.page - 1 }))}
						>
							<span className="material-symbols-outlined">chevron_left</span>
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								className={`page-btn ${p === searchFilter.page ? 'active' : ''}`}
								type="button"
								onClick={() => setSearchFilter((prev) => ({ ...prev, page: p }))}
							>
								{p}
							</button>
						))}
						<button
							className="page-btn square"
							disabled={searchFilter.page >= totalPages}
							type="button"
							onClick={() => setSearchFilter((prev) => ({ ...prev, page: prev.page + 1 }))}
						>
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			</section>

			{isDrawerOpen && selectedArticle && (
				<>
					<div className="admin-drawer-backdrop" onClick={closeDrawer} />
					<aside className="admin-drawer">
						<div className="drawer-header">
							<div className="header-title">
								<span className="material-symbols-outlined">edit_document</span>
								<span>Moderate Article</span>
							</div>
							<button className="close-btn" type="button" onClick={closeDrawer}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="drawer-body">
							<div className="admin-form-group">
								<label>Thread Title</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none' }}>
									{selectedArticle.articleTitle}
								</div>
							</div>
							
							<div className="admin-form-group">
								<label>Content</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none', height: 200, overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: selectedArticle.articleContent }} />
							</div>

							<div className="admin-form-group">
								<label>
									Status <span className="required">*</span>
								</label>
								<select
									className="admin-form-control select"
									value={formStatus}
									onChange={(e) => setFormStatus(e.target.value as BoardArticleStatus)}
								>
									<option value={BoardArticleStatus.PUBLISHED}>Published</option>
									<option value={BoardArticleStatus.DELETED}>Deleted</option>
								</select>
							</div>
						</div>

						<div className="drawer-footer">
							<button className="btn secondary" type="button" onClick={closeDrawer}>
								Cancel
							</button>
							<button className="btn primary" type="button" onClick={handleSave}>
								Save Changes
							</button>
						</div>
					</aside>
				</>
			)}
		</div>
	);
};

export default withAdminLayout(AdminCommunityPage);
