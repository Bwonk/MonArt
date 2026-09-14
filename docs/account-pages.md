# MonArt — Hesap ve Üyelik Sayfaları (Faz 10b / 10c)

ikas'ın hazır hesap sayfaları (Global Ayarlar → Hesap Sayfaları) Faz 10'da denendi, **kullanıcı kararıyla bırakıldı**: font ve gece modu ayarlanamıyor. Yerine kendi section'larımız yazılıyor. Sayfaları kullanıcı editörde ekler; section'lar build + `import_section` ile gelir.

API referansı: `get_function_doc` ile doğrulandı (bp-storefront 2.9.1). Aşağıdaki "[SDK]" notları paket kaynağından okundu, MCP dokümanında yok.

---

## 1. Ortak kurallar

- Her section kökü `useSectionTheme()` alır; başlık Cinzel (`--f-deco`), gövde Montserrat. Day/Night tam çalışır.
- Form alanları Faz 8 parçalarıyla: `FormField` + `.mon-field mf-control`, onaylar `ConsentCheck`, başarı ekranı `FormSuccess`.
- **Hata metinleri bizim TEXT prop'larımız.** ikas'ın `field.message` ve `responseMessage` değerleri çeviri anahtarı olarak gelebiliyor (`validation.required` gibi), gösterilmez. Kural: `field.hasError` ise değer boşsa `requiredError`, doluysa alana özgü metin (`emailError`, `passwordMinError`, `passwordMatchError`).
- ikas doğrulaması: e-posta biçimi, **şifre en az 6 karakter** (giriş dahil), şifre tekrarı eşit, kayıtta üyelik onayı zorunlu. Pazarlama izni ve telefon doğrulanmaz.
- Formlar `get*Form(customerStore)` ile alınır (store'da önbellekte), misafir olduğu anlaşılınca `init*Form` ile sıfırlanır. Setter'lar ilk submit'ten sonra formu canlı doğrular.
- Sayfalar arası linkler gerçek `<a href>`: href `withRoutePrefix(path)`, tıklama `Router.navigateToPage(type)` (Header'daki kalıp). Yollar: LOGIN `/account/login`, REGISTER `/account/register`, FORGOT_PASSWORD `/account/forgot-password`, RECOVER_PASSWORD `/account/recover-password`, ACTIVATE_CUSTOMER `/account/activate`, ACCOUNT `/account`.
- Tarayıcı değerleri (URL `?token`, `?redirect`, müşteri durumu) ilk render'da okunmaz; `useEffect` içinde okunur.

Yardımcılar `src/utils/auth.ts`:
- `useGuestOnly(onGuest)` — `waitForCustomerStoreInit` sonrası girişliyse Hesabım'a (ya da güvenli `?redirect=`'e) yönlendirir, değilse `onGuest()`'i çağırır. Form beklemeden çizilir (yükleniyor ekranı yok).
- `goAfterLogin()` — `?redirect=` `/` ile başlıyorsa (`//` değil) oraya, yoksa ACCOUNT'a gider.
- `pageLink(type)` — `{ href, onClick }`.

Alt bileşenler:
- `AuthLayout` — ortalı başlık bloğu (eyebrow, h1, giriş metni) + altın üst çizgili kart + kart altı link satırı.
- `PasswordField` — `FormField` + göster/gizle düğmesi (etiketleri TEXT prop).
- `SocialLogin` — Google/Facebook butonları + "veya" ayracı. `socialLogin(customerStore, "google" | "facebook")` sağlayıcıya yönlendirir.

## 2. Faz 10b — Üyelik section'ları

| Section | Sayfa (pageType) | Akış |
|---|---|---|
| `AuthLogin` | LOGIN | `submitLoginForm` → `true` ise `goAfterLogin()`. `false` + `isFailure` → `failureText` (ikas hata kodu vermiyor; yanlış şifre / doğrulanmamış e-posta ayrımı yok). Mount'ta `handleSocialLogin`: `status === "success"` → `goAfterLogin()`; yalnız `message` doluysa `socialFailureText` (normal açılışta da `"fail"` döner). |
| `AuthRegister` | REGISTER | Ad, soyad, e-posta, telefon (isteğe bağlı, `showPhone`), şifre; üyelik onayı (zorunlu, Kullanım Şartları linki), pazarlama izni (isteğe bağlı, KVKK linki). `submitRegisterForm` → `true` ise müşteri **hemen giriş yapmış olur** [SDK] → `goAfterLogin()`. `false` → `failureText` (e-posta kayıtlı olabilir). Sosyal kayıt aynı butonlarla; `handleSocialLogin` burada da çağrılır (dönüş sayfası belgelenmemiş). Müşteri özel alanları (customer attributes) gösterilmez; mağazada tanımlı değil. |
| `AuthForgotPassword` | FORGOT_PASSWORD | `submitForgotPasswordForm` → `true` ise başarı ekranı (e-postanı kontrol et) + Giriş'e dön. |
| `AuthRecoverPassword` | RECOVER_PASSWORD | E-postadaki link `?token=` ile açılır; submit token'ı URL'den kendisi okur [SDK]. Token yoksa (mount'ta bakılır) "bağlantı geçersiz" ekranı + Şifremi Unuttum'a link. Başarıda otomatik yönlendirme yok; "şifren güncellendi" ekranı + Giriş Yap. |
| `AuthVerifyEmail` | ACTIVATE_CUSTOMER | Mount'ta `activateCustomer(customerStore)` (`?token=`'ı kendisi okur, giriş yaptırmaz). Başarı → Giriş Yap. Hata → e-posta ile `resendCustomerActivationMail`. Editörde token olmadığı için hep hata ekranı görünür. |

Captcha: mağaza captcha isterse SDK submit öncesi `grecaptcha.execute()` çalıştırır [SDK]; bizim tarafta widget yok. Şu an mağazada kapalı varsayılıyor, yayında test edilecek.

**Yerleştirme:** hazır üyelik grubu (`membership`) kapatılır; mevcut sayfalar (Header/Footer eklenmiş) kalırsa section araya konur, silinirse kullanıcı sayfaları yeniden ekler. Sonuç bu dokümana ve ROADMAP'e yazılır.

## 3. Faz 10c — Hesap section'ı (plan)

Karar (Faz 10b sonunda, kullanıcı): sipariş detayında **sikke özeti + küçük resim**, **kargo takibi** ve **iade talebi**; Hesabım'da **hesap silme**. Hazır `account` grubu bu faz bitince kapatılır (kapatınca ikas sayfaları siler; Faz 10b'deki gibi `create_page` ile yeniden açılır).

