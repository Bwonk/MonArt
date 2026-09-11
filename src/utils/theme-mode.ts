/**
 * Gece / gündüz modu — component'ler arası paylaşılan küçük durum.
 * Kaynak: localStorage "monart_theme" ("day" | "night"), varsayılan "day".
 * Her section root'una `mon-night` class'ı ekleyerek global.css token'larını çevirir.
 */
import { useEffect, useState } from "preact/hooks";

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
