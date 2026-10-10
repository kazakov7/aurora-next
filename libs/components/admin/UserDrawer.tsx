import React, { useState } from "react";
import { Member } from "../../types/member/member";
import { MemberStatus, MemberType } from "../../enums/member.enum";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";
import { useI18n } from "../../i18n";

// Custom format function without depending on date-fns if not installed
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
  const { tEnum, t, formatDate, formatRelativeTime } = useI18n();
  const [activeTab, setActiveTab] = useState("overview");

  const isAgent = selectedMember.memberType === MemberType.AGENT;
  const isAdmin = selectedMember.memberType === MemberType.ADMIN;

  const getAvatarInitials = () => {
    const name =
      selectedMember.memberFullName || selectedMember.memberNick || "A";
    return name.substring(0, 2).toUpperCase();
  };

  const lastActiveStr = selectedMember.lastLoginAt
    ? formatRelativeTime(selectedMember.lastLoginAt)
    : t("admin.userDrawer.never");

  return (
    <>
      <div className="admin-drawer-backdrop" onClick={closeDrawer} />
      <aside className="admin-member-drawer">
        <div className="drawer-header">
          <div className="header-title">
            <span className="material-symbols-outlined icon-main">badge</span>
            <span className="title-text">{t("admin.userDrawer.memberInspectionManagement")}</span>
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
                      alt={t("admin.userDrawer.avatar")}
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
                        {t("admin.userDrawer.idVerified")}
                      </span>
                    )}
                  </div>
                  <div className="meta-line">
                    <span className="handle">@{selectedMember.memberNick}</span>
                    <span className="dot">•</span>
                    <span className="type">
                      {isAgent
                        ? t("admin.userDrawer.tourOperatorAgent")
                        : isAdmin
                        ? t("admin.userDrawer.platformAdministrator")
                        : t("admin.userDrawer.standardMember")}
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
                    {tEnum("memberType", selectedMember.memberType)}
                  </span>
                  {isAgent && <span className="tag-secondary">{t("admin.userDrawer.specialist")}</span>}
                </div>
                <div
                  className={`status-indicator ${selectedMember.memberStatus.toLowerCase()}`}
                >
                  <span className="dot"></span>
                  {selectedMember.memberStatus === MemberStatus.ACTIVE
                    ? t("admin.userDrawer.activeNormal")
                    : tEnum("memberStatus", selectedMember.memberStatus)}
                </div>
              </div>
            </div>

            <div className="card-bottom-row">
              <div className="bottom-left">
                <span className="auth-info">
                  <span className="material-symbols-outlined">
                    shield_person
                  </span>
                  {t("admin.userDrawer.authType", { type: tEnum("memberAuthType", selectedMember.memberAuthType) })}
                </span>
              </div>
              <div className="bottom-right">
                <span>
                  {t("admin.userDrawer.registered", { localeDateString: formatDate(selectedMember.createdAt, { month: "short", day: "numeric", year: "numeric" }) })}
                </span>
                <span className="dot">•</span>
                <span>
                  {t("admin.userDrawer.lastActive")}{" "}
                  <span className="highlight">{lastActiveStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{t("admin.userDrawer.publishedItems")}</span>
                <span className="material-symbols-outlined icon">explore</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">
                  {selectedMember.memberProperties + selectedMember.memberTours}
                </span>
                <span className="stat-subval active">{t("common.active")}</span>
              </div>
              <div className="stat-footer">
                {t("admin.userDrawer.propertiesTours", { memberProperties: selectedMember.memberProperties, memberTours: selectedMember.memberTours })}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{t("admin.userDrawer.network")}</span>
                <span className="material-symbols-outlined icon">group</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">
                  {selectedMember.memberFollowers}
                </span>
                <span className="stat-subval">{t("admin.userDrawer.followers")}</span>
              </div>
              <div className="stat-footer">
                {t("admin.userDrawer.following", { memberFollowings: selectedMember.memberFollowings })}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{t("admin.userDrawer.community")}</span>
                <span className="material-symbols-outlined icon">forum</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">
                  {selectedMember.memberArticles}
                </span>
                <span className="stat-subval">{t("admin.userDrawer.articles")}</span>
              </div>
              <div className="stat-footer">
                {t("admin.userDrawer.commentsPosted", { memberComments: selectedMember.memberComments })}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{t("admin.userDrawer.engagement")}</span>
                <span className="material-symbols-outlined icon">star</span>
              </div>
              <div className="stat-main">
                <span className="stat-val">{selectedMember.memberLikes}</span>
                <span className="stat-subval highlight">
                  <span className="material-symbols-outlined">star</span>
                </span>
              </div>
              <div className="stat-footer">
                {t("admin.userDrawer.profileViews", { memberViews: selectedMember.memberViews })}
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
                {t("admin.userDrawer.business")}
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
                    <h4>{t("admin.userDrawer.personalContactInformation")}</h4>
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">{t("common.fullName")}</span>
                    <span className="info-value">
                      {selectedMember.memberFullName || "-"}
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">{t("admin.userDrawer.handleSlug")}</span>
                    <span className="info-value">
                      @{selectedMember.memberNick}
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">{t("admin.userDrawer.emailAddress")}</span>
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
                    <span className="info-label">{t("admin.userDrawer.primaryPhone")}</span>
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
                      {t("admin.userDrawer.primaryLocationResidence")}
                    </span>
                    <span className="info-value">
                      {selectedMember.memberAddress || "-"}
                    </span>
                  </div>
                  <div className="info-box full-width bio">
                    <span className="info-label">
                      {isAgent ? t("admin.userDrawer.agentProfessionalBio") : t("admin.userDrawer.memberBio")}
                    </span>
                    <span className="info-value">
                      {selectedMember.memberDesc || t("admin.userDrawer.noBiographyProvided")}
                    </span>
                  </div>
                </div>

                <div className="section-header mt-6">
                  <div className="title">
                    <span className="material-symbols-outlined">domain</span>
                    <h4>{t("admin.userDrawer.platformMetricsRankings")}</h4>
                  </div>
                  <span className="verified-badge-label">{t("admin.userDrawer.verifiedData")}</span>
                </div>

                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">{t("admin.userDrawer.memberPoints")}</span>
                    <span className="info-value">
                      {t("admin.userDrawer.pts", { memberPoints: selectedMember.memberPoints })}
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">{t("admin.userDrawer.platformRank")}</span>
                    <span className="info-value">
                      {t("admin.userDrawer.level", { memberRank: selectedMember.memberRank })}
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
