import { getDefaultSrc } from "@ikas/bp-storefront";
import { Props } from "./types";
import { linkAttrs } from "../../utils/links";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import NewsletterForm from "../../sub-components/NewsletterForm";


export function Footer(props: Props) {
  const {
    logo,
    logoAlt = "MonetArts",
    tagline = "",
    columns,
    contactTitle = "İletişim",
    contactEmail,
    contactAddress,
    contactHours,
    contactButtonText = "Bize Ulaşın",
    contactButtonLink,
    socialLinks,
    showNewsletter = false,
    newsletterTitle = "Atölyeden Haberler",
    newsletterText = "",
    newsletterPlaceholder = "E-posta adresiniz",
    newsletterButtonText = "Kaydol",
    newsletterSubmittingText = "Gönderiliyor…",
    newsletterSuccessText = "Teşekkürler, kaydınız alındı.",
    legalLinks,
    copyrightText = "© MMXXVI · monetarts studio · tüm hakları saklıdır",
    bottomLink,
    backgroundColor = "#FFFFFF",
    anchorId = "iletisim",
  } = props;

  const theme = useSectionTheme();
  const isNight = theme.isNight;
  const cols = columns?.links ?? [];
  const socials = socialLinks?.links ?? [];
  const legal = legalLinks?.links ?? [];
  const hasContact = !!(contactEmail || contactAddress || contactHours || contactButtonLink?.href);

  return (
    <footer
      id={anchorId || undefined}
      className={cx("mon-footer", theme.className)}
      style={{ ...theme.style, ...(!isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="mon-footer__inner">
        {/* Marka */}
        <div className="mon-footer__brand">
          {logo ? (
            <img className="mon-footer__logo" src={getDefaultSrc(logo)} alt={logoAlt} loading="lazy" />
          ) : (
            <span className="mon-footer__wordmark mon-gold-text">{logoAlt}</span>
          )}
          {tagline && <span className="mon-tagline mon-footer__tagline">{tagline}</span>}
        </div>

        {/* Sütunlar + iletişim */}
        {(cols.length > 0 || hasContact) && (
          <div className="mon-footer__cols">
            {cols.map((col, i) => (
              <div key={i} className="mon-footer__col">
                {col.href && col.subLinks?.length === 0 ? (
                  <a className="mon-footer__col-title" {...linkAttrs(col)}>{col.label}</a>
                ) : (
                  <span className="mon-footer__col-title">{col.label}</span>
                )}
                {col.subLinks?.length > 0 && (
                  <ul className="mon-footer__links">
                    {col.subLinks.map((l, j) => (
                      <li key={j}>
                        <a className="mon-footer__link" {...linkAttrs(l)}>{l.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {hasContact && (
              <div className="mon-footer__col mon-footer__col--contact">
                <span className="mon-footer__col-title">{contactTitle}</span>
                <ul className="mon-footer__links">
                  {contactEmail && (
                    <li><a className="mon-footer__link" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
                  )}
                  {contactAddress && <li><span className="mon-footer__text">{contactAddress}</span></li>}
                  {contactHours && <li><span className="mon-footer__text">{contactHours}</span></li>}
                </ul>
                {contactButtonLink?.href && (
                  <a className="mon-btn mon-btn--gold mon-footer__contact-btn" {...linkAttrs(contactButtonLink)}>
                    {contactButtonText}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bülten + sosyal */}
        {(showNewsletter || socials.length > 0) && (
          <div className="mon-footer__extra">
            {showNewsletter && (
              <NewsletterForm
                title={newsletterTitle}
                text={newsletterText}
                placeholder={newsletterPlaceholder}
                buttonText={newsletterButtonText}
                submittingText={newsletterSubmittingText}
                successText={newsletterSuccessText}
              />
            )}
            {socials.length > 0 && (
              <ul className="mon-footer__social">
                {socials.map((s, i) => (
                  <li key={i}>
                    <a className="mon-badge mon-footer__social-link" {...linkAttrs(s)}>{s.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Hukuki */}
        {legal.length > 0 && (
          <ul className="mon-footer__legal">
            {legal.map((l, i) => (
              <li key={i}>
                <a className="mon-footer__legal-link" {...linkAttrs(l)}>{l.label}</a>
              </li>
            ))}
          </ul>
        )}

        {/* Alt bar */}
        <div className="mon-footer__base">
          <span className="mon-footer__copy">{copyrightText}</span>
          {bottomLink?.href && (
            <a className="mon-footer__base-link" {...linkAttrs(bottomLink)}>{bottomLink.label}</a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
