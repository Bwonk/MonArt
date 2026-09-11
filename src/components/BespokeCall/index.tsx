import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs } from "../../utils/links";

export function BespokeCall(props: Props) {
  const {
    eyebrow = "",
    title = "Aklınızdaki tasarım listede yok mu?",
    text = "",
    buttonLink,
    anchorId = "ozel-tasarim",
    backgroundColor = "#FFFFFF",
  } = props;
  const theme = useSectionTheme();

  return (
    <section
      id={anchorId || undefined}
      className={cx("bespoke", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="bespoke__card">
        {eyebrow && <span className="mon-glow-text bespoke__eyebrow">{eyebrow}</span>}
        {title && <h3 className="bespoke__title">{title}</h3>}
        {text && <p className="bespoke__text">{text}</p>}
        {buttonLink?.href && (
          <a className="bespoke__btn" {...linkAttrs(buttonLink)}>
            {buttonLink.label}
          </a>
        )}
      </div>
    </section>
  );
}

export default BespokeCall;
