import React from "react";
import { useI18n } from "../../i18n";

const DestinationHero = () => {
  const { t } = useI18n();
  return (
    <section className="destination-hero-section">
      {/* Background Image with Scale */}
      <div
        className="hero-bg-image"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/18495176/pexels-photo-18495176.jpeg')",
        }}
      ></div>

      {/* Scrim / Gradient Overlays */}
      <div className="hero-gradient-overlay-bottom"></div>
      <div className="hero-gradient-overlay-left"></div>

      {/* Centered Content Container */}
      <div className="hero-content-wrapper">
        <div className="hero-inner-text">
          <div className="hero-pill-badge">
            <span className="badge-cyan-dot"></span>
            <span className="badge-text">
              {t("destinations.hero.globalSanctuariesTerritories")}
            </span>
          </div>
          <h1 className="hero-main-title">
            {t("destinations.hero.exploreTheWorld")}
          </h1>
          <p className="hero-subtitle">
            {t("destinations.hero.everyDestinationHasAStory")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DestinationHero;
