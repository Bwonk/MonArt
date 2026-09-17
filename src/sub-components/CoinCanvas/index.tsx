import { useEffect, useRef } from "preact/hooks";
import { Direction, Finish, Series, SERIES_RULES, fontSafe, upperTr } from "../../utils/coin";
import { ensureEmbeddedFont, ensureGoogleFont, waitForFonts } from "../../utils/fonts";
import { ALPHA_KUFI_TTF_BASE64 } from "../../utils/alpha-kufi-font";

/**
 * Sikke önizleme canvas'ı — referans `drawCoin()` pipeline'ının Preact portu.
 * 560×560 mantıksal boyut, dairesel clip, materyale göre filtre, seriye göre yazı motoru.
 */
export interface CoinCanvasProps {
  /** Sikke PNG'sinin URL'i (CDN) */
  src: string | null;
  series: Series;
  /** Mürekkep rengi için efektif materyal görünümü */
  finish: Finish;
  /** 22K görünümü (saturate/brightness filtresi) */
  look22k: boolean;
  /** Portre yönü: "left" görseli aynalar, Osmanlı'da ismi sol yaya taşır */
  direction: Direction;
  text: string;
  roman: string;
  /** Yüz çevirme animasyonu (scaleX 0) */
  flipping?: boolean;
  ariaLabel: string;
  className?: string;
}

const SIZE = 560;
const CX = SIZE / 2;
const R = SIZE * 0.46;
/** Osmanlı yazısı: referanstaki AlphaKufi (lisanslı, koda gömülü). */
const SCRIPT_FONT = "AlphaKufi";
const SERIF_FONT = "Cinzel";

const imgCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imgCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("coin image failed: " + src));
    img.src = src;
    imgCache.set(src, img);
  });
}

function inkStops(finish: Finish): [string, string, string] {
  return finish === "silver" ? ["#FFFFFF", "#DCE0E8", "#7E848F"] : ["#FFF0B8", "#EBCB72", "#9A7218"];
}
function inkShadow(finish: Finish, a: number): string {
  return finish === "silver" ? `rgba(18,20,26,${a})` : `rgba(40,26,4,${a})`;
}
function inkGradient(ctx: CanvasRenderingContext2D, finish: Finish, x0: number, y0: number, x1: number, y1: number) {
  const s = inkStops(finish);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, s[0]);
  g.addColorStop(0.5, s[1]);
  g.addColorStop(1, s[2]);
  return g;
}

/** Roma — üst yay (harfler eşit açısal pay). */
function drawArcText(ctx: CanvasRenderingContext2D, finish: Finish, raw: string, radius: number) {
  const text = fontSafe(upperTr(raw));
  const n = text.length;
  if (!n) return;
  const maxArc = Math.PI * 0.82;
  const pitch = (radius * maxArc) / n;
  const fontSize = Math.round(Math.max(15, Math.min(30, pitch * 0.92)));
  const usedPitch = Math.min(pitch, fontSize / 0.92);
  const spread = Math.min(maxArc, (usedPitch * n) / radius);
  ctx.save();
  ctx.font = `700 ${fontSize}px "${SERIF_FONT}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const grad = inkGradient(ctx, finish, CX, CX - radius - fontSize, CX, CX - radius + fontSize);
  let cursor = -Math.PI / 2 - spread / 2;
  const aw = spread / n;
  for (let i = 0; i < n; i++) {
    const ang = cursor + aw / 2;
    ctx.save();
    ctx.translate(CX + Math.cos(ang) * radius, CX + Math.sin(ang) * radius);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillStyle = inkShadow(finish, 0.92);
    ctx.fillText(text[i], 1.1, 1.1);
    ctx.fillStyle = grad;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
    cursor += aw;
  }
  ctx.restore();
}

/** Roma — alt yay (Roma rakamı tarih). */
function drawBottomArcText(ctx: CanvasRenderingContext2D, finish: Finish, raw: string, radius: number) {
  const text = fontSafe(raw);
  const n = text.length;
  if (!n) return;
  const maxArc = Math.PI * 0.7;
  const pitch = (radius * maxArc) / n;
  const fontSize = Math.round(Math.max(13, Math.min(24, pitch * 0.9)));
  const usedPitch = Math.min(pitch, fontSize / 0.9);
  const spread = Math.min(maxArc, (usedPitch * n) / radius);
  ctx.save();
  ctx.font = `600 ${fontSize}px "${SERIF_FONT}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const grad = inkGradient(ctx, finish, CX, CX + radius - fontSize, CX, CX + radius + fontSize);
  let cursor = Math.PI / 2 + spread / 2;
  const aw = spread / n;
  for (let i = 0; i < n; i++) {
    const ang = cursor - aw / 2;
    ctx.save();
    ctx.translate(CX + Math.cos(ang) * radius, CX + Math.sin(ang) * radius);
    ctx.rotate(ang - Math.PI / 2);
    ctx.fillStyle = inkShadow(finish, 0.7);
    ctx.fillText(text[i], 0.7, 0.7);
    ctx.fillStyle = grad;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
    cursor -= aw;
  }
  ctx.restore();
}

