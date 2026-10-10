import React, { useState } from "react";
import { BoardArticle } from "../../../types/board-article/board-article";
import { getImageUrl, DEFAULT_USER_AVATAR } from "../../../config";
import { sweetTopSmallSuccessAlert } from "../../../sweetAlert";
import FollowButton from "../../common/FollowButton";
import { useI18n } from "../../../i18n";

interface CommunityDetailHeaderProps {
  article: BoardArticle;
  categoryLabel: string;
  likeCount: number;
  commentsCount: number;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  onFollow?: () => void;
}

const CommunityDetailHeader: React.FC<CommunityDetailHeaderProps> = ({
  article,
  categoryLabel,
  likeCount,
  commentsCount,
  isFollowing,
  showFollowButton = true,
  onFollow,
}) => {
  const { t, formatDate } = useI18n();
  const authorName =
    article.memberData?.memberFullName ||
    article.memberData?.memberNick ||
    t("common.member");

  const authorAvatar = getImageUrl(
    article.memberData?.memberImage,
    DEFAULT_USER_AVATAR,
  );

  const wordCount = (article.articleContent || "").trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 160));
  const excerpt = article.articleContent?.replace(/<[^>]+>/g, "").trim();
  const publishedDate = formatDate(article.createdAt, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        sweetTopSmallSuccessAlert(t("community.detailHeader.urlCopied"));
      } catch {
        sweetTopSmallSuccessAlert(t("common.linkCopied"));
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
              {publishedDate
                ? t("community.detailHeader.publishedReadTime", { date: publishedDate, minutes: readTimeMinutes })
                : t("community.detailHeader.readTime", { minutes: readTimeMinutes })}
            </span>
          </div>
        </div>

        <div className="author-actions-right">
          {showFollowButton && (<FollowButton isFollowing={!!isFollowing} onClick={onFollow || (() => {})} size="sm" />)}
          <button
            type="button"
            className="share-icon-btn"
            aria-label={t("community.detailHeader.shareArticle")}
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
          <span>{t("community.detailHeader.views", { articleViews: article.articleViews ?? 0 })}</span>
        </span>
        <span className="bullet">•</span>
        <span className="count-item liked">
          <span
            className="material-symbols-outlined icon heart-icon"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span>{t("community.detailHeader.likes", { likeCount })}</span>
        </span>
        <span className="bullet">•</span>
        <span className="count-item">
          <span className="material-symbols-outlined icon">chat_bubble</span>
          <span>{t("community.detailHeader.comments", { commentsCount })}</span>
        </span>
      </div>
    </header>
  );
};

export default CommunityDetailHeader;
