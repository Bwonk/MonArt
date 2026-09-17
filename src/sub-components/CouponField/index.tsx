import { useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { IkasCart, saveCouponCode, removeCouponCode } from "@ikas/bp-storefront";
import { cx } from "../../utils/theme-mode";

export interface CouponFieldTexts {
  /** Girdinin üstündeki etiket (sayfa). Boşsa girdiye aria-label olarak placeholder verilir. */
  label?: string;
  placeholder: string;
  applyText: string;
  applyingText: string;
  removeText: string;
  /** Uygulanmış kod kutusunun etiketi (sayfa) */
  appliedLabel?: string;
  /** ikas kodu reddetti */
  errorText: string;
  /** Boş kodla "Uygula" (çekmece); verilmezse buton boş kodda pasif kalır */
  emptyCodeText?: string;
  /** Sepet bedelsizken (çekmece) */
  freeCartText?: string;
}

interface Props {
  cart: IkasCart;
  texts: CouponFieldTexts;
  /** page: sepet sayfası özet kutusu · drawer: referans v2 kese altbilgisi */
  variant: "page" | "drawer";
  /** Girdi id'si; drawer ve sayfa aynı anda render olabildiği için çağıran verir */
  id: string;
}

type Msg = "" | "empty" | "free" | "invalid";

/** ikas kupon kodu: uygula (küçük harfle yeniden dener), kaldır, hata mesajı. */
const CouponField = observer(function CouponField({ cart, texts, variant, id }: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>("");

  const checksEmpty = !!texts.emptyCodeText;
  const msgText =
    msg === "empty" ? texts.emptyCodeText : msg === "free" ? texts.freeCartText : msg === "invalid" ? texts.errorText : "";
  const msgId = `${id}-msg`;

  const apply = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const value = code.trim();
    if (!value) {
      if (checksEmpty) setMsg("empty");
      return;
    }
    if (texts.freeCartText && cart.totalPrice <= 0) {
      setMsg("free");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      let r = await saveCouponCode(cart, value);
      /* ikas kupon kodlarını küçük harfle saklayabiliyor; reddedilirse küçük harfle yeniden dene. */
      const lower = value.toLocaleLowerCase("en-US");
      if (!r.success && lower !== value) r = await saveCouponCode(cart, lower);
      if (r.success) setCode("");
      else setMsg("invalid");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      await removeCouponCode(cart);
    } finally {
      setBusy(false);
    }
  };

  const isDrawer = variant === "drawer";

  return (
    <div className={cx("coupon", `coupon--${variant}`)}>
      {cart.couponCode ? (
        <div className="coupon__applied">
          {!isDrawer && texts.appliedLabel && <span className="coupon__label">{texts.appliedLabel}</span>}
          <span className="coupon__tag">
            {isDrawer && <span aria-hidden="true">✦ </span>}
            <strong className="coupon__code">{cart.couponCode.toLocaleUpperCase("en-US")}</strong>
          </span>
          <button type="button" className="coupon__remove" disabled={busy} onClick={remove}>
            {texts.removeText}
          </button>
        </div>
      ) : (
        <form className="coupon__form" onSubmit={apply} noValidate>
          {texts.label && (
            <label className="coupon__label" htmlFor={id}>
              {texts.label}
            </label>
          )}
          <div className="coupon__row">
            <input
              id={id}
              className={cx(!isDrawer && "mon-field", "coupon__input", msg && "is-invalid")}
              type="text"
              value={code}
              maxLength={isDrawer ? 24 : undefined}
              placeholder={texts.placeholder}
              aria-label={texts.label ? undefined : texts.placeholder}
              autoComplete="off"
              autoCapitalize="characters"
              spellcheck={false}
              aria-invalid={msg ? true : undefined}
              aria-describedby={msg ? msgId : undefined}
              onInput={(e) => {
                setCode((e.target as HTMLInputElement).value);
                if (msg) setMsg("");
              }}
            />
            <button
              type="submit"
              className={cx(isDrawer ? "coupon__btn" : "mon-btn mon-btn--outline coupon__btn", busy && "is-busy")}
              disabled={busy || (!checksEmpty && !code.trim())}
            >
              {busy ? texts.applyingText : texts.applyText}
            </button>
          </div>
          {msgText && (
            <p id={msgId} className="coupon__msg is-err" role="alert">
              {msgText}
            </p>
          )}
        </form>
      )}
    </div>
  );
});

export default CouponField;
