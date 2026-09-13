/**
 * Sepet satırı özeti: kişiselleştirilmiş sikke satırının opsiyon değerlerinden
 * referanstaki "Seri · Cinsiyet · Materyal" başlığını ve "Ön: … · Arka: …" meta satırını türetir.
 * Opsiyonlar admin'deki adlarıyla gelir; eşleme OPTION_CONTRACT anahtar kelimeleriyle yapılır.
 */
import type { IkasOrderLineItem, IkasOrderLineItemOption } from "@ikas/bp-storefront";
import { OPTION_CONTRACT as K, findOption, findOptions } from "./ikas-options";
import { Gender, Series, materialFromLabel, normalizeKey } from "./coin";
import type { LineDesign } from "./coin-thumbs";

export interface CartSummaryTexts {
  /** "Ön" */
  frontLabel: string;
  /** "Arka" */
  backLabel: string;
  /** Kaplama işaretliyse başlığa eklenir: "24 Ayar Altın Kaplama" */
  platingLabel: string;
  /** Detay listesinde işaretli CHECKBOX değeri: "Evet" */
  yesText?: string;
  /** Detay listesinde FILE sayısının yanına: "dosya" */
  filesText?: string;
}

export interface CartLineSummary {
  /** Kişiselleştirme opsiyonu olan (sikke) satır mı */
  isCustom: boolean;
  /** Ürün adı (satır üstünde küçük etiket) */
  productName: string;
  /** "Roma · Bay · 14 Ayar Altın · 24 Ayar Altın Kaplama" ya da opsiyonsuz satırda ürün adı */
  title: string;
  /** Yüz başına meta parçaları: ["Ön: IMPERATOR · XIX·VIII·XCVII", "Arka: Osmanlı · AYŞE"] */
  faces: string[];
  /** Opsiyonsuz satırda varyant değerleri ("14 Ayar Altın") */
  variantText: string;
  /** Tüm dolu opsiyonlar, okunur biçimde */
  details: Array<{ label: string; value: string }>;
  /** 1. yüzün görsel anahtarı (sikke küçük resmi için); opsiyonsuz satırda null */
  design: LineDesign | null;
}

const isTrue = (v: string | null | undefined) => (v ?? "").trim().toLowerCase() === "true";

/** Opsiyonun okunur değerleri (CHOICE adı, metin); boşlar atlanır. */
function optionValues(opt: IkasOrderLineItemOption | undefined): string[] {
  if (!opt) return [];
  return (opt.values ?? [])
    .map((v) => (v.name ?? v.value ?? "").trim())
    .filter((v) => v.length > 0);
}

function firstValue(opt: IkasOrderLineItemOption | undefined): string {
  return optionValues(opt)[0] ?? "";
}

function isChecked(opt: IkasOrderLineItemOption | undefined): boolean {
  return !!opt && (opt.values ?? []).some((v) => isTrue(v.value) || isTrue(v.name));
}

function seriesKey(value: string): Series | null {
  const n = normalizeKey(value);
  if (n.includes("roma")) return "roma";
  if (n.includes("osman")) return "osmanli";
  if (n.includes("misir")) return "misir";
  return null;
}

function genderKey(value: string): Gender {
  const n = normalizeKey(value);
  return /bayan|kadin|female/.test(n) ? "F" : "M";
}

/** CHOICE değeri "yok" anlamındaysa false (Büstsüz, Açık Baş …); boşsa varsayılan açık. */
function isOn(value: string, offWords: RegExp): boolean {
  return !value || !offWords.test(normalizeKey(value));
}

function joinParts(parts: string[], sep = " · "): string {
  return parts.filter((p) => p && p.trim().length > 0).join(sep);
}

/** Bir yüzün seri / cinsiyet / isim / tarih değerleri. */
function faceValues(options: IkasOrderLineItemOption[], prefix: string) {
  return {
    series: firstValue(findOption(options, prefix, K.series)),
    gender: firstValue(findOption(options, prefix, K.gender)),
    name: firstValue(findOption(options, prefix, K.name)),
    date: firstValue(findOption(options, prefix, K.date)),
    roman: firstValue(findOption(options, prefix, K.roman)),
  };
}

/** Detay listesindeki tek opsiyonun okunur değeri; boşsa "". */
function detailValue(opt: IkasOrderLineItemOption, texts: CartSummaryTexts): string {
  if (opt.type === "CHECKBOX") return isChecked(opt) ? texts.yesText ?? "" : "";
  if (opt.type === "FILE") {
    const count = (opt.values ?? []).filter((v) => (v.value ?? "").trim()).length;
    return count ? joinParts([String(count), texts.filesText ?? ""], " ") : "";
  }
  return optionValues(opt).join(", ");
}

export function summarizeLine(item: IkasOrderLineItem, texts: CartSummaryTexts): CartLineSummary {
  const options = item.options ?? [];
  const productName = item.variant?.name ?? "";
  const variantText = joinParts(
    (item.variant?.variantValues ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((v) => v.variantValueName ?? ""),
  );

  const details = options
    .map((opt) => ({ label: opt.name, value: detailValue(opt, texts) }))
    .filter((d) => d.value.length > 0);

  const front = faceValues(options, K.face1);
  const isCustom = !!front.series;

  if (!isCustom) {
    return { isCustom, productName, title: productName, faces: [], variantText, details, design: null };
  }

  const plated = findOptions(options, K.plating).some(isChecked);
  const series = seriesKey(front.series);
  const design: LineDesign | null = series
    ? {
        series,
        gender: genderKey(front.gender),
        bust: isOn(firstValue(findOption(options, K.face1, K.bust)), /bustsuz|yok|hayir/),
        sarik: isOn(firstValue(findOption(options, K.face1, K.sarik)), /acik|sariksiz|yok/),
        material: materialFromLabel(variantText),
        plated,
      }
    : null;
  const title = joinParts([front.series, front.gender, variantText, plated ? texts.platingLabel : ""]);

  const faces = [`${texts.frontLabel}: ${joinParts([front.name, front.roman || front.date]) || "—"}`];
  if (isChecked(findOption(options, K.backFace))) {
    const back = faceValues(options, K.face2);
    // Arka yüzün seri/cinsiyeti öndekinden farklıysa onları da yaz; isim/tarih yoksa "—".
    const differs = back.series !== front.series || back.gender !== front.gender;
    const backHead = differs ? [back.series, back.gender] : [];
    faces.push(`${texts.backLabel}: ${joinParts([...backHead, back.name, back.roman || back.date]) || "—"}`);
  }

  return { isCustom, productName, title, faces, variantText, details, design };
}
