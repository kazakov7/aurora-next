import React, { useState } from "react";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { sweetMixinErrorAlert } from "../../../libs/sweetAlert";

const AdminReviewsPage: NextPage = () => {
  // BACKEND LIMITATION: There are no GraphQL schemas to fetch ALL Comments or Reviews across the platform.
  // The existing `GET_COMMENTS` and `GET_DESTINATION_REVIEWS` require a specific `refId`.
  // We render the layout to match the Stitch design but data is disabled.

  const [activeTab, setActiveTab] = useState<"comments" | "reviews">(
    "comments",
  );
  const total = 0;
  const startItem = 0;
  const endItem = 0;
  const totalPages = 1;

  const exportCSV = () => {
    sweetMixinErrorAlert(
      "Global Comments API is not supported by the backend.",
    );
  };

  const unsupportedAction = () => {
    sweetMixinErrorAlert("This action is not supported by the backend API.");
  };

  return (
    <div className="admin-overview dashboard-container">
      <div className="overview-header">
        <div className="header-text">
          <h1>Comments & Reviews Management</h1>
          <p>
            Moderate user feedback, property reviews, and community comments.
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
              <h2>Comments</h2>
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
              <h2>Reviews</h2>
            </div>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                disabled
              />
            </div>
            <div className="filter-select-group">
              <select className="filter-select" disabled>
                <option value="all">All Contexts</option>
              </select>
              <button
                className="reset-filter-btn"
                type="button"
                onClick={unsupportedAction}
              >
                <span className="material-symbols-outlined">
                  filter_alt_off
                </span>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Content</th>
                <th>Context (Target)</th>
                {activeTab === "reviews" && <th>Rating</th>}
                <th>Date</th>
                <th style={{ width: 120, textAlign: "right" }}>Actions</th>
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
                    <h3>Unsupported Feature</h3>
                    <p style={{ color: "#707881" }}>
                      The backend does not support fetching all {activeTab}{" "}
                      globally without a specific target ID.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {startItem}–{endItem} of {total} records
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
