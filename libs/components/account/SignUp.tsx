import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";

import { GOOGLE_AUTH, SIGN_UP } from "../../../apollo/user/mutation";
import { MemberAuthType, MemberType } from "../../enums/member.enum";
import { setJwtToken, updateUserInfo } from "../../auth";
import {
  getGoogleAuthErrorMessage,
  getSafeAuthRedirect,
  getTelegramAuthErrorMessage,
  renderGoogleSignInButton,
  startKakaoAuthorization,
  startTelegramAuthorization,
} from "../../auth/social";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";
import { useI18n } from "../../i18n";

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const { t, tx, tError, locale } = useI18n();
  const router = useRouter();

  const [nick, setNick] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  /** APOLLO **/
  const [signupMutation, { loading }] = useMutation(SIGN_UP);
  const [googleAuth, { loading: googleLoading }] = useMutation(GOOGLE_AUTH);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "kakao" | "telegram" | ""
  >("");

  /** LIFECYCLES **/
  // Returning with the browser back button from a provider page restores this page from bfcache:
  // re-enable the social buttons instead of leaving them stuck in a loading state.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setSocialLoading("");
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  /** SIGN UP **/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNick = nick.trim();
    const cleanFullName = fullName.trim();

    if (!cleanNick) {
      sweetMixinErrorAlert(t("auth.signUp.usernameRequired"));
      return;
    }

    if (cleanNick.length < 3) {
      sweetMixinErrorAlert(t("auth.signUp.usernameTooShort"));
      return;
    }

    if (!password || password.length < 5) {
      sweetMixinErrorAlert(t("auth.signUp.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      sweetMixinErrorAlert(t("auth.signUp.passwordsDoNotMatch"));
      return;
    }

    if (!agreedTerms) {
      sweetMixinErrorAlert(t("auth.signUp.agreementRequired"));
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
          t("auth.signUp.welcomeToAurora", {
            memberNick: data.signup.memberNick,
          }),
          1000,
        );

        await router.push(getSafeAuthRedirect(router.query.referrer));
      }
    } catch (err: any) {
      console.error("Sign up error:", err);

      sweetMixinErrorAlert(tError(err, "auth.signUp.registrationFailed"));
    }
  };

  /** SOCIAL AUTH **/
  const handleGoogleSignup = useCallback(
    async (credential: string) => {
      if (socialLoading) return;
      try {
        setSocialLoading("google");
        const { data } = await googleAuth({
          variables: { input: { credential } },
        });
        const member = data?.googleAuth;
        if (!member?.accessToken) throw new Error("SOCIAL_AUTH_FAILED");
        setJwtToken(member.accessToken);
        updateUserInfo(member.accessToken);
        await sweetTopSmallSuccessAlert(
          t("auth.signUp.welcomeToAurora", { memberNick: member.memberNick }),
          800,
        );
        await router.push(getSafeAuthRedirect(router.query.referrer));
      } catch (error) {
        sweetMixinErrorAlert(getGoogleAuthErrorMessage(error, "sign-up"));
      } finally {
        setSocialLoading("");
      }
    },
    [googleAuth, router, socialLoading, t],
  );

  useEffect(() => {
    const container = googleButtonRef.current;
    if (!container) return;
    let disposed = false;
    void renderGoogleSignInButton(
      container,
      (credential) => {
        if (!disposed) void handleGoogleSignup(credential);
      },
      locale,
    ).catch((error) => {
      if (!disposed)
        sweetMixinErrorAlert(getGoogleAuthErrorMessage(error, "sign-up"));
    });
    return () => {
      disposed = true;
      container.replaceChildren();
    };
  }, [handleGoogleSignup, locale]);

  const handleKakaoSignup = () => {
    if (socialLoading) return;
    try {
      setSocialLoading("kakao");
      startKakaoAuthorization(router.query.referrer);
    } catch {
      setSocialLoading("");
      sweetMixinErrorAlert(t("auth.social.kakaoSignUpNotConfigured"));
    }
  };

  const handleTelegramSignup = async () => {
    if (socialLoading) return;
    try {
      setSocialLoading("telegram");
      // Telegram OIDC creates the AURORA member on first sign-in, so sign-up and sign-in share one flow
      await startTelegramAuthorization(router.query.referrer);
    } catch (error) {
      setSocialLoading("");
      sweetMixinErrorAlert(getTelegramAuthErrorMessage(error));
    }
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
              <span className="meta-title">{t("auth.signUp.badge")}</span>
            </div>

            <span className="meta-version">
              {t("auth.signUp.joinAuroraV24")}
            </span>
          </div>

          {/* HEADING */}
          <div className="heading-group">
            <span className="eyebrow">{t("auth.signUp.getStarted")}</span>

            <h1>{t("auth.signUp.createYourAuroraAccount")}</h1>

            <p>{t("auth.signUp.subtitle")}</p>
          </div>

          {/* FORM */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div className="field-group">
              <div className="field-header">
                <label htmlFor="nick-input">{t("auth.signUp.username")}</label>
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
                  placeholder={t("auth.signUp.usernamePlaceholder")}
                  className="with-prefix"
                />
              </div>
            </div>

            {/* FULL NAME */}
            <div className="field-group">
              <div className="field-header">
                <label htmlFor="full-name-input">{t("common.fullName")}</label>
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
                  placeholder={t("auth.signUp.fullNamePlaceholder")}
                  className="with-prefix"
                />
              </div>
            </div>

            {/* PASSWORDS */}
            <div className="two-cols">
              <div className="field-group">
                <div className="field-header">
                  <label htmlFor="pass-input">
                    {t("auth.signUp.passwordRequiredLabel")}
                  </label>
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
                    aria-label={t("auth.togglePasswordVisibility")}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="field-group">
                <div className="field-header">
                  <label htmlFor="confirm-pass-input">
                    {t("auth.signUp.confirmPassword")}
                  </label>
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
                    aria-label={t("auth.signUp.toggleConfirmVisibility")}
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

              <span>{t("auth.signUp.passwordHint")}</span>
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
                  {tx("auth.signUp.agreeTerms", {
                    terms: (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();

                          sweetMixinErrorAlert(t("auth.signUp.termsNotice"));
                        }}
                      >
                        {t("auth.signUp.termsOfService")}
                      </a>
                    ),
                    privacy: (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();

                          sweetMixinErrorAlert(t("auth.signUp.privacyNotice"));
                        }}
                      >
                        {t("auth.signUp.privacyPolicy")}
                      </a>
                    ),
                  })}
                  .
                </span>
              </label>
            </div>

            {/* SUBMIT */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span>{t("auth.signUp.creatingAccount")}</span>
                  <span className="spinner"></span>
                </>
              ) : (
                <>
                  <span>{t("auth.signUp.submit")}</span>
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* SOCIAL DIVIDER */}
          <div className="social-divider">
            <span>{t("auth.orContinueWith")}</span>
          </div>

          {/* Secondary Social Options */}
          <div className="social-grid">
            {/* Google */}
            <div className="social-btn-wrapper google-btn-wrapper">
              <button
                type="button"
                className="social-btn"
                title={t("auth.continueWithGoogle")}
                disabled={loading || googleLoading || Boolean(socialLoading)}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.google?.accounts?.id
                  ) {
                    window.google.accounts.id.prompt?.();
                  }
                }}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google</span>
              </button>
              <div
                ref={googleButtonRef}
                className={`google-overlay-container ${
                  loading || googleLoading || socialLoading ? "is-disabled" : ""
                }`}
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              className="social-btn"
              onClick={handleKakaoSignup}
              disabled={loading || googleLoading || Boolean(socialLoading)}
            >
              <svg fill="#3C1E1E" viewBox="0 0 24 24">
                <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.83 5.18 4.6 6.54l-1.17 4.31c-.1.38.32.7.67.5l5.12-3.4c.26.03.52.05.78.05 5.52 0 10-3.48 10-7.77C22 6.48 17.52 3 12 3z" />
              </svg>

              <span>Kakao</span>
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={handleTelegramSignup}
              disabled={loading || googleLoading || Boolean(socialLoading)}
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
              <span>{t("auth.signUp.phone")}</span>
            </button>
          </div>
        </div>

        {/* SIGN IN */}
        <div className="bottom-redirect">
          <p>
            {t("auth.signUp.alreadyHaveAnAccount")}{" "}
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
              {t("auth.signInButton")}
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      {/* Right Column: Immersive Luxury Editorial Feature */}
      <div className="editorial-panel">
        <img
          alt={t("auth.panel.imageAlt")}
          className="bg-visual-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkvikJZPxn7yNSStoZcrIZiB9AtnKNq6QmfTprY_UCYBPyotZKq5F1P_-rWXJYgWpYKPkDXR5PlGZzy1pp8G8YEWrl-Vl3ZwzQ5LVxuqo_EOmUc-tLbl-2emPIA9q9I4Eeot93ADLf263PGUWrleJirgxadKRfye7QuCgIygtkavdIU4MytCH7a0E7ueii6KfAknxKjPicub1MI4auuIH0QNF_uxkQzwGxUUX30_BmJIvBodlYQfYA"
        />
        <div className="scrim-overlay"></div>
        <div className="scrim-side"></div>

        {/* Top Tag Row */}
        <div className="top-badge-row">
          <div className="collection-tag">
            <span className="material-symbols-outlined">verified</span>
            <span>{t("auth.panel.collection")}</span>
          </div>
          <button
            type="button"
            className="info-btn"
            aria-label={t("auth.panel.explore")}
          >
            <span className="material-symbols-outlined">explore</span>
          </button>
        </div>

        {/* Bottom Content Narrative */}
        <div className="bottom-content">
          <span className="feature-eyebrow">{t("auth.panel.eyebrow")}</span>
          <h2>{t("auth.panel.title")}</h2>
          <p>{t("auth.panel.text")}</p>
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
