import React from "react";

const PropertyHero = () => {
  return (
    <section className="property-hero-section">
      <img
        alt="Aura Luxury Sanctuary Resort at dusk"
        className="hero-image"
        src="/img/banner/hero-hotels.jpg"
      />
      <div className="hero-gradient-overlay"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span className="badge-text">CURATED SANCTUARIES &amp; RESORTS</span>
        </div>
        <h1 className="hero-title">Find Your Perfect Stay</h1>
        <p className="hero-subtitle">
          Exceptional places for every journey. From cliffside Mediterranean
          villas to secluded alpine chalets, engineered for pure stillness.
        </p>
      </div>
    </section>
  );
};

export default PropertyHero;
