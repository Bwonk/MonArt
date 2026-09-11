import { useEffect } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  customerStore,
  getNewsletterSubscriptionForm,
  initNewsletterSubscriptionForm,
  setNewsletterSubscriptionFormEmail,
  submitNewsletterSubscriptionForm,
} from "@ikas/bp-storefront";

interface Props {
  title: string;
  text: string;
  placeholder: string;
  buttonText: string;
  submittingText: string;
  successText: string;
}

const NewsletterForm = observer(function NewsletterForm({ title, text, placeholder, buttonText, submittingText, successText }: Props) {
  const form = getNewsletterSubscriptionForm(customerStore);

  useEffect(() => {
    initNewsletterSubscriptionForm(form);
  }, [form]);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    await submitNewsletterSubscriptionForm(form);
  };

  return (
    <div className="mon-news">
      <p className="mon-news__title mon-label">{title}</p>
      {text && <p className="mon-news__text mon-editorial">{text}</p>}
      {form.isSuccess ? (
        <p className="mon-news__success">{successText}</p>
      ) : (
        <form className="mon-news__form" onSubmit={onSubmit} noValidate>
          <input
            type="email"
            className="mon-field mon-news__input"
            placeholder={placeholder}
            value={form.email.value}
            aria-invalid={form.email.hasError}
            onInput={(e: Event) => setNewsletterSubscriptionFormEmail(form, (e.target as HTMLInputElement).value)}
          />
          <button type="submit" className="mon-btn mon-btn--gold" disabled={form.isSubmitting}>
            {form.isSubmitting ? submittingText : buttonText}
          </button>
          {form.email.hasError && form.email.message && <span className="mon-news__error">{form.email.message}</span>}
          {form.isFailure && form.responseMessage && <span className="mon-news__error">{form.responseMessage}</span>}
        </form>
      )}
    </div>
  );
});

export default NewsletterForm;
