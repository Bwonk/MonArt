/**
 * MonArt — ikas tema color-scheme SLOT id'leri ve palette id'leri.
 *
 * Slot id'leri scheme ile birlikte mağazalar arası değişmeden taşınır (portable).
 * DİKKAT: bir slot'un CSS değişken adı id'den türetilir ama birebir aynı DEĞİLDİR
 * (ör. "c2VZN4yOzn" → "--c2Vzn4YOzn"). Bu yüzden CSS değişkenini asla elle
 * `var(--${id})` diye kurmayın; `slotVar()` ile runtime'dan okuyun.
 *
 * Şemalar: Day (varsayılan, fildişi) · Night (koyu, altın).
 */
import { getThemeColorSchemes } from "@ikas/bp-storefront";

export const SLOT = {
  background: "c2VZN4yOzn",        // Day #FFFFFF · Night #000000
  surface: "SLAizphPly",           // Day #EFE8D8 · Night #070710
  surfaceDeep: "FY6BgDboYM",       // Day #E7DDC8 · Night #0B0B14
  ivory: "xKBWQyf2md",             // Day #F6F1E7 · Night #04040C
  text: "EKqX6LI1HM",              // Day #3E2E08 · Night #D4B96A
  textDim: "G1U5lJRXgh",           // Day #5E480F · Night #6B5A2A
  textMuted: "t5lerIXl1n",         // Day #7A5F22 · Night #3A3020
  ink: "QhvyEDdrtM",               // Day #231D10 · Night #E8E0CC
  accent: "5OeNayObgR",            // Day #7A5A12 · Night #C9A84C
  accentLight: "Qkj0K4T85u",       // Day #5A4310 · Night #F0D060
  accentDim: "JZBunMhyIy",         // Day #856312 · Night #8B6914
  accentDeep: "Omt7wP9HM7",        // Day #3A2A06 · Night #5A4310
  line: "yHxuz3RhNQ",              // Day rgba(120,90,20,.26) · Night rgba(201,168,76,.12)
  primaryButtonBackground: "qmxuKmtFbT", // #C9A84C (her iki şema)
  primaryButtonText: "rhMpf1GtXc",       // #0C0A04
  success: "pEFi7HBDRM",           // Day #3F7A3F · Night #8FBF8F
  error: "utzj7XNdnS",             // #B03434
} as const;

export type SlotKey = keyof typeof SLOT;

/** Palette (color scheme değeri) id'leri — scheme ile birlikte taşınır. */
export const PALETTE = {
  day: "WhIKBfy0wc",
  night: "eMAHxjlNKs",
} as const;

type RuntimePalette = {
  id: string;
  name?: string;
  isDefault?: boolean;
  className?: string;
  colorsByScheme: Record<string, { resolved?: string; cssVar?: string } | undefined>;
};

function palettes(): RuntimePalette[] {
  try {
    const s = getThemeColorSchemes() as unknown as { values?: RuntimePalette[] };
    return s?.values ?? [];
  } catch {
    return [];
  }
}

/**
 * Slot'un canlı CSS değişkeni ("var(--Xyz)"). Değişken adı tüm palette'lerde aynıdır;
 * değer, bir ÜST elemandaki palette className'ine göre çözülür.
 * `fallback` verilirse "var(--Xyz, <fallback>)" döner. Slot yoksa fallback (veya "").
 */
export function slotVar(slotId: string, fallback?: string): string {
  for (const p of palettes()) {
    const cssVar = p.colorsByScheme?.[slotId]?.cssVar;
    if (cssVar) {
      return fallback ? cssVar.replace(/\)\s*$/, `, ${fallback})`) : cssVar;
    }
  }
  return fallback ?? "";
}

/** Palette className'i (ör. "_eMAHxjlNKs"); bulunamazsa "". */
export function paletteClass(paletteId: string, nameHint?: string): string {
  const list = palettes();
  const p = list.find((x) => x.id === paletteId) ?? (nameHint ? list.find((x) => x.name === nameHint) : undefined);
  return p?.className ?? "";
}
