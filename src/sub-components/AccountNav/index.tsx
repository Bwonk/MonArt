import { useEffect, useRef } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import { pageLink, AuthPage } from "../../utils/auth";
import type { AccountTexts } from "../../utils/account-texts";
import { cx } from "../../utils/theme-mode";

export type AccountTab = "profile" | "orders" | "addresses" | "favorites";

interface Props {
  active: AccountTab;
  t: AccountTexts;
  onLogout: () => void;
  loggingOut?: boolean;
  /** Kapalıyken Favoriler sekmesi gösterilmez. */
  showFavorites?: boolean;
}

const ITEMS: Array<{ tab: AccountTab; page: AuthPage; text: keyof AccountTexts }> = [
  { tab: "profile", page: "ACCOUNT", text: "navProfile" },
  { tab: "orders", page: "ORDERS", text: "navOrders" },
  { tab: "addresses", page: "ADDRESSES", text: "navAddresses" },
  { tab: "favorites", page: "FAVORITE_PRODUCTS", text: "navFavorites" },
];

/** Hesap sekmeleri: masaüstünde sol sütun, mobilde yatay kayan çip şeridi. */
const AccountNav = observer(function AccountNav({ active, t, onLogout, loggingOut, showFavorites = true }: Props) {
  // Mobilde aktif sekmeyi şeridin görünür alanına getir (sayfayı dikey kaydırmadan).
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>("[aria-current='page']");
    if (!list || !current || list.scrollWidth <= list.clientWidth) return;
    const offset = current.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollLeft += offset - (list.clientWidth - current.offsetWidth) / 2;
  }, [active]);

  return (
    <nav className="anav" aria-label={t.navLabel || undefined}>
      <ul className="anav__list" ref={listRef}>
        {ITEMS.filter((item) => showFavorites || item.tab !== "favorites").map((item) => {
          const isActive = item.tab === active;
          return (
            <li key={item.tab}>
              <a
                className={cx("anav__link", isActive && "is-active")}
                aria-current={isActive ? "page" : undefined}
                {...pageLink(item.page)}
              >
                {t[item.text]}
              </a>
            </li>
          );
        })}
        <li className="anav__sep" aria-hidden="true" />
        <li>
          <button type="button" className="anav__link anav__logout" onClick={onLogout} disabled={loggingOut}>
            {t.navLogout}
          </button>
        </li>
      </ul>
    </nav>
  );
});

export default AccountNav;
