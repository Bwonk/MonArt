import { useEffect, useState } from "preact/hooks";
import { customerStore, activateCustomer, resendCustomerActivationMail, Router } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { pageLink } from "../../utils/auth";
import { isValidEmail } from "../../utils/contact-message";
import AuthLayout from "../../sub-components/AuthLayout";
import FormField, { fieldAria } from "../../sub-components/FormField";
import FormSuccess from "../../sub-components/FormSuccess";

type Status = "loading" | "success" | "error";
type Resend = "idle" | "sending" | "sent" | "failed";

export function AuthVerifyEmail(props: Props) {
  const {
    eyebrow = "",
    title = "E-posta Doğrulama",
    loadingText = "Hesabın doğrulanıyor…",
    successTitle = "Hesabın doğrulandı",
    successText = "",
    loginButtonText = "Giriş Yap",
    errorTitle = "Doğrulama tamamlanamadı",
    errorText = "",
    emailLabel = "E-posta",
    emailPlaceholder = "",
    resendText = "Bağlantıyı Tekrar Gönder",
    resendingText = "Gönderiliyor…",
    resendSuccessText = "",
    resendFailureText = "",
    requiredError = "",
    emailError = "",
    backPrompt = "",
    backText = "Giriş yap",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [resend, setResend] = useState<Resend>("idle");

  // activateCustomer ?token='ı URL'den kendisi okur; token yoksa API'ye gitmeden false döner.
  useEffect(() => {
    let alive = true;
    activateCustomer(customerStore)
      .then((ok) => alive && setStatus(ok ? "success" : "error"))
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  const emailErr = !attempted ? null : !email.trim() ? requiredError : !isValidEmail(email) ? emailError : null;

  const onResend = async (e: Event) => {
    e.preventDefault();
    if (resend === "sending") return;
    setAttempted(true);
    if (!isValidEmail(email)) return;
    setResend("sending");
    const ok = await resendCustomerActivationMail(customerStore, email.trim()).catch(() => false);
    setResend(ok ? "sent" : "failed");
  };

  return (
    <section
      className={cx("auth", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <AuthLayout
        eyebrow={eyebrow}
        title={title}
        footer={
          status === "error" ? (
            <>
              {backPrompt}
              <a className="au__link" {...pageLink("LOGIN")}>
                {backText}
              </a>
            </>
          ) : null
        }
      >
        {status === "loading" && (
          <div className="au__status" role="status" aria-live="polite">
            <span className="au__status-mark au__spin" aria-hidden="true">✦</span>
            <p className="au__status-text">{loadingText}</p>
          </div>
        )}

        {status === "success" && (
          <FormSuccess
            title={successTitle}
            text={successText}
            buttonText={loginButtonText}
            onReset={() => Router.navigateToPage("LOGIN")}
          />
        )}

        {status === "error" && (
          <form className="au__form" onSubmit={onResend} noValidate>
            <div className="au__status au__status--left">
              <h2 className="au__status-title">{errorTitle}</h2>
              {errorText && <p className="au__status-text">{errorText}</p>}
            </div>
            {resend === "sent" && resendSuccessText && (
              <p className="au__banner au__banner--ok" role="status">
                {resendSuccessText}
              </p>
            )}
            {resend === "failed" && resendFailureText && (
              <p className="au__banner" role="alert">
                {resendFailureText}
              </p>
            )}
            <FormField id="au-verify-email" label={emailLabel} error={emailErr}>
              <input
                className="mon-field mf-control"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={emailPlaceholder || undefined}
                value={email}
                onInput={(e) => {
                  setEmail((e.target as HTMLInputElement).value);
                  if (resend !== "sending") setResend("idle");
                }}
                disabled={resend === "sending"}
                {...fieldAria("au-verify-email", emailErr)}
              />
            </FormField>
            <button
              type="submit"
              className="mon-btn mon-btn--gold mon-btn--lg au__submit"
              disabled={resend === "sending"}
            >
              {resend === "sending" ? resendingText : resendText}
            </button>
          </form>
        )}
      </AuthLayout>
    </section>
  );
}

export default AuthVerifyEmail;
