import { useEffect, useRef, useState } from "preact/hooks";
import { Router } from "@ikas/bp-storefront";
import { Props } from "./types";
import { linkAttrs } from "../../utils/links";
import { useSectionTheme, cx } from "../../utils/theme-mode";

/** href veya path'i karşılaştırılabilir pathname'e indirger (sorgu, #hash ve sondaki / atılır). */
function toPath(href: string | undefined | null): string {
  if (!href) return "";
  try {
    const path = decodeURI(new URL(href, "http://x").pathname);
    return path.replace(/\/+$/, "") || "/";
  } catch {
    return href;
  }
}

function initialPath(): string {
  try {
    return toPath(Router.getCurrentPath());
  } catch {
    return "";
  }
}
export function LegalPage(props: Props) {
  const {
    eyebrow = "✦",
    title = "Mesafeli Satış Sözleşmesi",
    updatedLabel = "Son güncelleme",
    updatedDate = "",
    body = "",
    showNav = true,
    navTitle = "Dokümanlar",
    navLinks,
    backgroundColor = "#FFFFFF",
    anchorId = "",
  } = props;

  const theme = useSectionTheme();
  const links = (navLinks?.links ?? []).filter((l) => l.href);
  const hasNav = showNav && links.length > 0;

  // SSR'da Router'dan, mount sonrası tarayıcıdan okunur (routing prefix'i dahil).
  const [currentPath, setCurrentPath] = useState(initialPath);
  useEffect(() => {
    setCurrentPath(toPath(window.location.pathname));
  }, []);

  // Mobilde yatay kayan menüde aktif dokümanı görünür alana getir (sayfayı dikey kaydırmadan).
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[aria-current='page']");
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const offset = active.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollLeft += offset - (list.clientWidth - active.offsetWidth) / 2;
  }, [currentPath, links.length]);

  return (
    <section
      id={anchorId || undefined}
      className={cx("legal", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className={cx("legal__inner", !hasNav && "legal__inner--solo")}>
        <header className="legal__head">
          {eyebrow && (
            <div className="legal__orn" aria-hidden="true">
              <span className="legal__orn-line" />
              <span className="legal__orn-mark">{eyebrow}</span>
              <span className="legal__orn-line legal__orn-line--end" />
            </div>
          )}
          {title && <h1 className="legal__title">{title}</h1>}
          {updatedDate && (
            <p className="legal__updated">
              {updatedLabel && <span className="legal__updated-label">{updatedLabel}</span>}
              <span className="legal__updated-date">{updatedDate}</span>
            </p>
          )}
        </header>

        {hasNav && (
          <nav className="legal__nav" aria-label={navTitle || undefined}>
            {navTitle && <span className="legal__nav-title">{navTitle}</span>}
            <ul className="legal__nav-list" ref={listRef}>
              {links.map((l, i) => {
                const isActive = !!currentPath && toPath(l.href) === currentPath;
                return (
                  <li key={i}>
                    <a
                      className={cx("legal__nav-link", isActive && "is-active")}
                      aria-current={isActive ? "page" : undefined}
                      {...linkAttrs(l)}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {body && <article className="legal__body" dangerouslySetInnerHTML={{ __html: body }} />}
      </div>
    </section>
  );
}

export default LegalPage;
