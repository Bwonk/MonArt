import { useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  getDefaultSrc,
  getIkasOrderLineVariantMainImage,
  getIkasOrderLineVariantHref,
  getOrderLineItemFormattedFinalPriceWithQuantity,
  getOrderLineItemOverridenPriceWithQuantity,
  getOrderLineItemFormattedOverridenPriceWithQuantity,
  changeItemQuantity,
  removeItem,
  isOrderLineItemAutoCreated,
  IkasCart,
  IkasOrderLineItem,
} from "@ikas/bp-storefront";
import { summarizeLine, CartSummaryTexts } from "../../utils/cart-summary";
import { lineThumbFor, MIRROR_STYLE } from "../../utils/coin-thumbs";
import { TrashIcon, PlusIcon, MinusIcon } from "../Icons";

export interface CartLineTexts extends CartSummaryTexts {
  removeLabel: string;
  quantityLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
  /** Sepet sayfasındaki açılır liste başlığı: "Tasarım Detayları" */
  detailsLabel?: string;
}

interface Props {
  cart: IkasCart;
  item: IkasOrderLineItem;
  texts: CartLineTexts;
  /** "drawer": dar çekmece satırı · "page": sepet sayfası satırı (detay listesiyle) */
  variant?: "drawer" | "page";
}

const CartLine = observer(function CartLine({ cart, item, texts, variant = "drawer" }: Props) {
  const [busy, setBusy] = useState(false);
  const href = getIkasOrderLineVariantHref(item.variant) ?? undefined;
  const readOnly = isOrderLineItemAutoCreated(cart, item);
  const summary = summarizeLine(item, texts);
  // Önce tasarıma uyan sikke görseli, yoksa ürün/varyant görseli.
  const variantImage = getIkasOrderLineVariantMainImage(item.variant);
  const thumb = lineThumbFor(summary.design, variantImage ? getDefaultSrc(variantImage) : null);
  const hasOldPrice = getOrderLineItemOverridenPriceWithQuantity(item) > 0;
  const isPage = variant === "page";

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const qty = !readOnly ? (
    <div className="cart-line__qty" role="group" aria-label={texts.quantityLabel}>
      <button
        type="button"
        className="cart-line__qty-btn"
        aria-label={texts.decreaseLabel}
        disabled={busy || item.quantity <= 1}
        onClick={() => run(() => changeItemQuantity(item, item.quantity - 1))}
      >
        <MinusIcon className="mon-icon" />
      </button>
      <span className="cart-line__qty-val" aria-live="polite">
        {item.quantity}
      </span>
      <button
        type="button"
        className="cart-line__qty-btn"
        aria-label={texts.increaseLabel}
        disabled={busy}
        onClick={() => run(() => changeItemQuantity(item, item.quantity + 1))}
      >
        <PlusIcon className="mon-icon" />
      </button>
    </div>
  ) : (
    <span className="cart-line__qty-val">×{item.quantity}</span>
  );

  const price = (
    <div className="cart-line__price">
      {hasOldPrice && <s className="cart-line__price-old">{getOrderLineItemFormattedOverridenPriceWithQuantity(item)}</s>}
      <span className="cart-line__price-now">{getOrderLineItemFormattedFinalPriceWithQuantity(item)}</span>
    </div>
  );

  return (
    <li className={`cart-line${isPage ? " cart-line--page" : ""}${busy ? " is-busy" : ""}`}>
      <a className="cart-line__thumb" href={href} tabIndex={-1} aria-hidden="true">
        {thumb ? <img src={thumb.src} alt="" loading="lazy" style={thumb.mirrored ? MIRROR_STYLE : undefined} /> : <span className="cart-line__thumb-empty" />}
      </a>

      <div className="cart-line__body">
        {summary.isCustom && summary.productName && <span className="cart-line__eyebrow">{summary.productName}</span>}
        <a className="cart-line__title" href={href}>
          {summary.title}
        </a>
        {summary.faces.length > 0 ? (
          <p className="cart-line__meta">
            {summary.faces.map((f, i) => (
              <span key={i} className="cart-line__face">
                {f}
              </span>
            ))}
          </p>
        ) : (
          summary.variantText && <p className="cart-line__meta">{summary.variantText}</p>
        )}

        {isPage && summary.isCustom && summary.details.length > 0 && texts.detailsLabel && (
          <details className="cart-line__details">
            <summary className="cart-line__details-toggle">{texts.detailsLabel}</summary>
            <dl className="cart-line__details-list">
              {summary.details.map((d, i) => (
                <div key={i} className="cart-line__detail">
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        {!isPage && (
          <div className="cart-line__row">
            {qty}
            {price}
          </div>
        )}
      </div>

      {isPage && (
        <div className="cart-line__aside">
          {price}
          {qty}
        </div>
      )}

      {!readOnly && (
        <button
          type="button"
          className="cart-line__remove"
          aria-label={texts.removeLabel}
          disabled={busy}
          onClick={() => run(() => removeItem(item))}
        >
          <TrashIcon className="mon-icon" />
        </button>
      )}
    </li>
  );
});

export default CartLine;
