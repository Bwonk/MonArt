import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { observer } from "@ikas/component-utils";
import type { Series } from "../../utils/coin";
import { cx, useScrollLock } from "../../utils/theme-mode";
import { ensureGoogleFont } from "../../utils/fonts";

/** Kayıtlı notun kartta gösterilen kısa alıntısı. */
const EXCERPT_LEN = 60;

/** Kaydedilen hediye notu; sepete eklerken opsiyonlara yazılır. */
export interface GiftNoteValue {
  civ: Series;
  text: string;
  uv: boolean;
}

export interface GiftNoteTexts {
  eyebrow: string;
  title: string;
  facesSingle: string;
  facesDouble: string;
  ruleOne: string;
  ruleTwo: string;
  and: string;
  seriesNames: Record<Series, string>;
  subs: Record<Series, string>;
  lockedSub: string;
  uvLabel: string;
  placeholder: string;
  glyphPlaceholder: string;
  suggLabel: string;
  suggestions: Record<Series, Array<{ t: string; s: string }>>;
  inputLabel: string;
  inputPlaceholder: string;
  saveText: string;
  savedText: string;
  savedUvText: string;
  savedToast: string;
  cardText: string;
  openText: string;
  editText: string;
  removeText: string;
  closeLabel: string;
}

interface Props {
  /** Sikkede seçili seriler (1. yüz, açıksa 2. yüz); yalnız bunların parşömeni seçilebilir. */
  allowed: Series[];
  doubleFace: boolean;
  papers: Record<Series, string | null>;
  glyphMask: string | null;
  texts: GiftNoteTexts;
  saved: GiftNoteValue | null;
  /** Sepete eklerken kayıtlı not yoksa kart vurgulanır (hediye notu zorunlu). */
  missing: boolean;
  onSave: (value: GiftNoteValue | null) => void;
  onToast: (msg: string) => void;
}

const ORDER: Series[] = ["roma", "osmanli", "misir"];
const MAX_LEN = 240;
/** Bu sayıdan kısa Mısır notları ikişerli satırlar halinde yukarıdan aşağı dizilir. */
const STACK_MAX = 13;

/** Kağıt görsellerinin oranı ve yazının sığacağı güvenli alan (% iç pay: üst sağ alt sol). */
const PAPER: Record<Series, { ar: string; safe: [number, number, number, number] }> = {
  roma: { ar: "1018 / 1396", safe: [9, 11, 9, 11] },
  osmanli: { ar: "1052 / 1400", safe: [13, 15, 13, 15] },
  misir: { ar: "1059 / 1378", safe: [10, 12, 10, 12] },
};

/* Mısır glif haritası: glif maskesi 6×6 hücreli sprite (hücre oranı 240×130 = 1.846).
   w: glifin görünür genişliği / hücre yüksekliği (glifler doğal oranlarında dizilir). */
const GLYPH_CELL_W = 1.846;
const GLYPH_W: Record<string, number> = {
  0: 0.354, 1: 0.092, 2: 0.285, 3: 0.362, 4: 0.4, 5: 0.454, 6: 0.254, 7: 0.308, 8: 0.292, 9: 0.331,
  A: 0.654, B: 0.546, C: 0.631, D: 0.285, E: 0.508, F: 0.769, G: 0.423, H: 0.462, I: 0.108, J: 0.154,
  K: 0.808, L: 0.877, M: 0.577, N: 0.815, O: 0.569, P: 0.623, Q: 0.808, R: 0.7, S: 0.654, T: 0.808,
  U: 0.562, V: 0.362, W: 0.477, X: 0.354, Y: 0.4, Z: 1.669,
};
const GLYPH_ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TR_FOLD: Record<string, string> = { Ş: "S", Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ü: "U", Â: "A", Î: "I", Û: "U", É: "E", È: "E", Ê: "E", À: "A", Ñ: "N" };

function glyphKey(ch: string): string | null {
  const up = ch.toLocaleUpperCase("tr-TR");
  const base = (TR_FOLD[up] || up).normalize("NFD").replace(/[̀-ͯ]/g, "");
  return base in GLYPH_W ? base : null;
}

/** Tek glif: maske kağıtta `--glyph`, hücre konumu `--bx` / `--by`. */
function Glyph({ k }: { k: string }) {
  const i = GLYPH_ORDER.indexOf(k);
  const m = -((GLYPH_CELL_W - GLYPH_W[k]) / 2) + 0.06;
  return <i className="gn__g" style={{ margin: `0 ${m.toFixed(3)}em`, "--bx": `${(i % 6) * 20}%`, "--by": `${Math.floor(i / 6) * 20}%` }} />;
}

function fill(template: string, value: string): string {
  return template.replace("{seri}", value);
}

