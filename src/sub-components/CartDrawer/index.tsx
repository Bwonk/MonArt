import { observer } from "@ikas/component-utils";
import {
  cartStore,
  Router,
  withRoutePrefix,
  getIkasOrderTotalItemCount,
  getIkasOrderFormattedTotalFinalPrice,
  getCheckoutUrlFromCartStore,
  getIkasOrderFormattedTotalPrice,
  getIkasOrderDisplayedAdjustments,
  getOrderAdjustmentIsDecrement,
  formatCurrency,
  IkasImage,
} from "@ikas/bp-storefront";
import { useScrollLock } from "../../utils/theme-mode";
import { CloseIcon, PouchIcon } from "../Icons";
import CartLine, { CartLineTexts } from "../CartLine";
import CoinCheckoutButton from "../CoinCheckoutButton";
import CouponField, { CouponFieldTexts } from "../CouponField";

export interface CartDrawerTexts extends CartLineTexts {
  title: string;
  emptyText: string;
  emptyHint: string;
  emptyButtonText: string;
  totalLabel: string;
  subtotalLabel: string;
  discountLabel: string;
  coupon: CouponFieldTexts;
  checkoutButtonText: string;
  viewCartButtonText: string;
  closeLabel: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  texts: CartDrawerTexts;
  checkoutIcon?: IkasImage | null;
}

const CartDrawer = observer(function CartDrawer({ open, onClose, texts, checkoutIcon }: Props) {
  useScrollLock(open);
  const cart = cartStore.cart;
  const lines = (cart?.orderLineItems ?? []).filter((item) => !item.deleted);
  const count = cart ? getIkasOrderTotalItemCount(cart) : 0;
  const isEmpty = lines.length === 0;
  // Referans tek "İndirim" satırı gösterir: kupon ve kampanya indirimlerinin toplamı.
  const discount = cart
    ? (getIkasOrderDisplayedAdjustments(cart) ?? []).filter(getOrderAdjustmentIsDecrement).reduce((sum, adj) => sum + adj.amount, 0)
    : 0;

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
                <CartLine key={item.id} cart={cart!} item={item} texts={texts} variant="drawer" />
              ))}
            </ul>
            <footer className="kese__foot">
              <CouponField cart={cart!} variant="drawer" id="kese-coupon" texts={texts.coupon} />
              {discount > 0 && (
                <div className="kese__lines">
                  <div className="kese__total kese__total--line">
                    <span className="mon-label">{texts.subtotalLabel}</span>
                    <span className="kese__sub">{getIkasOrderFormattedTotalPrice(cart!)}</span>
                  </div>
                  <div className="kese__total kese__total--line kese__total--save">
                    <span className="mon-label">{texts.discountLabel}</span>
                    <span className="kese__sub">−{formatCurrency(discount, cart!.currencyCode, cart!.currencySymbol)}</span>
                  </div>
                </div>
              )}
              <div className="kese__total">
                <span className="mon-label">{texts.totalLabel}</span>
                <span className="mon-price mon-price--md mon-gold-text">{cart ? getIkasOrderFormattedTotalFinalPrice(cart) : ""}</span>
              </div>
              <CoinCheckoutButton className="kese__checkout" text={texts.checkoutButtonText} icon={checkoutIcon} onClick={goCheckout} />
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
