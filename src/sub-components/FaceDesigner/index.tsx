import { useEffect, useRef, useState } from "preact/hooks";
import type { Props as SectionProps } from "../../components/CoinConfigurator/types";
import {
  FaceState,
  FaceKey,
  Series,
  Gender,
  SERIES,
  SERIES_RULES,
  NAME_SUGGESTIONS,
  suggestionParts,
  clampText,
  formatDate,
  dateToRoman,
  validatePhoto,
} from "../../utils/coin";
import { cx } from "../../utils/theme-mode";

export type FaceTexts = Pick<
  SectionProps,
  | "themeLabel" | "seriesRoma" | "seriesOsmanli" | "seriesMisir" | "genderLabel" | "genderMale" | "genderFemale"
  | "bustTitle" | "bustDesc" | "sarikTitle" | "sarikDesc" | "glyphNoticeTitle" | "glyphNoticeText" | "glyphGuideLabel" | "glyphGuideSub"
  | "nameLabel" | "dateLabel" | "dateSub" | "suggestionsHint" | "suggestionsMale" | "suggestionsFemale" | "suggestionSlot" | "suggestionNoteMisir"
  | "photoLabel" | "photoSub" | "photoSlotLabel" | "uploadSub" | "samePhotoText" | "consentText" | "consentInfoTitle" | "consentInfoBody"
  | "cancelInfoTitle" | "cancelInfoBody"
>;

interface Props {
  face: FaceKey;
  state: FaceState;
  onChange: (patch: Partial<FaceState>) => void;
  /** Seri kartı küçük görselleri (altın, bay) */
  thumbs: Record<Series, string | null>;
  glyphGuideSrc: string | null;
  texts: FaceTexts;
  /** Bu yüz aktifken (kullanıcı alanlara dokununca) tetiklenir */
  onActivate: () => void;
  /** Fotoğraf seçilmeden önce rehber; resolve(true) → dosya seçimine devam */
  requestPhotoGuide: () => Promise<boolean>;
  onToast: (msg: string) => void;
  photoTooLargeToast: string;
  photoTypeToast: string;
  /** 2. yüz için: 1. yüzün fotoğraflarını kopyala */
  samePhoto?: { on: boolean; onToggle: (on: boolean) => void };
  consentMissing: boolean;
  disabled?: boolean;
}

function seriesName(t: FaceTexts, s: Series): string {
  return s === "roma" ? t.seriesRoma ?? "Roma" : s === "osmanli" ? t.seriesOsmanli ?? "Osmanlı" : t.seriesMisir ?? "Mısır";
}

