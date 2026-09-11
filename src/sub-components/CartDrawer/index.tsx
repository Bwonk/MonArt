import { observer } from "@ikas/component-utils";
import {
  cartStore,
  Router,
  withRoutePrefix,
  getDefaultSrc,
  getIkasOrderTotalItemCount,
  getIkasOrderFormattedTotalFinalPrice,
  getOrderLineItemFormattedFinalPriceWithQuantity,
  getIkasOrderLineVariantMainImage,
  getIkasOrderLineVariantHref,
  getCheckoutUrlFromCartStore,
  changeItemQuantity,
  removeItem,
  isOrderLineItemAutoCreated,
  IkasCart,
  IkasOrderLineItem,
} from "@ikas/bp-storefront";
import { useScrollLock } from "../../utils/theme-mode";
import { CloseIcon, PouchIcon, TrashIcon, PlusIcon, MinusIcon } from "../Icons";

export interface CartDrawerTexts {
  title: string;
  emptyText: string;
  emptyHint: string;
  emptyButtonText: string;
  totalLabel: string;
  checkoutButtonText: string;
  viewCartButtonText: string;
  removeLabel: string;
  quantityLabel: string;
  closeLabel: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  texts: CartDrawerTexts;
}

/** Kişiselleştirme opsiyonlarını (Yüz 1 · İsim …) tek satırlık özetlere çevirir. */
function optionSummary(item: IkasOrderLineItem): string[] {
  const opts = item.options ?? [];
  const lines: string[] = [];
  for (const opt of opts) {
    const vals = (opt.values ?? [])
      .map((v) => v.name ?? v.value)
      .filter((v): v is string => !!v && v.trim().length > 0);
    if (vals.length) lines.push(`${opt.name}: ${vals.join(", ")}`);
  }
  return lines;
}

const CartLine = observer(function CartLine({
  cart,
  item,
  texts,
}: {
  cart: IkasCart;
  item: IkasOrderLineItem;
  texts: CartDrawerTexts;
}) {
  const image = getIkasOrderLineVariantMainImage(item.variant);
  const href = getIkasOrderLineVariantHref(item.variant);
  const readOnly = isOrderLineItemAutoCreated(cart, item);
  const summary = optionSummary(item);

  return (
    <li className="kese-line">
      <a className="kese-line__thumb" href={href ?? undefined} aria-hidden="true">
        {image ? <img src={getDefaultSrc(image)} alt="" loading="lazy" /> : <span className="kese-line__thumb-empty" />}
      </a>
      <div className="kese-line__body">
        <a className="kese-line__name" href={href ?? undefined}>
          {item.variant.name}
        </a>
        {summary.length > 0 && (
          <ul className="kese-line__opts">
            {summary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
        <div className="kese-line__row">
          {!readOnly ? (
            <div className="kese-qty" role="group" aria-label={texts.quantityLabel}>
              <button
                type="button"
                className="kese-qty__btn"
                aria-label="−"
                disabled={item.quantity <= 1}
                onClick={() => changeItemQuantity(item, item.quantity - 1)}
              >
                <MinusIcon className="mon-icon" />
              </button>
              <span className="kese-qty__val">{item.quantity}</span>
              <button
                type="button"
                className="kese-qty__btn"
                aria-label="+"
                onClick={() => changeItemQuantity(item, item.quantity + 1)}
              >
                <PlusIcon className="mon-icon" />
              </button>
            </div>
          ) : (
            <span className="kese-qty__val">{item.quantity}</span>
          )}
          <span className="kese-line__price">{getOrderLineItemFormattedFinalPriceWithQuantity(item)}</span>
        </div>
      </div>
      {!readOnly && (
        <button type="button" className="kese-line__remove" aria-label={texts.removeLabel} onClick={() => removeItem(item)}>
          <TrashIcon className="mon-icon" />
        </button>
      )}
    </li>
  );
});

const CartDrawer = observer(function CartDrawer({ open, onClose, texts }: Props) {
  useScrollLock(open);
  const cart = cartStore.cart;
  const lines = cart?.orderLineItems ?? [];
  const count = cart ? getIkasOrderTotalItemCount(cart) : 0;
  const isEmpty = lines.length === 0;

  const goCheckout = () => {
    // Giriş durumuna göre doğru checkout URL'ini döndürür (boş cart → "").
    const url = getCheckoutUrlFromCartStore(cartStore);
    if (url) window.location.href = url;
  };

  return (
    <div className={`kese${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="kese__backdrop mon-backdrop" onClick={onClose} />
      <aside className="kese__panel mon-drawer" role="dialog" aria-modal="true" aria-label={texts.title}>
        <header className="kese__head">
          <h3 className="kese__title mon-h3">
            {texts.title}
            {count > 0 && <span className="mon-count kese__count">{count}</span>}
          </h3>
          <button type="button" className="mon-btn mon-btn--icon mon-btn--close kese__close" aria-label={texts.closeLabel} onClick={onClose}>
            <CloseIcon className="mon-icon" />
          </button>
        </header>

        {isEmpty ? (
          <div className="kese__empty">
            <PouchIcon className="kese__empty-icon" />
            <p className="kese__empty-text">{texts.emptyText}</p>
            <p className="kese__empty-hint mon-editorial">{texts.emptyHint}</p>
            <button
              type="button"
              className="mon-btn mon-btn--outline"
              onClick={() => {
                onClose();
                Router.navigateToPage("INDEX");
              }}
            >
              {texts.emptyButtonText}
            </button>
          </div>
        ) : (
          <>
            <ul className="kese__list mon-scrollbar">
              {lines.map((item) => (
                <CartLine key={item.id} cart={cart!} item={item} texts={texts} />
              ))}
            </ul>
            <footer className="kese__foot">
              <div className="kese__total">
                <span className="mon-label">{texts.totalLabel}</span>
                <span className="mon-price mon-price--md mon-gold-text">{cart ? getIkasOrderFormattedTotalFinalPrice(cart) : ""}</span>
              </div>
              <button type="button" className="mon-btn mon-btn--brushed kese__checkout" onClick={goCheckout}>
                {texts.checkoutButtonText}
              </button>
              <a
                className="kese__view-cart mon-nav-link"
                href={withRoutePrefix("/cart")}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  Router.navigateToPage("CART");
                }}
              >
                {texts.viewCartButtonText}
              </a>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
});

export default CartDrawer;
