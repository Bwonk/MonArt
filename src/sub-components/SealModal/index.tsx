import { useEffect } from "preact/hooks";
import { useScrollLock } from "../../utils/theme-mode";

interface Props {
  open: boolean;
  title: string;
  /** RICH_TEXT (HTML) */
  html: string;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** "Mühürlenmeden önce son kontrol" — mermer dokulu onay modalı. */
export default function SealModal({ open, title, html, cancelText, confirmText, onCancel, onConfirm }: Props) {
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
    <div className={`seal${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="seal__backdrop mon-backdrop" onClick={onCancel} />
      <div className="seal__panel mon-panel" role="dialog" aria-modal="true" aria-labelledby="mon-seal-title">
        <div className="seal__marble" aria-hidden="true" />
        <div className="seal__inner">
          <span className="seal__mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor">
              <circle cx="32" cy="32" r="28" strokeWidth="0.8" opacity="0.4" />
              <circle cx="32" cy="32" r="22" strokeWidth="0.6" opacity="0.6" />
              <path d="M22 32 L30 40 L44 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h3 id="mon-seal-title" className="seal__title">{title}</h3>
          <div className="seal__text" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="seal__actions">
            <button type="button" className="mon-btn mon-btn--outline seal__cancel" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className="mon-btn mon-btn--gold seal__confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
