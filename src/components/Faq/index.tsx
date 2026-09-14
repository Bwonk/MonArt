import { IkasComponentRenderer } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";

export function Faq(props: Props) {
  const { items, ...parentProps } = props;
  const {
    eyebrow = "",
    title = "Sıkça Sorulan Sorular",
    showNumbers = true,
    anchorId = "sss",
    backgroundColor = "#FFFFFF",
    titleAsH1 = false,
  } = props;
  const theme = useSectionTheme();
  const Title = titleAsH1 ? "h1" : "h2";
  const list = (items as any[]) ?? [];

  return (
    <section
      id={anchorId || undefined}
      className={cx("faq", !showNumbers && "faq--plain", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="faq__inner">
        {eyebrow && <div className="mon-eyebrow faq__eyebrow">{eyebrow}</div>}
        {title && <Title className="faq__title">{title}</Title>}
        {list.length > 0 && (
          <div className="faq__list">
            <IkasComponentRenderer id="faq-items" components={list} parentProps={parentProps} />
          </div>
        )}
      </div>
    </section>
  );
}

export default Faq;
