import { useRef } from "preact/hooks";
import {
  customerStore,
  getForgotPasswordForm,
  initForgotPasswordForm,
  setForgotPasswordFormEmail,
  submitForgotPasswordForm,
  Router,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { useGuestOnly, pageLink, fieldError, focusFirstInvalid } from "../../utils/auth";
import AuthLayout from "../../sub-components/AuthLayout";
import FormField, { fieldAria } from "../../sub-components/FormField";
import FormSuccess from "../../sub-components/FormSuccess";

export function AuthForgotPassword(props: Props) {
  const {
    eyebrow = "",
    title = "Şifremi Unuttum",
    intro = "",
    emailLabel = "E-posta",
    emailPlaceholder = "",
    submitText = "Bağlantı Gönder",
    submittingText = "Gönderiliyor…",
    requiredError = "",
    emailError = "",
    failureText = "",
    successTitle = "E-postanı kontrol et",
    successText = "",
    successButtonText = "",
    backPrompt = "",
    backText = "Giriş yap",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();
  const form = getForgotPasswordForm(customerStore);
  const formRef = useRef<HTMLFormElement>(null);

  useGuestOnly(() => initForgotPasswordForm(form));

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (form.isSubmitting) return;
    const ok = await submitForgotPasswordForm(form);
    if (!ok) focusFirstInvalid(formRef.current);
  };

  const sending = form.isSubmitting;
  const emailErr = fieldError(form.email, requiredError, emailError);

  return (
    <section
      className={cx("auth", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <AuthLayout
        eyebrow={eyebrow}
        title={title}
        intro={form.isSuccess ? "" : intro}
        footer={
          form.isSuccess ? null : (
            <>
              {backPrompt}
              <a className="au__link" {...pageLink("LOGIN")}>
                {backText}
              </a>
            </>
          )
        }
      >
        {form.isSuccess ? (
          <FormSuccess
            title={successTitle}
            text={successText}
            buttonText={successButtonText}
            onReset={() => Router.navigateToPage("LOGIN")}
          />
        ) : (
          <form ref={formRef} className="au__form" onSubmit={onSubmit} noValidate>
            {form.isFailure && failureText && (
              <p className="au__banner" role="alert">
                {failureText}
              </p>
            )}
            <FormField id="au-forgot-email" label={emailLabel} error={emailErr}>
              <input
                className="mon-field mf-control"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={emailPlaceholder || undefined}
                value={form.email?.value ?? ""}
                onInput={(e) => setForgotPasswordFormEmail(form, (e.target as HTMLInputElement).value)}
                disabled={sending}
                {...fieldAria("au-forgot-email", emailErr)}
              />
            </FormField>
            <button type="submit" className="mon-btn mon-btn--gold mon-btn--lg au__submit" disabled={sending}>
              {sending ? submittingText : submitText}
            </button>
          </form>
        )}
      </AuthLayout>
    </section>
  );
}

export default AuthForgotPassword;
