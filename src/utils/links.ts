import { withRoutePrefix, type IkasNavigationLink } from "@ikas/bp-storefront";

/**
 * Link href'i dil routing'ine göre düzeltir. PAGE linkleri prefix'i zaten taşır; EXTERNAL
 * göreli linkler (`/#atolye`, `/pages/koleksiyon?seri=roma`) taşımaz. `withRoutePrefix`
 * idempotent, mutlak URL / mailto / tel'e dokunmaz.
 */
export function linkHref(link: IkasNavigationLink | null | undefined): string | undefined {
  const href = link?.href;
  if (!href) return undefined;
  return href.startsWith("/") ? withRoutePrefix(href) : href;
}

/** LINK / LIST_OF_LINK öğesi için <a> öznitelikleri (yeni sekme güvenli). */
export function linkAttrs(link: IkasNavigationLink | null | undefined) {
  return {
    href: linkHref(link),
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
