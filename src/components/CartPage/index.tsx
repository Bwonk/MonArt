import {
  cartStore,
  Router,
  withRoutePrefix,
  getIkasOrderTotalItemCount,
  getIkasOrderFormattedTotalPrice,
  getIkasOrderFormattedTotalFinalPrice,
  getIkasOrderDisplayedAdjustments,
  getOrderAdjustmentFormattedAmount,
  getCheckoutUrlFromCartStore,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";
import CartLine, { CartLineTexts } from "../../sub-components/CartLine";
import CoinCheckoutButton from "../../sub-components/CoinCheckoutButton";
import CouponField from "../../sub-components/CouponField";
import { PouchIcon } from "../../sub-components/Icons";

export function CartPage(props: Props) {
  const {
    eyebrow = "",
    title = "Kese",
    itemsLabel = "parça",
    loadingText = "Kese hazırlanıyor…",
    emptyText = "Kesen henüz boş.",
    emptyHint = "Atölyede ilk eserini şekillendir.",
    emptyButtonText = "Atölyeye Git",
    continueText = "Atölyeye Dön",
    continueLink,
    frontLabel = "Ön",
    backLabel = "Arka",
    platingLabel = "24 Ayar Altın Kaplama",
    detailsLabel = "Tasarım Detayları",
    yesText = "Evet",
    filesText = "dosya",
    removeLabel = "Kaldır",
    quantityLabel = "Adet",
    decreaseLabel = "Adedi azalt",
    increaseLabel = "Adedi artır",
    summaryTitle = "Sipariş Özeti",
    subtotalLabel = "Ara Toplam",
    totalLabel = "Toplam",
    shippingNote = "Kargo ücreti ödeme adımında hesaplanır.",
    checkoutButtonText = "Ödemeye Geç",
    checkoutIcon,
    couponLabel = "Kupon veya Sertifika Kodu",
    couponPlaceholder = "MONETARTS-XXXX-XXXX-XXXX",
    couponApplyText = "Uygula",
    couponApplyingText = "Uygulanıyor…",
    couponRemoveText = "Kaldır",
    couponAppliedLabel = "Uygulanan kod",
    couponErrorText = "Kod geçersiz ya da bu keseye uygulanamıyor.",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();

  const cart = cartStore.cart;
  const lines = (cart?.orderLineItems ?? []).filter((item) => !item.deleted);
  const count = cart ? getIkasOrderTotalItemCount(cart) : 0;
  const loading = !cartStore.isCartInitialLoadFinished || (cartStore.isCartLoading && !cart);
  const isEmpty = lines.length === 0;
  const adjustments = cart ? getIkasOrderDisplayedAdjustments(cart) ?? [] : [];

  const lineTexts: CartLineTexts = {
    frontLabel,
    backLabel,
    platingLabel,
    detailsLabel,
    yesText,
    filesText,
    removeLabel,
    quantityLabel,
    decreaseLabel,
    increaseLabel,
  };

  const back = linkAttrs(continueLink);
  const backHref = back.href ?? withRoutePrefix("/");
  const onBack = (e: Event) => {
    if (back.href) return; // LINK prop'u doluysa tarayıcı normal gitsin
    e.preventDefault();
    Router.navigateToPage("INDEX");
  };

  const goCheckout = () => {
    const url = getCheckoutUrlFromCartStore(cartStore);
    if (url) window.location.href = url;
  };

  const backLink = (
    <a className="cart-pg__back mon-nav-link" {...back} href={backHref} onClick={onBack}>
      <span aria-hidden="true">←</span> {continueText}
    </a>
  );

  return (
    <section
      className={cx("cart-pg", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="cart-pg__inner">
        <header className="cart-pg__head">
          <div className="cart-pg__heading">
            {eyebrow && <div className="mon-eyebrow cart-pg__eyebrow">{eyebrow}</div>}
            <h1 className="cart-pg__title">
              {title}
              {count > 0 && (
                <span className="cart-pg__count">
                  ({count} {itemsLabel})
                </span>
              )}
            </h1>
          </div>
          {!isEmpty && !loading && continueText && backLink}
        </header>

        {loading ? (
          <p className="cart-pg__loading" role="status">
            {loadingText}
          </p>
        ) : isEmpty || !cart ? (
          <div className="cart-pg__empty">
            <PouchIcon className="cart-pg__empty-icon" />
            <p className="cart-pg__empty-text">{emptyText}</p>
            {emptyHint && <p className="cart-pg__empty-hint">{emptyHint}</p>}
            <a className="mon-btn mon-btn--outline" {...back} href={backHref} onClick={onBack}>
              {emptyButtonText}
            </a>
          </div>
        ) : (
          <div className="cart-pg__layout">
            <ul className="cart-pg__list">
              {lines.map((item) => (
                <CartLine key={item.id} cart={cart} item={item} texts={lineTexts} variant="page" />
              ))}
            </ul>

            <aside className="cart-pg__summary" aria-label={summaryTitle}>
              <h2 className="cart-pg__summary-title">{summaryTitle}</h2>

              <div className="cart-pg__coupon">
                <CouponField
                  cart={cart}
                  variant="page"
                  id="cart-pg-coupon"
                  texts={{
                    label: couponLabel,
                    placeholder: couponPlaceholder,
                    applyText: couponApplyText,
                    applyingText: couponApplyingText,
                    removeText: couponRemoveText,
                    appliedLabel: couponAppliedLabel,
                    errorText: couponErrorText,
                  }}
                />
              </div>

              <dl className="cart-pg__rows">
                <div className="cart-pg__row">
                  <dt>{subtotalLabel}</dt>
                  <dd>{getIkasOrderFormattedTotalPrice(cart)}</dd>
                </div>
                {adjustments.map((adj, i) => (
                  <div key={i} className="cart-pg__row cart-pg__row--adj">
                    <dt>{adj.name}</dt>
                    <dd>{getOrderAdjustmentFormattedAmount(adj)}</dd>
                  </div>
                ))}
                <div className="cart-pg__row cart-pg__row--total">
                  <dt>{totalLabel}</dt>
                  <dd className="mon-gold-text">{getIkasOrderFormattedTotalFinalPrice(cart)}</dd>
                </div>
              </dl>

              {shippingNote && <p className="cart-pg__note">{shippingNote}</p>}

              <CoinCheckoutButton text={checkoutButtonText} icon={checkoutIcon} onClick={goCheckout} />
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default CartPage;
