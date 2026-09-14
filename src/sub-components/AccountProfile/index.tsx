import { useEffect, useRef, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  customerStore,
  getOrders,
  getFavoriteProductsIds,
  getAccountInfoForm,
  initAccountInfoForm,
  setAccountInfoFormFirstName,
  setAccountInfoFormLastName,
  setAccountInfoFormPhone,
  setAccountInfoFormIsMarketingAccepted,
  submitAccountInfoForm,
  exportCustomerPersonalData,
  IkasOrder,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { fill } from "../../utils/account-texts";
import { pageLink, fieldError, focusFirstInvalid } from "../../utils/auth";
import { sortOrders } from "../../utils/order-status";
import FormField, { fieldAria } from "../FormField";
import ConsentCheck from "../ConsentCheck";
import OrderCard from "../OrderCard";
import AccountDeleteDialog from "../AccountDeleteDialog";

interface Props {
  t: AccountTexts;
  /** Kapalıyken favori sayacı gösterilmez ve sorgulanmaz. */
  showFavorites?: boolean;
}

type Status = "idle" | "ok" | "fail";

/** Kişisel Bilgilerim: karşılama + özet, son sipariş, bilgi formu, şifre, veriler ve hesap silme. */
const AccountProfile = observer(function AccountProfile({ t, showFavorites = true }: Props) {
  const customer = customerStore.customer;
  const form = getAccountInfoForm(customerStore);
  const formRef = useRef<HTMLFormElement>(null);
  const [orders, setOrders] = useState<IkasOrder[] | null>(null);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<Status>("idle");
  const [exportStatus, setExportStatus] = useState<Status | "busy">("idle");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    initAccountInfoForm(form);
    getOrders(customerStore)
      .then((list) => alive && setOrders(sortOrders(list ?? [])))
      .catch(() => alive && setOrders(null));
    if (showFavorites)
      getFavoriteProductsIds(customerStore)
        .then((list) => alive && setFavCount((list ?? []).length))
        .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!customer) return null;

  const ready = !!form.isInitialized;
  const sending = form.isSubmitting;
  const edit = (fn: () => void) => {
    fn();
    setSaveStatus("idle");
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (sending || !ready) return;
    const ok = await submitAccountInfoForm(form);
    if (ok) setSaveStatus("ok");
    else if (form.isFailure) setSaveStatus("fail");
    else focusFirstInvalid(formRef.current);
  };

  const onExport = async () => {
    if (exportStatus === "busy") return;
    setExportStatus("busy");
    const res = await exportCustomerPersonalData(customerStore);
    setExportStatus(res?.isSuccess ? "ok" : "fail");
  };

  const firstErr = fieldError(form.firstName, t.requiredError, t.invalidError);
  const lastErr = fieldError(form.lastName, t.requiredError, t.invalidError);
  const phoneErr = fieldError(form.phone, t.requiredError, t.phoneError);
  const stat = (n: number | null | undefined) => (n == null ? "—" : String(n));
  const latest = orders?.[0];

  return (
    <div className="prof">
      <section className="acc-card prof__hello">
        <div className="prof__who">
          <h2 className="prof__greet">{fill(t.greetingText, { name: customer.firstName || "" }).replace(/,\s*$/, "")}</h2>
          {customer.email && <p className="prof__email">{customer.email}</p>}
          {t.profileIntro && <p className="prof__intro">{t.profileIntro}</p>}
        </div>
        <ul className="prof__stats">
          <li>
            <a className="prof__stat" {...pageLink("ORDERS")}>
              <span className="prof__stat-num">{stat(orders ? orders.length : customer.orderCount)}</span>
              <span className="prof__stat-label">{t.statOrders}</span>
            </a>
          </li>
          <li>
            <a className="prof__stat" {...pageLink("ADDRESSES")}>
              <span className="prof__stat-num">{stat(customer.addresses?.length ?? 0)}</span>
              <span className="prof__stat-label">{t.statAddresses}</span>
            </a>
          </li>
          {showFavorites && (
            <li>
              <a className="prof__stat" {...pageLink("FAVORITE_PRODUCTS")}>
                <span className="prof__stat-num">{stat(favCount)}</span>
                <span className="prof__stat-label">{t.statFavorites}</span>
              </a>
            </li>
          )}
        </ul>
      </section>

      <section className="acc-card">
        <div className="acc-card__head">
          {t.lastOrderTitle && <h3 className="acc-card__title">{t.lastOrderTitle}</h3>}
          {latest && t.allOrdersText && (
            <a className="acc-link" {...pageLink("ORDERS")}>
              {t.allOrdersText}
            </a>
          )}
        </div>
        {orders === null ? (
          <div className="acc-skel acc-skel--card" aria-hidden="true" />
        ) : latest ? (
          <OrderCard order={latest} t={t} />
        ) : (
          <p className="acc-muted">{t.noOrdersText}</p>
        )}
      </section>

      <form ref={formRef} className="acc-card acc-form" onSubmit={onSubmit} noValidate aria-busy={!ready}>
        {t.infoTitle && <h3 className="acc-card__title">{t.infoTitle}</h3>}
        <div className="mf-row">
          <FormField id="acc-first-name" label={t.firstNameLabel} error={firstErr}>
            <input
              className="mon-field mf-control"
              type="text"
              autoComplete="given-name"
              value={form.firstName?.value ?? ""}
              onInput={(e) => edit(() => setAccountInfoFormFirstName(form, (e.target as HTMLInputElement).value))}
              disabled={!ready || sending}
              {...fieldAria("acc-first-name", firstErr)}
            />
          </FormField>
          <FormField id="acc-last-name" label={t.lastNameLabel} error={lastErr}>
            <input
              className="mon-field mf-control"
              type="text"
              autoComplete="family-name"
              value={form.lastName?.value ?? ""}
              onInput={(e) => edit(() => setAccountInfoFormLastName(form, (e.target as HTMLInputElement).value))}
              disabled={!ready || sending}
              {...fieldAria("acc-last-name", lastErr)}
            />
          </FormField>
        </div>
        <div className="mf-row">
          <FormField id="acc-email" label={t.emailLabel} hint={t.emailLockText}>
            <input
              id="acc-email"
              className="mon-field mf-control"
              type="email"
              value={customer.email ?? ""}
              readOnly
              aria-readonly="true"
            />
          </FormField>
          <FormField id="acc-phone" label={t.phoneLabel} hint={t.phoneHint} error={phoneErr}>
            <input
              className="mon-field mf-control"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder={t.phonePlaceholder || undefined}
              value={form.phone?.value ?? ""}
              onInput={(e) => edit(() => setAccountInfoFormPhone(form, (e.target as HTMLInputElement).value))}
              disabled={!ready || sending}
              {...fieldAria("acc-phone", phoneErr)}
            />
          </FormField>
        </div>
        {t.marketingText && (
          <ConsentCheck
            id="acc-marketing"
            checked={!!form.isMarketingAccepted?.value}
            onChange={(v) => edit(() => setAccountInfoFormIsMarketingAccepted(form, v))}
            text={t.marketingText}
          />
        )}
        {saveStatus === "ok" && t.saveSuccessText && (
          <p className="acc-banner acc-banner--ok" role="status">
            {t.saveSuccessText}
          </p>
        )}
        {saveStatus === "fail" && t.saveErrorText && (
          <p className="acc-banner" role="alert">
            {t.saveErrorText}
          </p>
        )}
        <div className="acc-actions">
          <button type="submit" className="mon-btn mon-btn--gold" disabled={!ready || sending}>
            {sending ? t.savingText : t.saveText}
          </button>
        </div>
      </form>

      <div className="prof__minor">
        <section className="acc-card acc-card--quiet">
          {t.passwordTitle && <h3 className="acc-card__title">{t.passwordTitle}</h3>}
          {t.passwordText && <p className="acc-muted">{t.passwordText}</p>}
          <a className="acc-link" {...pageLink("FORGOT_PASSWORD")}>
            {t.passwordLinkText}
          </a>
        </section>

        <section className="acc-card acc-card--quiet">
          {t.privacyTitle && <h3 className="acc-card__title">{t.privacyTitle}</h3>}
          {exportStatus === "ok" && t.exportSuccessText && (
            <p className="acc-banner acc-banner--ok" role="status">
              {t.exportSuccessText}
            </p>
          )}
          {exportStatus === "fail" && t.exportErrorText && (
            <p className="acc-banner" role="alert">
              {t.exportErrorText}
            </p>
          )}
          <div className="prof__privacy">
            {t.exportText && (
              <button type="button" className="acc-link" onClick={onExport} disabled={exportStatus === "busy"}>
                {exportStatus === "busy" ? t.exportingText : t.exportText}
              </button>
            )}
            {t.deleteLinkText && (
              <button type="button" className="acc-link acc-link--danger" onClick={() => setDeleteOpen(true)}>
                {t.deleteLinkText}
              </button>
            )}
          </div>
        </section>
      </div>

      <AccountDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} t={t} />
    </div>
  );
});

export default AccountProfile;
