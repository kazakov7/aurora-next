import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_COMMENTS } from "../../../../apollo/user/query";
import { CREATE_COMMENT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { Comment } from "../../../types/comment/comment";
import { CommentGroup } from "../../../enums/comment.enum";
import { Direction, Message } from "../../../enums/common.enum";
import { DEFAULT_USER_AVATAR, getImageUrl, Messages } from "../../../config";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../../sweetAlert";
import { useI18n } from "../../../i18n";

interface CommunityDetailCommentsProps {
  articleId: string;
  onCommentsCountChange?: (count: number) => void;
}

interface CommentsQueryData {
  getComments?: {
    list?: Comment[];
    metaCounter?: Array<{ total: number }>;
  };
}

const defaultAvatar = DEFAULT_USER_AVATAR;

const CommunityDetailComments: React.FC<CommunityDetailCommentsProps> = ({
  articleId,
  onCommentsCountChange,
}) => {
  const { t, tError, formatRelativeTime } = useI18n();
  const user = useReactiveVar(userVar);
  const [commentText, setCommentText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [submitting, setSubmitting] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const syncCommentsState = (result?: CommentsQueryData) => {
    const nextComments = result?.getComments?.list ?? [];
    const nextTotal = result?.getComments?.metaCounter?.[0]?.total ?? 0;

    setCommentsList(nextComments);
    setTotalComments(nextTotal);
    setTotalPages(Math.max(1, Math.ceil(nextTotal / 5)));
    onCommentsCountChange?.(nextTotal);
  };

  /** APOLLO REQUESTS **/
  const [createComment] = useMutation(CREATE_COMMENT);

  const {
    data,
    loading,
    refetch: refetchComments,
  } = useQuery<CommentsQueryData>(GET_COMMENTS, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: currentPage,
        limit: 5,
        sort: "createdAt",
        direction: sortOrder === "oldest" ? Direction.ASC : Direction.DESC,
        search: {
          commentRefId: articleId,
          commentGroup: CommentGroup.ARTICLE,
        },
      },
    },
    skip: !articleId,
  });

  useEffect(() => {
    syncCommentsState(data);
  }, [data]);

  const handlePostComment = async () => {
    if (!user?._id) {
      sweetMixinErrorAlert(t(Messages.error2));
      return;
    }

    if (!commentText.trim()) {
      sweetMixinErrorAlert(t(Messages.error4) || t("community.detailComments.pleaseEnterAComment"));
      return;
    }

    try {
      setSubmitting(true);
      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.ARTICLE,
            commentContent: commentText.trim(),
            commentRefId: articleId,
          },
        },
      });
      setCommentText("");
      setCurrentPage(1);
      const refreshed = await refetchComments({
        input: {
          page: 1,
          limit: 5,
          sort: "createdAt",
          direction: sortOrder === "oldest" ? Direction.ASC : Direction.DESC,
          search: {
            commentRefId: articleId,
            commentGroup: CommentGroup.ARTICLE,
          },
        },
      });
      syncCommentsState(refreshed.data);
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err, Messages.error1));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="comments-section"
      aria-label={t("community.detailComments.readerComments")}
      className="community-detail-comments-section"
    >
      {/* Comments Header Bar */}
      <div className="comments-header-bar">
        <div className="title-and-badge">
          <h2 className="section-title">{t("common.comments")}</h2>
          <span className="count-pill">{totalComments}</span>
        </div>

        <div className="sort-select-group">
          <span className="material-symbols-outlined sort-icon">sort</span>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            className="sort-dropdown"
          >
            <option value="newest">{t("community.detailComments.sortNewest")}</option>
            <option value="oldest">{t("community.detailComments.sortOldest")}</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      {loading && commentsList.length === 0 ? (
        <div className="comments-loading">
          <div className="loading-spinner" />
          <p>{t("community.detailComments.loadingComments")}</p>
        </div>
      ) : commentsList.length > 0 ? (
        <div className="comments-items-list">
          {commentsList.map((c) => {
            const authorName =
              c.memberData?.memberFullName ||
              c.memberData?.memberNick ||
              t("common.member");
            const authorHandle = c.memberData?.memberNick
              ? `@${c.memberData.memberNick.toLowerCase()}`
              : "";
            const authorImg = getImageUrl(
              c.memberData?.memberImage,
              defaultAvatar,
            );
            return (
              <article key={c._id} className="comment-item-card">
                <div className="comment-top-row">
                  <div className="user-profile-left">
                    <img
                      className="user-avatar"
                      src={authorImg}
                      alt={authorName}
                    />
                    <div className="user-names">
                      <div className="name-and-handle">
                        <span className="name">{authorName}</span>
                        {authorHandle && <span className="handle">{authorHandle}</span>}
                      </div>
                      {formatRelativeTime(c.createdAt) && (
                        <span className="time-ago">{formatRelativeTime(c.createdAt)}</span>
                      )}
                    </div>
                  </div>

                </div>

                <p className="comment-content-text">{c.commentContent}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="comments-empty-box">
          <span className="material-symbols-outlined icon">forum</span>
          <p>{t("community.detailComments.empty")}</p>
        </div>
      )}

      {/* Comments Pagination */}
      {totalComments > 5 && (
        <div className="comments-pagination-bar">
          <span className="pagination-info">
            {t("community.detailComments.showingRange", { currentPage: (currentPage - 1) * 5 + 1, math: Math.min(currentPage * 5, totalComments), totalComments })}
          </span>

          <div className="pagination-pills">
            <button
              type="button"
              className="nav-arrow-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label={t("common.previousPage")}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  type="button"
                  className={`page-pill ${currentPage === p ? "active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              className="nav-arrow-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label={t("common.nextPage")}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Write Comment Form: "Join the Conversation" */}
      <div className="write-comment-card">
        <div className="author-heading-row">
          <img
            className="current-user-avatar"
            src={getImageUrl(user?.memberImage, defaultAvatar)}
            alt={t("community.detailComments.userProfile")}
          />
          <h3 className="form-title">{t("community.detailComments.joinTheConversation")}</h3>
        </div>

        <div className="textarea-wrapper">
          <textarea
            className="comment-textarea"
            rows={4}
            maxLength={500}
            placeholder={t("community.detailComments.placeholder")}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </div>

        <div className="form-footer-row">
          <span
            className={`char-counter ${
              commentText.length >= 480 ? "warning" : ""
            }`}
          >
            {t("community.detailComments.characterCount", { count: commentText.length })}
          </span>

          <button
            type="button"
            className="post-comment-btn"
            disabled={submitting || !commentText.trim()}
            onClick={handlePostComment}
          >
            {submitting ? t("common.posting") : t("common.postComment")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunityDetailComments;
