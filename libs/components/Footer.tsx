import React from "react";
import Link from "next/link";
import AuroraLogo3D from "./AuroraLogo3D";
import { AppLocale, useI18n } from "../i18n";

const Footer = () => {
  const { locale, t, changeLocale } = useI18n();
  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="brand-col">
            {/* <div className="brand-logo"> */}
            <section style={{ height: 120 }}>
              <AuroraLogo3D align="left" />
            </section>
            {/* </div> */}
            <p className="brand-desc">
              {t("footer.description")}
            </p>
            <div className="locale-selectors">
              <span className="material-symbols-outlined">public</span>
              <label className="sr-only" htmlFor="footer-language-selector">{t("language.select")}</label>
              <select
                id="footer-language-selector"
                className="locale-btn"
                value={locale}
                onChange={(event) => void changeLocale(event.target.value as AppLocale)}
                aria-label={t("language.select")}
              >
                <option value="en">{t("language.english")}</option>
                <option value="ko">{t("language.korean")}</option>
                <option value="uz">{t("language.uzbek")}</option>
              </select>
              <button className="locale-btn" type="button">
                <span>USD ($)</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>

          {/* Explore Links */}
          <div className="footer-col">
            <h4>{t("footer.explore")}</h4>
            <ul>
              <li>
                <Link href="/property">{t("navigation.hotels")}</Link>
              </li>
              <li>
                <Link href="/tour">{t("navigation.tours")}</Link>
              </li>
              <li>
                <Link href="/destination">{t("navigation.destinations")}</Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-col">
            <h4>{t("footer.company")}</h4>
            <ul>
              <li>
                <Link href="/about">{t("footer.about")}</Link>
              </li>
              <li>
                <Link href="/cs">{t("footer.contact")}</Link>
              </li>
              <li>
                <Link href="/cs?tab=faq">{t("footer.helpCenter")}</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-col">
            <h4>{t("footer.legal")}</h4>
            <ul>
              <li>
                <Link href="/cs?tab=terms">{t("footer.privacy")}</Link>
              </li>
              <li>
                <Link href="/cs?tab=terms">{t("footer.terms")}</Link>
              </li>
              <li>
                <Link href="/cs?tab=terms">{t("footer.trust")}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <div className="social-links">
            <a aria-label="Instagram Link" href="#" className="social-btn">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a aria-label="Social Updates Link" href="#" className="social-btn">
              <span className="material-symbols-outlined">tag</span>
            </a>
            <a aria-label="Video Channel Link" href="#" className="social-btn">
              <span className="material-symbols-outlined">smart_display</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
