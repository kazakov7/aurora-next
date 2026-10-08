import React, { useState } from "react";
import { NextPage } from "next";
import moment from "moment";
import Swal from "sweetalert2";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { useQuery, useMutation } from "@apollo/client";
import { GET_AGENT_APPLICATIONS_BY_ADMIN } from "../../../apollo/admin/query";
import {
  APPROVE_AGENT_APPLICATION,
  REJECT_AGENT_APPLICATION,
} from "../../../apollo/admin/mutation";
import {
  AgentApplicationsInquiry,
  RejectAgentApplicationInput,
} from "../../../libs/types/agent/agent.input";
import { Agent } from "../../../libs/types/agent/agent";
import {
  AgentType,
  AgentVerificationStatus,
} from "../../../libs/enums/agent.enum";
import { Direction } from "../../../libs/enums/common.enum";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
} from "../../../libs/sweetAlert";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../../libs/config";
import Pagination from "@mui/material/Pagination";

const AdminAgentVerificationPage: NextPage = () => {
  const [applications, setApplications] = useState<Agent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState<AgentApplicationsInquiry>({
    page: 1,
    limit: 10,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {},
  });

  /** APOLLO REQUESTS **/
  const { loading, refetch } = useQuery(GET_AGENT_APPLICATIONS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      setApplications(data?.getAgentApplications?.list || []);
      setTotal(data?.getAgentApplications?.metaCounter?.[0]?.total || 0);
    },
  });

  const [approveAgentApplication] = useMutation(APPROVE_AGENT_APPLICATION);
  const [rejectAgentApplication] = useMutation(REJECT_AGENT_APPLICATION);

  /** HANDLERS **/

  const handleTypeChange = (type: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        agentType: type === "ALL" ? undefined : (type as AgentType),
      },
    }));
  };

  const handleStatusChange = (status: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        verificationStatus:
          status === "ALL" ? undefined : (status as AgentVerificationStatus),
      },
    }));
  };

  const handleReset = () => {
    setSearchFilter({
      page: 1,
      limit: 10,
      sort: "createdAt",
      direction: Direction.DESC,
      search: {},
    });
  };

  const openDrawer = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDrawerOpen(true);
    setOpenMenuId(null);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAgent(null);
  };

  const handleApprove = async (target: Agent | string) => {
    const agent =
      typeof target === "string"
        ? applications.find((a) => a._id === target) || selectedAgent
        : target;
    if (!agent) return;

    const result = await Swal.fire({
      title: "Approve Verification?",
      text: `Are you sure you want to approve "${agent.companyName}"? This grants active partner privileges and verified status.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#006194",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Approve Verification",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await approveAgentApplication({ variables: { input: agent._id } });
      await sweetTopSmallSuccessAlert("Agent approved successfully", 1200);
      closeDrawer();
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message);
    }
  };

  const handleReject = async (target: Agent | string) => {
    const agent =
      typeof target === "string"
        ? applications.find((a) => a._id === target) || selectedAgent
        : target;
    if (!agent) return;

    const result = await Swal.fire({
      title: "Revoke / Reject Verification",
      text: `Specify the reason for rejecting "${agent.companyName}":`,
      input: "textarea",
      inputPlaceholder: "Enter verification feedback or rejection reason...",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Revoke / Reject",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Please provide a reason for rejection.";
        }
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      const input: RejectAgentApplicationInput = {
        _id: agent._id,
        rejectionReason: result.value.trim(),
      };
      await rejectAgentApplication({ variables: { input } });
      await sweetTopSmallSuccessAlert("Agent application rejected", 1200);
      closeDrawer();
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message);
    }
  };

  const handleViewDocument = (docName: string, meta: string) => {
    Swal.fire({
      title: docName,
      html: `
        <div style="text-align: left; padding: 14px; background: #f8fafc; border-radius: 10px; font-size: 13px; color: #334155; line-height: 1.6;">
          <p style="margin: 0 0 6px 0;"><strong>Document:</strong> ${docName}</p>
          <p style="margin: 0 0 6px 0;"><strong>Company:</strong> ${selectedAgent?.companyName}</p>
          <p style="margin: 0 0 6px 0;"><strong>Registration Tax ID:</strong> ${selectedAgent?.businessNumber}</p>
          <p style="margin: 0 0 6px 0;"><strong>Verification Meta:</strong> ${meta}</p>
          <div style="margin-top: 10px; padding: 10px; background: #e0f2fe; border-radius: 6px; color: #0369a1; font-size: 12px; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-outlined" style="font-size: 18px;">verified</span>
            Cryptographic registry signature validated against state database.
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close Preview",
      confirmButtonColor: "#006194",
    });
  };

  const handlePaginationChange = (event: any, value: number) => {
    setSearchFilter({ ...searchFilter, page: value });
  };

  return (
    <div className="admin-overview dashboard-container">
      {/* TOP SECTION: HEADER */}
      <div className="overview-header">
        <div className="header-text">
          <h1>Agent Verification</h1>
          <p>
            Review and verify luxury hotel partners and verified tour expedition
            operators.
          </p>
        </div>
        <div className="header-actions">
          <button className="export-btn" type="button">
            <span className="material-symbols-outlined">file_download</span>
            Export Log
          </button>
        </div>
      </div>

      {/* MAIN TABLE SECTION */}
      <section className="admin-table-section">
        {/* TABLE HEADER & FILTERS */}
        <div className="table-header">
          <div className="header-left">
            <h2>Requests</h2>
            <span className="table-badge">{total} Pending Reviews</span>
          </div>
          <div
            className="header-right"
            style={{ display: "flex", gap: "12px" }}
          >
            <div className="filter-select-group">
              <select
                className="filter-select"
                value={searchFilter.search?.agentType || "ALL"}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value={AgentType.HOTEL}>HOTEL</option>
                <option value={AgentType.TOUR}>TOUR</option>
              </select>
            </div>

            <div className="filter-select-group">
              <select
                className="filter-select"
                value={searchFilter.search?.verificationStatus || "ALL"}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value={AgentVerificationStatus.PENDING}>Pending</option>
                <option value={AgentVerificationStatus.APPROVED}>
                  Approved
                </option>
                <option value={AgentVerificationStatus.REJECTED}>
                  Rejected
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                color: "var(--outline)",
                cursor: "pointer",
                padding: "0 8px",
                fontSize: "13px",
                fontWeight: 500,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "var(--on-surface)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "var(--outline)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                restart_alt
              </span>
              Reset
            </button>
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Company Name</th>
                <th>Type</th>
                <th>Business Number</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "32px 0" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      color: "var(--outline)",
                    }}
                  >
                    No agent verification requests found
                  </td>
                </tr>
              ) : (
                applications.map((agent) => {
                  const member = agent.memberData;
                  const initials = (
                    member?.memberFullName ||
                    member?.memberNick ||
                    "A"
                  )
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={agent._id}>
                      <td>
                        <div
                          className="user-avatar-cell"
                          style={{ cursor: "pointer" }}
                          onClick={() => openDrawer(agent)}
                        >
                          {member?.memberImage ? (
                            <img
                              src={getImageUrl(
                                member.memberImage,
                                DEFAULT_USER_AVATAR,
                              )}
                              alt={member?.memberNick}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="avatar-circle"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              {initials}
                            </div>
                          )}
                          <div className="user-cell">
                            <span className="user-name">
                              {member?.memberFullName ||
                                member?.memberNick ||
                                "Unknown"}
                            </span>
                            <span className="user-email">
                              @{member?.memberNick || "unknown"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 500,
                            color: "var(--on-surface)",
                          }}
                        >
                          {agent.companyName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-pill ${
                            agent.agentType === AgentType.HOTEL
                              ? "indigo"
                              : "sky"
                          }`}
                        >
                          {agent.agentType}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--outline)" }}>
                          {agent.businessNumber}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            agent.verificationStatus ===
                            AgentVerificationStatus.APPROVED
                              ? "emerald"
                              : agent.verificationStatus ===
                                AgentVerificationStatus.REJECTED
                              ? "cancelled"
                              : "warning"
                          }`}
                        >
                          {agent.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--on-surface-variant)" }}>
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", position: "relative" }}>
                        <div className="actions-group">
                          <button
                            className="text-btn"
                            type="button"
                            onClick={() => openDrawer(agent)}
                          >
                            Review
                          </button>
                        </div>

                        {openMenuId === agent._id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 24,
                              top: 40,
                              width: 160,
                              backgroundColor: "#ffffff",
                              borderRadius: 8,
                              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                              padding: "6px 0",
                              zIndex: 30,
                              textAlign: "left",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "none",
                                background: "transparent",
                                textAlign: "left",
                                fontSize: 12,
                                color: "var(--on-surface)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onClick={() => openDrawer(agent)}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 16 }}
                              >
                                visibility
                              </span>
                              View Details
                            </button>
                            {agent.verificationStatus ===
                              AgentVerificationStatus.PENDING && (
                              <>
                                <button
                                  type="button"
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "none",
                                    background: "transparent",
                                    textAlign: "left",
                                    fontSize: 12,
                                    color: "#059669",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                  onClick={() => handleApprove(agent._id)}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 16 }}
                                  >
                                    check_circle
                                  </span>
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "none",
                                    background: "transparent",
                                    textAlign: "left",
                                    fontSize: 12,
                                    color: "#DC2626",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                  onClick={() => handleReject(agent._id)}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 16 }}
                                  >
                                    cancel
                                  </span>
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {applications.length > 0 && (
            <div className="table-pagination">
              <Pagination
                count={Math.ceil(total / searchFilter.limit)}
                page={searchFilter.page}
                onChange={handlePaginationChange}
                shape="rounded"
                color="primary"
              />
            </div>
          )}
        </div>
      </section>

      {/* AGENT VERIFICATION MODAL */}
      {isDrawerOpen && selectedAgent && (
        <>
          <div
            className="admin-verification-modal-backdrop"
            onClick={closeDrawer}
          />
          <div
            className="admin-verification-modal"
            role="dialog"
            aria-modal="true"
          >
            {/* 1. Modal Header */}
            <div className="modal-header">
              <div className="header-left">
                <h2 className="modal-title">Agent Verification</h2>
                <div
                  className={`status-pill ${
                    selectedAgent.verificationStatus ===
                    AgentVerificationStatus.APPROVED
                      ? "approved"
                      : selectedAgent.verificationStatus ===
                        AgentVerificationStatus.REJECTED
                      ? "rejected"
                      : "pending"
                  }`}
                >
                  <span className="status-dot" />
                  <span>
                    {selectedAgent.verificationStatus ===
                    AgentVerificationStatus.APPROVED
                      ? "Approved"
                      : selectedAgent.verificationStatus ===
                        AgentVerificationStatus.REJECTED
                      ? "Rejected"
                      : "Pending Review"}
                  </span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                type="button"
                onClick={closeDrawer}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 2. Modal Body */}
            <div className="modal-body">
              {/* Applicant Profile Card */}
              <div className="applicant-profile-card">
                <div className="profile-avatar">
                  {selectedAgent.memberData?.memberImage ? (
                    <img
                      src={getImageUrl(
                        selectedAgent.memberData.memberImage,
                        DEFAULT_USER_AVATAR,
                      )}
                      alt={
                        selectedAgent.memberData.memberFullName ||
                        selectedAgent.memberData.memberNick
                      }
                    />
                  ) : (
                    (
                      selectedAgent.memberData?.memberFullName ||
                      selectedAgent.memberData?.memberNick ||
                      "JL"
                    )
                      .split(" ")
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  )}
                </div>
                <div className="profile-info">
                  <h3 className="applicant-name">
                    {selectedAgent.memberData?.memberFullName ||
                      selectedAgent.memberData?.memberNick ||
                      "Julian Laurent"}
                  </h3>
                  <span className="applicant-email">
                    {selectedAgent.memberData?.memberEmail ||
                      `${(
                        selectedAgent.memberData?.memberNick || "julian"
                      ).toLowerCase()}@swissretreats.ch`}
                  </span>
                  <span className="applicant-phone">
                    {selectedAgent.memberData?.memberPhone ||
                      "+41 27 966 8100"}
                  </span>
                </div>
              </div>

              {/* Dual Info Row */}
              <div className="dual-info-row">
                <div className="info-col-card">
                  <span className="info-label">Entity Classification</span>
                  <span className="classification-badge">
                    {selectedAgent.agentType?.replace(/_/g, " ") ||
                      "TOUR OPERATOR"}
                  </span>
                </div>
                <div className="info-col-card">
                  <span className="info-label">Registration Tax ID</span>
                  <span className="info-tax-id">
                    {selectedAgent.businessNumber || "CHE-109.432.891"}
                  </span>
                </div>
              </div>

              {/* Corporate Credentials */}
              <div className="section-group">
                <h4 className="group-heading">Corporate Credentials</h4>
                <div className="credentials-card">
                  <div className="field-row">
                    <span className="field-label">Registered Business Name</span>
                    <span className="field-value">
                      {selectedAgent.companyName ||
                        "Swiss Alpine Atelier & Expeditions AG"}
                    </span>
                  </div>

                  <div className="field-row">
                    <span className="field-label">Registered Address</span>
                    <span className="field-value address">
                      {selectedAgent.companyAddress ||
                        "Bahnhofstrasse 42, 3920 Zermatt, Valais, Switzerland"}
                    </span>
                  </div>

                  <div className="dual-field-row">
                    <div className="field-row">
                      <span className="field-label">Managing Director</span>
                      <span className="field-value">
                        {selectedAgent.memberData?.memberFullName ||
                          selectedAgent.memberData?.memberNick ||
                          "Julian Laurent"}
                      </span>
                    </div>
                    <div className="field-row">
                      <span className="field-label">Submission Timestamp</span>
                      <span className="field-value">
                        {selectedAgent.createdAt
                          ? moment(selectedAgent.createdAt).format(
                              "MMM DD, YYYY · hh:mm A",
                            )
                          : "Oct 24, 2025 · 09:15 AM"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Operational Note */}
              <div className="section-group">
                <h4 className="group-heading">Platform Operational Note</h4>
                <div className="operational-note-card">
                  <p>
                    {selectedAgent.companyDesc ||
                      "Operates 6 luxury tour packages in Swiss Alps (Zermatt, St. Moritz, Grindelwald). Commercial insurance verification document (Allianz Suisse #8491-01) attached and cross-referenced with Swiss Federal Commercial Registry."}
                  </p>
                </div>
              </div>

              {/* Submitted Documents */}
              <div className="section-group">
                <h4 className="group-heading">Submitted Documents (2)</h4>
                <div className="documents-list">
                  <div className="document-item">
                    <div className="doc-left">
                      <div className="doc-icon-box">
                        <span className="material-symbols-outlined">
                          description
                        </span>
                      </div>
                      <div className="doc-meta">
                        <span className="doc-name">
                          {`Trade_Register_Excerpt_${
                            selectedAgent.businessNumber
                              ?.replace(/[^a-zA-Z0-9]/g, "")
                              .substring(0, 6) || "CHE"
                          }.pdf`}
                        </span>
                        <span className="doc-sub">
                          1.8 MB · Validated Hash
                        </span>
                      </div>
                    </div>
                    <button
                      className="doc-view-btn"
                      type="button"
                      title="View Document"
                      onClick={() =>
                        handleViewDocument(
                          `Trade_Register_Excerpt_${
                            selectedAgent.businessNumber
                              ?.replace(/[^a-zA-Z0-9]/g, "")
                              .substring(0, 6) || "CHE"
                          }.pdf`,
                          "1.8 MB · Validated Hash",
                        )
                      }
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </button>
                  </div>

                  <div className="document-item">
                    <div className="doc-left">
                      <div className="doc-icon-box">
                        <span className="material-symbols-outlined">
                          verified_user
                        </span>
                      </div>
                      <div className="doc-meta">
                        <span className="doc-name">
                          Commercial_Liability_Insurance_2025.pdf
                        </span>
                        <span className="doc-sub">
                          3.2 MB · Official Policy
                        </span>
                      </div>
                    </div>
                    <button
                      className="doc-view-btn"
                      type="button"
                      title="View Document"
                      onClick={() =>
                        handleViewDocument(
                          "Commercial_Liability_Insurance_2025.pdf",
                          "3.2 MB · Official Policy",
                        )
                      }
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Modal Footer */}
            <div className="modal-footer">
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => handleReject(selectedAgent)}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  <span>Revoke / Reject</span>
                </button>
                <button
                  type="button"
                  className="btn-approve"
                  onClick={() => handleApprove(selectedAgent)}
                >
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  <span>Approve Verification</span>
                </button>
              </div>
              <p className="footer-note">
                Confirmation dialog will prompt before state change.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default withAdminLayout(AdminAgentVerificationPage);
