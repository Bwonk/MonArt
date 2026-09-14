// This file is auto-generated — do not edit manually.
import type { IkasNavigationLink } from "@ikas/bp-storefront";

export interface Props {
  eyebrow?: string;
  title?: string;
  intro?: string;
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  showPhone?: boolean;
  phoneLabel?: string;
  phoneHint?: string;
  phonePlaceholder?: string;
  passwordLabel?: string;
  passwordHint?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  /** {link} yerine Üyelik Onayı Linki'nin etiketi bağlantı olarak gelir. */
  agreementText?: string;
  agreementLink?: IkasNavigationLink | null;
  /** İsteğe bağlı onay. {link} yerine Pazarlama İzni Linki gelir. */
  marketingText?: string;
  marketingLink?: IkasNavigationLink | null;
  consentError?: string;
  submitText?: string;
  submittingText?: string;
  requiredError?: string;
  emailError?: string;
  passwordMinError?: string;
  failureText?: string;
  socialFailureText?: string;
  showGoogle?: boolean;
  googleText?: string;
  showFacebook?: boolean;
  facebookText?: string;
  dividerText?: string;
  loginPrompt?: string;
  loginText?: string;
  backgroundColor?: string;
}
