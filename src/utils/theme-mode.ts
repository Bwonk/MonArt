/**
 * Gece / gündüz modu ve section tema bağlama.
 *
 * - Ziyaretçi modu: localStorage "monart_theme" ("day" | "night"), varsayılan "day".
 * - `useSectionTheme()` her section root'una uygulanacak className + style döndürür:
 *     · global.css token'larını (--gold, --text …) editor'daki color-scheme SLOT
 *       değişkenlerine bağlar → editor'da renk değiştirmek canlı yansır;
 *     · gece modunda Night palette className'i + `mon-night` ekler.
 *   Slot bulunamazsa her token referans değerine (fallback) düşer.
 */
import { useEffect, useState } from "preact/hooks";
import { SLOT, PALETTE, slotVar, paletteClass } from "../theme-tokens";

export type ThemeMode = "day" | "night";

const STORAGE_KEY = "monart_theme";
const EVENT_NAME = "monart:theme-mode";

export function readThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "day";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

export function setThemeMode(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* private mode vb. — sessizce geç */
  }
  window.dispatchEvent(new CustomEvent<ThemeMode>(EVENT_NAME, { detail: mode }));
}

export function toggleThemeMode(): ThemeMode {
  const next: ThemeMode = readThemeMode() === "night" ? "day" : "night";
  setThemeMode(next);
  return next;
}

/** SSR'da "day" ile başlar, mount sonrası gerçek moda geçer ve değişiklikleri dinler. */
export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>("day");
  useEffect(() => {
    setMode(readThemeMode());
    const onChange = (e: Event) => setMode((e as CustomEvent<ThemeMode>).detail ?? readThemeMode());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMode(readThemeMode());
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return mode;
}

/** [global.css token, slot id, gündüz fallback, gece fallback] */
const TOKEN_SLOTS: ReadonlyArray<readonly [string, string, string, string]> = [
  ["--bg-page", SLOT.background, "#FFFFFF", "#000000"],
  ["--dark", SLOT.surface, "#EFE8D8", "#070710"],
  ["--dark-2", SLOT.surfaceDeep, "#E7DDC8", "#0B0B14"],
  ["--black", SLOT.ivory, "#F6F1E7", "#04040C"],
  ["--text", SLOT.text, "#3E2E08", "#D4B96A"],
  ["--text-dim", SLOT.textDim, "#5E480F", "#6B5A2A"],
  ["--text-muted", SLOT.textMuted, "#7A5F22", "#3A3020"],
  ["--ink", SLOT.ink, "#231D10", "#E8E0CC"],
  ["--gold", SLOT.accent, "#7A5A12", "#C9A84C"],
  ["--gold-light", SLOT.accentLight, "#5A4310", "#F0D060"],
  ["--gold-dim", SLOT.accentDim, "#856312", "#8B6914"],
  ["--gold-deep", SLOT.accentDeep, "#3A2A06", "#5A4310"],
  ["--line", SLOT.line, "rgba(120,90,20,0.26)", "rgba(201,168,76,0.12)"],
  ["--success", SLOT.success, "#3F7A3F", "#8FBF8F"],
  ["--error", SLOT.error, "#B03434", "#B03434"],
];

export interface SectionTheme {
  isNight: boolean;
  /** Section root'una eklenecek class'lar ("mon-night _<nightPalette>" veya ""). */
  className: string;
  /** Section root'una eklenecek CSS değişkenleri. */
  style: Record<string, string>;
}

export function useSectionTheme(): SectionTheme {
  const mode = useThemeMode();
  const isNight = mode === "night";
  const style: Record<string, string> = {};
  for (const [token, slot, day, night] of TOKEN_SLOTS) {
    const v = slotVar(slot, isNight ? night : day);
    if (v) style[token] = v;
  }
  // Başlık rengi: gündüz koyu mürekkep, gece açık altın.
  style["--heading"] = isNight ? slotVar(SLOT.accentLight, "#F0D060") : slotVar(SLOT.ink, "#231D10");
  const className = isNight ? ["mon-night", paletteClass(PALETTE.night, "Night")].filter(Boolean).join(" ") : "";
  return { isNight, className, style };
}

/** Modal / drawer açıkken sayfa kaydırmasını kilitler. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/** Basit className birleştirici. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
