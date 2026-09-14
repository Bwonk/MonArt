import { useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import FormField, { fieldAria } from "../FormField";
import { EyeIcon, EyeOffIcon } from "../Icons";

interface Props {
  id: string;
  label?: string;
  hint?: string;
  value: string;
  onInput: (value: string) => void;
  error?: string | null;
  autoComplete: "current-password" | "new-password";
  showLabel: string;
  hideLabel: string;
  disabled?: boolean;
}

/** Şifre alanı: FormField + göster/gizle düğmesi. */
const PasswordField = observer(function PasswordField({
  id,
  label,
  hint,
  value,
  onInput,
  error,
  autoComplete,
  showLabel,
  hideLabel,
  disabled,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <div className="pwf">
        <input
          className="mon-field mf-control pwf__input"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          spellcheck={false}
          value={value}
          onInput={(e) => onInput((e.target as HTMLInputElement).value)}
          disabled={disabled}
          {...fieldAria(id, error)}
        />
        <button
          type="button"
          className="pwf__toggle"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon className="pwf__icon" /> : <EyeIcon className="pwf__icon" />}
        </button>
      </div>
    </FormField>
  );
});

export default PasswordField;
