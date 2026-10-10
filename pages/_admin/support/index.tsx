import React, { useState } from "react";
import { NextPage } from "next";
import { useQuery, useMutation } from "@apollo/client";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { GET_ALL_SUPPORT_TICKETS_BY_ADMIN } from "../../../apollo/admin/query";
import { UPDATE_SUPPORT_TICKET_BY_ADMIN } from "../../../apollo/admin/mutation";
import {
  SupportTicketsInquiry,
  SupportTicketUpdate,
} from "../../../libs/types/support/support.input";
import { SupportTicket } from "../../../libs/types/support/support";
import {
  SupportCategory,
  SupportStatus,
} from "../../../libs/enums/support.enum";
import { Direction } from "../../../libs/enums/common.enum";
import { getImageUrl } from "../../../libs/config";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
} from "../../../libs/sweetAlert";
import { useI18n } from "../../../libs/i18n";

const STATUS_PILL: Record<SupportStatus, string> = {
  [SupportStatus.OPEN]: "amber",
  [SupportStatus.IN_PROGRESS]: "sky",
  [SupportStatus.RESOLVED]: "emerald",
  [SupportStatus.CLOSED]: "cancelled",
};

const initialInquiry: SupportTicketsInquiry = {
  page: 1,
  limit: 10,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};

