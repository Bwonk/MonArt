import { useEffect, useState } from "preact/hooks";
import {
  cartStore,
  customerStore,
  hasCustomer,
  getIkasOrderTotalItemCount,
  getDefaultSrc,
  Router,
  withRoutePrefix,
  IkasNavigationLink,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useThemeMode, useScrollLock, toggleThemeMode } from "../../utils/theme-mode";
import CartDrawer from "../../sub-components/CartDrawer";
import LanguageSwitcher from "../../sub-components/LanguageSwitcher";
import { PouchIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, UserIcon, ChevronIcon } from "../../sub-components/Icons";

function linkAttrs(link: IkasNavigationLink) {
  return {
    href: link.href,
    target: link.openInNewTab ? "_blank" : undefined,
    rel: link.openInNewTab ? "noopener noreferrer" : undefined,
  };
}

export function Header(props: Props) {
  const {
    logoCoin,
    logoWordmark,
    logoAlt = "MonetArts",
    logoHeight = 56,
    navLinks,
    showCta = true,
    ctaLink,
    showThemeToggle = true,
    showLanguageSwitcher = true,
    showAccount = false,
    showCart = true,
    sticky = true,
    menuLabel = "Menü",
    closeLabel = "Kapat",
    themeToggleLabel = "Gece / Gündüz",
    languageLabel = "Dil",
    accountLabel = "Hesabım",
    cartLabel = "Kese",
    cartTitle = "Kese",
    cartEmptyText = "Kesen henüz boş.",
    cartEmptyHint = "Atölyede ilk eserini şekillendir.",
    cartEmptyButtonText = "Atölyeye Git",
    totalLabel = "Toplam",
    checkoutButtonText = "Sikke Sikke Öde :)",
    viewCartButtonText = "Keseyi Gör",
    removeLabel = "Kaldır",
    quantityLabel = "Adet",
    backgroundColor = "#FFFFFF",
    blurBackground = true,
  } = props;

  const mode = useThemeMode();
  const isNight = mode === "night";
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useScrollLock(menuOpen);

  // Diğer bileşenler "ikas:open-cart-sidebar" ile keseyi açabilir.
  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener("ikas:open-cart-sidebar", open);
    return () => window.removeEventListener("ikas:open-cart-sidebar", open);
  }, []);

  const links = navLinks?.links ?? [];
  const cart = cartStore.cart;
  const count = cart ? getIkasOrderTotalItemCount(cart) : 0;
  const loggedIn = hasCustomer(customerStore);

  const rootClass = [
    "mon-header",
    isNight ? "mon-night" : "",
    sticky ? "is-sticky" : "",
    blurBackground ? "is-glass" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cartTexts = {
    title: cartTitle,
    emptyText: cartEmptyText,
    emptyHint: cartEmptyHint,
    emptyButtonText: cartEmptyButtonText,
    totalLabel,
    checkoutButtonText,
    viewCartButtonText,
    removeLabel,
    quantityLabel,
    closeLabel,
  };

  const goHome = (e: Event) => {
    e.preventDefault();
    Router.navigateToPage("INDEX");
  };

  return (
    <header
      className={rootClass}
      style={{
        ...(isNight ? {} : backgroundColor ? { "--header-bg": backgroundColor } : {}),
        "--logo-h": `${logoHeight}px`,
      }}
    >
      <div className="mon-header__bar">
        <div className="mon-header__inner">
          {/* Sol: 3D flip logo — gündüz sikke yüzü, gece yazı yüzü */}
          <a className="mon-header__logo" href={withRoutePrefix("/")} onClick={goHome} aria-label={logoAlt}>
            <span className={`mon-logo-flip${isNight ? " is-night" : ""}`}>
              <span className="mon-logo-flip__face mon-logo-flip__face--coin">
                {logoCoin ? <img src={getDefaultSrc(logoCoin)} alt={logoAlt} /> : <span className="mon-logo-flip__mono">MA</span>}
              </span>
              <span className="mon-logo-flip__face mon-logo-flip__face--word">
                {logoWordmark ? (
                  <img src={getDefaultSrc(logoWordmark)} alt={logoAlt} />
                ) : logoCoin ? (
                  <img src={getDefaultSrc(logoCoin)} alt={logoAlt} />
                ) : (
                  <span className="mon-logo-flip__mono">MA</span>
                )}
              </span>
            </span>
          </a>

          {/* Orta: masaüstü navigasyon */}
          <nav className="mon-header__nav" aria-label={menuLabel}>
            {links.map((link, i) => (
              <div key={i} className="mon-header__item">
                <a className="mon-nav-link mon-header__link" {...linkAttrs(link)}>
                  {link.label}
                  {link.subLinks?.length > 0 && <ChevronIcon className="mon-icon mon-header__chev" />}
                </a>
                {link.subLinks?.length > 0 && (
                  <div className="mon-header__dropdown">
                    {link.subLinks.map((sub, j) => (
                      <a key={j} className="mon-header__sublink" {...linkAttrs(sub)}>
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sağ: aksiyonlar */}
          <div className="mon-header__actions">
            {showThemeToggle && (
              <button
                type="button"
                className="mon-btn mon-btn--icon mon-header__theme"
                aria-label={themeToggleLabel}
                aria-pressed={isNight}
                onClick={() => toggleThemeMode()}
              >
                {isNight ? <SunIcon className="mon-icon" /> : <MoonIcon className="mon-icon" />}
              </button>
            )}
            {showLanguageSwitcher && (
              <span className="mon-header__lang">
                <LanguageSwitcher label={languageLabel} />
              </span>
            )}
            {showAccount && (
              <a
                className="mon-btn mon-btn--icon"
                href={withRoutePrefix(loggedIn ? "/account" : "/account/login")}
                aria-label={accountLabel}
                onClick={(e) => {
                  e.preventDefault();
                  Router.navigateToPage(loggedIn ? "ACCOUNT" : "LOGIN");
                }}
              >
                <UserIcon className="mon-icon" />
              </a>
            )}
            {showCart && (
              <button type="button" className="mon-btn mon-btn--icon mon-header__cart" aria-label={cartLabel} onClick={() => setCartOpen(true)}>
                <PouchIcon className="mon-icon" />
                {count > 0 && <span className="mon-count mon-header__badge">{count}</span>}
              </button>
            )}
            {showCta && ctaLink?.href && (
              <a className="mon-btn mon-btn--gold mon-header__cta" {...linkAttrs(ctaLink)}>
                {ctaLink.label}
              </a>
            )}
            <button type="button" className="mon-btn mon-btn--icon mon-header__burger" aria-label={menuLabel} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <MenuIcon className="mon-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menü */}
      <div className={`mon-menu${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mon-menu__backdrop mon-backdrop" onClick={() => setMenuOpen(false)} />
        <div className="mon-menu__panel mon-drawer" role="dialog" aria-modal="true" aria-label={menuLabel}>
          <div className="mon-menu__head">
            <span className="mon-eyebrow">{menuLabel}</span>
            <button type="button" className="mon-btn mon-btn--icon mon-btn--close" aria-label={closeLabel} onClick={() => setMenuOpen(false)}>
              <CloseIcon className="mon-icon" />
            </button>
          </div>
          <nav className="mon-menu__nav">
            {links.map((link, i) => (
              <div key={i} className="mon-menu__group">
                <a className="mon-menu__link" {...linkAttrs(link)} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
                {link.subLinks?.length > 0 && (
                  <div className="mon-menu__sub">
                    {link.subLinks.map((sub, j) => (
                      <a key={j} className="mon-menu__sublink" {...linkAttrs(sub)} onClick={() => setMenuOpen(false)}>
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mon-menu__foot">
            {showCta && ctaLink?.href && (
              <a className="mon-btn mon-btn--gold mon-btn--lg mon-menu__cta" {...linkAttrs(ctaLink)} onClick={() => setMenuOpen(false)}>
                {ctaLink.label}
              </a>
            )}
            {showLanguageSwitcher && <LanguageSwitcher label={languageLabel} />}
          </div>
        </div>
      </div>

      {showCart && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} texts={cartTexts} />}
    </header>
  );
}

export default Header;
