/**
 * ikas Product Option Set eşlemesi.
 * Opsiyonlar admin'de ADIYLA tanımlanır; kod opsiyonu adındaki anahtar kelimelerle bulur
 * (ör. "Yüz 1 · Seri"), CHOICE değerlerini de anahtar kelimeyle seçer ("Roma", "Bay", "Büstsüz"…).
 */
import {
  IkasProduct,
  IkasProductOption,
  IkasProductOptionSelectValue,
  isChoiceOption,
  isCheckboxOption,
  isTextOption,
  isTextAreaOption,
  isFileOption,
  selectValue,
  isProductOptionSelectValueSelected,
  setTextValue,
  setCheckboxValue,
} from "@ikas/bp-storefront";
import { normalizeKey } from "./coin";

/** Opsiyon setindeki tüm opsiyonlar (çocuklar dahil, düzleştirilmiş). */
export function allOptions(product: IkasProduct | null | undefined): IkasProductOption[] {
  const set = product?.productOptionSet;
  if (!set?.options) return [];
  const out: IkasProductOption[] = [];
  const seen = new Set<string>();
  const walk = (opts: IkasProductOption[]) => {
    for (const o of opts) {
      if (!o || seen.has(o.id)) continue;
      seen.add(o.id);
      out.push(o);
      if (o.childOptions?.length) walk(o.childOptions);
    }
  };
  walk(set.options);
  return out;
}

/** Adı verilen tüm anahtar kelimeleri içeren ilk opsiyon. */
export function findOption(options: IkasProductOption[], ...keywords: Array<string | undefined>): IkasProductOption | undefined {
  const keys = keywords.map((k) => normalizeKey(k ?? "")).filter(Boolean);
  if (!keys.length) return undefined;
  return options.find((o) => {
    const n = normalizeKey(o.name);
    return keys.every((k) => n.includes(k));
  });
}

/** Adı verilen tüm anahtar kelimeleri içeren tüm opsiyonlar. */
export function findOptions(options: IkasProductOption[], ...keywords: Array<string | undefined>): IkasProductOption[] {
  const keys = keywords.map((k) => normalizeKey(k ?? "")).filter(Boolean);
  if (!keys.length) return [];
  return options.filter((o) => {
    const n = normalizeKey(o.name);
    return keys.every((k) => n.includes(k));
  });
}

/** CHOICE opsiyonunda, değeri anahtar kelimelerden biriyle eşleşen seçeneği tek seçili yapar. */
export function setChoiceByKeywords(option: IkasProductOption | undefined, keywords: string[], exclude: string[] = []): void {
  if (!option || !isChoiceOption(option)) return;
  const values: IkasProductOptionSelectValue[] = option.selectSettings?.values ?? [];
  const keys = keywords.map(normalizeKey);
  const ex = exclude.map(normalizeKey);
  const target = values.find((v) => {
    const n = normalizeKey(v.value);
    if (ex.some((e) => e && n.includes(e))) return false;
    return keys.some((k) => k && n.includes(k));
  });
  for (const v of values) {
    const selected = isProductOptionSelectValueSelected(option, v);
    if (v === target && !selected) selectValue(option, v);
    else if (v !== target && selected) selectValue(option, v);
  }
}

export function setCheckbox(option: IkasProductOption | undefined, on: boolean): void {
  if (option && isCheckboxOption(option)) setCheckboxValue(option, on);
}

export function setText(option: IkasProductOption | undefined, text: string): void {
  if (option && (isTextOption(option) || isTextAreaOption(option))) setTextValue(option, text || undefined);
}

export function isFile(option: IkasProductOption | undefined): boolean {
  return !!option && isFileOption(option);
}

/** Opsiyonun geçerli para birimindeki ek ücreti (AMOUNT) veya oranı (RATIO → base*oran/100). */
export function optionExtraPrice(option: IkasProductOption | undefined, currencyCode: string, base: number): number {
  if (!option) return 0;
  let price = option.price ?? 0;
  let priceType = option.priceType;
  const other = option.otherPrices?.find((p) => p.currencyCode === currencyCode);
  if (other) {
    price = other.price;
    priceType = other.priceType ?? priceType;
  }
  if (!price) return 0;
  return priceType === "RATIO" ? (base * price) / 100 : price;
}