### 3.1 Mimari

Tek section **`AccountPage`** beş sayfaya konur: ACCOUNT `/account`, ORDERS `/account/orders`, ORDER_DETAIL `/account/orders/<orderId>`, ADDRESSES `/account/addresses`, FAVORITE_PRODUCTS `/account/favorite-products`. Panel `baseStore.currentPageType` ile seçilir (runtime'ın kendi sayfa tipi; SSR'da da doğru). Yedek: mount sonrası `Router.getCurrentPath()`. Tek section olmasının nedeni: sekme menüsü, giriş kapısı ve metinlerin tek yerde tutulması; parent COMPONENT_LIST child prop'larını okuyamaz (değişmez kural).

Prop sayısı ~150'yi bulacağı için prop grupları: `nav`, `profile`, `delete`, `orders`, `orderDetail`, `cargo`, `refund`, `addresses`, `favorites`, `errors`, `appearance`.

**Giriş kapısı:** `waitForCustomerStoreInit` → `customerStore.customer` yoksa `Router.navigateToPage("LOGIN", undefined, { redirect: <pathname> })`. Bekleme sırasında iskelet (skeleton) çizilir, hazır içerik flaşlanmaz.

**Düzen:** Üstte `AuthLayout` tarzı başlık bloğu yok; hesap sayfası daha geniş (`--w-page`). Sol/üst sekme çubuğu (`AccountNav` alt bileşeni): Kişisel Bilgilerim · Siparişlerim · Adreslerim · Favorilerim · Çıkış. Masaüstünde sol sütun (240px) + içerik; 860px altında yatay kayan çip şeridi (LegalPage'deki gibi, aktif öğe görünür alana kaydırılır). Aktif sekme `aria-current="page"`. Sekme linkleri gerçek `<a href>` + `Router.navigateToPage` (`pageLink` yardımcısı `src/utils/auth.ts`'e ACCOUNT alt sayfaları eklenerek genişletilir).

