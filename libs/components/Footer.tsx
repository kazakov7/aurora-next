import React from "react";
import Link from "next/link";
import AuroraLogo3D from "./AuroraLogo3D";
import { AppLocale, useI18n } from "../i18n";

const Footer: React.FC = () => {
  const { locale, t, changeLocale } = useI18n();

  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="footer-compact-body">
          {/* Brand Info */}
          <div className="brand-section">
            <div className="brand-logo-wrap">
              <Link href="/" className="brand-logo-link" aria-label="AURORA Home">
                <section className="footer-logo-canvas" style={{ width: 125, height: 38 }}>
                  <AuroraLogo3D align="left" />
                </section>
              </Link>
            </div>
            <p className="brand-tagline">{t("footer.description")}</p>
          </div>

          {/* Quick Essential Navigation */}
          <div className="footer-nav-section">
            <div className="footer-nav-group">
              <span className="nav-heading">{t("footer.explore")}</span>
              <div className="nav-links">
                <Link href="/property">{t("navigation.hotels")}</Link>
                <Link href="/tour">{t("navigation.tours")}</Link>
                <Link href="/destination">{t("navigation.destinations")}</Link>
                <Link href="/community">{t("navigation.community")}</Link>
              </div>
            </div>

            <div className="footer-nav-group">
              <span className="nav-heading">{t("footer.company")}</span>
              <div className="nav-links">
                <Link href="/cs">{t("footer.contact")}</Link>
                <Link href="/cs?tab=faq">{t("footer.helpCenter")}</Link>
                <Link href="/cs?tab=terms">{t("footer.privacy")}</Link>
                <Link href="/cs?tab=terms">{t("footer.terms")}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Preferences & Socials */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>

          {/* Language & Currency Selector */}
          <div className="footer-prefs-box">
            <span className="material-symbols-outlined globe-icon">public</span>
            <select
              id="footer-language-selector"
              className="locale-select"
              value={locale}
              onChange={(event) =>
                void changeLocale(event.target.value as AppLocale)
              }
              aria-label={t("language.select")}
            >
              <option value="en">{t("language.english")}</option>
              <option value="ko">{t("language.korean")}</option>
              <option value="uz">{t("language.uzbek")}</option>
            </select>
            <span className="currency-pill">USD ($)</span>
          </div>

          {/* Social Links */}
          <div className="social-links">
            <a
              aria-label={t("footer.instagramLink")}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a
              aria-label={t("footer.socialUpdatesLink")}
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <span className="material-symbols-outlined">tag</span>
            </a>
            <a
              aria-label={t("footer.videoChannelLink")}
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              <span className="material-symbols-outlined">smart_display</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
