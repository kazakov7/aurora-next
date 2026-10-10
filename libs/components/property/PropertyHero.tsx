import React from "react";
import { useI18n } from "../../i18n";

const PropertyHero = () => {
  const { t } = useI18n();
  return (
    <section className="property-hero-section">
      <img
        alt={t("hotels.hero.imageAlt")}
        className="hero-image"
        src="/img/banner/hero-hotels.jpg"
      />
      <div className="hero-gradient-overlay"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span className="badge-text">{t("hotels.hero.curatedSanctuariesResorts")}</span>
        </div>
        <h1 className="hero-title">{t("hotels.hero.findYourPerfectStay")}</h1>
        <p className="hero-subtitle">
          {t("hotels.hero.description")}
        </p>
      </div>
    </section>
  );
};

export default PropertyHero;
