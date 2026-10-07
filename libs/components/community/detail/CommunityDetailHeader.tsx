import React, { useState } from 'react';
import { BoardArticle } from '../../../types/board-article/board-article';
import { getImageUrl } from '../../../config';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface CommunityDetailHeaderProps {
	article: BoardArticle;
	categoryLabel: string;
	isLiked: boolean;
	likeCount: number;
	commentsCount: number;
	onLike?: () => void;
}

const formatDate = (date?: Date | string): string => {
	if (!date) return 'Recently';
	try {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	} catch {
		return 'Recently';
	}
};

const CommunityDetailHeader: React.FC<CommunityDetailHeaderProps> = ({
	article,
	categoryLabel,
	isLiked,
	likeCount,
	commentsCount,
}) => {
	const [following, setFollowing] = useState(false);

	const authorName =
		article.memberData?.memberFullName ||
		article.memberData?.memberNick ||
		'Elena Rostova';

	const authorAvatar = getImageUrl(
		article.memberData?.memberImage,
		'https://lh3.googleusercontent.com/aida-public/AB6AXuCZwS2q9FiI6t-TdzstsQWJynhvoIbCMi32Axi0rlxQP_jpOgOGKUaWczO3KZ7ek_ImVkdYG3EbkxMW76Jk801eczjlDq_iG5rLhnuS-ubt5KCD-_Hp0eQeH9g23yEP3AP62FQlopHOLRAI-cNOXSPwLC77K2MP9Mb8QZdM8qe-19sZRYhXyaQVHxxWf8-RegVD3m5lotxy_gxBagOldOsrPgPTaIYZuIYBBbw6wWVniooLWHIidZzM'
	);

	const wordCount = (article.articleContent || '').trim().split(/\s+/).length;
	const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 160));

	const handleFollowToggle = () => {
		const next = !following;
		setFollowing(next);
		sweetTopSmallSuccessAlert(next ? `Following ${authorName}` : `Unfollowed ${authorName}`);
	};

	const handleShare = async () => {
		if (typeof window !== 'undefined') {
			try {
				await navigator.clipboard.writeText(window.location.href);
				sweetTopSmallSuccessAlert('Article URL copied to clipboard!');
			} catch {
				sweetTopSmallSuccessAlert('Link copied!');
			}
		}
	};

	return (
		<header className="community-detail-header-wrap">
			<div className="category-pill-badge">{categoryLabel}</div>

			<h1 className="article-main-title">{article.articleTitle}</h1>

			<p className="article-lead-subtitle">
				{article.articleContent
					? article.articleContent.slice(0, 180) + '...'
					: 'Beyond the vibrant neon pulse of modern metropolitan landscapes lies a tranquil realm of mist-shrouded peaks and centuries-old sanctuaries.'}
			</p>

			{/* Author & Action Row */}
			<div className="author-actions-row">
				<div className="author-meta-left">
					<img
						className="author-avatar"
						src={authorAvatar}
						alt={authorName}
					/>
					<div className="author-text">
						<div className="name-verified">
							<span className="author-name">{authorName}</span>
							<span
								className="material-symbols-outlined verified-icon"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								verified
							</span>
						</div>
						<span className="date-readtime">
							Published {formatDate(article.createdAt)} · {readTimeMinutes} min read
						</span>
					</div>
				</div>

				<div className="author-actions-right">
					<button
						type="button"
						className={`follow-author-btn ${following ? 'following' : ''}`}
						onClick={handleFollowToggle}
					>
						<span className="material-symbols-outlined">
							{following ? 'check' : 'add'}
						</span>
						<span>{following ? 'Following' : 'Follow'}</span>
					</button>

					<button
						type="button"
						className="share-icon-btn"
						aria-label="Share article"
						onClick={handleShare}
					>
						<span className="material-symbols-outlined">share</span>
					</button>
				</div>
			</div>

			{/* Engagement Counts */}
			<div className="engagement-counts-bar">
				<span className="count-item">
					<span className="material-symbols-outlined icon">visibility</span>
					<span>{article.articleViews || 1} Views</span>
				</span>
				<span className="bullet">•</span>
				<span className="count-item liked">
					<span
						className="material-symbols-outlined icon heart-icon"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						favorite
					</span>
					<span>{likeCount} Likes</span>
				</span>
				<span className="bullet">•</span>
				<span className="count-item">
					<span className="material-symbols-outlined icon">chat_bubble</span>
					<span>{commentsCount} Comments</span>
				</span>
			</div>
		</header>
	);
};

export default CommunityDetailHeader;
