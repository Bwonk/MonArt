# Faz 11b — Yayın önizlemesinde QA

Ortam: `https://3svte-dev-monoart.myikas.com/`, 18.09.2026. Ölçüm yöntemi: sayfa iframe'siz olduğu için
`javascript_tool` ile doğrudan; 400px ve 880px için sayfaya `position:fixed` aynı kaynaklı iframe eklenerek.
Gece testleri `localStorage.monart_theme = "night"` ile, test sonunda `day`'e döndürüldü.

Bu tur **sipariş bağımlı olmayan** her şeyi kapsar. Sipariş gerektirenler kullanıcıda (§4).

---

## 1. Otomatik tarama

21 sayfa × 1200px ve 400px, ayrıca gece modunda 1200px ve 400px. Her sayfada ölçülenler:
`<title>`, `h1`, gerçek yatay taşma (`documentElement.scrollWidth > clientWidth`) ve taşıran öğenin seçicisi,
`href` yok / `#` / `javascript:` olan linkler, buton-kart-girdi `border-radius` dağılımı,
gece modunda açık zemin sızması (alan > 25.000px², bağıl parlaklık > 0,7).

Taranan sayfalar: `/`, `/sikke-kolye`, `/pages/koleksiyon` (+`?seri=`), `/cart`, `/pages/hakkimizda`,
`/pages/sss`, 8 hukuki sayfa, `/pages/iletisim`, `/pages/ozel-tasarim`, `/pages/elciler`,
`/account`, `/account/orders`, `/account/addresses`, 404.

| Kontrol | Sonuç |
|---|---|
| Yatay taşma (1200px) | ✅ hiçbir sayfada yok |
| Yatay taşma (400px) | ✅ hiçbir sayfada yok |
| Yatay taşma (gece, 1200 + 400px) | ✅ hiçbir sayfada yok |
| Gece modunda açık zemin sızması | ✅ yok |
| Bozuk link (`#`, boş, `javascript:`) | ✅ yok |
| 6px köşe sistemi | ✅ (aşağıdaki nota bak) |
| Konsol hataları | ✅ site kaynaklı hata yok |
| `<title>` | ⚠️ bulgu **B3** |
| `h1` | ⚠️ bulgu **B4** |

**Köşe notu:** taramada `5px 0 0 5px` / `0 5px 5px 0` değerleri çıktı (`.fd__gender-btn`, `.cfg__chain-btn`).
Bunlar bulgu değil: sarmalayıcılar (`.fd__gender`, `.cfg__chain-row`) `6px` + `overflow: hidden`, düğmeler
`calc(var(--r-card) - 1px)` ile 1px çerçevenin içindeki doğru iç yarıçapı kullanıyor.

**Konsol notu:** tabloda 17 hata göründü, hepsi
`A listener indicated an asynchronous response…` — tarayıcı eklentisi gürültüsü, siteden değil.

---

## 2. Bulgular

### B1 — Kapalı sepet çekmecesi ve mobil menü klavyeyle odaklanabiliyor ✅ düzeltildi

Kapalı `.kese` ve `.mon-menu` yalnız `transform: translateX()` ile ekran dışına kayıyor, `visibility: visible`
kalıyordu. Ölçüm: sayfadaki 113 odaklanabilir öğenin **12'si kapalı katmanların içindeydi**; Tab ile oraya
girilebiliyor ve odak halkası görünmeyen bir yere gidiyordu. Öğeler `aria-hidden="true"` içinde olduğu için
ayrıca ARIA ihlali (aria-hidden içinde odaklanabilir öğe).

Modallar bunu doğru yapıyor: `.dirm`, `.lb-…` kapalıyken `visibility: hidden` +
`transition: … visibility 0s linear <süre>`.

**Düzeltme:** aynı kalıp `.kese` (`CartDrawer/styles.css`) ve `.mon-menu` (`Header/styles.css`) köklerine
uygulandı. Geçiş gecikmesi kapanma animasyonunu bozmuyor. `global.css` değişmedi.

### B2 — Sepet çekmecesi ve mobil menü Esc ile kapanmıyor ✅ düzeltildi

Altı katmanın (`Dialog`, `DirectionInfoModal`, `LanguageSwitcher`, `Lightbox`, `PhotoGuideModal`, `SealModal`)
hepsinde Escape işleyicisi varken iki çekmecede yoktu. Yayında doğrulandı: çekmece açıkken Esc'e basınca
`is-open` kalıyor, kaydırma kilidi sürüyor.

