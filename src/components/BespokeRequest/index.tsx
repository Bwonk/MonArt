import { useRef, useState } from "preact/hooks";
import { IkasProductOption, productOptionFileUpload } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";
import { allOptions, findOption, isFile } from "../../utils/ikas-options";
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from "../../utils/coin";
import {
  buildMessage,
  fillTemplate,
  isValidEmail,
  isValidPhone,
  plainLabel,
  sendContactMessage,
  splitOptions,
} from "../../utils/contact-message";
import FormField, { fieldAria } from "../../sub-components/FormField";
import ConsentCheck from "../../sub-components/ConsentCheck";
import FormSuccess from "../../sub-components/FormSuccess";
import ReferenceUpload from "../../sub-components/ReferenceUpload";

type Field = "firstName" | "lastName" | "phone" | "email" | "material" | "note";
type Values = Record<Field, string>;
type Status = "idle" | "uploading" | "sending" | "done" | "failed";

const EMPTY: Values = { firstName: "", lastName: "", phone: "", email: "", material: "", note: "" };

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Kabul edilen MIME türleri: jpg/png/webp, opsiyonun uzantı listesi varsa onunla kesişim. */
function allowedTypes(option: IkasProductOption | undefined): string[] {
  const exts = option?.fileSettings?.allowedExtensions?.map((e) => e.replace(/^\./, "").toLowerCase()) ?? [];
  if (!exts.length) return PHOTO_TYPES;
  // Uzantı ("jpg", ".png") ya da MIME ("image/webp") biçiminde gelebilir.
  const fromOption = new Set(exts.map((e) => (e.includes("/") ? e : EXT_TO_MIME[e])).filter(Boolean));
  const both = PHOTO_TYPES.filter((t) => fromOption.has(t));
  return both.length ? both : PHOTO_TYPES;
}

/**
 * Dosyaları opsiyonun `maxQuantity` boyunda parçalar halinde yükler (fazlası verilirse ikas hiç yüklemiyor).
 * Herhangi bir parça eksik dönerse null.
 */
async function uploadInChunks(option: IkasProductOption, files: File[]): Promise<string[] | null> {
  const size = Math.max(1, option.fileSettings?.maxQuantity || 3);
  const urls: string[] = [];
  for (let i = 0; i < files.length; i += size) {
    const part = files.slice(i, i + size);
    const res = await productOptionFileUpload(option, part);
    if (!res || res.length < part.length) return null;
    urls.push(...res);
  }
  return urls;
}

