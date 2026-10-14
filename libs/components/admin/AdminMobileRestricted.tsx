import React from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import AuroraLogo3D from "../AuroraLogo3D";
import { motion } from "framer-motion";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

const AdminMobileRestricted = () => {
  const { t } = useI18n();

  return (
    <div className="admin-mobile-restricted-screen">
      {/* Ambient background glows */}
      <div className="ambient-glow ambient-glow-top" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-bottom" aria-hidden="true" />

      <header className="restricted-header">
        <Link href="/" className="restricted-logo-link" aria-label="AURORA Home">
          <section style={{ height: 64, width: 150 }}>
            <AuroraLogo3D />
          </section>
        </Link>
      </header>

      <main className="restricted-card-container">
        <motion.article
          className="restricted-card"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="restricted-badge">
            <span className="pulsing-amber-dot" aria-hidden="true" />
            <span>{t("admin.mobileRestricted.badge")}</span>
          </div>

          {/* Hero Visual Icon with Halo */}
          <div className="restricted-visual-box" aria-hidden="true">
            <div className="icon-circle-halo">
              <ComputerRoundedIcon className="desktop-hero-icon" />
              <div className="lock-accent-badge">
                <LockPersonRoundedIcon />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="restricted-title">
            {t("admin.mobileRestricted.title")}
          </h1>
          <p className="restricted-description">
            {t("admin.mobileRestricted.description")}
          </p>
          <p className="restricted-subnote">
            {t("admin.mobileRestricted.switchNotice")}
          </p>

          {/* Feature Highlights */}
          <div className="restricted-features-list">
            <div className="feature-item">
              <div className="feature-icon-wrap" aria-hidden="true">
                <TableChartRoundedIcon />
              </div>
              <span className="feature-text">
                {t("admin.mobileRestricted.featureLargeScreens")}
              </span>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrap" aria-hidden="true">
                <LockPersonRoundedIcon />
              </div>
              <span className="feature-text">
                {t("admin.mobileRestricted.featureSecurity")}
              </span>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrap" aria-hidden="true">
                <AnalyticsRoundedIcon />
              </div>
              <span className="feature-text">
                {t("admin.mobileRestricted.featureAnalytics")}
              </span>
            </div>
          </div>

          {/* Current Device Pill */}
          <div className="device-notice-pill">
            <SmartphoneRoundedIcon className="phone-icon" aria-hidden="true" />
            <span>{t("admin.mobileRestricted.currentDevice")}</span>
          </div>

          {/* Action Buttons */}
          <div className="restricted-actions">
            <Link href="/" className="btn-return-home">
              <ArrowBackRoundedIcon aria-hidden="true" />
              <span>{t("admin.mobileRestricted.backToHome")}</span>
            </Link>

            <Link href="/mypage" className="btn-mypage-link">
              <PersonOutlineRoundedIcon aria-hidden="true" />
              <span>{t("admin.mobileRestricted.myPage")}</span>
            </Link>
          </div>
        </motion.article>
      </main>

      <footer className="restricted-footer">
        <span>AURORA Travel &copy; {new Date().getFullYear()} Management Portal</span>
      </footer>
    </div>
  );
};

export default AdminMobileRestricted;
