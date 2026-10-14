import React from "react";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../../apollo/store";
import { sweetConfirmAlert } from "../../sweetAlert";
import { logOut } from "../../auth";
import {
  GET_FAVORITES,
  GET_FAVORITE_TOURS,
  GET_MY_BOOKINGS,
  GET_UNREAD_NOTIFICATION_COUNT,
  GET_MY_AGENT_APPLICATIONS,
} from "../../../apollo/user/query";
import { AgentType, AgentVerificationStatus } from "../../enums/agent.enum";
import { Direction } from "../../enums/common.enum";
import { BookingStatus } from "../../enums/booking.enum";
import { useI18n } from "../../i18n";

interface MyProfileSidebarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const MyProfileSidebar: React.FC<MyProfileSidebarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const { t } = useI18n();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const currentCat =
    activeCategory || (router.query?.category as string) || "articles";
  const queryOptions = {
    fetchPolicy: "network-only" as const,
    skip: !user?._id,
  };
  const { data: favoritePropertiesData } = useQuery(GET_FAVORITES, {
    ...queryOptions,
    variables: { input: { page: 1, limit: 1 } },
  });
  const { data: favoriteToursData } = useQuery(GET_FAVORITE_TOURS, {
    ...queryOptions,
    variables: { input: { page: 1, limit: 1 } },
  });
  const { data: activeBookingsData } = useQuery(GET_MY_BOOKINGS, {
    ...queryOptions,
    variables: {
      input: {
        page: 1,
        limit: 1,
        search: {
          bookingStatusList: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    },
  });
  const { data: unreadData } = useQuery(
    GET_UNREAD_NOTIFICATION_COUNT,
    queryOptions,
  );
  const { data: agentData } = useQuery(GET_MY_AGENT_APPLICATIONS, {
    ...queryOptions,
    variables: {
      input: {
        page: 1,
        limit: 1,
        search: {},
      },
    },
  });

  const latestApplication = agentData?.getMyAgentApplications?.list?.[0];
  const myAgentType =
    latestApplication?.verificationStatus === AgentVerificationStatus.APPROVED
      ? latestApplication.agentType
      : null;
  const hasPending =
    latestApplication?.verificationStatus === AgentVerificationStatus.PENDING;
  const hasRejected =
    latestApplication?.verificationStatus === AgentVerificationStatus.REJECTED ||
    latestApplication?.verificationStatus === AgentVerificationStatus.REVOKED;
  const isApprovedAgent = user?.memberType === "AGENT" && myAgentType;
  // A revoked agent is a USER again but still hosts the guests booked before the revoke
  const isFormerAgent =
    latestApplication?.verificationStatus === AgentVerificationStatus.REVOKED;

  // Partner tab label
  let partnerTabLabel = t("profile.becomeAPartner");
  if (hasPending || hasRejected) {
    partnerTabLabel = t("profile.sidebar.agentApplication");
  }

  const wishlistCount =
    (favoritePropertiesData?.getFavorites?.metaCounter?.[0]?.total ?? 0) +
    (favoriteToursData?.getFavoriteTours?.metaCounter?.[0]?.total ?? 0);
  const activeBookingsCount =
    activeBookingsData?.getMyBookings?.metaCounter?.[0]?.total ?? 0;
  const unreadCount = unreadData?.getUnreadNotificationCount ?? 0;

  const handleNavClick = (e: React.MouseEvent, cat: string) => {
    e.preventDefault();
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      router.push(
        { pathname: "/mypage", query: { category: cat } },
        undefined,
        {
          shallow: true,
          scroll: false,
        },
      );
    }
  };

  const handleLogout = async () => {
    const confirmed = await sweetConfirmAlert(
      t("profile.sidebar.logoutConfirm"),
    );
    if (confirmed) {
      logOut();
    }
  };

  const navItems = [
    {
      id: "articles",
      label: t("common.articles"),
      icon: "menu_book",
      badge: String(user?.memberArticles ?? 0),
    },
    {
      id: "followers",
      label: t("common.followers"),
      icon: "group",
      badge: String(user?.memberFollowers ?? 0),
    },
    {
      id: "following",
      label: t("common.followButton.following"),
      icon: "person_check",
      badge: String(user?.memberFollowings ?? 0),
    },
    {
      id: "wishlist",
      label: t("profile.sidebar.wishlist"),
      icon: "bookmark",
      badge: String(wishlistCount),
    },
    {
      id: "bookings",
      label: t("common.bookings"),
      icon: "confirmation_number",
      badge: t("profile.sidebar.activeCount", { count: activeBookingsCount }),
      badgeClass: "badge-active-amber",
    },
    {
      id: "history",
      label: t("profile.sidebar.visitedHotels"),
      icon: "explore",
      trailingIcon: "chevron_right",
    },
    {
      id: "visitedTours",
      label: t("profile.sidebar.visitedTours"),
      icon: "map",
      trailingIcon: "chevron_right",
    },
    {
      id: "notifications",
      label: t("navigation.notifications"),
      icon: "notifications",
      badge: t("profile.sidebar.unreadCount", { count: unreadCount }),
    },
    {
      id: "requests",
      label: t("profile.sidebar.myRequests"),
      icon: "support_agent",
      trailingIcon: "chevron_right",
    },
    {
      id: "settings",
      label: t("profile.sidebar.settings"),
      icon: "tune",
    },
  ];

  if (user?.memberType === "USER" && !isApprovedAgent) {
    navItems.splice(navItems.length - 1, 0, {
      id: "partner",
      label: partnerTabLabel,
      icon: "storefront",
    });
  }

  return (
    <aside className="profile-sidebar">
      <nav className="sidebar-nav-box">
        {navItems.map((item) => {
          const isActive = currentCat === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-item-btn ${isActive ? "active" : ""}`}
              onClick={(e) => handleNavClick(e, item.id)}
            >
              <div className="item-left">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.trailingIcon ? (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px", color: "#bfc7d2" }}
                >
                  {item.trailingIcon}
                </span>
              ) : item.badge ? (
                <span className={`item-badge ${item.badgeClass || ""}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {(isApprovedAgent || isFormerAgent) && (
          <>
            <div
              className="sidebar-section-title"
              style={{
                padding: "16px 12px 8px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#707881",
                fontWeight: 600,
              }}
            >
              {t("profile.sidebar.partnerOperations")}
            </div>
            {isApprovedAgent && myAgentType === AgentType.HOTEL && (
              <button
                type="button"
                className={`sidebar-item-btn ${
                  currentCat === "myHotels" ? "active" : ""
                }`}
                onClick={(e) => handleNavClick(e, "myHotels")}
              >
                <div className="item-left">
                  <span className="material-symbols-outlined">domain</span>
                  <span>{t("profile.sidebar.myHotels")}</span>
                </div>
              </button>
            )}
            {isApprovedAgent && myAgentType === AgentType.TOUR && (
              <button
                type="button"
                className={`sidebar-item-btn ${
                  currentCat === "myTours" ? "active" : ""
                }`}
                onClick={(e) => handleNavClick(e, "myTours")}
              >
                <div className="item-left">
                  <span className="material-symbols-outlined">explore</span>
                  <span>{t("profile.sidebar.myTours")}</span>
                </div>
              </button>
            )}
            <button
              type="button"
              className={`sidebar-item-btn ${
                currentCat === "reservations" ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "reservations")}
            >
              <div className="item-left">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                <span>{t("profile.sidebar.reservations")}</span>
              </div>
            </button>
          </>
        )}

        <div className="sidebar-nav-divider" />

        {user?.memberType === "ADMIN" && (
          <button
            type="button"
            className="sidebar-item-btn"
            style={{
              color: "#006194",
              fontWeight: 600,
              background: "rgba(204, 229, 255, 0.3)",
            }}
            onClick={() => router.push("/_admin")}
          >
            <div className="item-left">
              <span
                className="material-symbols-outlined"
                style={{ color: "#006194" }}
              >
                dashboard
              </span>
              <span>{t("profile.sidebar.adminDashboard")}</span>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px", color: "#006194" }}
            >
              north_east
            </span>
          </button>
        )}

        <button
          type="button"
          className="sidebar-item-btn logout-btn"
          onClick={handleLogout}
        >
          <div className="item-left">
            <span className="material-symbols-outlined">logout</span>
            <span>{t("auth.logout")}</span>
          </div>
        </button>
      </nav>

      {/* Atelier Concierge Box */}
      <div className="atelier-concierge-card">
        <div className="atelier-header">
          <span className="material-symbols-outlined">support_agent</span>
          <span>{t("profile.sidebar.auroraDirectAtelier")}</span>
        </div>
        <p>
          {t("profile.sidebar.conciergeText")}
        </p>
        <button
          type="button"
          className="chat-curator-btn"
          onClick={() => router.push("/chat")}
        >
          {t("profile.sidebar.chatWithCurator")}
        </button>
      </div>
    </aside>
  );
};

export default MyProfileSidebar;
