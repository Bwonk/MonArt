import { useEffect, useRef } from "preact/hooks";
import { useScrollLock } from "../../utils/theme-mode";

export interface DirectionInfoClause {
  title: string;
  text: string;
}

interface Props {
  open: boolean;
  title: string;
  lead: string;
  kicker: string;
  subtitle: string;
  clauses: DirectionInfoClause[];
  closeLabel: string;
  onClose: () => void;
}

/** "Sikkelerde portre yönünün tarihsel mantığı" — Portre Yönü "i" düğmesinin bilgi penceresi (referans v2 `#dirModal`). */
export default function DirectionInfoModal({ open, title, lead, kicker, subtitle, clauses, closeLabel, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    // Açılınca kapatma düğmesine odaklan, kapanınca odağı açan düğmeye geri ver.
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const items = clauses.filter((c) => c.title || c.text);

  return (
    <div className={`dirm${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="dirm__backdrop" onClick={onClose} />
      <div className="dirm__panel" role="dialog" aria-modal="true" aria-labelledby="mon-dirm-title">
        <button ref={closeRef} type="button" className="dirm__x" aria-label={closeLabel} onClick={onClose}>
          ×
        </button>
        <div className="dirm__seal" aria-hidden="true">✦</div>
        <h3 id="mon-dirm-title" className="dirm__title">{title}</h3>
        {lead && <p className="dirm__lead">{lead}</p>}
        <div className="dirm__rule" aria-hidden="true" />
        {kicker && <div className="dirm__kicker">{kicker}</div>}
        {subtitle && <h4 className="dirm__sub">{subtitle}</h4>}
        <div className="dirm__body">
          {items.map((c, i) => (
            <section key={i} className="dirm__clause">
              {c.title && <h5 className="dirm__clause-h">{c.title}</h5>}
              {c.text && <p className="dirm__clause-p">{c.text}</p>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
