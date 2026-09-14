/**
 * bp-storefront'un dışa açmadığı storefront API işlemlerini doğrudan çağırır.
 * İstek biçimi paketin fetch-query'siyle aynı: POST `<apiUrl>/<operation>`, gövde = girdi.
 */
import { IkasStorefrontConfig } from "@ikas/bp-storefront";

/** İşlemi çağırır, `data.<operation>` değerini döner; hata ya da boş yanıtta null. */
export async function storefrontPost<T>(operation: string, body: unknown): Promise<T | null> {
  const apiUrl = IkasStorefrontConfig.apiUrl;
  if (!apiUrl) return null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": IkasStorefrontConfig.apiKey || "",
    "x-sfid": IkasStorefrontConfig.storefrontId || "",
    "x-sfrid": IkasStorefrontConfig.storefrontRoutingId || "",
  };
  if (IkasStorefrontConfig.customerToken) headers.authorization = `Bearer ${IkasStorefrontConfig.customerToken}`;
  const res = await fetch(`${apiUrl}/${operation}`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data?.[operation] as T | undefined) ?? null;
}

/**
 * Sipariş satırındaki FILE opsiyon değerinin geçici (imzalı) indirme adresi.
 * `downloadFile` aynı adresi alıp `<a download>` tıklatıyor; S3 başka alan adında olduğu için
 * tarayıcı `download`'ı yok sayıp sayfayı dosyaya götürebiliyor. Biz adresi yeni sekmede açıyoruz.
 */
export async function getOrderLineFileUrl(url: string): Promise<string | null> {
  try {
    return await storefrontPost<string>("getOrderLineFile", { input: { url } });
  } catch (err) {
    console.error("[getOrderLineFile]", err);
    return null;
  }
}
