/**
 * Sikke konfigüratörü — saf yardımcılar (referans: docs/configurator-logic.md).
 * DOM / ikas bağımlılığı yok; canvas motorları CoinCanvas'ta, ikas eşlemesi ikas-options.ts'te.
 */

export type Series = "roma" | "osmanli" | "misir";
export type Gender = "M" | "F";
export type Finish = "gold" | "silver";
export type MaterialKey = "silver" | "14k" | "22k";
export type FaceKey = "front" | "back";
/** Portre yönü: görseller sağa bakar; "left" görseli aynalar (referans v2). */
export type Direction = "right" | "left";
export type ChainLength = "50" | "55" | "60";

export const CHAIN_LENGTHS: ChainLength[] = ["50", "55", "60"];

export const SERIES: Series[] = ["roma", "osmanli", "misir"];
export const MATERIALS: MaterialKey[] = ["silver", "14k", "22k"];

export interface SeriesRule {
  /** İsim karakter limiti */
  limit: number;
  /** Tarih alanı var mı (Roma rakamı) */
  dateOn: boolean;
  /** Büst seçeneği (Roma) */
  bustOpt: boolean;
  /** Sarık seçeneği (Osmanlı) */
  sarikOpt: boolean;
  /** Canvas yazı motoru */
  engine: "arc" | "side" | "none";
}

export const SERIES_RULES: Record<Series, SeriesRule> = {
  roma: { limit: 20, dateOn: true, bustOpt: true, sarikOpt: false, engine: "arc" },
  osmanli: { limit: 20, dateOn: false, bustOpt: false, sarikOpt: true, engine: "side" },
  misir: { limit: 15, dateOn: false, bustOpt: false, sarikOpt: false, engine: "none" },
};

export interface FaceState {
  series: Series;
  gender: Gender;
  direction: Direction;
  /** Roma: büstlü (true) / büstsüz */
  bust: boolean;
  /** Osmanlı: sarıklı (true) / açık baş */
  sarik: boolean;
  nameOn: boolean;
  text: string;
  dateOn: boolean;
  date: string;
  photos: (File | null)[];
  consent: boolean;
}

export function defaultFace(series: Series, gender: Gender): FaceState {
  // Referansın aksine büst/sarık VARSAYILAN AÇIK (kart görseliyle tutarlı).
  return { series, gender, direction: "right", bust: true, sarik: true, nameOn: true, text: "", dateOn: true, date: "", photos: [null, null, null], consent: false };
}

/* ------------------------------------------------------------------ materyal */

export function platingAllowed(m: MaterialKey): boolean {
  return m === "silver" || m === "14k";
}

/** Kaplama açıkken gümüş bile altın görünür (22K look). */
export function effectiveFinish(m: MaterialKey, plated: boolean): Finish {
  if (platingAllowed(m) && plated) return "gold";
  return m === "silver" ? "silver" : "gold";
}

export function is22kLook(m: MaterialKey, plated: boolean): boolean {
  return m === "22k" || (platingAllowed(m) && plated);
}

/** Varyant değeri / seçenek etiketi → materyal anahtarı. */
export function materialFromLabel(label: string | null | undefined): MaterialKey | null {
  const s = normalizeKey(label ?? "");
  if (!s) return null;
  if (/\b22\b|22k|22 ayar/.test(s)) return "22k";
  if (/\b14\b|14k|14 ayar/.test(s)) return "14k";
  if (/925|gumus|silver|argent/.test(s)) return "silver";
  return null;
}

/* ------------------------------------------------------------------ görsel seçimi */

const SERIES_PREFIX: Record<Series, string> = { roma: "roma", osmanli: "osmanli", misir: "misir" };

/**
 * Seçime göre görsel prop anahtarı adayları, öncelik sırasıyla.
 * Ör. Roma · Bay · gümüş · büstsüz → ["romaMSilverNobust", "romaMSilver", "romaMGoldNobust", "romaMGold"]
 */
export function artworkCandidates(series: Series, gender: Gender, finish: Finish, bust: boolean, sarik: boolean): string[] {
  const base = SERIES_PREFIX[series] + gender;
  const fin = finish === "silver" ? "Silver" : "Gold";
  const alt = finish === "silver" ? "Gold" : "Silver";
  const suffix = series === "roma" && !bust ? "Nobust" : series === "osmanli" && !sarik ? "Nosarik" : "";
  const out: string[] = [];
  if (suffix) out.push(base + fin + suffix);
  out.push(base + fin);
  if (suffix) out.push(base + alt + suffix);
  out.push(base + alt);
  return out;
}

/* ------------------------------------------------------------------ metin */

const GLYPH_FALLBACK: Record<string, string> = {
  ş: "s", Ş: "S", ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I", ö: "o", Ö: "O", ü: "u", Ü: "U",
  â: "a", Â: "A", î: "i", Î: "I", û: "u", Û: "U", é: "e", É: "E", è: "e", È: "E", ñ: "n", Ñ: "N",
};

/** Canvas fontlarında bulunmayan aksanlı harfleri Latin karşılığına indirir. */
export function fontSafe(str: string): string {
  return (str || "").replace(/[şŞçÇğĞıİöÖüÜâÂîÎûÛéÉèÈñÑ]/g, (ch) => GLYPH_FALLBACK[ch] || ch);
}

/** Türkçe'ye duyarlı büyük harf (i → İ). */
export function upperTr(str: string): string {
  return (str || "").toLocaleUpperCase("tr-TR");
}

