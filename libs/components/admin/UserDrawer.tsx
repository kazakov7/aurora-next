import React, { useState } from "react";
import { Member } from "../../types/member/member";
import { MemberStatus, MemberType } from "../../enums/member.enum";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";

// Custom format function without depending on date-fns if not installed
const formatTimeAgo = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
};

interface UserDrawerProps {
  selectedMember: Member;
  closeDrawer: () => void;
  handleStatusUpdate: (id: string, status: MemberStatus) => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({
  selectedMember,
  closeDrawer,
  handleStatusUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const isAgent = selectedMember.memberType === MemberType.AGENT;
  const isAdmin = selectedMember.memberType === MemberType.ADMIN;

  const getAvatarInitials = () => {
    const name =
      selectedMember.memberFullName || selectedMember.memberNick || "A";
    return name.substring(0, 2).toUpperCase();
  };

  const lastActiveStr = selectedMember.lastLoginAt
    ? formatTimeAgo(selectedMember.lastLoginAt)
    : "Never";

  return (
    <>
      <div className="admin-drawer-backdrop" onClick={closeDrawer} />
      <aside className="admin-member-drawer">
        <div className="drawer-header">
          <div className="header-title">
            <span className="material-symbols-outlined icon-main">badge</span>
            <span className="title-text">Member Inspection & Management</span>
            <span className="id-badge">
              AURA-
              {selectedMember._id
                .substring(selectedMember._id.length - 4)
                .toUpperCase()}
              <span className="material-symbols-outlined copy-icon">
                content_copy
              </span>
            </span>
          </div>
          <button className="close-btn" type="button" onClick={closeDrawer}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="drawer-body">
          {/* TOP PROFILE CARD */}
          <div className="top-profile-card">
            <div className="card-top-row">
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  {selectedMember.memberImage ? (
                    <img
                      src={getImageUrl(
                        selectedMember.memberImage,
                        DEFAULT_USER_AVATAR,
                      )}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="avatar-initials">{getAvatarInitials()}</div>
                  )}
                  <div className="verified-badge">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                </div>
                <div className="identity-info">
                  <div className="name-line">
                    <h2>
                      {selectedMember.memberFullName ||
                        selectedMember.memberNick}
                    </h2>
                    {selectedMember.memberStatus === MemberStatus.ACTIVE && (
                      <span className="id-verified-pill">
                        <span className="material-symbols-outlined">
                          verified
                        </span>
                        ID Verified
                      </span>
                    )}
                  </div>
                  <div className="meta-line">
                    <span className="handle">@{selectedMember.memberNick}</span>
                    <span className="dot">•</span>
                    <span className="type">
                      {isAgent
                        ? "Tour Operator Agent"
                        : isAdmin
                        ? "Platform Administrator"
                        : "Standard Member"}
                    </span>
                    {selectedMember.memberAddress && (
                      <>
                        <span className="dot">•</span>
                        <span className="location">
                          {selectedMember.memberAddress}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="tags-section">
                <div className="role-tags">
                  <span className="tag-primary">
                    {selectedMember.memberType}
                  </span>
                  {isAgent && <span className="tag-secondary">Specialist</span>}
                </div>
                <div
                  className={`status-indicator ${selectedMember.memberStatus.toLowerCase()}`}
                >
                  <span className="dot"></span>
                  {selectedMember.memberStatus === MemberStatus.ACTIVE
                    ? "Active (Normal)"
                    : selectedMember.memberStatus}
                </div>
              </div>
            </div>

            <div className="card-bottom-row">
              <div className="bottom-left">
                <span className="auth-info">
                  <span className="material-symbols-outlined">
                    shield_person
                  </span>
                  Auth: {selectedMember.memberAuthType}
                </span>
              </div>
              <div className="bottom-right">
                <span>
                  Registered:{" "}
                  {new Date(selectedMember.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </span>
                <span className="dot">•</span>
                <span>
                  Last active:{" "}
                  <span className="highlight">{lastActiveStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">PUBLISHED ITEMS</span>
                <span className="material-symbols-outlined icon">explore</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">
                  {selectedMember.memberProperties + selectedMember.memberTours}
                </span>
                <span className="stat-subval active">Active</span>
              </div>
              <div className="stat-footer">
                {selectedMember.memberProperties} properties •{" "}
                {selectedMember.memberTours} tours
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">NETWORK</span>
                <span className="material-symbols-outlined icon">group</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">
                  {selectedMember.memberFollowers}
                </span>
                <span className="stat-subval">followers</span>
              </div>
              <div className="stat-footer">
                {selectedMember.memberFollowings} following
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">COMMUNITY</span>
                <span className="material-symbols-outlined icon">forum</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">
                  {selectedMember.memberArticles}
                </span>
                <span className="stat-subval">articles</span>
              </div>
              <div className="stat-footer">
                {selectedMember.memberComments} comments posted
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">ENGAGEMENT</span>
                <span className="material-symbols-outlined icon">star</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">{selectedMember.memberLikes}</span>
                <span className="stat-subval highlight">
                  <span className="material-symbols-outlined">star</span>
                </span>
              </div>
              <div className="stat-footer">
                {selectedMember.memberViews} profile views
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="drawer-tabs">
            {isAgent && (
              <button
                className={`tab-btn ${
                  activeTab === "business" ? "active" : ""
                }`}
                onClick={() => setActiveTab("business")}
              >
                Business
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-section">
                <div className="section-header">
                  <div className="title">
                    <span className="material-symbols-outlined">
                      account_circle
                    </span>
                    <h4>Personal & Contact Information</h4>
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">
                      {selectedMember.memberFullName || "-"}
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Handle / Slug</span>
                    <span className="info-value">
                      @{selectedMember.memberNick}
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Email Address</span>
                    <div className="info-value-row">
                      <span className="info-value">
                        {selectedMember.memberEmail || "-"}
                      </span>
                      <span className="material-symbols-outlined copy-icon">
                        content_copy
                      </span>
                    </div>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Primary Phone</span>
                    <div className="info-value-row">
                      <span className="info-value">
                        {selectedMember.memberPhone || "-"}
                      </span>
                      <span className="material-symbols-outlined copy-icon">
                        content_copy
                      </span>
                    </div>
                  </div>
                  <div className="info-box full-width">
                    <span className="info-label">
                      Primary Location / Residence
                    </span>
                    <span className="info-value">
                      {selectedMember.memberAddress || "-"}
                    </span>
                  </div>
                  <div className="info-box full-width bio">
                    <span className="info-label">
                      {isAgent ? "Agent Professional Bio" : "Member Bio"}
                    </span>
                    <span className="info-value">
                      {selectedMember.memberDesc || "No biography provided."}
                    </span>
                  </div>
                </div>

                <div className="section-header mt-6">
                  <div className="title">
                    <span className="material-symbols-outlined">domain</span>
                    <h4>Platform Metrics & Rankings</h4>
                  </div>
                  <span className="verified-badge-label">Verified Data</span>
                </div>

                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">Member Points</span>
                    <span className="info-value">
                      {selectedMember.memberPoints} pts
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Platform Rank</span>
                    <span className="info-value">
                      Level {selectedMember.memberRank}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default UserDrawer;
