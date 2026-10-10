import React from "react";
import { useI18n } from "../../i18n";

const TourHero = () => {
  const { t } = useI18n();
  return (
    <section className="tour-hero-section">
      {/* Cinematic Photography Background */}
      <div
        className="hero-image"
        style={{
          backgroundImage: `url('/img/banner/hero-tour.jpg')`,
        }}
      />

      {/* Multi-stage Scrim & Vignette Gradients */}
      <div className="hero-gradient-overlay" />

      {/* Centered Content Wrapper */}
      <div className="hero-content">
        <div className="hero-text-container">
          {/* Pill Badge */}
          <div className="hero-badge">
            <span className="badge-dot" />
            <span className="badge-text">
              {t("tours.hero.curatedExpeditionsVoyages")}
            </span>
          </div>

          {/* Title */}
          <h1 className="hero-title">{t("tours.hero.discoverExtraordinaryJourneys")}</h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            {t("tours.hero.description")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TourHero;
