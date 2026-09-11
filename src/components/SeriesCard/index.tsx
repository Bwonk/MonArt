import { useState } from "preact/hooks";
import { getDefaultSrc, createMediaSrcset, IkasImage } from "@ikas/bp-storefront";
import { Props } from "./types";
import { cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";
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
  } = props;

  const [flipped, setFlipped] = useState(false);
  const canFlip = !!backImage;

  return (
    <article className={cx("series-card", flipped && "is-flipped")}>
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
          <a className="series-card__link" {...linkAttrs(link)}>
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
