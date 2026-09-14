import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";

export function FaqItem({ question = "", answer = "", openByDefault = false }: Props) {
  // Child bileşenin wrapper'ı token'ları gündüz değerine sıfırlar; gece paletini kökte yeniden bağla.
  const theme = useSectionTheme();
  if (!question) return null;
  return (
    <details className={cx("faq-item", theme.className)} style={theme.style} open={openByDefault}>
      <summary className="faq-item__q">
        <span className="faq-item__n" aria-hidden="true" />
        <span className="faq-item__qt">{question}</span>
        <span className="faq-item__mark" aria-hidden="true" />
      </summary>
      {answer && <div className="faq-item__a" dangerouslySetInnerHTML={{ __html: answer }} />}
    </details>
  );
}

export default FaqItem;
