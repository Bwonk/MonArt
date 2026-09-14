import { getDefaultSrc, createMediaSrcset } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";

export function NotFound(props: Props) {
  const {
    eyebrow = "",
    code = "404",
    title = "Bu Sayfa Henüz Basılmadı",
    description = "",
    primaryLink,
    secondaryLink,
    coinImage,
    backgroundColor = "#FFFFFF",
  } = props;
  const theme = useSectionTheme();

  // Sikke görseli varsa hata kodundaki ilk "0" yerine dönen sikke çizilir.
  const coinSrc = coinImage ? getDefaultSrc(coinImage) : "";
  const zeroAt = coinSrc ? code.indexOf("0") : -1;

  return (
    <section
      className={cx("nf", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="nf__inner">
        {eyebrow && <span className="mon-eyebrow mon-glow-text nf__eyebrow">{eyebrow}</span>}

        {code && (
          <p className="nf__code" aria-hidden="true">
            {zeroAt >= 0 ? (
              <>
                <span className="mon-gold-text">{code.slice(0, zeroAt)}</span>
                <span className="nf__coin mon-anim-float">
                  <img
                    className="nf__coin-img"
                    src={coinSrc}
                    srcSet={createMediaSrcset(coinImage!)}
                    sizes="180px"
                    alt=""
                  />
                </span>
                <span className="mon-gold-text">{code.slice(zeroAt + 1)}</span>
              </>
            ) : (
              <span className="mon-gold-text">{code}</span>
            )}
          </p>
        )}

        {title && <h1 className="nf__title">{title}</h1>}
        {description && <p className="nf__text">{description}</p>}

        {(primaryLink?.href || secondaryLink?.href) && (
          <div className="nf__actions">
            {primaryLink?.href && (
              <a className="mon-btn mon-btn--gold mon-btn--lg nf__btn" {...linkAttrs(primaryLink)}>
                {primaryLink.label}
              </a>
            )}
            {secondaryLink?.href && (
              <a className="mon-btn mon-btn--outline mon-btn--lg nf__btn" {...linkAttrs(secondaryLink)}>
                {secondaryLink.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default NotFound;
