import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "../../../apollo/store";
import { sweetConfirmAlert, sweetTopSmallSuccessAlert } from "../../sweetAlert";
import { logOut } from "../../auth";

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
      badge: String((user as any)?.memberArticles ?? 24),
    },
    {
      id: "followers",
      label: "Followers",
      icon: "group",
      badge: (user as any)?.memberFollowers
        ? String((user as any).memberFollowers)
        : "8.4k",
    },
    {
      id: "following",
      label: "Following",
      icon: "person_check",
      badge: (user as any)?.memberFollowings
        ? String((user as any).memberFollowings)
        : "412",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: "bookmark",
      badge: "18",
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: "confirmation_number",
      badge: "3 active",
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
      badge: "5 unread",
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
          onClick={() => {
            sweetTopSmallSuccessAlert(
              "Connecting with your dedicated AURA Curator...",
              1200,
            );
          }}
        >
          Chat with Curator
        </button>
      </div>
    </aside>
  );
};

export default MyProfileSidebar;
