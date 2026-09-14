import { useRef, useState } from "preact/hooks";
import {
  customerStore,
  getRecoverPasswordForm,
  initRecoverPasswordForm,
  setRecoverPasswordFormPassword,
  setRecoverPasswordFormPasswordAgain,
  submitRecoverPasswordForm,
  Router,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { useGuestOnly, pageLink, urlParam, fieldError, focusFirstInvalid } from "../../utils/auth";
import AuthLayout from "../../sub-components/AuthLayout";
import PasswordField from "../../sub-components/PasswordField";
import FormSuccess from "../../sub-components/FormSuccess";

export function AuthRecoverPassword(props: Props) {
  const {
    eyebrow = "",
    title = "Yeni Şifre Belirle",
    intro = "",
    passwordLabel = "Yeni şifre",
    passwordHint = "",
    passwordAgainLabel = "Yeni şifre (tekrar)",
    showPasswordLabel = "Şifreyi göster",
    hidePasswordLabel = "Şifreyi gizle",
    submitText = "Şifreyi Kaydet",
    submittingText = "Kaydediliyor…",
    requiredError = "",
    passwordMinError = "",
    passwordMatchError = "",
    failureText = "",
    successTitle = "Şifren güncellendi",
    successText = "",
    successButtonText = "Giriş Yap",
    invalidTitle = "Bağlantı geçersiz",
    invalidText = "",
    invalidButtonText = "Yeni Bağlantı İste",
    forgotText = "",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();
  const form = getRecoverPasswordForm(customerStore);
  const formRef = useRef<HTMLFormElement>(null);
  // Token e-postadaki linkten gelir; submit onu URL'den kendisi okur. Yalnız mount sonrası bakılır.
  const [hasToken, setHasToken] = useState(true);

  useGuestOnly(() => {
    initRecoverPasswordForm(form);
    setHasToken(!!urlParam("token"));
  });

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (form.isSubmitting) return;
    const ok = await submitRecoverPasswordForm(form);
    if (!ok) focusFirstInvalid(formRef.current);
  };

  const sending = form.isSubmitting;
  const passwordErr = fieldError(form.password, requiredError, passwordMinError);
  const againErr = fieldError(form.passwordAgain, requiredError, passwordMatchError);
  const showForm = hasToken && !form.isSuccess;

  return (
    <section
      className={cx("auth", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <AuthLayout
        eyebrow={eyebrow}
        title={title}
        intro={showForm ? intro : ""}
        footer={
          showForm && forgotText ? (
            <a className="au__link" {...pageLink("FORGOT_PASSWORD")}>
              {forgotText}
            </a>
          ) : null
        }
      >
        {form.isSuccess ? (
          <FormSuccess
            title={successTitle}
            text={successText}
            buttonText={successButtonText}
            onReset={() => Router.navigateToPage("LOGIN")}
          />
        ) : !hasToken ? (
          <div className="au__status" role="status">
            <span className="au__status-mark" aria-hidden="true">✦</span>
            <h2 className="au__status-title">{invalidTitle}</h2>
            {invalidText && <p className="au__status-text">{invalidText}</p>}
            {invalidButtonText && (
              <a className="mon-btn mon-btn--gold mon-btn--lg" {...pageLink("FORGOT_PASSWORD")}>
                {invalidButtonText}
              </a>
            )}
          </div>
        ) : (
          <form ref={formRef} className="au__form" onSubmit={onSubmit} noValidate>
            {form.isFailure && failureText && (
              <p className="au__banner" role="alert">
                {failureText}
              </p>
            )}
            <PasswordField
              id="au-recover-password"
              label={passwordLabel}
              hint={passwordHint}
              value={form.password?.value ?? ""}
              onInput={(v) => setRecoverPasswordFormPassword(form, v)}
              error={passwordErr}
              autoComplete="new-password"
              showLabel={showPasswordLabel}
              hideLabel={hidePasswordLabel}
              disabled={sending}
            />
            <PasswordField
              id="au-recover-again"
              label={passwordAgainLabel}
              value={form.passwordAgain?.value ?? ""}
              onInput={(v) => setRecoverPasswordFormPasswordAgain(form, v)}
              error={againErr}
              autoComplete="new-password"
              showLabel={showPasswordLabel}
              hideLabel={hidePasswordLabel}
              disabled={sending}
            />
            <button type="submit" className="mon-btn mon-btn--gold mon-btn--lg au__submit" disabled={sending}>
              {sending ? submittingText : submitText}
            </button>
          </form>
        )}
      </AuthLayout>
    </section>
  );
}

export default AuthRecoverPassword;
