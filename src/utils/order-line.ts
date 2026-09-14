/**
 * Sipariş satırı (hesap sayfaları): sepetteki özet ve küçük resim mantığının salt-okunur kullanımı.
 */
import { getDefaultSrc, getIkasOrderLineVariantMainImage, IkasOrderLineItem } from "@ikas/bp-storefront";
import { summarizeLine, CartLineSummary, CartSummaryTexts } from "./cart-summary";
import { thumbForDesign } from "./coin-thumbs";
import type { AccountTexts } from "./account-texts";

export function summaryTexts(t: AccountTexts): CartSummaryTexts {
  return { frontLabel: t.frontLabel, backLabel: t.backLabel, platingLabel: t.platingLabel, yesText: t.yesText, filesText: "" };
}

export function summarizeOrderLine(item: IkasOrderLineItem, t: AccountTexts): CartLineSummary {
  return summarizeLine(item, summaryTexts(t));
}

/** Önce tasarıma uyan sikke görseli (konfigüratörün localStorage haritası), yoksa varyant görseli. */
export function lineThumb(item: IkasOrderLineItem, summary: CartLineSummary): string | null {
  const fromDesign = summary.design && thumbForDesign(summary.design);
  if (fromDesign) return fromDesign;
  const image = getIkasOrderLineVariantMainImage(item.variant);
  return image ? getDefaultSrc(image) : null;
}
