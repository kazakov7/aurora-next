import React from "react";
import moment from "moment";
import { Member } from "../../types/member/member";
import { MemberType } from "../../enums/member.enum";
import { useI18n } from "../../i18n";

interface MemberSidebarProps {
  activeTab: "articles" | "followers" | "following" | "products";
  onTabChange: (
    tab: "articles" | "followers" | "following" | "products",
  ) => void;
  articlesCount: number;
  followersCount: number;
  followingCount: number;
  member: Member;
}

const MemberSidebar: React.FC<MemberSidebarProps> = ({
  activeTab,
  onTabChange,
  articlesCount,
  followersCount,
  followingCount,
  member,
}) => {
  const { t, formatDate, formatNumber } = useI18n();
  const formatCount = (count: number) => formatNumber(count || 0, { notation: "compact", maximumFractionDigits: 1 });

  const memberSince = member?.createdAt
    ? formatDate(member.createdAt, "monthYear")
    : t("common.dateUnavailable");

  const isAgent = member?.memberType === MemberType.AGENT;
  const hasTours = (member?.memberTours || 0) > 0;
  const hasProperties = (member?.memberProperties || 0) > 0;
  // Determine the correct tab name based on product counters
  const productsLabel = hasProperties
    ? t("common.hotel")
    : hasTours
    ? t("common.tour")
    : t("member.sidebar.agentProducts");
  const productsCount =
    (member?.memberProperties || 0) + (member?.memberTours || 0);

  return (
    <aside aria-label={t("member.sidebar.memberProfileSections")} className="member-sidebar">
      {/* Navigation Box */}
      <nav className="sidebar-nav-card">
        {/* Tab 1: Articles */}
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "articles" ? "active" : ""}`}
          onClick={() => onTabChange("articles")}
        >
          <div className="tab-left">
            <span
              className="material-symbols-outlined"
              style={
                activeTab === "articles"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              menu_book
            </span>
            <span>{t("common.articles")}</span>
          </div>
          <span className="tab-badge">{articlesCount}</span>
        </button>

        {/* Optional Agent Products Tab */}
        {isAgent && (
          <button
            type="button"
            className={`nav-tab-btn ${
              activeTab === "products" ? "active" : ""
            }`}
            onClick={() => onTabChange("products")}
          >
            <div className="tab-left">
              <span
                className="material-symbols-outlined"
                style={
                  activeTab === "products"
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {hasTours ? "explore" : "apartment"}
              </span>
              <span>{productsLabel}</span>
            </div>
            <span className="tab-badge">{productsCount}</span>
          </button>
        )}

        {/* Tab 2: Followers */}
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => onTabChange("followers")}
        >
          <div className="tab-left">
            <span className="material-symbols-outlined">group</span>
            <span>{t("common.followers")}</span>
          </div>
          <span className="tab-badge">{formatCount(followersCount)}</span>
        </button>

        {/* Tab 3: Following */}
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "following" ? "active" : ""}`}
          onClick={() => onTabChange("following")}
        >
          <div className="tab-left">
            <span className="material-symbols-outlined">person_add</span>
            <span>{t("common.followButton.following")}</span>
          </div>
          <span className="tab-badge">{formatCount(followingCount)}</span>
        </button>

      </nav>

      {/* Member Registry Metadata Card */}
      <div className="credentials-card">
        <div className="credentials-header">
          <span className="material-symbols-outlined">verified</span>
          <span>{t("member.sidebar.curatorCredentials")}</span>
        </div>
        <p className="since-text">{t("member.sidebar.memberSince", { memberSince })}</p>
        <p className="credentials-desc">
          {member?.memberPoints
            ? t("member.sidebar.explorationPoints", { memberPoints: member.memberPoints })
            : ""}
          {member?.memberRank ? t("member.sidebar.rank", { memberRank: member.memberRank }) : ""}
          {t("member.sidebar.contributorLine")}
        </p>
      </div>
    </aside>
  );
};

export default MemberSidebar;
