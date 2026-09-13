import { useEffect, useRef, useState } from "preact/hooks";
import { getDefaultSrc, createMediaSrcset, IkasImage } from "@ikas/bp-storefront";
import { observer } from "@ikas/component-utils";
import { useScrollLock, cx } from "../../utils/theme-mode";

export interface LightboxItem {
  image: IkasImage;
  alt: string;
  title: string;
  subtitle: string;
  /** Öğeye özel CTA linki ("Bu Modeli Tasarla"); boşsa CTA gizlenir. */
  ctaHref?: string;
}

interface Props {
  items: LightboxItem[];
  /** Açık öğenin sırası; null = kapalı. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  ctaLabel?: string;
  hint?: string;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
  zoomLabel: string;
}

const DOUBLE_TAP_MS = 320;
const SWIPE_PX = 40;

/**
 * Tam ekran görsel görüntüleyici (referans: monart-lux.js openLightbox…lbChooseDesign).
 * ← → / Esc klavye, kaydırma, masaüstünde tık / dokunmatikte çift dokunma ile ×2 zoom.
 */
const Lightbox = observer(function Lightbox(props: Props) {
  const { items, index, onIndexChange, onClose, ctaLabel, hint, prevLabel, nextLabel, closeLabel, zoomLabel } = props;
  const count = items.length;
  const open = index !== null && count > 0;

  const [zoomed, setZoomed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const lastIndex = useRef(0);
  const pointer = useRef({ type: "mouse", x: 0, lastTap: 0 });

  if (index !== null) lastIndex.current = index;
  const current = Math.min(lastIndex.current, Math.max(count - 1, 0));
  const item = items[current] ?? null;

  useScrollLock(open);

  const go = (delta: number) => {
    if (!open || count < 2) return;
    onIndexChange((((current + delta) % count) + count) % count);
  };

  useEffect(() => setZoomed(false), [index]);

  /* Açılış / kapanış: odak kapat butonuna, kapanınca tetikleyen öğeye döner */
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      returnFocus.current?.focus?.();
      returnFocus.current = null;
    };
  }, [open]);

  /* Klavye: Esc, ←, →, Tab odak döngüsü */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button, a[href], [tabindex='0']"));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, current, count, onClose]);

  /* Komşu görselleri önden yükle */
  useEffect(() => {
    if (!open || count < 2) return;
    for (const d of [1, -1]) {
      const it = items[(((current + d) % count) + count) % count];
      if (it) new Image().src = getDefaultSrc(it.image);
    }
  }, [open, current, count]);

  const onPointerDown = (e: PointerEvent) => {
    pointer.current.type = e.pointerType;
    pointer.current.x = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType !== "touch") return;
    const dx = e.clientX - pointer.current.x;
    if (!zoomed && Math.abs(dx) > SWIPE_PX) {
      pointer.current.lastTap = 0;
      go(dx < 0 ? 1 : -1);
      return;
    }
    const now = Date.now();
    if (now - pointer.current.lastTap < DOUBLE_TAP_MS) {
      pointer.current.lastTap = 0;
      setZoomed((z) => !z);
    } else {
      pointer.current.lastTap = now;
    }
  };
  const onStageClick = () => {
    if (pointer.current.type !== "touch") setZoomed((z) => !z);
  };
  const onStageKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setZoomed((z) => !z);
    }
  };

  return (
    <div className={cx("lb", open && "is-open")} aria-hidden={!open}>
      <div ref={panelRef} className="lb__panel" role="dialog" aria-modal="true" aria-label={item?.title || undefined}>
        <button ref={closeRef} type="button" className="lb__close" aria-label={closeLabel} onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        {count > 1 && (
          <button type="button" className="lb__nav lb__nav--prev" aria-label={prevLabel} onClick={() => go(-1)}>
            <span aria-hidden="true">←</span>
          </button>
        )}

        <div
          className={cx("lb__stage", zoomed && "is-zoomed")}
          role="button"
          tabIndex={0}
          aria-label={item ? `${zoomLabel}: ${item.alt}` : zoomLabel}
          aria-pressed={zoomed}
          onClick={onStageClick}
          onKeyDown={onStageKey}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {item && (
            <img
              key={item.image.id}
              className="lb__img"
              src={getDefaultSrc(item.image)}
              srcSet={createMediaSrcset(item.image)}
              sizes="(max-width: 860px) 92vw, 70vw"
              alt={item.alt}
              draggable={false}
            />
          )}
        </div>

        {count > 1 && (
          <button type="button" className="lb__nav lb__nav--next" aria-label={nextLabel} onClick={() => go(1)}>
            <span aria-hidden="true">→</span>
          </button>
        )}

        <div className="lb__meta">
          <div className="lb__name">{item?.title}</div>
          {item?.subtitle && <div className="lb__sub">{item.subtitle}</div>}
          {count > 1 && (
            <div className="lb__counter" aria-live="polite">
              {current + 1} / {count}
            </div>
          )}
          {ctaLabel && item?.ctaHref && (
            <a className="lb__cta" href={item.ctaHref}>
              <span className="lb__cta-ast" aria-hidden="true">✦</span> {ctaLabel}
            </a>
          )}
          {hint && <div className="lb__hint">{hint}</div>}
        </div>
      </div>
    </div>
  );
});

export default Lightbox;
