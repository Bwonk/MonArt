# MonArt — Yol Haritası ve Oturum Devri

Bu dosya, her yeni sohbetin **ilk okuyacağı** yerdir. Proje tek bir uzun sohbette değil, faz faz ayrı sohbetlerde ilerler. Her faz bitince bu dosyadaki **Durum** tablosu ve **Açık uçlar** listesi güncellenir, sonra commit edilir.

---

## 0. Yeni sohbete nasıl başlanır

Bu dosya `CLAUDE.md` içindeki import sayesinde her yeni oturumda otomatik yüklenir. Dosya atmaya veya uzun mesaj yazmaya gerek yok. Yeni sohbeti proje klasöründe (`~/orca/projects/MonArt`) aç ve yalnızca şunu yaz:

```
Faz N'e başlayalım.
```

**Her fazda izlenecek akış** (Claude bunu kendiliğinden uygular):
1. Fazın "Okunacaklar" listesindeki dosyaları incele.
2. Kısa bir faz planı yaz, fazdaki "Karar gerekli" maddelerini sor ve onay al.
3. Onaydan sonra kodu yaz, `check --json` ve `build` çalıştır, editor'a yerleştir.
4. Faz bitince bu dosyadaki Durum ve Açık uçlar tablolarını güncelle.
5. Commit ve push yalnızca kullanıcı isteyince.

Oturumdan önce senin terminalinde (sıra önemli):

```
npx ikas-component dev      # önce bu, 5201 portunu tutar
ikas theme dev              # sonra bu, tünel açar ve editor URL'si verir
```

Editor URL'sini tarayıcıda açık tut. MCP editor araçları ancak editor bağlıyken çalışır.

---

## 1. Durum

