import { observer } from "@ikas/component-utils";
import {
  IkasOrder,
  getIkasOrderFormattedOrderedAt,
  getIkasOrderFormattedDate,
  getIkasOrderFormattedTotalFinalPrice,
  getIkasOrderTotalItemCount,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { fill } from "../../utils/account-texts";
import { orderLink } from "../../utils/auth";
import { orderStatusInfo } from "../../utils/order-status";
import { summarizeOrderLine, lineThumb } from "../../utils/order-line";
import { MIRROR_STYLE } from "../../utils/coin-thumbs";
import OrderStatus from "../OrderStatus";

interface Props {
  order: IkasOrder;
  t: AccountTexts;
}

/** Sipariş özeti kartı: ilk satırın sikke görseli, no, durum, tarih, adet, toplam, detay linki. */
const OrderCard = observer(function OrderCard({ order, t }: Props) {
  const lines = order.orderLineItems.filter((l) => !l.deleted);
  const first = lines[0];
  const summary = first ? summarizeOrderLine(first, t) : null;
  const thumb = first && summary ? lineThumb(first, summary) : null;
  const more = lines.length - 1;
  const link = orderLink(order);
  const date = getIkasOrderFormattedOrderedAt(order) || getIkasOrderFormattedDate(order);
  const count = getIkasOrderTotalItemCount(order);

  return (
    <article className="ocard">
      <a className="ocard__thumb" href={link.href} onClick={link.onClick} tabIndex={-1} aria-hidden="true">
        {thumb ? <img src={thumb.src} alt="" loading="lazy" style={thumb.mirrored ? MIRROR_STYLE : undefined} /> : <span className="ocard__thumb-empty" />}
      </a>

      <div className="ocard__body">
        <div className="ocard__top">
          <span className="ocard__no">
            <span className="ocard__label">{t.orderNoLabel}</span> #{order.orderNumber ?? "—"}
          </span>
          <OrderStatus status={orderStatusInfo(order, t)} />
        </div>
        {summary && (
          <p className="ocard__title">
            {summary.title}
            {more > 0 && <span className="ocard__more"> +{more}</span>}
          </p>
        )}
        <p className="ocard__meta">
          {date && (
            <span>
              <span className="ocard__label">{t.orderDateLabel}</span> {date}
            </span>
          )}
          {count > 0 && t.orderItemsText && <span>{fill(t.orderItemsText, { count })}</span>}
        </p>
      </div>

      <div className="ocard__aside">
        <span className="ocard__total">
          <span className="ocard__label">{t.orderTotalLabel}</span>
          {getIkasOrderFormattedTotalFinalPrice(order)}
        </span>
        <a className="acc-link ocard__detail" href={link.href} onClick={link.onClick}>
          {t.orderDetailText}
          <span aria-hidden="true"> →</span>
        </a>
      </div>
    </article>
  );
});

export default OrderCard;
