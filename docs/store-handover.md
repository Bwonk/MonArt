# Mağaza Devri — Temayı merchant'ın ikas mağazasına bağlama

Bu tema `dev-monoart.myikas.com` geliştirme mağazasında kuruldu. Gerçek mağazaya taşınırken **kod aynen
gider, mağaza verisi yeniden kurulur**. Bu doküman o devri adım adım anlatır ve hangi adımın araçla
otomatik yapılabileceğini, hangisinin admin arayüzü gerektirdiğini ayırır.

Ajan olarak bu dokümanı uyguluyorsan: `CLAUDE.md` kuralları geçerlidir — `ikas.config.json`, `types.ts`,
`global-types.ts` ve `src/components/index.ts` elle düzenlenmez; storefront API imzaları MCP'den doğrulanır;
her adımdan sonra `npx ikas-component check --json` ve `build` temiz olmalıdır. **Yazma işlemlerinde ve
yayında kullanıcı onayı al.**

---

## 1. Neyin taşındığı, neyin yeniden kurulduğu

| Taşınan (repo'da) | Yeniden kurulan (mağazaya özgü) |
|---|---|
| `src/` altındaki 22 bileşen ve alt bileşenler | Sayfa id'leri ve section `elementId`'leri |
| `ikas.config.json` prop şeması, özel enum'lar | Görsel id'leri (CDN'e yeniden yüklenir) |
| `src/global.css` token'ları ve utility'leri | Ürün / varyant / opsiyon seti id'leri |
| Prop **varsayılan** değerleri | Editördeki prop **değerleri** (655 TEXT/RICH_TEXT dahil) |
| Tema globalleri (tanım) | Tema globallerinin mağazadaki karşılıkları |
| — | Sayfa SEO alanları, mağaza ayarları, kargo/ödeme |

`docs/ROADMAP.md` §4 "Kimlikler" tablosundaki bütün id'ler **dev mağazasına aittir**, yeni mağazada geçersizdir.
Bileşen id'leri (`wnbxmerd-…`) `ikas.config.json`'dan geldiği için değişmez.

Değerlerin yedeği `backup/` altında durur ve `scripts/export-section-values.mjs` ile üretilir (§3.F).
**Dev mağazası kapanmadan önce bu yedeğin güncel olduğundan emin ol** — prop değerleri başka hiçbir yerde tutulmuyor.

---

## 2. Ön koşullar

1. Merchant'ın mağazasında tema oluşturulmuş ve `ikas theme dev` ile editör bağlanmış olmalı.
2. Kendi makinende sırayla: `npx ikas-component dev` (5201'i tutar), sonra `ikas theme dev`.
   Port 5201 makinedeki tüm ikas projelerince paylaşılır — sahibini doğrula:
   ```
   lsof -nP -iTCP:5201 -sTCP:LISTEN
   lsof -p <pid> | grep cwd      # bu projenin dizini olmalı
   ```
3. Devirden **önce** eski mağazadaki prop değerleri dışa aktarılmış olmalı (§3 adım F).

---

## 3. Runbook

### A. Tema globalleri — otomatik
`docs/theme-globals.md`'deki renk şemaları (Day varsayılan, Night ikincil), renk slot'ları, tipografi,
breakpoint ve keyframe id'leri yeniden kurulur: `create_theme_global`, `update_theme_color`,
`update_theme_color_scheme`, `update_theme_breakpoint`, `update_theme_keyframe`, `update_text_style`.

⚠️ Breakpoint id'leri CSS'e gömülü (`bp(5pw2fQi7Yr)` = 860px, `bp(5Xmvk6D0gV)` = 640px). Yeni mağazada
farklı id üretilirse ya aynı id'ler kurulmalı ya da bileşen CSS'lerindeki kullanımlar toplu güncellenmeli.
Aynısı renk slot'ları için de geçerli (`src/theme-tokens.ts` → `slotVar()`).

### B. Görseller — otomatik
`upload_images` ile toplu yükle, dönen id'lerden **eski id → yeni id** haritası çıkar. Yüklenecekler:
logo, logotype, 20 sikke görseli, foto rehberi, hiyeroglif rehberi, sikke yığını PNG (`btn_coin_stack.png`),
MA monogram halkası (404), ürünlerin yedek monogram görseli.

Galeride hâlâ eksik olanlar merchant'tan istenir: **22 Ayar, Model ve Paketleme** görselleri. Gelmezse
`CollectionGallery.showEmptyCells` kapatılır.

### C. Ürünler ve opsiyon seti — **admin arayüzü**
`docs/configurator-admin-setup.md`'yi uygula: "Sikke Kolye" (materyal varyantları, stoksuz satış),
"Miras Hediye Sertifikası", ve **"Sikke Kişiselleştirme" opsiyon seti (25 opsiyon)** — Zincir Uzunluğu ve
iki Portre Yönü opsiyonu dahil.

⚠️ **ikas admin MCP'sinde opsiyon seti oluşturan işlem yok.** Set arayüzden kurulur, sonra `updateProduct`
ile `productOptionSetId` bağlanabilir. Opsiyon **adları** `src/utils/ikas-options.ts`'teki `OPTION_CONTRACT`
ve konfigüratörün "Opsiyon Sözleşmesi" prop'larıyla birebir eşleşmeli; eşleşmezse sepet özeti bozulur.

Kampanya ve kupon da arayüzden kurulur — `createCampaign` ile kurulanlarda `PRODUCT` filtresi, müşteri
kapsamı ve kur listesi arayüzde tanınmadı (dev mağazasında `COUPON_APPLIED_WITHOUT_DISCOUNT` hatası verdi).

⚠️ Hediye sertifikası kampanyası dev'de %100 indirimdi ve sepetteki **tüm** Sikke Kolye adetlerini
sıfırlıyordu. Gerçek mağazada sertifika bedeli kadar **sabit tutar** indirim ya da adet sınırı seçilmeli.

### D. Hazır sayfa grupları — otomatik
`membership` ve `account` grupları **kapatılır** (`enable_ready_made_pages(false)`); yerine kendi
section'larımız kullanılır. Bir grubu kapatmak o grubun sayfalarını **siler**, sonra `create_page(pageType)`
ile boş sayfa açılır.

### E. Sayfalar — otomatik
`create_page` ile 10 CUSTOM sayfa (slug'lar ROADMAP §4'teki gibi: `koleksiyon`, `hakkimizda`, `sss`,
6 hukuki + `kullanim-sartlari`, `iletisim`, `ozel-tasarim`, `elciler`) ve 5 üyelik + 5 hesap sayfası.
CUSTOM sayfalar vitrinde `/pages/<slug>` altında yayınlanır.

### F. Section'lar ve prop değerleri — otomatik (hazırlık gerektirir)

1. `npx ikas-component build`, sonra her bileşen için `import_section`.
2. `add_sections_to_page` ile yerleştir (Header `index: 0`, section `index: 1`, Footer sonda).
3. Prop değerlerini **eski mağazadan aktar**. Devirden önce, eski editör bağlıyken:

   ```
   node scripts/export-section-values.mjs
   ```

   Bütün sayfaları gezip `backup/section-values-<tarih>.json` yazar. MCP'ye ihtiyaç duymaz —
   `ikas-component` CLI'sini doğrudan çağırır (MCP sunucusu da zaten onu çağırıyor).
   Dosyanın içinde her yerleşim için `elementId`, `componentId`, `name` ve `propValues` var;
   sonunda da `idInventory` bloğu: yeni mağazada yeniden eşlenecek **görsel**, **ürün**, **varyant**,
   **PAGE link hedefi** ve **göreli href** listeleri.

   Yeni mağazada `update_page_sections` ile geri bas; bu sırada `idInventory`'deki id'leri B (görsel)
   ve E (sayfa) adımlarında oluşan yeni karşılıklarıyla değiştir.

   ⚠️ **Varsayılanında bırakılmış prop'lar yedekte yoktur** — editör yalnız değiştirilen değerleri
   saklıyor. Sorun değil: varsayılanlar `ikas.config.json` ve bileşen kodunda, yani repo'da taşınıyor.
   Yedek "eksik" görünürse önce prop'un varsayılanına bak.

   ⚠️ Yedek prop **şemasını** taşımaz (her yerleşimde tekrarlanıp dosyayı dörde katlıyordu ve
   içindeki `writeExample` yer tutucuları id envanterini kirletiyordu). Şema `ikas.config.json`'da.

4. Header ve Footer **common** section'dır: değerleri INDEX sayfasındaki yerleşimde saklanır, bir kez
   yazılır, her sayfaya gider. Betik bunu tanıyıp bir kez yedekler, diğer sayfalarda `commonRef` bırakır.

⚠️ AccountPage metinleri **beş sayfada ayrı ayrı** saklanır; biri değişirse diğer dördüne de yazılmalı.

### G. Sayfa SEO — **admin arayüzü** (ROADMAP'teki B3 bulgusu)

**SEO tema kodunun işi değil.** ikas `<title>`, `<meta name="description">`, `og:*` ve `canonical`
etiketlerini kendisi basıyor; tema bunlara müdahale etmiyor. Dev mağazasında ölçülen durum:

```
TITLE: ''
<meta name="description" content="" />
<meta property="og:site_name" content="https://dev-monoart.myikas.com" />
<link rel="canonical" href="https://dev-monoart.myikas.com/pages/hakkimizda" />
```

Yani başlıklar **boş çünkü mağazadaki sayfa SEO alanları doldurulmamış**. Ürün sayfası başlığını ürün
verisinden aldığı için doluydu ("Sikke Kolye"). `og:site_name` mağaza adı yerine URL basıyor — mağaza
adı/SEO ayarları da girilmemiş.

Yeni mağazada doldurulacaklar:
- **Mağaza adı ve varsayılan SEO** (og:site_name'in düzgün basması için).
- **Her sayfanın** SEO başlığı ve açıklaması: 10 CUSTOM sayfa + Ana sayfa + Sepet + 404.
  Üyelik/hesap sayfaları arama motoruna kapalı olacağı için düşük öncelikli.
- Sayfa adları zaten girili (`Koleksiyon`, `Hakkımızda`, …) ama ikas bunları başlığa **düşürmüyor**,
  SEO alanı ayrı doldurulmalı.

MCP araçlarında sayfa SEO'su yazan bir işlem yok (`list_editor_pages` yalnız `id, name, pageType, slug`
döndürüyor), bu yüzden bu adım **elle ya da admin arayüzü üzerinden** yapılır.

### H. Mağaza ayarları — **admin arayüzü**

| Ayar | Not |
|---|---|
| Sosyal giriş (Google/Facebook) | Dev'de kurulu değildi, `SETTINGS_NOT_FOUND!` dönüyordu. Ya kurulmalı ya da `AuthLogin`/`AuthRegister`'da `showGoogle` / `showFacebook` kapatılmalı |
| İletişim formu e-postası | Mesajlar admin panelinde görünmüyor (Gelen Kutusu'nda "ikas Form" kanalı "Yakında"), mağaza sahibinin e-postasına düşüyor. Merchant'a söylenmeli |
| Dosya yükleme / S3 | Yüklenen opsiyon dosyalarının `optionUrl`'i imzasız S3 adresi ve anonim erişimde 403. Merchant panelden açabiliyor mu doğrulanmalı |
| Kargo, ödeme, vergi | Tema dışı, merchant kurar |
| Dil routing'leri | 6 dil (TR/EN/FR/IT/RU/AR). MCP'de routing yazan araç yok; arayüzden kurulur. Ayrıntı ROADMAP Faz 11d |

### I. İçerik ve hukuk — **merchant / avukat**

- **Hukuki metinler eksik:** Mesafeli Satış'ta satıcı unvanı, adres, MERSİS/vergi no, iletişim ve
  ödeme/teslim bilgileri; KVKK'da veri sorumlusunun iletişim bilgisi ve başvuru yöntemi yok.
  Tamamlanınca her LegalPage'in `updatedDate` prop'u doldurulmalı.
- **İçerik çelişkisi:** SSS 4. soru "5 ila 15 iş günü", Teslimat ve Mesafeli Satış "10-15 iş günü" diyor.

---

## 4. Devir sonrası doğrulama

`docs/qa-11b.md` §1'deki tarama aynen tekrar edilir — yöntemi orada anlatılıyor (yayın önizlemesinde
`javascript_tool` ile, 400px için aynı kaynaklı iframe). Kontrol edilenler: yatay taşma (1200/400px,
gündüz/gece), gece modunda açık zemin sızması, bozuk link, 6px köşe sistemi, `h1`, konsol hataları.

Ek olarak yalnız devirde anlamlı olanlar:
- Bütün PAGE linkleri **yeni** sayfa id'lerine gidiyor mu (Footer'ın 19 linki, hukuki yan menü, kayıt
  onay linkleri, hesap sayfası linkleri).
- Konfigüratördeki `product` / `giftProduct` yeni ürün id'lerine bağlı mı; sepete eklenen satırda
  opsiyonlar ve küçük resim doğru mu.
- Bu sefer **`<title>` dolu mu** (G adımı yapıldıysa).

---

## 5. Otomatikleştirilemeyenler ve nedeni

| İş | Neden |
|---|---|
| Product option set oluşturma | ikas admin MCP'sinde karşılığı yok |
| Sayfa SEO alanları | MCP'de yazma işlemi yok |
| Dil routing'leri | MCP'de routing işlemi yok; ayrıca çevirinin editöre routing başına nasıl yazılacağı henüz çözülmedi (ROADMAP Faz 11d) |
| Kampanya kurulumu | `createCampaign` ile kurulanda ürün filtresi/müşteri kapsamı/kur arayüzde tanınmadı |
| Sosyal giriş, kargo, ödeme | Mağaza ayarı |
| Editöre import edilmiş yabancı bileşeni silme | MCP ile silinemiyor, Studio arayüzünden silinir |
| Yayın (`publish_theme`) | Onay ister; üretim yayını açık kullanıcı onayıyla |
