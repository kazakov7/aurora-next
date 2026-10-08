import React from 'react';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import LikeButton from '../../common/LikeButton';

interface CommunityDetailEngagementBarProps {
	isLiked: boolean;
	likeCount: number;
	commentsCount: number;
	onLike: () => void;
	onScrollToComments: () => void;
}

const CommunityDetailEngagementBar: React.FC<CommunityDetailEngagementBarProps> = ({
	isLiked,
	likeCount,
	commentsCount,
	onLike,
	onScrollToComments,
}) => {
	const handleCopyLink = async () => {
		if (typeof window !== 'undefined') {
			try {
				await navigator.clipboard.writeText(window.location.href);
				sweetTopSmallSuccessAlert('Link copied to clipboard!');
			} catch {
				sweetTopSmallSuccessAlert('Link copied!');
			}
		}
	};

	const handleShare = async () => {
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({
					title: document.title,
					url: window.location.href,
				});
			} catch {
				handleCopyLink();
			}
		} else {
			handleCopyLink();
		}
	};

	return (
		<div className="community-detail-engagement-bar">
			<div className="left-actions-group">
				{/* Like Button */}
				<LikeButton 
					isLiked={isLiked} 
					onClick={onLike} 
					count={likeCount} 
				/>

				{/* Comments Button */}
				<button
					type="button"
					className="engagement-comment-btn"
					onClick={onScrollToComments}
				>
					<span className="material-symbols-outlined comment-icon">chat_bubble</span>
					<span className="label-count">{commentsCount} Comments</span>
				</button>

			</div>

			<div className="right-actions-group">
				<button
					type="button"
					className="copy-link-btn"
					onClick={handleCopyLink}
				>
					<span className="material-symbols-outlined icon">content_copy</span>
					<span>Copy Link</span>
				</button>

				<button
					type="button"
					aria-label="Share"
					className="share-btn"
					onClick={handleShare}
				>
					<span className="material-symbols-outlined">share</span>
				</button>
			</div>
		</div>
	);
};

export default CommunityDetailEngagementBar;
