import { useEffect, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { customerStore, getOrders, IkasNavigationLink, IkasOrder } from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { sortOrders } from "../../utils/order-status";
import { linkAttrs } from "../../utils/links";
import OrderCard from "../OrderCard";

interface Props {
  t: AccountTexts;
  emptyLink?: IkasNavigationLink | null;
}

const PAGE_SIZE = 20;

/** Siparişlerim: tüm siparişler yeniden eskiye (ikas sayfalama vermiyor; 20'şer gösterilir). */
const OrderList = observer(function OrderList({ t, emptyLink }: Props) {
  const [orders, setOrders] = useState<IkasOrder[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    getOrders(customerStore)
      .then((list) => alive && setOrders(sortOrders(list ?? [])))
      .catch((err) => {
        console.error("[OrderList]", err);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  if (failed) {
    return (
      <div className="olist">
        <div className="acc-banner acc-banner--row" role="alert">
          <span>{t.ordersErrorText}</span>
          <button type="button" className="acc-link" onClick={() => setAttempt((a) => a + 1)}>
            {t.retryText}
          </button>
        </div>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="olist" aria-busy="true">
        <span className="mon-sr-only">{t.loadingText}</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="acc-skel acc-skel--card" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="olist">
        <div className="acc-card acc-empty">
          <p className="acc-empty__text">{t.ordersEmptyText}</p>
          {emptyLink?.href && emptyLink.label && (
            <a className="mon-btn mon-btn--gold" {...linkAttrs(emptyLink)}>
              {emptyLink.label}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="olist">
      {t.ordersIntro && <p className="acc-intro">{t.ordersIntro}</p>}
      <ul className="olist__list">
        {orders.slice(0, visible).map((order) => (
          <li key={order.id}>
            <OrderCard order={order} t={t} />
          </li>
        ))}
      </ul>
      {orders.length > visible && t.showMoreText && (
        <button type="button" className="mon-btn mon-btn--outline olist__more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          {t.showMoreText}
        </button>
      )}
    </div>
  );
});

export default OrderList;
