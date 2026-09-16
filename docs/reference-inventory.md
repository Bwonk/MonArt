# MonArt Referans Site — Envanter ve Tasarım Sistemi

Kaynak: `reference/MonArtDEMO_clean/` (MonArt Lux statik prototip). Bu doküman ikas Code Components temasına taşıma için referans envanteridir.

> **Referans v2 (16.09.2026):** güncel referans `reference/MonArt2_clean/`. Bu envanter ilk sürümü anlatır; v2 farkları (portre yönü, zincir, sepet indirim kodu, 6px köşe sistemi, ödeme butonu, hukuki metinler, elçi paneli) `docs/reference-v2-changes.md` içinde.

## 1. Global'ler ve sayfa bazında bileşenler

### 1.1 Global'ler (her sayfada / her görünümde ortak)

| # | Global | İçerik | Kaynak |
|---|---|---|---|
| G1 | **Design token'ları** | Renk (`--black --dark --dark-2 --gold --gold-light --gold-pale --gold-dim --gold-deep --text --text-dim --text-muted --line --line-strong --ink --ink-soft`), gradyanlar (`--gold-grad --gold-grad-text --brushed-gold`), fontlar (`--f-deco --f-cinz --f-body --f-mono`), `--header-h: 84px`. Gündüz teması aynı tokenları override eder. | `monart-lux.css:14-46`, `:3449-3470` |
| G2 | **Fontlar** | Cinzel (display/başlık/fiyat), Montserrat (UI/gövde), Cormorant Garamond (fallback) — Google Fonts. AlphaKufi ise yerel bir ttf (`assets/alpha-kufi.ttf`, yalnız canvas Osmanlı yazısı). **ikas notu:** yerel font dosyası kullanılamaz; ikas tema tipografisi yalnızca Google Fonts adlarını kabul eder. Cinzel/Montserrat tema tipografi token'ı olarak yüklendi; AlphaKufi yerine Google Fonts **Reem Kufi** (`Coin Script` token'ı; alternatif: Reem Kufi Ink, Noto Kufi Arabic) kullanılır. | `MonArt Lux.html:14`, `monart-lux.css:6-12` |
| G3 | **Animasyon kütüphanesi** | 13 `@keyframes` (float, scrollPulse, shimmer, pricePop, sugReveal, consentShake, giftFade, nameSlotPulse, coinDepth, bspGoldPulse(Day), logoGoldSweep), easing paleti (`cubic-bezier(.2,.7,.2,1)` ana), süre standardı .25s, 11 `prefers-reduced-motion` bloğu | `monart-lux.css` |
| G4 | **Arka plan katmanı** | `.bg-grain` SVG feTurbulence (gece .22 overlay, gündüz .04 multiply), `.bg-glow` (kapalı), body bg `#000`/`#FFF` | `MonArt Lux.html:44-48`, `monart-lux.css:71-87` |
| G5 | **Tema (gece/gündüz)** | `body.theme-day` toggle, `localStorage monart_theme`, varsayılan gündüz; `#themeToggle` (ay/güneş) ve `#logoFlip` (sikke↔logo 3D flip) ikisi de tetikler | `monart-lux.js:1678-1686`, `monart-logo-switch.js` |
| G6 | **Header** (fixed 84px) | Sol: logo flip (`logo_coin.png` ↔ `logo_monetarts.png`). Orta: wordmark (gizli). Sağ: tema toggle, nav (Hakkımızda, İletişim, Özel Tasarım), dil dropdown (TR/EN/FR/IT/RU/AR), kese butonu + sayaç. Mobilde nav gizlenir. | `MonArt Lux.html:52-106` |
| G7 | **Footer** | Logotype + "Has Mücevher Sanatı"; 4 kolon: Koleksiyon (Roma/Osmanlı/Mısır → galeri), Atölye (Tasarım Atölyesi, Zanaat Hikayemiz, Ustaya Sor), Yardım (Kargo, İade, Bakım, Kullanım Şartları), İletişim (e-posta, Selçuklu/Konya, Salı–Cumartesi 11–19, "Bize Ulaşın"); `© MMXXVI · monetarts studio`; ambassadors linki; 6 hukuki link | `MonArt Lux.html:1384-1429` |
| G8 | **Dil sistemi (i18n)** | Referans: 6 dil, RTL (ar), 170 anahtar, `data-i18n / -html / -ph`, `monart:langchange` eventi, `localStorage monart_lang` — **bu mekanizma taşınmaz.** ikas'ta dil, admin panelde dil başına oluşturulan **storefront routing** ile yürütülür (locale, path öneki, domain, para birimi); kodda `IkasStorefrontConfig.routings` / `storefrontRoutingId` / `getCurrentLocale()`, `baseStore.languageOptions` + `setLanguage()`, `baseStore.localeOptions` + `setLocalization()`, `withRoutePrefix()`, `I18n.getLocale()`. Section TEXT prop değerleri editor'da routing başına girilir; RTL için section root'una `dir` attribute'u `I18n.getLocale()`'e göre verilir. Header'daki `LanguageSwitcher` bu yolla yazıldı. | `monart-i18n.js` (referans) · ikas: `@ikas/bp-storefront` |
| G9 | **Kese (cart drawer)** | Sağdan açılan panel; liste, boş durum ("Kesen henüz boş…"), toplam, "Sikke Sikke Öde :)" (SVG sikke yığını) | `MonArt Lux.html:759-900` |
| G10 | **Toast** | `#toast`, 2.4 sn | `MonArt Lux.html:1788` |
| G11 | **Global modal'lar** | Seal (mühür onayı), Checkout, Welcome, Bespoke (özel tasarım), Atelier (kota rezervasyon), Orders (siparişlerim), Quota, Photo Guide, Contact, Legal (7 doküman), Terms | `MonArt Lux.html:904-1317, 1433-1510` |
| G12 | **Lightbox** | Galeri görselleri için; prev/next, zoom, swipe, klavye, sayaç, "Bu Modeli Tasarla" | `MonArt Lux.html:1766-1784` |
| G13 | **Global state & sabit veri** | `APP` (materyal, yüzler, fiyat, hediye modu), `THEMES` (3 seri: limit, dateOn, büst/sarık/sakal opsiyonu, PNG matrisi), `MATERIALS` (925/14K/22K fiyat), `BACK_SURCHARGE`, `PLATING_PRICE`, `NAME_SUGGESTIONS`, `LEGAL_DOCS` | `monart-lux.js:24-98, 1973-2027` |
| G14 | **Asset kütüphanesi** | 22 sikke PNG (seri × cinsiyet × altın/gümüş × büst/sarık/sakal), 3 logo (logo_coin, logo_monetarts, logotype_monetarts), egyptian_glyphs_v2.webp, photo_guide_angles.jpg, quota-modal-hero.jpg, welcome_atolye.png, style-test-1/2/3.png. `alpha-kufi.ttf` **taşınmaz** (yerel font ikas'a yüklenemez; Google Fonts Reem Kufi ile değiştirilir) | `assets/` |
| G15 | **Erişilebilirlik / yardımcı** | `body.lock-scroll`, `aria-hidden`/`role=dialog` deseni, Türkçe İ için `text-transform: uppercase` kuralı, `@supports not (backdrop-filter)` fallback | `monart-lux.css:95-122, 4937` |

### 1.2 Sayfalar / görünümler ve içlerindeki bileşenler

**Sayfa 1 — Ana sayfa (`/`)** — tek scroll; sıra ve bileşenler:

| Sıra | Bölüm | Bileşenler |
|---|---|---|
| 1 | **Hero** (`#hero`, 100vh) | Eyebrow (`✦ Sanatımıza Ortak Olun ✦`) · Logotype görseli + parıltı katmanı · Alt başlık (`Kişiye Özel · El İşçiliği · Sonsuz Anlam`) · Açıklama paragrafı · **Seri kartları ×3** (badge N°01–03, 3D çift yüz sikke `.coin3d` + "Çevir" butonu, seri adı, alt başlık, açıklama; tıklama → galeri) · **CTA ×2** (`✦ Kolyeni Tasarla` gold, `Koleksiyonları İncele` outline) · Scroll hint |
| 2 | **Atölye / Konfigüratör** (`#wizard`) | Başlık bloğu (eyebrow `✦ Atölye ✦`, H2, açıklama) · **Sol sticky önizleme:** yüz etiketi, **canvas sikke** (560²), "Yüzü Çevir", "Temizle", fiyat kutusu (Toplam Fiyat / ₺ / KDV dahil) · **Sağ form:** **Step 1 Materyal** (3 materyal kartı: swatch, ad, fiyat, gramaj, çap; gizli 24K kaplama kartı) → **Step 2 Ön yüz** (3 seri kartı, ♂/♀ toggle, koşullu sarık/büst/sakal kartları, Mısır glif uyarısı + hiyeroglif rehber görseli, isim alanı (opt-in checkbox, uppercase input, sayaç, unvan önerileri), tarih alanı (GG.AA.YY → Roma rakamı önizleme), 3 fotoğraf slotu, telif onayı, 2 hukuki `<details>`) → **Face divider** (`✦ 2. Yüz Tasarımı ✦`) → **Step 3 Arka yüz** (Step 2 + "2. Yüzü Kişiselleştir (+₺)" toggle + "aynı fotoğraf" onayı) → **Sipariş notu** (400 kar.) → **Step 4 Özet** (stil testi 3 görsel, özet satırları Materyal/1. Yüz/2. Yüz/Toplam, hediye modu tablist (Kendim / Hediye / Teslim Al), sertifika kodu girişi, hediye paneli, **"Keseye At ✦"** brushed CTA, 4 trust rozeti) |
| 3 | **Hakkımızda** (`#craft .origin`) | Eyebrow · Başlık ("Bir Mirasın Yeniden Doğuşu…") · 3 editöryel paragraf (plaque) |
| 4 | **Bespoke çağrısı** (`.bespoke-call`) | Eyebrow · "Aklınızdaki tasarım listede yok mu?" · açıklama · "Özel Tasarım Talebi Oluştur" butonu (modal açar) |
| 5 | **SSS** (`#sss .faq`) | Başlık · 10 `<details>` akordeon (numaralı 01–10, +/− işareti) |
| 6 | **Footer** (global G7) | — |

**Sayfa 2 — Koleksiyon galerisi (`#gallery` overlay)**
Sticky galeri başlığı ("← Ana Sayfa", "Kadim Seriler", ×) · **Seri sekmeleri ×3** · **Hikâye kartı** (aktif seriye göre: eyebrow, başlık, "Miras Notu" daveti, 2 paragraf, 3 etiket, "Seriyi Keşfet →") · **Galeri grid** (3 materyal satırı × Bay/Bayan/Model/Paketleme; 1:1 kartlar, hover overlay ad + ayar; boş hücreler `<image-slot>`) · **Lightbox** (G12).

**Sayfa 3 — Marka elçileri (`#ambassador` overlay, `#ambassadors`)**
Başlık çubuğu · Kart: eyebrow "Yalnızca Davet ile", "The MonetArts Co-Creation Society", ✦ arma · Sekmeler (Başvuru / Elçi Girişi) · **Başvuru formu** (ad, e-posta, sosyal medya, hedef kitle lokasyonu, vizyon) · **Giriş formu** (elçi kodu, erişim anahtarı; kapalı) · **Panel** (isim/rozet/kod bar, 4 istatistik kartı, indirim kodu + kopyala, İş Ortaklığı Onay Belgesi `dl`, 3 model kartı, 10 maddelik sözleşme + onay checkbox).

**Sayfa 4 — Kese / sepet (G9 drawer)** — liste satırı (thumbnail, başlık "Seri · Cinsiyet · Materyal", meta "Ön: … · Arka: …", fiyat, sil), toplam, ödeme butonu.

**Sayfa 5 — Ödeme (`#checkoutModal`)** — İletişim & Teslimat (ad, e-posta, tel, il, ilçe, adres) · Üyelik opt-in (şifre) · Sipariş özeti · 3 onay checkbox + fesih notu · Kart bilgileri · "ÖDEMEYİ TAMAMLA". *(ikas native checkout'a devredilecek.)*

**Modal "sayfaları" (G11 içinden içerik taşıyanlar):**
- **Seal:** mermer panel, mühür SVG, uyarı metni, "Bir Daha Göz Atayım" / "Keseye At ✦".
- **Photo Guide:** açı görseli + 5 rehber bloğu (90°, 60°, 45°, yükleme sırası, ortak kurallar) + İptal/Devam.
- **Bespoke:** ad, tel/WhatsApp, e-posta, dosya drop (≤5), materyal select (7 seçenek), not (800), başarı ekranı.
- **Atelier (kota):** 3 adım kartı (I/II/III), tasarım kartı (canvas snapshot + spec), form (ad, tel, e-posta, not, şifre×2, 3 portre, KVKK), "Tasarımı Kaydet ve Sıraya Gir".
- **Orders:** sipariş listesi (queue/payment durumu, 24s geri sayım, Öde).
- **Quota:** hero görsel + 3 paragraf + 2 buton.
- **Welcome:** görsel + 2 paragraf (vakıf bağışı) + buton.
- **Contact:** ad, e-posta, tel, konu select (6), sipariş no, mesaj, KVKK → mailto.
- **Legal:** 7 doküman (Mesafeli Satış, KVKK, Gizlilik, Teslimat & İade, İptal, Bakım, Hediye Sertifikası).
- **Terms:** Görsel Hakları ve Sanatsal Tolerans Politikası.

### 1.3 ikas eşlemesi — hangi katmana gidiyor

| Referans öğe | ikas katmanı |
|---|---|
| G1–G3 tokenlar, fontlar, keyframes | `src/global.css` + tema global'leri (colors, typography, breakpoints, keyframes, **Day/Night color scheme**) |
| G4 grain, G5 tema toggle | global.css (grain wrapper class) + color scheme değişimi; toggle Header'da BOOLEAN/buton |
| G6 Header, G9 Kese, G10 Toast | `Header` section (`--isHeader`) + child/sub-component: Navbar, LangSwitcher, CartDrawer, Toast |
| G7 Footer | `Footer` section (`--isFooter`) |
| G8 i18n | Admin'de dil başına storefront routing; tüm metinler TEXT prop (routing başına değer); kodda `baseStore.languageOptions` + `setLanguage()`, `IkasStorefrontConfig.routings` / `getCurrentLocale()`, `withRoutePrefix()` |
| G11 Seal, Photo Guide | `CoinConfigurator` içinde sub-component modal'lar |
| G11 Legal, Terms | 7+1 ayrı PAGE (`RichText` section) |
| G11 Contact, Bespoke | PAGE + `ContactForm` / `BespokeRequestForm` section (ikas contact form API) |
| G11 Welcome, Quota, Atelier, Orders | kapsam dışı / ileride (Orders → ikas hazır hesap sayfaları) |
| G12 Lightbox | `CollectionGallery` sub-component |
| G13 THEMES/MATERIALS/fiyat | ikas ürün + varyant (materyal) + Product Option Set; seri/görsel matrisi section prop'ları. **Kişiselleştirme mantığının tam spesifikasyonu:** `docs/configurator-logic.md` |
| G14 assets | `upload_images` → ikas CDN, IMAGE prop'lar. Fontlar yalnızca Google Fonts tema tipografi token'ı (Cinzel, Montserrat, Kufi yazı için Reem Kufi `Coin Script`); canvas çizmeden önce `document.fonts.load(...)` ile bekler |
| Sayfa 1 Hero | `HeroLogotype` section |
| Sayfa 1 Seri kartları | `SeriesGrid` section (3 sabit kart, scalar prop'lar) |
| Sayfa 1 Konfigüratör | `CoinConfigurator` section (PRODUCT prop) + sub: CoinCanvas, MaterialStep, FaceDesignStep, SummaryStep, GiftPanel |
| Sayfa 1 Hakkımızda, Bespoke çağrısı | `OriginStory`, `BespokeCall` section'ları (About PAGE'de de kullanılabilir) |
| Sayfa 1 SSS | `FaqAccordion` section + `FaqItem` child (COMPONENT_LIST) |
| Sayfa 2 Galeri | CATEGORY/koleksiyon sayfası: `CollectionGallery` section |
| Sayfa 3 Elçiler | PAGE: `AmbassadorProgram` (statik içerik + form; panel kapsam dışı) |
| Sayfa 4 Kese | `CartPage` section + Header'daki drawer |
| Sayfa 5 Checkout | ikas native checkout |


## 2. Referans proje — tasarım sistemi

Kaynak: `monart-lux.css` (5.186 satır), `monart-atelier.css` (87 satır, ayrı açık palet). Inline style yok.

### 2.1 Fontlar
- **Google Fonts** (`MonArt Lux.html:14`): **Cinzel** 400/500/600/700 · **Cormorant Garamond** 400/500/600 + italic (fallback'te var, aktif kullanılmıyor) · **Montserrat** 300–700; `subset=latin,latin-ext,cyrillic`, `display=swap`.
- **@font-face** tek: `AlphaKufi` (`assets/alpha-kufi.ttf`, `monart-lux.css:6-12`) — yalnız canvas Osmanlı yan yazısı.
- **ikas notu:** yerel font dosyası (`@font-face` + ttf) ikas'ta kullanılamaz; tüm fontlar Google Fonts adıyla tema tipografi token'ı olarak tanımlanır ve ikas sayfaya yükler. AlphaKufi'nin karşılığı Google Fonts **Reem Kufi** (`Coin Script` token'ı); canvas `document.fonts.load('400 30px "Reem Kufi"')` sonrası çizer.
- ❗ Dokümanlar "Cinzel Decorative + EB Garamond" der; kod ikisini de yüklemez. CSS yorumu (`:30-32`) revizyonu belgeler: *"Başlık: Cinzel (süslü Decorative bırakıldı); UI + Alt metin: Montserrat"*.
- Tokenlar: `--f-deco` = Cinzel (36 kullanım: H1/H2/H3, seri adı, **fiyat rakamları**, Roma rakamı, modal başlıkları) · `--f-cinz` = Montserrat (94: UI etiket, nav, buton, eyebrow, badge — isim tarihsel kalıntı) · `--f-body` = Montserrat (70: gövde, input) · `--f-mono` = Montserrat (1).
- Rol tablosu: Hero H1 Cinzel 600 `clamp(32px,6vw,72px)` lh 1.14 `ls 4px`; Bölüm H2 Cinzel 700 `clamp(28px,4vw,48px)`; Step başlığı Cinzel 400 32px; Seri adı Cinzel 700 26px; Gövde Montserrat italic 17.5px lh 1.65; Editöryel 17px lh 1.85; UI label Montserrat 9–10px UPPERCASE ls .22–.40em; Nav 10px/500 ls .22em; **Fiyat büyük Cinzel 700 28px `--gold-light`**; Text input Montserrat 13px UPPERCASE ls .18em.
- Ölçek: body 17px / lh 1.55. font-size adımları 7.5→32px (30 adım) + 13 `clamp()` başlık. Weight kullanımı 700×38, 600×40, 500×29, 300×19. Letter-spacing merdiveni: 0.5em eyebrow → 0.42em tagline → 0.4em step num/face-divider → 0.3–0.34em trust/badge/brushed CTA → 0.22–0.28em nav/buton → 0.18–0.2em input → ≤0.02em display. Line-height: başlık 1.14–1.3, UI 1.35–1.55, gövde 1.6–1.75, hukuki 1.78–1.92.
- **Türkçe İ güvenliği** (`:95-122`): Cinzel salt-büyük-harf font; `i` noktasız çizer → başlıklar küçük harf yazılıp `text-transform: uppercase` + `lang="tr"` ile dönüştürülür. ikas'ta aynı kural uygulanmalı.

### 2.2 Renkler — `:root` (`monart-lux.css:14-46`, birebir)
```
--black #04040C  --dark #070710  --dark-2 #0B0B14
--gold #C9A84C  --gold-light #F0D060  --gold-pale #E8D5A0  --gold-dim #8B6914  --gold-deep #5A4310
--text #D4B96A  --text-dim #6B5A2A  --text-muted #3A3020
--line rgba(201,168,76,.12)  --line-strong rgba(201,168,76,.32)
--ink #E8E0CC  --ink-soft rgba(214,206,186,.78)
--gold-grad      linear-gradient(135deg,#F0D060 0%,#C9A84C 38%,#8B6914 100%)
--gold-grad-text linear-gradient(180deg,#F5E1A0 0%,#E8C76A 42%,#C9A84C 70%,#8B6914 100%)
--brushed-gold   linear-gradient(90deg,#6A4E0A 0%,#C9A84C 22%,#F0D060 50%,#C9A84C 78%,#6A4E0A 100%)
--header-h 84px
```
**Gündüz teması `body.theme-day` (`:3449-3470`, `:5186`):** `--black #F6F1E7 --dark #EFE8D8 --dark-2 #E7DDC8 --gold #7A5A12 --gold-light #5A4310 --gold-pale #4A3608 --gold-dim #856312 --gold-deep #3A2A06 --text #3E2E08 --text-dim #5E480F --text-muted #7A5F22 --line rgba(120,90,20,.26) --line-strong rgba(120,90,20,.46) --gold-grad-text (#7A5810→#573F0C→#3A2A06) --ink #231D10`. Body bg `#FFFFFF`. ❗ **Varsayılan tema gündüz** (`monart-lux.js:1681`); dokümanların "dark cinematic"i opt-in gece modu. Mermer/glow katmanları `_clean` sürümde kaldırılmış, sadece grain (`feTurbulence`, gece opacity .22 overlay / gündüz .04 multiply).

**Semantik:** Primary CTA `--gold-grad` + `#0c0a04`; Secondary outline `rgba(201,168,76,.45)` border + `--gold`; "Keseye At" `--brushed-gold` + shimmer; Öde `linear-gradient(180deg,#d9b35a,#b88a30 45%,#7a5512)`; hover metin gold→gold-light, hover yüzey `rgba(201,168,76,.08)`; seçili kart gold border + `rgba(201,168,76,.06)` + `inset 0 0 24px rgba(201,168,76,.08)` + `::after '✦'`; hata `#B03434` + shake, soft `#C97A6E`; limit uyarı `#d97757`; başarı/ücretsiz `#8FBF8F` (gündüz `#3F7A3F`). Materyal swatch'ları: gümüş `#f0f0f4→#b8b8be→#6a6a72`, 14K `#f7d896→#d9b25a→#8b6914`, 22K `#ffe590→#e8c84a→#7B5810`. Modal zeminleri `#0d0d14→#07070d`; seal modal 3 katmanlı yapay mermer damarı. 29 yerde `color-mix(in oklch, var(--gold) N%, transparent)`.
**Atölye modülü** (`monart-atelier.css:2`): bağımsız ivory palet `--atl-bg #FDFBF7 --atl-gold #C5A059 --atl-gold-hi #D4AF37 --atl-ink #1A1A1A`.

### 2.3 Layout / spacing
- Container'lar: header 1480px (pad 28px) · hero/wizard/galeri 1320px · series-grid 1200px · amb-panel 1080px · footer kolonları 980px · FAQ 860px · origin 760px · bespoke-call 720px · modal panel 560px (seal/checkout/quota) · cart drawer `min(440px,92vw)` · preview stage 280px.
- Section padding: hero `calc(84px+48px) 28px 24px` min-h 100vh; wizard `96px 28px`; origin `96px 28px 40px`; galeri `56px 28px 96px`; footer `mt 96px; 56px 28px 32px`. **Gutter 28px desktop / 16–22px mobil.**
- Grid'ler: header `1fr auto 1fr`; series `1fr 1fr 1fr` gap 28 (≤768 tek kolon); **wizard `380px 1fr` gap 56** (≤860 block); materyal 3 kolon (≤860 satır-kart); galeri `repeat(4,1fr)` gap 14 (≤860 2 kolon); footer 4 kolon (≤860 2); lightbox `64px 1fr 64px`; sepet satırı `76px 1fr auto`.
- Sticky preview: `top: calc(--header-h + 20px); max-height: calc(100vh - --header-h - 32px); overflow:auto`; mobilde sticky 136px yükseklik `96px 1fr 96px` kompakt satır (IO yok).
- **Breakpoint'ler (7):** 560 · 600 · 640 · 720 · 768 · **860 (ana mobil)** · 900; atelier 820. 11 `prefers-reduced-motion` bloğu, 1 `@supports not (backdrop-filter)`.
- Radius: **keskin lüks** — butonlar 1px, kart/input 2px, modal 4–14px, pill 999px.
- Shadow: yumuşak + negatif spread + altın halka. CTA `0 6px 20px rgba(201,168,76,.18)` → hover `0 8px 28px rgba(240,208,96,.32)`; seal modal `0 40px 100px -20px rgba(0,0,0,.95), 0 0 80px rgba(201,168,76,.10)`; drawer `-30px 0 80px -20px rgba(0,0,0,.9)`; focus ring `0 0 0 3px rgba(201,168,76,.14)`; gündüz gölgeler kahve `rgba(74,54,10,…)`.
- z-index: header 500 · galeri 700 · lightbox 800 · quota 900 · toast 999 · cart 8800 · checkout 9100 · seal 9200 · welcome 9500 · legal 9600 · grain 9999 · bespoke 11000.

### 2.4 Animasyonlar
- **@keyframes (13):** `float` (translateY 0→-12→0, 6s, hero sikkeleri -2s/-4s stagger) · `scrollPulse` (2.4s) · `giftFade` (.5s) · `shimmer` (bg-pos 0→200%, 5s linear, brushed CTA) · `pricePop` (scale 1.12, .4s) · `sugReveal` (.22s) · `consentShake` (±4px .4s, iki kez tanımlı) · `nameSlotPulse` (steps blink 1.15s) · `coinDepth` (scale 1.1, .6s logo flip) · `bspGoldPulse(Day)` (3.6s clip-text) · `logoGoldSweep` (4.2s, logotype mask içinde ışık süpürmesi). ❗ `coinKindle` referanslı ama tanımsız; doküman `fadeUp` kodda yok.
- **Transition:** standart **.25s**; .2s ince, .3s overlay, .5s kart/panel, 400ms galeri fade. **Ana lüks easing `cubic-bezier(.2,.7,.2,1)`** (12 kullanım: modal panel giriş, drawer); 3D flip `cubic-bezier(.2,.72,.18,1)` .95s; canvas flip `cubic-bezier(.55,.04,.55,1)` 280ms (scaleX 0→1, toplam 560ms); lightbox zoom `cubic-bezier(.4,0,.2,1)` 280ms.
- **Hover desenleri:** kart lift `translateY(-8px)` .5s + `::before` radial altın sis; buton shimmer sweep `::before` 110deg beyaz şerit `translateX(-120%→120%)` 1.1s; kapat butonu `rotate(90deg)`; flip ikonu `rotate(-180deg)`; letter-spacing genişleme (.30→.34em, .42→.5em); micro-lift -1/-2px.
- **3D:** `.coin3d` `perspective:1000px` + `preserve-3d` + `rotateY(180deg)`; logo flip `--flip-deg` custom property + `perspective:640px`; hero "altın damar" SVG overlay; logotype PNG `mask-image` + `mix-blend-mode:screen` parıltı.
- **Yok:** scroll-reveal, IntersectionObserver, parallax (`background-attachment: scroll`'a çevrilmiş), marquee, slider.

### 2.5 Bileşen desenleri
- **Butonlar:** `.btn-gold` (gold-grad, 11×22px, Montserrat 10.5/700 ls .22em, r1px) · `.btn-outline` · `--lg` (16×32, 11px) · `.btn-brushed` (full, 20×24, 12/700 **ls .34em**, r2, shimmer) · `.btn-pay` (r6) · `.btn-ghost-marble` · `.btn-coin-checkout` (Montserrat 300 14px, `#f4d27a`, r8, SVG sikke yığını wobble) · `.btn-bespoke` (Cinzel 12.5, r0) · `.amb-submit`. ❗ `.btn-ghost` tanımsız.
- **Input:** `.text-input` gold border + `0 0 0 1px` halo, uppercase, rest = focus görünümü (kasıtlı); `.cf-field` r6 focus `rgba(244,210,122,.7)`; `.upload` dashed dropzone `.is-filled` solid; `.roman-preview` dashed çıktı kutusu. Checkbox 15/17/18px, checked `--gold-grad` + tick.
- **Kartlar:** seri kartı **çerçevesiz** (hover-only); materyal kartı `rgba(11,11,20,.5)` + aktif ✦; tema kartı 44px yuvarlak thumb; plate/bust kartı `20px 1fr auto`; galeri kartı 1:1 + gradient overlay.
- **Badge:** ince altın border, 8–9.5px, ls .2–.32em; cart count 18px daire gold-grad.
- **Header:** fixed 84px, `rgba(4,4,10,.96)` + `blur(16px)`, `border-bottom --line`; logo coin **64px**; wordmark img 60px; gündüz `rgba(255,255,255,.45)` + blur(10).
- **Footer:** `rgba(4,4,10,.6)` + blur(6), logo 72px, 4 kolon, legal satırı, base 9.5px ls .32em.
- **Modal/drawer:** backdrop `rgba(2,2,5,.85–.92)` + blur 6–10px; panel `translateY(14–20px) scale(.97–.985) → 0/1` .4–.55s lüks easing; drawer `translateX(102%→0)` .5s.
- **Fiyat:** Cinzel 700 her yerde (28/22/16/14px), sepet satırı Montserrat 13px; `gold-grad-text` clip toplamlar; `.price-pop` animasyonu.

### 2.6 Doküman ↔ kod çelişkileri
Cinzel Decorative→Cinzel · EB Garamond→Montserrat · header 64→84px · logo 32→64px · varsayılan dark→**light** · wizard sol 400→380px · galeri auto-fill→`repeat(4,1fr)` · mobil coin fixed+IO→sticky · tek 860 breakpoint→7 breakpoint · seri kartı bordered→çerçevesiz · fiyatlar ₺4.850/8.500/14.900 → **₺22.000/90.000/160.000** · trust "3–5 iş günü / 30 gün iade" → "10-15 iş günü / iade kabul edilmez".