export default function FaceDesigner(props: Props) {
  const { face, state, onChange, thumbs, glyphGuideSrc, texts: t, onActivate, requestPhotoGuide, onToast, photoTooLargeToast, photoTypeToast, samePhoto, consentMissing, disabled } = props;
  const rule = SERIES_RULES[state.series];
  const textRef = useRef<HTMLInputElement>(null);
  const fileRefs = useRef<Array<HTMLInputElement | null>>([null, null, null]);
  const [suggOpen, setSuggOpen] = useState(true);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);

  // Fotoğraf önizlemeleri: object URL üret, değişince eskisini serbest bırak.
  useEffect(() => {
    const urls = state.photos.map((f) => (f ? URL.createObjectURL(f) : null));
    setPreviews(urls);
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [state.photos]);

  const setSeries = (series: Series) => {
    const limit = SERIES_RULES[series].limit;
    const patch: Partial<FaceState> = { series, text: state.text.slice(0, limit) };
    if (!SERIES_RULES[series].dateOn) patch.date = "";
    onChange(patch);
    onActivate();
  };

  const applySuggestion = (prefill: string, caretAtStart: boolean) => {
    const v = clampText(prefill, state.series);
    onChange({ text: v, nameOn: true });
    onActivate();
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (!el) return;
      el.focus();
      const caret = caretAtStart ? 0 : v.length;
      try {
        el.setSelectionRange(caret, caret);
      } catch {
        /* ignore */
      }
    });
  };

  const pickPhoto = async (slot: number) => {
    if (disabled) return;
    const ok = await requestPhotoGuide();
    if (!ok) return;
    fileRefs.current[slot]?.click();
  };

  const onFile = (slot: number, e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const v = validatePhoto(file);
    if (v !== "ok") {
      onToast(v === "size" ? photoTooLargeToast : photoTypeToast);
      input.value = "";
      return;
    }
    const photos = state.photos.slice();
    photos[slot] = file;
    onChange({ photos });
    onActivate();
  };

  const removePhoto = (slot: number) => {
    const photos = state.photos.slice();
    photos[slot] = null;
    onChange({ photos });
    const input = fileRefs.current[slot];
    if (input) input.value = "";
  };

  const suggestions = NAME_SUGGESTIONS[state.series];
  const placeholder = suggestions.find((s) => s.g === state.gender)?.title ?? "";
  const roman = dateToRoman(state.date);
  const photosLocked = !!samePhoto?.on;

  return (
    <div className={cx("fd", disabled && "is-disabled")} onFocusCapture={onActivate}>
      {/* Seri */}
      <div className="fd__field">
        <div className="fd__label">{t.themeLabel}</div>
        <div className="fd__series">
          {SERIES.map((s) => (
            <button key={s} type="button" className={cx("fd__series-card", state.series === s && "is-active")} onClick={() => setSeries(s)} aria-pressed={state.series === s}>
              <span className="fd__series-thumb" style={thumbs[s] ? { backgroundImage: `url("${thumbs[s]}")` } : undefined} />
              <span className="fd__series-name">{seriesName(t, s)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cinsiyet */}
      <div className="fd__field">
        <div className="fd__label">{t.genderLabel}</div>
        <div className="fd__gender" role="group" aria-label={t.genderLabel}>
          {(["M", "F"] as Gender[]).map((g) => (
            <button key={g} type="button" className={cx("fd__gender-btn", state.gender === g && "is-active")} aria-pressed={state.gender === g} onClick={() => { onChange({ gender: g }); onActivate(); }}>
              {g === "M" ? t.genderMale : t.genderFemale}
            </button>
          ))}
        </div>
      </div>

      {/* Sarık / Büst */}
      {rule.sarikOpt && (
        <label className={cx("fd__opt", state.sarik && "is-active")}>
          <input type="checkbox" checked={state.sarik} onChange={(e) => { onChange({ sarik: (e.target as HTMLInputElement).checked }); onActivate(); }} />
          <span className="fd__opt-box" aria-hidden="true" />
          <span className="fd__opt-body">
            <span className="fd__opt-name">{t.sarikTitle}</span>
            <span className="fd__opt-desc">{t.sarikDesc}</span>
          </span>
        </label>
      )}
      {rule.bustOpt && (
        <label className={cx("fd__opt", state.bust && "is-active")}>
          <input type="checkbox" checked={state.bust} onChange={(e) => { onChange({ bust: (e.target as HTMLInputElement).checked }); onActivate(); }} />
          <span className="fd__opt-box" aria-hidden="true" />
          <span className="fd__opt-body">
            <span className="fd__opt-name">{t.bustTitle}</span>
            <span className="fd__opt-desc">{t.bustDesc}</span>
          </span>
        </label>
      )}

      {/* Mısır: hiyeroglif uyarısı + rehber */}
      {state.series === "misir" && (
        <>
          <div className="fd__glyph-notice">
            <span className="fd__glyph-mark" aria-hidden="true">☥</span>
            <div>
              <strong className="fd__glyph-head">{t.glyphNoticeTitle}</strong>
              <p>{t.glyphNoticeText}</p>
            </div>
          </div>
          {glyphGuideSrc && (
            <div className="fd__field">
              <div className="fd__label">
                <span>{t.glyphGuideLabel}</span>
                <span className="fd__sub">{t.glyphGuideSub}</span>
              </div>
              <img className="fd__glyph-img" src={glyphGuideSrc} alt={t.glyphGuideLabel} loading="lazy" />
            </div>
          )}
        </>
      )}

      {/* İsim */}
      <div className={cx("fd__field", !state.nameOn && "is-off")}>
        <div className="fd__label">
          <label className="fd__optin">
            <input type="checkbox" checked={state.nameOn} onChange={(e) => { const on = (e.target as HTMLInputElement).checked; onChange(on ? { nameOn: true } : { nameOn: false, text: "" }); if (on) requestAnimationFrame(() => textRef.current?.focus()); }} />
            <span>{t.nameLabel}</span>
          </label>
          <span className={cx("fd__count", state.text.length >= rule.limit && "is-max")}>{state.text.length} / {rule.limit}</span>
        </div>
        <input
          ref={textRef}
          type="text"
          className="mon-input fd__text"
          value={state.text}
          maxLength={rule.limit}
          placeholder={placeholder}
          readOnly={!state.nameOn}
          onPointerDown={() => { if (!state.nameOn) onChange({ nameOn: true }); }}
          onInput={(e) => { onChange({ text: clampText((e.target as HTMLInputElement).value, state.series) }); onActivate(); }}
        />
        <div className="fd__sugg">
          <button type="button" className={cx("fd__sugg-hint", suggOpen && "is-open")} aria-expanded={suggOpen} onClick={() => setSuggOpen((v) => !v)}>
            <span className="fd__sugg-icon" aria-hidden="true">!</span>
            <span>{t.suggestionsHint}</span>
            <span className="fd__sugg-chev" aria-hidden="true">⌄</span>
          </button>
          {suggOpen && (
            <div className="fd__sugg-body mon-anim-reveal">
              {(["M", "F"] as Gender[]).map((g) => (
                <div key={g} className="fd__sugg-group">
                  <div className="fd__sugg-title">{g === "M" ? t.suggestionsMale : t.suggestionsFemale}</div>
                  {suggestions.filter((s) => s.g === g).map((s) => {
                    const p = suggestionParts(s);
                    return (
                      <button key={s.title} type="button" className="fd__sugg-item" disabled={!state.nameOn} onClick={() => applySuggestion(p.prefill, p.caretAtStart)}>
                        <span className="fd__sugg-name">
                          {p.pre}
                          <span className="fd__sugg-slot">{t.suggestionSlot}</span>
                          {p.post}
                        </span>
                        <span className="fd__sugg-desc">{s.desc}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              {state.series === "misir" && t.suggestionNoteMisir && <p className="fd__sugg-note">{t.suggestionNoteMisir}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Tarih (yalnız dateOn seride) */}
      {rule.dateOn && (
        <div className={cx("fd__field", !state.dateOn && "is-off")}>
          <div className="fd__label">
            <label className="fd__optin">
              <input type="checkbox" checked={state.dateOn} onChange={(e) => { const on = (e.target as HTMLInputElement).checked; onChange(on ? { dateOn: true } : { dateOn: false, date: "" }); }} />
              <span>{t.dateLabel}</span>
            </label>
            <span className="fd__sub">{t.dateSub}</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            className="mon-input fd__text"
            value={state.date}
            placeholder="01.01.01"
            readOnly={!state.dateOn}
            onPointerDown={() => { if (!state.dateOn) onChange({ dateOn: true }); }}
            onInput={(e) => { onChange({ date: formatDate((e.target as HTMLInputElement).value) }); onActivate(); }}
          />
          <div className="mon-roman fd__roman">{roman || "—"}</div>
        </div>
      )}

      {/* Fotoğraflar */}
      <div className="fd__field">
        <div className="fd__label">
          <span>{t.photoLabel}</span>
          <span className="fd__sub">{t.photoSub}</span>
        </div>
        {samePhoto && (
          <label className="fd__consent fd__consent--same">
            <input type="checkbox" checked={samePhoto.on} onChange={(e) => samePhoto.onToggle((e.target as HTMLInputElement).checked)} />
            <span className="fd__consent-box" aria-hidden="true" />
            <span className="fd__consent-text">{t.samePhotoText}</span>
          </label>
        )}
        <div className={cx("fd__uploads", photosLocked && "is-locked")}>
          {[0, 1, 2].map((slot) => {
            const file = state.photos[slot];
            return (
              <div key={slot} className={cx("mon-dropzone fd__upload", file && "is-filled")}>
                <input ref={(el) => { fileRefs.current[slot] = el; }} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(slot, e)} />
                <button type="button" className="fd__upload-btn" onClick={() => void pickPhoto(slot)} disabled={photosLocked || disabled}>
                  <span className="fd__upload-icon" aria-hidden="true">↑</span>
                  <span className="fd__upload-text">
                    <strong>{file ? file.name : `${t.photoSlotLabel} ${slot + 1}`}</strong>
                    <span>{t.uploadSub}</span>
                  </span>
                  {previews[slot] && <span className="fd__upload-preview" style={{ backgroundImage: `url("${previews[slot]}")` }} />}
                </button>
                {file && !photosLocked && (
                  <button type="button" className="fd__upload-remove" aria-label="×" onClick={() => removePhoto(slot)}>×</button>
                )}
              </div>
            );
          })}
        </div>
        <label className={cx("fd__consent", consentMissing && "is-missing", photosLocked && "is-locked")}>
          <input type="checkbox" checked={state.consent} disabled={photosLocked} onChange={(e) => onChange({ consent: (e.target as HTMLInputElement).checked })} />
          <span className="fd__consent-box" aria-hidden="true" />
          <span className="fd__consent-text">{t.consentText}</span>
        </label>
        {t.consentInfoBody && (
          <details className="fd__info">
            <summary className="fd__info-toggle">{t.consentInfoTitle}</summary>
            <div className="fd__info-body" dangerouslySetInnerHTML={{ __html: t.consentInfoBody }} />
          </details>
        )}
        {t.cancelInfoBody && (
          <details className="fd__info">
            <summary className="fd__info-toggle">{t.cancelInfoTitle}</summary>
            <div className="fd__info-body" dangerouslySetInnerHTML={{ __html: t.cancelInfoBody }} />
          </details>
        )}
      </div>
    </div>
  );
}
