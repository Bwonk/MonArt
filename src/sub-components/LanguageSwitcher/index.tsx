import { useEffect, useRef, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { baseStore, setLanguage, IkasStorefrontConfig, IkasLanguageOption } from "@ikas/bp-storefront";
import { ChevronIcon } from "../Icons";

interface Props {
  label: string;
}

function languageName(locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(locale) || locale;
  } catch {
    return locale;
  }
}

/**
 * SDK `languageOptions`'ı yalnız ziyaretçinin ülkesini `countryCodes`'unda taşıyan
 * routing'lerden kurar; ülke kodu olmayan routing'lerde liste boş kalır.
 * Bu durumda doğrudan routing listesinden okunur. `setLanguage` routing'i `id` ile bulur.
 */
function routingOptions(): IkasLanguageOption[] {
  const currentId = IkasStorefrontConfig.getCurrentRouting()?.id;
  return (IkasStorefrontConfig.routings ?? []).map((r) => ({
    id: r.id,
    locale: r.locale,
    language: languageName(r.locale),
    currencyCode: r.currencyCode ?? null,
    currencySymbol: r.currencySymbol ?? null,
    isSelected: r.id === currentId,
  }));
}

/**
 * Referans "TR ⌄" açılır menüsü. Tek dil varken de görünür; routing eklenince
 * liste kendiliğinden dolar. Renkler parent'ın `--lang-*` değişkenlerinden gelir.
 */
const LanguageSwitcher = observer(function LanguageSwitcher({ label }: Props) {
  const sdkOptions = baseStore.languageOptions ?? [];
  const options = sdkOptions.length > 0 ? sdkOptions : routingOptions();
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

  if (options.length === 0) return null;
  const current = options.find((o) => o.isSelected) ?? options[0];
  const code = (locale: string) => locale.slice(0, 2).toUpperCase();

  return (
    <div className={`mon-lang${open ? " is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="mon-lang__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.language}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mon-lang__code">{code(current.locale)}</span>
        <ChevronIcon className="mon-lang__chev" />
      </button>
      <ul className="mon-lang__menu" role="listbox" aria-label={label} aria-hidden={!open}>
        {options.map((o) => (
          <li key={o.id} role="option" aria-selected={o.isSelected}>
            <button
              type="button"
              className={`mon-lang__item${o.isSelected ? " is-active" : ""}`}
              title={o.language}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                setOpen(false);
                if (!o.isSelected) setLanguage(baseStore, o);
              }}
            >
              {code(o.locale)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default LanguageSwitcher;
