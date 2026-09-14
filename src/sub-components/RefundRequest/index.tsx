import { useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  customerStore,
  refundOrder,
  setOrderLineItemRefundQuantity,
  getIkasOrderRefundableItems,
  IkasNavigationLink,
  IkasOrder,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { summarizeOrderLine, lineThumb } from "../../utils/order-line";
import { linkAttrs } from "../../utils/links";
import Dialog from "../Dialog";
import { PlusIcon, MinusIcon } from "../Icons";

interface Props {
  order: IkasOrder;
  t: AccountTexts;
  policyLink?: IkasNavigationLink | null;
  contactLink?: IkasNavigationLink | null;
  open: boolean;
  onClose: () => void;
  /** Talep gönderildi (sipariş SDK tarafından yerinde güncellendi). */
  onDone: () => void;
}

/** "{link}" yer tutucusunu link etiketine çevirir; link yoksa yalnız metin. */
function LinkedText({ text, link }: { text: string; link?: IkasNavigationLink | null }) {
  if (!text) return null;
  if (!text.includes("{link}")) return <>{text}</>;
  const [before, after] = text.split("{link}", 2);
  return (
    <>
      {before}
      {link?.label &&
        (link.href ? (
          <a className="acc-link" {...linkAttrs(link)}>
            {link.label}
          </a>
        ) : (
          link.label
        ))}
      {after}
    </>
  );
}

/** İade talebi: iade edilebilir satırlar için adet seçimi → refundOrder. */
const RefundRequest = observer(function RefundRequest({ order, t, policyLink, contactLink, open, onClose, onDone }: Props) {
  const items = getIkasOrderRefundableItems(order);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const total = Object.values(qty).reduce((a, b) => a + b, 0);
  const refundDesc = customerStore._refundSettings?.refundDesc?.trim() ?? "";

  const change = (id: string, next: number, max: number) => {
    setFailed(false);
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(max, next)) }));
  };

  const submit = async () => {
    if (sending || total === 0) return;
    setSending(true);
    setFailed(false);
    // refundOrder adetleri satırların kendisinden okur.
    order.orderLineItems.forEach((item) => setOrderLineItemRefundQuantity(qty[item.id] || null, item));
    const ok = await refundOrder(customerStore, order);
    setSending(false);
    if (ok) {
      setQty({});
      onDone();
    } else {
      setFailed(true);
    }
  };

  return (
    <Dialog
      open={open}
      title={t.refundTitle}
      closeLabel={t.closeLabel}
      onClose={onClose}
      busy={sending}
      wide
      footer={
        <>
          <button type="button" className="mon-btn mon-btn--outline" onClick={onClose} disabled={sending}>
            {t.cancelText}
          </button>
          <button type="button" className="mon-btn mon-btn--gold" onClick={submit} disabled={sending || total === 0}>
            {sending ? t.refundSubmittingText : t.refundSubmitText}
          </button>
        </>
      }
    >
      <div className="rfd">
        {t.refundIntro && <p className="rfd__intro">{t.refundIntro}</p>}

        <ul className="rfd__list">
          {items.map((item) => {
            const summary = summarizeOrderLine(item, t);
            const thumb = lineThumb(item, summary);
            const value = qty[item.id] ?? 0;
            return (
              <li key={item.id} className="rfd__item">
                <span className="rfd__thumb" aria-hidden="true">
                  {thumb && <img src={thumb} alt="" loading="lazy" />}
                </span>
                <span className="rfd__name">
                  <span className="rfd__title">{summary.title}</span>
                  {summary.faces[0] && <span className="rfd__meta">{summary.faces[0]}</span>}
                </span>
                <span className="rfd__qty" role="group" aria-label={`${t.refundQuantityLabel}: ${summary.title}`}>
                  <button
                    type="button"
                    className="rfd__qty-btn"
                    aria-label={t.decreaseLabel}
                    disabled={sending || value <= 0}
                    onClick={() => change(item.id, value - 1, item.quantity)}
                  >
                    <MinusIcon className="mon-icon" />
                  </button>
                  <span className="rfd__qty-val" aria-live="polite">
                    {value}
                    <span className="rfd__qty-max">/{item.quantity}</span>
                  </span>
                  <button
                    type="button"
                    className="rfd__qty-btn"
                    aria-label={t.increaseLabel}
                    disabled={sending || value >= item.quantity}
                    onClick={() => change(item.id, value + 1, item.quantity)}
                  >
                    <PlusIcon className="mon-icon" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        {refundDesc && <p className="rfd__desc">{refundDesc}</p>}
        {t.refundNoticeText && (
          <p className="rfd__note">
            <LinkedText text={t.refundNoticeText} link={policyLink} />
          </p>
        )}
        {t.refundReasonText && (
          <p className="rfd__note">
            <LinkedText text={t.refundReasonText} link={contactLink} />
          </p>
        )}
        {failed && t.refundErrorText && (
          <p className="acc-banner" role="alert">
            {t.refundErrorText}
          </p>
        )}
      </div>
    </Dialog>
  );
});

export default RefundRequest;
