import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../apollo/store";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../config";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../apollo/user/query";
import { useNotificationRealtime } from "../hooks/useNotificationRealtime";
import AuroraLogo3D from "./AuroraLogo3D";
import GlobalSearch from "./common/GlobalSearch";
import { APP_LOCALES, AppLocale, useI18n } from "../i18n";
import useDeviceDetect from "../hooks/useDeviceDetect";

const LOCALE_CONFIG: Record<
  AppLocale,
  { flag: string; short: string; full: string }
> = {
  en: { flag: "/img/flags/us.svg", short: "EN", full: "English" },
  ko: { flag: "/img/flags/kr.svg", short: "KOR", full: "한국어" },
  uz: { flag: "/img/flags/uz.svg", short: "UZ", full: "O‘zbekcha" },
};

const Top = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const { locale, t, changeLocale } = useI18n();
  const user = useReactiveVar(userVar);
  const [activePath, setActivePath] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuTriggerRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        const focusable = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => {
      mobileDrawerRef.current?.querySelector<HTMLElement>('button, a[href], select')?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
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
                  alt=""
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
                {APP_LOCALES.map((code) => (
                  <option value={code} key={code}>
                    {LOCALE_CONFIG[code].full}
                  </option>
                ))}
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

            {device === "mobile" && (
              <button
                ref={menuTriggerRef}
                type="button"
                className="mobile-menu-trigger"
                aria-label={t("navigation.openMenu")}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">menu</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {device === "mobile" && (
        <>
          <button
            type="button"
            className={`mobile-nav-backdrop ${mobileMenuOpen ? "open" : ""}`}
            aria-label={t("common.close")}
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={closeMobileMenu}
          />
          <aside
            ref={mobileDrawerRef}
            id="mobile-navigation-drawer"
            className={`mobile-navigation-drawer ${mobileMenuOpen ? "open" : ""}`}
            aria-hidden={!mobileMenuOpen}
            aria-label={t("navigation.mainMenu")}
          >
            <div className="mobile-drawer-header">
              <Link href="/" className="mobile-drawer-brand" onClick={closeMobileMenu}>
                AURORA
              </Link>
              <button
                type="button"
                className="mobile-drawer-close"
                aria-label={t("navigation.closeMenu")}
                onClick={() => {
                  closeMobileMenu();
                  menuTriggerRef.current?.focus();
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <nav className="mobile-drawer-links">
              {[
                ["home", "/", t("navigation.home"), "home"],
                ["hotels", "/property", t("navigation.hotels"), "hotel"],
                ["tours", "/tour", t("navigation.tours"), "explore"],
                ["destinations", "/destination", t("navigation.destinations"), "map"],
                ["community", "/community", t("navigation.community"), "forum"],
                ["chat", "/chat", t("navigation.chat"), "chat_bubble"],
                ["customer-service", "/cs", t("navigation.customerService"), "support_agent"],
              ].map(([key, href, label, icon]) => (
                <Link
                  key={key}
                  href={href}
                  className={`mobile-drawer-link ${activePath === key ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
              {user?._id && (
                <Link
                  href="/mypage"
                  className={`mobile-drawer-link ${activePath === "my-page" ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">person</span>
                  <span>{t("navigation.myPage")}</span>
                </Link>
              )}
              {user?.memberType === "ADMIN" && (
                <Link href="/_admin" className="mobile-drawer-link" onClick={closeMobileMenu}>
                  <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                  <span>{t("admin.layout.administrationPortal")}</span>
                </Link>
              )}
            </nav>

            <div className="mobile-drawer-footer">
              <label htmlFor="mobile-language-selector">{t("language.select")}</label>
              <select
                id="mobile-language-selector"
                value={locale}
                onChange={(event) => void changeLocale(event.target.value as AppLocale)}
              >
                {APP_LOCALES.map((code) => (
                  <option value={code} key={code}>{LOCALE_CONFIG[code].full}</option>
                ))}
              </select>
              <Link
                href={user?._id ? "/mypage" : "/account/join"}
                className="mobile-account-link"
                onClick={closeMobileMenu}
              >
                {user?._id ? t("navigation.profile") : t("auth.login")}
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Top;
