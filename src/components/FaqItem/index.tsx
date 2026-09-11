import { Props } from "./types";

export function FaqItem({ question = "", answer = "", openByDefault = false }: Props) {
  if (!question) return null;
  return (
    <details className="faq-item" open={openByDefault}>
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
