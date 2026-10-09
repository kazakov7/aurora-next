import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../apollo/store";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../config";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../apollo/user/query";
import { useNotificationRealtime } from "../hooks/useNotificationRealtime";
import AuroraLogo3D from "./AuroraLogo3D";

const Top = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activePath, setActivePath] = useState("home");
  const { data: unreadData, refetch: refetchUnread } = useQuery(
    GET_UNREAD_NOTIFICATION_COUNT,
    { skip: !user?._id, fetchPolicy: "network-only" },
  );
  const unreadCount = unreadData?.getUnreadNotificationCount ?? 0;
  const handleRealtimeNotification = useCallback(() => {
    void refetchUnread();
  }, [refetchUnread]);
  useNotificationRealtime({
    memberId: user?._id,
    onNotification: handleRealtimeNotification,
  });

  /** LIFECYCLES **/
  useEffect(() => {
    const pathname = router.pathname;
    if (pathname === "/") setActivePath("home");
    else if (pathname.startsWith("/property")) setActivePath("hotels");
    else if (pathname.startsWith("/tour")) setActivePath("tours");
    else if (pathname.startsWith("/destination")) setActivePath("destinations");
    else if (pathname.startsWith("/community")) setActivePath("community");
    else if (pathname.startsWith("/mypage")) setActivePath("my-page");
    else if (pathname.startsWith("/chat")) setActivePath("chat");
    else if (pathname.startsWith("/cs")) setActivePath("customer-service");
  }, [router.pathname]);

  return (
    <header className="header-navbar">
      <div className="header-container">
        {/* Logo & Navigation */}
        <div className="nav-left">
          <Link href="/" className="logo-link">
            <section style={{ height: 80 }}>
              <AuroraLogo3D />
            </section>
          </Link>

          <nav className="nav-menu">
            <Link
              href="/"
              className={`nav-item ${activePath === "home" ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              href="/property"
              className={`nav-item ${activePath === "hotels" ? "active" : ""}`}
            >
              Hotels
            </Link>
            <Link
              href="/tour"
              className={`nav-item ${activePath === "tours" ? "active" : ""}`}
            >
              Tours
            </Link>
            <Link
              href="/destination"
              className={`nav-item ${
                activePath === "destinations" ? "active" : ""
              }`}
            >
              Destinations
            </Link>
            <Link
              href="/community"
              className={`nav-item ${
                activePath === "community" ? "active" : ""
              }`}
            >
              Community
            </Link>
            {user?._id && (
              <Link
                href="/mypage"
                className={`nav-item ${
                  activePath === "my-page" ? "active" : ""
                }`}
              >
                My Page
              </Link>
            )}
            <Link
              href="/chat"
              className={`nav-item ${activePath === "chat" ? "active" : ""}`}
            >
              Chat
            </Link>
            <Link
              href="/cs"
              className={`nav-item ${
                activePath === "customer-service" ? "active" : ""
              }`}
            >
              CS
            </Link>
          </nav>
        </div>

        {/* Quick Search Input */}
        <div className="nav-search">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined search-icon">
              search
            </span>
            <input
              type="text"
              placeholder="Search places, stays..."
              className="search-input"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="nav-right">
          <Link
            href={user?._id ? "/mypage?category=wishlist" : "/account/join"}
          >
            <button
              aria-label="Saved Wishlist"
              className="icon-btn"
              type="button"
            >
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          </Link>

          <Link
            href={
              user?._id ? "/mypage?category=notifications" : "/account/join"
            }
          >
            <button
              aria-label="Notifications"
              className="icon-btn relative"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="notification-dot">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Link>

          <div className="lang-currency">
            <button className="lang-btn" type="button">
              <span className="material-symbols-outlined">language</span>
              <span>USD · EN</span>
            </button>
          </div>

          {user?._id ? (
            <div className="user-profile-menu">
              <Link href="/mypage" className="avatar-link">
                <img
                  src={getImageUrl(user?.memberImage, DEFAULT_USER_AVATAR)}
                  alt="Profile"
                  className="avatar-img"
                />
              </Link>
            </div>
          ) : (
            <Link href="/account/join" className="avatar-link">
              <img
                src={DEFAULT_USER_AVATAR}
                alt="Profile"
                className="avatar-img"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Top;
