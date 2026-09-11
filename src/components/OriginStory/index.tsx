import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";

export function OriginStory(props: Props) {
  const {
    eyebrow = "✦ Hakkımızda ✦",
    title = "Bir Mirasın Yeniden Doğuşu:",
    titleAccent = "",
    body = "",
    anchorId = "craft",
    backgroundColor = "#FFFFFF",
  } = props;
  const theme = useSectionTheme();

  return (
    <section
      id={anchorId || undefined}
      className={cx("origin", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="origin__inner">
        {eyebrow && <div className="mon-eyebrow origin__eyebrow">{eyebrow}</div>}
        {(title || titleAccent) && (
          <h2 className="origin__title">
            {title}
            {titleAccent && (
              <>
                {title && <br />}
                <em className="origin__accent">{titleAccent}</em>
              </>
            )}
          </h2>
        )}
        {body && <div className="origin__plaque" dangerouslySetInnerHTML={{ __html: body }} />}
      </div>
    </section>
  );
}

export default OriginStory;
