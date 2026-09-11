import { useRef } from "preact/hooks";
import { IkasComponentRenderer, getDefaultSrc, createMediaSrcset } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";

export function Hero(props: Props) {
  const { seriesCards, ...parentProps } = props;
  const {
    eyebrow = "✦ Sanatımıza Ortak Olun ✦",
    logotype,
    title = "Tarihi Senin Hikayenle Yaz",
    subtitle = "Kişiye Özel · El İşçiliği · Sonsuz Anlam",
    description = "",
    showLogotypeShine = true,
    primaryCta,
    secondaryCta,
    showScrollHint = true,
    scrollHintText = "Aşağı Kaydır",
    fullHeight = true,
    anchorId = "hero",
    backgroundColor = "#FFFFFF",
  } = props;

  const theme = useSectionTheme();
  const rootRef = useRef<HTMLElement>(null);
  const logoSrc = logotype ? getDefaultSrc(logotype) : "";
  const cards = (seriesCards as any[]) ?? [];

  const scrollNext = () => {
    const el = rootRef.current;
    if (!el) return;
    const headerH = parseFloat(getComputedStyle(el).getPropertyValue("--header-h")) || 84;
    window.scrollBy({ top: el.getBoundingClientRect().bottom - headerH, behavior: "smooth" });
  };

  return (
    <section
      ref={rootRef}
      id={anchorId || undefined}
      className={cx("hero", fullHeight && "is-full", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="hero__inner">
        {eyebrow && <div className="mon-eyebrow mon-glow-text hero__eyebrow">{eyebrow}</div>}

        {logotype ? (
          <h1 className="hero__logo">
            <span className="hero__logo-wrap">
              <img
                className="hero__logo-img"
                src={logoSrc}
                srcSet={createMediaSrcset(logotype)}
                sizes="(max-width: 860px) 92vw, 66vw"
                alt={title}
                fetchpriority="high"
              />
              {showLogotypeShine && (
                <span
                  className="hero__shine mon-anim-gold-sweep"
                  aria-hidden="true"
                  style={{ WebkitMaskImage: `url("${logoSrc}")`, maskImage: `url("${logoSrc}")` }}
                />
              )}
            </span>
          </h1>
        ) : (
          <h1 className="mon-display hero__title">{title}</h1>
        )}

        {subtitle && <p className="hero__subtitle">{subtitle}</p>}
        {description && <p className="mon-editorial hero__desc">{description}</p>}

        {cards.length > 0 && (
          <div className="hero__cards">
            <IkasComponentRenderer id="hero-series-cards" components={cards} parentProps={parentProps} />
          </div>
        )}

        {(primaryCta?.href || secondaryCta?.href) && (
          <div className="hero__ctas">
            {primaryCta?.href && (
              <a className="mon-btn mon-btn--gold mon-btn--lg" {...linkAttrs(primaryCta)}>
                {primaryCta.label}
              </a>
            )}
            {secondaryCta?.href && (
              <a className="mon-btn mon-btn--outline mon-btn--lg" {...linkAttrs(secondaryCta)}>
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}

        {showScrollHint && (
          <button type="button" className="hero__scroll mon-anim-scroll-pulse" onClick={scrollNext}>
            <span>{scrollHintText}</span>
            <span className="hero__scroll-arrow" aria-hidden="true">↓</span>
          </button>
        )}
      </div>
    </section>
  );
}

export default Hero;
