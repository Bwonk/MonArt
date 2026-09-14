import { useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  IkasOrderLineItem,
  IkasOrderLineItemOptionValue,
  getIkasOrderLineVariantHref,
  getOrderLineItemFormattedFinalPriceWithQuantity,
  getOrderLineItemOverridenPriceWithQuantity,
  getOrderLineItemFormattedOverridenPriceWithQuantity,
  getOrderLineOptionFileName,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { summarizeOrderLine, lineThumb } from "../../utils/order-line";
import { getOrderLineFileUrl } from "../../utils/storefront-api";
import { cx } from "../../utils/theme-mode";

interface Props {
  item: IkasOrderLineItem;
  t: AccountTexts;
}

/** FILE opsiyonundaki tek dosya: ad + imzalı adresi yeni sekmede açan düğme. */
function FileValue({ value, t }: { value: IkasOrderLineItemOptionValue; t: AccountTexts }) {
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");
  const name = getOrderLineOptionFileName(value);

  const open = async () => {
    if (state === "busy") return;
    // Sekme tıklama anında açılır (açılır pencere engelleyicisi async sonrası window.open'ı engelliyor),
    // adres gelince yönlendirilir.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    setState("busy");
    const url = await getOrderLineFileUrl(value.value);
    if (url && tab) {
      tab.location.href = url;
      setState("idle");
    } else if (url) {
      window.location.href = url;
    } else {
      tab?.close();
      setState("failed");
    }
  };

  return (
    <span className="oline__file">
      {name && <span className="oline__file-name">{name}</span>}
      <button type="button" className="oline__file-btn" onClick={open} disabled={state === "busy"} aria-busy={state === "busy"}>
        {t.photoOpenText}
      </button>
      {state === "failed" && t.photoErrorText && (
        <span className="oline__file-error" role="alert">
          {t.photoErrorText}
        </span>
      )}
    </span>
  );
}

/** Salt-okunur sipariş satırı: sikke özeti, tasarım detayları (fotoğraflar dahil), adet, tutar. */
const OrderLine = observer(function OrderLine({ item, t }: Props) {
  const href = getIkasOrderLineVariantHref(item.variant) ?? undefined;
  const summary = summarizeOrderLine(item, t);
  const thumb = lineThumb(item, summary);
  const hasOldPrice = getOrderLineItemOverridenPriceWithQuantity(item) > 0;

  const fileOptions = (item.options ?? []).filter((o) => o.type === "FILE" && (o.values ?? []).some((v) => v.value));
  const fileNames = new Set(fileOptions.map((o) => o.name));
  const details = summary.details.filter((d) => !fileNames.has(d.label));
  const hasDetails = summary.isCustom && t.detailsLabel && (details.length > 0 || fileOptions.length > 0);

  return (
    <li className={cx("oline", item.status === "CANCELLED" && "is-cancelled")}>
      <a className="oline__thumb" href={href} tabIndex={-1} aria-hidden="true">
        {thumb ? <img src={thumb} alt="" loading="lazy" /> : <span className="oline__thumb-empty" />}
      </a>

      <div className="oline__body">
        {summary.isCustom && summary.productName && <span className="oline__eyebrow">{summary.productName}</span>}
        <a className="oline__title" href={href}>
          {summary.title}
        </a>
        {summary.faces.length > 0 ? (
          <p className="oline__meta">
            {summary.faces.map((f, i) => (
              <span key={i} className="oline__face">
                {f}
              </span>
            ))}
          </p>
        ) : (
          summary.variantText && <p className="oline__meta">{summary.variantText}</p>
        )}

        {hasDetails && (
          <details className="oline__details">
            <summary className="oline__details-toggle">{t.detailsLabel}</summary>
            <dl className="oline__details-list">
              {details.map((d, i) => (
                <div key={i} className="oline__detail">
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
              {fileOptions.map((o) => (
                <div key={o.productOptionId} className="oline__detail oline__detail--files">
                  <dt>{o.name}</dt>
                  <dd>
                    {o.values
                      .filter((v) => v.value)
                      .map((v, i) => (
                        <FileValue key={i} value={v} t={t} />
                      ))}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>

      <div className="oline__aside">
        <div className="oline__price">
          {hasOldPrice && <s className="oline__price-old">{getOrderLineItemFormattedOverridenPriceWithQuantity(item)}</s>}
          <span className="oline__price-now">{getOrderLineItemFormattedFinalPriceWithQuantity(item)}</span>
        </div>
        <span className="oline__qty">
          {t.quantityLabel && <span className="oline__qty-label">{t.quantityLabel}</span>}×{item.quantity}
        </span>
      </div>
    </li>
  );
});

export default OrderLine;
