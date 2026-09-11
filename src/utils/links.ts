import type { IkasNavigationLink } from "@ikas/bp-storefront";

/** LINK / LIST_OF_LINK öğesi için <a> öznitelikleri (yeni sekme güvenli). */
export function linkAttrs(link: IkasNavigationLink | null | undefined) {
  return {
    href: link?.href || undefined,
    target: link?.openInNewTab ? "_blank" : undefined,
    rel: link?.openInNewTab ? "noopener noreferrer" : undefined,
  };
}
