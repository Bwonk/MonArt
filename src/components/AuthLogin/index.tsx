import { useRef, useState } from "preact/hooks";
import {
  customerStore,
  getLoginForm,
  initLoginForm,
  setLoginFormEmail,
  setLoginFormPassword,
  submitLoginForm,
  handleSocialLogin,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { useGuestOnly, goAfterLogin, pageLink, fieldError, focusFirstInvalid } from "../../utils/auth";
import AuthLayout from "../../sub-components/AuthLayout";
import FormField, { fieldAria } from "../../sub-components/FormField";
import PasswordField from "../../sub-components/PasswordField";
import SocialLogin from "../../sub-components/SocialLogin";

export function AuthLogin(props: Props) {
  const {
    eyebrow = "",
    title = "Giriş Yap",
    intro = "",
    emailLabel = "E-posta",
    emailPlaceholder = "",
    passwordLabel = "Şifre",
    showPasswordLabel = "Şifreyi göster",
    hidePasswordLabel = "Şifreyi gizle",
    forgotText = "Şifremi unuttum",
    submitText = "Giriş Yap",
    submittingText = "Giriş yapılıyor…",
    requiredError = "",
    emailError = "",
    passwordMinError = "",
    failureText = "",
    socialFailureText = "",
    showGoogle = true,
    googleText = "",
    showFacebook = true,
    facebookText = "",
    dividerText = "",
    registerPrompt = "",
    registerText = "Kayıt ol",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();
  const form = getLoginForm(customerStore);
  const formRef = useRef<HTMLFormElement>(null);
  const [socialFailed, setSocialFailed] = useState(false);

  useGuestOnly(() => {
    initLoginForm(form);
    handleSocialLogin(customerStore).then((r) => {
      if (r.status === "success") goAfterLogin();
      else if (r.message) setSocialFailed(true);
    });
  });

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (form.isSubmitting) return;
    setSocialFailed(false);
    const ok = await submitLoginForm(form);
    if (ok) goAfterLogin();
    else focusFirstInvalid(formRef.current);
  };

  const sending = form.isSubmitting;
  const emailErr = fieldError(form.email, requiredError, emailError);
  const passwordErr = fieldError(form.password, requiredError, passwordMinError);

  return (
    <section
      className={cx("auth", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <AuthLayout
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        footer={
          <>
            {registerPrompt}
            <a className="au__link" {...pageLink("REGISTER")}>
              {registerText}
            </a>
          </>
        }
      >
        <SocialLogin
          showGoogle={showGoogle}
          googleText={googleText}
          showFacebook={showFacebook}
          facebookText={facebookText}
          dividerText={dividerText}
          onError={() => setSocialFailed(true)}
        />
        <form ref={formRef} className="au__form" onSubmit={onSubmit} noValidate>
          {socialFailed && socialFailureText && (
            <p className="au__banner" role="alert">
              {socialFailureText}
            </p>
          )}
          {form.isFailure && failureText && (
            <p className="au__banner" role="alert">
              {failureText}
            </p>
          )}

          <FormField id="au-login-email" label={emailLabel} error={emailErr}>
            <input
              className="mon-field mf-control"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={emailPlaceholder || undefined}
              value={form.email?.value ?? ""}
              onInput={(e) => setLoginFormEmail(form, (e.target as HTMLInputElement).value)}
              disabled={sending}
              {...fieldAria("au-login-email", emailErr)}
            />
          </FormField>

          <PasswordField
            id="au-login-password"
            label={passwordLabel}
            value={form.password?.value ?? ""}
            onInput={(v) => setLoginFormPassword(form, v)}
            error={passwordErr}
            autoComplete="current-password"
            showLabel={showPasswordLabel}
            hideLabel={hidePasswordLabel}
            disabled={sending}
          />
          <div className="au__aside">
            <a className="au__link" {...pageLink("FORGOT_PASSWORD")}>
              {forgotText}
            </a>
          </div>

          <button type="submit" className="mon-btn mon-btn--gold mon-btn--lg au__submit" disabled={sending}>
            {sending ? submittingText : submitText}
          </button>
        </form>
      </AuthLayout>
    </section>
  );
}

export default AuthLogin;
