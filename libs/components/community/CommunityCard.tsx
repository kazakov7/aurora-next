import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BoardArticle } from '../../types/board-article/board-article';
import { getImageUrl, DEFAULT_USER_AVATAR } from '../../config';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';
import LikeButton from '../common/LikeButton';
import { useI18n } from '../../i18n';

interface CommunityCardProps {
	article: BoardArticle;
	onLike: (articleId: string) => void;
	isLiked: boolean;
	likeCount: number;
}

const categoryLabelKeys: Record<string, string> = {
	TOUR: 'community.card.category.TOUR',
	HOTEL: 'community.card.category.HOTEL',
	DESTINATION: 'community.card.category.DESTINATION',
	GUIDE: 'community.card.category.GUIDE',
	NEWS: 'community.card.category.NEWS',
};


const CommunityCard: React.FC<CommunityCardProps> = ({
	article,
	onLike,
	isLiked,
	likeCount,
}) => {
	const { t, formatDate } = useI18n();
	const router = useRouter();
	const authorName =
		article.memberData?.memberFullName ||
		article.memberData?.memberNick ||
		t('common.member');

	const authorAvatar = getImageUrl(
		article.memberData?.memberImage,
		DEFAULT_USER_AVATAR
	);

	const featuredImage = article.articleImage ? getImageUrl(article.articleImage) : undefined;

	const categoryBadge =
		(categoryLabelKeys[article.articleCategory] && t(categoryLabelKeys[article.articleCategory])) || article.articleCategory || t('common.uncategorized');
	const articleExcerpt = article.articleContent?.replace(/<[^>]+>/g, '').trim() || '';

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
				sweetTopSmallSuccessAlert(t('community.card.linkCopied'));
			} catch {
				sweetTopSmallSuccessAlert(t('common.linkCopied'));
			}
		}
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
					</div>

					<div className="author-details">
						<div className="name-and-badge"><span className="author-name">{authorName}</span></div>
						<div className="meta-subline">
							{formatDate(article.createdAt, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) && <span>{formatDate(article.createdAt, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>}
						</div>
					</div>
				</div>
			</div>

			{/* Post Body: Badges, Title & Content */}
			<div className="card-body-section">
				<div className="tags-row">
					<span className="category-tag-pill">{categoryBadge}</span>
					<span className="read-time">{t('community.card.minRead', { readTimeMinutes })}</span>
				</div>

				<Link href={`/community/detail?id=${article._id}`} className="title-link">
					<h2 className="article-title">{article.articleTitle}</h2>
				</Link>

				{articleExcerpt && <p className="article-excerpt">{articleExcerpt}</p>}
			</div>

			{/* Featured Photography */}
			{featuredImage && (
				<div className="card-featured-media">
					<img className="featured-image" src={featuredImage} alt={article.articleTitle} />
					{article.memberData?.memberAddress && (
						<div className="location-pill-overlay">
							<span className="material-symbols-outlined pin-icon">location_on</span>
							<span>{article.memberData.memberAddress}</span>
						</div>
					)}
				</div>
			)}

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
							openArticle();
						}}
					>
						<span className="material-symbols-outlined icon">chat_bubble_outline</span>
						<span className="count">{article.articleComments || 0}</span>
					</button>

					{/* Share Button */}
					<button
						type="button"
						className="share-action-btn"
						title={t('community.card.shareStory')}
						onClick={handleShare}
					>
						<span className="material-symbols-outlined icon">share</span>
					</button>
				</div>

				<Link href={`/community/detail?id=${article._id}`} className="read-dispatch-link">
					<span>{t('community.card.readFullDispatch')}</span>
					<span className="material-symbols-outlined icon">arrow_forward</span>
				</Link>
			</div>
		</article>
	);
};

export default CommunityCard;