| Faz | Kapsam | Durum |
|---|---|---|
| 0 | Design token'ları (`src/global.css`), tema global'leri, Day/Night şemaları | ✅ bitti |
| 1 | Header, Footer, CartDrawer, LanguageSwitcher, NewsletterForm, Icons | ✅ bitti |
| 2 | Hero + SeriesCard, OriginStory, BespokeCall, Faq + FaqItem | ✅ bitti |
| 3 | CoinConfigurator (canvas, iki yüz, hediye/redeem, mühür ve foto rehberi modalları) | ✅ bitti |
| 4 | Konfigüratör canlı test + ürün bağlama + ürün sayfası | ✅ bitti (fotoğraf yükleme ve sipariş satırı elle testi Faz 11 QA'ya ertelendi) |
| 5 | Koleksiyon galerisi + Lightbox | ✅ bitti (yayın önizlemesinde uçtan uca test edildi) |
| 6 | Sepet sayfası + drawer'da kişiselleştirme özeti | ✅ bitti (editör önizlemesinde masaüstü, 380px, Day/Night, kupon ve adet test edildi) |
| 7 | Statik içerik sayfaları: Hakkımızda, SSS, 7 hukuki doküman + Görsel Hakları | ✅ bitti (editörde masaüstü, 380px, Day/Night; yayın önizlemesinde metinler, link akışları, Night düzeltmeleri ve yan menü aktif vurgusu — masaüstü ve 400px çip kayması — doğrulandı) |
| 8 | Formlar: İletişim + Özel Tasarım talebi | ✅ bitti (editör önizlemesinde masaüstü, 380px, Day/Night, doğrulama, klavye ve iki formun gönderimi test edildi; panelde mesajın görünmesi ve görselli talep kullanıcı testi bekliyor) |
| 9 | Marka Elçileri sayfası: tanıtım + başvuru formu | ✅ bitti (editör önizlemesinde masaüstü, 380px, Day/Night, doğrulama ve telefonsuz gerçek gönderim test edildi; e-postadaki mesaj biçimi kullanıcı kontrolü bekliyor) |
| 10 | Hazır hesap sayfaları + 404 | ⏳ |
| 11 | Link bağlama, dil routing'leri, QA, yayın | ⏳ |

---

## 2. Referans kaynaklar

| Dosya | Ne için |
|---|---|
| `CLAUDE.md` | ikas Code Components kuralları, CLI komutları, MCP araçları |
| `docs/reference-inventory.md` | Referans sitenin tüm global'leri, sayfaları, bileşenleri ve ikas eşlemesi |
| `docs/theme-globals.md` | Oluşturulan tema renkleri, tipografi, breakpoint, keyframe id'leri |
| `docs/configurator-logic.md` | Konfigüratörün tam mantık spesifikasyonu |
| `docs/configurator-admin-setup.md` | Konfigüratör için admin'de kurulacak ürün, varyant, opsiyon seti ve kuponlar |
| `docs/collection-gallery.md` | Koleksiyon galerisi spec'i: prop yapısı, lightbox, `?seri=` ve konfigüratör parametreleri |
| `docs/forms.md` | İletişim, Özel Tasarım ve Elçi başvurusu formları: ikas iletişim formu API'si, mesaj biçimi, doğrulama, opsiyon üzerinden görsel yükleme |
| `reference/MonArtDEMO_clean/` | Statik prototip (git dışında). Ana dosyalar: `MonArt Lux.html`, `monart-lux.js`, `monart-lux.css`, `monart-bespoke.js` |
| `~/.claude/plans/ilk-nce-users-yigitozen-orca-projects-mo-sharded-umbrella.md` | Faz 2 sonrası doküman düzeltme planı |

---

## 3. Değişmez kurallar

Bunlar önceki fazlarda hata yapılıp düzeltilen konular. Her fazda geçerli.

**ikas / CLI**
- `ikas.config.json`, `types.ts`, `global-types.ts`, `src/components/index.ts` elle düzenlenmez. Bileşen ve prop yalnız `npx ikas-component config ...` ile eklenir.
- Kullanıcıya görünen her metin TEXT prop'tur, varsayılan değeri Türkçe referans metnidir.
- Storefront API'si kullanmadan önce MCP'den doğrula (`get_function_doc`, `get_model_guide`). İmza tahmin edilmez.
- Her fazın sonunda `npx ikas-component check --json` ve `npx ikas-component build` temiz olmalı.
- Parent, COMPONENT_LIST child'larının prop değerlerini okuyamaz. Sekme başlığı, URL parametresi gibi parent'ın bilmesi gereken sabit sayıda öğe section üzerinde düz prop olarak tutulur, editörde prop grubuyla ayrılır (CoinConfigurator, CollectionGallery).

**CSS**
- Yalnız class seçici kullan. CSS derlemede `.cc_<id>` ile scope'lanır.
- `global.css` içindeki `@keyframes` adları derlemede prefix alır. Bileşen CSS'i global keyframe adını kullanamaz, `.mon-anim-*` utility class'larını kullanır. Bileşenin kendi `@keyframes`'i sorunsuzdur.
- Alt bileşen CSS'inde `.mon-night` gibi bağlam seçicisi çalışmaz. `--heading`, `--gold` gibi token'lar kullanılır.
- Breakpoint: `@media (max-width: bp(5pw2fQi7Yr))` (860px, ana mobil) ve `bp(5Xmvk6D0gV)` (640px). Diğer id'ler `docs/theme-globals.md`'de.
- `.mon-btn`, `.mon-field`, `.mon-card`, `.mon-eyebrow`, `.mon-panel`, `.mon-backdrop` gibi utility'ler `global.css`'te hazır, yeniden yazılmaz.
- Vitrinde başlık öğeleri (`h1`–`h4`) inline davranabiliyor; önünde veya arkasında inline/inline-flex öğe (buton, ikon, eyebrow) varsa aynı satıra biniyor. Başlık class'ına `display: block` ver (Faz 4'te SealModal, BespokeCall ve SeriesCard böyle düzeltildi).
- Büyük görselde (lightbox vb.) `srcset`'in doğal genişliğine güvenme. CDN küçük kaynağı büyütmediği için görsel olduğundan küçük çiziliyor. Boyutu kapsayıcıdan ver: `width/height: 100%; object-fit: contain`.
- COMPONENT_LIST child'ının (FaqItem, SeriesCard) wrapper'ı global token'ları gündüz değerine sıfırlar; parent'ın gece paleti child'a inmez. Child kökünde de `useSectionTheme()` className ve style'ı uygulanır (Faz 7'de düzeltildi).
- Section'lar arasında boşluk için `margin` kullanma: gece modunda aradan sayfanın beyaz zemini görünür. Boşluk `padding` ile verilir (Faz 7'de Footer düzeltildi).
- Tarayıcıya özgü değerleri (URL, localStorage) ilk render'da okuma; `useState` boş/varsayılanla başlasın, değer `useEffect`'te set edilsin. Hydrate mevcut DOM attribute'larını yamamaz, ilk render'da farklı değer okunursa fark hiç görünmez (Faz 7 LegalPage aktif vurgusu).
- Ortalı büyük başlıkta tireli kelime ("Co-Creation") tireden bölünüyor. Kelimeyi `white-space: nowrap` bir span'a al (Faz 9 AmbassadorProgram).
- Grid öğesi sütunundan genişse `justify-self: center` onu başa hizalıyor. Ortalamak için negatif yatay margin kullan: `margin-inline: calc((100% - <genişlik>) / 2)`.

**Tema**
- Varsayılan şema Day (fildişi), ikincisi Night.
- Her section kökü `useSectionTheme()` (`src/utils/theme-mode.ts`) ile className ve style alır.
- Renk slot'ları için `slotVar()` kullanılır (`src/theme-tokens.ts`). Slot CSS değişken adı slot id'sinden farklı harf büyüklüğündedir.

**Font ve dil**
- Yerel font dosyası yok. Tüm fontlar Google Fonts adıyla tema tipografi token'ıdır. Kufi yazı Reem Kufi (`Coin Script` token'ı).
- Dil sistemi referansın i18n script'i ile taşınmaz. ikas admin'de dil başına storefront routing kurulur. Kodda `baseStore.languageOptions` + `setLanguage()`, `IkasStorefrontConfig.routings`, `withRoutePrefix()` kullanılır. TEXT prop değerleri editor'da routing başına girilir.

