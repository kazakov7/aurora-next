import React, { useState } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_COMMENTS } from "../../../../apollo/user/query";
import { CREATE_COMMENT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { Property } from "../../../types/property/property";
import { Comment, Comments } from "../../../types/comment/comment";
import { CommentGroup } from "../../../enums/comment.enum";
import { Direction, Message } from "../../../enums/common.enum";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../../config";
import {
  sweetErrorAlert,
} from "../../../sweetAlert";
import { useI18n } from "../../../i18n";

interface PropertyCommentsProps {
  property: Property;
  refetchProperty?: () => Promise<unknown>;
}

const defaultAvatar = DEFAULT_USER_AVATAR;

const PropertyComments = ({
  property,
  refetchProperty,
}: PropertyCommentsProps) => {
  const { t, tError, formatDate } = useI18n();
  const user = useReactiveVar(userVar);
  const [commentText, setCommentText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState("newest");

  /** APOLLO REQUESTS **/
  const [createComment, { loading: commentLoading }] =
    useMutation(CREATE_COMMENT);

  const {
    data,
    loading,
    refetch: refetchComments,
  } = useQuery(GET_COMMENTS, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: currentPage,
        limit: 5,
        sort: sortType === "updated" ? "updatedAt" : "createdAt",
        direction: Direction.DESC,
        search: {
          commentRefId: property?._id || "",
          commentGroup: CommentGroup.PROPERTY,
        },
      },
    },
    skip: !property?._id,
  });

  const commentsList: Comment[] = data?.getComments?.list || [];
  const totalComments: number = data?.getComments?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(totalComments / 5) || 1;

  /** HANDLERS **/
  const handlePostComment = async () => {
    if (!user?._id) {
      await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
      return;
    }
    if (!commentText.trim()) {
      await sweetErrorAlert(t("hotels.comments.emptyComment"));
      return;
    }
    if (commentText.length > 500) {
      await sweetErrorAlert(t("hotels.comments.commentTooLong"));
      return;
    }

    try {
      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.PROPERTY,
            commentRefId: property._id,
            commentContent: commentText.trim(),
          },
        },
      });

      setCommentText("");
      // A new comment lands on the first page; changing the page refetches by itself
      if (currentPage !== 1) setCurrentPage(1);
      else await refetchComments();
      if (refetchProperty) await refetchProperty();
    } catch (err: any) {
      await sweetErrorAlert(tError(err, "hotels.comments.failedToPostComment"));
    }
  };

  const ratingVal =
    typeof property?.propertyRating === "number"
      ? property.propertyRating.toFixed(2)
      : "—";
  const displayTotal = totalComments || property?.propertyReviews || 0;

  return (
    <section className="property-comments-section">
      {/* Section Header & Aggregate Metrics */}
      <div className="comments-header-row">
        <div className="comments-title-group">
          <div className="comments-heading-wrap">
            <h2 className="comments-main-heading">{t("hotels.comments.guestComments")}</h2>
          </div>
          <p className="comments-subtext">
            {t("hotels.comments.evaluationsFor", { count: displayTotal, name: property.propertyName })}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="sort-control">
          <span className="sort-label">{t("common.sortBy")}</span>
          <div className="select-wrapper">
            <select
              className="sort-select"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="newest">{t("hotels.comments.mostRecent")}</option>
              <option value="updated">{t("hotels.comments.recentlyUpdated")}</option>
            </select>
            <span className="material-symbols-outlined select-arrow">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list-stack">
        {loading ? (
          <div className="comments-loading">
            <span className="material-symbols-outlined animate-spin">sync</span>
            <p>{t("hotels.comments.loadingEvaluations")}</p>
          </div>
        ) : commentsList.length > 0 ? (
          commentsList.map((comment: Comment, idx: number) => {
            const authorName =
              comment.memberData?.memberNick ||
              comment.memberData?.memberFullName ||
              t("hotels.comments.guest");
            const authorImg = getImageUrl(
              comment.memberData?.memberImage,
              defaultAvatar,
            );
            const formattedDate = formatDate(comment.createdAt) || t("common.dateUnavailable");

            return (
              <article key={comment._id || idx} className="review-card">
                <div className="review-card-top">
                  <div className="author-info">
                    <img
                      src={authorImg}
                      alt={authorName}
                      className="author-avatar"
                    />
                    <div className="author-meta">
                      <h3 className="author-name">{authorName}</h3>
                      <p className="stay-date">{t("hotels.comments.posted", { formattedDate })}</p>
                    </div>
                  </div>
                </div>
                <p className="review-content">{comment.commentContent}</p>
              </article>
            );
          })
        ) : (
          <div className="empty-reviews-state">
            <span className="material-symbols-outlined empty-icon">
              rate_review
            </span>
            <p className="empty-title">{t("hotels.comments.noEvaluationsPostedYet")}</p>
            <p className="empty-desc">
              {t("hotels.comments.beTheFirst", { propertyName: property.propertyName })}
            </p>
          </div>
        )}
      </div>

      {/* Comments Pagination */}
      {totalPages > 1 && (
        <div className="comments-pagination">
          <button
            className="page-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-num-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="page-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}

      {/* 7. Leave a Comment Box */}
      <div className="leave-comment-box">
        <div className="leave-comment-header">
          <span className="material-symbols-outlined form-icon">
            rate_review
          </span>
          <div>
            <h3 className="form-title">{t("hotels.comments.leaveAComment")}</h3>
            <p className="form-desc">
              {t("hotels.comments.formIntro")}
            </p>
          </div>
        </div>

        <div className="comment-form-body">
          <img
            src={getImageUrl(user?.memberImage, defaultAvatar)}
            alt={t("hotels.comments.currentUser")}
            className="user-comment-avatar"
          />
          <div className="textarea-wrapper">
            <textarea
              rows={3}
              className="comment-textarea"
              placeholder={t("hotels.comments.placeholder")}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
            ></textarea>
            <div className="form-actions-row">
              <span className="char-count">
                {t("hotels.comments.characterCount", { count: commentText.length })}
              </span>
              <div className="buttons-group">
                <button
                  type="button"
                  className="btn-submit"
                  disabled={commentLoading || !commentText.trim()}
                  onClick={handlePostComment}
                >
                  {commentLoading ? t("common.posting") : t("common.postComment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyComments;
