// This file is auto-generated — do not edit manually.
import type { IkasImage, IkasNavigationLinkList, IkasNavigationLink } from "@ikas/bp-storefront";

export interface Props {
  /** Yuvarlak MA monogram sikke */
  logoCoin?: IkasImage | null;
  /** MonetArts logotype */
  logoWordmark?: IkasImage | null;
  logoAlt?: string;
  logoHeight?: number;
  navLinks?: IkasNavigationLinkList;
  showCta?: boolean;
  ctaLink?: IkasNavigationLink | null;
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
  showAccount?: boolean;
  showCart?: boolean;
  sticky?: boolean;
  menuLabel?: string;
  closeLabel?: string;
  themeToggleLabel?: string;
  languageLabel?: string;
  accountLabel?: string;
  cartLabel?: string;
  cartTitle?: string;
  cartEmptyText?: string;
  cartEmptyHint?: string;
  cartEmptyButtonText?: string;
  totalLabel?: string;
  checkoutButtonText?: string;
  viewCartButtonText?: string;
  removeLabel?: string;
  quantityLabel?: string;
  backgroundColor?: string;
  blurBackground?: boolean;
  cartFrontLabel?: string;
  cartBackLabel?: string;
  /** Kaplama opsiyonu işaretliyse satır başlığına eklenir */
  cartPlatingLabel?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  /** Koyu zeminli sikke görselini daireyi dolduracak kadar büyütür */
  logoCoinScale?: number;
  checkoutIcon?: IkasImage | null;
  cartCouponPlaceholder?: string;
  cartCouponApplyText?: string;
  cartCouponApplyingText?: string;
  cartCouponRemoveText?: string;
  cartCouponEmptyText?: string;
  cartCouponErrorText?: string;
  cartCouponFreeText?: string;
  cartSubtotalLabel?: string;
  cartDiscountLabel?: string;
}
