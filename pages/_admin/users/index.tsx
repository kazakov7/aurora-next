import React, { useState } from "react";
import moment from "moment";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import UserDrawer from "../../../libs/components/admin/UserDrawer";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_MEMBERS_BY_ADMIN } from "../../../apollo/admin/query";
import { UPDATE_MEMBER_BY_ADMIN } from "../../../apollo/admin/mutation";
import { MembersInquiry } from "../../../libs/types/member/member.input";
import { Member } from "../../../libs/types/member/member";
import { MemberStatus, MemberType } from "../../../libs/enums/member.enum";
import { Direction } from "../../../libs/enums/common.enum";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
} from "../../../libs/sweetAlert";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../../libs/config";

const AdminMembersPage: NextPage = () => {
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
      await updateMemberByAdmin({
        variables: {
          input: {
            _id: memberId,
            memberStatus: newStatus,
          },
        },
      });
      await sweetTopSmallSuccessAlert(`Status updated to ${newStatus}`, 800);
      setOpenMenuId(null);
      if (selectedMember && selectedMember._id === memberId) {
        setSelectedMember((prev) =>
          prev ? { ...prev, memberStatus: newStatus } : null,
        );
      }
      await refetch();
    } catch (err: any) {
      console.log("ERROR, handleStatusUpdate:", err.message);
      sweetMixinErrorAlert(err.message);
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
      sweetMixinErrorAlert("No members data to export");
      return;
    }
    const headers = [
      "ID",
      "Nick",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Registered At",
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
          <h1>Members Management</h1>
          <p>
            Manage all registered platform accounts, access roles, and activity
            records.
          </p>
        </div>
      </div>

      {/* MAIN TABLE SECTION */}
      <section className="admin-table-section">
        {/* TABLE HEADER & FILTERS */}
        <div className="table-header">
          <div className="header-left">
            <h2>Directory</h2>
            <span className="table-badge">{total} Members</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search name, handle, email..."
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              <select
                className="filter-select"
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <select
                className="filter-select"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Banned</option>
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

        {/* DATA TABLE */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="px-6">Member</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    <span style={{ color: "#707881" }}>No members found!</span>
                  </td>
                </tr>
              ) : (
                members.map((member: Member) => {
                  const isMenuOpen = openMenuId === member._id;
                  const initials = (
                    member.memberFullName ||
                    member.memberNick ||
                    "User"
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
                          {member.memberType}
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
                            ? "Banned"
                            : member.memberStatus}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {member.createdAt
                            ? moment(member.createdAt).format("MMM DD, YYYY")
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
                            Inspect
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
                              View Details
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
                                Activate
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
                                Suspend
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
