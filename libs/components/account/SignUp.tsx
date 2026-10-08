import React, { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";

import { SIGN_UP } from "../../../apollo/user/mutation";
import { MemberAuthType, MemberType } from "../../enums/member.enum";
import { setJwtToken, updateUserInfo } from "../../auth";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const router = useRouter();

  const [nick, setNick] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  /** APOLLO **/
  const [signupMutation, { loading }] = useMutation(SIGN_UP);

  /** SIGN UP **/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNick = nick.trim();
    const cleanFullName = fullName.trim();

    if (!cleanNick) {
      sweetMixinErrorAlert("Please enter a username.");
      return;
    }

    if (cleanNick.length < 3) {
      sweetMixinErrorAlert("Username must be at least 3 characters long.");
      return;
    }

    if (!password || password.length < 5) {
      sweetMixinErrorAlert("Password must be at least 5 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      sweetMixinErrorAlert("Passwords do not match.");
      return;
    }

    if (!agreedTerms) {
      sweetMixinErrorAlert(
        "Please agree to the Terms of Service and Privacy Policy.",
      );
      return;
    }

    try {
      const { data } = await signupMutation({
        variables: {
          input: {
            memberNick: cleanNick,
            memberFullName: cleanFullName || undefined,
            memberPassword: password,
          },
        },
      });

      if (data?.signup?.accessToken) {
        setJwtToken(data.signup.accessToken);
        updateUserInfo(data.signup.accessToken);

        await sweetTopSmallSuccessAlert(
          `Welcome to AURA, ${data.signup.memberNick}!`,
          1000,
        );

        const target = (router.query.referrer as string) || "/mypage";

        await router.push(target);
      }
    } catch (err: any) {
      console.error("Sign up error:", err);

      sweetMixinErrorAlert(
        err?.message || "Registration failed. Please check your information.",
      );
    }
  };

  /** SOCIAL AUTH **/
  const handleSocialClick = (provider: string) => {
    sweetMixinErrorAlert(
      `${provider} signup is currently integrating with production OAuth.`,
    );
  };

  /** PHONE SIGN UP **/
  const handlePhoneSignup = () => {
    router.push({
      pathname: "/account/phone-signup",
      query: router.query.referrer
        ? { referrer: router.query.referrer }
        : undefined,
    });
  };

  return (
    <div className="auth-split-card">
      {/* LEFT SIDE */}
      <div className="form-panel">
        <div>
          {/* TOP META */}
          <div className="top-meta-bar">
            <div className="meta-left">
              <span className="pulse-dot"></span>
              <span className="meta-title">CREATE ACCOUNT</span>
            </div>

            <span className="meta-version">JOIN AURA V2.4</span>
          </div>

          {/* HEADING */}
          <div className="heading-group">
            <span className="eyebrow">GET STARTED</span>

            <h1>Create your AURA account</h1>

            <p>Join a world of extraordinary travel experiences.</p>
          </div>

          {/* FORM */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div className="field-group">
              <div className="field-header">
                <label htmlFor="nick-input">Username *</label>
              </div>

              <div className="input-wrapper">
                <span className="material-symbols-outlined prefix-icon">
                  alternate_email
                </span>

                <input
                  id="nick-input"
                  type="text"
                  required
                  autoComplete="username"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="e.g. kevin7"
                  className="with-prefix"
                />
              </div>
            </div>

            {/* FULL NAME */}
            <div className="field-group">
              <div className="field-header">
                <label htmlFor="full-name-input">Full Name</label>
              </div>

              <div className="input-wrapper">
                <span className="material-symbols-outlined prefix-icon">
                  person
                </span>

                <input
                  id="full-name-input"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kevin Kazakov"
                  className="with-prefix"
                />
              </div>
            </div>

            {/* PASSWORDS */}
            <div className="two-cols">
              <div className="field-group">
                <div className="field-header">
                  <label htmlFor="pass-input">Password *</label>
                </div>

                <div className="input-wrapper">
                  <span className="material-symbols-outlined prefix-icon">
                    lock
                  </span>

                  <input
                    id="pass-input"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="with-prefix with-suffix"
                  />

                  <button
                    type="button"
                    className="toggle-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="field-group">
                <div className="field-header">
                  <label htmlFor="confirm-pass-input">Confirm Password *</label>
                </div>

                <div className="input-wrapper">
                  <span className="material-symbols-outlined prefix-icon">
                    lock_reset
                  </span>

                  <input
                    id="confirm-pass-input"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="with-prefix with-suffix"
                  />

                  <button
                    type="button"
                    className="toggle-eye-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label="Toggle confirm password visibility"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* PASSWORD HINT */}
            <div className="password-hint">
              <span className="material-symbols-outlined">check_circle</span>

              <span>Use at least 5 characters for your password.</span>
            </div>

            {/* TERMS */}
            <div className="utilities-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                />

                <span>
                  I agree to the{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();

                      sweetMixinErrorAlert(
                        "Terms of Service: Standard user agreement applies.",
                      );
                    }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();

                      sweetMixinErrorAlert(
                        "Privacy Policy: Your personal data is protected.",
                      );
                    }}
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* SUBMIT */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span>Creating Account...</span>
                  <span className="spinner"></span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* SOCIAL DIVIDER */}
          <div className="social-divider">
            <span>or continue with</span>
          </div>

          {/* SOCIAL AUTH */}
          <div className="social-grid">
            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialClick("Google")}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>

              <span>Google</span>
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialClick("Kakao")}
            >
              <svg fill="#3C1E1E" viewBox="0 0 24 24">
                <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.83 5.18 4.6 6.54l-1.17 4.31c-.1.38.32.7.67.5l5.12-3.4c.26.03.52.05.78.05 5.52 0 10-3.48 10-7.77C22 6.48 17.52 3 12 3z" />
              </svg>

              <span>Kakao</span>
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialClick("Telegram")}
            >
              <svg fill="#229ED9" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635z" />
              </svg>

              <span>Telegram</span>
            </button>

            {/* PHONE SIGNUP */}
            <button
              type="button"
              className="social-btn"
              onClick={handlePhoneSignup}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                smartphone
              </span>
              <span>Phone</span>
            </button>
          </div>
        </div>

        {/* SIGN IN */}
        <div className="bottom-redirect">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              className="signin-link"
              onClick={() => {
                if (onSwitchToSignIn) {
                  onSwitchToSignIn();
                } else {
                  router.push("/account/join?view=signin");
                }
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
            {/* Right Column: Immersive Luxury Editorial Feature */}
      <div className="editorial-panel">
        <img
          alt="Swiss Alps sanctuary luxury retreat"
          className="bg-visual-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkvikJZPxn7yNSStoZcrIZiB9AtnKNq6QmfTprY_UCYBPyotZKq5F1P_-rWXJYgWpYKPkDXR5PlGZzy1pp8G8YEWrl-Vl3ZwzQ5LVxuqo_EOmUc-tLbl-2emPIA9q9I4Eeot93ADLf263PGUWrleJirgxadKRfye7QuCgIygtkavdIU4MytCH7a0E7ueii6KfAknxKjPicub1MI4auuIH0QNF_uxkQzwGxUUX30_BmJIvBodlYQfYA"
        />
        <div className="scrim-overlay"></div>
        <div className="scrim-side"></div>

        {/* Top Tag Row */}
        <div className="top-badge-row">
          <div className="collection-tag">
            <span className="material-symbols-outlined">verified</span>
            <span>Swiss Alps · Sanctuary Collection</span>
          </div>
          <button type="button" className="info-btn" aria-label="Explore sanctuary">
            <span className="material-symbols-outlined">explore</span>
          </button>
        </div>

        {/* Bottom Content Narrative */}
        <div className="bottom-content">
          <span className="feature-eyebrow">Editorial Feature</span>
          <h2>Your next journey starts here.</h2>
          <p>Curated stays, bespoke expeditions, and private alpine retreats across the world.</p>
          <div className="indicator-pills">
            <span className="pill active"></span>
            <span className="pill inactive"></span>
            <span className="pill inactive"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