/** Eşleştirme için: küçük harf, aksansız, tek boşluk. */
export function normalizeKey(str: string): string {
  return (str || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[şŞ]/g, "s").replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u").replace(/[âÂ]/g, "a").replace(/[îÎ]/g, "i").replace(/[ûÛ]/g, "u")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function clampText(text: string, series: Series): string {
  return upperTr(text).slice(0, SERIES_RULES[series].limit);
}

/* ------------------------------------------------------------------ tarih */

export function toRoman(n: number): string {
  if (!n || n <= 0) return "";
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let r = "";
  for (const [v, sym] of map) {
    while (n >= v) { r += sym; n -= v; }
  }
  return r;
}

/** "19.08.97" → "XIX·VIII·XCVII"; 0/boş parçalar atlanır. */
export function dateToRoman(str: string): string {
  if (!str) return "";
  return str
    .split(".")
    .map((p) => parseInt(p, 10))
    .filter((p) => !isNaN(p) && p > 0)
    .map(toRoman)
    .join("·");
}

/** Rakam dışını atar, GG.AA.YY biçimine noktalar ekler (kısmi giriş geçerli). */
export function formatDate(raw: string): string {
  const d = (raw || "").replace(/\D/g, "").slice(0, 6);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, 2) + "." + d.slice(2);
  return d.slice(0, 2) + "." + d.slice(2, 4) + "." + d.slice(4, 6);
}

/* ------------------------------------------------------------------ isim önerileri */

export interface NameSuggestion {
  g: Gender;
  title: string;
  desc: string;
  /** Unvan isimden SONRA gelir (VALİDE SULTAN) */
  suffix?: boolean;
  /** Ayırıcı boşluk yok (hiyeroglif) */
  tight?: boolean;
}

export const NAME_SUGGESTIONS: Record<Series, NameSuggestion[]> = {
  roma: [
    { g: "M", title: "IMPERATOR", desc: "Antik sikkelerin arkasındaki efsanevi lejyon gücü, mutlak irade ve ebedi Roma hakimiyeti." },
    { g: "F", title: "AUGUSTA", desc: "Roma'nın kutsal ve en yüksek kadın mertebesi; asaletin, zarafetin ve imparatorluk mührünün sahibi." },
  ],
  osmanli: [
    { g: "M", title: "KAPUDAN", desc: "Mavi vatanın kudreti, Osmanlı donanmasının sarsılmaz deniz gücü ve fethin simgesi." },
    { g: "F", title: "VALİDE SULTAN", suffix: true, desc: "İktidarın, zekanın ve sarayı arkadan yöneten muazzam hanedan gücünün ebedi sembolü." },
  ],
  misir: [
    { g: "M", title: "PHARAOH", tight: true, desc: "Nil'in ve güneşin ebedi temsilcisi; tapınaklara adını kazıyan Tanrı-Kral kudreti." },
    { g: "F", title: "QUEEN", tight: true, desc: "Sikkelere adını ve büstünü kazıtan son kraliçe; büyüleyici zeka, cazibe ve tarihin yönünü değiştiren güç." },
  ],
};

/** Öneri kartı parçaları: öncesi / sonrası / input'a yazılacak değer / caret konumu. */
export function suggestionParts(s: NameSuggestion): { pre: string; post: string; prefill: string; caretAtStart: boolean } {
  const sep = s.tight ? "" : " ";
  return s.suffix
    ? { pre: "", post: sep + s.title, prefill: sep + s.title, caretAtStart: true }
    : { pre: s.title + sep, post: "", prefill: s.title + sep, caretAtStart: false };
}

/* ------------------------------------------------------------------ galeri → konfigüratör URL parametreleri */

/** Koleksiyon galerisinden konfigüratöre taşınan seçim (`?seri=&cinsiyet=&materyal=`). */
export interface DesignParams {
  series?: Series;
  gender?: Gender;
  material?: MaterialKey;
}

export const DESIGN_PARAM_KEYS = ["seri", "cinsiyet", "materyal"] as const;

const GENDER_PARAM: Record<Gender, string> = { M: "bay", F: "bayan" };
const MATERIAL_PARAM: Record<MaterialKey, string> = { silver: "gumus", "14k": "14k", "22k": "22k" };

export function designQuery(p: DesignParams): Record<string, string | undefined> {
  return {
    seri: p.series,
    cinsiyet: p.gender ? GENDER_PARAM[p.gender] : undefined,
    materyal: p.material ? MATERIAL_PARAM[p.material] : undefined,
  };
}

export function parseSeries(value: string | null | undefined): Series | undefined {
  const v = normalizeKey(value ?? "");
  return (SERIES as string[]).includes(v) ? (v as Series) : undefined;
}

export function parseDesignQuery(query: Record<string, string | undefined>): DesignParams {
  const g = normalizeKey(query.cinsiyet ?? "");
  const m = normalizeKey(query.materyal ?? "");
  return {
    series: parseSeries(query.seri),
    gender: g === "bay" ? "M" : g === "bayan" ? "F" : undefined,
    material: (Object.keys(MATERIAL_PARAM) as MaterialKey[]).find((k) => MATERIAL_PARAM[k] === m),
  };
}

/* ------------------------------------------------------------------ fotoğraf doğrulama */

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhoto(file: File): "ok" | "size" | "type" {
  if (!PHOTO_TYPES.includes(file.type)) return "type";
  if (file.size > PHOTO_MAX_BYTES) return "size";
  return "ok";
}