**Düzeltme:** `SealModal`'daki `useEffect` kalıbı `CartDrawer`'a ve Header'daki mobil menüye eklendi.

### B3 — Tema sayfalarının `<title>` etiketi boş ⏳ karar bekliyor

`/sikke-kolye` dışında taranan **20 sayfanın hepsinde** `document.title === ""`. Ürün sayfası başlığını
üründen alıyor ("Sikke Kolye"). Bu bir kod değil sayfa/SEO ayarı; son commit (`9db32da`) SEO adımını Faz 11
planından çıkardığı için karar kullanıcıda.

### B4 — Ürün sayfasında `h1` yok ✅ düzeltildi

`/sikke-kolye` sayfasında yalnız CoinConfigurator var; başlığı `<h2 class="cfg__title">` olduğu için sayfada hiç
`h1` yoktu (taramada `h1: "YOK"` çıkan tek sayfa). Ana sayfada sorun değil: orada `h1`'i Hero logotype'ı taşıyor
(`<h1 class="hero__logo">`, `alt="Tarihi Senin Hikayenle Yaz"` ile erişilebilir ada sahip).

**Düzeltme (kullanıcı onayı 18.09.2026):** Faz 11a'da `OriginStory` ve `Faq`'a uygulanan kalıbın aynısı —
`titleAsH1` BOOLEAN prop (grup `head`, varsayılan kapalı) + `const Title = titleAsH1 ? "h1" : "h2"`.
Yalnız **Ürün sayfası** yerleşiminde (`vCT6WKmBTD`) açıldı; Ana sayfada (`CnxvAPawqP`) kapalı kaldı ki
Hero'nun `h1`'i tek kalsın. Stil `.cfg__title` class'ından geldiği için görsel değişiklik yok.

### B5 — Mobil önizleme çubuğunda sikke düğmeleri eziyordu ✅ düzeltildi

Kullanıcı bildirimi (18.09.2026, 400px ekran görüntüsü). Ölçüm:

- Sikke sabit **240px** ve ortalanmış (400px'te 80…320), düğmeler **96px**'lik yan sütunda (18…114).
  Sikke `z-index: 2` ile üstte olduğu için **düğmelerin sağ 34px'ini örtüyordu**.
- "YÜZÜ ÇEVİR" 96px'e sığmayıp iki satıra kırılıyor, düğme 44,3px oluyordu ("TEMİZLE" 31,2px).
- Geometri: 240px sikke + 2×96px sütun + 2×10px boşluk + 2×18px kenar payı = **488px** ister.
  480px'te kıl payı kurtuluyor (−6px), altında bindirme kaçınılmaz.

**Port hatası değil:** referans v2 aynı ızgarayı (`96px 1fr 96px`), aynı 240px sikkeyi ve aynı
8.5px/0.14em'i kullanıyor; `reference/MonArt2_clean` 400px'te ölçüldü, orada da iki satır (38px).
Tek farkımız düğmenin 6px daha uzun olmasıydı: referans `line-height: normal`, biz gövdeden
1,55 miras alıyorduk (13.175px).

**Düzeltme (kullanıcı kararı: sikke tam boyunda kalsın, düğmeler ikona insin):**
- `.cfg__flip, .cfg__clear` → `line-height: 1.2` (her genişlikte; 44,3 → 38,4px, referansla aynı).
- `@media (max-width: 480px)` (tema breakpoint'leri 860 ve 640 olduğu için literal): yan sütunlar
  `44px`, düğmeler 38×38 ikon karesi, `.cfg__clear`'a `TrashIcon` eklendi, etiketler görsel olarak
  gizlendi ama **erişilebilir ad olarak kaldı** (sr-only kalıbı; `aria-label` tekrarı gerekmedi).

Doğrulama (yeni kurallar canlı sayfaya enjekte edilip ölçüldü): 400/440/480px'te iki düğme de 38×38,
sikke 240px, bindirme yerine **24px boşluk**; 481px ve üstünde etiketler dönüyor, taşma yok.

**Fiyat kutusu (aynı turda, kullanıcı isteği):** düzeltmeden sonra kullanıcı fiyatın "bir tık sağ üste"
gitmesi gerektiğini söyledi. 400px'te üç aday canlı sayfada denenip karşılaştırıldı — `top` 58 (referans,
üstten 37,2px) / 46 (25,2px) / 38 (17,2px). Seçilen: **`top: 38px`**; "TOPLAM FİYAT" çevir düğmesinin üst
hizasına geliyor (düğme üstten 16px) ve `₺` sikkenin kenarından kurtuluyor. Referanstan bilinçli sapma.

`right: 18px` **değiştirilmedi**: sayfa gutter'ıyla aynı hizada (malzeme kartları, başlıklar ve Footer'ın
sağ kenarı), daha sağa alınırsa o hizadan taşar. Kullanıcıya 14px'lik varyant sunuldu, seçilmedi.