**Dev ortamı**
- Port 5201 makinedeki tüm ikas projeleri tarafından paylaşılır. Editor araçlarından önce sahibini kontrol et:
  ```
  lsof -nP -iTCP:5201 -sTCP:LISTEN
  lsof -p <pid> | grep cwd      # ~/orca/projects/MonArt olmalı
  ```
- Editor'da import edilmiş yabancı bileşen MCP ile silinemez, Studio arayüzünden silinir.
- Sayfadan section kaldırmak (`remove_page_section`) kullanıcı onayı ister.
- Editör önizlemesinde link tıklaması sayfa değiştirmiyor. Sayfalar arası akışlar (URL parametresiyle açılış vb.) yalnız yayınlanmış önizlemede test edilebilir. `publish_theme` dry-run dahil izin ister.
- Kod değişikliği editöre `build` + `import_section` ile gider; section yeniden mount olur (açık lightbox/sekme sıfırlanır).
- `ikas-component dev` açıkken kaynak dosyadaki her değişiklik bağlı editöre de gider ve section'ları yeniden mount eder (başka oturumun değişikliği de). Önizlemede form doldururken kod değiştirme; doldurulmuş form sıfırlanır (Faz 8).

**Çalışma şekli**
- Yazışma Türkçe. Koddan önce kısa bir plan veya doküman, onaydan sonra kod.
- Karmaşık etkileşim mantığı ayrı bir spec dokümanında anlatılır.
- Commit ve push yalnızca istendiğinde. `reference/` asla commit edilmez.

---

## 4. Kimlikler

