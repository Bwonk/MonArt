import { useEffect, useRef, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { baseStore, setLanguage } from "@ikas/bp-storefront";
import { ChevronIcon } from "../Icons";

interface Props {
  label: string;
}

/** Storefront routing'lerinden dil listesi; tek dil varsa hiç render etmez. */
const LanguageSwitcher = observer(function LanguageSwitcher({ label }: Props) {
  const options = baseStore.languageOptions ?? [];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (options.length < 2) return null;
  const current = options.find((o) => o.isSelected) ?? options[0];

  return (
    <div className="mon-lang" ref={ref}>
      <button
        type="button"
        className="mon-lang__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mon-lang__code">{current.locale.slice(0, 2)}</span>
        <ChevronIcon className="mon-icon mon-lang__chev" />
      </button>
      {open && (
        <ul className="mon-lang__menu" role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={o.isSelected}>
              <button
                type="button"
                className={`mon-lang__item${o.isSelected ? " is-active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  setLanguage(baseStore, o);
                }}
              >
                <span className="mon-lang__item-code">{o.locale.slice(0, 2)}</span>
                <span className="mon-lang__item-name">{o.language}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default LanguageSwitcher;
