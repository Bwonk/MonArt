import { useEffect, useRef, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  customerStore,
  getEmptyAddressForm,
  getIkasCustomerAddressForm,
  clearIkasCustomerAddressForm,
  submitAddressForm,
  setAddressFormTitle,
  setAddressFormFirstName,
  setAddressFormLastName,
  setAddressFormIdentityNumber,
  setAddressFormAddressLine1,
  setAddressFormAddressLine2,
  setAddressFormPostalCode,
  setAddressFormCountry,
  setAddressFormState,
  setAddressFormCity,
  setAddressFormDistrict,
  setAddressFormRegion,
  setAddressFormPhone,
  AddressForm as IkasAddressForm,
  AddressFormItem,
  IkasCustomerAddress,
  IkasFormItem,
  IkasFormItemOption,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { fieldError, focusFirstInvalid } from "../../utils/auth";
import { cx } from "../../utils/theme-mode";
import Dialog from "../Dialog";
import FormField, { fieldAria } from "../FormField";

interface Props {
  /** Düzenlenen adres; yoksa yeni adres. */
  address?: IkasCustomerAddress | null;
  t: AccountTexts;
  onClose: () => void;
}

type Setter = (form: IkasAddressForm, value: string) => void;

const SETTERS: Record<AddressFormItem, Setter> = {
  firstName: setAddressFormFirstName,
  lastName: setAddressFormLastName,
  identityNumber: setAddressFormIdentityNumber,
  addressLine1: setAddressFormAddressLine1,
  addressLine2: setAddressFormAddressLine2,
  postalCode: setAddressFormPostalCode,
  country: setAddressFormCountry,
  state: setAddressFormState,
  city: setAddressFormCity,
  district: setAddressFormDistrict,
  region: setAddressFormRegion,
  phone: setAddressFormPhone,
};

const LABELS: Record<AddressFormItem, keyof AccountTexts> = {
  firstName: "addrFirstNameLabel",
  lastName: "addrLastNameLabel",
  identityNumber: "addrIdentityLabel",
  addressLine1: "addrLine1Label",
  addressLine2: "addrLine2Label",
  postalCode: "addrPostalCodeLabel",
  country: "addrCountryLabel",
  state: "addrStateLabel",
  city: "addrCityLabel",
  district: "addrDistrictLabel",
  region: "addrRegionLabel",
  phone: "addrPhoneLabel",
};

const AUTOCOMPLETE: Partial<Record<AddressFormItem, string>> = {
  firstName: "given-name",
  lastName: "family-name",
  addressLine1: "address-line1",
  addressLine2: "address-line2",
  postalCode: "postal-code",
  phone: "tel",
};

/** ikas ülke formatı gelmezse kullanılan sıra (TR düzeni). */
const FALLBACK_FORMAT: AddressFormItem[][] = [
  ["firstName", "lastName"],
  ["phone", "identityNumber"],
  ["country", "state"],
  ["city", "district"],
  ["addressLine1"],
  ["addressLine2"],
  ["postalCode"],
];

function optionsFor(form: IkasAddressForm, key: AddressFormItem): IkasFormItemOption[] | null {
  switch (key) {
    case "country":
      return form.countryOptions ?? [];
    case "state":
      return form.stateOptions ?? [];
    case "city":
      return form.city?.isFreeText ? null : form.cityOptions ?? [];
    case "district":
      return form.district?.isFreeText ? null : form.districtOptions ?? [];
    case "region":
      return form.regionOptions?.length ? form.regionOptions : null; // yoksa alan gizlenir
    default:
      return null;
  }
}

/** Adres ekleme / düzenleme penceresi; alanlar ikas'ın ülke formatına göre dizilir. */
const AddressForm = observer(function AddressForm({ address, t, onClose }: Props) {
  // Her iki yardımcı da formu kendisi başlatır (il/ilçe listeleri dahil); ikinci init yarış yaratır.
  const [form] = useState<IkasAddressForm>(() =>
    address ? getIkasCustomerAddressForm(address) : getEmptyAddressForm(customerStore),
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [failed, setFailed] = useState(false);
  const ready = form.isInitialized;
  const sending = form.isSubmitting;

  // Pencere açılırken form henüz iskeletti; hazır olunca ilk alana odaklan.
  useEffect(() => {
    if (ready) formRef.current?.querySelector<HTMLInputElement>("#acc-addr-title")?.focus();
  }, [ready]);

  const close = () => {
    // Düzenleme formu store'da önbellekte; iptalde atılır ki yeniden açınca kayıtlı değerle gelsin.
    if (address) clearIkasCustomerAddressForm(address);
    onClose();
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (!ready || sending) return;
    setFailed(false);
    const ok = await submitAddressForm(form);
    if (ok) close();
    else if (form.isFailure) setFailed(true);
    else focusFirstInvalid(formRef.current);
  };

  const renderField = (key: AddressFormItem) => {
    const field = form[key] as (IkasFormItem & { isLoading?: boolean }) | undefined;
    if (!field) return null;
    const id = `acc-addr-${key}`;
    const label = t[LABELS[key]];
    const hint = field.isRequired ? undefined : t.optionalHint;
    const err = fieldError(field, t.requiredError, key === "phone" ? t.phoneError : t.invalidError);
    const set = (v: string) => {
      SETTERS[key](form, v);
      setFailed(false);
    };
    const options = optionsFor(form, key);
    // Mahalle (region) yalnız ikas liste verdiğinde anlamlı: serbest metin kaydedilmiyor (id bekleniyor).
    if (key === "region" && !options) return null;

    if (options) {
      const empty = !field.value;
      return (
        <FormField key={key} id={id} label={label} hint={hint} error={err}>
          <div className="mf-select">
            <select
              className={cx("mon-field mf-control", empty && "is-placeholder")}
              value={field.value ?? ""}
              onChange={(e) => set((e.target as HTMLSelectElement).value)}
              disabled={sending || field.isLoading || options.length === 0}
              aria-busy={field.isLoading || undefined}
              {...fieldAria(id, err)}
            >
              <option value="">{t.selectPlaceholder}</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="mf-select__caret" aria-hidden="true">
              ⌄
            </span>
          </div>
        </FormField>
      );
    }

    return (
      <FormField key={key} id={id} label={label} hint={hint} error={err}>
        <input
          className="mon-field mf-control"
          type={key === "phone" ? "tel" : "text"}
          inputMode={key === "phone" ? "tel" : key === "identityNumber" || key === "postalCode" ? "numeric" : undefined}
          autoComplete={AUTOCOMPLETE[key]}
          placeholder={key === "addressLine1" ? t.addrLine1Placeholder || undefined : undefined}
          value={field.value ?? ""}
          onInput={(e) => set((e.target as HTMLInputElement).value)}
          disabled={sending}
          {...fieldAria(id, err)}
        />
      </FormField>
    );
  };

  const rows = form.addressFormat?.length ? form.addressFormat : FALLBACK_FORMAT;
  const titleErr = fieldError(form.title, t.requiredError, t.invalidError);

  return (
    <Dialog
      open
      wide
      title={address ? t.editTitle : t.addTitle}
      closeLabel={t.closeLabel}
      onClose={close}
      busy={sending}
      footer={
        <>
          <button type="button" className="mon-btn mon-btn--outline" onClick={close} disabled={sending}>
            {t.cancelText}
          </button>
          <button type="submit" form="acc-address-form" className="mon-btn mon-btn--gold" disabled={!ready || sending}>
            {sending ? t.addressSavingText : t.addressSaveText}
          </button>
        </>
      }
    >
      {!ready ? (
        <div className="afrm" aria-busy="true">
          <span className="mon-sr-only">{t.loadingText}</span>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="acc-skel acc-skel--field" />
          ))}
        </div>
      ) : (
        <form id="acc-address-form" ref={formRef} className="afrm acc-form" onSubmit={onSubmit} noValidate>
          {failed && t.addressErrorText && (
            <p className="acc-banner" role="alert">
              {t.addressErrorText}
            </p>
          )}
          <FormField id="acc-addr-title" label={t.addrTitleLabel} error={titleErr}>
            <input
              className="mon-field mf-control"
              type="text"
              placeholder={t.addrTitlePlaceholder || undefined}
              value={form.title?.value ?? ""}
              onInput={(e) => {
                setAddressFormTitle(form, (e.target as HTMLInputElement).value);
                setFailed(false);
              }}
              disabled={sending}
              {...fieldAria("acc-addr-title", titleErr)}
            />
          </FormField>
          {rows.map((row, i) => {
            const cells = row.map(renderField).filter(Boolean);
            if (!cells.length) return null;
            return (
              <div key={i} className={cells.length > 1 ? "mf-row" : "afrm__row"}>
                {cells}
              </div>
            );
          })}
        </form>
      )}
    </Dialog>
  );
});

export default AddressForm;