**Bileşenler** (`ikas.config.json` id'leri)

| Bileşen | Tip | id |
|---|---|---|
| Header | section (header) | `wnbxmerd-j4HS6I3Fd8` |
| Footer | section (footer) | `wnbxmerd-n3BlH2im0L` |
| Hero | section | `wnbxmerd-F3B4w1ciEC` |
| SeriesCard | child | `wnbxmerd-dYFA4bc8WZ` |
| OriginStory | section | `wnbxmerd-YkCgkgqJIM` |
| BespokeCall | section | `wnbxmerd-azSO30lWaH` |
| Faq | section | `wnbxmerd-94hk1Nk8b2` |
| FaqItem | child | `wnbxmerd-w7QzXBrKkP` |
| CoinConfigurator | section | `wnbxmerd-5HM2GavfPR` |
| CollectionGallery | section | `wnbxmerd-Cv0kAyhqw9` |
| CartPage | section | `wnbxmerd-0bOGxJFtlY` |
| LegalPage | section | `wnbxmerd-t47FaQ6XEn` |
| ContactForm | section | `wnbxmerd-ncdF4QsnHr` |
| BespokeRequest | section | `wnbxmerd-EXHqxAvbZ1` |
| AmbassadorProgram | section | `wnbxmerd-BFMxX7SqEq` |

Özel enum "Seri" (`roma` / `osmanli` / `misir`): `5rzSm7oLdF`. SeriesCard'ın `seriesKey` prop'u bunu kullanır.

**Ana sayfa** — page id `wufeVJGhGX`. Section sırası ve elementId'ler:

| Sıra | Section | elementId | Çapa |
|---|---|---|---|
| 0 | Header | `I2zu1VeMMs` | — |
| 1 | Hero | `1n5ZK6zfsP` | `#hero` |
| 2 | CoinConfigurator | `CnxvAPawqP` | `#atolye` |
| 3 | OriginStory | `jx3YNxWxTg` | `#craft` |
| 4 | BespokeCall | `ajCeAaRher` | `#ozel-tasarim` |
| 5 | Faq | `SSDqTUjaBE` | `#sss` |
| 6 | Footer | `qsO74gYFds` | `#iletisim` |

**Ürün sayfası** — page id `NnPJ9lYfHR` (PRODUCT). Sıra: Header `pqNSy4UC7g` · CoinConfigurator `vCT6WKmBTD` · Footer `Z6bMdp2VzT`. Konfigüratörün `product` prop'u `usePageData: true`; diğer 160 değer Ana sayfadan kopyalandı. `giftProduct` boş.

**Koleksiyon sayfası** — page id `zQWeWMtpEV` (CUSTOM, slug `koleksiyon`, vitrinde **`/pages/koleksiyon`**; CUSTOM sayfalar `/pages/<slug>` altında yayınlanır). Sıra: Header `E2CEgC1Ty0` · CollectionGallery `KmMWViHQSH` · Footer `tyvOc9iBPx`. Galerideki 12 sikke görseli konfigüratörün yüklü görselleriyle aynı id'ler. Ana sayfadaki Hero "Koleksiyonları İncele" butonu ve 3 seri kartı bu sayfaya gider (kartlar `?seri=` ekler). Footer'ın Koleksiyon sütunu da bağlı.

**Sepet sayfası** — page id `lBaF5XFhjB` (CART). Sıra: Header `mYelHbcKWW` · CartPage `uZr5rmv1FA` · Footer `w5yumDkrtk`. "Atölyeye Dön" (`continueLink`) EXTERNAL `/#atolye`; boşsa INDEX'e gider. Drawer ve sayfa aynı `CartLine` + `CoinCheckoutButton` sub-component'lerini ve `src/utils/cart-summary.ts` özetini kullanır. Özet, opsiyon adlarını `OPTION_CONTRACT` (`src/utils/ikas-options.ts`) varsayılanlarıyla eşler; konfigüratördeki "Opsiyon Sözleşmesi" prop'ları değiştirilirse sepet özeti eşleşmez. Satır küçük resmi tasarıma göre seçilir: konfigüratör sikke görsellerinin haritasını localStorage'a (`monart_artwork`, `src/utils/coin-thumbs.ts`) yazar, satır 1. yüzün seri/cinsiyet/büst/sarık ve materyal+kaplama bilgisiyle aynı görseli bulur; harita yoksa ürün görseline düşer. Her iki ürünün tüm varyantlarında yedek görsel olarak MA monogram sikkesi var (admin'den yüklendi; ödeme sayfası ve admin bunu gösterir).

**İçerik sayfaları (Faz 7)** — hepsi CUSTOM, vitrinde `/pages/<slug>`. Header ve Footer ortak (common) section; değerleri Ana sayfadaki yerleşimde tutulur, her sayfaya otomatik eklenir.

| Sayfa | page id | slug | Section'lar |
|---|---|---|---|
| Hakkımızda | `ytkXaJdSTQ` | `hakkimizda` | OriginStory `qOJkmSAuyz` · BespokeCall `1aU6fBOJpa` (Ana sayfa değerlerinin kopyası) |
| SSS | `oo5bBtJ1WP` | `sss` | Faq `67BccwoSlf` (10 FaqItem, Ana sayfa kopyası) |
| Mesafeli Satış Sözleşmesi | `vEjPFBNMLU` | `mesafeli-satis-sozlesmesi` | LegalPage `scbSmLz9RW` |
| KVKK & Görsel Gizliliği Politikası | `zp6v9sr7sa` | `kvkk` | LegalPage `X3uxT5UpyO` |
| Gizlilik Politikası | `CYw737k2W6` | `gizlilik-politikasi` | LegalPage `nB8iQpdxsX` |
| Teslimat & İade Koşulları | `4m35ejxS0Z` | `teslimat-ve-iade` | LegalPage `OP0w0iFxV2` |
| İptal ve İade Şartları | `uIC7lTSa2z` | `iptal-ve-iade` | LegalPage `sT0DGn2S06` |
| Hediye Sertifikası Şartları | `U20UofHczV` | `hediye-sertifikasi` | LegalPage `oc92cY1imV` |
| Bakım Rehberi | `RkFAJyKEeV` | `bakim-rehberi` | LegalPage `ttjsgzBC7O` |
| Kullanım Şartları (Görsel Hakları ve Sanatsal Tolerans) | `RGt1KkPkeN` | `kullanim-sartlari` | LegalPage `7pcWHVQXnw` |

Hukuki metinler referansın `LEGAL_DOCS`'undan (ve Kullanım Şartları i18n `terms_artwork_body`'den) birebir aktarıldı; gövde `<h2>` madde başlığı + `<p>`. Her LegalPage'in `navLinks` prop'unda 8 dokümanın PAGE linki var. Yan menüde aktif doküman `window.location.pathname` ile link href'i karşılaştırılarak bulunur. Editör önizlemesinde pathname `about:srcdoc` olduğu için vurgu yalnız yayında görünür. Footer'daki Yardım sütunu, 6 hukuki link, "Zanaat Hikayemiz", "Ustaya Sor" ve Header'daki "Hakkımızda" bu sayfalara PAGE linkiyle bağlı.

**Form sayfaları (Faz 8)** — CUSTOM, spec `docs/forms.md`.

| Sayfa | page id | slug | Section |
|---|---|---|---|
| İletişim | `f7IJM52GCz` | `iletisim` | ContactForm `EWmhW7xrzq` |
| Özel Tasarım | `FuhA9MUQOO` | `ozel-tasarim` | BespokeRequest `XqpBXzO0xd` (`product` = Sikke Kolye; görseller "Yüz 1 · Fotoğraf" opsiyonu üzerinden yüklenir) |

İki form da ikas iletişim formunu (`submitContactForm`) kullanır; konu, sipariş no, materyal ve görsel linkleri mesaj metnine `[İletişim]` / `[Özel Tasarım Talebi]` etiketli başlıkla yazılır. KVKK onay linki KVKK sayfasına PAGE linki. Header nav'daki "İletişim" ve "Özel Tasarım", Footer'daki "Bize Ulaşın", Ana sayfa ve Hakkımızda'daki BespokeCall butonu bu sayfalara bağlı.

**Marka Elçileri (Faz 9)** — CUSTOM, page id `WNMHBZ5MUH`, slug `elciler` (`/pages/elciler`). Section: AmbassadorProgram `RsdAcUoT6F`. Spec `docs/forms.md` §7. Kapsam yalnız tanıtım + başvuru formu; elçi girişi, panel, modeller ve sözleşme yok. Başvuru ikas iletişim formuyla `[Elçi Başvurusu]` başlığıyla gider (sosyal medya ve lokasyon başlıkta, vizyon gövdede; telefon isteğe bağlı). KVKK onay linki KVKK sayfasına, Footer alt bardaki "ambassadors" linki bu sayfaya PAGE linki. Referansın Atölye/kota, Quota ve Welcome modülleri atıldı; "Siparişlerim" Faz 10'da ikas hazır hesap sayfalarıyla karşılanır.

**Mağaza** — `dev-monoart.myikas.com`, storefront `a9b97462-bc96-4c36-87c0-1cf0d37313e9`, vitrin satış kanalı `ed3c0b49-3edd-4b05-acf5-3f0899e03cf5`. Kategori yok.

**Ürünler ve kurulum (Faz 4)**

| Kayıt | id | Not |
|---|---|---|
| Sikke Kolye | `8e1d8132-9bb2-40d3-9435-0e85d8ff06c8` | Materyal varyantları 22.000 / 90.000 / 160.000 ₺, stoksuz satış açık, slug `sikke-kolye` |
| Miras Hediye Sertifikası | `51d4f027-1757-41cf-95c5-5e81f40ba602` | Aynı varyant ve fiyatlar, opsiyon seti yok |
| Opsiyon seti "Sikke Kişiselleştirme" | `2e4b71d3-d3a8-41c2-9c08-e5418a1fd50e` | 21 opsiyon; Yüz 2 opsiyonları "2. Yüzü Kişiselleştir" seçilince aktif. Admin arayüzünden kuruldu |
| Kampanya "Miras Hediye Sertifikası" | `011ebc8c-839f-492f-8ee2-4aec8c4341a1` | %100, koşul "Ürünler: Sikke Kolye", Tüm Kişiler, TRY. Koşul, müşteri ve kur ayarı admin arayüzünden düzeltildi |
| Test kuponu | `MONETARTS-TEST-2026-0001` | Tek kullanımlık; ikas küçük harfle saklıyor. Editörde denendi, sepete uygulandı |

**ikas admin MCP** — `ikas-admin` sunucusu local kapsamda ekli (GraphQL köprüsü: `list`, `introspect`, `execute`). Ürün, varyant, fiyat, stok, kampanya ve kupon işlemleri var. **Opsiyon seti oluşturan işlem yok**; set admin arayüzünden kurulur, sonra `updateProduct` ile `productOptionSetId` bağlanabilir. Her `execute` çağrısında `operationName` listelenmiş bir işlem adı olmalı (ör. `listProduct`). Yazma işlemleri auto mode'da izin kuralı ister. **Kampanya kurmak için admin arayüzü daha güvenli:** `createCampaign` ile kurulan kampanyada `PRODUCT` filtresi arayüzde tanınmadı (ürün seçili görünmedi), müşteri kapsamı boş "Spesifik Müşteriler" ve kur listesi boş kaldı. Sonuç `COUPON_APPLIED_WITHOUT_DISCOUNT` hatasıydı; üçü arayüzden düzeltilince kupon çalıştı.

**Yüklenmiş görseller** — logo, logotype, 20 sikke görseli, foto rehberi ve hiyeroglif rehberi CDN'de. Id'ler Ana sayfadaki section değerlerinde (`get_section_values`). Yüklenmemiş referans görselleri: `quota-modal-hero.jpg`, `welcome_atolye.png`, `style-test-1/2/3.png`, iki `*_sakal_tone.png` (kullanılmıyor).

---

## 5. Açık uçlar

Önceki fazlardan kalan, ilgili fazda kapatılacak işler.

| Konu | Nerede | Kapanacağı faz |
|---|---|---|
| Fotoğraf yükleme editör önizlemesinde otomasyonla denenemedi (iç iframe). Kullanıcı elle test edecek: 5 MB/tür reddi, yükleme, sipariş satırında dosya URL'leri | CoinConfigurator | 11 (QA) |
| Test siparişi verilip sipariş satırında tüm opsiyon değerlerinin göründüğü kontrol edilmedi (Faz 4 bitti kriteri, kullanıcı elle yapacak) | CoinConfigurator | 11 (QA) |
| %100 kupon sepetteki **tüm** Sikke Kolye adetlerini sıfırlıyor. Gerçek sertifika için sertifika bedeli kadar Sabit Tutar indirim ya da adet sınırı seçilmeli | admin | 11 |
| Fiyatlar "₺ 22,000.00" biçiminde; mağaza para birimi biçimi admin ayarlarından TR'ye çevrilmeli | admin | 11 |
| "Kolyeni Tasarla" CTA'sı `#atolye` çapasına gitmeli | Hero | 11 |
| Footer'da INDEX'e giden tek link kaldı: "Tasarım Atölyesi" (`#atolye` çapası olmalı). Alt bar "ambassadors" Faz 9'da Elçiler sayfasına bağlandı | Footer | 11 |
| Hukuki metinler referanstaki kısa taslak. Mesafeli Satış'ta satıcı unvanı, adres, MERSİS/vergi no, iletişim ve ödeme/teslim bilgileri; KVKK'da veri sorumlusunun iletişim bilgisi ve başvuru yöntemi yok. Merchant/avukat tamamlamalı, sonra `updatedDate` doldurulmalı | LegalPage sayfaları | içerik |
| İçerik tutarsızlığı: SSS 4. soru "5 ila 15 iş günü", Teslimat ve Mesafeli Satış "10-15 iş günü" diyor | SSS / hukuki | içerik |
| Mobil menü paneli hiç açılmıyordu (Faz 1): global `.mon-drawer.is-open` panelin kendisini bekliyor, `is-open` ise kapsayıcıda. Header CSS'ine `.mon-menu.is-open .mon-menu__panel` kuralı eklendi; kapalı menü ve sepet çekmecesinin gölgesi sağ kenara taşıyordu, o da giderildi. Yayında doğrulandı (400px'te panel açılıyor, kapalı çekmeceler 120px dışarıda) — kapatılabilir | Header, CartDrawer | ✅ |
| Night modunda sayfa en üstteyken Header gri görünüyor: cam (glass) bar arkadaki beyaz body zeminini gösteriyor. Body'ye gece zemini verilmeli ya da gece modunda bar opak olmalı | Header | 11 (QA) |
| Hakkımızda ve SSS sayfalarında `h1` yok (OriginStory ve Faq başlığı `h2`) | SEO | 11 |
| Footer seri linkleri EXTERNAL `/pages/koleksiyon?seri=…`; dil routing prefix'i almaz | Footer | 11 |
| Ana vitrinde (`dev-monoart.myikas.com`) hâlâ eski tema var ve `<html lang="en">` dönüyor; büyük harfe çevrilen Türkçe metinde i → I oluyor. Bizim temanın önizlemesi `lang="tr"`. Ana temaya yayından sonra doğrula | tüm section'lar | 11 |
| Galeride 22 Ayar, Model ve Paketleme görselleri yok, yer tutucu görünüyor. Merchant yükleyecek; istenirse `showEmptyCells` kapatılır | CollectionGallery | içerik |
| Sepet sayfası "Atölyeye Dön" EXTERNAL `/#atolye`; dil routing prefix'i almaz | CartPage | 11 |
| İletişim formu mesajları admin panelinde görünmüyor (Gelen Kutusu'nda "ikas Form" kanalı "Yakında"); mesajlar mağaza sahibinin e-postasına geliyor — kullanıcı test mesajlarının geldiğini doğruladı. Merchant'a form mesajlarını e-postadan takip etmesi söylenmeli | admin / e-posta | bilgi |
| Özel Tasarım görselli gönderim yayında çalışıyor: 4 dosya 3+1 parça S3'e yüklendi (204), mesaj gönderildi (200), başarı ekranı açıldı; istemci kontrolleri (PDF/6 MB reddi, tekrar, 5 dosya sınırı, kaldır) doğrulandı. Kalan: e-postadaki görsel linklerinin merchant'ta açılması (anonim 403). Kullanıcı yükleme hatasını ve bucket erişimini ikas'a danışacak; sonuca göre yükleme kalır ya da WhatsApp/e-posta ile görsel isteme sürümüne geçilir | BespokeRequest | ikas yanıtı |
| **ikas `productOptionFileUpload` tarayıcıda çalışmıyor** (bp-storefront 2.9.1, S3'e elle `Content-Type: multipart/form-data` → 400 `MalformedPOSTRequest`). Konfigüratördeki fotoğraflar bu yüzden hiç yüklenmiyordu. `src/utils/option-file-upload.ts` ile aşıldı (konfigüratör + Özel Tasarım); konfigüratör eksik yüklemede artık sepete eklemiyor (`photoUploadErrorToast`). ikas SDK ekibine bildirilmeli; düzelince yardımcı kaldırılabilir | CoinConfigurator, BespokeRequest | ikas |
| Yüklenen dosyaların `optionUrl`'i imzasız S3 adresi ve 403 dönüyor (bucket kapalı). Özel Tasarım mesajındaki linkler merchant'ta açılıyor mu, kullanıcı panelden kontrol edecek; açılmıyorsa yükleme yerine WhatsApp/e-posta ile görsel istenir. Konfigüratör siparişinde dosyanın panelde açıldığı da test siparişinde görülmeli | BespokeRequest, CoinConfigurator | 8 sonu |
| Faz 9 test başvurusu ("Test Claude", test@ornek.com, `[Elçi Başvurusu]`) gönderildi, ikas kabul etti. Mağaza sahibinin e-postasında başlık satırının (Sosyal Medya Hesabı · Hedef Kitle Lokasyonu) ve vizyon bloğunun okunur geldiğini kullanıcı kontrol edecek. Footer "ambassadors" linkinin `/pages/elciler`'e gittiği yayında doğrulanacak | admin / Footer | 11 (QA) |
| Global `.mon-btn`'de `:focus-visible` stili yok; klavyede buton odağı görünmüyor. Formlarda yerel olarak eklendi, `global.css`'e genel kural konmalı | global.css | 11 (QA) |

---

## 6. Fazlar

### Faz 4 — Konfigüratör canlı test ve ürün bağlama

**Amaç:** Faz 3'te yazılan konfigüratörü gerçek ürünle uçtan uca çalışır hale getirmek.

**Ön koşul (kullanıcı):** `docs/configurator-admin-setup.md`'ye göre admin'de "Sikke Kolye" ürünü, Materyal varyantları, opsiyon seti, "Hediye Sertifikası" ürünü ve en az bir test kuponu kurulmuş olmalı.

**Okunacaklar:** `docs/configurator-admin-setup.md`, `docs/configurator-logic.md` §14, `src/components/CoinConfigurator/index.tsx`, `src/utils/ikas-options.ts`.

**İşler:**
1. `search_products` ile ürün id'lerini bul, Ana sayfadaki section'da `product` ve `giftProduct` prop'larını bağla.
2. Editor önizlemesinde `docs/configurator-admin-setup.md` §5 test listesini tek tek dene. Masaüstü ve 400px mobil genişlikte ekran görüntüsü al.
3. Bulunan hataları düzelt. Özellikle kontrol et: opsiyon adı eşlemesi, CHOICE değer seçimi, 2. yüz child opsiyonları, FILE yükleme, fiyat hesabı, kupon uygulama, sepet çekmecesinin açılması.
4. PRODUCT sayfası: ürün sayfası oluşunca konfigüratörü oraya da yerleştir. Section, sayfa ürününü `product` prop'u boşken otomatik almalı mı, karar ver ve uygula.
5. Canvas önizlemesinin küçük bir görüntüsünü sepet satırına eklemek gerekiyorsa değerlendir. Referansta sepet satırında sikke küçük resmi var.

**Bitti kriteri:** Test listesi geçiyor, sipariş satırında tüm opsiyon değerleri ve fotoğraf URL'leri görünüyor.

---

### Faz 5 — Koleksiyon galerisi

**Amaç:** Referanstaki galeri overlay'ini ayrı bir sayfaya taşımak.

**Okunacaklar:** `docs/reference-inventory.md` "Sayfa 2", `MonArt Lux.html` galeri bloğu (`id="gallery"`, satır ~1513–1570) ve lightbox (~1766–1784), `monart-lux.js` `openGallery`, `selectGalleryTab`, `openLightbox`…`lbChooseDesign` (satır ~1021–1250), `monart-lux.css` galeri ve lightbox kuralları.

**Referans içerik:** Sticky başlık, 3 seri sekmesi, seçili seriye göre hikâye kartı (eyebrow, başlık, "Miras Notu", 2 paragraf, 3 etiket), 3 materyal satırı × Bay/Bayan/Model/Paketleme grid'i, boş hücreler için yer tutucu, lightbox (önceki/sonraki, zoom, kaydırma, klavye, sayaç, "Bu Modeli Tasarla").

**ikas hedefi (öneri):**
- `CollectionGallery` section. Seri başına içerik için `GallerySeries` child (COMPONENT_LIST): sekme adı, hikâye metinleri, etiketler, görsel listesi.
- Görseller editoryal olduğu için ürün listesinden değil IMAGE prop'larından gelir.
- `Lightbox` sub-component.
- Yeni PAGE "Koleksiyon" (`create_page`), seri sekmesi URL parametresiyle seçilebilir (ör. `?seri=osmanli`).

**Karar gerekli:** "Bu Modeli Tasarla" konfigüratörü o seri ve cinsiyetle açmalı mı? Açacaksa CoinConfigurator URL parametresi okuyacak şekilde güncellenir.

**Bitti kriteri:** Seri kartları ve "Koleksiyonları İncele" CTA'sı galeri sayfasına bağlı.

---

### Faz 6 — Sepet sayfası

**Amaç:** CART sayfasını temaya uygun yapmak ve kişiselleştirilmiş satırları okunur göstermek.

**Okunacaklar:** `get_section_template("cart-section")`, `src/sub-components/CartDrawer`, `MonArt Lux.html` sepet drawer'ı (satır ~759–900), `docs/reference-inventory.md` "Sayfa 4".

**İşler:**
1. `CartPage` section: satır listesi, adet, sil, kupon alanı, ara toplam, ödeme butonu. Ödeme ikas'ın kendi checkout'u.
2. Satırda opsiyon özeti: referanstaki gibi "Seri · Cinsiyet · Materyal" başlığı ve "Ön: … · Arka: …" meta satırı. Sipariş satırı opsiyon değerlerinden türetilir.
3. Aynı özet mantığını `CartDrawer`'a da uygula. Ortak yardımcıyı `src/utils/` altına koy.
4. Boş sepet durumu, "Sikke Sikke Öde" butonu stili.

**Bitti kriteri:** Konfigüratörden eklenen ürün hem drawer'da hem sepet sayfasında okunur özetle görünüyor.

---

### Faz 7 — Statik içerik sayfaları

**Amaç:** Footer'daki içerik linklerinin gideceği sayfaları kurmak.

**Okunacaklar:** `monart-lux.js` `LEGAL_DOCS` (satır ~1973–2027) ve `openTerms` (~1945), `MonArt Lux.html` legal ve terms modal'ları (~1477–1510), `get_section_template("rich-text-section")`.

**Sayfalar:**
- Hakkımızda: mevcut `OriginStory` + `BespokeCall` section'ları yeniden kullanılır.
- SSS: mevcut `Faq` section'ı.
- Hukuki: Mesafeli Satış, KVKK, Gizlilik, Teslimat ve İade, İptal, Bakım, Hediye Sertifikası + Görsel Hakları ve Sanatsal Tolerans Politikası. Toplam 8 sayfa.

**ikas hedefi:** Tek bir `LegalPage` (veya `RichTextPage`) section: başlık, güncelleme tarihi, RICH_TEXT gövde, isteğe bağlı içindekiler. Her doküman ayrı PAGE, içerik referanstan birebir aktarılır.

**Bitti kriteri:** Footer'daki hukuki ve yardım linkleri gerçek sayfalara gidiyor.

---

### Faz 8 — İletişim ve Özel Tasarım formları

**Amaç:** Referanstaki iletişim ve özel tasarım modal'larını çalışan formlara çevirmek.

**Okunacaklar:** `MonArt Lux.html` contact modal (~1433–1476) ve bespoke modal (~1084–1163), `monart-bespoke.js`, `monart-lux.js` contact submit (~2063–2110), `get_framework_guide("form-handling")`, `get_function_doc("submitContactForm")`.

**Kısıt:** ikas iletişim formu yalnız ad, soyad, e-posta, telefon ve mesaj alanlarını gönderir. Referanstaki konu, sipariş no, materyal seçimi ve dosya yükleme alanlarının karşılığı yok.

**Karar gerekli (faz başında):**
- Konu, sipariş no ve materyal seçimi mesaj metnine eklenerek mi gönderilsin?
- Özel tasarım talebindeki dosya yükleme nasıl karşılanacak? Seçenekler: dosyasız form + WhatsApp veya e-posta ile görsel isteme, ya da FILE opsiyonlu sıfır fiyatlı bir "Özel Tasarım Talebi" ürünü.

**ikas hedefi:** `ContactForm` section (İletişim PAGE), `BespokeRequest` section (Özel Tasarım PAGE). BespokeCall butonu bu sayfaya bağlanır.

**Bitti kriteri:** İki form gönderiliyor, merchant panelinde mesaj görünüyor, başarı ekranı çalışıyor.

---

### Faz 9 — Marka Elçileri

**Karar gerekli (faz başında):** Bu sayfa yapılacak mı? Referansta başvuru formu, elçi girişi ve bir elçi paneli (istatistik, indirim kodu, sözleşme) var. Panel ikas'ta hazır karşılığı olmadığı için kapsam dışı öneriliyor.

**Okunacaklar:** `docs/reference-inventory.md` "Sayfa 3", `MonArt Lux.html` `id="ambassador"` bloğu (~1574–1765), `monart-lux.js` `openAmbassador`, `setupAmbassador` (~1043–1117).

**ikas hedefi (yapılırsa):** `AmbassadorProgram` section: tanıtım metni, arma, başvuru formu (Faz 8'deki iletişim formu altyapısıyla). PAGE "Elçiler".

---

### Faz 10 — Hesap sayfaları ve 404

**Amaç:** Giriş, kayıt, şifre, hesabım, siparişler, adresler ve favoriler sayfalarını temayla uyumlu hale getirmek.

**Okunacaklar:** `list_ready_made_pages` çıktısı, `docs/theme-globals.md`, `get_section_template("not-found-section")`.

**İşler:**
1. ikas'ın hazır sayfalarını etkinleştir (`enable_ready_made_pages`). Özel kod yazılmaz.
2. Paylaşılan kapsamda logo ve renkleri tema renklerine bağla (`update_ready_made_page_prop`, `patternValueId` ile).
3. Header'daki hesap ikonunun bu sayfalara gittiğini doğrula.
4. `NotFound` section ile 404 sayfası.

---

### Faz 11 — Link bağlama, dil, QA ve yayın

**İşler:**
1. Tüm INDEX'e giden linkleri düzelt: Hero CTA'ları, seri kartları, Footer kolonları, Header nav.
2. Dil: admin'de TR dışındaki diller için storefront routing'leri kurulduysa `LanguageSwitcher`'ı test et, gerekli TEXT prop'ları routing başına doldur, Arapça için `dir="rtl"` davranışını kontrol et.
3. QA: her sayfada Day ve Night şeması, 400px mobil, klavye ile gezinme, `prefers-reduced-motion`, konsol hataları. Faz 4'ten kalan elle testler (kullanıcı): konfigüratörde fotoğraf yükleme ve bir test siparişinde sipariş satırındaki opsiyon değerleri ile fotoğraf URL'leri.
4. SEO: sayfa başlıkları ve açıklamaları.
5. `publish_theme` ile yayın. Üretim yayını kullanıcının açık onayıyla yapılır.
