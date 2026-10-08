import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Direction } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleStatus } from '../../enums/board-article.enum';
import { DEFAULT_ARTICLE_IMAGE, getImageUrl } from '../../config';
import WriteStoryModal from '../community/WriteStoryModal';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyProfileArticles: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [sortOrder, setSortOrder] = useState<string>('createdAt');
	
	// Modals & Menus states
	const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
	const [editArticle, setEditArticle] = useState<BoardArticle | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

	const dropdownRef = useRef<HTMLDivElement>(null);

	/** APOLLO REQUESTS **/
	const { data, loading, error, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 12,
				sort: sortOrder,
				direction: Direction.DESC,
				search: {
					memberId: user?._id || '',
				},
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const articles: BoardArticle[] = data?.getBoardArticles?.list || [];
	const total = data?.getBoardArticles?.metaCounter?.[0]?.total || articles.length;

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpenDropdownId(null);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [openDropdownId]);

	const formatDate = (dateInput?: Date | string) => {
		if (!dateInput) return 'Recently';
		const d = new Date(dateInput);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setOpenDropdownId(null);
		
		const isConfirm = await sweetConfirmAlert('Are you sure you want to delete this article?');
		if (isConfirm) {
			try {
				await updateBoardArticle({
					variables: {
						input: {
							_id: id,
							articleStatus: BoardArticleStatus.DELETED,
						},
					},
					refetchQueries: ['GetMember'],
				});
				sweetTopSmallSuccessAlert('Article deleted successfully');
				await refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(err.message || 'Failed to delete article');
			}
		}
	};

	const handleEdit = (e: React.MouseEvent, article: BoardArticle) => {
		e.stopPropagation();
		setOpenDropdownId(null);
		setEditArticle(article);
		setIsWriteModalOpen(true);
	};

	return (
		<div>
			{/* Top Control Bar */}
			<div className="section-top-bar">
				<div className="title-group">
					<h2>My Articles</h2>
					<span className="counter-pill">{total} published</span>
				</div>
				<div className="bar-actions">
					<div className="custom-select-box">
						<select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
							<option value="createdAt">Newest First</option>
							<option value="articleViews">Most Read</option>
							<option value="articleComments">Most Discussed</option>
						</select>
						<span className="material-symbols-outlined">expand_more</span>
					</div>
					<button
						type="button"
						className="primary-action-btn"
						onClick={() => {
							setEditArticle(null);
							setIsWriteModalOpen(true);
						}}
					>
						<span className="material-symbols-outlined">add</span>
						<span>Create Article</span>
					</button>
				</div>
			</div>

			{/* 3x3 Grid of Article Cards */}
			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>Loading your articles...</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>Articles are unavailable</h3><p>{error.message}</p></div>
			) : articles.length > 0 ? (
				<div className="article-cards-grid">
					{articles.map((article: BoardArticle) => {
						const coverImg = getImageUrl(article?.articleImage, DEFAULT_ARTICLE_IMAGE);
						const plainContent = article.articleContent?.replace(/<[^>]*>/g, '').trim() || '';
						const readingMinutes = Math.max(1, Math.ceil(plainContent.split(/\s+/).filter(Boolean).length / 200));

						return (
							<article
								key={article._id}
								className="article-card-item"
								onClick={() => router.push(`/community/detail?id=${article._id}`)}
								style={{ cursor: 'pointer' }}
							>
								<div className="card-top">
									<div className="thumb-wrapper" style={{ position: 'relative' }}>
										<img src={coverImg} alt={article.articleTitle} />
										<span className="cat-tag">
										{article.articleCategory}
										</span>
										<button
											type="button"
											className="thumb-opts-btn"
											aria-label="Options"
											onClick={(e) => {
												e.stopPropagation();
												setOpenDropdownId(openDropdownId === article._id ? null : article._id);
											}}
										>
											<span className="material-symbols-outlined">more_horiz</span>
										</button>

										{/* DROPDOWN MENU */}
										{openDropdownId === article._id && (
											<div 
												ref={dropdownRef}
												className="article-dropdown-menu"
												style={{
													position: 'absolute',
													top: '44px',
													right: '12px',
													background: '#ffffff',
													borderRadius: '8px',
													boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
													padding: '8px',
													zIndex: 10,
													display: 'flex',
													flexDirection: 'column',
													minWidth: '140px',
													border: '1px solid rgba(191, 199, 210, 0.4)'
												}}
											>
												<button
													onClick={(e) => handleEdit(e, article)}
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
														padding: '8px 12px',
														background: 'transparent',
														border: 'none',
														cursor: 'pointer',
														fontSize: '13px',
														color: '#141b2b',
														fontWeight: 500,
														textAlign: 'left',
														borderRadius: '6px'
													}}
													onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f3ff')}
													onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
												>
													<span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#006194' }}>edit</span>
													Edit
												</button>
												<button
													onClick={(e) => handleDelete(e, article._id)}
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
														padding: '8px 12px',
														background: 'transparent',
														border: 'none',
														cursor: 'pointer',
														fontSize: '13px',
														color: '#ba1a1a',
														fontWeight: 500,
														textAlign: 'left',
														borderRadius: '6px'
													}}
													onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffdad6')}
													onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
												>
													<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
													Delete
												</button>
											</div>
										)}
									</div>
									<h3 className="article-title">{article.articleTitle}</h3>
									<p className="article-desc">
									{plainContent || 'No article summary provided.'}
									</p>
								</div>

								<div className="card-footer-stats">
									<span className="meta-read">{formatDate(article.createdAt)} · {readingMinutes} min read</span>
									<div className="stats-group">
										<span>
											<span className="material-symbols-outlined">favorite</span>
											{article.articleLikes || 0}
										</span>
										<span>
											<span className="material-symbols-outlined">chat_bubble</span>
											{article.articleComments || 0}
										</span>
										<span>
											<span className="material-symbols-outlined">visibility</span>
											{article.articleViews || 0}
										</span>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">menu_book</span>
					</div>
					<h3>No published articles yet</h3>
					<p>Share your high-altitude routes, architectural discoveries, and photo journals with the AURA community.</p>
				</div>
			)}
			
			<WriteStoryModal 
				isOpen={isWriteModalOpen}
				onClose={() => setIsWriteModalOpen(false)}
				onCreated={() => { void refetch(); }}
				editArticle={editArticle}
			/>
		</div>
	);
};

export default MyProfileArticles;