481/640/860px'te doğrulandı: fiyat her genişlikte çubuğun içinde kalıyor, sikkeyle yatay bindirme yok
(481px'te 0,7px, önceden de öyleydi).

**Yukarı taşımadan sonra kalan değme (aynı tur):** yayında bakınca `₺` glifi hâlâ sikkenin yayına
değiyordu. Ölçüm (400px): glif 278,8–286,4; dairenin o yükseklikteki ulaşımı glifin üstünde 263,1,
ortasında 278,7, **altında 290,3** — yani rim glifin sol alt köşesini 11,5px kesiyor.

Denenen ve **yetmeyen** çözümler (hepsi ölçüldü):
- Fiyatı daha yukarı almak: kutu zaten çubuğun 16px üst payına dayanmış durumda.
- Sikkeyi sola kaydırmak: 390px+ çözüyor, ama 360/375px'te yeterli kaydırma sikkeyi düğmelere çarptırıyor.
- Sikkeyi küçültmek: 360px'te fiyat kutusu (103px) ekranın %29'u; ortalanmış sikke hangi boyutta olursa
  olsun yayı fiyata ulaşıyor (temiz kalması için sikkenin ~125px'e inmesi gerekiyordu).
- Fiyatı sağa almak: `right: 18px` sayfa gutter'ı, taşarsa alttaki kartlar ve Footer'la hizası bozulur.

Kullanıcıya dört seçenek sunuldu (fiyat kendi satırına — 136→168px çubuk, her genişlikte temiz; sikke
12px sola; fiyata zemin plakası; olduğu gibi). **Kullanıcı kararı: düzen aynı kalsın, yalnız punto düşsün.**

Uygulanan: `@media (max-width: 430px) { .cfg__price { font-size: 14px } }` (17px'ten). Çakışma ~425px
altında başladığı için kural oraya sınırlandı, tabletlerde punto düşmüyor. Sonuç (pozitif = boşluk):

| Genişlik | 17px (önce) | 14px (sonra) |
|---|---|---|
| 414 | −4,4 | **+15,7** |
| 400 | −11,5 | **+8,7** |
| 390 | −16,5 | **+3,7** |
| 375 | −24 | −3,8 |
| 360 | −31,5 | −11,3 |

⚠️ **360 ve 375px'te (iPhone SE / mini) `₺` hâlâ yaya değiyor.** Punto tek başına orayı kurtarmıyor:
13px'te 375 kurtuluyor (+3) ama 360 yine değiyor (−4,5). Orayı da temizlemek için yapısal seçeneklerden
biri (fiyatın kendi satırına çıkması) gerekiyor.

---

## 3. Doğrulanan açık uçlar

Hepsi yayın önizlemesinde ölçüldü; ROADMAP §5'teki karşılıkları kapatılabilir.

### Faz 11a düzeltmeleri (yayına çıktı)

| Madde | Sonuç |
|---|---|
| Gece Header cam barı en üstte gri görünüyordu | ✅ `.mon-header__bar` gece kuralı `linear-gradient(--header-bg, --header-bg), var(--bg-page)`; hesaplanan zemin opak koyu, ekran görüntüsüyle de doğrulandı |
| Hakkımızda ve SSS'te `h1` yoktu | ✅ `<h1 class="origin__title">`, `<h1 class="faq__title">` |
| Footer e-postası ~880px'te taşıyordu | ✅ `.mon-footer__link` → `overflow-wrap: anywhere`; 820/860/880/920px'te sağ kenar 549–561px, taşma yok |
| Global `.mon-btn :focus-visible` yoktu | ✅ yayınlanmış CSS'te 3 kural; klavyeyle odaklanınca `2px solid rgb(201,168,76)`, offset `3px` |

### Kalan INDEX linkleri

| Madde | Sonuç |
|---|---|
| Footer "Atölye"/"Yardım" sütun başlıkları | ✅ bunlar `<span>`, link değil — tıklanacak bir şey yok |
| Footer'ın 19 linki | ✅ hepsi doğru hedefte; "Tasarım Atölyesi" → `/#atolye` |
| Footer "ambassadors" | ✅ → `/pages/elciler` |
| Galeri "Ana Sayfa" | ✅ → `/` (bilerek INDEX) |
| Galeri "Bu Modeli Tasarla" | ✅ → `/?seri=…&cinsiyet=…&materyal=…`; ana sayfada üç parametre de konfigüratöre uygulanıyor (Mısır · Bayan · 22 Ayar Altın), sayfa konfigüratöre kayıyor (`scrollY 1091`, `cfgTop 84`), URL `/` olarak temizleniyor |
| Galeri `?seri=` | ✅ `?seri=misir` Mısır sekmesini seçiyor, "Bu Modeli Tasarla" linki seriye göre güncelleniyor |
| Kayıt formu onay linkleri | ✅ "Kullanım şartlarını" → `/pages/kullanim-sartlari`, "KVKK Aydınlatma Metni" → `/pages/kvkk` (oturumsuz HTML'den; girişliyken sayfa `/account`'a yönleniyor) |

### Referans v2 (R2) çıktıları

| Madde | Sonuç |
|---|---|
| 6px köşe sistemi | ✅ tüm sayfalarda; modallar bilerek 14px |
| Sepet çekmecesinde indirim kodu alanı | ✅ "İndirim kodu" girdisi + "UYGULA" |
| Sikke yığını PNG'li "Ödemeye Geç" | ✅ çekmecede görsel butonla |
| Sipariş satırında portre yönü + zincir uzunluğu | ⏳ test siparişi gerekiyor (§4) |

### Faz 4'ten kalan fotoğraf yükleme testi ✅ kapandı

Editör önizlemesinde iç iframe yüzünden denenemiyordu; yayın önizlemesinde iframe olmadığı için otomasyonla
yapılabildi. Konfigüratörde `input[type=file]` × 6 (yüz başına 3 slot), `accept="image/jpeg,image/png,image/webp"`.

- ✅ Geçerli JPG (136 KB) kabul ediliyor, dropzone dosya adını ve "×" kaldır düğmesini gösteriyor.
- ✅ PDF reddediliyor → "Yalnızca JPG veya PNG yükleyebilirsiniz."
- ✅ 6,06 MB JPG reddediliyor → "Fotoğraf 5 MB'tan büyük olamaz."; **önceden yüklenmiş geçerli fotoğraf korunuyor**.

Toast `role="status"` ile kısa süre görünüp kayboluyor; ölçüm `MutationObserver` ile yapıldı.
Yüklemenin S3'e gerçekten gitmesi sepete ekleme anında oluyor, o yüzden §4'teki test siparişinde görülecek.

### Klavye ve hareket

| Madde | Sonuç |
|---|---|
| DirectionInfoModal | ✅ açılınca odak ×'e, `role="dialog"` + `aria-modal="true"`, kaydırma kilidi; Esc kapatıyor, kilit kalkıyor, odak açan "i" düğmesine dönüyor |
| Lightbox | ✅ `role="dialog"`, odak `.lb__close`'a; ← → ile 1/4 → 3/4; Esc kapatıyor, odak açan `.cg-item`'a dönüyor |
| Galeri hücresi erişilebilir adı | ✅ `aria-label="Büyüt: Roma · Bay · 925 Gümüş · Erkek"` (içteki `img alt=""` doğru, dekoratif) |
| `prefers-reduced-motion` | ✅ yayınlanmış CSS'te 13 kural |

### Hesap sayfaları (girişli oturumla)

`/account`, `/account/orders`, `/account/addresses` — 1200px ve 400px, gündüz ve gece: taşma yok, açık zemin
sızması yok. 400px gecede Adreslerim: başlık, çip şeridi (aktif çip vurgulu), boş durum ve "Yeni Adres Ekle"
düğmesi düzgün. Faz 10c'nin yayın bekleyen düzeltmeleri (adres etiketleri, gece kontrastı) artık yayında.

---

## 4. Kullanıcıda kalanlar

Kullanıcı kararı (18.09.2026): test siparişini baştan sona kullanıcı verecek.

- **Test siparişi** → sipariş satırında tüm opsiyon değerleri, **Portre Yönü** ve **Zincir Uzunluğu**,
  yüklenen fotoğrafların URL'leri; ardından sipariş listesi/detayı, kargo (admin'den kargo girilince),
  iade talebi.
- **Hesap silme** ayrı test hesabıyla; "Verilerimin kopyasını gönder" e-postası.
- **Gerçek gönderimler:** kayıt formu, "şifremi unuttum" e-postası ve gelen linkle şifre yenileme,
  e-posta doğrulama linki.
- **E-posta biçimi kontrolleri:** elçi başvurusu başlık satırı ve vizyon bloğu, Özel Tasarım mesajındaki
  görsel linklerinin merchant'ta açılması.

## 4b. Düzeltmelerin yayında doğrulanması (18.09.2026, ikinci yayın)

| Bulgu | Doğrulama |
|---|---|
| B1 | ✅ `.kese` ve `.mon-menu` kapalıyken `visibility: hidden`. Kapalı katmanlardaki 6 odaklanabilir öğeye `focus()` denendi, **6'sı da odaklanamadı** (düzeltmeden önce 12 öğe Tab ile erişilebiliyordu) |
| B2 | ✅ Sepet çekmecesi açılıp Esc → kapandı, `visibility: hidden`, `body overflow` serbest. Mobil menü açılıp Esc → aynı |
| B4 | ✅ `/sikke-kolye` → `<h1 class="cfg__title">`; ana sayfada tek `h1` hâlâ `hero__logo` (konfigüratör orada `h2`) |

## 5. Üyelik sayfaları (oturum kapalıyken)

Beş sayfa: `/account/login`, `/account/register`, `/account/forgot-password`, `/account/recover-password`,
`/account/activate` (diğer slug denemeleri 404).

| Kontrol | Sonuç |
|---|---|
| `h1` | ✅ Giriş Yap · Kayıt Ol · Şifremi Unuttum · Yeni Şifre Belirle · E-posta Doğrulama |
| Yatay taşma 1200px / 400px | ✅ beşinde de yok |
| Gece modu (1200 + 400px) | ✅ taşma ve açık zemin sızması yok |
| Token'sız şifre yenileme | ✅ "Bağlantı geçersiz — Bu şifre yenileme bağlantısı eksik ya da süresi dolmuş." + "Yeni Bağlantı İste" → `/account/forgot-password` |
| Giriş doğrulaması | ✅ boş gönderimde iki alan da "Bu alan zorunlu.", `aria-invalid="true"` + `aria-describedby`, odak ilk hatalı alana (e-posta) |
| Şifre göster/gizle | ✅ `password` ↔ `text`; `aria-label` "Şifreyi göster"/"Şifreyi gizle", `aria-pressed` `false`/`true` |
| Giriş sayfası linkleri | ✅ "Şifremi unuttum" → `/account/forgot-password`, "Kayıt ol" → `/account/register` |
| Kayıt onay linkleri | ✅ "Kullanım şartlarını" → `/pages/kullanim-sartlari`, "KVKK Aydınlatma Metni" → `/pages/kvkk` |
| Kayıt alan yapısı | ✅ ad, soyad, e-posta, telefon, şifre + 2 onay kutusu |
| Kayıt — boş gönderim | ✅ Ad, Soyad, E-posta, Şifre "Bu alan zorunlu."; **onay kutusu** "Devam etmek için onay vermelisin."; hepsinde `aria-invalid="true"` + `aria-describedby`; odak ilk hatalı alana (Ad). Telefon ve pazarlama onayı zorunlu değil (doğru) |
| Kayıt — biçim doğrulaması | ✅ geçersiz e-posta → "Geçerli bir e-posta adresi gir."; 3 karakterlik şifre → "Şifre en az 6 karakter olmalı."; dolan alanların hatası siliniyor, odak ilk hataya (e-posta) |
| Kayıt — şifre göster/gizle | ✅ `password` → `text` → `password`; `aria-label` ve `aria-pressed` birlikte değişiyor |
| Kayıt — form içi onay linkleri | ✅ `/pages/kullanim-sartlari`, `/pages/kvkk` |
| Girişsiz hesap sayfası | ✅ `/account/orders` → `/account/login?redirect=%2Faccount%2Forders` |

Hiçbir testte gerçek kayıt gönderilmedi; doğrulama istemci tarafında durdurduğu için form hiç POST edilmedi.

## 6. Bu turda yapılamayanlar

- **Dil prefix'i doğrulaması** (`/#atolye` gibi göreli linkler): ikinci routing kurulmadığı için 11d'de.

## 7. Notlar

- QA sırasında kapalı çekmecedeki "Ödemeye Geç" düğmesi yanlışlıkla tetiklenip `/checkout` açıldı;
  hiçbir veri girilmedi, sipariş oluşmadı. (Bu, B1'in neden önemli olduğunu da gösteriyor.)
- Sepette QA öncesinden kalan 1 adet "Roma · Bay · 22 Ayar Altın" satırı var.