/**
 * Osmanlı — yan yay, Kufi yazı, alttan yukarı sarar (harf genişliğine orantılı).
 * İsim portrenin önündeki yaya yazılır: sağa bakınca sağ yay, sola bakınca sol yay.
 * Harf tepesi iki yayda da merkeze döner; sol yayda metnin SONU alta sabitlenir (sağ yayın aynası).
 */
function drawSideText(ctx: CanvasRenderingContext2D, finish: Finish, raw: string, radius: number, side: "right" | "left") {
  const text = fontSafe((raw || "").toLocaleLowerCase("tr-TR")).slice(0, 22);
  const n = text.length;
  if (!n) return;
  const maxSpread = 1.95;
  const spacing = 1.0;
  let fontSize = 30;
  const measure = (fs: number) => {
    ctx.font = `400 ${fs}px "${SCRIPT_FONT}", "${SERIF_FONT}", serif`;
    const widths = Array.from(text).map((ch) => ctx.measureText(ch).width + spacing);
    return { widths, total: widths.reduce((a, b) => a + b, 0) };
  };
  ctx.save();
  let { widths, total } = measure(fontSize);
  let spread = total / radius;
  if (spread > maxSpread) {
    fontSize = Math.max(15, fontSize * (maxSpread / spread));
    ({ widths, total } = measure(fontSize));
    spread = Math.min(maxSpread, total / radius);
  }
  ctx.font = `400 ${fontSize}px "${SCRIPT_FONT}", "${SERIF_FONT}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const grad = inkGradient(ctx, finish, CX - radius, CX, CX + radius, CX);
  const step = -1;
  const rotOffset = -Math.PI / 2;
  // sağ: alt-sağdan (~saat 4:30) yukarı sarar · sol: alt-soldan (~saat 7:30) yayın boyu kadar yukarıdan başlar
  let cursor = side === "right" ? 0.95 : Math.PI - 0.95 + spread;
  for (let i = 0; i < n; i++) {
    const aw = (widths[i] / total) * spread;
    const ang = cursor + (step * aw) / 2;
    ctx.save();
    ctx.translate(CX + Math.cos(ang) * radius, CX + Math.sin(ang) * radius);
    ctx.rotate(ang + rotOffset);
    ctx.fillStyle = inkShadow(finish, 0.75);
    ctx.fillText(text[i], 0.8, 0.8);
    ctx.fillStyle = grad;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
    cursor += step * aw;
  }
  ctx.restore();
}

function drawFallback(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX - R * 0.2, CX - R * 0.2, 0, CX, CX, R);
  g.addColorStop(0, "#FFE08A");
  g.addColorStop(0.6, "#C9A84C");
  g.addColorStop(1, "#5A4310");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

export default function CoinCanvas({ src, series, finish, look22k, direction, text, roman, flipping, ariaLabel, className }: CoinCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fontsReady = useRef(false);

  useEffect(() => {
    ensureGoogleFont(SERIF_FONT, [600, 700]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = (img: HTMLImageElement | null) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CX, R, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img) {
        ctx.filter = look22k ? "saturate(1.30) brightness(0.94)" : "none";
        // Sola bakan profilde yalnız kabartma aynalanır; yazılar sonra çizildiği için ters dönmez.
        if (direction === "left") {
          ctx.translate(SIZE, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, CX - R, CX - R, R * 2, R * 2);
        ctx.filter = "none";
      } else {
        drawFallback(ctx);
      }
      ctx.restore();

      const rule = SERIES_RULES[series];
      if (rule.engine === "arc") {
        const inscR = R * 0.76;
        drawArcText(ctx, finish, text, inscR);
        if (rule.dateOn && roman) drawBottomArcText(ctx, finish, roman, inscR);
      } else if (rule.engine === "side") {
        drawSideText(ctx, finish, text, R * 0.6, direction === "left" ? "left" : "right");
      }
    };

    const run = async () => {
      if (!fontsReady.current) {
        await ensureEmbeddedFont(SCRIPT_FONT, ALPHA_KUFI_TTF_BASE64, { weight: "400", style: "normal" });
        await waitForFonts([`700 30px "${SERIF_FONT}"`, `600 20px "${SERIF_FONT}"`, `400 30px "${SCRIPT_FONT}"`]);
        fontsReady.current = true;
      }
      let img: HTMLImageElement | null = null;
      if (src) {
        try {
          img = await loadImage(src);
        } catch {
          img = null;
        }
      }
      draw(img);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [src, series, finish, look22k, direction, text, roman]);

  return (
    <canvas
      ref={ref}
      width={SIZE}
      height={SIZE}
      className={["coin-canvas", flipping ? "is-flipping" : "", className ?? ""].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      role="img"
    />
  );
}
