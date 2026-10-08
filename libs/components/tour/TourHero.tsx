import React from "react";

const TourHero = () => {
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
              CURATED EXPEDITIONS &amp; VOYAGES
            </span>
          </div>

          {/* Title */}
          <h1 className="hero-title">Discover Extraordinary Journeys</h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Unforgettable experiences, thoughtfully curated. Venture into remote
            landscapes with elite naturalists and private charters.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TourHero;
