import React, { useState } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_COMMENTS } from "../../../../apollo/user/query";
import { CREATE_COMMENT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { Property } from "../../../types/property/property";
import { Comment, Comments } from "../../../types/comment/comment";
import { CommentGroup } from "../../../enums/comment.enum";
import { Direction, Message } from "../../../enums/common.enum";
import { getImageUrl } from "../../../config";
import {
  sweetErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../../sweetAlert";

interface PropertyCommentsProps {
  property: Property;
  refetchProperty?: () => void;
}

const defaultAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDNwjaJfe5FznXVWjC98idcDi4DqpVr_EpBIGfDhSYg4lqKlNMKynXtRV-ExppnYCoAK6aDg2F96vUPOaFl0g4HL3EYKtNIb9kv01AynkKtopQs5uMTQuHBLlOrye7Y50bsvg1SbzJgGsvNnVEj6WcNKUO8fzOiY7tYxFT92mJIl0ixlefWggq9cezxXRiV2U-ojBzAYHMkSAUFdvar1Wt5LIP3UDuh9GgQg8HmI8A8zOlLmZdX759";

const PropertyComments = ({
  property,
  refetchProperty,
}: PropertyCommentsProps) => {
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
        sort: sortType === "highest" ? "commentRating" : "createdAt",
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
      await sweetErrorAlert(Message.NOT_AUTHENTICATED);
      return;
    }
    if (!commentText.trim()) {
      await sweetErrorAlert("Please enter a comment before submitting.");
      return;
    }
    if (commentText.length > 500) {
      await sweetErrorAlert("Comment must not exceed 500 characters.");
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
      await sweetTopSmallSuccessAlert("Your evaluation has been posted!");
      await refetchComments();
      if (refetchProperty) refetchProperty();
    } catch (err: any) {
      await sweetErrorAlert(err.message || "Failed to post comment.");
    }
  };

  const ratingVal = property?.propertyRating
    ? property.propertyRating.toFixed(2)
    : "4.98";
  const displayTotal =
    totalComments > 0 ? totalComments : property?.propertyReviews || 248;

  return (
    <section className="property-comments-section">
      {/* Section Header & Aggregate Metrics */}
      <div className="comments-header-row">
        <div className="comments-title-group">
          <div className="comments-heading-wrap">
            <h2 className="comments-main-heading">Guest Comments</h2>
            <div className="score-pill">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>{ratingVal}</span>
            </div>
          </div>
          <p className="comments-subtext">
            Authentic evaluations by {displayTotal} verified guests who stayed
            at {property?.propertyName || "Alpine Grand Retreat"}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="sort-control">
          <span className="sort-label">Sort by:</span>
          <div className="select-wrapper">
            <select
              className="sort-select"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="highest">Highest Rated</option>
              <option value="newest">Most Recent</option>
              <option value="detailed">Detailed Feedback</option>
            </select>
            <span className="material-symbols-outlined select-arrow">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Category Rating Progress Bars */}
      <div className="ratings-metrics-grid">
        <div className="metric-bar-item">
          <div className="metric-label-row">
            <span>Cleanliness</span>
            <span className="metric-score">5.0</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "100%" }}></div>
          </div>
        </div>
        <div className="metric-bar-item">
          <div className="metric-label-row">
            <span>Architecture & Design</span>
            <span className="metric-score">4.9</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "98%" }}></div>
          </div>
        </div>
        <div className="metric-bar-item">
          <div className="metric-label-row">
            <span>Alpine Location</span>
            <span className="metric-score">5.0</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "100%" }}></div>
          </div>
        </div>
        <div className="metric-bar-item">
          <div className="metric-label-row">
            <span>White-Glove Service</span>
            <span className="metric-score">4.9</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "98%" }}></div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list-stack">
        {loading ? (
          <div className="comments-loading">
            <span className="material-symbols-outlined animate-spin">sync</span>
            <p>Loading evaluations...</p>
          </div>
        ) : commentsList.length > 0 ? (
          commentsList.map((comment: Comment, idx: number) => {
            const authorName =
              comment.memberData?.memberNick ||
              comment.memberData?.memberFullName ||
              "Verified Voyager";
            const authorImg = getImageUrl(
              comment.memberData?.memberImage,
              defaultAvatar,
            );
            const formattedDate = new Date(
              comment.createdAt,
            ).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });

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
                      <p className="stay-date">
                        Stayed {formattedDate} • Verified Stay
                      </p>
                    </div>
                  </div>
                  <div className="stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined star-icon"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
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
            <p className="empty-title">No evaluations posted yet</p>
            <p className="empty-desc">
              Be the first verified voyager to share your experience staying at{" "}
              {property?.propertyName || "this sanctuary"}.
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
            <h3 className="form-title">Leave a Comment</h3>
            <p className="form-desc">
              Share your verified sanctuary experience with future voyagers
            </p>
          </div>
        </div>

        <div className="comment-form-body">
          <img
            src={getImageUrl(
              user?.memberImage,
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCK159XgBwM6kPjC2DqGvQ_X6ZqE_a8qR29oYd91hYd739m50f3A2nO6bYvB1m4qV9jZ7WvK6R9j_vC8xY2n_K8A2j_6N8bY4v-7",
            )}
            alt="Current user"
            className="user-comment-avatar"
          />
          <div className="textarea-wrapper">
            <textarea
              rows={3}
              className="comment-textarea"
              placeholder="Share your experience (e.g. scenic views, check-in, breakfast quality, spa temperatures)..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
            ></textarea>
            <div className="form-actions-row">
              <span className="char-count">
                {commentText.length} / 500 characters
              </span>
              <div className="buttons-group">
                <button
                  type="button"
                  className="btn-submit"
                  disabled={commentLoading || !commentText.trim()}
                  onClick={handlePostComment}
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
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
