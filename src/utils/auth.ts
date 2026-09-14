/**
 * Üyelik sayfaları (giriş, kayıt, şifre, doğrulama) için ortak yardımcılar.
 * Spec: docs/account-pages.md §1.
 */
import { useEffect } from "preact/hooks";
import { customerStore, waitForCustomerStoreInit, Router, withRoutePrefix } from "@ikas/bp-storefront";

export type AuthPage = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD" | "RECOVER_PASSWORD" | "ACTIVATE_CUSTOMER" | "ACCOUNT";

const PATHS: Record<AuthPage, string> = {
  LOGIN: "/account/login",
  REGISTER: "/account/register",
  FORGOT_PASSWORD: "/account/forgot-password",
  RECOVER_PASSWORD: "/account/recover-password",
  ACTIVATE_CUSTOMER: "/account/activate",
  ACCOUNT: "/account",
};

/** Gerçek href (sağ tık, SEO) + SPA gezinmesi. */
export function pageLink(page: AuthPage) {
  return {
    href: withRoutePrefix(PATHS[page]),
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      Router.navigateToPage(page);
    },
  };
}

/** URL sorgu parametresi; yalnız tarayıcıda, olay ya da effect içinde çağrılır. */
export function urlParam(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

/** Giriş/kayıt sonrası: güvenli `?redirect=` (site içi yol) varsa oraya, yoksa Hesabım'a. */
export function goAfterLogin(): void {
  const redirect = urlParam("redirect");
  if (redirect.startsWith("/") && !redirect.startsWith("//")) Router.navigate(redirect);
  else Router.navigateToPage("ACCOUNT");
}

/** Girişliyse yönlendirir; misafirse `onGuest`'i bir kez çağırır (formları sıfırlamak için). */
export function useGuestOnly(onGuest: () => void): void {
  useEffect(() => {
    let alive = true;
    waitForCustomerStoreInit(customerStore).then(() => {
      if (!alive) return;
      if (customerStore.customer) goAfterLogin();
      else onGuest();
    });
    return () => {
      alive = false;
    };
  }, []);
}

/** ikas form alanı hatasını bizim metnimize çevirir: boşsa zorunlu, doluysa alana özgü. */
export function fieldError(
  field: { value?: string; hasError?: boolean } | undefined,
  requiredText: string,
  invalidText: string,
): string | null {
  if (!field?.hasError) return null;
  return (field.value ?? "").trim() ? invalidText : requiredText;
}

/** Submit sonrası ilk hatalı alana odaklanır (hata satırları çizildikten sonra). */
export function focusFirstInvalid(form: HTMLFormElement | null): void {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
}
