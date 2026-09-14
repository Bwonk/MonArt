/**
 * FILE tipi ürün opsiyonuna dosya yükleme.
 *
 * `productOptionFileUpload` (@ikas/bp-storefront 2.9.1) S3'e FormData gönderirken
 * `Content-Type: multipart/form-data` başlığını elle koyuyor; boundary eksik kaldığı için S3
 * 400 `MalformedPOSTRequest` dönüyor ve fonksiyon her zaman boş liste veriyor (tarayıcıda
 * doğrulandı, Faz 8). Bu yardımcı aynı akışı başlığı tarayıcıya bırakarak uygular:
 *   1. storefront API `getProductOptionFileUrl` → S3 presigned POST (url + fields) ve optionUrl
 *   2. fields + file ile S3'e POST (200/204 başarı) → optionUrl döner
 * ikas düzeltince `productOptionFileUpload`'a geri dönülebilir.
 */
import { IkasProductOption } from "@ikas/bp-storefront";
import { storefrontPost } from "./storefront-api";

interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
  optionUrl: string;
}

async function getPresignedUpload(option: IkasProductOption, file: File): Promise<PresignedUpload | null> {
  const data = await storefrontPost<PresignedUpload>("getProductOptionFileUrl", {
    fileName: file.name,
    productOptionSetId: option.productOptionSetId,
    productOptionId: option.id,
  });
  return data?.url && data?.fields && data?.optionUrl ? data : null;
}

async function uploadOne(option: IkasProductOption, file: File): Promise<string | null> {
  const presigned = await getPresignedUpload(option, file);
  if (!presigned) return null;
  const body = new FormData();
  Object.entries(presigned.fields).forEach(([key, value]) => body.append(key, value));
  body.append("file", file);
  // Content-Type verilmez: tarayıcı boundary ile kendisi kurar.
  const res = await fetch(presigned.url, { method: "POST", body });
  return res.status === 200 || res.status === 204 ? presigned.optionUrl : null;
}

/**
 * Dosyaları yükler, başarılı olanların optionUrl'lerini sırayla döner.
 * `fileSettings.maxQuantity`'den fazla dosya verilirse (ikas'taki gibi) hiçbir şey yüklemez.
 */
export async function uploadOptionFiles(option: IkasProductOption, files: File[]): Promise<string[]> {
  const max = option.fileSettings?.maxQuantity;
  if (!files.length || (max && files.length > max)) return [];
  const results = await Promise.all(
    files.map((f) =>
      uploadOne(option, f).catch((err) => {
        console.error("[option-file-upload]", f.name, err);
        return null;
      }),
    ),
  );
  return results.filter((u): u is string => !!u);
}
