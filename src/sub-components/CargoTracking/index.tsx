import { useEffect, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import type { IkasDisplayedPackage } from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";

interface Props {
  pkg: IkasDisplayedPackage;
  t: AccountTexts;
}

/** Paketin kargo bilgisi: firma, takip no (kopyala), takip linki; bilgi yoksa "kargoya verilince görünecek". */
const CargoTracking = observer(function CargoTracking({ pkg, t }: Props) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  if (pkg.orderPackageFulfillStatus === "CANCELLED") return null;
  const info = pkg.trackingInfo;
  const number = info?.trackingNumber?.trim() || "";
  const company = info?.cargoCompany?.trim() || "";
  const link = info?.trackingLink?.trim() || "";

  if (!number && !company && !link) {
    return t.notShippedText ? <p className="cargo cargo--empty">{t.notShippedText}</p> : null;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
    } catch {
      /* izin yok — kullanıcı numarayı elle seçebilir */
    }
  };

  return (
    <div className="cargo" role="group" aria-label={t.cargoTitle || undefined}>
      <dl className="cargo__list">
        {company && (
          <div className="cargo__row">
            <dt>{t.cargoCompanyLabel}</dt>
            <dd>{company}</dd>
          </div>
        )}
        {number && (
          <div className="cargo__row">
            <dt>{t.trackingNumberLabel}</dt>
            <dd>
              <span className="cargo__number">{number}</span>
              <button type="button" className="cargo__copy" onClick={copy}>
                {copied ? t.copiedText : t.copyText}
              </button>
              <span className="mon-sr-only" aria-live="polite">
                {copied ? t.copiedText : ""}
              </span>
            </dd>
          </div>
        )}
      </dl>
      {link && (
        <a className="mon-btn mon-btn--outline cargo__track" href={link} target="_blank" rel="noopener noreferrer">
          {t.trackText}
        </a>
      )}
    </div>
  );
});

export default CargoTracking;
