# Formlar — İletişim ve Özel Tasarım Talebi (Faz 8)

Referans: `MonArt Lux.html` contact modal (~1433–1476) ve bespoke modal (~1084–1163), `monart-lux.js` contact submit (~2062–2090), `monart-bespoke.js`.
Referansta iki form da modal; iletişim formu `mailto:` açıyor, özel tasarım formu yalnız localStorage'a yazıyor. ikas'ta ikisi de ayrı CUSTOM sayfada section olur ve ikas'ın iletişim formu API'siyle mağaza paneline gönderilir.

---

## 1. ikas iletişim formu API'si

Kaynak: `@ikas/bp-storefront` `functions/models/validator/contact-form` (paket kaynağından okundu).

| Adım | Fonksiyon |
|---|---|
| Form nesnesi | `getContactForm(customerStore)` — customerStore içinde tek bir nesne |
| Sıfırla | `initContactForm(form)` |
| Alanlar | `setContactFormFirstName / LastName / Email / Phone / Message(form, value)` |
| Gönder | `submitContactForm(form): Promise<boolean>` |

- Gönderilen alanlar: `firstName`, `lastName`, `email`, `phone`, `message` ve `referer` (= `window.location.href`). Başka alan yok.
- ikas doğrulaması: ad, soyad, e-posta (biçim), mesaj zorunlu. **Telefon isteğe bağlı.**
- Captcha token'ını ikas kendi bekliyor (`waitForCaptchaTokenInit`); bizim işimiz yok.
- ikas'ın hata/başarı mesajları storefront i18n'inden gelir. **Biz kullanmıyoruz**: doğrulamayı kendimiz yapıp kendi TEXT prop mesajlarımızı gösteriyoruz. ikas yine de reddederse (`false`) genel hata metni çıkar.

**Durum yönetimi:** Alan değerleri section'ın kendi `useState`'inde tutulur. ikas form nesnesine yalnız gönderim anında yazılır: `initContactForm` → setter'lar → `submitContactForm`. Böylece iki form aynı `customerStore` nesnesini paylaşsa da birbirini etkilemez. Ortak yardımcı: `src/utils/contact-message.ts` → `sendContactMessage({ firstName, lastName, email, phone, message })`.

---

## 2. Mesaj biçimi

Konu, sipariş no, materyal ve görsel linkleri ikas'ta alan olmadığı için **mesaj metnine** yazılır. Panelde iki formun ayırt edilebilmesi için ilk satır köşeli parantezli bir etiketle başlar. Etiket ve satır başlıkları section prop'larından gelir; alan etiketlerindeki ` *` ve `(varsa)` gibi ekler başlıkta atılır.

**İletişim**
```
[İletişim] Konu: Mevcut Siparişim · Sipariş No: MA-0123
────────
<mesaj>
```
Sipariş no boşsa o parça yazılmaz.

**Özel Tasarım Talebi**
```
[Özel Tasarım Talebi] Materyal: 14 Ayar Altın
────────
<not — boşsa bu blok yazılmaz>

Referans görseller:
1. https://…/dosya-1.jpg
2. https://…/dosya-2.png
```
ikas mesajı zorunlu tuttuğu için başlık satırı not boş olsa da mesajı dolu tutar.

---

## 3. Alanlar ve doğrulama

Ad/Soyad ikas'ta ayrı olduğu için referanstaki tek "Ad Soyad" alanı **iki alana** bölündü.

