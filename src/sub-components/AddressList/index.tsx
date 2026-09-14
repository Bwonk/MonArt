import { useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { customerStore, deleteCustomerAddress, getCustomerAddressText, IkasCustomerAddress } from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { fill } from "../../utils/account-texts";
import Dialog from "../Dialog";
import AddressForm from "../AddressForm";
import { PlusIcon } from "../Icons";

interface Props {
  t: AccountTexts;
}

/** Adreslerim: kayıtlı adres kartları, ekle / düzenle (AddressForm), sil (onay penceresi). */
const AddressList = observer(function AddressList({ t }: Props) {
  const addresses = (customerStore.customer?.addresses ?? []).filter((a) => !a.deleted);
  // "new" = yeni adres formu, adres = düzenleme, null = kapalı
  const [editing, setEditing] = useState<IkasCustomerAddress | "new" | null>(null);
  const [removing, setRemoving] = useState<IkasCustomerAddress | null>(null);
  const [busy, setBusy] = useState(false);
  const [removeFailed, setRemoveFailed] = useState(false);

  const sorted = addresses.slice().sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault));

  const confirmRemove = async () => {
    if (!removing || busy) return;
    setBusy(true);
    setRemoveFailed(false);
    const ok = await deleteCustomerAddress(customerStore, removing).catch(() => false);
    setBusy(false);
    if (ok) setRemoving(null);
    else setRemoveFailed(true);
  };

  const addButton = (
    <button type="button" className="mon-btn mon-btn--gold addr__add" onClick={() => setEditing("new")}>
      <PlusIcon className="mon-icon" />
      {t.addAddressText}
    </button>
  );

  return (
    <div className="addr">
      {sorted.length === 0 ? (
        <div className="acc-card acc-empty">
          <p className="acc-empty__text">{t.addressesEmptyText}</p>
          {addButton}
        </div>
      ) : (
        <>
          <ul className="addr__grid">
            {sorted.map((a) => {
              const name = [a.firstName, a.lastName].filter(Boolean).join(" ");
              return (
                <li key={a.id} className="acc-card addr__card">
                  <div className="addr__head">
                    <h3 className="addr__title">{a.title}</h3>
                    {a.isDefault && t.defaultBadgeText && <span className="addr__badge">{t.defaultBadgeText}</span>}
                  </div>
                  <address className="addr__text">
                    {name && <strong>{name}</strong>}
                    <span>{getCustomerAddressText(a)}</span>
                    {a.phone && <span>{a.phone}</span>}
                  </address>
                  <div className="addr__actions">
                    <button type="button" className="acc-link" onClick={() => setEditing(a)}>
                      {t.editText}
                    </button>
                    <button
                      type="button"
                      className="acc-link acc-link--danger"
                      onClick={() => {
                        setRemoveFailed(false);
                        setRemoving(a);
                      }}
                    >
                      {t.deleteText}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {addButton}
        </>
      )}

      {editing && (
        <AddressForm key={editing === "new" ? "new" : editing.id} address={editing === "new" ? null : editing} t={t} onClose={() => setEditing(null)} />
      )}

      <Dialog
        open={!!removing}
        title={t.deleteAddressTitle}
        closeLabel={t.closeLabel}
        onClose={() => setRemoving(null)}
        busy={busy}
        footer={
          <>
            <button type="button" className="mon-btn mon-btn--outline" onClick={() => setRemoving(null)} disabled={busy}>
              {t.cancelText}
            </button>
            <button type="button" className="mon-btn mon-btn--outline acc-btn-danger" onClick={confirmRemove} disabled={busy}>
              {t.deleteAddressConfirm}
            </button>
          </>
        }
      >
        <p className="acc-muted">{fill(t.deleteAddressText, { title: removing?.title ?? "" })}</p>
        {removeFailed && t.deleteAddressErrorText && (
          <p className="acc-banner" role="alert">
            {t.deleteAddressErrorText}
          </p>
        )}
      </Dialog>
    </div>
  );
});

export default AddressList;
