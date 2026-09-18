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
