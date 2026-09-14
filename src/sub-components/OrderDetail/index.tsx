import { useEffect, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  customerStore,
  getOrderDetailsOfPage,
  getOrder,
  getIkasOrderFormattedOrderedAt,
  getIkasOrderFormattedDate,
  getIkasOrderTotalItemCount,
  getIkasOrderDisplayedPackages,
  getIkasOrderRefundableItems,
  getIkasOrderRefundedItems,
  getIkasOrderFormattedTotalPrice,
  getIkasOrderShippingTotal,
  getIkasOrderFormattedShippingTotal,
  getIkasOrderDisplayedAdjustments,
  getOrderAdjustmentDisplayName,
  getOrderAdjustmentFormattedAmount,
  getIkasOrderFormattedTotalFinalPrice,
  getOrderAddressText,
  getOrderTransactionPaymentMethodTranslation,
  IkasNavigationLink,
  IkasOrder,
  IkasOrderAddress,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { fill } from "../../utils/account-texts";
import { pageLink } from "../../utils/auth";
import { orderStatusInfo, statusInfo, isTranslationKey } from "../../utils/order-status";
import { summarizeOrderLine } from "../../utils/order-line";
import OrderStatus from "../OrderStatus";
import OrderLine from "../OrderLine";
import CargoTracking from "../CargoTracking";
import RefundRequest from "../RefundRequest";

interface Props {
  t: AccountTexts;
  refundPolicyLink?: IkasNavigationLink | null;
  refundContactLink?: IkasNavigationLink | null;
}

/** URL'nin son parçası (`/account/orders/<id>`); "orders" ise yok. */
function orderIdFromPath(): string {
  const last = window.location.pathname.replace(/\/+$/, "").split("/").pop() ?? "";
  return last && last !== "orders" ? last : "";
}

function AddressBlock({ title, address }: { title: string; address: IkasOrderAddress }) {
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ");
  const tax = [address.taxOffice, address.taxNumber].filter(Boolean).join(" · ");
  return (
    <section className="acc-card odet__box">
      <h3 className="acc-card__title">{title}</h3>
      <address className="odet__addr">
        {name && <strong>{name}</strong>}
        {address.company && <span>{address.company}</span>}
        <span>{getOrderAddressText(address)}</span>
        {address.phone && <span>{address.phone}</span>}
        {tax && <span>{tax}</span>}
      </address>
    </section>
  );
}

function PaymentBlock({ order, t }: { order: IkasOrder; t: AccountTexts }) {
  const sale = (order.transactions ?? []).find(
    (tr) => tr.type === "SALE" && (tr.status === "SUCCESS" || tr.status === "AUTHORIZED"),
  );
  let method = "";
  let card = "";
  let installment = "";
  if (sale) {
    const translated = getOrderTransactionPaymentMethodTranslation(sale);
    method = (translated && !isTranslationKey(translated) ? translated : "") || sale.paymentGatewayName || "";
    const detail = sale.paymentMethodDetail;
    if (detail?.lastFourDigits) card = [detail.bankName, `•••• ${detail.lastFourDigits}`].filter(Boolean).join(" · ");
    const count = detail?.installment?.installmentCount ?? 0;
    installment = count > 1 ? fill(t.installmentText, { count }) : t.singlePaymentText;
  } else {
    method = order.paymentMethods?.[0]?.paymentGatewayName ?? "";
  }
  if (!method && !card) return null;
  return (
    <section className="acc-card odet__box">
      <h3 className="acc-card__title">{t.paymentTitle}</h3>
      <p className="odet__addr">
        {method && <strong>{method}</strong>}
        {card && <span>{card}</span>}
        {installment && <span>{installment}</span>}
      </p>
    </section>
  );
}

/** Sipariş detayı: başlık, satırlar, kargo, iade, adresler, ödeme, özet. */
const OrderDetail = observer(function OrderDetail({ t, refundPolicyLink, refundContactLink }: Props) {
  const [order, setOrder] = useState<IkasOrder | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundDone, setRefundDone] = useState(false);
  // refundOrder siparişi yerinde günceller; yeniden çizim için sayaç.
  const [, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      let found = await getOrderDetailsOfPage(customerStore);
      if (!found) {
        const id = orderIdFromPath();
        found = id ? await getOrder(customerStore, id) : null;
      }
      if (!alive) return;
      setOrder(found ?? null);
      setState(found ? "ready" : "missing");
    })().catch((err) => {
      console.error("[OrderDetail]", err);
      if (alive) setState("missing");
    });
    return () => {
      alive = false;
    };
  }, []);

  const back = (
    <a className="acc-back" {...pageLink("ORDERS")}>
      <span aria-hidden="true">← </span>
      {t.backToOrdersText}
    </a>
  );

  if (state === "loading") {
    return (
      <div className="odet" aria-busy="true">
        <span className="mon-sr-only">{t.loadingText}</span>
        <div className="acc-skel acc-skel--head" />
        <div className="acc-skel acc-skel--block" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="odet">
        {back}
        <div className="acc-card acc-empty">
          <p className="acc-empty__text">{t.orderNotFoundText}</p>
        </div>
      </div>
    );
  }

  const date = getIkasOrderFormattedOrderedAt(order) || getIkasOrderFormattedDate(order);
  const count = getIkasOrderTotalItemCount(order);
  const refundable = getIkasOrderRefundableItems(order);
  const refunded = getIkasOrderRefundedItems(order);
  const isShipment = order.shippingMethod === "SHIPMENT";
  const packages = isShipment
    ? getIkasOrderDisplayedPackages(order).filter((p) => p.orderPackageFulfillStatus !== "CANCELLED")
    : [];
  const lines = order.orderLineItems.filter((l) => !l.deleted);
  const shippingTotal = getIkasOrderShippingTotal(order);
  const adjustments = getIkasOrderDisplayedAdjustments(order) ?? [];

  return (
    <div className="odet">
      {back}

      <header className="odet__head">
        <div className="odet__head-main">
          <h2 className="odet__title">{fill(t.orderTitle, { no: order.orderNumber ?? "—" })}</h2>
          <p className="odet__meta">
            {date && <span>{date}</span>}
            {count > 0 && t.orderItemsText && <span>{fill(t.orderItemsText, { count })}</span>}
          </p>
        </div>
        <OrderStatus status={orderStatusInfo(order, t)} />
        {refundable.length > 0 && t.refundButtonText && (
          <button
            type="button"
            className="mon-btn mon-btn--outline odet__refund-btn"
            onClick={() => {
              setRefundDone(false);
              setRefundOpen(true);
            }}
          >
            {t.refundButtonText}
          </button>
        )}
      </header>

      {refundDone && t.refundSuccessText && (
        <p className="acc-banner acc-banner--ok" role="status">
          {t.refundSuccessText}
        </p>
      )}

      <section className="acc-card">
        {t.itemsTitle && <h3 className="acc-card__title">{t.itemsTitle}</h3>}
        <ul className="odet__lines">
          {lines.map((item) => (
            <OrderLine key={item.id} item={item} t={t} />
          ))}
        </ul>
      </section>

      {packages.length > 0 && (
        <section className="acc-card">
          {t.cargoTitle && <h3 className="acc-card__title">{t.cargoTitle}</h3>}
          <ul className="odet__pkgs">
            {packages.map((pkg) => (
              <li key={pkg.id} className="odet__pkg">
                <div className="odet__pkg-head">
                  <OrderStatus status={statusInfo(pkg.orderPackageFulfillStatus, t)} />
                  {packages.length > 1 && (
                    <span className="odet__pkg-no">
                      {t.packageLabel} {pkg.orderPackageNumber}
                    </span>
                  )}
                </div>
                {packages.length > 1 && (
                  <p className="odet__pkg-items">
                    {pkg.orderLineItems.map((item) => `${summarizeOrderLine(item, t).title} ×${item.quantity}`).join(" · ")}
                  </p>
                )}
                <CargoTracking pkg={pkg} t={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {refunded.length > 0 && (
        <section className="acc-card">
          {t.refundedTitle && <h3 className="acc-card__title">{t.refundedTitle}</h3>}
          <ul className="odet__refunds">
            {refunded.map((item) => (
              <li key={item.id} className="odet__refund">
                <span className="odet__refund-name">
                  {summarizeOrderLine(item, t).title} ×{item.quantity}
                </span>
                <OrderStatus status={statusInfo(item.status, t)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="odet__grid">
        {isShipment && order.shippingAddress && <AddressBlock title={t.shippingAddressTitle} address={order.shippingAddress} />}
        {order.billingAddress && <AddressBlock title={t.billingAddressTitle} address={order.billingAddress} />}
        <PaymentBlock order={order} t={t} />
      </div>

      <section className="acc-card odet__summary">
        {t.summaryTitle && <h3 className="acc-card__title">{t.summaryTitle}</h3>}
        <dl className="odet__sum">
          <div className="odet__sum-row">
            <dt>{t.subtotalLabel}</dt>
            <dd>{getIkasOrderFormattedTotalPrice(order)}</dd>
          </div>
          {isShipment && (
            <div className="odet__sum-row">
              <dt>{t.shippingLabel}</dt>
              <dd>{shippingTotal > 0 ? getIkasOrderFormattedShippingTotal(order) : t.freeShippingText}</dd>
            </div>
          )}
          {adjustments.map((adj, i) => {
            const name = getOrderAdjustmentDisplayName(adj);
            return (
              <div key={i} className="odet__sum-row odet__sum-row--adj">
                <dt>{isTranslationKey(name) ? adj.name : name}</dt>
                <dd>{getOrderAdjustmentFormattedAmount(adj)}</dd>
              </div>
            );
          })}
          <div className="odet__sum-row odet__sum-row--total">
            <dt>{t.totalLabel}</dt>
            <dd>
              {getIkasOrderFormattedTotalFinalPrice(order)}
              {t.taxIncludedText && <small>{t.taxIncludedText}</small>}
            </dd>
          </div>
        </dl>
      </section>

      {refundable.length > 0 && (
        <RefundRequest
          order={order}
          t={t}
          policyLink={refundPolicyLink}
          contactLink={refundContactLink}
          open={refundOpen}
          onClose={() => setRefundOpen(false)}
          onDone={() => {
            setRefundOpen(false);
            setRefundDone(true);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
});

export default OrderDetail;
