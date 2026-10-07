import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="brand-col">
            <div className="brand-logo">
              <span className="logo-text">AURA</span>
            </div>
            <p className="brand-desc">
              Extraordinary journeys, effortlessly curated. Engineered for
              discerning modern travelers seeking discretion, purity, and
              elevated stays worldwide.
            </p>
            <div className="locale-selectors">
              <button className="locale-btn" type="button">
                <span className="material-symbols-outlined">public</span>
                <span>English (US)</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
              <button className="locale-btn" type="button">
                <span>USD ($)</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>

          {/* Explore Links */}
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li>
                <Link href="/property">Hotels</Link>
              </li>
              <li>
                <Link href="/tour">Tours</Link>
              </li>
              <li>
                <Link href="/destination">Destinations</Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/cs">Contact</Link>
              </li>
              <li>
                <Link href="/cs?tab=faq">Help Center</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/cs?tab=terms">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/cs?tab=terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cs?tab=terms">Trust & Safety</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>© 2025 AURA Travel Inc. All rights reserved.</p>
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
