// This file is auto-generated — do not edit manually.
import type { IkasImage, IkasNavigationLinkList, IkasNavigationLink } from "@ikas/bp-storefront";

export interface Props {
  logo?: IkasImage | null;
  logoAlt?: string;
  tagline?: string;
  /** Üst seviye = sütun başlığı, alt bağlantılar = sütun linkleri */
  columns?: IkasNavigationLinkList;
  contactTitle?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactHours?: string;
  contactButtonText?: string;
  contactButtonLink?: IkasNavigationLink | null;
  socialLinks?: IkasNavigationLinkList;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterText?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  newsletterSubmittingText?: string;
  newsletterSuccessText?: string;
  legalLinks?: IkasNavigationLinkList;
  copyrightText?: string;
  bottomLink?: IkasNavigationLink | null;
  backgroundColor?: string;
}
