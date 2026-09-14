import { useState } from "preact/hooks";
import { getDefaultSrc, createMediaSrcset, IkasImage } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs, withQuery } from "../../utils/links";
import { FlipIcon } from "../../sub-components/Icons";

function CoinFace({ image, alt, side }: { image?: IkasImage | null; alt: string; side: "front" | "back" }) {
  return (
    <div className={`series-card__face series-card__face--${side}`}>
      {image ? (
        <img src={getDefaultSrc(image)} srcSet={createMediaSrcset(image)} sizes="240px" alt={alt} loading="lazy" decoding="async" draggable={false} />
      ) : (
        <span className="series-card__placeholder" aria-hidden="true" />
      )}
    </div>
  );
}

export function SeriesCard(props: Props) {
  const {
    badge = "N° 01",
    name = "Roma",
    subtitle = "İmparator Serisi",
    description = "",
    frontImage,
    frontAlt = "",
    backImage,
    backAlt = "",
    link,
    flipLabel = "Çevir",
    seriesKey,
  } = props;

  // Child bileşenin wrapper'ı token'ları gündüz değerine sıfırlar; gece paletini kökte yeniden bağla.
  const theme = useSectionTheme();
  const [flipped, setFlipped] = useState(false);
  const canFlip = !!backImage;
  // Seri seçiliyse link galeride o sekmeyi açar (?seri=roma).
  const attrs = linkAttrs(link);
  if (attrs.href && seriesKey) attrs.href = withQuery(attrs.href, { seri: seriesKey });

  return (
    <article className={cx("series-card", flipped && "is-flipped", theme.className)} style={theme.style}>
      {badge && <span className="series-card__badge">{badge}</span>}

      <div className="series-card__coin mon-anim-float">
        <div className="series-card__coin3d">
          <CoinFace image={frontImage} alt={frontAlt || name} side="front" />
          <CoinFace image={backImage ?? frontImage} alt={backAlt || name} side="back" />
        </div>
      </div>

      {canFlip && (
        <button
          type="button"
          className={cx("series-card__flip", flipped && "is-active")}
          aria-pressed={flipped}
          onClick={() => setFlipped((v) => !v)}
        >
          <FlipIcon className="series-card__flip-icon" />
          <span>{flipLabel}</span>
        </button>
      )}

      <h3 className="series-card__name">
        {link?.href ? (
          <a className="series-card__link" {...attrs}>
            {name}
          </a>
        ) : (
          name
        )}
      </h3>
      {subtitle && <div className="series-card__sub">{subtitle}</div>}
      {description && <p className="series-card__desc">{description}</p>}
    </article>
  );
}

export default SeriesCard;
