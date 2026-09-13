import type { IkasNavigationLink } from "@ikas/bp-storefront";

/** LINK / LIST_OF_LINK öğesi için <a> öznitelikleri (yeni sekme güvenli). */
export function linkAttrs(link: IkasNavigationLink | null | undefined) {
  return {
    href: link?.href || undefined,
    target: link?.openInNewTab ? "_blank" : undefined,
    rel: link?.openInNewTab ? "noopener noreferrer" : undefined,
  };
}

/**
 * href'e sorgu parametresi ekler; mevcut sorguyu ve #hash'i korur. Boş değerler atlanır.
 * Göreli href'lerle de çalışır (`/koleksiyon` → `/koleksiyon?seri=roma`).
 */
export function withQuery(href: string, params: Record<string, string | undefined>): string {
  const hashAt = href.indexOf("#");
  const base = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const queryAt = base.indexOf("?");
  const path = queryAt >= 0 ? base.slice(0, queryAt) : base;
  const search = new URLSearchParams(queryAt >= 0 ? base.slice(queryAt + 1) : "");
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return `${path}${qs ? `?${qs}` : ""}${hash}`;
}
