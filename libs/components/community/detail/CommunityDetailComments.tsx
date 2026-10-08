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

const formatTimeAgo = (dateStr?: Date | string): string => {
  if (!dateStr) return "";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} mo ago`;
  } catch {
    return "";
  }
};

const CommunityDetailComments: React.FC<CommunityDetailCommentsProps> = ({
  articleId,
  onCommentsCountChange,
}) => {
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
      sweetMixinErrorAlert(Messages.error2);
      return;
    }

    if (!commentText.trim()) {
      sweetMixinErrorAlert(Messages.error4 || "Please enter a comment");
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
      sweetMixinErrorAlert(err.message || Messages.error1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="comments-section"
      aria-label="Reader Comments"
      className="community-detail-comments-section"
    >
      {/* Comments Header Bar */}
      <div className="comments-header-bar">
        <div className="title-and-badge">
          <h2 className="section-title">Comments</h2>
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
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      {loading && commentsList.length === 0 ? (
        <div className="comments-loading">
          <div className="loading-spinner" />
          <p>Loading comments...</p>
        </div>
      ) : commentsList.length > 0 ? (
        <div className="comments-items-list">
          {commentsList.map((c) => {
            const authorName =
              c.memberData?.memberFullName ||
              c.memberData?.memberNick ||
              "Member";
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
                      {formatTimeAgo(c.createdAt) && (
                        <span className="time-ago">{formatTimeAgo(c.createdAt)}</span>
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
          <p>No comments yet. Be the first to share your perspectives!</p>
        </div>
      )}

      {/* Comments Pagination */}
      {totalComments > 5 && (
        <div className="comments-pagination-bar">
          <span className="pagination-info">
            Showing {(currentPage - 1) * 5 + 1}–
            {Math.min(currentPage * 5, totalComments)} of {totalComments}{" "}
            comments
          </span>

          <div className="pagination-pills">
            <button
              type="button"
              className="nav-arrow-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous page"
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
              aria-label="Next page"
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
            alt="User profile"
          />
          <h3 className="form-title">Join the Conversation</h3>
        </div>

        <div className="textarea-wrapper">
          <textarea
            className="comment-textarea"
            rows={4}
            maxLength={500}
            placeholder="Share your thoughts, experience, or a question about this article..."
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
            {commentText.length} / 500 characters
          </span>

          <button
            type="button"
            className="post-comment-btn"
            disabled={submitting || !commentText.trim()}
            onClick={handlePostComment}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunityDetailComments;
