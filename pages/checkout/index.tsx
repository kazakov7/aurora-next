import React, { useState } from "react";
import Head from "next/head";
import Top from "../../libs/components/Top";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "../../apollo/store";


const CheckoutPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activeStep, setActiveStep] = useState<number>(2);
  const [simulationState, setSimulationState] = useState<
    "normal" | "error" | "success"
  >("normal");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleSimulate = (state: "normal" | "error" | "success") => {
    setSimulationState(state);
    if (state === "normal") setPaymentComplete(false);
  };

  const handlePay = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setSimulationState("success");
      setPaymentComplete(true);
    }, 1200);
  };

  return (
    <div className="checkout-page-root">
      <Head>
        <title>AURA Travel — Checkout Page</title>
      </Head>

      <Top />

      <main className="checkout-main">
        <div className="checkout-container">
          {/* Top Context & Stepper */}
          <div className="checkout-top-context">
            <div className="context-text">
              <h1>Complete Your Booking</h1>
              <p>
                Review your reservation before continuing to secure test
                checkout.
              </p>
            </div>
            <nav className="checkout-stepper">
              <ol>
                <li
                  className={`step-item ${
                    activeStep === 1 ? "active" : "completed"
                  }`}
                  onClick={() => setActiveStep(1)}
                >
                  <span className="step-badge">
                    {activeStep > 1 ? "✓" : "1"}
                  </span>
                  <span className="step-label">Booking Details</span>
                </li>
                <span className="material-symbols-outlined separator">
                  chevron_right
                </span>
                <li
                  className={`step-item ${
                    activeStep === 2 ? "active" : "upcoming"
                  }`}
                  onClick={() => setActiveStep(2)}
                >
                  <span className="step-badge">2</span>
                  <span className="step-label">Test Payment</span>
                </li>
                <span className="material-symbols-outlined separator">
                  chevron_right
                </span>
                <li className={`step-item upcoming`}>
                  <span className="step-badge">3</span>
                  <span className="step-label">Confirmation</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Interactive Simulation Switcher */}
          <div className="simulation-switcher">
            <div className="switcher-left">
              <span className="material-symbols-outlined icon">tune</span>
              <span className="label">Interactive Prototype View:</span>
              <div className="tab-group">
                <button
                  className={`tab-btn ${activeStep === 1 ? "active" : ""}`}
                  onClick={() => setActiveStep(1)}
                >
                  Step 1: Details
                </button>
                <button
                  className={`tab-btn ${activeStep === 2 ? "active" : ""}`}
                  onClick={() => setActiveStep(2)}
                >
                  Step 2: Test Payment
                </button>
              </div>
            </div>
            <div className="switcher-right">
              <span>Simulate State:</span>
              <button
                className={`sim-btn ${
                  simulationState === "normal" ? "active" : ""
                }`}
                onClick={() => handleSimulate("normal")}
              >
                Normal
              </button>
              <button
                className={`sim-btn error ${
                  simulationState === "error" ? "active" : ""
                }`}
                onClick={() => handleSimulate("error")}
              >
                Error State
              </button>
              <button
                className={`sim-btn success ${
                  simulationState === "success" ? "active" : ""
                }`}
                onClick={() => handleSimulate("success")}
              >
                Success State
              </button>
            </div>
          </div>

          {/* STEP 2: TEST PAYMENT */}
          {activeStep === 2 && (
            <div className="step-content">
              <div className="payment-card">
                <div className="card-header">
                  <div className="header-info">
                    <span className="material-symbols-outlined icon">
                      credit_card
                    </span>
                    <h2>Complete Your Test Payment</h2>
                  </div>
                  <span className="test-badge">
                    <span className="pulse-dot"></span>
                    TEST MODE — Simulated
                  </span>
                </div>

                <div className="reservation-compact">
                  <div className="res-info">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7bo0Cq-PdzzM8IErY4CZ-AyqifxconkniOXVPIVEL-nyQbzIvi1xXyD-LcWF8E1WqUH0EcXvwToeqHjf0JtzoxwKy7C8pbYglJ2fUcAXCmVHBrwySMnU-AXba263-a-TFqbhgY0Sto9PD_w964Her3e6ckB9GhKAsG6Xdov28WzAmc0yjuKPEL1vOohRrwLtD4URZe0amK2iR8XZNCf-YcCTee56l8CT2NZBVtpO51b5K2Odr8sso"
                      alt="Chalet"
                    />
                    <div className="res-details">
                      <h4>Alpine Grand Retreat</h4>
                      <p>5 Nights • 2 Guests • Zermatt, CH</p>
                    </div>
                  </div>
                  <div className="res-total">
                    <span>Payable Total</span>
                    <strong>$3,400.00 USD</strong>
                  </div>
                </div>

                {simulationState === "error" && (
                  <div className="payment-alert error">
                    <span className="material-symbols-outlined icon">
                      error
                    </span>
                    <div className="alert-text">
                      <strong>Simulated Card Validation Alert</strong>
                      <p>
                        Your card was declined in test mode. Please try standard
                        test card 4242.
                      </p>
                    </div>
                  </div>
                )}

                {simulationState === "success" && (
                  <div className="payment-alert success">
                    <span className="material-symbols-outlined icon">
                      check_circle
                    </span>
                    <div className="alert-text">
                      <strong>Simulated Successful Authorization</strong>
                      <p>
                        Test authorization approved ($3,400.00 USD). Ready to
                        redirect to Confirmation.
                      </p>
                    </div>
                  </div>
                )}

                <div className="payment-method-section">
                  <div className="method-header">
                    <label>Payment Method</label>
                    <div className="card-logos">
                      <svg
                        className="card-logo"
                        fill="none"
                        viewBox="0 0 36 24"
                      >
                        <rect
                          fill="#0A2540"
                          height="24"
                          rx="3"
                          width="36"
                        ></rect>
                        <path
                          d="M14.6 16.5L16.2 7.5H18.7L17.1 16.5H14.6Z"
                          fill="#fff"
                        ></path>
                        <path
                          d="M23.9 7.7C23.4 7.5 22.5 7.3 21.5 7.3C19.1 7.3 17.5 8.5 17.5 10.3C17.5 11.6 18.7 12.3 19.6 12.7C20.5 13.1 20.8 13.4 20.8 13.8C20.8 14.4 20.1 14.7 19.4 14.7C18.4 14.7 17.9 14.5 17.1 14.1L16.7 13.9L16.3 16.2C17 16.5 18.1 16.8 19.3 16.8C21.9 16.8 23.5 15.6 23.5 13.7C23.5 12.7 22.8 11.9 21.4 11.3C20.6 10.9 20.1 10.6 20.1 10.1C20.1 9.7 20.6 9.3 21.5 9.3C22.3 9.3 22.9 9.5 23.4 9.7L23.9 7.7Z"
                          fill="#fff"
                        ></path>
                        <path
                          d="M26.4 7.5H24.5C23.9 7.5 23.4 7.7 23.2 8.3L19.8 16.5H22.4L22.9 15.1H26.1L26.4 16.5H28.7L26.4 7.5ZM23.6 13.2L24.9 9.7L25.7 13.2H23.6Z"
                          fill="#fff"
                        ></path>
                        <path
                          d="M13.2 7.5L10.8 13.7L10.5 12.4C10.1 11.1 8.9 9.6 7.6 8.9L9.8 16.5H12.5L16.4 7.5H13.2Z"
                          fill="#fff"
                        ></path>
                      </svg>
                      <svg
                        className="card-logo"
                        fill="none"
                        viewBox="0 0 36 24"
                      >
                        <rect
                          fill="#0A2540"
                          height="24"
                          rx="3"
                          width="36"
                        ></rect>
                        <circle cx="14" cy="12" fill="#EB001B" r="7"></circle>
                        <circle
                          cx="22"
                          cy="12"
                          fill="#F79E1B"
                          fillOpacity="0.85"
                          r="7"
                        ></circle>
                      </svg>
                      <svg
                        className="card-logo"
                        fill="none"
                        viewBox="0 0 36 24"
                      >
                        <rect
                          fill="#0077A6"
                          height="24"
                          rx="3"
                          width="36"
                        ></rect>
                        <text
                          fill="#fff"
                          fontFamily="sans-serif"
                          fontSize="8"
                          fontWeight="bold"
                          x="6"
                          y="16"
                        >
                          AMEX
                        </text>
                      </svg>
                    </div>
                  </div>

                  <div className="stripe-mockup">
                    <div className="form-group">
                      <label>Card number</label>
                      <div className="input-wrapper">
                        <input type="text" defaultValue="4242 •••• •••• 4242" />
                        <span className="test-label">Stripe Test Card</span>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiration</label>
                        <input type="text" defaultValue="12 / 28" />
                      </div>
                      <div className="form-group">
                        <label>
                          CVC / CVV{" "}
                          <span className="material-symbols-outlined info-icon">
                            info
                          </span>
                        </label>
                        <input type="text" defaultValue="123" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" defaultValue="Elena Rostova" />
                      </div>
                      <div className="form-group">
                        <label>Country or Region</label>
                        <select defaultValue="Switzerland">
                          <option>Switzerland</option>
                          <option>United States</option>
                          <option>Germany</option>
                          <option>France</option>
                          <option>United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="encryption-note">
                    <span className="material-symbols-outlined icon">lock</span>
                    End-to-end encrypted test payload via Stripe Elements SDK
                    mockup.
                  </p>
                </div>

                <div className="payment-actions">
                  <button
                    className={`btn-pay ${isAuthorizing ? "authorizing" : ""}`}
                    disabled={isAuthorizing || paymentComplete}
                    onClick={handlePay}
                  >
                    {isAuthorizing ? (
                      <>
                        <span className="spinner"></span>
                        Authorizing Test Payment...
                      </>
                    ) : paymentComplete ? (
                      <>
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        Payment Successful
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">lock</span>
                        Pay Securely — Test Mode ($3,400.00 USD)
                      </>
                    )}
                  </button>
                  <button className="btn-back" onClick={() => setActiveStep(1)}>
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                    Back to Booking Details
                  </button>
                </div>

                <div className="sandbox-notice">
                  <div className="notice-info">
                    <span className="material-symbols-outlined icon">info</span>
                    This is a demonstration payment. No real money will be
                    charged.
                  </div>
                  <span className="code">ST_SANDBOX_LIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: BOOKING DETAILS */}
          {activeStep === 1 && (
            <div className="step-content two-columns">
              <div className="left-column">
                <section className="booking-section">
                  <div className="section-header">
                    <span className="material-symbols-outlined icon">
                      domain
                    </span>
                    <h2>Reservation Overview</h2>
                  </div>
                  <div className="property-preview">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFoxnKkgaYoIxBO2bAqx3zzyvJCsUMzgufIk_cF4EZzuTgN62vlMIlaks_jd-7GXptaYurZZGJJ2mU7I72hha-0P9I2U24eAs5ZDz15tcp5g8kWqGmg2h9Kuq9fV1j6PuJSGBt-ZpyQkTtZY-jglahtzpqHOTv0Qrv5zCStekZUbnu30fGc5HLhZMn9dwcNgdSEhFbT7P2-JXVRM4c9w-tOoizHRKXK8ZOCfvEkcn65NYSwxd_ipk5"
                      alt="Property"
                      className="prop-img"
                    />
                    <div className="prop-details">
                      <div className="location">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                        Zermatt, Valais, Switzerland
                      </div>
                      <h3>Alpine Grand Retreat</h3>
                      <p>
                        Deluxe Matterhorn Suite •{" "}
                        <span className="highlight">
                          Panoramic Mountain View
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="metrics-grid">
                    <div className="metric-box">
                      <div className="metric-label">
                        <span className="material-symbols-outlined">
                          calendar_today
                        </span>{" "}
                        Check-in
                      </div>
                      <div className="metric-val">Thu, Nov 14, 2025</div>
                      <div className="metric-sub">From 15:00 CET</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-label">
                        <span className="material-symbols-outlined">
                          event_available
                        </span>{" "}
                        Check-out
                      </div>
                      <div className="metric-val">Tue, Nov 19, 2025</div>
                      <div className="metric-sub">By 11:00 CET</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-label">
                        <span className="material-symbols-outlined">
                          nights_stay
                        </span>{" "}
                        Duration
                      </div>
                      <div className="metric-val">5 Nights</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-label">
                        <span className="material-symbols-outlined">group</span>{" "}
                        Guests
                      </div>
                      <div className="metric-val">2 Guests</div>
                    </div>
                  </div>
                </section>

                <section className="booking-section">
                  <div className="section-header">
                    <span className="material-symbols-outlined icon">
                      badge
                    </span>
                    <h2>Guest Information & Preferences</h2>
                  </div>
                  <div className="guest-profile">
                    <div className="guest-avatar">ER</div>
                    <div className="guest-info">
                      <div className="guest-name">Elena Rostova</div>
                      <div className="guest-contacts">
                        <span>elena.rostova@voyage.io</span>
                        <span>+41 (0)27 966 8100</span>
                      </div>
                    </div>
                  </div>
                  <div className="booking-notes">
                    <label>
                      <span>Special Requests / Notes for the Host</span>
                      <span className="optional">Optional</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. High floor room with unobstructed Matterhorn view preferred..."
                    ></textarea>
                  </div>
                </section>

                <section className="sandbox-notice-section">
                  <div className="notice-info">
                    <span className="material-symbols-outlined icon">info</span>
                    <div>
                      <strong>Test Payment Mode</strong>
                      <p>
                        This is a demonstration checkout. No real money will be
                        charged.
                      </p>
                    </div>
                  </div>
                  <span className="badge">Stripe Test Mode</span>
                </section>
              </div>

              <div className="right-column">
                <aside className="summary-card">
                  <div className="summary-header">
                    <h2>Price Summary</h2>
                    <span>USD</span>
                  </div>
                  <div className="prop-micro">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7bo0Cq-PdzzM8IErY4CZ-AyqifxconkniOXVPIVEL-nyQbzIvi1xXyD-LcWF8E1WqUH0EcXvwToeqHjf0JtzoxwKy7C8pbYglJ2fUcAXCmVHBrwySMnU-AXba263-a-TFqbhgY0Sto9PD_w964Her3e6ckB9GhKAsG6Xdov28WzAmc0yjuKPEL1vOohRrwLtD4URZe0amK2iR8XZNCf-YcCTee56l8CT2NZBVtpO51b5K2Odr8sso"
                      alt="Thumb"
                    />
                    <div className="micro-info">
                      <p className="title">Alpine Grand Retreat</p>
                      <p className="desc">5 nights • 2 guests • Zermatt</p>
                    </div>
                  </div>
                  <div className="calc-row">
                    <span>$680.00 × 5 nights</span>
                    <strong>$3,400.00</strong>
                  </div>
                  <div className="total-module">
                    <div className="total-header">
                      <span>Total Due</span>
                      <strong>$3,400.00 USD</strong>
                    </div>
                    <button
                      className="btn-continue"
                      onClick={() => setActiveStep(2)}
                    >
                      Continue to Test Payment
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </button>
                    <span className="notice">
                      Proceeds to Stripe Elements sandbox
                    </span>
                    <button
                      className="btn-back-text"
                      onClick={() => router.back()}
                    >
                      ← Back to Hotel Details
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="checkout-footer">
        <div className="footer-container">
          <p>© 2025 AURA Travel Technologies, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
