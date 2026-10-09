import React, { useState } from "react";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTICES_BY_ADMIN } from "../../../apollo/admin/query";
import {
  UPDATE_NOTICE_BY_ADMIN,
  REMOVE_NOTICE_BY_ADMIN,
} from "../../../apollo/admin/mutation";
import { CREATE_NOTICE } from "../../../apollo/user/mutation";
import {
  NoticeSearch,
  NoticesInquiry,
  NoticeInput,
  NoticeUpdate,
} from "../../../libs/types/notice/notice.input";
import { Notice } from "../../../libs/types/notice/notice";
import { NoticeCategory, NoticeStatus } from "../../../libs/enums/notice.enum";
import { Direction } from "../../../libs/enums/common.enum";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert,
} from "../../../libs/sweetAlert";

const AdminNoticesPage: NextPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<"CREATE" | "EDIT">("CREATE");

  const [searchFilter, setSearchFilter] = useState<NoticesInquiry>({
    page: 1,
    limit: 10,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {},
  });

  const [formData, setFormData] = useState<NoticeInput>({
    noticeCategory: NoticeCategory.FAQ,
    noticeTitle: "",
    noticeContent: "",
  });
  const [formStatus, setFormStatus] = useState<NoticeStatus>(
    NoticeStatus.ACTIVE,
  );

  /** APOLLO REQUESTS **/
  const { data, loading, refetch } = useQuery(GET_NOTICES_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      setNotices(data?.getNoticesByAdmin?.list || []);
      setTotal(data?.getNoticesByAdmin?.metaCounter?.[0]?.total || 0);
    },
  });

  const [createNotice] = useMutation(CREATE_NOTICE);
  const [updateNoticeByAdmin] = useMutation(UPDATE_NOTICE_BY_ADMIN);
  const [removeNoticeByAdmin] = useMutation(REMOVE_NOTICE_BY_ADMIN);

  /** HANDLERS **/
  const handleSearchChange = (text: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      search: { ...prev.search, text: text === "" ? undefined : text },
      page: 1,
    }));
  };

  const handleCategoryChange = (val: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        noticeCategory: val === "all" ? undefined : (val as NoticeCategory),
      },
      page: 1,
    }));
  };

  const handleStatusChange = (val: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        noticeStatus: val === "all" ? undefined : (val as NoticeStatus),
      },
      page: 1,
    }));
  };

  const resetFilters = () => {
    setSearchFilter({
      page: 1,
      limit: 10,
      sort: "createdAt",
      direction: Direction.DESC,
      search: {},
    });
    refetch();
  };

  const openCreateDrawer = () => {
    setDrawerMode("CREATE");
    setFormData({
      noticeCategory: NoticeCategory.FAQ,
      noticeTitle: "",
      noticeContent: "",
    });
    setFormStatus(NoticeStatus.ACTIVE);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (notice: Notice) => {
    setDrawerMode("EDIT");
    setSelectedNotice(notice);
    setFormData({
      noticeCategory: notice.noticeCategory,
      noticeTitle: notice.noticeTitle,
      noticeContent: notice.noticeContent,
    });
    setFormStatus(notice.noticeStatus);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNotice(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.noticeTitle || !formData.noticeContent) {
        sweetMixinErrorAlert("Please fill in all required fields.");
        return;
      }

      if (drawerMode === "CREATE") {
        await createNotice({
          variables: { input: formData },
        });
        sweetTopSmallSuccessAlert("Notice created successfully!", 800);
      } else if (drawerMode === "EDIT" && selectedNotice) {
        const updateInput: NoticeUpdate = {
          _id: selectedNotice._id,
          noticeCategory: formData.noticeCategory,
          noticeTitle: formData.noticeTitle,
          noticeContent: formData.noticeContent,
          noticeStatus: formStatus,
        };
        await updateNoticeByAdmin({
          variables: { input: updateInput },
        });
        sweetTopSmallSuccessAlert("Notice updated successfully!", 800);
      }
      closeDrawer();
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await sweetConfirmAlert("Are you sure you want to delete this notice?")
    ) {
      try {
        await removeNoticeByAdmin({ variables: { noticeId: id } });
        sweetTopSmallSuccessAlert("Notice deleted!", 800);
        refetch();
      } catch (err: any) {
        sweetMixinErrorAlert(err.message);
      }
    }
  };

  const exportCSV = () => {
    if (!notices || notices.length === 0) {
      sweetMixinErrorAlert("No notices to export");
      return;
    }
    const headers = ["ID", "Title", "Category", "Status", "Created Date"];
    const rows = notices.map((n) => [
      n._id,
      `"${n.noticeTitle.replace(/"/g, '""')}"`,
      n.noticeCategory,
      n.noticeStatus,
      new Date(n.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_notices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / searchFilter.limit) || 1;
  const startItem =
    total === 0 ? 0 : (searchFilter.page - 1) * searchFilter.limit + 1;
  const endItem = Math.min(searchFilter.page * searchFilter.limit, total);

  return (
    <div className="admin-overview dashboard-container">
      {/* TOP SECTION: HEADER */}
      <div className="overview-header">
        <div className="header-text">
          <h1>Notices Management</h1>
          <p>Manage system announcements, policies, and inquiries.</p>
        </div>
        <div className="header-actions">
          <button
            className="export-btn"
            type="button"
            onClick={openCreateDrawer}
            style={{
              backgroundColor: "#006194",
              color: "#fff",
              border: "none",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#fff" }}
            >
              add
            </span>
            Create Notice
          </button>
        </div>
      </div>

      {/* MAIN TABLE SECTION */}
      <section className="admin-table-section">
        {/* TABLE HEADER & FILTERS */}
        <div className="table-header">
          <div className="header-left">
            <h2>Directory</h2>
            <span className="table-badge">{total} Notices</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search notices..."
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              <select
                className="filter-select"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value={NoticeCategory.FAQ}>FAQ</option>
                <option value={NoticeCategory.TERMS}>Terms</option>
                <option value={NoticeCategory.INQUIRY}>Inquiry</option>
              </select>
              <select
                className="filter-select"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value={NoticeStatus.ACTIVE}>Active</option>
                <option value={NoticeStatus.HOLD}>Hold</option>
                <option value={NoticeStatus.DELETED}>Deleted</option>
              </select>
              <button
                className="reset-filter-btn"
                type="button"
                onClick={resetFilters}
              >
                <span className="material-symbols-outlined">
                  filter_alt_off
                </span>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Notice Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ width: 120, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    No notices found.
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice._id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#141b2b" }}>
                        {notice.noticeTitle}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${
                          notice.noticeCategory === NoticeCategory.FAQ
                            ? "sky"
                            : notice.noticeCategory === NoticeCategory.TERMS
                            ? "indigo"
                            : "neutral"
                        }`}
                      >
                        {notice.noticeCategory}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          notice.noticeStatus === NoticeStatus.ACTIVE
                            ? "emerald"
                            : "cancelled"
                        }`}
                      >
                        <span className="dot"></span>
                        {notice.noticeStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#707881" }}>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => openEditDrawer(notice)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#f1f3ff",
                            color: "#006194",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(notice._id)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#ffdad6",
                            color: "#ba1a1a",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE PAGINATION FOOTER */}
        <div className="table-footer">
          <span>
            Showing {startItem}–{endItem} of {total} records
          </span>
          <div className="pagination">
            <button
              className="page-btn square"
              disabled={searchFilter.page === 1}
              type="button"
              onClick={() =>
                setSearchFilter((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${
                  p === searchFilter.page ? "active" : ""
                }`}
                type="button"
                onClick={() =>
                  setSearchFilter((prev) => ({ ...prev, page: p }))
                }
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn square"
              disabled={searchFilter.page >= totalPages}
              type="button"
              onClick={() =>
                setSearchFilter((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* SLIDE-OUT CREATE/EDIT DRAWER */}
      {isDrawerOpen && (
        <>
          <div className="admin-drawer-backdrop" onClick={closeDrawer} />
          <aside className="admin-drawer">
            <div className="drawer-header">
              <div className="header-title">
                <span className="material-symbols-outlined">edit_document</span>
                <span>
                  {drawerMode === "CREATE" ? "Create Notice" : "Edit Notice"}
                </span>
              </div>
              <button className="close-btn" type="button" onClick={closeDrawer}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body">
              <div className="admin-form-group">
                <label>
                  Notice Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Enter notice title"
                  value={formData.noticeTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, noticeTitle: e.target.value })
                  }
                />
              </div>

              <div className="grid-2-col">
                <div className="admin-form-group">
                  <label>
                    Category <span className="required">*</span>
                  </label>
                  <select
                    className="admin-form-control select"
                    value={formData.noticeCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        noticeCategory: e.target.value as NoticeCategory,
                      })
                    }
                  >
                    <option value={NoticeCategory.FAQ}>FAQ</option>
                    <option value={NoticeCategory.TERMS}>Terms</option>
                    <option value={NoticeCategory.INQUIRY}>Inquiry</option>
                  </select>
                </div>

                {drawerMode === "EDIT" && (
                  <div className="admin-form-group">
                    <label>
                      Status <span className="required">*</span>
                    </label>
                    <select
                      className="admin-form-control select"
                      value={formStatus}
                      onChange={(e) =>
                        setFormStatus(e.target.value as NoticeStatus)
                      }
                    >
                      <option value={NoticeStatus.ACTIVE}>Active</option>
                      <option value={NoticeStatus.HOLD}>Hold</option>
                      <option value={NoticeStatus.DELETED}>Deleted</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label>
                  Content <span className="required">*</span>
                </label>
                <textarea
                  className="admin-form-control textarea"
                  placeholder="Write notice content here..."
                  value={formData.noticeContent}
                  onChange={(e) =>
                    setFormData({ ...formData, noticeContent: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="btn secondary"
                type="button"
                onClick={closeDrawer}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={handleSave}
              >
                {drawerMode === "CREATE" ? "Create" : "Save Changes"}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default withAdminLayout(AdminNoticesPage);
