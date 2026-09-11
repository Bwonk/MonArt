/**
 * MonArt — ikas tema color-scheme SLOT id'leri.
 *
 * Slot id'leri scheme ile birlikte mağazalar arası değişmeden taşınır (portable),
 * bu yüzden burada sabit tutulabilir. Renk / tipografi / keyframe TOKEN id'leri
 * ise portable DEĞİLDİR — onları `getThemeColors()` / `getThemeTypography()` /
 * `getThemeKeyframes()` listeleri üzerinden veya prop'lar aracılığıyla okuyun.
 *
 * Kullanım (section'ın seçili scheme'ini miras alır — wrapper class ekleme):
 *   import { getThemeColorSchemes } from "@ikas/bp-storefront";
 *   import { SLOT, slotVar } from "../../theme-tokens";
 *   const bg = slotVar(SLOT.background);   // "var(--c2Vzn4YOzn)"
 *
 * Şemalar: Day (varsayılan, fildişi) · Night (koyu, altın).
 */
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

/**
 * Bir slot'un canlı CSS değişkenini döndürür. Şema class'ı bir ÜST elemanda
 * (section wrapper) olduğu için değer, section'ın seçili şemasına göre çözülür.
 */
export function slotVar(slotId: string): string {
  return `var(--${slotId})`;
}
