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
import { useI18n } from "../../../libs/i18n";

const AdminNoticesPage: NextPage = () => {
  const { t, tEnum, tError, formatDate } = useI18n();
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
        sweetMixinErrorAlert(t("common.fillRequiredFields"));
        return;
      }

      if (drawerMode === "CREATE") {
        await createNotice({
          variables: { input: formData },
        });
        sweetTopSmallSuccessAlert(t("admin.cs.noticeCreatedSuccessfully"), 800);
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
        sweetTopSmallSuccessAlert(t("admin.cs.noticeUpdatedSuccessfully"), 800);
      }
      closeDrawer();
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await sweetConfirmAlert(t("admin.cs.deleteConfirm"))
    ) {
      try {
        await removeNoticeByAdmin({ variables: { noticeId: id } });
        sweetTopSmallSuccessAlert(t("admin.cs.noticeDeleted"), 800);
        refetch();
      } catch (err: any) {
        sweetMixinErrorAlert(tError(err));
      }
    }
  };

  const exportCSV = () => {
    if (!notices || notices.length === 0) {
      sweetMixinErrorAlert(t("admin.cs.noNoticesToExport"));
      return;
    }
    const headers = ["ID", t("admin.title"), t("common.category"), t("common.status"), t("common.createdDate")];
    const rows = notices.map((n) => [
      n._id,
      `"${n.noticeTitle.replace(/"/g, '""')}"`,
      n.noticeCategory,
      n.noticeStatus,
      formatDate(n.createdAt),
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
          <h1>{t("admin.cs.noticesManagement")}</h1>
          <p>{t("admin.cs.intro")}</p>
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
            {t("admin.cs.createNotice")}
          </button>
        </div>
      </div>

      {/* MAIN TABLE SECTION */}
      <section className="admin-table-section">
        {/* TABLE HEADER & FILTERS */}
        <div className="table-header">
          <div className="header-left">
            <h2>{t("common.directory")}</h2>
            <span className="table-badge">{t("admin.cs.notices", { total })}</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder={t("admin.cs.searchNotices")}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              <select
                className="filter-select"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">{t("common.allCategories")}</option>
                <option value={NoticeCategory.FAQ}>FAQ</option>
                <option value={NoticeCategory.TERMS}>{t("admin.cs.terms")}</option>
                <option value={NoticeCategory.INQUIRY}>{t("admin.cs.inquiry")}</option>
              </select>
              <select
                className="filter-select"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">{t("common.allStatuses")}</option>
                <option value={NoticeStatus.ACTIVE}>{t("common.active")}</option>
                <option value={NoticeStatus.HOLD}>{t("admin.cs.hold")}</option>
                <option value={NoticeStatus.DELETED}>{t("admin.deleted")}</option>
              </select>
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

        {/* TABLE BODY */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.cs.noticeTitle")}</th>
                <th>{t("common.category")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.createdDate")}</th>
                <th style={{ width: 120, textAlign: "right" }}>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t("admin.cs.noNoticesFound")}
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
                        {tEnum("noticeCategory", notice.noticeCategory)}
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
                        {tEnum("noticeStatus", notice.noticeStatus)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#707881" }}>
                        {formatDate(notice.createdAt)}
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
            {t("admin.showingRecords", { startItem, endItem, total })}
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
                  {drawerMode === "CREATE" ? t("admin.cs.createNotice") : t("admin.cs.editNotice")}
                </span>
              </div>
              <button className="close-btn" type="button" onClick={closeDrawer}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body">
              <div className="admin-form-group">
                <label>
                  {t("admin.cs.noticeTitle")} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder={t("admin.cs.enterNoticeTitle")}
                  value={formData.noticeTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, noticeTitle: e.target.value })
                  }
                />
              </div>

              <div className="grid-2-col">
                <div className="admin-form-group">
                  <label>
                    {t("common.category")} <span className="required">*</span>
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
                    <option value={NoticeCategory.TERMS}>{t("admin.cs.terms")}</option>
                    <option value={NoticeCategory.INQUIRY}>{t("admin.cs.inquiry")}</option>
                  </select>
                </div>

                {drawerMode === "EDIT" && (
                  <div className="admin-form-group">
                    <label>
                      {t("common.status")} <span className="required">*</span>
                    </label>
                    <select
                      className="admin-form-control select"
                      value={formStatus}
                      onChange={(e) =>
                        setFormStatus(e.target.value as NoticeStatus)
                      }
                    >
                      <option value={NoticeStatus.ACTIVE}>{t("common.active")}</option>
                      <option value={NoticeStatus.HOLD}>{t("admin.cs.hold")}</option>
                      <option value={NoticeStatus.DELETED}>{t("admin.deleted")}</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label>
                  {t("common.content")} <span className="required">*</span>
                </label>
                <textarea
                  className="admin-form-control textarea"
                  placeholder={t("admin.cs.writeNoticeContentHere")}
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
                {t("common.cancel")}
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={handleSave}
              >
                {drawerMode === "CREATE" ? t("admin.cs.create") : t("common.saveChanges")}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default withAdminLayout(AdminNoticesPage);
