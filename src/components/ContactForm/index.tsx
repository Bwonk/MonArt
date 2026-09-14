import { useRef, useState } from "preact/hooks";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import {
  buildMessage,
  isValidEmail,
  isValidPhone,
  plainLabel,
  sendContactMessage,
  splitOptions,
} from "../../utils/contact-message";
import FormField, { fieldAria } from "../../sub-components/FormField";
import ConsentCheck from "../../sub-components/ConsentCheck";
import FormSuccess from "../../sub-components/FormSuccess";

type Field = "firstName" | "lastName" | "email" | "phone" | "subject" | "order" | "message";
type Values = Record<Field, string>;

const EMPTY: Values = { firstName: "", lastName: "", email: "", phone: "", subject: "", order: "", message: "" };

export function ContactForm(props: Props) {
  const {
    eyebrow = "",
    title = "Bize Ulaşın",
    intro = "",
    firstNameLabel = "Ad *",
    lastNameLabel = "Soyad *",
    emailLabel = "E-posta *",
    phoneLabel = "Telefon *",
    phonePlaceholder = "",
    subjectLabel = "Konu",
    subjectOptions = "",
    orderLabel = "Sipariş No",
    orderHint = "",
    orderPlaceholder = "",
    messageLabel = "Mesajınız *",
    messagePlaceholder = "",
    consentText = "",
    consentLink,
    consentError = "",
    submitText = "Mesajı Gönder",
    submittingText = "Gönderiliyor…",
    requiredError = "",
    emailError = "",
    phoneError = "",
    failureText = "",
    successTitle = "Mesajınız alındı",
    successText = "",
    successButtonText = "",
    messageTag = "",
    showInfo = true,
    infoTitle = "",
    infoEmailLabel = "",
    infoEmail = "",
    infoPhoneLabel = "",
    infoPhone = "",
    infoAddressLabel = "",
    infoAddress = "",
    infoHoursLabel = "",
    infoHours = "",
    backgroundColor = "#FFFFFF",
    anchorId = "",
  } = props;

  const theme = useSectionTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");

  const subjects = splitOptions(subjectOptions);
  const subject = values.subject || subjects[0] || "";

  const errors: Partial<Record<Field | "consent", string>> = {};
  if (attempted) {
    if (!values.firstName.trim()) errors.firstName = requiredError;
    if (!values.lastName.trim()) errors.lastName = requiredError;
    if (!values.email.trim()) errors.email = requiredError;
    else if (!isValidEmail(values.email)) errors.email = emailError;
    if (!values.phone.trim()) errors.phone = requiredError;
    else if (!isValidPhone(values.phone)) errors.phone = phoneError;
    if (!values.message.trim()) errors.message = requiredError;
    if (consentText && !consent) errors.consent = consentError;
  }

  const set = (field: Field) => (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setValues((v) => ({ ...v, [field]: value }));
    if (status === "failed") setStatus("idle");
  };

  const hasErrors = (v: Values, c: boolean) =>
    !v.firstName.trim() ||
    !v.lastName.trim() ||
    !isValidEmail(v.email) ||
    !isValidPhone(v.phone) ||
    !v.message.trim() ||
    (!!consentText && !c);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (status === "sending") return;
    setAttempted(true);
    if (hasErrors(values, consent)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setStatus("sending");
    const message = buildMessage(
      messageTag,
      [
        [plainLabel(subjectLabel), subject],
        [plainLabel(orderLabel), values.order],
      ],
      [values.message],
    );
    const ok = await sendContactMessage({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message,
    });
    setStatus(ok ? "done" : "failed");
  };

  const reset = () => {
    setValues(EMPTY);
    setConsent(false);
    setAttempted(false);
    setStatus("idle");
  };

  const info = [
    { label: infoEmailLabel, value: infoEmail, href: infoEmail ? `mailto:${infoEmail}` : "" },
    { label: infoPhoneLabel, value: infoPhone, href: infoPhone ? `tel:${infoPhone.replace(/[^\d+]/g, "")}` : "" },
    { label: infoAddressLabel, value: infoAddress, href: "" },
    { label: infoHoursLabel, value: infoHours, href: "" },
  ].filter((i) => i.value.trim());
  const hasInfo = showInfo && info.length > 0;
  const sending = status === "sending";

  return (
    <section
      id={anchorId || undefined}
      className={cx("cf", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className={cx("cf__inner", !hasInfo && "cf__inner--solo")}>
        <header className="cf__head">
          {eyebrow && <span className="cf__eyebrow">{eyebrow}</span>}
          {title && <h1 className="cf__title">{title}</h1>}
          {intro && <p className="cf__intro">{intro}</p>}
        </header>

        <div className="cf__card">
          {status === "done" ? (
            <FormSuccess title={successTitle} text={successText} buttonText={successButtonText} onReset={reset} />
          ) : (
            <form ref={formRef} className="cf__form" onSubmit={onSubmit} noValidate>
              <div className="mf-row">
                <FormField id="cf-first" label={firstNameLabel} error={errors.firstName}>
                  <input
                    className="mon-field mf-control"
                    type="text"
                    autoComplete="given-name"
                    value={values.firstName}
                    onInput={set("firstName")}
                    disabled={sending}
                    {...fieldAria("cf-first", errors.firstName)}
                  />
                </FormField>
                <FormField id="cf-last" label={lastNameLabel} error={errors.lastName}>
                  <input
                    className="mon-field mf-control"
                    type="text"
                    autoComplete="family-name"
                    value={values.lastName}
                    onInput={set("lastName")}
                    disabled={sending}
                    {...fieldAria("cf-last", errors.lastName)}
                  />
                </FormField>
              </div>

              <div className="mf-row">
                <FormField id="cf-email" label={emailLabel} error={errors.email}>
                  <input
                    className="mon-field mf-control"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={values.email}
                    onInput={set("email")}
                    disabled={sending}
                    {...fieldAria("cf-email", errors.email)}
                  />
                </FormField>
                <FormField id="cf-phone" label={phoneLabel} error={errors.phone}>
                  <input
                    className="mon-field mf-control"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={phonePlaceholder || undefined}
                    value={values.phone}
                    onInput={set("phone")}
                    disabled={sending}
                    {...fieldAria("cf-phone", errors.phone)}
                  />
                </FormField>
              </div>

              <div className="mf-row">
                {subjects.length > 0 && (
                  <FormField id="cf-subject" label={subjectLabel}>
                    <div className="mf-select">
                      <select
                        id="cf-subject"
                        className="mon-field mf-control"
                        value={subject}
                        onChange={set("subject")}
                        disabled={sending}
                      >
                        {subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="mf-select__caret" aria-hidden="true">⌄</span>
                    </div>
                  </FormField>
                )}
                <FormField id="cf-order" label={orderLabel} hint={orderHint}>
                  <input
                    id="cf-order"
                    className="mon-field mf-control"
                    type="text"
                    placeholder={orderPlaceholder || undefined}
                    value={values.order}
                    onInput={set("order")}
                    disabled={sending}
                  />
                </FormField>
              </div>

              <FormField id="cf-message" label={messageLabel} error={errors.message}>
                <textarea
                  className="mon-field mf-control"
                  rows={6}
                  placeholder={messagePlaceholder || undefined}
                  value={values.message}
                  onInput={set("message")}
                  disabled={sending}
                  {...fieldAria("cf-message", errors.message)}
                />
              </FormField>

              {consentText && (
                <ConsentCheck
                  id="cf-consent"
                  checked={consent}
                  onChange={setConsent}
                  text={consentText}
                  link={consentLink}
                  error={errors.consent}
                />
              )}

              <div className="cf__actions">
                {status === "failed" && failureText && (
                  <p className="cf__failure" role="alert">
                    {failureText}
                  </p>
                )}
                <button type="submit" className="mon-btn mon-btn--gold mon-btn--lg cf__submit" disabled={sending} aria-busy={sending}>
                  {sending ? submittingText : submitText}
                </button>
              </div>
            </form>
          )}
        </div>

        {hasInfo && (
          <aside className="cf__info">
            {infoTitle && <h2 className="cf__info-title">{infoTitle}</h2>}
            <dl className="cf__info-list">
              {info.map((i) => (
                <div key={i.label + i.value} className="cf__info-item">
                  {i.label && <dt className="cf__info-label">{i.label}</dt>}
                  <dd className="cf__info-value">
                    {i.href ? (
                      <a className="cf__info-link" href={i.href}>
                        {i.value}
                      </a>
                    ) : (
                      i.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </section>
  );
}

export default ContactForm;
