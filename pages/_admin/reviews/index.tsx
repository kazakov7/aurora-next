import React, { useState } from "react";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_ALL_COMMENTS_BY_ADMIN,
  GET_ALL_DESTINATION_REVIEWS_BY_ADMIN,
} from "../../../apollo/admin/query";
import {
  REMOVE_COMMENT_BY_ADMIN,
  REMOVE_DESTINATION_REVIEW_BY_ADMIN,
} from "../../../apollo/admin/mutation";
import { Comment } from "../../../libs/types/comment/comment";
import { AllCommentsInquiry } from "../../../libs/types/comment/comment.input";
import { Review } from "../../../libs/types/review/review";
import { AllDestinationReviewsInquiry } from "../../../libs/types/review/review.input";
import { Member } from "../../../libs/types/member/member";
import { CommentGroup } from "../../../libs/enums/comment.enum";
import { ReviewStatus } from "../../../libs/enums/review.enum";
import { Direction } from "../../../libs/enums/common.enum";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../../libs/config";
import {
  sweetConfirmAlert,
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../../libs/sweetAlert";
import { useI18n } from "../../../libs/i18n";

const PAGE_LIMIT = 10;
/** Where a comment's target is opened, to read the comment in its context **/
const TARGET_ROUTES: Record<CommentGroup, string> = {
  [CommentGroup.PROPERTY]: "/property/detail",
  [CommentGroup.TOUR]: "/tour/detail",
  [CommentGroup.DESTINATION]: "/destination/detail",
  [CommentGroup.ARTICLE]: "/community/detail",
};
const INITIAL_COMMENT_FILTER: AllCommentsInquiry = {
  page: 1,
  limit: PAGE_LIMIT,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};
const INITIAL_REVIEW_FILTER: AllDestinationReviewsInquiry = {
  page: 1,
  limit: PAGE_LIMIT,
  search: {},
};

const AdminReviewsPage: NextPage = () => {
  const { t, tEnum, tError, formatDate } = useI18n();
  const [activeTab, setActiveTab] = useState<"comments" | "reviews">(
    "comments",
  );
  const [commentFilter, setCommentFilter] = useState<AllCommentsInquiry>(
    INITIAL_COMMENT_FILTER,
  );
  const [reviewFilter, setReviewFilter] =
    useState<AllDestinationReviewsInquiry>(INITIAL_REVIEW_FILTER);

  /** APOLLO REQUESTS **/
  const {
    data: commentData,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useQuery(GET_ALL_COMMENTS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: commentFilter },
    skip: activeTab !== "comments",
    notifyOnNetworkStatusChange: true,
  });
  const {
    data: reviewData,
    loading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery(GET_ALL_DESTINATION_REVIEWS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: reviewFilter },
    skip: activeTab !== "reviews",
    notifyOnNetworkStatusChange: true,
  });

  const [removeCommentByAdmin] = useMutation(REMOVE_COMMENT_BY_ADMIN);
  const [removeDestinationReviewByAdmin] = useMutation(
    REMOVE_DESTINATION_REVIEW_BY_ADMIN,
  );

  const isComments = activeTab === "comments";
  const comments: Comment[] = commentData?.getAllCommentsByAdmin?.list || [];
  const reviews: Review[] =
    reviewData?.getAllDestinationReviewsByAdmin?.list || [];
  const total = isComments
    ? commentData?.getAllCommentsByAdmin?.metaCounter?.[0]?.total || 0
    : reviewData?.getAllDestinationReviewsByAdmin?.metaCounter?.[0]?.total ||
      0;
  const loading = isComments ? commentsLoading : reviewsLoading;
  const page = isComments ? commentFilter.page : reviewFilter.page;
  const searchText =
    (isComments ? commentFilter.search.text : reviewFilter.search.text) ?? "";

  /** HANDLERS **/
  const setPage = (next: number) => {
    if (isComments) setCommentFilter((prev) => ({ ...prev, page: next }));
    else setReviewFilter((prev) => ({ ...prev, page: next }));
  };

  const handleSearchChange = (text: string) => {
    const value = text.trim() === "" ? undefined : text;
    if (isComments) {
      setCommentFilter((prev) => ({
        ...prev,
        search: { ...prev.search, text: value },
        page: 1,
      }));
    } else {
      setReviewFilter((prev) => ({
        ...prev,
        search: { ...prev.search, text: value },
        page: 1,
      }));
    }
  };

  const handleGroupChange = (value: string) => {
    setCommentFilter((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        commentGroup: value === "all" ? undefined : (value as CommentGroup),
      },
      page: 1,
    }));
  };

  const handleStatusChange = (value: string) => {
    setReviewFilter((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        reviewStatus: value === "all" ? undefined : (value as ReviewStatus),
      },
      page: 1,
    }));
  };

  const resetFilters = () => {
    if (isComments) setCommentFilter(INITIAL_COMMENT_FILTER);
    else setReviewFilter(INITIAL_REVIEW_FILTER);
  };

  const handleRemoveComment = async (comment: Comment) => {
    if (!(await sweetConfirmAlert(t("admin.reviews.deleteCommentConfirm"))))
      return;
    try {
      await removeCommentByAdmin({ variables: { commentId: comment._id } });
      sweetTopSmallSuccessAlert(t("admin.reviews.commentDeleted"), 800);
      // The last comment of a page is gone, so the page before it is shown
      if (comments.length === 1 && commentFilter.page > 1)
        setPage(commentFilter.page - 1);
      else await refetchComments();
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err));
    }
  };

  const handleRemoveReview = async (review: Review) => {
    if (!(await sweetConfirmAlert(t("admin.reviews.removeReviewConfirm"))))
      return;
    try {
      await removeDestinationReviewByAdmin({
        variables: { reviewId: review._id },
      });
      sweetTopSmallSuccessAlert(t("admin.reviews.reviewRemoved"), 800);
      await refetchReviews();
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err));
    }
  };

  const totalPages = Math.ceil(total / PAGE_LIMIT) || 1;
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const endItem = Math.min(page * PAGE_LIMIT, total);
  const columnCount = isComments ? 5 : 7;

  /** The same author cell as the Members table **/
  const renderAuthor = (member?: Member) => (
    <div className="user-avatar-cell">
      <img
        src={getImageUrl(member?.memberImage, DEFAULT_USER_AVATAR)}
        alt={member?.memberNick ?? ""}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div className="user-cell">
        <span className="user-name">
          {member?.memberFullName || member?.memberNick || t("common.unknown")}
        </span>
        {member?.memberNick && (
          <span className="user-email">@{member.memberNick}</span>
        )}
      </div>
    </div>
  );

  const renderContent = (content?: string) =>
    content ? (
      // Plain text: shown as written, never run as HTML
      <span
        title={content}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          maxWidth: 420,
          whiteSpace: "pre-line",
          overflowWrap: "anywhere",
          color: "#141b2b",
        }}
      >
        {content}
      </span>
    ) : (
      <span style={{ color: "#707881" }}>{t("admin.reviews.noContent")}</span>
    );

  const renderTarget = (group: CommentGroup, refId: string) => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className="badge-pill indigo">{tEnum("commentGroup", group)}</span>
      <a
        href={`${TARGET_ROUTES[group]}?id=${refId}`}
        target="_blank"
        rel="noopener noreferrer"
        title={t("admin.reviews.openTarget")}
        aria-label={t("admin.reviews.openTarget")}
        style={{ display: "inline-flex", color: "#006194" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          open_in_new
        </span>
      </a>
    </div>
  );

  const removeButton = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      title={t("admin.reviews.delete")}
      aria-label={t("admin.reviews.delete")}
      style={{
        padding: "6px",
        borderRadius: "6px",
        border: "none",
        background: "#ffdad6",
        color: "#ba1a1a",
        cursor: "pointer",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        delete
      </span>
    </button>
  );

  return (
    <div className="admin-overview dashboard-container">
      <div className="overview-header">
        <div className="header-text">
          <h1>{t("admin.reviews.commentsReviewsManagement")}</h1>
          <p>{t("admin.reviews.intro")}</p>
        </div>
      </div>

      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left" style={{ display: "flex", gap: "20px" }}>
            {(["comments", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: "0 0 8px",
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#006194" : "#707881",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #006194"
                      : "2px solid transparent",
                }}
              >
                <h2 style={{ color: "inherit" }}>
                  {tab === "comments"
                    ? t("common.comments")
                    : t("admin.reviews.reviews")}
                </h2>
              </button>
            ))}
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                maxLength={100}
                placeholder={t(
                  isComments
                    ? "admin.reviews.searchComments"
                    : "admin.reviews.searchReviews",
                )}
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              {isComments ? (
                <select
                  className="filter-select"
                  value={commentFilter.search.commentGroup ?? "all"}
                  onChange={(e) => handleGroupChange(e.target.value)}
                >
                  <option value="all">{t("admin.reviews.allContexts")}</option>
                  {Object.values(CommentGroup).map((group) => (
                    <option key={group} value={group}>
                      {tEnum("commentGroup", group)}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="filter-select"
                  value={reviewFilter.search.reviewStatus ?? "all"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="all">{t("common.allStatuses")}</option>
                  <option value={ReviewStatus.ACTIVE}>{t("common.active")}</option>
                  <option value={ReviewStatus.DELETED}>{t("admin.deleted")}</option>
                </select>
              )}
              <button
                className="reset-filter-btn"
                type="button"
                onClick={resetFilters}
              >
                <span className="material-symbols-outlined">
                  filter_alt_off
                </span>
                {t("common.reset")}
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table moderation-table">
            <thead>
              <tr>
                <th>{t("admin.reviews.author")}</th>
                <th>{t("common.content")}</th>
                <th>{t("admin.reviews.contextTarget")}</th>
                {!isComments && <th>{t("admin.reviews.rating")}</th>}
                {!isComments && <th>{t("common.status")}</th>}
                <th>{t("common.date")}</th>
                <th style={{ width: 120, textAlign: "right" }}>
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columnCount}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : total === 0 ? (
                <tr>
                  <td
                    colSpan={columnCount}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t(
                      isComments
                        ? "admin.reviews.noCommentsFound"
                        : "admin.reviews.noReviewsFound",
                    )}
                  </td>
                </tr>
              ) : isComments ? (
                comments.map((comment) => (
                  <tr key={comment._id}>
                    <td>{renderAuthor(comment.memberData)}</td>
                    <td>{renderContent(comment.commentContent)}</td>
                    <td>{renderTarget(comment.commentGroup, comment.commentRefId)}</td>
                    <td>
                      <span style={{ fontSize: 13, color: "#707881" }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {removeButton(() => void handleRemoveComment(comment))}
                    </td>
                  </tr>
                ))
              ) : (
                reviews.map((review) => (
                  <tr key={review._id}>
                    <td>{renderAuthor(review.memberData)}</td>
                    <td>{renderContent(review.reviewContent)}</td>
                    <td>{renderTarget(CommentGroup.DESTINATION, review.reviewRefId)}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontWeight: 600,
                          color: "#141b2b",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                            color: "#f59e0b",
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          star
                        </span>
                        {review.reviewRating}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          review.reviewStatus === ReviewStatus.ACTIVE
                            ? "emerald"
                            : "cancelled"
                        }`}
                      >
                        <span className="dot"></span>
                        {tEnum("reviewStatus", review.reviewStatus)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#707881" }}>
                        {formatDate(review.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {review.reviewStatus === ReviewStatus.ACTIVE &&
                        removeButton(() => void handleRemoveReview(review))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            {t("admin.showingRecords", { startItem, endItem, total })}
          </span>
          <div className="pagination">
            <button
              className="page-btn square"
              disabled={page === 1}
              type="button"
              onClick={() => setPage(page - 1)}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? "active" : ""}`}
                type="button"
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn square"
              disabled={page >= totalPages}
              type="button"
              onClick={() => setPage(page + 1)}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default withAdminLayout(AdminReviewsPage);
