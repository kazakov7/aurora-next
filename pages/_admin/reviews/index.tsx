import React, { useState } from "react";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { sweetMixinErrorAlert } from "../../../libs/sweetAlert";
import { useI18n } from "../../../libs/i18n";

const AdminReviewsPage: NextPage = () => {
  // BACKEND LIMITATION: There are no GraphQL schemas to fetch ALL Comments or Reviews across the platform.
  // The existing `GET_COMMENTS` and `GET_DESTINATION_REVIEWS` require a specific `refId`.
  // We render the layout to match the Stitch design but data is disabled.

  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"comments" | "reviews">(
    "comments",
  );
  const total = 0;
  const startItem = 0;
  const endItem = 0;
  const totalPages = 1;

  const exportCSV = () => {
    sweetMixinErrorAlert(
      t("admin.reviews.commentsApiUnsupported"),
    );
  };

  const unsupportedAction = () => {
    sweetMixinErrorAlert(t("admin.reviews.actionUnsupported"));
  };

  return (
    <div className="admin-overview dashboard-container">
      <div className="overview-header">
        <div className="header-text">
          <h1>{t("admin.reviews.commentsReviewsManagement")}</h1>
          <p>
            {t("admin.reviews.intro")}
          </p>
        </div>
      </div>

      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left" style={{ display: "flex", gap: "20px" }}>
            <div
              onClick={() => setActiveTab("comments")}
              style={{
                cursor: "pointer",
                fontWeight: activeTab === "comments" ? 600 : 400,
                color: activeTab === "comments" ? "#006194" : "#707881",
                borderBottom:
                  activeTab === "comments"
                    ? "2px solid #006194"
                    : "2px solid transparent",
                paddingBottom: "8px",
              }}
            >
              <h2>{t("common.comments")}</h2>
            </div>
            <div
              onClick={() => setActiveTab("reviews")}
              style={{
                cursor: "pointer",
                fontWeight: activeTab === "reviews" ? 600 : 400,
                color: activeTab === "reviews" ? "#006194" : "#707881",
                borderBottom:
                  activeTab === "reviews"
                    ? "2px solid #006194"
                    : "2px solid transparent",
                paddingBottom: "8px",
              }}
            >
              <h2>{t("admin.reviews.reviews")}</h2>
            </div>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder={t(activeTab === "comments" ? "admin.reviews.searchComments" : "admin.reviews.searchReviews")}
                disabled
              />
            </div>
            <div className="filter-select-group">
              <select className="filter-select" disabled>
                <option value="all">{t("admin.reviews.allContexts")}</option>
              </select>
              <button
                className="reset-filter-btn"
                type="button"
                onClick={unsupportedAction}
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
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.reviews.author")}</th>
                <th>{t("common.content")}</th>
                <th>{t("admin.reviews.contextTarget")}</th>
                {activeTab === "reviews" && <th>{t("admin.reviews.rating")}</th>}
                <th>{t("common.date")}</th>
                <th style={{ width: 120, textAlign: "right" }}>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={activeTab === "reviews" ? 6 : 5}
                  style={{ textAlign: "center", padding: "60px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      color: "#ba1a1a",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 48 }}
                    >
                      api
                    </span>
                    <h3>{t("admin.unsupportedFeature")}</h3>
                    <p style={{ color: "#707881" }}>
                      {t(activeTab === "comments" ? "admin.reviews.unsupportedComments" : "admin.reviews.unsupportedReviews")}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            {t("admin.showingRecords", { startItem, endItem, total })}
          </span>
          <div className="pagination">
            <button className="page-btn square" disabled type="button">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="page-btn square" disabled type="button">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default withAdminLayout(AdminReviewsPage);