| Alan | İletişim | Özel Tasarım | Kural |
|---|---|---|---|
| Ad, Soyad | zorunlu | zorunlu | boş olamaz (trim) |
| E-posta | zorunlu | zorunlu | `x@y.z` biçimi |
| Telefon | zorunlu | zorunlu (Telefon / WhatsApp) | en az 7 rakam (referansta zorunlu; ikas'ta değil) |
| Konu | seçim, varsayılan ilk seçenek | — | — |
| Sipariş No | isteğe bağlı | — | — |
| Mesaj | zorunlu | — | boş olamaz |
| Materyal | — | zorunlu seçim | "Seçiniz…" yer tutucusu seçili kalamaz |
| Not | — | isteğe bağlı, sayaçlı (`noteMaxLength`, varsayılan 800) | — |
| Referans görsel | — | isteğe bağlı, §4 | — |
| KVKK onayı | zorunlu | zorunlu | işaretsizse kutu kırmızı + sallanma + hata metni |

- Hatalar ilk gönderim denemesinden sonra görünür, sonra alan değiştikçe canlı güncellenir.
- Gönderimde ilk hatalı alana odaklanılır.
- Seçenek listeleri (konu, materyal) tek TEXT prop'ta `|` ile ayrılır: `Bronz | Gümüş Kaplama | …`.
- KVKK metninde `{link}` yer tutucusu, `consentLink` prop'unun etiketiyle link olarak basılır (KVKK sayfasına PAGE linki).

---

## 4. Referans görsel yükleme (Özel Tasarım)

ikas'ta iletişim formuna dosya eklenemiyor. Görseller **Sikke Kolye ürününün FILE opsiyonu** ("Yüz 1 · Fotoğraf") üzerinden ikas'ın S3 bucket'ına yüklenir, dönen `optionUrl`'ler mesaja yazılır. Sipariş ya da sepet oluşmaz.

- Section'da `product` (PRODUCT) prop'u → Sikke Kolye. `uploadOptionName` (varsayılan `Yüz 1 · Fotoğraf`) `·` ile anahtar kelimelere bölünür, `findOption` ile opsiyon bulunur.
- Ürün seçili değilse veya opsiyon bulunamazsa **yükleme alanı hiç görünmez**, form görselsiz çalışır.
- **`productOptionFileUpload` kullanılmıyor.** `@ikas/bp-storefront` 2.9.1'de S3'e FormData gönderirken `Content-Type: multipart/form-data` başlığını elle koyuyor, boundary eksik kaldığı için S3 `400 MalformedPOSTRequest` dönüyor ve fonksiyon her zaman boş liste veriyor (yayın önizlemesinde doğrulandı; başlıksız aynı istek 204). Yerine `src/utils/option-file-upload.ts` → `uploadOptionFiles(option, files)`: storefront API `getProductOptionFileUrl` (başlıklar `IkasStorefrontConfig`'ten: `x-api-key`, `x-sfid`, `x-sfrid`, varsa müşteri token'ı) → S3 presigned POST, `Content-Type` tarayıcıya bırakılır. Konfigüratör de aynı yardımcıyı kullanır. ikas düzeltince geri dönülebilir.
- Opsiyonun `fileSettings.maxQuantity` (şu an 3) değerinden fazla dosya tek seferde verilmez; dosyalar bu boyda parçalara bölünüp sırayla yüklenir.
- İstemci kontrolü: tür `image/jpeg`, `image/png`, `image/webp` (opsiyonun `allowedExtensions` listesi de varsa onunla kesiştirilir), dosya başına 5 MB, en fazla `maxFiles` (varsayılan 5). Aynı ad+boyuttaki dosya ikinci kez eklenmez. Reddedilen dosya için alanın altında hata metni çıkar.
- Sürükle-bırak ve tıklayıp seçme; listede ad, KB ve kaldır (×) düğmesi.
- Akış: doğrulama → (dosya varsa) yükleme, buton "Görseller yükleniyor…" → mesaj gönderimi, buton "Gönderiliyor…" → başarı ekranı.
- Dönen link sayısı dosya sayısından azsa ya da yükleme hata verirse gönderim **durur**, "Görseller yüklenemedi…" hatası çıkar. Kullanıcı dosyaları kaldırıp görselsiz gönderebilir.

**Bilinen kısıtlar**
- Referanstaki PDF ve SVG desteklenmiyor (opsiyon yalnız jpg/png/webp alıyor).
- **Bucket herkese kapalı:** `optionUrl` imzasız S3 adresi, tarayıcıda `403 AccessDenied` dönüyor. Sipariş satırında ikas paneli dosyayı kendi yetkisiyle gösteriyor olabilir; iletişim mesajındaki düz link ise merchant'ta açılmayabilir. Kullanıcı panelden kontrol edecek; açılmıyorsa görseller WhatsApp/e-posta ile istenir (yükleme alanı kaldırılır) ya da sıfır fiyatlı talep ürünü kurulur.
- Siparişe bağlanmayan dosyaların ikas tarafında sonradan temizlenip temizlenmediği bilinmiyor. Merchant talebi aldığında görselleri kendi arşivine indirmeli.
- Konfigüratördeki opsiyonun adı veya dosya ayarları değişirse (`maxQuantity`, uzantılar) bu form da etkilenir.

---

## 5. Başarı ve hata

- Başarı: form gizlenir, `✦` işareti + başlık + metin + "Yeni Mesaj / Yeni Talep" düğmesi. Düğme formu boşaltıp yeniden gösterir. Referanstaki 12 saniyelik otomatik sıfırlama yok.
- Başarı ekranı açılınca sayfa formun başına kaydırılır ve başlığa odaklanılır (ekran okuyucu için `aria-live`).
- Hata: ikas `false` dönerse veya istisna olursa gönder düğmesinin üstünde `failureText`. Girilen değerler korunur.

---

## 6. Sayfalar ve bağlantılar

| Sayfa | slug | Section |
|---|---|---|
| İletişim | `iletisim` → `/pages/iletisim` | `ContactForm` |
| Özel Tasarım | `ozel-tasarim` → `/pages/ozel-tasarim` | `BespokeRequest` |

Bu sayfalara PAGE linkiyle bağlanacaklar: Header nav "İletişim" ve CTA "Özel Tasarım", Footer "Bize Ulaşın", BespokeCall butonu (Ana sayfa ve Hakkımızda). `consentLink` → KVKK sayfası.
