import React, { useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { BoardArticle } from '../../types/board-article/board-article';
import { DEFAULT_ARTICLE_IMAGE, getImageUrl } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface MemberArticlesProps {
	member: Member;
	onArticlesCountChange?: (count: number) => void;
}

const MemberArticles: React.FC<MemberArticlesProps> = ({ member, onArticlesCountChange }) => {
	const router = useRouter();
	const currentUser = useReactiveVar(userVar);

	const [page, setPage] = useState<number>(1);
	const [sort, setSort] = useState<'createdAt' | 'articleLikes' | 'articleViews'>('createdAt');

	/** APOLLO REQUESTS **/
	const [likeArticleMutation] = useMutation(LIKE_TARGET_ARTICLE);

	const { data, loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: page,
				limit: 9,
				sort: sort,
				direction: 'DESC',
				search: {
					memberId: member?._id || '',
				},
			},
		},
		skip: !member?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (resData) => {
			const totalCount = resData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
			if (onArticlesCountChange) {
				onArticlesCountChange(totalCount);
			}
		},
	});

	const articles: BoardArticle[] = data?.getBoardArticles?.list || [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total || 0;
	const totalPages = Math.ceil(total / 9) || 1;

	/** HANDLERS **/
	const handleSortChange = (newSort: 'createdAt' | 'articleLikes' | 'articleViews') => {
		setSort(newSort);
		setPage(1);
	};

	const handleLikeToggle = async (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		if (!currentUser?._id) {
			sweetMixinErrorAlert('Please log in to bookmark articles.');
			router.push('/account/login');
			return;
		}

		try {
			await likeArticleMutation({ variables: { input: articleId } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err?.message || 'Action failed.');
		}
	};

	const memberName = member?.memberFullName || member?.memberNick || 'Member';

	return (
		<div className="member-content-area">
			{/* Content Header & Sort Filter */}
			<div className="content-header-row">
				<div className="header-title-box">
					<div className="title-badge-wrap">
						<h2>Articles</h2>
						<span className="count-pill">{total} published</span>
					</div>
					<p className="header-subtitle">
						Travel journals, photo-essays, and architectural chronicles by {memberName}.
					</p>
				</div>

				{/* Public Sort Pill Selector */}
				<div className="sort-pill-container">
					<button
						type="button"
						className={`sort-btn ${sort === 'createdAt' ? 'active' : ''}`}
						onClick={() => handleSortChange('createdAt')}
					>
						Newest
					</button>
					<button
						type="button"
						className={`sort-btn ${sort === 'articleLikes' ? 'active' : ''}`}
						onClick={() => handleSortChange('articleLikes')}
					>
						Most Liked
					</button>
					<button
						type="button"
						className={`sort-btn ${sort === 'articleViews' ? 'active' : ''}`}
						onClick={() => handleSortChange('articleViews')}
					>
						Most Viewed
					</button>
				</div>
			</div>

			{/* Articles Grid or Loading or Empty State */}
			{loading && articles.length === 0 ? (
				<p className="member-profile-state">Loading articles...</p>
			) : articles.length > 0 ? (
				<div className="member-articles-grid" id="articles-grid">
					{articles.map((article) => {
						const isLiked = article?.meLiked?.[0]?.myFavorite || false;
						const readTime = `${Math.max(1, Math.ceil((article.articleContent?.length || 200) / 400))} min read`;
						const formattedDate = moment(isNaN(Number(article.createdAt)) ? article.createdAt : Number(article.createdAt)).format('MMM DD, YYYY');

						return (
							<article
								key={article._id}
								className="member-article-card"
								onClick={() => router.push(`/community/detail?id=${article._id}`)}
							>
								{/* Image Thumbnail Container */}
								<div className="card-img-box">
									<img
										className="card-img"
										src={getImageUrl(article.articleImage, DEFAULT_ARTICLE_IMAGE)}
										alt={article.articleTitle}
									/>
									<div className="gradient-overlay"></div>

									{/* Category Pill Tag */}
									<span className="category-badge">{article.articleCategory || 'Expedition'}</span>

									{/* Bookmark Button */}
									<button
										type="button"
										className="bookmark-btn"
										aria-label="Bookmark"
										onClick={(e) => handleLikeToggle(e, article._id)}
									>
										<span
											className="material-symbols-outlined"
											style={isLiked ? { fontVariationSettings: "'FILL' 1", color: '#ba1a1a' } : undefined}
										>
											{isLiked ? 'bookmark' : 'bookmark_border'}
										</span>
									</button>
								</div>

								{/* Card Details */}
								<div className="card-body">
									<div className="card-text-group">
										<h3 className="article-title">{article.articleTitle}</h3>
										<p className="article-excerpt">
											{article.articleContent || 'Photographic study and chronicle from the AURA archives.'}
										</p>
									</div>

									{/* Footer Meta Row */}
									<div className="card-footer-meta">
										<span>
											{formattedDate} · {readTime}
										</span>
										<div className="meta-stats">
											<span className="stat-item">
												<span className="material-symbols-outlined">favorite</span>
												{article.articleLikes || 0}
											</span>
											<span className="stat-item">
												<span className="material-symbols-outlined">visibility</span>
												{article.articleViews || 0}
											</span>
										</div>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			) : (
				/* Empty State Markup Block */
				<div className="articles-empty-card" id="articles-empty">
					<div className="empty-icon-box">
						<span className="material-symbols-outlined">menu_book</span>
					</div>
					<h3>No articles published yet</h3>
					<p>
						{memberName} has not released any public dispatches or photo monographs yet. Check back soon for new expeditions.
					</p>
				</div>
			)}

			{/* Minimalist Pagination */}
			{totalPages > 1 && (
				<div className="pagination-wrapper">
					<span className="pagination-info">
						Showing {(page - 1) * 9 + 1}–{Math.min(page * 9, total)} of {total} articles
					</span>
					<div className="pagination-pills">
						<button
							type="button"
							className="nav-arrow-btn"
							aria-label="Previous page"
							disabled={page === 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							<span className="material-symbols-outlined">chevron_left</span>
						</button>

						{Array.from({ length: totalPages }).map((_, i) => {
							const p = i + 1;
							return (
								<button
									key={p}
									type="button"
									className={`page-num-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							);
						})}

						<button
							type="button"
							className="nav-arrow-btn"
							aria-label="Next page"
							disabled={page === totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						>
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemberArticles;
