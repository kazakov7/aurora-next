import React, { useState } from "react";
import { BoardArticle } from "../../../types/board-article/board-article";
import { getImageUrl, DEFAULT_USER_AVATAR } from "../../../config";
import { sweetTopSmallSuccessAlert } from "../../../sweetAlert";
import FollowButton from "../../common/FollowButton";

interface CommunityDetailHeaderProps {
  article: BoardArticle;
  categoryLabel: string;
  likeCount: number;
  commentsCount: number;
  isFollowing?: boolean;
  onFollow?: () => void;
}

const formatDate = (date?: Date | string): string => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
};

const CommunityDetailHeader: React.FC<CommunityDetailHeaderProps> = ({
  article,
  categoryLabel,
  likeCount,
  commentsCount,
  isFollowing,
  onFollow,
}) => {
  const authorName =
    article.memberData?.memberFullName ||
    article.memberData?.memberNick ||
    "Member";

  const authorAvatar = getImageUrl(
    article.memberData?.memberImage,
    DEFAULT_USER_AVATAR,
  );

  const wordCount = (article.articleContent || "").trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 160));
  const excerpt = article.articleContent?.replace(/<[^>]+>/g, "").trim();
  const publishedDate = formatDate(article.createdAt);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        sweetTopSmallSuccessAlert("Article URL copied to clipboard!");
      } catch {
        sweetTopSmallSuccessAlert("Link copied!");
      }
    }
  };

  return (
    <header className="community-detail-header-wrap">
      <div className="category-pill-badge">{categoryLabel}</div>

      <h1 className="article-main-title">{article.articleTitle}</h1>

      {excerpt && (
        <p className="article-lead-subtitle">
          {excerpt.slice(0, 180)}
          {excerpt.length > 180 ? "..." : ""}
        </p>
      )}

      {/* Author & Action Row */}
      <div className="author-actions-row">
        <div className="author-meta-left">
          <img className="author-avatar" src={authorAvatar} alt={authorName} />
          <div className="author-text">
            <div className="name-verified">
              <span className="author-name">{authorName}</span>
            </div>
            <span className="date-readtime">
              {publishedDate ? `Published ${publishedDate} · ` : ""}
              {readTimeMinutes} min read
            </span>
          </div>
        </div>

        <div className="author-actions-right">
          <FollowButton
            isFollowing={!!isFollowing}
            onClick={onFollow || (() => {})}
            size="sm"
          />
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
          <span>{article.articleViews ?? 0} Views</span>
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
