import type { ComponentChildren } from "preact";
import { observer } from "@ikas/component-utils";
import { cx } from "../../utils/theme-mode";

interface Props {
  /** Kontrolün id'si; etiket `for` ve hata `id`'si bundan türetilir. */
  id: string;
  label?: string;
  /** Etiketin yanındaki soluk ek not, ör. "(varsa)". */
  hint?: string;
  error?: string | null;
  /** Kontrolün altındaki sağa yaslı küçük metin (karakter sayacı vb.). */
  aside?: ComponentChildren;
  className?: string;
  children: ComponentChildren;
}

/** Form alanı çerçevesi: etiket + kontrol + hata. Kontrol `mon-field mf-control` class'ı ile gelir. */
const FormField = observer(function FormField({ id, label, hint, error, aside, className, children }: Props) {
  return (
    <div className={cx("mf-field", !!error && "has-error", className)}>
      {(label || hint) && (
        <label className="mf-label" htmlFor={id}>
          {label}
          {hint && <span className="mf-hint">{hint}</span>}
        </label>
      )}
      {children}
      {(error || aside) && (
        <div className="mf-below">
          {error ? (
            <span className="mf-error" id={`${id}-error`} role="alert">
              {error}
            </span>
          ) : (
            <span />
          )}
          {aside && <span className="mf-aside">{aside}</span>}
        </div>
      )}
    </div>
  );
});

export default FormField;

/** Kontrole verilecek erişilebilirlik öznitelikleri. */
export function fieldAria(id: string, error?: string | null) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}
