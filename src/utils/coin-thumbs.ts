/**
 * Sepet satırı küçük resmi: konfigüratörün sikke görselleri.
 * Görseller CoinConfigurator'ın IMAGE prop'larıdır; Header (drawer) ve CartPage onlara erişemez.
 * Konfigüratör render olduğunda "prop anahtarı → görsel URL" haritasını localStorage'a yazar,
 * sepet satırı tasarımın seri/cinsiyet/görünüm anahtarıyla haritadan okur.
 */
import { Finish, Gender, MaterialKey, Series, artworkCandidates, effectiveFinish } from "./coin";

const STORAGE_KEY = "monart_artwork";

export interface LineDesign {
  series: Series;
  gender: Gender;
  bust: boolean;
  sarik: boolean;
  material: MaterialKey | null;
  plated: boolean;
}

export function saveArtworkMap(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    const next = JSON.stringify(map);
    if (window.localStorage.getItem(STORAGE_KEY) !== next) window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode vb. — küçük resim ürün görseline düşer */
  }
}

function readArtworkMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

/** Tasarıma uyan sikke görseli; harita yoksa ya da eşleşme yoksa null. */
export function thumbForDesign(design: LineDesign): string | null {
  const map = readArtworkMap();
  // Materyal bilinmiyorsa altın görünüm (22K ve kaplamalı gümüş/14K ile aynı).
  const finish: Finish = design.material ? effectiveFinish(design.material, design.plated) : "gold";
  for (const key of artworkCandidates(design.series, design.gender, finish, design.bust, design.sarik)) {
    if (map[key]) return map[key];
  }
  return null;
}
