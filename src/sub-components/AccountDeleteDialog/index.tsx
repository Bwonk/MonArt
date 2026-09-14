import { useEffect, useRef, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { customerStore, deactivateCustomer, logout, Router } from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import Dialog from "../Dialog";
import PasswordField from "../PasswordField";

interface Props {
  open: boolean;
  onClose: () => void;
  t: AccountTexts;
}

type Result = "idle" | "done" | "pending" | "failed";

/**
 * Hesap silme: şifre onayı → `deactivateCustomer`. Form yardımcısı yerine doğrudan çağrılır;
 * "zaten bekleyen talep" hatasını ayırt etmek için API hata kodu gerekiyor (formda yalnız çeviri kalıyor).
 * Başarıda mesaj kısa süre görünür, sonra çıkış + ana sayfa.
 */
const AccountDeleteDialog = observer(function AccountDeleteDialog({ open, onClose, t }: Props) {
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setTried(false);
      setResult("idle");
    }
  }, [open]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const missing = tried && !password;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (sending || result === "done") return;
    setTried(true);
    if (!password) return;
    setSending(true);
    setResult("idle");
    const res = await deactivateCustomer(customerStore, password);
    if (res?.isSuccess) {
      setResult("done");
      timer.current = setTimeout(async () => {
        await logout(customerStore);
        Router.navigateToPage("INDEX");
      }, 1800);
      return;
    }
    setSending(false);
    const error = (res?.errors ?? []).join(" ");
    setResult(error.includes("already_exists") ? "pending" : "failed");
  };

  const banner =
    result === "done" ? t.deleteSuccessText : result === "pending" ? t.deletePendingText : result === "failed" ? t.deleteErrorText : "";

  return (
    <Dialog
      open={open}
      title={t.deleteTitle}
      closeLabel={t.closeLabel}
      onClose={onClose}
      busy={sending}
      footer={
        <>
          <button type="button" className="mon-btn mon-btn--outline" onClick={onClose} disabled={sending}>
            {t.cancelText}
          </button>
          <button type="submit" form="acc-delete-form" className="mon-btn mon-btn--outline acc-btn-danger" disabled={sending}>
            {sending ? t.deletingText : t.deleteConfirmText}
          </button>
        </>
      }
    >
      <form id="acc-delete-form" className="acc-form" onSubmit={submit} noValidate>
        {t.deleteWarningText && <p className="acc-warning">{t.deleteWarningText}</p>}
        {banner && (
          <p className={`acc-banner${result === "done" ? " acc-banner--ok" : ""}`} role={result === "done" ? "status" : "alert"}>
            {banner}
          </p>
        )}
        <PasswordField
          id="acc-delete-password"
          label={t.deletePasswordLabel}
          value={password}
          onInput={(v) => {
            setPassword(v);
            if (result !== "done") setResult("idle");
          }}
          error={missing ? t.requiredError : null}
          autoComplete="current-password"
          showLabel={t.showPasswordLabel}
          hideLabel={t.hidePasswordLabel}
          disabled={sending}
        />
      </form>
    </Dialog>
  );
});

export default AccountDeleteDialog;
