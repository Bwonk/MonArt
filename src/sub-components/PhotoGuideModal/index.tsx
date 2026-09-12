import { useEffect } from "preact/hooks";
import { useScrollLock } from "../../utils/theme-mode";
import { CloseIcon } from "../Icons";

interface Props {
  open: boolean;
  title: string;
  intro: string;
  imageSrc: string | null;
  imageAlt: string;
  caption: string;
  /** RICH_TEXT (HTML): h4/p blokları */
  bodyHtml: string;
  cancelText: string;
  confirmText: string;
  closeLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Portre çekim açıları rehberi — fotoğraf seçmeden önce açılır. */
export default function PhotoGuideModal({ open, title, intro, imageSrc, imageAlt, caption, bodyHtml, cancelText, confirmText, closeLabel, onCancel, onConfirm }: Props) {
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <div className={`pguide${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="pguide__backdrop mon-backdrop" onClick={onCancel} />
      <div className="pguide__panel mon-panel mon-scrollbar" role="dialog" aria-modal="true" aria-labelledby="mon-pguide-title">
        <button type="button" className="mon-btn mon-btn--icon mon-btn--close pguide__close" aria-label={closeLabel} onClick={onCancel}>
          <CloseIcon className="mon-icon" />
        </button>
        <header className="pguide__head">
          <h3 id="mon-pguide-title" className="pguide__title mon-gold-text">{title}</h3>
          {intro && <p className="pguide__intro">{intro}</p>}
        </header>
        {imageSrc && (
          <figure className="pguide__figure">
            <img src={imageSrc} alt={imageAlt} loading="lazy" />
            {caption && <figcaption>{caption}</figcaption>}
          </figure>
        )}
        <div className="pguide__body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        <div className="pguide__actions">
          <button type="button" className="mon-btn mon-btn--outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="mon-btn mon-btn--gold" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
