import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import useDeviceDetect from "../../libs/hooks/useDeviceDetect";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import CsContactForm from "../../libs/components/cs/CsContactForm";
import { useI18n } from "../../libs/i18n";

const CS: NextPage = () => {
  const { t, tx } = useI18n();
  const device = useDeviceDetect();
  const [searchQuery, setSearchQuery] = useState<string>("");

  /** HANDLERS **/
  const handleSearchTrigger = () => {
    if (!searchQuery.trim()) return;
    const faqSection = document.getElementById("faq");
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  /** One tree for every device: scss/pc/cs/cs.scss styles .cs-page under both #pc-wrap and #mobile-wrap **/
  const page = (
        <div className="cs-page">
          {/* HERO SECTION */}
          <section className="hero-section">
            <div
              className="hero-bg"
              style={{ backgroundImage: "url('/img/banner/callsenter.jpg')" }}
            ></div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="concierge-badge">
                <span className="pulse-dot"></span>
                <span className="badge-text">{t("support.page.eyebrow")}</span>
              </div>
              <h1 className="hero-title">{t("support.page.howCanWeHelpYou")}</h1>
              <p className="hero-subtitle">
                {t("support.page.heroText")}
              </p>

              <div className="search-container">
                <div className="search-input-box">
                  <span className="material-symbols-outlined search-icon">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={t("support.page.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchTrigger()
                    }
                  />
                  <button
                    className="search-btn"
                    onClick={handleSearchTrigger}
                    type="button"
                  >
                    {t("support.page.findAnswers")}
                  </button>
                </div>
                <div className="quick-prompts">
                  <span className="prompt-label">{t("support.page.quickPrompts")}</span>
                  <button
                    onClick={() => setSearchQuery(t("support.page.cancellationPolicy"))}
                    type="button"
                  >
                    {t("support.page.cancellationPolicy")}
                  </button>
                  <button
                    onClick={() => setSearchQuery(t("support.page.refundTimeline"))}
                    type="button"
                  >
                    {t("support.page.refundTimeline")}
                  </button>
                  <button
                    onClick={() => setSearchQuery(t("support.page.modifyDates"))}
                    type="button"
                  >
                    {t("support.page.modifyDates")}
                  </button>
                  <button
                    onClick={() => setSearchQuery(t("support.page.bespokeCharterInquiry"))}
                    type="button"
                  >
                    {t("support.page.bespokeCharterInquiry")}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="content-wrapper">
            {/* TOPICS SECTION */}
            <section className="topics-section">
              <div className="section-header">
                <div className="header-left">
                  <span className="section-eyebrow">{t("support.page.knowledgeRepository")}</span>
                  <h2 className="section-title">{t("support.page.browseByTopic")}</h2>
                  <p className="section-desc">
                    {t("support.page.topicsIntro")}
                  </p>
                </div>
                <div className="header-right">
                  <span className="dot"></span>
                  <span>{t("support.page.updatedAcrossAllTerritories")}</span>
                </div>
              </div>

              <div className="topics-grid">
                <a href="#faq" className="topic-card group">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">
                        calendar_month
                      </span>
                    </div>
                    <h3>{t("support.page.bookingsReservations")}</h3>
                    <p>
                      {t("support.page.topicBookingsText")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span>{t("support.page.explore14Guides")}</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </a>

                <a href="#faq" className="topic-card group">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">
                        apartment
                      </span>
                    </div>
                    <h3>{t("support.page.hotelsStays")}</h3>
                    <p>
                      {t("support.page.topicHotelsText")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span>{t("support.page.explore19Guides")}</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </a>

                <a href="#faq" className="topic-card group">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">explore</span>
                    </div>
                    <h3>{t("support.page.toursExperiences")}</h3>
                    <p>
                      {t("support.page.topicToursText")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span>{t("support.page.explore12Guides")}</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </a>

                <a href="#faq" className="topic-card group">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">
                        account_balance_wallet
                      </span>
                    </div>
                    <h3>{t("support.page.paymentsRefunds")}</h3>
                    <p>
                      {t("support.page.topicPaymentsText")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span>{t("support.page.explore16Guides")}</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </a>

                <a href="#faq" className="topic-card group">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">shield</span>
                    </div>
                    <h3>{t("support.page.accountSecurity")}</h3>
                    <p>
                      {t("support.page.topicAccountText")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span>{t("support.page.explore9Guides")}</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </a>

                <a href="#faq" className="topic-card group">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">
                        support_agent
                      </span>
                    </div>
                    <h3>{t("support.page.safetySupport")}</h3>
                    <p>
                      {t("support.page.topicSafetyText")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span>{t("support.page.explore11Guides")}</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </div>
                </a>
              </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="faq-section">
              <div className="section-header-simple">
                <span className="section-eyebrow">{t("support.page.instantKnowledge")}</span>
                <h2 className="section-title">{t("support.page.frequentlyAskedQuestions")}</h2>
                <p className="section-desc">
                  {t("support.page.faqIntro")}
                </p>
              </div>

              <div className="faq-container">
                <details className="faq-item" open>
                  <summary>
                    <span>{t("support.page.faq1Question")}</span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {tx("support.page.faq1Answer", { link: <a href="#">{t("support.page.faq1Link")}</a> })}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>{t("support.page.faq2Question")}</span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {tx("support.page.faq2Answer", { link: <strong>{t("support.page.myPageBookings")}</strong> })}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>{t("support.page.faq3Question")}</span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {t("support.page.faq3Answer")}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>
                      {t("support.page.faq4Question")}
                    </span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {tx("support.page.faq4Answer", { link: <a href="#">{t("support.page.faq4Link")}</a> })}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>
                      {t("support.page.faq5Question")}
                    </span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {tx("support.page.faq5Answer", { link: <a href="#">{t("support.page.faq5Link")}</a> })}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>
                      {t("support.page.faq6Question")}
                    </span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {tx("support.page.faq6Answer", { link: <a href="#">{t("support.page.myPageBookings")}</a> })}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>
                      {t("support.page.faq7Question")}
                    </span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {tx("support.page.faq7Answer", { link: <strong>{t("support.page.faq7Path")}</strong> })}
                  </div>
                </details>
                <details className="faq-item">
                  <summary>
                    <span>
                      {t("support.page.faq8Question")}
                    </span>
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </summary>
                  <div className="faq-content">
                    {t("support.page.faq8Answer")}
                  </div>
                </details>
              </div>
            </section>

            {/* CONTACT SUPPORT SECTION */}
            <section id="contact-form-section" className="contact-section">
              <div className="section-header-simple">
                <span className="section-eyebrow">{t("support.page.directAssistance")}</span>
                <h2 className="section-title">{t("support.page.contactSupport")}</h2>
                <p className="section-desc">
                  {t("support.page.contactIntro")}
                </p>
              </div>

              <div className="contact-grid">
                {/* Left Info Panel */}
                <div className="info-panel">
                  <div className="info-card">
                    <div className="card-glow"></div>
                    <div className="badge">
                      <span className="pulse-dot"></span>
                      <span className="badge-text">{t("support.page.directSupportDesk")}</span>
                    </div>
                    <h3>{t("support.page.globalConciergeOperations")}</h3>
                    <p className="desc">
                      {t("support.page.operationsText")}
                    </p>

                    <div className="response-time">
                      <span className="material-symbols-outlined icon">
                        schedule
                      </span>
                      <div className="text-box">
                        <p className="title">{t("support.page.typicalResponseTime")}</p>
                        <p className="subtitle">
                          {t("support.page.responseTimeText")}
                        </p>
                      </div>
                    </div>

                    <div className="trust-highlights">
                      <div className="highlight">
                        <span className="material-symbols-outlined">
                          enhanced_encryption
                        </span>
                        <span>{t("support.page.endToEndEncryptedTicketing")}</span>
                      </div>
                      <div className="highlight">
                        <span className="material-symbols-outlined">
                          local_police
                        </span>
                        <span>{t("support.page.directPartnerHostEscalation")}</span>
                      </div>
                      <div className="highlight">
                        <span className="material-symbols-outlined">
                          translate
                        </span>
                        <span>
                          {t("support.page.multilingualTeam")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="inset-card">
                    <div
                      className="bg-img"
                      style={{
                        backgroundImage: "url('/img/banner/hero-tour.jpg')",
                      }}
                    ></div>
                    <div className="overlay"></div>
                    <div className="inset-content">
                      <div className="eyebrow">{t("support.page.genevaBaseDispatch")}</div>
                      <div className="title">
                        {t("support.page.alpineEmergencyCoordinatesActive")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Form Panel */}
                <CsContactForm />
              </div>
            </section>

            {/* STILL NEED HELP CALLOUT */}
            <section className="help-callout">
              <div className="callout-text">
                <h3>{t("support.page.stillNeedHelp")}</h3>
                <p>
                  {t("support.page.closingText")}
                </p>
              </div>
              <div className="callout-actions">
                <a href="#contact-form-section" className="action-btn primary">
                  <span>{t("support.page.submitARequest")}</span>
                  <span className="material-symbols-outlined">north_east</span>
                </a>
                <a href="#faq" className="action-btn secondary">
                  {t("support.page.viewFAQs")}
                </a>
              </div>
            </section>
          </div>
        </div>
  );

  return (
    <>
      <Head>
        <title>{t("support.page.metaTitle")}</title>
      </Head>
      {device === "mobile" ? page : <div id="pc-wrap">{page}</div>}
    </>
  );
};

export default withLayoutBasic(CS);
