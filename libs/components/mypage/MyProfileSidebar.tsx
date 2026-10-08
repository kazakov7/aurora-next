import React from "react";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../../apollo/store";
import { sweetConfirmAlert } from "../../sweetAlert";
import { logOut } from "../../auth";
import { GET_FAVORITES, GET_FAVORITE_TOURS, GET_MY_BOOKINGS, GET_UNREAD_NOTIFICATION_COUNT } from "../../../apollo/user/query";
import { BookingStatus } from "../../enums/booking.enum";

interface MyProfileSidebarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const MyProfileSidebar: React.FC<MyProfileSidebarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const currentCat =
    activeCategory || (router.query?.category as string) || "articles";
  const queryOptions = { fetchPolicy: "network-only" as const, skip: !user?._id };
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
        search: { bookingStatusList: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    },
  });
  const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, queryOptions);
  const wishlistCount =
    (favoritePropertiesData?.getFavorites?.metaCounter?.[0]?.total ?? 0) +
    (favoriteToursData?.getFavoriteTours?.metaCounter?.[0]?.total ?? 0);
  const activeBookingsCount = activeBookingsData?.getMyBookings?.metaCounter?.[0]?.total ?? 0;
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
      "Do you want to log out from AURA?",
    );
    if (confirmed) {
      logOut();
    }
  };

  const navItems = [
    {
      id: "articles",
      label: "Articles",
      icon: "menu_book",
      badge: String(user?.memberArticles ?? 0),
    },
    {
      id: "followers",
      label: "Followers",
      icon: "group",
      badge: String(user?.memberFollowers ?? 0),
    },
    {
      id: "following",
      label: "Following",
      icon: "person_check",
      badge: String(user?.memberFollowings ?? 0),
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: "bookmark",
      badge: String(wishlistCount),
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: "confirmation_number",
      badge: `${activeBookingsCount} active`,
      badgeClass: "badge-active-amber",
    },
    {
      id: "history",
      label: "Travel History",
      icon: "explore",
      trailingIcon: "chevron_right",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
      badge: `${unreadCount} unread`,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "tune",
    },
  ];

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

        <div className="sidebar-nav-divider" />

        {user?.memberType === 'ADMIN' && (
          <button
            type="button"
            className="sidebar-item-btn"
            style={{ color: '#006194', fontWeight: 600, background: 'rgba(204, 229, 255, 0.3)' }}
            onClick={() => router.push('/_admin')}
          >
            <div className="item-left">
              <span className="material-symbols-outlined" style={{ color: '#006194' }}>dashboard</span>
              <span>Admin Dashboard</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#006194" }}>
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
            <span>Log Out</span>
          </div>
        </button>
      </nav>

      {/* Atelier Concierge Box */}
      <div className="atelier-concierge-card">
        <div className="atelier-header">
          <span className="material-symbols-outlined">support_agent</span>
          <span>AURA Direct Atelier</span>
        </div>
        <p>
          Need adjustments, private helicopter transfers, or custom dietary
          arrangements?
        </p>
        <button
          type="button"
          className="chat-curator-btn"
          onClick={() => router.push('/chat')}
        >
          Chat with Curator
        </button>
      </div>
    </aside>
  );
};

export default MyProfileSidebar;
