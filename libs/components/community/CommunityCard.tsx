import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BoardArticle } from '../../types/board-article/board-article';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';
import LikeButton from '../common/LikeButton';
import SaveButton from '../common/SaveButton';

interface CommunityCardProps {
	article: BoardArticle;
	onLike: (articleId: string) => void;
	isLiked: boolean;
	likeCount: number;
}

const categoryDisplayMap: Record<string, string> = {
	TOUR: 'Itinerary / Expedition',
	HOTEL: 'Hotel Review',
	DESTINATION: 'Photography & Sights',
	GUIDE: 'Expedition Log',
	NEWS: 'Local Insight',
};

const formatTimeAgo = (dateStr?: Date | string): string => {
	if (!dateStr) return 'Recently';
	try {
		const diffMs = Date.now() - new Date(dateStr).getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours} hrs ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 30) return `${diffDays} days ago`;
		return `${Math.floor(diffDays / 30)} mo ago`;
	} catch {
		return 'Recently';
	}
};

const CommunityCard: React.FC<CommunityCardProps> = ({
	article,
	onLike,
	isLiked,
	likeCount,
}) => {
	const router = useRouter();
	const [bookmarked, setBookmarked] = useState(false);

	const authorName =
		article.memberData?.memberFullName ||
		article.memberData?.memberNick ||
		'Verified Traveler';

	const authorAvatar = getImageUrl(
		article.memberData?.memberImage,
		'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
	);

	const featuredImage = getImageUrl(
		article.articleImage,
		'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80'
	);

	const categoryBadge =
		categoryDisplayMap[article.articleCategory] || article.articleCategory || 'Story';

	// Reading time calculation
	const wordCount = (article.articleContent || '').trim().split(/\s+/).length;
	const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 180));

	const handleShare = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (typeof window !== 'undefined') {
			try {
				await navigator.clipboard.writeText(
						`${window.location.origin}/community/detail?id=${article._id}`
				);
				sweetTopSmallSuccessAlert('Story link copied to clipboard!');
			} catch {
				sweetTopSmallSuccessAlert('Link copied!');
			}
		}
	};

	const handleBookmarkToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setBookmarked(!bookmarked);
		sweetTopSmallSuccessAlert(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
	};

	const openArticle = () => {
		void router.push({ pathname: '/community/detail', query: { id: article._id } });
	};

	const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
		if ((event.target as HTMLElement).closest('a, button')) return;
		openArticle();
	};

	const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openArticle();
		}
	};

	return (
		<article className="community-card-article" role="link" tabIndex={0} onClick={handleCardClick} onKeyDown={handleCardKeyDown}>
			{/* Author Header */}
			<div className="card-author-row">
				<div className="author-info-group">
					<div className="avatar-wrapper">
						<img
							className="avatar-img"
							src={authorAvatar}
							alt={authorName}
						/>
						<span className="verified-badge-pill" title="Verified Explorer">
							<span className="material-symbols-outlined icon">verified</span>
						</span>
					</div>

					<div className="author-details">
						<div className="name-and-badge">
							<span className="author-name">{authorName}</span>
							<span className="badge-pill">Verified Explorer</span>
						</div>
						<div className="meta-subline">
							<span>Aura Member</span>
							<span className="bullet">·</span>
							<span>{formatTimeAgo(article.createdAt)}</span>
						</div>
					</div>
				</div>

				<SaveButton 
					isSaved={bookmarked} 
					onClick={handleBookmarkToggle} 
				/>
			</div>

			{/* Post Body: Badges, Title & Content */}
			<div className="card-body-section">
				<div className="tags-row">
					<span className="category-tag-pill">{categoryBadge}</span>
					<span className="read-time">{readTimeMinutes} min read</span>
				</div>

				<Link href={`/community/detail?id=${article._id}`} className="title-link">
					<h2 className="article-title">{article.articleTitle}</h2>
				</Link>

				<p className="article-excerpt">{article.articleContent}</p>
			</div>

			{/* Featured Photography */}
			<div className="card-featured-media">
				<img
					className="featured-image"
					src={featuredImage}
					alt={article.articleTitle}
				/>
				<div className="location-pill-overlay">
					<span className="material-symbols-outlined pin-icon">location_on</span>
					<span>{categoryBadge}</span>
				</div>
			</div>

			{/* Post Footer Actions */}
			<div className="card-footer-actions">
				<div className="left-engagement-group">
					{/* Like Button */}
						<LikeButton
							isLiked={isLiked}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onLike(article._id);
							}}
							count={likeCount}
							size="sm"
					/>

					{/* Comments Button */}
					<button
						type="button"
						className="comment-action-btn"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<span className="material-symbols-outlined icon">chat_bubble_outline</span>
						<span className="count">{article.articleComments || 0}</span>
					</button>

					{/* Share Button */}
					<button
						type="button"
						className="share-action-btn"
						title="Share story"
						onClick={handleShare}
					>
						<span className="material-symbols-outlined icon">share</span>
					</button>
				</div>

				<Link href={`/community/detail?id=${article._id}`} className="read-dispatch-link">
					<span>Read Full Dispatch</span>
					<span className="material-symbols-outlined icon">arrow_forward</span>
				</Link>
			</div>
		</article>
	);
};

export default CommunityCard;
