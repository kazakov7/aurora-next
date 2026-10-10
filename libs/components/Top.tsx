import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../apollo/store";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../config";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../apollo/user/query";
import { useNotificationRealtime } from "../hooks/useNotificationRealtime";
import AuroraLogo3D from "./AuroraLogo3D";
import GlobalSearch from "./common/GlobalSearch";
import { AppLocale, useI18n } from "../i18n";

const LOCALE_CONFIG: Record<
  AppLocale,
  { flag: string; short: string; full: string; alt: string }
> = {
  en: { flag: "/img/flags/us.svg", short: "EN", full: "English", alt: "USA flag" },
  ko: { flag: "/img/flags/kr.svg", short: "KOR", full: "한국어", alt: "Korea flag" },
  uz: {
    flag: "/img/flags/uz.svg",
    short: "UZ",
    full: "O‘zbekcha",
    alt: "Uzbekistan flag",
  },
};

const Top = () => {
  const router = useRouter();
  const { locale, t, changeLocale } = useI18n();
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
              <AuroraLogo3D align="left" />
            </section>
          </Link>

          <nav className="nav-menu">
            <Link
              href="/"
              className={`nav-item ${activePath === "home" ? "active" : ""}`}
            >
              {t("navigation.home")}
            </Link>
            <Link
              href="/property"
              className={`nav-item ${activePath === "hotels" ? "active" : ""}`}
            >
              {t("navigation.hotels")}
            </Link>
            <Link
              href="/tour"
              className={`nav-item ${activePath === "tours" ? "active" : ""}`}
            >
              {t("navigation.tours")}
            </Link>
            <Link
              href="/destination"
              className={`nav-item ${
                activePath === "destinations" ? "active" : ""
              }`}
            >
              {t("navigation.destinations")}
            </Link>
            <Link
              href="/community"
              className={`nav-item ${
                activePath === "community" ? "active" : ""
              }`}
            >
              {t("navigation.community")}
            </Link>
            {user?._id && (
              <Link
                href="/mypage"
                className={`nav-item ${
                  activePath === "my-page" ? "active" : ""
                }`}
              >
                {t("navigation.myPage")}
              </Link>
            )}
            <Link
              href="/chat"
              className={`nav-item ${activePath === "chat" ? "active" : ""}`}
            >
              {t("navigation.chat")}
            </Link>
            <Link
              href="/cs"
              className={`nav-item ${
                activePath === "customer-service" ? "active" : ""
              }`}
            >
              {t("navigation.customerService")}
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="nav-right">
          {/* Real API-backed global search */}
          <GlobalSearch />

          <Link
            href={
              user?._id ? "/mypage?category=notifications" : "/account/join"
            }
          >
            <button
              aria-label={t("navigation.notifications")}
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

          <div className="lang-currency language-switcher">
            <span className="flag-sphere-3d" aria-hidden="true">
              <img
                src={LOCALE_CONFIG[locale]?.flag || "/img/flags/us.svg"}
                alt={LOCALE_CONFIG[locale]?.alt || "Language flag"}
              />
            </span>
            <span className="lang-current-label">
              {LOCALE_CONFIG[locale]?.short || "EN"}
            </span>
            <span
              className="material-symbols-outlined chevron"
              aria-hidden="true"
            >
              expand_more
            </span>
            <label className="sr-only" htmlFor="site-language-selector">
              {t("language.select")}
            </label>
            <select
              id="site-language-selector"
              className="lang-native-select"
              value={locale}
              onChange={(event) =>
                void changeLocale(event.target.value as AppLocale)
              }
              aria-label={t("language.select")}
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="uz">O‘zbekcha</option>
            </select>
          </div>

          {user?._id ? (
            <div className="user-profile-menu">
              <Link href="/mypage" className="avatar-link">
                <img
                  src={getImageUrl(user?.memberImage, DEFAULT_USER_AVATAR)}
                  alt={t("navigation.profile")}
                  className="avatar-img"
                />
              </Link>
            </div>
          ) : (
            <Link href="/account/join" className="avatar-link">
              <img
                src={DEFAULT_USER_AVATAR}
                alt={t("navigation.profile")}
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
