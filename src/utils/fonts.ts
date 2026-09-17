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

const embeddedFonts = new Map<string, Promise<void>>();

/**
 * Koda gömülü (base64) bir fontu `FontFace` ile bir kez yükler ve `document.fonts`'a ekler.
 * ikas'ta özel font dosyası barındırılamadığı için Google Fonts'ta olmayan fontlar böyle yüklenir.
 */
export function ensureEmbeddedFont(family: string, base64: string, descriptors?: FontFaceDescriptors): Promise<void> {
  if (typeof document === "undefined" || typeof FontFace === "undefined") return Promise.resolve();
  let p = embeddedFonts.get(family);
  if (!p) {
    p = (async () => {
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const face = new FontFace(family, bytes.buffer, descriptors);
      await face.load();
      document.fonts.add(face);
    })().catch(() => undefined);
    embeddedFonts.set(family, p);
  }
  return p;
}
