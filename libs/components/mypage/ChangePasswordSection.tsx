import React, { useMemo, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { CHANGE_PASSWORD } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { MemberAuthType } from "../../enums/member.enum";
import { useI18n } from "../../i18n";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordField = keyof PasswordFormState;

const EMPTY_FORM: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 12;
const SOCIAL_AUTH_TYPES = new Set<MemberAuthType>([
  MemberAuthType.GOOGLE,
  MemberAuthType.KAKAO,
  MemberAuthType.TELEGRAM,
]);

const ChangePasswordSection = () => {
  const { t, tEnum, tError } = useI18n();
  const user = useReactiveVar(userVar);
  const [form, setForm] = useState<PasswordFormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState<
    Record<PasswordField, boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [submitted, setSubmitted] = useState(false);

  /** APOLLO REQUESTS **/
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

  const isSocialOnlyAccount = SOCIAL_AUTH_TYPES.has(
    user.memberAuthType as MemberAuthType
  );
  const errors = useMemo<Partial<Record<PasswordField, string>>>(() => {
    const nextErrors: Partial<Record<PasswordField, string>> = {};
    if (!form.currentPassword)
      nextErrors.currentPassword = t(
        "profile.settings.password.currentRequired"
      );
    if (!form.newPassword) {
      nextErrors.newPassword = t("profile.settings.password.newRequired");
    } else if (
      form.newPassword.length < PASSWORD_MIN_LENGTH ||
      form.newPassword.length > PASSWORD_MAX_LENGTH
    ) {
      nextErrors.newPassword = t("profile.settings.password.policy");
    } else if (form.newPassword === form.currentPassword) {
      nextErrors.newPassword = t("profile.settings.password.mustDiffer");
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = t(
        "profile.settings.password.confirmRequired"
      );
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = t("profile.settings.password.mismatch");
    }
    return nextErrors;
  }, [form, t]);

  /** HANDLERS **/
  const updateField = (field: PasswordField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleVisibility = (field: PasswordField) => {
    setShowPassword((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || isSocialOnlyAccount) return;

    try {
      const result = await changePassword({ variables: { input: form } });
      if (result.data?.changePassword !== true)
        throw new Error(t("profile.settings.password.updateFailed"));
      setForm(EMPTY_FORM);
      setSubmitted(false);
      await sweetTopSmallSuccessAlert(
        t("profile.settings.password.updated"),
        1800
      );
    } catch (error) {
      await sweetMixinErrorAlert(
        tError(error, "profile.settings.password.updateFailed")
      );
    }
  };

  if (isSocialOnlyAccount) {
    return (
      <section
        className="change-password-card"
        aria-labelledby="change-password-heading"
      >
        <div className="change-password-heading">
          <span className="material-symbols-outlined" aria-hidden="true">
            shield_lock
          </span>
          <div>
            <h3 id="change-password-heading">
              {t("profile.settings.password.title")}
            </h3>
            <p>{t("profile.settings.password.subtitle")}</p>
          </div>
        </div>
        <div className="social-password-notice" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">
            info
          </span>
          <p>
            {t("profile.settings.password.socialOnly", {
              provider: tEnum("memberAuthType", user.memberAuthType),
            })}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="change-password-card"
      aria-labelledby="change-password-heading"
    >
      <div className="change-password-heading">
        <span className="material-symbols-outlined" aria-hidden="true">
          shield_lock
        </span>
        <div>
          <h3 id="change-password-heading">
            {t("profile.settings.password.title")}
          </h3>
          <p>{t("profile.settings.password.subtitle")}</p>
        </div>
      </div>

      <form className="change-password-form" onSubmit={handleSubmit} noValidate>
        {(
          [
            "currentPassword",
            "newPassword",
            "confirmPassword",
          ] as PasswordField[]
        ).map((field) => {
          const labelKey = {
            currentPassword: "profile.settings.password.current",
            newPassword: "profile.settings.password.new",
            confirmPassword: "profile.settings.password.confirm",
          }[field];
          const errorId = `${field}-error`;
          return (
            <div className="password-field" key={field}>
              <label htmlFor={field}>{t(labelKey)}</label>
              <div
                className={`password-input-wrap ${
                  submitted && errors[field] ? "has-error" : ""
                }`}
              >
                <input
                  id={field}
                  type={showPassword[field] ? "text" : "password"}
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  autoComplete={
                    field === "currentPassword"
                      ? "current-password"
                      : "new-password"
                  }
                  aria-invalid={submitted && Boolean(errors[field])}
                  aria-describedby={
                    submitted && errors[field] ? errorId : undefined
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-visibility-btn"
                  onClick={() => toggleVisibility(field)}
                  aria-label={t(
                    showPassword[field]
                      ? "profile.settings.password.hide"
                      : "profile.settings.password.show"
                  )}
                  disabled={loading}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    {showPassword[field] ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {submitted && errors[field] ? (
                <p id={errorId} className="password-field-error">
                  {errors[field]}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="password-policy-note">
          <span className="material-symbols-outlined" aria-hidden="true">
            info
          </span>
          <p>{t("profile.settings.password.policy")}</p>
        </div>

        <button
          type="submit"
          className="change-password-submit"
          disabled={loading}
        >
          {loading
            ? t("profile.settings.password.updating")
            : t("profile.settings.password.submit")}
        </button>
      </form>
    </section>
  );
};

export default ChangePasswordSection;
