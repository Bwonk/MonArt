import { observer } from "@ikas/component-utils";
import type { IkasNavigationLink } from "@ikas/bp-storefront";
import { cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";

interface Props {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Onay metni; `{link}` yer tutucusu `link` etiketiyle bağlantıya dönüşür. */
  text: string;
  link?: IkasNavigationLink | null;
  /** Gönderim denendi ve kutu işaretsiz: kırmızı vurgu + hata metni. */
  error?: string | null;
}

/** KVKK onay kutusu (özel kutu, gerçek checkbox erişilebilir kalır). */
const ConsentCheck = observer(function ConsentCheck({ id, checked, onChange, text, link, error }: Props) {
  const [before, after] = text.includes("{link}") ? text.split("{link}", 2) : [text, ""];
  const hasLink = text.includes("{link}") && !!link?.label;

  return (
    <div className={cx("mf-consent", !!error && "is-missing")}>
      <label className="mf-consent__row" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
        />
        <span className="mf-consent__box" aria-hidden="true" />
        <span className="mf-consent__text">
          {before}
          {hasLink &&
            (link?.href ? (
              <a className="mf-consent__link" {...linkAttrs(link)} onClick={(e) => e.stopPropagation()}>
                {link.label}
              </a>
            ) : (
              link?.label
            ))}
          {after}
        </span>
      </label>
      {error && (
        <span className="mf-consent__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default ConsentCheck;
