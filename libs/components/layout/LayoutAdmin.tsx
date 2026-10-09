import React, { useCallback, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../../apollo/store";
import useAuthSession from "../../hooks/useAuthSession";
import { useNotificationRealtime } from "../../hooks/useNotificationRealtime";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../../apollo/user/query";
import Link from "next/link";
import { DEFAULT_USER_AVATAR, REACT_APP_API_URL } from "../../config";
import AuroraLogo3D from "../AuroraLogo3D";

const withAdminLayout = (Component: any) => {
  return (props: any) => {
    const router = useRouter();
    const user = useReactiveVar(userVar);
    const activePath = router.pathname.replace("/_admin/", "");
    const authChecked = useAuthSession();
    const isAdmin = user.memberType === "ADMIN";

    /** APOLLO REQUESTS **/
    const { data: unreadData, refetch: refetchUnread } = useQuery(
      GET_UNREAD_NOTIFICATION_COUNT,
      {
        fetchPolicy: "network-only",
        skip: !isAdmin,
      },
    );
    const unreadCount: number = unreadData?.getUnreadNotificationCount ?? 0;
    const handleRealtimeNotification = useCallback(() => {
      void refetchUnread();
    }, [refetchUnread]);
    useNotificationRealtime({
      memberId: isAdmin ? user._id : undefined,
      onNotification: handleRealtimeNotification,
    });

    /** LIFECYCLES **/
    useEffect(() => {
      if (authChecked && user.memberType !== "ADMIN") {
        router.push("/");
      }
    }, [authChecked, user, router]);

    if (!user || user.memberType !== "ADMIN") {
      return null;
    }

    return (
      <>
        <Head>
          <title>AURA Administration</title>
        </Head>
        <div id="admin-wrap">
          {/* Fixed Sidebar */}
          <aside className="admin-sidebar">
            <div className="sidebar-top">
              <div className="brand-box">
                <Link href="/" className="logo-link">
                  <section style={{ height: 80 }}>
                    <AuroraLogo3D />
                  </section>
                </Link>
              </div>

              <nav className="sidebar-nav">
                <div className="nav-group">
                  <span className="group-label">General</span>
                  <Link
                    href="/_admin"
                    className={`nav-item ${
                      router.pathname === "/_admin" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">grid_view</span>
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/_admin/notifications"
                    className={`nav-item ${
                      activePath === "notifications" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                    <span>Notifications</span>
                  </Link>
                </div>

                <div className="nav-group">
                  <span className="group-label">Management</span>
                  <Link
                    href="/_admin/users"
                    className={`nav-item ${
                      activePath === "users" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">group</span>
                    <span>Members</span>
                  </Link>
                  <Link
                    href="/_admin/agent-verification"
                    className={`nav-item ${
                      activePath === "agent-verification" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      verified_user
                    </span>
                    <span>Agent Verification</span>
                  </Link>
                  <Link
                    href="/_admin/properties"
                    className={`nav-item ${
                      activePath === "properties" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">hotel</span>
                    <span>Hotels</span>
                  </Link>
                  <Link
                    href="/_admin/tours"
                    className={`nav-item ${
                      activePath === "tours" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">explore</span>
                    <span>Tours</span>
                  </Link>
                  <Link
                    href="/_admin/destinations"
                    className={`nav-item ${
                      activePath === "destinations" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">map</span>
                    <span>Destinations</span>
                  </Link>
                  <Link
                    href="/_admin/bookings"
                    className={`nav-item ${
                      activePath === "bookings" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      calendar_month
                    </span>
                    <span>Bookings</span>
                  </Link>
                </div>

                <div className="nav-group">
                  <span className="group-label">Content</span>
                  <Link
                    href="/_admin/community"
                    className={`nav-item ${
                      activePath === "community" ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">forum</span>
                    <span>Community</span>
                  </Link>
                  <Link
                    href="/_admin/cs"
                    className={`nav-item ${
                      activePath.startsWith("cs") ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined">campaign</span>
                    <span>Notices</span>
                  </Link>
                </div>
              </nav>
            </div>
          </aside>

          <div className="admin-content-wrapper">
            {/* Fixed Header */}
            <header className="admin-header">
              <div className="header-left">
                <div className="breadcrumb">
                  <span className="material-symbols-outlined">home</span>
                  <span>/</span>
                  <span className="current-page">Administration Portal</span>
                </div>
              </div>

              <div className="header-right">
                <Link href="/_admin/notifications">
                  <button
                    className="notif-btn"
                    type="button"
                    aria-label="Notifications"
                  >
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                    {unreadCount > 0 && <span className="notif-badge" />}
                  </button>
                </Link>
                <div className="divider-vertical" />
                <div className="user-profile">
                  <div className="user-info">
                    <span className="user-name">{user.memberNick}</span>
                    <span className="user-role">{user.memberType}</span>
                  </div>
                  <img
                    className="user-avatar"
                    src={
                      user.memberImage
                        ? `${REACT_APP_API_URL}/${user.memberImage}`
                        : DEFAULT_USER_AVATAR
                    }
                    alt="Profile"
                  />
                </div>
              </div>
            </header>

            {/* Main View */}
            <main className="admin-main">
              <Component {...props} />
            </main>
          </div>
        </div>
      </>
    );
  };
};

export default withAdminLayout;
