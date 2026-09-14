import type { ComponentChildren } from "preact";
import { useEffect, useId, useRef } from "preact/hooks";
import { useScrollLock, cx } from "../../utils/theme-mode";
import { CloseIcon } from "../Icons";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Kapat düğmesinin erişilebilir adı. */
  closeLabel: string;
  children: ComponentChildren;
  /** Panelin altındaki buton satırı. */
  footer?: ComponentChildren;
  /** Geniş panel (adres formu). */
  wide?: boolean;
  /** Gönderim sürerken Esc / zemin tıklaması / kapat düğmesi kapatmasın. */
  busy?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Hesap sayfalarının modalı: zemin + panel, Esc, odak tuzağı, kaydırma kilidi, kapanınca odağı geri verir. */
export default function Dialog({ open, title, onClose, closeLabel, children, footer, wide, busy }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Klavye dinleyicisi yalnız açılışta kurulur; güncel değerleri ref'ten okur.
  const latest = useRef({ busy, onClose });
  latest.current = { busy, onClose };
  const requestClose = () => {
    if (!latest.current.busy) latest.current.onClose();
  };
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Gövdedeki ilk form alanına ya da düğmeye, yoksa panele odaklan.
    const first = panel?.querySelector<HTMLElement>(".dlg__body input, .dlg__body select, .dlg__body textarea, .dlg__body button");
    (first ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === firstItem || document.activeElement === panel)) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="dlg">
      <div className="dlg__backdrop mon-backdrop" onClick={requestClose} />
      <div
        ref={panelRef}
        className={cx("dlg__panel", wide && "dlg__panel--wide")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="dlg__head">
          <h2 id={titleId} className="dlg__title">
            {title}
          </h2>
          <button type="button" className="dlg__close" aria-label={closeLabel} onClick={requestClose} disabled={busy}>
            <CloseIcon className="dlg__close-icon" />
          </button>
        </header>
        <div className="dlg__body">{children}</div>
        {footer && <footer className="dlg__foot">{footer}</footer>}
      </div>
    </div>
  );
}
