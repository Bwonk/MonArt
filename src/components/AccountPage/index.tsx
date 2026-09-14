import { useEffect, useState } from "preact/hooks";
import {
  baseStore,
  customerStore,
  waitForCustomerStoreInit,
  logout,
  Router,
  IkasStorefrontConfig,
  IkasThemePageType,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { accountTexts, AccountTexts } from "../../utils/account-texts";
import { goToLogin, pageLink } from "../../utils/auth";
import AccountNav, { AccountTab } from "../../sub-components/AccountNav";
import AccountProfile from "../../sub-components/AccountProfile";
import OrderList from "../../sub-components/OrderList";
import OrderDetail from "../../sub-components/OrderDetail";
import AddressList from "../../sub-components/AddressList";
import FavoriteGrid from "../../sub-components/FavoriteGrid";

type Panel = "profile" | "orders" | "order" | "addresses" | "favorites";

const PANEL_BY_PAGE: Partial<Record<IkasThemePageType, Panel>> = {
  ACCOUNT: "profile",
  ORDERS: "orders",
  ORDER_DETAIL: "order",
  ADDRESSES: "addresses",
  FAVORITE_PRODUCTS: "favorites",
};

/** Sayfa tipi bilinmiyorsa (yedek) URL'den: /account/orders/<id>, /account/orders, … */
function panelFromPath(path: string): Panel {
  const p = path.replace(/\/+$/, "");
  if (/\/account\/orders\/[^/]+$/.test(p)) return "order";
  if (p.endsWith("/account/orders")) return "orders";
  if (p.endsWith("/account/addresses")) return "addresses";
  if (p.endsWith("/account/favorite-products")) return "favorites";
  return "profile";
}

const TAB_OF: Record<Panel, AccountTab> = {
  profile: "profile",
  orders: "orders",
  order: "orders",
  addresses: "addresses",
  favorites: "favorites",
};

const TITLE_OF: Record<Panel, keyof AccountTexts> = {
  profile: "navProfile",
  orders: "navOrders",
  order: "navOrders",
  addresses: "navAddresses",
  favorites: "navFavorites",
};

/**
 * Hesap sayfaları (Hesabım, Siparişlerim, Sipariş Detayı, Adreslerim, Favorilerim) — tek section, beş sayfa.
 * Panel sayfa tipinden seçilir; girişsiz ziyaretçi Giriş'e (dönüş adresiyle) yönlenir. Spec: docs/account-pages.md §3.
 */
export function AccountPage(props: Props) {
  const {
    backgroundColor = "#FFFFFF",
    showFavorites = false,
    ordersEmptyLink,
    refundPolicyLink,
    refundContactLink,
    favoritesEmptyLink,
  } = props;
  const t = accountTexts(props);
  const theme = useSectionTheme();

  const [ready, setReady] = useState(false);
  const [path, setPath] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setPath(window.location.pathname);
    let alive = true;
    waitForCustomerStoreInit(customerStore).then(() => {
      if (!alive) return;
      setReady(true);
      // Editörde yönlendirme yapılmaz; giriş kartı görünür.
      if (!customerStore.customer && !IkasStorefrontConfig.isEditor) goToLogin();
    });
    return () => {
      alive = false;
    };
  }, []);

  const pageType = baseStore.currentPageType;
  const panel: Panel = (pageType && PANEL_BY_PAGE[pageType]) || (path ? panelFromPath(path) : "profile");
  const customer = customerStore.customer;

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout(customerStore);
    Router.navigateToPage("INDEX");
  };

  let content;
  if (!ready) {
    content = (
      <div className="acc__loading" aria-busy="true">
        <span className="mon-sr-only">{t.loadingText}</span>
        <div className="acc-skel acc-skel--head" />
        <div className="acc-skel acc-skel--block" />
      </div>
    );
  } else if (!customer) {
    content = (
      <div className="acc-card acc-empty">
        {t.gateTitle && <h2 className="acc-empty__title">{t.gateTitle}</h2>}
        {t.gateText && <p className="acc-empty__text">{t.gateText}</p>}
        {t.gateButton && (
          <a className="mon-btn mon-btn--gold" {...pageLink("LOGIN")}>
            {t.gateButton}
          </a>
        )}
      </div>
    );
  } else if (panel === "orders") {
    content = <OrderList t={t} emptyLink={ordersEmptyLink} />;
  } else if (panel === "order") {
    content = <OrderDetail t={t} refundPolicyLink={refundPolicyLink} refundContactLink={refundContactLink} />;
  } else if (panel === "addresses") {
    content = <AddressList t={t} />;
  } else if (panel === "favorites") {
    content = <FavoriteGrid t={t} emptyLink={favoritesEmptyLink} />;
  } else {
    content = <AccountProfile t={t} showFavorites={showFavorites} />;
  }

  return (
    <section
      className={cx("acc", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="acc__inner">
        <header className="acc__head">
          {t.eyebrow && (
            <div className="acc__orn" aria-hidden="true">
              <span className="acc__orn-line" />
              <span className="acc__orn-mark">{t.eyebrow}</span>
              <span className="acc__orn-line acc__orn-line--end" />
            </div>
          )}
          <h1 className="acc__title">{t[TITLE_OF[panel]]}</h1>
        </header>

        {ready && customer && <AccountNav active={TAB_OF[panel]} t={t} onLogout={onLogout} loggingOut={loggingOut} showFavorites={showFavorites} />}

        <div className={cx("acc__main", !(ready && customer) && "acc__main--solo")}>{content}</div>
      </div>
    </section>
  );
}

export default AccountPage;
