import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../../apollo/user/query';
import { BoardArticle } from '../../../types/board-article/board-article';
import { Direction } from '../../../enums/common.enum';
import { getImageUrl } from '../../../config';

interface CommunityDetailRelatedProps {
	currentArticleId: string;
}

const categoryLabelMap: Record<string, string> = {
	TOUR: 'Itineraries',
	HOTEL: 'Hotel Reviews',
	DESTINATION: 'Photography',
	GUIDE: 'Expedition Log',
	NEWS: 'Local Insights',
};

const CommunityDetailRelated: React.FC<CommunityDetailRelatedProps> = ({ currentArticleId }) => {
	const { data } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'articleViews',
				direction: Direction.DESC,
				search: {},
			},
		},
	});

	const backendList: BoardArticle[] = (data?.getBoardArticles?.list || []).filter(
		(a: BoardArticle) => a._id !== currentArticleId
	);

	const displayList = backendList.slice(0, 3);

	if (displayList.length === 0) return null;

	return (
		<section className="community-detail-related-section">
			<div className="related-inner-container">
				{/* Section Header */}
				<div className="section-header-row">
					<div>
						<h2 className="section-title">You Might Also Like</h2>
						<p className="section-subtitle">More stories to inspire your next adventure.</p>
					</div>
					<Link href="/community" className="explore-community-link">
						<span>Explore Community</span>
						<span className="material-symbols-outlined icon">arrow_forward</span>
					</Link>
				</div>

				{/* 3-Column Grid */}
				<div className="related-cards-grid">
					{displayList.map((item) => {
						const authorName =
							item.memberData?.memberFullName || item.memberData?.memberNick || 'Member';
						const catLabel =
							categoryLabelMap[item.articleCategory] || item.articleCategory || 'Uncategorized';
						const imgSrc = item.articleImage ? getImageUrl(item.articleImage) : undefined;

						// We need a simple excerpt from HTML content
						const excerpt = item.articleContent?.replace(/<[^>]+>/g, '').trim() || '';

						return (
							<article key={item._id} className="related-card-item">
								{imgSrc && (
									<Link href={`/community/detail?id=${item._id}`} className="card-image-wrap">
										<img className="card-cover-img" src={imgSrc} alt={item.articleTitle} />
									</Link>
								)}

								<div className="card-content-wrap">
									<div className="text-body-group">
										<span className="cat-pill">{catLabel}</span>
										<Link href={`/community/detail?id=${item._id}`} className="title-link">
											<h3 className="card-title">{item.articleTitle}</h3>
										</Link>
										{excerpt && <p className="card-excerpt">{excerpt.slice(0, 100)}{excerpt.length > 100 ? '...' : ''}</p>}
									</div>

									<div className="card-footer-meta">
										<span className="author-meta">{authorName}</span>
										<div className="stats-meta">
											<span className="stat">
												<span className="material-symbols-outlined icon">favorite</span>{' '}
												{item.articleLikes || 0}
											</span>
											<span className="stat">
												<span className="material-symbols-outlined icon">chat_bubble</span>{' '}
												{item.articleComments || 0}
											</span>
										</div>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default CommunityDetailRelated;
