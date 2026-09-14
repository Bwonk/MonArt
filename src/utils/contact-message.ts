/**
 * İletişim ve Özel Tasarım formlarının ortak yardımcıları (spec: docs/forms.md).
 *
 * ikas iletişim formu yalnız ad, soyad, e-posta, telefon ve mesaj gönderir; konu, sipariş no,
 * materyal ve görsel linkleri mesaj metnine başlık satırı olarak yazılır.
 */
import {
  customerStore,
  getContactForm,
  initContactForm,
  setContactFormFirstName,
  setContactFormLastName,
  setContactFormEmail,
  setContactFormPhone,
  setContactFormMessage,
  submitContactForm,
} from "@ikas/bp-storefront";

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Değerleri ikas'ın paylaşılan form nesnesine yazıp gönderir. Alan durumu section'da tutulur;
 * ikas nesnesine yalnız burada dokunulur, böylece iki form birbirini etkilemez.
 */
export async function sendContactMessage(payload: ContactPayload): Promise<boolean> {
  const form = getContactForm(customerStore);
  initContactForm(form);
  setContactFormFirstName(form, payload.firstName);
  setContactFormLastName(form, payload.lastName);
  setContactFormEmail(form, payload.email);
  setContactFormPhone(form, payload.phone);
  setContactFormMessage(form, payload.message);
  try {
    return await submitContactForm(form);
  } catch (err) {
    console.error("[contact-message] submit", err);
    return false;
  }
}

/** "A | B | C" → ["A", "B", "C"] (boşlar atılır). */
export function splitOptions(value: string | undefined | null): string[] {
  return (value ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Alan etiketini mesaj başlığında kullanılacak hale getirir: "Mesajınız *" → "Mesajınız". */
export function plainLabel(label: string | undefined | null): string {
  return (label ?? "").replace(/\s*\*+\s*$/, "").trim();
}

/** "{name}" gibi yer tutucuları doldurur. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? values[key] : m));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** En az 7 rakam (uluslararası numaralar için gevşek kural). */
export function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 7;
}

export const MESSAGE_DIVIDER = "────────";

/**
 * Panelde okunacak mesaj metni.
 *   [Etiket] Konu: … · Sipariş No: …
 *   ────────
 *   gövde blokları (boş bloklar atılır, aralarına boş satır konur)
 */
export function buildMessage(tag: string, headerParts: Array<[string, string]>, blocks: string[]): string {
  const parts = headerParts
    .filter(([, value]) => value.trim())
    .map(([label, value]) => (label ? `${label}: ${value.trim()}` : value.trim()));
  const head = [tag ? `[${tag}]` : "", parts.join(" · ")].filter(Boolean).join(" ");
  const body = blocks.map((b) => b.trim()).filter(Boolean);
  return [head, ...(body.length ? [MESSAGE_DIVIDER, body.join("\n\n")] : [])].filter(Boolean).join("\n");
}
