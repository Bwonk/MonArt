// This file is auto-generated — do not edit manually.
import type { IkasNavigationLink, IkasImage } from "@ikas/bp-storefront";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** Başlık yanındaki sayı: (2 parça) */
  itemsLabel?: string;
  loadingText?: string;
  emptyText?: string;
  emptyHint?: string;
  emptyButtonText?: string;
  continueText?: string;
  /** Boşsa ana sayfaya gider. Boş kese butonu da bunu kullanır. */
  continueLink?: IkasNavigationLink | null;
  frontLabel?: string;
  backLabel?: string;
  /** Kaplama opsiyonu işaretliyse satır başlığına eklenir */
  platingLabel?: string;
  /** Boş bırakılırsa açılır liste gizlenir */
  detailsLabel?: string;
  yesText?: string;
  filesText?: string;
  removeLabel?: string;
  quantityLabel?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  summaryTitle?: string;
  subtotalLabel?: string;
  totalLabel?: string;
  shippingNote?: string;
  checkoutButtonText?: string;
  couponLabel?: string;
  couponPlaceholder?: string;
  couponApplyText?: string;
  couponApplyingText?: string;
  couponRemoveText?: string;
  couponAppliedLabel?: string;
  couponErrorText?: string;
  backgroundColor?: string;
  checkoutIcon?: IkasImage | null;
}
