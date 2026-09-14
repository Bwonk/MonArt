import { useRef, useState } from "preact/hooks";
import {
  customerStore,
  getRegisterForm,
  initRegisterForm,
  setRegisterFormFirstName,
  setRegisterFormLastName,
  setRegisterFormEmail,
  setRegisterFormPhone,
  setRegisterFormPassword,
  setRegisterFormIsMembershipAgreementAccepted,
  setRegisterFormIsMarketingAccepted,
  submitRegisterForm,
  handleSocialLogin,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { useGuestOnly, goAfterLogin, pageLink, fieldError, focusFirstInvalid } from "../../utils/auth";
import AuthLayout from "../../sub-components/AuthLayout";
import FormField, { fieldAria } from "../../sub-components/FormField";
import PasswordField from "../../sub-components/PasswordField";
import ConsentCheck from "../../sub-components/ConsentCheck";
import SocialLogin from "../../sub-components/SocialLogin";

export function AuthRegister(props: Props) {
  const {
    eyebrow = "",
    title = "Kayıt Ol",
    intro = "",
    firstNameLabel = "Ad",
    lastNameLabel = "Soyad",
    emailLabel = "E-posta",
    emailPlaceholder = "",
    showPhone = true,
    phoneLabel = "Telefon",
    phoneHint = "",
    phonePlaceholder = "",
    passwordLabel = "Şifre",
    passwordHint = "",
    showPasswordLabel = "Şifreyi göster",
    hidePasswordLabel = "Şifreyi gizle",
    agreementText = "",
    agreementLink,
    marketingText = "",
    marketingLink,
    consentError = "",
    submitText = "Kayıt Ol",
    submittingText = "Kaydediliyor…",
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
    loginPrompt = "",
    loginText = "Giriş yap",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();
  const form = getRegisterForm(customerStore);
  const formRef = useRef<HTMLFormElement>(null);
  const [socialFailed, setSocialFailed] = useState(false);

  useGuestOnly(() => {
    initRegisterForm(form);
    handleSocialLogin(customerStore).then((r) => {
      if (r.status === "success") goAfterLogin();
      else if (r.message) setSocialFailed(true);
    });
  });

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (form.isSubmitting) return;
    setSocialFailed(false);
    // ikas üyelik onayını her zaman zorunlu tutar; metin kaldırılıp kutu gizlendiyse onay verilmiş sayılır.
    if (!agreementText) setRegisterFormIsMembershipAgreementAccepted(form, true);
    const ok = await submitRegisterForm(form);
    if (ok) goAfterLogin();
    else focusFirstInvalid(formRef.current);
  };

  const sending = form.isSubmitting;
  const firstErr = fieldError(form.firstName, requiredError, requiredError);
  const lastErr = fieldError(form.lastName, requiredError, requiredError);
  const emailErr = fieldError(form.email, requiredError, emailError);
  const passwordErr = fieldError(form.password, requiredError, passwordMinError);
  const agreementErr = form.isMembershipAgreementAccepted?.hasError ? consentError : null;

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
            {loginPrompt}
            <a className="au__link" {...pageLink("LOGIN")}>
              {loginText}
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

          <div className="mf-row">
            <FormField id="au-reg-first" label={firstNameLabel} error={firstErr}>
              <input
                className="mon-field mf-control"
                type="text"
                autoComplete="given-name"
                value={form.firstName?.value ?? ""}
                onInput={(e) => setRegisterFormFirstName(form, (e.target as HTMLInputElement).value)}
                disabled={sending}
                {...fieldAria("au-reg-first", firstErr)}
              />
            </FormField>
            <FormField id="au-reg-last" label={lastNameLabel} error={lastErr}>
              <input
                className="mon-field mf-control"
                type="text"
                autoComplete="family-name"
                value={form.lastName?.value ?? ""}
                onInput={(e) => setRegisterFormLastName(form, (e.target as HTMLInputElement).value)}
                disabled={sending}
                {...fieldAria("au-reg-last", lastErr)}
              />
            </FormField>
          </div>

          <FormField id="au-reg-email" label={emailLabel} error={emailErr}>
            <input
              className="mon-field mf-control"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={emailPlaceholder || undefined}
              value={form.email?.value ?? ""}
              onInput={(e) => setRegisterFormEmail(form, (e.target as HTMLInputElement).value)}
              disabled={sending}
              {...fieldAria("au-reg-email", emailErr)}
            />
          </FormField>

          {showPhone && (
            <FormField id="au-reg-phone" label={phoneLabel} hint={phoneHint}>
              <input
                id="au-reg-phone"
                className="mon-field mf-control"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder={phonePlaceholder || undefined}
                value={form.phone?.value ?? ""}
                onInput={(e) => setRegisterFormPhone(form, (e.target as HTMLInputElement).value)}
                disabled={sending}
              />
            </FormField>
          )}

          <PasswordField
            id="au-reg-password"
            label={passwordLabel}
            hint={passwordHint}
            value={form.password?.value ?? ""}
            onInput={(v) => setRegisterFormPassword(form, v)}
            error={passwordErr}
            autoComplete="new-password"
            showLabel={showPasswordLabel}
            hideLabel={hidePasswordLabel}
            disabled={sending}
          />

          {agreementText && (
            <ConsentCheck
              id="au-reg-agreement"
              checked={!!form.isMembershipAgreementAccepted?.value}
              onChange={(v) => setRegisterFormIsMembershipAgreementAccepted(form, v)}
              text={agreementText}
              link={agreementLink}
              error={agreementErr}
            />
          )}
          {marketingText && (
            <ConsentCheck
              id="au-reg-marketing"
              checked={!!form.isMarketingAccepted?.value}
              onChange={(v) => setRegisterFormIsMarketingAccepted(form, v)}
              text={marketingText}
              link={marketingLink}
            />
          )}

          <button type="submit" className="mon-btn mon-btn--gold mon-btn--lg au__submit" disabled={sending}>
            {sending ? submittingText : submitText}
          </button>
        </form>
      </AuthLayout>
    </section>
  );
}

export default AuthRegister;
