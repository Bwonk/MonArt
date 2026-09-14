import { useEffect, useRef } from "preact/hooks";
import { observer } from "@ikas/component-utils";

interface Props {
  title: string;
  text?: string;
  buttonText?: string;
  onReset: () => void;
}

/** Gönderim sonrası teşekkür ekranı. Açılınca görünür alana kayar ve başlığa odaklanır. */
const FormSuccess = observer(function FormSuccess({ title, text, buttonText, onReset }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.closest(".mf-done")?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <div className="mf-done" role="status" aria-live="polite">
      <span className="mf-done__mark" aria-hidden="true">✦</span>
      <h2 className="mf-done__title" ref={headingRef} tabIndex={-1}>
        {title}
      </h2>
      {text && <p className="mf-done__text">{text}</p>}
      {buttonText && (
        <button type="button" className="mon-btn mon-btn--gold mon-btn--lg" onClick={onReset}>
          {buttonText}
        </button>
      )}
    </div>
  );
});

export default FormSuccess;