const AdminSupportPage: NextPage = () => {
  const { t, tEnum, tError, formatDate } = useI18n();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchFilter, setSearchFilter] =
    useState<SupportTicketsInquiry>(initialInquiry);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [formStatus, setFormStatus] = useState<SupportStatus>(
    SupportStatus.OPEN,
  );
  const [formReply, setFormReply] = useState<string>("");

  /** APOLLO REQUESTS **/
  const { loading, refetch } = useQuery(GET_ALL_SUPPORT_TICKETS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      setTickets(data?.getAllSupportTicketsByAdmin?.list || []);
      setTotal(data?.getAllSupportTicketsByAdmin?.metaCounter?.[0]?.total || 0);
    },
  });

  const [updateSupportTicketByAdmin] = useMutation(
    UPDATE_SUPPORT_TICKET_BY_ADMIN,
  );

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
        ticketCategory: val === "all" ? undefined : (val as SupportCategory),
      },
      page: 1,
    }));
  };

  const handleStatusChange = (val: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        ticketStatus: val === "all" ? undefined : (val as SupportStatus),
      },
      page: 1,
    }));
  };

  const resetFilters = () => {
    setSearchFilter(initialInquiry);
  };

  const openDrawer = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setFormStatus(ticket.ticketStatus);
    setFormReply(ticket.ticketReply || "");
  };

  const closeDrawer = () => {
    setSelectedTicket(null);
    setFormReply("");
  };

  const handleSave = async () => {
    if (!selectedTicket) return;
    try {
      const input: SupportTicketUpdate = {
        _id: selectedTicket._id,
        ticketStatus: formStatus,
      };
      const reply = formReply.trim();
      if (reply && reply !== selectedTicket.ticketReply)
        input.ticketReply = reply;

      await updateSupportTicketByAdmin({ variables: { input } });
      sweetTopSmallSuccessAlert(
        input.ticketReply ? t("admin.support.replySentToMember") : t("admin.support.ticketUpdated"),
        800,
      );
      closeDrawer();
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err));
    }
  };

  const exportCSV = () => {
    if (tickets.length === 0) {
      sweetMixinErrorAlert(t("admin.support.noTicketsToExport"));
      return;
    }
    const headers = [
      "ID",
      t("admin.support.subject"),
      t("common.name"),
      t("admin.support.email"),
      t("common.category"),
      t("common.status"),
      t("common.createdDate"),
    ];
    const rows = tickets.map((t) => [
      t._id,
      `"${t.ticketSubject.replace(/"/g, '""')}"`,
      `"${t.ticketName.replace(/"/g, '""')}"`,
      t.ticketEmail,
      t.ticketCategory,
      t.ticketStatus,
      formatDate(t.createdAt),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `aura_support_tickets_${Date.now()}.csv`);
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
          <h1>{t("admin.support.supportTicketsManagement")}</h1>
          <p>{t("admin.support.intro")}</p>
        </div>
      </div>

      {/* MAIN TABLE SECTION */}
      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left">
            <h2>{t("common.directory")}</h2>
            <span className="table-badge">{t("admin.support.tickets", { total })}</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder={t("admin.support.searchTickets")}
                value={searchFilter.search.text || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              <select
                className="filter-select"
                value={searchFilter.search.ticketCategory || "all"}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">{t("common.allCategories")}</option>
                {Object.values(SupportCategory).map((category) => (
                  <option key={category} value={category}>
                    {tEnum("supportCategory", category)}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={searchFilter.search.ticketStatus || "all"}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">{t("common.allStatuses")}</option>
                {Object.values(SupportStatus).map((status) => (
                  <option key={status} value={status}>
                    {tEnum("supportStatus", status)}
                  </option>
                ))}
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

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.support.ticketSubject")}</th>
                <th>{t("admin.support.submitter")}</th>
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
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t("admin.support.noSupportTicketsFound")}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#141b2b" }}>
                        {ticket.ticketSubject}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 500 }}>
                          {ticket.ticketName}
                        </span>
                        <span style={{ fontSize: 12, color: "#707881" }}>
                          {ticket.ticketEmail}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-pill neutral">
                        {tEnum("supportCategory", ticket.ticketCategory)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          STATUS_PILL[ticket.ticketStatus]
                        }`}
                      >
                        <span className="dot"></span>
                        {tEnum("supportStatus", ticket.ticketStatus)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#707881" }}>
                        {formatDate(ticket.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => openDrawer(ticket)}
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
                          visibility
                        </span>
                      </button>
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

      {/* SLIDE-OUT TICKET DRAWER */}
      {selectedTicket && (
        <>
          <div className="admin-drawer-backdrop" onClick={closeDrawer} />
          <aside className="admin-drawer">
            <div className="drawer-header">
              <div className="header-title">
                <span className="material-symbols-outlined">support_agent</span>
                <span>
                  {t("admin.support.ticket", { id: selectedTicket._id.slice(-8).toUpperCase() })}
                </span>
              </div>
              <button className="close-btn" type="button" onClick={closeDrawer}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body">
              <div className="admin-form-group">
                <label>{t("admin.support.subject")}</label>
                <p style={{ margin: 0, fontWeight: 600, color: "#141b2b" }}>
                  {selectedTicket.ticketSubject}
                </p>
              </div>

              <div className="grid-2-col">
                <div className="admin-form-group">
                  <label>{t("admin.support.submitter")}</label>
                  <p style={{ margin: 0 }}>{selectedTicket.ticketName}</p>
                  <a
                    href={`mailto:${selectedTicket.ticketEmail}`}
                    style={{ fontSize: 13, color: "#006194" }}
                  >
                    {selectedTicket.ticketEmail}
                  </a>
                </div>
                <div className="admin-form-group">
                  <label>{t("admin.support.categoryCreated")}</label>
                  <p style={{ margin: 0 }}>{tEnum("supportCategory", selectedTicket.ticketCategory)}</p>
                  <span style={{ fontSize: 13, color: "#707881" }}>
                    {formatDate(selectedTicket.createdAt, "dateTime")}
                  </span>
                </div>
              </div>

              <div className="admin-form-group">
                <label>{t("common.message")}</label>
                <p
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    color: "#404850",
                  }}
                >
                  {selectedTicket.ticketMessage}
                </p>
              </div>

              {selectedTicket.ticketAttachment && (
                <div className="admin-form-group">
                  <label>{t("admin.support.attachment")}</label>
                  <a
                    href={getImageUrl(selectedTicket.ticketAttachment)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={getImageUrl(selectedTicket.ticketAttachment)}
                      alt={t("admin.support.attachmentAlt")}
                      style={{
                        maxWidth: "100%",
                        maxHeight: 240,
                        borderRadius: 8,
                        objectFit: "contain",
                      }}
                    />
                  </a>
                </div>
              )}

              <div className="admin-form-group">
                <label>{t("common.status")}</label>
                <select
                  className="admin-form-control select"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as SupportStatus)
                  }
                >
                  {Object.values(SupportStatus).map((status) => (
                    <option key={status} value={status}>
                      {tEnum("supportStatus", status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>{t("admin.support.replyToMember")}</label>
                <textarea
                  className="admin-form-control textarea"
                  placeholder={t("admin.support.replyPlaceholder")}
                  value={formReply}
                  onChange={(e) => setFormReply(e.target.value)}
                />
                {selectedTicket.repliedAt && (
                  <span style={{ fontSize: 12, color: "#707881" }}>
                    {t("admin.support.lastReplied", { value: formatDate(selectedTicket.repliedAt, "dateTime") })}
                  </span>
                )}
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
                {t("common.saveChanges")}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default withAdminLayout(AdminSupportPage);
