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
    titleAsH1 = false,
  } = props;
  const theme = useSectionTheme();
  const Title = titleAsH1 ? "h1" : "h2";

  return (
    <section
      id={anchorId || undefined}
      className={cx("origin", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="origin__inner">
        {eyebrow && <div className="mon-eyebrow origin__eyebrow">{eyebrow}</div>}
        {(title || titleAccent) && (
          <Title className="origin__title">
            {title}
            {titleAccent && (
              <>
                {title && <br />}
                <em className="origin__accent">{titleAccent}</em>
              </>
            )}
          </Title>
        )}
        {body && <div className="origin__plaque" dangerouslySetInnerHTML={{ __html: body }} />}
      </div>
    </section>
  );
}

export default OriginStory;