export function BespokeRequest(props: Props) {
  const {
    eyebrow = "",
    title = "Özel Tasarım Talebi",
    intro = "",
    firstNameLabel = "Ad",
    firstNamePlaceholder = "",
    lastNameLabel = "Soyad",
    lastNamePlaceholder = "",
    phoneLabel = "Telefon / WhatsApp",
    phonePlaceholder = "",
    emailLabel = "E-posta",
    emailPlaceholder = "",
    materialLabel = "Materyal Tercihi",
    materialPlaceholder = "",
    materialOptions = "",
    noteLabel = "Özel Açıklama / Not",
    notePlaceholder = "",
    noteMaxLength = 800,
    notice = "",
    filesLabel = "",
    filesHint = "",
    dropLead = "",
    dropHint = "",
    removeFileLabel = "",
    maxFiles = 5,
    fileTypeError = "",
    fileSizeError = "",
    fileLimitError = "",
    uploadError = "",
    product,
    uploadOptionName = "Yüz 1 · Fotoğraf",
    consentText = "",
    consentLink,
    consentError = "",
    submitText = "Talebi Gönder",
    uploadingText = "",
    submittingText = "",
    cancelLink,
    requiredError = "",
    emailError = "",
    phoneError = "",
    materialError = "",
    failureText = "",
    successTitle = "Talebiniz alındı",
    successText = "",
    successButtonText = "",
    messageTag = "",
    filesHeading = "",
    backgroundColor = "#FFFFFF",
    anchorId = "",
  } = props;

  const theme = useSectionTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [fileMsg, setFileMsg] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [failMsg, setFailMsg] = useState("");
  /** Başarısız gönderimden sonra aynı dosyaları yeniden yüklememek için. */
  const uploaded = useRef<{ files: File[]; urls: string[] } | null>(null);

  const materials = splitOptions(materialOptions);
  const noteMax = noteMaxLength > 0 ? noteMaxLength : undefined;
  const fileLimit = Math.max(1, maxFiles || 5);

  const keywords = uploadOptionName.split("·").map((k) => k.trim()).filter(Boolean);
  const uploadOption = keywords.length ? findOption(allOptions(product), ...keywords) : undefined;
  const canUpload = !!uploadOption && isFile(uploadOption);
  const types = allowedTypes(uploadOption);

  const errors: Partial<Record<Field | "consent", string>> = {};
  if (attempted) {
    if (!values.firstName.trim()) errors.firstName = requiredError;
    if (!values.lastName.trim()) errors.lastName = requiredError;
    if (!values.phone.trim()) errors.phone = requiredError;
    else if (!isValidPhone(values.phone)) errors.phone = phoneError;
    if (!values.email.trim()) errors.email = requiredError;
    else if (!isValidEmail(values.email)) errors.email = emailError;
    if (materials.length && !values.material) errors.material = materialError;
    if (consentText && !consent) errors.consent = consentError;
  }

  const busy = status === "uploading" || status === "sending";

  const set = (field: Field) => (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setValues((v) => ({ ...v, [field]: value }));
    if (status === "failed") setStatus("idle");
  };

  const addFiles = (incoming: File[]) => {
    const next = [...files];
    const msgs: string[] = [];
    for (const f of incoming) {
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      if (next.length >= fileLimit) {
        if (fileLimitError) msgs.push(fileLimitError);
        break;
      }
      if (!types.includes(f.type)) {
        if (fileTypeError) msgs.push(fillTemplate(fileTypeError, { name: f.name }));
        continue;
      }
      if (f.size > PHOTO_MAX_BYTES) {
        if (fileSizeError) msgs.push(fillTemplate(fileSizeError, { name: f.name }));
        continue;
      }
      next.push(f);
    }
    setFiles(next);
    setFileMsg(msgs.length ? msgs.join(" ") : null);
    if (status === "failed") setStatus("idle");
  };

  const removeFile = (index: number) => {
    setFiles((list) => list.filter((_, i) => i !== index));
    setFileMsg(null);
    if (status === "failed") setStatus("idle");
  };

  const hasErrors = (v: Values, c: boolean) =>
    !v.firstName.trim() ||
    !v.lastName.trim() ||
    !isValidPhone(v.phone) ||
    !isValidEmail(v.email) ||
    (materials.length > 0 && !v.material) ||
    (!!consentText && !c);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    setAttempted(true);
    if (hasErrors(values, consent)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    let urls: string[] = [];
    const toUpload = canUpload ? files : [];
    if (toUpload.length) {
      if (uploaded.current?.files === toUpload) {
        urls = uploaded.current.urls;
      } else {
        setStatus("uploading");
        let res: string[] | null = null;
        try {
          res = await uploadInChunks(uploadOption!, toUpload);
        } catch (err) {
          console.error("[BespokeRequest] upload", err);
        }
        if (!res) {
          setFailMsg(uploadError || failureText);
          setStatus("failed");
          return;
        }
        uploaded.current = { files: toUpload, urls: res };
        urls = res;
      }
    }

    setStatus("sending");
    const filesBlock = urls.length
      ? [filesHeading ? `${filesHeading}:` : "", ...urls.map((u, i) => `${i + 1}. ${u}`)].filter(Boolean).join("\n")
      : "";
    const message = buildMessage(messageTag, [[plainLabel(materialLabel), values.material]], [values.note, filesBlock]);
    const ok = await sendContactMessage({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message,
    });
    if (ok) {
      setStatus("done");
    } else {
      setFailMsg(failureText);
      setStatus("failed");
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setFiles([]);
    setFileMsg(null);
    setConsent(false);
    setAttempted(false);
    setFailMsg("");
    uploaded.current = null;
    setStatus("idle");
  };

  const submitLabel = status === "uploading" ? uploadingText || submittingText : status === "sending" ? submittingText : submitText;

  return (
    <section
      id={anchorId || undefined}
      className={cx("bq", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="bq__inner">
        <header className="bq__head">
          {eyebrow && <span className="bq__eyebrow">{eyebrow}</span>}
          {title && <h1 className="bq__title">{title}</h1>}
          {intro && <p className="bq__intro">{intro}</p>}
        </header>

        <div className="bq__card">
          {status === "done" ? (
            <FormSuccess title={successTitle} text={successText} buttonText={successButtonText} onReset={reset} />
          ) : (
            <form ref={formRef} className="bq__form" onSubmit={onSubmit} noValidate>
              <div className="mf-row">
                <FormField id="bq-first" label={firstNameLabel} error={errors.firstName}>
                  <input
                    className="mon-field mf-control"
                    type="text"
                    autoComplete="given-name"
                    placeholder={firstNamePlaceholder || undefined}
                    value={values.firstName}
                    onInput={set("firstName")}
                    disabled={busy}
                    {...fieldAria("bq-first", errors.firstName)}
                  />
                </FormField>
                <FormField id="bq-last" label={lastNameLabel} error={errors.lastName}>
                  <input
                    className="mon-field mf-control"
                    type="text"
                    autoComplete="family-name"
                    placeholder={lastNamePlaceholder || undefined}
                    value={values.lastName}
                    onInput={set("lastName")}
                    disabled={busy}
                    {...fieldAria("bq-last", errors.lastName)}
                  />
                </FormField>
              </div>

              <div className="mf-row">
                <FormField id="bq-phone" label={phoneLabel} error={errors.phone}>
                  <input
                    className="mon-field mf-control"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={phonePlaceholder || undefined}
                    value={values.phone}
                    onInput={set("phone")}
                    disabled={busy}
                    {...fieldAria("bq-phone", errors.phone)}
                  />
                </FormField>
                <FormField id="bq-email" label={emailLabel} error={errors.email}>
                  <input
                    className="mon-field mf-control"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder={emailPlaceholder || undefined}
                    value={values.email}
                    onInput={set("email")}
                    disabled={busy}
                    {...fieldAria("bq-email", errors.email)}
                  />
                </FormField>
              </div>

              {canUpload && (
                <ReferenceUpload
                  id="bq-files"
                  label={filesLabel}
                  hint={filesHint}
                  lead={dropLead}
                  dropHint={dropHint}
                  removeLabel={removeFileLabel}
                  accept={types.join(",")}
                  files={files}
                  onAdd={addFiles}
                  onRemove={removeFile}
                  error={fileMsg}
                  disabled={busy}
                />
              )}

              {materials.length > 0 && (
                <FormField id="bq-material" label={materialLabel} error={errors.material}>
                  <div className="mf-select">
                    <select
                      className={cx("mon-field mf-control", !values.material && "is-placeholder")}
                      value={values.material}
                      onChange={set("material")}
                      disabled={busy}
                      {...fieldAria("bq-material", errors.material)}
                    >
                      <option value="" disabled>
                        {materialPlaceholder}
                      </option>
                      {materials.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <span className="mf-select__caret" aria-hidden="true">⌄</span>
                  </div>
                </FormField>
              )}

              <FormField
                id="bq-note"
                label={noteLabel}
                aside={noteMax ? `${values.note.length} / ${noteMax}` : undefined}
              >
                <textarea
                  id="bq-note"
                  className="mon-field mf-control"
                  rows={4}
                  maxLength={noteMax}
                  placeholder={notePlaceholder || undefined}
                  value={values.note}
                  onInput={set("note")}
                  disabled={busy}
                />
              </FormField>

              {notice && <p className="bq__notice">{notice}</p>}

              {consentText && (
                <ConsentCheck
                  id="bq-consent"
                  checked={consent}
                  onChange={setConsent}
                  text={consentText}
                  link={consentLink}
                  error={errors.consent}
                />
              )}

              {status === "failed" && failMsg && (
                <p className="bq__failure" role="alert">
                  {failMsg}
                </p>
              )}

              <div className="bq__actions">
                {cancelLink?.href && cancelLink.label && (
                  <a className="mon-btn mon-btn--outline mon-btn--lg bq__btn" {...linkAttrs(cancelLink)}>
                    {cancelLink.label}
                  </a>
                )}
                <button type="submit" className="mon-btn mon-btn--gold mon-btn--lg bq__btn" disabled={busy} aria-busy={busy}>
                  {submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default BespokeRequest;