**Alt bileşenler** (`src/sub-components/`): `AccountNav`, `AccountProfile`, `AccountDeleteDialog`, `OrderList`, `OrderCard`, `OrderDetail`, `OrderLine` (CartLine'ın salt-okunur kardeşi: `summarizeLine` + `thumbForDesign`), `CargoTracking`, `RefundRequest`, `AddressList`, `AddressForm`, `FavoriteGrid`, `FavoriteCard`, `Dialog` (SealModal'daki modal iskeletinin genelleştirilmiş hali: `.mon-backdrop` + `.mon-panel`, `useScrollLock`, Esc, odak tuzağı). Hepsi `observer()`.

**Stil:** kartlar `.au__card` benzeri (bej zemin, altın üst çizgi) — `AuthLayout/styles.css`'ten `.acc-card` olarak `AccountPage/styles.css`'e taşınır; form alanları `FormField`/`.mf-*`; butonlar `.mon-btn--gold` / `--outline`; başlıklar Cinzel. Day/Night `useSectionTheme()`.

### 3.2 Paneller

**Profil (ACCOUNT)**
- Karşılama: "Merhaba, {ad}" (`greetingText` "Merhaba, "), altında e-posta.
- Özet kartları: toplam sipariş (`getOrders` sonucu uzunluğu), kayıtlı adres (`customer.addresses.length`), favori sayısı (`getFavoriteProducts` uzunluğu). Yüklenene kadar "—".
- Son sipariş kartı (`OrderCard`) + "Tüm siparişlerim" linki; sipariş yoksa `noOrdersText`.
- Bilgi formu: ad, soyad, telefon; e-posta salt-okunur (`emailLockText` "· değiştirilemez"). `getAccountInfoForm` / `initAccountInfoForm` / `setAccountInfoForm*` / `submitAccountInfoForm`. Başarı bandı `successText`, hata bandı `errorText`.
- Şifre değiştirme: SDK'da form **yok**. "Şifremi sıfırla" linki FORGOT_PASSWORD sayfasına (e-posta ile).
- Pazarlama izni: `AccountInfoForm.isMarketingAccepted` (`isCustomerSubscribed`'dan dolar); `ConsentCheck` ile gösterilir, submit her zaman `subscriptionStatus` gönderir.
- **Hesabı sil:** kart altında ince "Hesabımı sil" linki → `AccountDeleteDialog`: uyarı metni (`deleteWarningText`: geri alınamaz, siparişler ve kişiselleştirme dosyaları KVKK'ya göre saklanabilir), şifre alanı (`PasswordField`), "Hesabımı Sil" (kırmızı `mon-btn--outline` varyantı) + Vazgeç. `getDeactivateCustomerForm` / `initDeactivateCustomerForm` / `setDeactivateCustomerFormPassword` / `submitDeactivateCustomerForm`; başarıda `logout(customerStore)` → INDEX. Hata: SDK burada API hatasını çevrilmiş `responseMessage` olarak veriyor (ör. bekleyen silme talebi); boş değilse o, boşsa `deleteErrorText`. Gizli form olmadığı için test `?debug` gerektirmez, ama **gerçek silme test hesabıyla yapılır** (ozenmain hesabı silinmez).

**Siparişler (ORDERS)**
- `getOrders(customerStore)` mount'ta, sonuç local state; yükleniyor iskeleti, hata bandı + "Tekrar dene", boş durum (`ordersEmptyText` + "Atölyeye Git" butonu → `/#atolye`).
- `OrderCard`: sipariş no, tarih (`getIkasOrderFormattedOrderedAt`), durum çipi (`getIkasOrderPackageStatusTranslation` — ikas çevirisi TR geliyorsa kullanılır, yoksa durum → TEXT prop eşlemesi), ürün adedi, toplam (`getIkasOrderFormattedTotalFinalPrice`), ilk satırın sikke küçük resmi, "Detay" linki (`getIkasOrderHref`).
- Sıralama: `orderedAt` ile yeniden eskiye. `getOrders` sayfalama desteklemiyor, tüm liste gelir; 20'den fazlaysa istemci tarafında "Daha fazla göster".

**Sipariş detayı (ORDER_DETAIL)**
- `getOrderDetailsOfPage(customerStore)` id'yi URL'nin son parçasından kendisi okur (yalnız `currentPageType === "ORDER_DETAIL"`), `order.transactions`'ı doldurur ve iade ayarlarını önbelleğe alır. Editör önizlemesinde id yoksa müşterinin ilk siparişine düşer, o yüzden test müşterisinin bir siparişi varsa detay editörde de stillenir. `null` → "sipariş bulunamadı" + Siparişlerim linki.
- Başlık bloğu: "Sipariş #{no}", tarih, durum çipi, "Siparişlerime dön".
- Satırlar (`OrderLine`): sikke özeti başlığı (Seri · Cinsiyet · Materyal · Kaplama), "Ön/Arka" meta, açılır "Tasarım Detayları" listesi (tüm opsiyonlar; FILE opsiyonları için `downloadFile(value)` imzalı URL üretip indiriyor → "Fotoğrafı indir" düğmesi, ham `value` linklenmez), adet, tutar. Küçük resim `thumbForDesign` → yoksa varyant görseli. Hediye sertifikası satırı ürün adıyla.
- **Kargo takibi** (`CargoTracking`): `getIkasOrderDisplayedPackages(order)` paket gruplarını verir (sanal "hazırlanıyor" ve "iptal" grupları dahil), her grupta `statusTranslation` (ikas TR çevirisi) ve satırları. Gerçek paketlerde `trackingInfo.cargoCompany`, `trackingNumber` (kopyala düğmesi, `copiedText`), `trackingLink` varsa "Kargoyu Takip Et" (yeni sekme). Satırlar paket paket gruplanarak gösterilir; takip bilgisi olmayan pakette `notShippedText`.
- Adresler: teslimat ve fatura adresi kartları (`getOrderAddressText` + ad, telefon); ödeme: `order.transactions[]`'dan yöntem çevirisi ve taksit (`installmentCount > 1` → "N Taksit", yoksa `singlePaymentText`), kart son 4 hane.
- Özet: ara toplam, kargo, indirim (kupon kodu), toplam (`taxIncludedText`).
- **İade talebi** (`RefundRequest`): buton `getIkasOrderRefundableItems(order).length > 0` iken görünür (admin'de iade bölümü açık + satır durumu FULFILLED/UNFULFILLED/DELIVERED + gün sınırı). Panel: satır başına adet seçimi (`setOrderLineItemRefundQuantity(value, item)`), admin'in `refundDesc` metni, `refundNoticeText` (kişiye özel ürün kısıtı) + İptal ve İade Şartları PAGE linki, gönder → `refundOrder(customerStore, order)` (boolean; `order` yerinde güncellenir). **API'de iade nedeni ve açıklama alanı yok**; neden istenecekse İletişim formuna link verilir. Mevcut iade satırları `getIkasOrderRefundedItems(order)` ile paket durumu çipiyle gösterilir.

**Adresler (ADDRESSES)**
- Liste: `customer.addresses` kartları (başlık, ad soyad, `getCustomerAddressText`, telefon), `isDefault` ise rozet, Düzenle / Sil (Sil → onay `Dialog`; `deleteCustomerAddress(customerStore, address)`). Boş durum + "Yeni adres ekle". Liste observable; kaydet/sil sonrası kendiliğinden yenilenir.
- Form (`AddressForm`, `Dialog` içinde): `getEmptyAddressForm(customerStore)` / `getIkasCustomerAddressForm(address)` → `await initAddressForm(form, address)` (ülke formatı ve il/ilçe listeleri; `addressFormat` gelene kadar iskelet). `title` her zaman ayrı ve zorunlu; satırlar `addressFormat` matrisinden (`firstName, lastName, identityNumber, addressLine1/2, postalCode, country, state, city, district, region, phone`), `country/state/city/district` select (`*Options`, `isLoading`), `city/district` `isFreeText` ise metin. Setter'lar `setAddressForm<Alan>(form, value)`; ülke/il değişince alt listeler SDK tarafından yenilenir. Kaydet → `submitAddressForm(form)`; iptalde `clearIkasCustomerAddressForm(address)`. **Varsayılan adres seçme API'de yok**, düğme konmaz.
- TC kimlik ve telefon zorunluluğu ikas checkout ayarından gelir; `field.isRequired` ile yıldız, hata `field.hasError` (metin bizim TEXT prop'larımız).

**Favoriler (FAVORITE_PRODUCTS)**
- `getFavoriteProducts(customerStore)` (en fazla 100, sayfalama yok) → grid (`FavoriteCard`: `getProductVariantMainImage` görseli, ad, `getProductVariantFormattedFinalPrice` (+ indirimli üstü çizili), "Tasarla" linki `getSelectedProductVariantHref`, kalp/kaldır). Kaldır: `removeIkasProductFromFavorites` + local listeden düş. Boş durum + "Koleksiyonu İncele" (PAGE link prop).
- "Sepete ekle" yok: ürünün opsiyon seti var, `addItemToCart` `INVALID_PRODUCT_OPTION_VALUES` verir; kart konfigüratöre götürür.

### 3.3 İş sırası

1. Bu dokümanın §3'ünü kullanıcıyla onayla. Karar gerekli: (a) sipariş satırındaki fotoğraflar için "Fotoğrafı indir" düğmesi olsun mu (`downloadFile`, imzalı S3 URL; ROADMAP'teki 403 açık ucunu kapatır)? (b) Profilde "Verilerimi indir" (`exportCustomerPersonalData`) eklensin mi? (c) İade talebinde neden alanı API'de yok — İletişim formuna link yeterli mi?
3. CLI: `AccountPage` section + prop grupları (create.mjs kalıbı, JSON prop dosyası). Gerekirse enum yok.
4. Ortak parçalar: `Dialog`, `AccountNav`, `OrderLine`, `pageLink` genişletme.
5. Paneller sırasıyla: Profil (+silme) → Siparişler → Sipariş detayı (+kargo, +iade) → Adresler → Favoriler. Her panelden sonra `check --json`.
6. `build` + `import_section`; hazır `account` grubunu kapat, 5 sayfayı `create_page` ile aç, Header · AccountPage · Footer yerleştir, prop'ları doldur (`add_sections_to_page` + updates).
7. Yayın (kullanıcı) → test §3.4. ROADMAP Durum/Açık uçlar + Kimlikler güncelle. Commit kullanıcı isteyince.

### 3.4 Test listesi (yayında, test müşterisiyle)

- Girişsiz `/account/*` → `/account/login?redirect=…`, girişten sonra geri dönüş.
- Profil: ad/soyad/telefon güncelleme kaydediliyor (admin'de görünür), e-posta kilitli, hata bandı.
- Siparişler: boş durum; **bir test siparişi** (konfigüratörden, kupon ile) verilip listede ve detayda sikke özeti, küçük resim, opsiyon listesi, adres, toplamlar; kargo bilgisi admin'den kargo girildikten sonra.
- İade: uygun olmayan durumda buton yok; uygun durumda talep gönderimi (kullanıcı onayı) ve admin'de görünmesi.
- Adresler: ekle (il/ilçe listeleri), düzenle, varsayılan yap, sil (onay).
- Favoriler: ürün sayfasından favoriye ekle → listede; kaldır.
- Hesap silme: **ayrı test hesabıyla** yanlış şifre hatası, doğru şifreyle silme → çıkış → ana sayfa.
- Sekmeler masaüstü/400px, Day/Night, klavye (dialog odak tuzağı, Esc), `prefers-reduced-motion`.

### 3.5 API notları (doğrulandı, bp-storefront 2.9.1)

Hepsi `@ikas/bp-storefront`. "[SDK]" = paket kaynağından, MCP dokümanında yok.

- **Kapı:** `waitForCustomerStoreInit(customerStore)` sonra `customerStore.customer` (alanlar: `firstName, lastName, email, phone, isEmailVerified, orderCount, addresses`). `logout(customerStore)` async, yönlendirmez. Sayfa tipi: `baseStore.currentPageType` [SDK]. `Router.navigateToPage("LOGIN", undefined, { redirect })`.
- **Siparişler:** `getOrders(customerStore): Promise<IkasOrder[]>` (sayfalama yok, store'a yazmaz). Yardımcılar: `getIkasOrderFormattedTotalFinalPrice`, `getIkasOrderTotalItemCount`, `getIkasOrderFormattedOrderedAt`, `getIkasOrderPackageStatusTranslation` (yalnız paket durumu çevrilir; `IkasOrderStatus` için çeviri yok → TEXT prop eşlemesi), `getIkasOrderHref`, `getIkasOrderDisplayedAdjustments` + `getOrderAdjustmentFormattedAmount` / `getOrderAdjustmentDisplayName`, `getIkasOrderFormattedShippingTotal`, `getIkasOrderCouponAdjustment`. Durum renk şablonu: `IkasOrderPackageStatus` (22 değer).
- **Detay:** `getOrderDetailsOfPage(customerStore): Promise<IkasOrder|null|undefined>`; ayrıca `getOrder(customerStore, id)`. Satır: `IkasOrderLineItem` (`options: IkasOrderLineItemOption[]` → `{name, type, values: [{name, value, price}]}`; FILE/IMAGE'da `value` ham S3 URL'si, `downloadFile(value)` imzalı indirir). Satır yardımcıları: `getOrderLineItemFormattedFinalPriceWithQuantity`, `getOrderLineItemFormattedPriceWithQuantity`, `hasOrderLineItemDiscount`, `getIkasOrderLineVariantMainImage`, `getIkasOrderLineVariantHref`. Adres: `IkasOrderAddress` + `getOrderAddressText`. Ödeme: `order.paymentMethods[]`, `order.transactions[]` (`getOrder` doldurur; `paymentMethodDetail.installment.installmentCount`, `lastFourDigits`), `getOrderTransactionPaymentMethodTranslation`.
- **Kargo:** `getIkasOrderDisplayedPackages(order): IkasDisplayedPackage[]` (`orderPackageNumber, orderPackageFulfillStatus, statusTranslation, orderLineItems, trackingInfo: {cargoCompany, trackingNumber, trackingLink, barcode}`).
- **İade:** `getOrderRefundSettings(customerStore)` (`getOrder` zaten çağırır; `_refundSettings.refundDesc` gösterilebilir), `getIkasOrderRefundableItems(order)`, `setOrderLineItemRefundQuantity(value, item)` (değer önce!), `getOrderLineItemRefundQuantity(item)`, `refundOrder(customerStore, order): Promise<boolean>`, `getIkasOrderRefundedItems(order)`. `isIkasOrderRefundable(order)` yalnız adet seçildikten sonra true olur (gönder düğmesinin durumu için). Neden/açıklama girişi yok.
- **Adresler:** `getEmptyAddressForm`, `getIkasCustomerAddressForm`, `clearIkasCustomerAddressForm`, `initAddressForm(form, address?)` async, `submitAddressForm`, `deleteCustomerAddress(customerStore, address)`, `getCustomerAddressText(address)`. Setter'lar: `setAddressFormTitle/FirstName/LastName/IdentityNumber/AddressLine1/AddressLine2/PostalCode/Country/State/City/District/Region/Phone/Company/TaxOffice/TaxNumber`. Form alanları `IkasFormItem` (`value, label, isRequired, hasError, message`), `country/state` `IkasFormAsyncItem` (`isLoading`), `city/district` `IkasFormFreeText` (`isFreeText`). Varsayılan adres API'si yok.
- **Favoriler:** `getFavoriteProducts(customerStore)`, `isFavoriteIkasProduct`, `removeIkasProductFromFavorites`, `addIkasProductToFavorites` (giriş ister), kart: `getSelectedProductVariant`, `getProductVariantMainImage`, `getDefaultSrc`, `createMediaSrcset`, `getSelectedProductVariantHref`, `getProductVariantFormattedFinalPrice`, `hasProductVariantDiscount`, `getProductVariantFormattedPrice`.
- **Profil:** `getAccountInfoForm`, `initAccountInfoForm` async, `setAccountInfoFormFirstName/LastName/Phone/IsMarketingAccepted`, `submitAccountInfoForm` (ad, soyad zorunlu; `subscriptionStatus` her zaman gönderilir). Şifre değiştirme formu **yok**. Hesap silme: `getDeactivateCustomerForm`, `initDeactivateCustomerForm` (sync), `setDeactivateCustomerFormPassword`, `submitDeactivateCustomerForm`, sonra `logout`. `exportCustomerPersonalData` var (istenirse "verilerimi indir").
- **Genel:** `I18n` çevirileri yalnız SDK'nın kendi anahtarlarında çalışır; kullanıcı metni TEXT prop. Formlar store'da tekil önbellek; sekme değişiminde `init*` yeniden çağrılmalı (eski başarı bandı kalmasın). Fiyat biçimi sipariş para biriminden (admin "₺ 22,000.00" açık ucu burada da görünür).

### 3.6 Uygulama (Faz 10c)

Kararlar (faz başında, kullanıcı): (a) sipariş satırındaki fotoğraflar için "Fotoğrafı aç" düğmesi **var**, (b) profilde "Verilerimin kopyasını gönder" (`exportCustomerPersonalData`, e-postaya gider) **var**, (c) iade nedeni için İletişim formuna link **yeterli**.

`AccountPage` (`wnbxmerd-ifgtExD5te`, 159 prop, 14 grup). Metin varsayılanları `src/utils/account-texts.ts`'te (`ACCOUNT_TEXTS`, config `defaultValue`'larıyla aynı; yeni TEXT prop eklenirse ikisine de yazılır). Alt bileşenler `t: AccountTexts` alır. Yerleştirmede editör tüm varsayılanları kendisi yazdı; yalnız 4 LINK prop'u elle verildi.

Plandan sapmalar ve SDK bulguları:
- **Fotoğraf:** `downloadFile` imzalı adresi alıp `<a download>` tıklatıyor; S3 başka alan adında olduğu için `download` yok sayılır ve sekme dosyaya gidebilir. Aynı storefront işlemi (`getOrderLineFile`, gövde `{ input: { url } }`) `src/utils/storefront-api.ts`'te çağrılıyor; tıklamada boş sekme açılıp adres gelince oraya yönlendiriliyor (açılır pencere engelleyicisi async sonrası `window.open`'ı engelliyor). `option-file-upload.ts` de aynı `storefrontPost` yardımcısını kullanıyor.
- **Hesap silme:** form yardımcısı yerine `deactivateCustomer(customerStore, password)` doğrudan; "bekleyen talep var" (`customer_deactivation_request_already_exists`) ancak API hata metninden ayırt ediliyor. Başarıda mesaj ~1,8 sn görünür, sonra `logout` + INDEX. API adı "deactivation request": silme anında mı yoksa onayla mı olduğu yayında görülecek.
- **Adres formu:** `getEmptyAddressForm` ve `getIkasCustomerAddressForm` formu kendileri başlatıp observable döndürüyor; ayrıca `initAddressForm` çağırmak iki init'i yarıştırır. Yalnız `form.isInitialized` beklenir (iskelet). Düzenleme formu store'da önbellekte; kapatınca `clearIkasCustomerAddressForm`. SDK doğrulaması başlık, ad, soyad, adres, ülke, il, ilçe, mahalleyi kontrol ediyor; telefon ve TC'yi kontrol etmiyor (API reddederse `addressErrorText`).
- **Durum çipi:** ikas `statusTranslation` çevirisi yüklenmemişse ham anahtar döndüğü için hiç kullanılmıyor. 22 paket / 16 satır / 8 sipariş durumu `src/utils/order-status.ts`'te dokuz gruba iner (Hazırlanıyor, Kargoya Verildi, Teslim Edildi, İptal Edildi, İptal Talebi Alındı, İade Sürecinde, İade Edildi, Talep Reddedildi, Teslim Edilemedi), metinler TEXT prop.
- **Ödeme yöntemi:** `getOrderTransactionPaymentMethodTranslation` çeviri anahtarı dönerse `paymentGatewayName`'e düşülür; kart "Banka · •••• 1234", taksit `installmentText` / `singlePaymentText`.
- **Kargo:** satırlar paket paket gruplanmadı; ürünler tek kartta, "Kargo Takibi" kartında her paket için durum + (birden çok paketse) paket no ve içindeki ürün adları + takip kutusu. Yalnız `shippingMethod === "SHIPMENT"` siparişlerde.
- **İade:** iade edilebilir satırlar `Dialog` içinde adet seçimiyle; `refundDesc` (admin metni) varsa gösterilir. `getIkasOrderRefundableItems` iade ayarı yüklenmemişse (`_refundSettings` null) tüm uygun satırları döndürür; detay `getOrderDetailsOfPage` → `getOrder` ile ayarları yüklediği için sorun değil.
- **Editör:** `IkasStorefrontConfig.isEditor` iken girişsiz ziyaretçi yönlendirilmez, "Giriş yapman gerekiyor" kartı görünür (editörde müşteri yok, paneller yalnız yayında görülür).
- Favori sayısı `getFavoriteProductsIds` ile (ürünlerin tamamı çekilmez).
- **Adres alanları (TR):** ikas'ın Türkiye formatında `state` yok; `city` = il (81), `district` = ilçe, `region` = mahalle. Etiket varsayılanları buna göre (Eyalet / İl / İlçe / Mahalle). Mahalle listesi gelmezse alan gizlenir: serbest metin kaydedilmiyor (ikas id bekliyor).
- **Telefon:** SDK'nın telefon doğrulaması "12" gibi değerleri geçiriyor, API de kabul ediyor; `phoneError` pratikte görünmüyor.
- **Gezinme:** `Router.navigateToPage` tam sayfa yüklemesi yapıyor (SPA değil); her sekme section'ı yeniden kurar.

Yayın testi (2026-09-14, `3svte-dev-monoart.myikas.com`, ozenmain hesabı; sipariş yok):
- ✅ Hesabım: form müşteri verisiyle doluyor, zorunlu ad hatası + odak, "Kaydediliyor…" → başarı bandı, yenilemede veri kalıcı. Linkler (sekmeler, sayaçlar, şifre sıfırlama) doğru.
- ✅ Siparişlerim boş durumu + "Atölyeye Git" `/#atolye`; olmayan sipariş id'si → "Bu sipariş bulunamadı" + geri linki.
- ✅ Favoriler: boş durum + Koleksiyon linki; API ile eklenen Sikke Kolye kartı (görsel, fiyat, "Tasarla" → ürün sayfası) ve kalp ile kaldırma.
- ✅ Adresler: boş durum, form (Türkiye seçili, 81 il, il → ilçe zinciri), zorunlu hatalar + ilk hataya odak, ekleme, ön dolu düzenleme, Esc ile kapanan ve onayla silen pencere, kaydırma kilidinin kalkması. Test adresi silindi.
- ✅ Hesap silme penceresi: şifre alanına odak, boş şifre hatası, Tab döngüsü, Esc. API çağrısı yapılmadı.
- ✅ Gece modu, 400px (çip şeridi, taşma yok, adres penceresi alttan panel).
- ✅ Çıkış → ana sayfa; girişsiz `/account/orders` → `/account/login?redirect=%2Faccount%2Forders`.
- Bulunup düzeltilenler (yeniden yayın bekliyor): adres etiketleri (il/ilçe kaymıştı), serbest metin mahalle alanı, adres formu açılınca ilk alana odak, gece modunda soluk metin kontrastı.
- ✅ Girişten sonra `?redirect` dönüşü (Giriş → `/account/orders`).
- Favoriler kullanıcı kararıyla gizlendi: `showFavorites` (BOOLEAN, varsayılan kapalı) menüdeki sekmeyi ve Hesabım'daki sayacı kaldırır; panel ve sayfa durur.
- Kalan: veri kopyası e-postası, sipariş listesi/detayı/kargo/iade (test siparişi gerekiyor), gerçek hesap silme (ayrı test hesabı).
