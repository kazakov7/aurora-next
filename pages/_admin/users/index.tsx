import React, { useState } from "react";
import moment from "moment";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import UserDrawer from "../../../libs/components/admin/UserDrawer";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_MEMBERS_BY_ADMIN } from "../../../apollo/admin/query";
import { UPDATE_MEMBER_BY_ADMIN } from "../../../apollo/admin/mutation";
import {
  AdminUpdateMemberInput,
  MembersInquiry,
} from "../../../libs/types/member/member.input";
import { Member } from "../../../libs/types/member/member";
import { MemberStatus, MemberType } from "../../../libs/enums/member.enum";
import { Direction } from "../../../libs/enums/common.enum";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
} from "../../../libs/sweetAlert";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../../libs/config";
import { useI18n } from "../../../libs/i18n";

const AdminMembersPage: NextPage = () => {
  const { tEnum, tError, t, formatDate } = useI18n();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState<MembersInquiry>({
    page: 1,
    limit: 10,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {},
  });

  /** APOLLO REQUESTS **/
  const { data, loading, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      setMembers(data?.getAllMembersByAdmin?.list || []);
      setTotal(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total || 0);
    },
  });

  const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

  /** HANDLERS **/
  const handleSearchChange = (text: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      page: 1,
      search: { ...prev.search, text: text.trim() || undefined },
    }));
  };

  const handleRoleChange = (role: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        memberType:
          role === "all" ? undefined : (role.toUpperCase() as MemberType),
      },
    }));
  };

  const handleStatusChange = (status: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        memberStatus:
          status === "all" ? undefined : (status.toUpperCase() as MemberStatus),
      },
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
  };

  const handleStatusUpdate = async (
    memberId: string,
    newStatus: MemberStatus,
  ) => {
    try {
      const input: AdminUpdateMemberInput = {
        _id: memberId,
        memberStatus: newStatus,
      };
      await updateMemberByAdmin({ variables: { input } });
      await sweetTopSmallSuccessAlert(t("admin.users.statusUpdatedTo", { newStatus: tEnum("memberStatus", newStatus) }), 800);
      setOpenMenuId(null);
      if (selectedMember && selectedMember._id === memberId) {
        setSelectedMember((prev) =>
          prev ? { ...prev, memberStatus: newStatus } : null,
        );
      }
      await refetch();
    } catch (err: any) {
      console.log("ERROR, handleStatusUpdate:", err.message);
      sweetMixinErrorAlert(tError(err));
    }
  };

  const openDrawer = (member: Member) => {
    setSelectedMember(member);
    setIsDrawerOpen(true);
    setOpenMenuId(null);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedMember(null);
  };

  const exportCSV = () => {
    if (!members || members.length === 0) {
      sweetMixinErrorAlert(t("admin.users.noMembersDataToExport"));
      return;
    }
    const headers = [
      "ID",
      t("admin.users.nick"),
      t("common.fullName"),
      t("admin.users.email"),
      t("auth.signUp.phone"),
      t("admin.users.role"),
      t("common.status"),
      t("admin.users.registeredAt"),
    ];
    const rows = members.map((m) => [
      m._id,
      m.memberNick,
      m.memberFullName || "",
      m.memberEmail || "",
      m.memberPhone || "",
      m.memberType,
      m.memberStatus,
      m.createdAt ? moment(m.createdAt).format("YYYY-MM-DD") : "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_members_${Date.now()}.csv`);
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
          <h1>{t("admin.users.membersManagement")}</h1>
          <p>
            {t("admin.users.intro")}
          </p>
        </div>
      </div>

      {/* MAIN TABLE SECTION */}
      <section className="admin-table-section">
        {/* TABLE HEADER & FILTERS */}
        <div className="table-header">
          <div className="header-left">
            <h2>{t("common.directory")}</h2>
            <span className="table-badge">{t("admin.users.members", { total })}</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder={t("admin.users.searchNameHandleEmail")}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              <select
                className="filter-select"
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="all">{t("admin.users.allRoles")}</option>
                <option value="user">{t("admin.users.user")}</option>
                <option value="agent">{t("common.agent")}</option>
                <option value="admin">{t("admin.users.admin")}</option>
              </select>
              <select
                className="filter-select"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">{t("common.allStatuses")}</option>
                <option value="active">{t("common.active")}</option>
                <option value="blocked">{t("admin.users.banned")}</option>
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

        {/* DATA TABLE */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="px-6">{t("common.member")}</th>
                <th>{t("admin.users.contactInfo")}</th>
                <th>{t("admin.users.role")}</th>
                <th>{t("common.status")}</th>
                <th>{t("admin.users.registrationDate")}</th>
                <th className="px-6 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    <span style={{ color: "#707881" }}>{t("admin.users.noMembersFound")}</span>
                  </td>
                </tr>
              ) : (
                members.map((member: Member) => {
                  const isMenuOpen = openMenuId === member._id;
                  const initials = (
                    member.memberFullName ||
                    member.memberNick ||
                    t("admin.users.user")
                  )
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={member._id}>
                      <td className="px-6">
                        <div className="user-avatar-cell">
                          {member.memberImage ? (
                            <img
                              src={getImageUrl(
                                member.memberImage,
                                DEFAULT_USER_AVATAR,
                              )}
                              alt={member.memberNick}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className={`avatar-circle ${
                                member.memberType === MemberType.ADMIN
                                  ? "bg-primary"
                                  : member.memberType === MemberType.AGENT
                                  ? "bg-secondary"
                                  : "bg-tertiary"
                              }`}
                            >
                              {initials}
                            </div>
                          )}
                          <div
                            className="user-cell"
                            style={{ cursor: "pointer" }}
                            onClick={() => openDrawer(member)}
                          >
                            <span className="user-name">
                              {member.memberFullName || member.memberNick}
                            </span>
                            <span className="user-email">
                              @{member.memberNick}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell">
                          <span className="user-name">
                            {member.memberEmail || "N/A"}
                          </span>
                          <span className="user-email">
                            {member.memberPhone || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge-pill ${
                            member.memberType === MemberType.ADMIN
                              ? "indigo"
                              : member.memberType === MemberType.AGENT
                              ? "sky"
                              : "neutral"
                          }`}
                        >
                          {tEnum("memberType", member.memberType)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            member.memberStatus === MemberStatus.ACTIVE
                              ? "emerald"
                              : "cancelled"
                          }`}
                        >
                          <span className="dot"></span>
                          {member.memberStatus === MemberStatus.BLOCKED
                            ? t("admin.users.banned")
                            : tEnum("memberStatus", member.memberStatus)}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {member.createdAt
                            ? formatDate(member.createdAt, "medium")
                            : "-"}
                        </span>
                      </td>
                      <td
                        className="px-6 text-right"
                        style={{ position: "relative" }}
                      >
                        <div className="actions-group">
                          <button
                            className="text-btn"
                            type="button"
                            onClick={() => openDrawer(member)}
                          >
                            {t("admin.users.inspect")}
                          </button>
                          <button
                            className="more-btn"
                            type="button"
                            onClick={() =>
                              setOpenMenuId(isMenuOpen ? null : member._id)
                            }
                          >
                            <span className="material-symbols-outlined">
                              more_vert
                            </span>
                          </button>
                        </div>

                        {isMenuOpen && (
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
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onClick={() => openDrawer(member)}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 16 }}
                              >
                                visibility
                              </span>
                              {t("common.viewDetails")}
                            </button>
                            {member.memberStatus !== MemberStatus.ACTIVE && (
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
                                onClick={() =>
                                  handleStatusUpdate(
                                    member._id,
                                    MemberStatus.ACTIVE,
                                  )
                                }
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: 16 }}
                                >
                                  check_circle
                                </span>
                                {t("admin.users.activate")}
                              </button>
                            )}
                            {member.memberStatus !== MemberStatus.BLOCKED && (
                              <button
                                type="button"
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  border: "none",
                                  background: "transparent",
                                  textAlign: "left",
                                  fontSize: 12,
                                  color: "#ba1a1a",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                                onClick={() =>
                                  handleStatusUpdate(
                                    member._id,
                                    MemberStatus.BLOCKED,
                                  )
                                }
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: 16 }}
                                >
                                  block
                                </span>
                                {t("admin.users.suspend")}
                              </button>
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

      {/* SLIDE-OUT INSPECTION DRAWER */}
      {isDrawerOpen && selectedMember && (
        <UserDrawer
          selectedMember={selectedMember}
          closeDrawer={closeDrawer}
          handleStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default withAdminLayout(AdminMembersPage);
