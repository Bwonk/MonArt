import { useRef, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { cx } from "../../utils/theme-mode";

interface Props {
  id: string;
  label?: string;
  hint?: string;
  lead?: string;
  dropHint?: string;
  removeLabel?: string;
  accept: string;
  files: File[];
  /** Seçilen / bırakılan ham dosyalar; doğrulama section'da yapılır. */
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  error?: string | null;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Sürükle-bırak dosya alanı + seçilen dosyaların listesi. */
const ReferenceUpload = observer(function ReferenceUpload({
  id,
  label,
  hint,
  lead,
  dropHint,
  removeLabel,
  accept,
  files,
  onAdd,
  onRemove,
  error,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrag = (e: DragEvent, active: boolean) => {
    e.preventDefault();
    if (!disabled) setOver(active);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    const list = e.dataTransfer?.files;
    if (list?.length) onAdd(Array.from(list));
  };
  const onPick = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) onAdd(Array.from(input.files));
    input.value = "";
  };

  return (
    <div className={cx("mf-field", "ru", !!error && "has-error")}>
      {(label || hint) && (
        <label className="mf-label" htmlFor={id}>
          {label}
          {hint && <span className="mf-hint">{hint}</span>}
        </label>
      )}
      <div
        className={cx("mon-dropzone ru__drop", over && "is-over", files.length > 0 && "is-filled", disabled && "is-disabled")}
        onDragEnter={(e) => onDrag(e, true)}
        onDragOver={(e) => onDrag(e, true)}
        onDragLeave={(e) => onDrag(e, false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="ru__input"
          accept={accept}
          multiple
          disabled={disabled}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={onPick}
          onClick={(e) => e.stopPropagation()}
        />
        <span className="ru__icon" aria-hidden="true">⌖</span>
        {lead && <span className="ru__lead">{lead}</span>}
        {dropHint && <span className="ru__hint">{dropHint}</span>}
      </div>
      {files.length > 0 && (
        <ul className="ru__files">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="ru__file">
              <span className="ru__name">{f.name}</span>
              <span className="ru__size">{formatSize(f.size)}</span>
              <button
                type="button"
                className="ru__remove"
                aria-label={removeLabel ? `${removeLabel}: ${f.name}` : f.name}
                disabled={disabled}
                onClick={() => onRemove(i)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span className="mf-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default ReferenceUpload;
