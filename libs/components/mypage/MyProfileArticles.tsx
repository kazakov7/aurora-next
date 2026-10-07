import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Direction } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { getImageUrl } from '../../config';
import WriteStoryModal from '../community/WriteStoryModal';

const MyProfileArticles: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [sortOrder, setSortOrder] = useState<string>('createdAt');
	const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
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

	const articles: BoardArticle[] = data?.getBoardArticles?.list || [];
	const total = data?.getBoardArticles?.metaCounter?.[0]?.total || articles.length;

	const formatDate = (dateInput?: Date | string) => {
		if (!dateInput) return 'Recently';
		const d = new Date(dateInput);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
						onClick={() => setIsWriteModalOpen(true)}
					>
						<span className="material-symbols-outlined">add</span>
						<span>Create Article</span>
					</button>
				</div>
			</div>

			{/* 3x3 Grid of Article Cards */}
			{articles.length > 0 ? (
				<div className="article-cards-grid">
					{articles.map((article: BoardArticle) => {
						const coverImg = getImageUrl(
							article?.articleImage,
							'https://lh3.googleusercontent.com/aida-public/AB6AXuDUEhXjn_69WvzlEU5J4bYkwwgYRXSTUGUbfr2-cVRpMOKeUrGLplFlb5qA2gTeG1yt9eJoPSIqk-F1sai0VN85JzT9xis-7UAQNnXVnT1nUg16U1F9QtcoKpPCenFOOIjPwUhoCoHRVH6Z2-MKZ_W7gTbfCtfc2VwdIqMWBp4olcJfmZ-SmfA8e4yj-P2rBKQ8_EnsNXD2MN_krk6x4rcr3rtBiQi7My5y9P55sZXSJ4EN91IPQAaP',
						);

						return (
							<article
								key={article._id}
								className="article-card-item"
								onClick={() => router.push(`/community/detail?id=${article._id}`)}
								style={{ cursor: 'pointer' }}
							>
								<div className="card-top">
									<div className="thumb-wrapper">
										<img src={coverImg} alt={article.articleTitle} />
										<span className="cat-tag">
											{article.articleCategory || 'Expedition Log'}
										</span>
										<button
											type="button"
											className="thumb-opts-btn"
											aria-label="Options"
											onClick={(e) => {
												e.stopPropagation();
											}}
										>
											<span className="material-symbols-outlined">more_horiz</span>
										</button>
									</div>
									<h3 className="article-title">{article.articleTitle}</h3>
									<p className="article-desc">
										{article.articleContent?.replace(/<[^>]*>/g, '') ||
											'High alpine retreat exploration and editorial dispatch across destinations.'}
									</p>
								</div>

								<div className="card-footer-stats">
									<span className="meta-read">{formatDate(article.createdAt)} · 6 min read</span>
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
				onCreated={() => refetch()}
			/>
		</div>
	);
};

export default MyProfileArticles;
