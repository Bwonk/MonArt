import { useEffect, useRef, useState } from "preact/hooks";
import {
  cartStore,
  customerStore,
  hasCustomer,
  getIkasOrderTotalItemCount,
  getDefaultSrc,
  Router,
  withRoutePrefix,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { linkAttrs } from "../../utils/links";
import { useSectionTheme, useScrollLock, toggleThemeMode } from "../../utils/theme-mode";
import CartDrawer from "../../sub-components/CartDrawer";
import LanguageSwitcher from "../../sub-components/LanguageSwitcher";
import { PouchIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, UserIcon, ChevronIcon } from "../../sub-components/Icons";

const FLIP_MS = 600;

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
    cartFrontLabel = "Ön",
    cartBackLabel = "Arka",
    cartPlatingLabel = "24 Ayar Altın Kaplama",
    decreaseLabel = "Adedi azalt",
    increaseLabel = "Adedi artır",
    backgroundColor = "#FFFFFF",
    blurBackground = true,
    logoCoinScale = 115,
  } = props;

  const theme = useSectionTheme();
  const isNight = theme.isNight;
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useScrollLock(menuOpen);

  // Tema değişince sikke dönerken bir kez büyüyüp küçülür (referans coinDepth).
  const [spinning, setSpinning] = useState(false);
  const prevNight = useRef(isNight);
  useEffect(() => {
    if (prevNight.current === isNight) return;
    prevNight.current = isNight;
    setSpinning(true);
    const t = setTimeout(() => setSpinning(false), FLIP_MS);
    return () => clearTimeout(t);
  }, [isNight]);

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
    theme.className,
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
    decreaseLabel,
    increaseLabel,
    closeLabel,
    frontLabel: cartFrontLabel,
    backLabel: cartBackLabel,
    platingLabel: cartPlatingLabel,
  };

  const goHome = (e: Event) => {
    e.preventDefault();
    Router.navigateToPage("INDEX");
  };

  return (
    <header
      className={rootClass}
      style={{
        ...theme.style,
        ...(isNight ? {} : backgroundColor ? { "--header-bg": backgroundColor } : {}),
        "--logo-h": `${logoHeight}px`,
        "--logo-zoom": String(logoCoinScale / 100),
      }}
    >
      <div className="mon-header__bar">
        <div className="mon-header__inner">
          {/* Sol: 3D flip logo — gündüz sikke yüzü, gece MA halkası */}
          <a className="mon-header__logo" href={withRoutePrefix("/")} onClick={goHome} aria-label={logoAlt}>
            <span className={`mon-logo-flip${isNight ? " is-night" : ""}${spinning ? " is-spinning" : ""}`}>
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

          {/* Sağ küme (referans sırası): tema · nav + CTA · dil · hesap · kese */}
          <div className="mon-header__actions">
            {showThemeToggle && (
              <button
                type="button"
                className="mon-header__circle mon-header__theme"
                aria-label={themeToggleLabel}
                aria-pressed={isNight}
                onClick={() => toggleThemeMode()}
              >
                {/* Mevcut modu gösterir: gündüz güneş, gece ay */}
                {isNight ? <MoonIcon className="mon-icon" /> : <SunIcon className="mon-icon" />}
              </button>
            )}
            <nav className="mon-header__nav" aria-label={menuLabel}>
              {links.map((link, i) => (
                <div key={i} className="mon-header__item">
                  <a className="mon-header__link" {...linkAttrs(link)}>
                    {link.label}
                    {link.subLinks?.length > 0 && <ChevronIcon className="mon-icon mon-header__chev" />}
                  </a>
                  {link.subLinks?.length > 0 && (
                    <div className="mon-header__dropdown mon-anim-reveal">
                      {link.subLinks.map((sub, j) => (
                        <a key={j} className="mon-header__sublink" {...linkAttrs(sub)}>
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {showCta && ctaLink?.href && (
                <a className="mon-header__cta" {...linkAttrs(ctaLink)}>
                  {ctaLink.label}
                </a>
              )}
            </nav>
            {showLanguageSwitcher && (
              <span className="mon-header__lang">
                <LanguageSwitcher label={languageLabel} />
              </span>
            )}
            {showAccount && (
              <a
                className="mon-header__circle"
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
              <button type="button" className="mon-header__cart" aria-label={cartLabel} onClick={() => setCartOpen(true)}>
                <PouchIcon className="mon-icon" />
                {count > 0 && <span className="mon-count mon-header__badge">{count}</span>}
              </button>
            )}
            <button type="button" className="mon-header__circle mon-header__burger" aria-label={menuLabel} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
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
          </div>
        </div>
      </div>

      {showCart && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} texts={cartTexts} />}
    </header>
  );
}

export default Header;
