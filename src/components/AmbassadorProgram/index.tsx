import { useRef, useState } from "preact/hooks";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { buildMessage, isValidEmail, isValidPhone, plainLabel, sendContactMessage } from "../../utils/contact-message";
import FormField, { fieldAria } from "../../sub-components/FormField";
import ConsentCheck from "../../sub-components/ConsentCheck";
import FormSuccess from "../../sub-components/FormSuccess";

type Field = "firstName" | "lastName" | "email" | "phone" | "social" | "location" | "vision";
type Values = Record<Field, string>;

const EMPTY: Values = { firstName: "", lastName: "", email: "", phone: "", social: "", location: "", vision: "" };

/** Marka Elçileri tanıtımı + başvuru formu (spec: docs/forms.md §7). */
export function AmbassadorProgram(props: Props) {
  const {
    eyebrow = "",
    title = "The MonetArts Co-Creation Society",
    paragraphOne = "",
    paragraphTwo = "",
    firstNameLabel = "Ad *",
    lastNameLabel = "Soyad *",
    emailLabel = "E-posta Adresi *",
    emailPlaceholder = "",
    phoneLabel = "Telefon",
    phoneHint = "",
    phonePlaceholder = "",
    socialLabel = "Sosyal Medya Hesabı *",
    socialPlaceholder = "",
    locationLabel = "Hedef Kitle Lokasyonu *",
    locationPlaceholder = "",
    visionLabel = "",
    visionPlaceholder = "",
    consentText = "",
    consentLink,
    consentError = "",
    submitText = "Başvuruyu Gönder",
    submittingText = "Gönderiliyor…",
    requiredError = "",
    emailError = "",
    phoneError = "",
    failureText = "",
    successTitle = "Teşekkürler",
    successText = "",
    messageTag = "",
    backgroundColor = "#FFFFFF",
    anchorId = "",
  } = props;

  const theme = useSectionTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");

  // Telefon isteğe bağlı: yalnız doluysa biçimi denetlenir.
  const phoneInvalid = (v: Values) => !!v.phone.trim() && !isValidPhone(v.phone);

  const errors: Partial<Record<Field | "consent", string>> = {};
  if (attempted) {
    if (!values.firstName.trim()) errors.firstName = requiredError;
    if (!values.lastName.trim()) errors.lastName = requiredError;
    if (!values.email.trim()) errors.email = requiredError;
    else if (!isValidEmail(values.email)) errors.email = emailError;
    if (phoneInvalid(values)) errors.phone = phoneError;
    if (!values.social.trim()) errors.social = requiredError;
    if (!values.location.trim()) errors.location = requiredError;
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
    phoneInvalid(v) ||
    !v.social.trim() ||
    !v.location.trim() ||
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
    const vision = values.vision.trim();
    const question = plainLabel(visionLabel);
    const message = buildMessage(
      messageTag,
      [
        [plainLabel(socialLabel), values.social],
        [plainLabel(locationLabel), values.location],
      ],
      [vision ? [question, vision].filter(Boolean).join("\n") : ""],
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

  const sending = status === "sending";

  return (
    <section
      id={anchorId || undefined}
      className={cx("amb", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="amb__inner">
        <header className="amb__head">
          {eyebrow && (
            <span className="amb__eyebrow">
              <span className="amb__eyebrow-line" aria-hidden="true" />
              {eyebrow}
              <span className="amb__eyebrow-line amb__eyebrow-line--end" aria-hidden="true" />
            </span>
          )}
          {title && (
            <h1 className="amb__title">
              {/* "Co-Creation" tireden bölünmesin */}
              {title.split(/(\S*-\S*)/).map((part, i) =>
                part.includes("-") ? (
                  <span key={i} className="amb__nowrap">
                    {part}
                  </span>
                ) : (
                  part
                ),
              )}
            </h1>
          )}
          <span className="amb__crest" aria-hidden="true">
            ✦
          </span>
          {(paragraphOne || paragraphTwo) && (
            <div className="amb__copy">
              {paragraphOne && <p>{paragraphOne}</p>}
              {paragraphTwo && <p>{paragraphTwo}</p>}
            </div>
          )}
        </header>

        {status === "done" ? (
          <FormSuccess title={successTitle} text={successText} onReset={reset} />
        ) : (
          <form ref={formRef} className="amb__form" onSubmit={onSubmit} noValidate>
            <div className="mf-row">
              <FormField id="amb-first" label={firstNameLabel} error={errors.firstName}>
                <input
                  className="mon-field mf-control"
                  type="text"
                  autoComplete="given-name"
                  value={values.firstName}
                  onInput={set("firstName")}
                  disabled={sending}
                  {...fieldAria("amb-first", errors.firstName)}
                />
              </FormField>
              <FormField id="amb-last" label={lastNameLabel} error={errors.lastName}>
                <input
                  className="mon-field mf-control"
                  type="text"
                  autoComplete="family-name"
                  value={values.lastName}
                  onInput={set("lastName")}
                  disabled={sending}
                  {...fieldAria("amb-last", errors.lastName)}
                />
              </FormField>
            </div>

            <div className="mf-row">
              <FormField id="amb-email" label={emailLabel} error={errors.email}>
                <input
                  className="mon-field mf-control"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={emailPlaceholder || undefined}
                  value={values.email}
                  onInput={set("email")}
                  disabled={sending}
                  {...fieldAria("amb-email", errors.email)}
                />
              </FormField>
              <FormField id="amb-phone" label={phoneLabel} hint={phoneHint} error={errors.phone}>
                <input
                  className="mon-field mf-control"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder={phonePlaceholder || undefined}
                  value={values.phone}
                  onInput={set("phone")}
                  disabled={sending}
                  {...fieldAria("amb-phone", errors.phone)}
                />
              </FormField>
            </div>

            <div className="mf-row">
              <FormField id="amb-social" label={socialLabel} error={errors.social}>
                <input
                  className="mon-field mf-control"
                  type="text"
                  autoComplete="off"
                  placeholder={socialPlaceholder || undefined}
                  value={values.social}
                  onInput={set("social")}
                  disabled={sending}
                  {...fieldAria("amb-social", errors.social)}
                />
              </FormField>
              <FormField id="amb-location" label={locationLabel} error={errors.location}>
                <input
                  className="mon-field mf-control"
                  type="text"
                  placeholder={locationPlaceholder || undefined}
                  value={values.location}
                  onInput={set("location")}
                  disabled={sending}
                  {...fieldAria("amb-location", errors.location)}
                />
              </FormField>
            </div>

            <FormField id="amb-vision" label={visionLabel}>
              <textarea
                id="amb-vision"
                className="mon-field mf-control"
                rows={4}
                placeholder={visionPlaceholder || undefined}
                value={values.vision}
                onInput={set("vision")}
                disabled={sending}
              />
            </FormField>

            {consentText && (
              <ConsentCheck
                id="amb-consent"
                checked={consent}
                onChange={setConsent}
                text={consentText}
                link={consentLink}
                error={errors.consent}
              />
            )}

            <div className="amb__actions">
              {status === "failed" && failureText && (
                <p className="amb__failure" role="alert">
                  {failureText}
                </p>
              )}
              <button
                type="submit"
                className="mon-btn mon-btn--gold mon-btn--lg amb__submit"
                disabled={sending}
                aria-busy={sending}
              >
                {sending ? submittingText : submitText}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default AmbassadorProgram;