export const GiftNote = observer(function GiftNote({ allowed, doubleFace, papers, glyphMask, texts, saved, missing, onSave, onToast }: Props) {
  const [open, setOpen] = useState(false);
  // Pencere taslağı: açılışta kayıttan doldurulur, kaydedilmeden kapanırsa atılır.
  const [civ, setCiv] = useState<Series>(allowed[0] ?? "roma");
  const [text, setText] = useState("");
  const [uv, setUv] = useState(false);
  const safeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(open);

  // Seçili yüzler değişince izin verilmeyen parşömenden ilk izinliye geç.
  const active: Series = allowed.includes(civ) ? civ : allowed[0] ?? "roma";
  useEffect(() => {
    if (active !== civ) setCiv(active);
  }, [active, civ]);
  useEffect(() => {
    if (active !== "misir") setUv(false);
  }, [active]);

  const close = () => setOpen(false);
  const openModal = () => {
    setCiv(saved && allowed.includes(saved.civ) ? saved.civ : allowed[0] ?? "roma");
    setText(saved?.text ?? "");
    setUv(!!saved?.uv);
    // Cinzel ve Cormorant global.css'te yüklü; Osmanlı el yazısı yalnız burada.
    ensureGoogleFont("Pinyon Script");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    // Açılınca kapatma düğmesine odaklan, kapanınca odağı açan düğmeye geri ver.
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const trimmed = text.trim();
  const misir = active === "misir";
  const glyphKeys = misir ? [...trimmed.replace(/\s+/g, "")].map(glyphKey).filter((k): k is string => !!k) : [];
  const stacked = misir && glyphKeys.length > 0 && glyphKeys.length < STACK_MAX;

  let content: ComponentChildren;
  if (stacked) {
    // 1–3 harf tek sütun; 4+ harf ikili satırlar, tek kalan harf alt ortada.
    const rows: string[][] = [];
    if (glyphKeys.length <= 3) glyphKeys.forEach((k) => rows.push([k]));
    else {
      for (let i = 0; i + 1 < glyphKeys.length; i += 2) rows.push([glyphKeys[i], glyphKeys[i + 1]]);
      if (glyphKeys.length % 2) rows.push([glyphKeys[glyphKeys.length - 1]]);
    }
    content = rows.map((r, ri) => (
      <span key={ri} className="gn__row">
        {r.map((k, ki) => <Glyph key={ki} k={k} />)}
      </span>
    ));
  } else if (misir) {
    const words = trimmed ? trimmed.split(/\s+/) : [];
    content = words.length ? (
      words.map((w, wi) => (
        <span key={wi} className="gn__word">
          {[...w].map((ch, ci) => {
            const k = glyphKey(ch);
            return k ? <Glyph key={ci} k={k} /> : null;
          })}
        </span>
      ))
    ) : (
      <span className="gn__ph">{texts.glyphPlaceholder}</span>
    );
  } else {
    content = trimmed ? trimmed.replace(/\s+/g, " ") : <span className="gn__ph">{texts.placeholder}</span>;
  }

  /* Otomatik boyut: kısa not büyük, uzun not küçülerek güvenli alanı doldurur, asla taşmaz. */
  const fit = () => {
    const box = safeRef.current;
    const out = textRef.current;
    if (!open || !box || !out || !box.clientHeight) return;
    const max = misir ? (stacked ? 160 : 110) : 72;
    const fits = (s: number) => {
      out.style.fontSize = s + "px";
      if (out.scrollHeight > box.clientHeight + 0.5) return false;
      if (misir) {
        // Glif hücreleri negatif kenar boşluğuyla taşar; yalnız satır ve glif kutularını ölç.
        const els = out.querySelectorAll(".gn__row, .gn__g");
        let w = 0;
        els.forEach((el) => (w = Math.max(w, el.getBoundingClientRect().width)));
        return w <= box.clientWidth + 0.5;
      }
      return out.scrollWidth <= box.clientWidth + 0.5;
    };
    if (fits(max)) return;
    let lo = 8;
    let hi = max;
    for (let i = 0; i < 12; i++) {
      const m = (lo + hi) / 2;
      if (fits(m)) lo = m;
      else hi = m;
    }
    out.style.fontSize = lo + "px";
  };
  const fitRef = useRef(fit);
  fitRef.current = fit;

  useLayoutEffect(() => {
    fit();
  });
  useEffect(() => {
    const run = () => fitRef.current();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(run) : null;
    if (ro && safeRef.current) ro.observe(safeRef.current);
    window.addEventListener("resize", run);
    // Pinyon Script / Cinzel sonradan inince yeniden ölç.
    document.fonts?.addEventListener?.("loadingdone", run);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", run);
      document.fonts?.removeEventListener?.("loadingdone", run);
    };
  }, []);

  const save = () => {
    if (!trimmed) return;
    onSave({ civ: active, text: trimmed, uv: uv && misir });
    onToast(texts.savedToast);
    close();
  };

  /* Kart: kayıtlı notun parşömeni (izinsiz kaldıysa ilk izinli; sipariş de böyle yazılır) */
  const savedCiv: Series | null = saved ? (allowed.includes(saved.civ) ? saved.civ : allowed[0] ?? null) : null;
  const savedLine = saved && savedCiv ? `${fill(texts.savedText, texts.seriesNames[savedCiv])}${saved.uv && savedCiv === "misir" && texts.savedUvText ? ` ${texts.savedUvText}` : ""}` : "";
  const excerpt = saved ? (saved.text.length > EXCERPT_LEN ? `${saved.text.slice(0, EXCERPT_LEN).trimEnd()}…` : saved.text) : "";

  const names = allowed.map((s) => texts.seriesNames[s]).join(` ${texts.and} `);
  const rule = [doubleFace ? texts.facesDouble : texts.facesSingle, fill(allowed.length > 1 ? texts.ruleTwo : texts.ruleOne, names)].filter(Boolean).join(" · ");
  const paper = papers[active];
  const [t, r, b, l] = PAPER[active].safe;
  const suggestions = texts.suggestions[active].filter((x) => x.t);

  return (
    <div className="gn">
      <div className={cx("gn__card", saved && "is-saved", missing && !saved && "is-missing")}>
        {texts.eyebrow && <div className="gn__eyebrow">{texts.eyebrow}</div>}
        {saved ? (
          <>
            {savedLine && <p className="gn__card-saved">{savedLine}</p>}
            <p className="gn__card-quote">“{excerpt}”</p>
            <div className="gn__card-actions">
              <button type="button" className="mon-btn mon-btn--outline gn__card-btn" onClick={openModal}>{texts.editText}</button>
              <button type="button" className="gn__card-link" onClick={() => onSave(null)}>{texts.removeText}</button>
            </div>
          </>
        ) : (
          <>
            {texts.cardText && <p className="gn__card-text">{texts.cardText}</p>}
            <div className="gn__card-actions">
              <button type="button" className="mon-btn mon-btn--outline gn__card-btn" onClick={openModal}>{texts.openText}</button>
            </div>
          </>
        )}
      </div>

      <div className={cx("gnm", open && "is-open")} aria-hidden={!open}>
        <div className="gnm__backdrop" onClick={close} />
        <div className="gnm__panel" role="dialog" aria-modal="true" aria-labelledby="mon-gn-title">
          <button ref={closeRef} type="button" className="gnm__x" aria-label={texts.closeLabel} onClick={close} tabIndex={open ? 0 : -1}>
            ×
          </button>

          <div className="gnm__stage">
            <div
              className={cx("gn__sheet", `gn__sheet--${active}`, uv && misir && "is-uv")}
              style={{
                aspectRatio: PAPER[active].ar,
                ...(paper ? { "--paper": `url("${paper}")` } : {}),
                ...(glyphMask ? { "--glyph": `url("${glyphMask}")` } : {}),
              }}
            >
              {misir && (
                <button type="button" className="gn__uv" aria-pressed={uv} aria-label={texts.uvLabel} title={texts.uvLabel} onClick={() => setUv((v) => !v)}>
                  <svg className="gn__uv-moon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                  </svg>
                  <svg className="gn__uv-sun" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.4" />
                    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                  </svg>
                </button>
              )}
              <div className="gn__safe" ref={safeRef} style={{ inset: `${t}% ${r}% ${b}% ${l}%` }}>
                <div ref={textRef} className={cx("gn__text", `gn__text--${active}`, stacked && "gn__text--stack")}>
                  {content}
                </div>
              </div>
            </div>
          </div>

          <div className="gnm__form">
            {texts.eyebrow && <div className="gn__eyebrow">{texts.eyebrow}</div>}
            <h3 className="gn__title" id="mon-gn-title">{texts.title}</h3>
            {rule && <p className="gn__rule">{rule}</p>}

            <div className="gn__tabs">
              {ORDER.map((s) => {
                const on = allowed.includes(s);
                return (
                  <button key={s} type="button" className={cx("gn__tab", s === active && "is-active")} aria-pressed={s === active} disabled={!on} onClick={() => setCiv(s)}>
                    <span className="gn__tab-name">{texts.seriesNames[s]}</span>
                    <span className="gn__tab-sub">{on ? texts.subs[s] : texts.lockedSub}</span>
                    {!on && <span className="gn__tab-lock" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {suggestions.length > 0 && (
              <div className="gn__sugg">
                {texts.suggLabel && <div className="gn__label">{texts.suggLabel}</div>}
                {suggestions.map((x, i) => (
                  <button key={i} type="button" className="gn__sugg-item" onClick={() => setText(x.t)}>
                    <span className="gn__sugg-t">{x.t}</span>
                    {x.s && <span className="gn__sugg-s">{x.s}</span>}
                  </button>
                ))}
              </div>
            )}

            <label className="gn__label" htmlFor="mon-gn-input">{texts.inputLabel}</label>
            <textarea
              id="mon-gn-input"
              className="gn__input"
              rows={4}
              maxLength={MAX_LEN}
              placeholder={texts.inputPlaceholder}
              value={text}
              onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
            />
            <div className="gn__count">{text.length} / {MAX_LEN}</div>
            <button type="button" className="mon-btn mon-btn--gold gn__save" disabled={!trimmed} onClick={save}>{texts.saveText}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GiftNote;
