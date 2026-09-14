import type { ComponentChildren } from "preact";
import { observer } from "@ikas/component-utils";

interface Props {
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Kartın içi: form ya da sonuç ekranı. */
  children: ComponentChildren;
  /** Kartın altındaki link satırı ("Hesabın yok mu? Kayıt ol"). */
  footer?: ComponentChildren;
}

/** Üyelik sayfalarının ortak düzeni: ortalı başlık bloğu + altın çizgili kart + alt link. */
const AuthLayout = observer(function AuthLayout({ eyebrow, title, intro, children, footer }: Props) {
  return (
    <div className="au">
      <header className="au__head">
        {eyebrow && <span className="au__eyebrow">{eyebrow}</span>}
        {title && <h1 className="au__title">{title}</h1>}
        {intro && <p className="au__intro">{intro}</p>}
      </header>
      <div className="au__card">{children}</div>
      {footer && <p className="au__footer">{footer}</p>}
    </div>
  );
});

export default AuthLayout;
