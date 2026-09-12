/**
 * Canvas için font hazırlığı. Fontlar ikas tema tipografi token'ları (Google Fonts)
 * ile yüklenir; token'ın kullanılmadığı sayfalarda tarayıcı fontu indirmemiş olabilir,
 * bu yüzden gerekirse Google Fonts stylesheet'i eklenir ve `document.fonts.load` beklenir.
 */
export function ensureGoogleFont(family: string, weights: number[] = [400]): void {
  if (typeof document === "undefined") return;
  try {
    if (document.fonts?.check?.(`400 30px "${family}"`)) return;
  } catch {
    /* check desteklenmiyorsa link ekle */
  }
  const id = "mon-gf-" + family.toLowerCase().replace(/\s+/g, "-");
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:wght@${weights.join(";")}&display=swap`;
  document.head.appendChild(link);
}

/** Verilen font tanımlarının yüklenmesini bekler; başarısız olanları sessizce geçer. */
export async function waitForFonts(specs: string[]): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  await Promise.all(specs.map((s) => document.fonts.load(s).catch(() => undefined)));
}
