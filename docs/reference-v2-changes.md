# Referans v2 (MonArt2_clean) — Değişiklikler ve ikas Eşlemesi

Kaynak: `reference/MonArt2_clean/` (15.09.2026). Önceki sürüm `reference/MonArtDEMO_clean/` karşılaştırma için duruyor. Kısaltmalar yeni sürümün dosyalarıdır: `H` = `MonArt Lux.html`, `L` = `monart-lux.js`, `C` = `monart-lux.css`, `I` = `monart-i18n.js`.

Yöntem (16.09.2026): iki klasör dosya dosya `diff` ile karşılaştırıldı, yeni sürüm `python3 -m http.server` ile açılıp Chrome'da görsel olarak doğrulandı: portre yönü anahtarı ve bilgi penceresi, Osmanlı'da sola bakınca ismin sol yaya geçmesi, zincir alanı, sepet çekmecesindeki indirim kodu ve yeni ödeme butonu.

Değişen dosyalar: `H`, `L`, `C`, `I`, `monart-atelier.css` (yalnız köşeler 2px → 6px), yeni `assets/btn_coin_stack.png`. `docs/` ve diğer görseller aynı.

**Kullanıcı kararları (16.09.2026):**
- Köşe sistemi için `src/global.css`'te **yalnız** `--r-btn`, `--r-card`, `--r-input` 6px yapılır. "global.css'e dokunma" kuralının tek istisnası.
- Portre yönü ve zincir uzunluğu admin'deki opsiyon setine 3 CHOICE opsiyon olarak eklenir; kullanıcı arayüzden kurar (`docs/configurator-admin-setup.md` §2.1).
- Elçi paneli ayrı faz (Faz 12); kapsamı faz başında konuşulur.

---

## 1. Özet tablo

| # | Değişiklik | Referans | Bizde | Faz |
|---|---|---|---|---|
| 1 | Portre Yönü anahtarı (her yüz) + bilgi penceresi | `H:319-331`, `H:508-519`, `H:1721-1751`, `L:618-622`, `L:855-865`, `L:2440-2467`, `C:5188-5226` | Yok | R2d |
| 2 | Canvas: sola bakınca görsel aynalanır; Osmanlı'da isim/tarih yer değiştirir | `L:202-212`, `L:247-260`, `L:291-382` | `CoinCanvas` yalnız sağ | R2d |
| 3 | Zincir Uzunluğu 50/55/60 cm | `H:655-664`, `L:87`, `L:730-736`, `C:5308-5310` | Yok | R2d |
| 4 | Sipariş satırı: `Zincir_Uzunlugu`, `Yuz1/2_Portre_Yonu`, `Indirim_*` | `L:1585-1604` | `OPTION_CONTRACT`'ta yok | R2d |
| 5 | Atölye açıklaması mobilde ayrı metin | `H:204`, `C:5291-5293` | Tek `description` | R2d |
| 6 | Foto telif onayı, iptal ayrıntısı (m. 15/1-b), eksik onay toast'u | `H:441-457`, `H:633-649`, `L:1689` | `consentText`, `consentInfoBody`, `consentMissingToast` | R2d |
| 7 | Foto rehberi alt metni | `H:1239-1240` | PhotoGuideModal metin prop'u | R2b |
| 8 | Önizleme paneli iki temada çerçevesiz; mobil çubuk gecede opak | `C:582-590`, `C:5386-5389` | Gece çerçeveli | R2b |
| 9 | Köşe sistemi 6px | `C:5312-5384`, `monart-atelier.css` | `--r-btn 1px`, `--r-card 2px`, `--r-input 2px` | R2b |
| 10 | Sepet çekmecesinde indirim kodu + Ara Toplam / İndirim | `H:819-837`, `L:1365-1429`, `L:1473-1479`, `C:5235-5285` | Yalnız CartPage'de kupon | R2c |
| 11 | Ödeme butonu: PNG sikke yığını, "Ödemeye Geç" | `H:843-844`, `C:5391-5402` | SVG + "Sikke Sikke Öde :)" | R2c |
| 12 | Footer "Has Mücevher Sanatı" kaldırıldı | `H` eski 1386 | `Footer.tagline` | R2b |
| 13 | Galeri hikâye etiketleri kaldırıldı | `H` eski 1539/1551/1563 | `CollectionGallery` `*Tag1-3` | R2b |
| 14 | Mesafeli Satış md. 4 yeni, 4–6 → 5–7 | `L:2105-2109` | LegalPage `scbSmLz9RW` | R2b |
| 15 | Hediye Sertifikası md. 1: süre sınırı yok | `L:2142` | LegalPage `oc92cY1imV` | R2b |
| 16 | Kullanım Şartları: Fikri Mülkiyet maddesi | `H:1468-1473` | LegalPage `7pcWHVQXnw` | R2b |
| 17 | Elçi paneli demo girişle açık, modeller kaldırıldı, reklam maddesi genişledi | `H:1562-1606`, `H:1676`, `L:2403-2435` | Kapsam dışı | Faz 12 |

**Uygulanmayacaklar:** referansın kendi ödeme penceresindeki onayların "Ayrıntılar" açılırlarına bölünmesi (`H:925-996`; biz ikas checkout kullanıyoruz), sabit kodlu `PROMOS` (`L:1368`; ikas kuponu), nav "İletişim"in modal açması (`H:74`; bizde sayfa), `.bg-glow` SVG boyutu (`C:76-79`), `MonetArtsI18n` takma adı, `ambFmtTL` bölünmez boşluğu, ödeme penceresinin gündüz renk düzeltmeleri (`C:5287-5305`).

---

## 2. Portre Yönü (R2d)

### 2.1 Arayüz
Her yüz adımında **Cinsiyet'ten sonra, Büst/Sarık kartından önce** bir alan:

- Etiket satırı: "Portre Yönü" + sağda yuvarlak "i" düğmesi (17px, altın kenar, italik "i", `aria-label` "Portre yönü hakkında bilgi").
- Alt metin (`.field-sub`, 12.5px 300, gündüz `#5A4A22`): "Sikkenizin üzerindeki profilin bakış açısını belirleyin."
- İki seçenekli segmentli anahtar (cinsiyetle aynı `gtoggle`): "Sola Bakan Profil" · "Sağa Bakan Profil". **Varsayılan sağ.**
- Tıklama: `data.dir` yazılır, aktif sınıf değişir, o yüz gösterilmiyorsa `setFace(face)`, `drawCoin()`, `renderSummary()`.
- `resetDesign()` iki yüzü de sağa döndürür (`L:574`).

### 2.2 Bilgi penceresi (`#dirModal`)
Ortalanmış panel, `width: min(680px, 100%)`, `max-height: 86vh`, kaydırmalı, padding 42/40/38 (≤560px: 34/22/28). Backdrop blur 6px; gündüz panel `#FBFAF7`, gece `#0B0906`. Kapatma: ×, backdrop, Esc. Açılış: opacity + `translateY(10px)` 260ms; `prefers-reduced-motion`'da geçiş yok. Açıkken `body` kaydırması kilitli.

Metinler (birebir, TR):
- Mühür: ✦
- Başlık: "SİKKELERDE PORTRE YÖNÜNÜN TARİHSEL MANTIĞI"
- Giriş: "Sikkelerde portrelerin yönü sabit bir kurala bağlı değildir; tarih boyunca hükümdarların gücünü, egemenlik dönemlerini ve estetik dengeleri yansıtmak için sağa veya sola bakacak şekilde işlenmiştir. Kendi özel MonetArts sikkenizde portrenizin yönünü kişisel estetik tercihinize veya koleksiyonunuzun hikayesine göre dilediğiniz gibi seçebilirsiniz."
- Üst etiket: "Ünvan" · Alt başlık: "Sikkelerde Yön Geleneği ve Antik Sikke Sanatı"
- Madde 1 — "Antik Yunan ve Roma Dönemi · Güç ve Tanrısallık": "Antik Roma ve Yunan sikkelerinde profilin yönü, hükümdarın güç sembolüydü. Genellikle sağa bakan portreler hakimiyet ve geleceğe bakışı temsil ederken, sola bakan portreler zafer, anma veya özel askeri başarıları simgelemek için tercih edilirdi."
- Madde 2 — "Kraliyet Hükümdar Değişimi Geleneği · Alternatif Yön Kuralı": "İngiltere ve Avrupa darphanelerinde asırlardır süren bir gelenek vardır: Tahta çıkan her yeni hükümdarın sikke üzerindeki profili, bir önceki hükümdarın tam tersi yönüne bakar. Örneğin II. Elizabeth sağa bakarken, Kral III. Charles sola bakmaktadır."
- Madde 3 — "Osmanlı ve Doğu Numizmatiği · Tuğra ve Yazı Düzlemi": "Osmanlı hat ve madalyon sanatında insan figüründen ziyade tuğra ve yazının akış yönü esas alınırdı. Batı etkisindeki son dönem Osmanlı madalyon ve nişanlarında ise profilin yönü, kompozisyondaki ay-yıldız veya floral bordürlerin estetik dengesine göre belirlenmiştir."
- Madde 4 — "Tasarım Düzlemi ve Kompozisyon Dengesi": "Sikkenin kenarındaki bordür motifleri, yazılar veya eşlik eden semboller (lale, defne çelengi vb.) ile portre arasında görsel bir denge kurmak esastır. Işığın kabartma üzerindeki düşüş açısı, seçilen bakış yönüyle doğrudan etkileşime girer."

Tipografi (`C:5203-5216`): başlık deko font 600, `clamp(16px, 2.2vw, 21px)`, ls 2.5px, altın; giriş 14.5px 300 lh 1.82; ayırıcı 1px altın → şeffaf; üst etiket 8.5px ls .26em büyük harf; alt başlık deko 17px 600; madde başlığı gövde 13px 500 altın; madde metni 13.5px 300 lh 1.8.

### 2.3 Canvas
- **Görsel:** `dir === 'left'` ise `ctx.translate(cx*2, 0); ctx.scale(-1, 1)` ile yalnız sikke görseli aynalanır (`L:202-212`). Yazılar sonra çizildiği için ters dönmez. Bizde `drawImage` clip içinde; aynı dönüşüm `save/restore` arasına alınır.
- **Roma / Mısır:** yazı yeri değişmez.
- **Osmanlı:** isim portrenin önündeki açık alana yazılır: sağa bakınca sağ yay, sola bakınca sol yay (`L:247-253`). Tarih karşı yaya geçer; bizde Osmanlı tarihi kapalı (`dateOn: false`), yalnız isim taşınır.
- **`drawSideText` v2** (`L:291-382`):
  - Kapasite taraftan değil rolden gelir: `wide` (isim) → 22 karakter, `maxSpread 1.95`; dar (tarih) → 10 karakter, `1.25`.
  - Sağ yay (değişmedi): `startCursor = 0.95` (alt-sağ), `step = dir = -1`, yazı yukarı sarar.
  - **Sol yay:** `bottomAngle = π − 0.95`; `startCursor = bottomAngle + spread`; `step = -1`. Harfin tepesi yine merkeze döner (`rotOffset = −π/2`). Metnin **sonu** alta sabitlenir, başı yazdıkça yukarı tırmanır; sağ yayın aynası.
  - Her harf: `ang = cursor + step * angularWidth / 2`, `cursor += step * angularWidth`.

### 2.4 Sipariş ve özet
- Referans satır özelliği: `Yuz1_Portre_Yonu` / `Yuz2_Portre_Yonu` = "Sola Bakan Profil" | "Sağa Bakan Profil".
- ikas: `Yüz 1 · Portre Yönü`, `Yüz 2 · Portre Yönü` CHOICE opsiyonları; kod "sola" / "sağa" anahtar kelimesiyle seçer.
- Sepet küçük resmi sola bakan tasarımda yatay aynalanır (`scaleX(-1)`); referansın sepet görseli canvas anlık görüntüsü olduğu için zaten aynalı.

---

## 3. Zincir Uzunluğu (R2d)

- Yer: "2. Yüzü Kişiselleştir" kartından sonra, Sipariş Notu'ndan önce (`H:655-664`), `margin-top: 22px`.
- Etiket "Zincir Uzunluğu", alt metin "Kolye zinciri ürüne dâhildir; boy tercihinizi seçin."
- Üç seçenekli segmentli anahtar: "50 cm" · "55 cm" · "60 cm"; **varsayılan 55**; `max-width: 460px` (≤480px tam genişlik).
- Fiyatı etkilemez. `resetDesign()` zinciri sıfırlamaz (referansta `APP.chain` resetlenmiyor).
- Referans satır özelliği `Zincir_Uzunlugu` = "55 cm". ikas: üst seviye `Zincir Uzunluğu` CHOICE (`50 cm` / `55 cm` / `60 cm`).

---

## 4. Metin değişiklikleri

### 4.1 Atölye açıklaması (R2d)
- Masaüstü (değişmedi): "Solda canlı önizleme, sağda adım adım. Yüzü çevir; iki ayrı hikaye dök."
- **≤980px:** "Üstte canlı önizleme, altta adım adım. Yüzü çevir; iki ayrı hikaye dök."

### 4.2 Fotoğraf telif onayı (R2d)
- Onay kutusu (HTML, kalın kısım `<strong>`): "Yüklediğim görselin **telif/marka haklarına sahip olduğumu** onaylıyorum. Telif veya marka ihlali içeren görsellerde satıcının siparişi tek taraflı iptal etme hakkı olduğunu kabul ediyorum."
- Eksik onay toast'u: "✦ Lütfen görselin telif ve marka haklarına sahip olduğunuzu onaylayınız."
- "Fotoğraf uygunluğu ve siparişin iptali" ayrıntısı: 4 paragraf aynı; 3. paragrafta **"(Yönetmelik m. 15/1-ç)" → "(Yönetmelik m. 15/1-b)"**.

### 4.3 Foto rehberi (R2b)
- Başlık aynı: "Portre Çekim Açıları ve Talimatları"
- Alt metin: "Özel tasarım ürününüzün dijital heykel işçiliğini en doğru derinlikle icra edebilmemiz için fotoğrafınızı tam göz hizasından ve aşağıdaki 3 farklı açıdan çekip iletmeniz gerekmektedir:"

### 4.4 Footer ve galeri (R2b)
- Footer marka bloğundaki "Has Mücevher Sanatı" satırı kaldırıldı → Footer `tagline` boş.
- Galeri hikâye kartındaki 3 etiket (El Kalemkâr / Roma Rakamı / Defne Frizi; Tuğra / Hat Sanatı / Çift Yüz; Kartuş / Hiyeroglif / 22 Ayar) kaldırıldı → 9 etiket değeri boş (kod boşları gizliyor).

---

## 5. Hukuki metinler (R2b)

### 5.1 Mesafeli Satış Sözleşmesi (`L:2105-2109`)
Madde 1–3 aynı. Eski md. 4 ("Kalite ve Telif Sorumluluğu") ikiye ayrıldı, sonrakiler kaydı:

- **4. Fikri Mülkiyet ve Müşteri Yükümlülüğü**
  - "Müşteri, kişiselleştirilmiş ürün oluşturmak amacıyla Site'ye yüklediği her türlü fotoğraf, görsel, logo ve tasarımın telif haklarına, marka haklarına ve/veya kişisel verilerin korunması kapsamındaki kullanım haklarına sahip olduğunu kabul, beyan ve taahhüt eder."
  - "Satıcı, müşterinin yüklediği görsellerin üçüncü kişilerin fikri ve sınai mülkiyet haklarını (ünlü karakterler, tescilli markalar, telifli sanat eserleri vb.) veya kişilik haklarını ihlal ettiğini tespit etmesi durumunda, herhangi bir tazminat veya cezai şart ödemeksizin siparişi tek taraflı olarak iptal ve feshetme hakkına sahiptir. İptal edilen siparişin bedeli, varsa teslimat masrafları da dâhil olmak üzere hiçbir kesinti yapılmaksızın müşteriye tam olarak iade edilir. Müşterinin yüklediği görseller nedeniyle üçüncü kişiler veya resmî makamlar tarafından Satıcı'ya yöneltilebilecek her türlü idari, hukuki ve cezai taleplerin tek muhatabı Müşteri olup, Satıcı'nın bu nedenle uğrayacağı tüm zararlar Müşteri'den rücu edilir."
- **5. Kalite Sorumluluğu**: "Yüklenen görsellerin çözünürlük ve kalite sorumluluğu tamamen müşteriye aittir. Düşük çözünürlükten kaynaklı sonuçlar ayıplı mal sayılmaz."
- **6. Kargo Teslimatı** (eski 5, metin aynı)
- **7. Teslimat** (eski 6, metin aynı)

### 5.2 Hediye Sertifikası Şartları (`L:2142`)
- **1. Geçerlilik**: "MonetArts Hediye Sertifikalarında herhangi bir kullanım süresi sınırlaması bulunmaz; sertifikanız dilediğiniz zaman kullanılabilir."

### 5.3 Kullanım Şartları / Görsel Hakları (`H:1468-1473`)
"Görsel Hakları ve Sanatsal Tolerans Politikası" maddesinden sonra, aynı ✦ ayırıcıyla yeni madde: **"Fikri Mülkiyet ve Müşteri Yükümlülüğü"**. İki paragrafı §5.1 md. 4 ile birebir aynı.

---

## 6. Görsel sistem

### 6.1 Köşe sistemi (R2b)
Referans tek yarıçap tanımlar: `:root { --r-box: 6px }` (`C:5322-5384`).

| Grup | Öğeler | Yarıçap |
|---|---|---|
| Kutular | seri/tema/büst/materyal/kaplama kartları, yükleme, uyarı kutuları, fiyat kutusu, sepet paneli, elçi kartları, modal panelleri, lightbox sahnesi, stil testi seçenekleri, dil menüsü | 6px |
| Girdiler | tüm text/email/password/tel/date/select/textarea, promo | 6px |
| Butonlar | altın/outline/ghost, nav CTA, galeri sekmeleri ve CTA'ları, lightbox CTA, yüz çevir, temizle, ödeme butonu | 6px |
| Segmentli gruplar | cinsiyet, yön, zincir, hediye anahtarı | kapsayıcı 6px; iç düğmeler 0, yalnız ilk/son düğmenin dış köşeleri 6px (RTL'de ters) |
| Başlık + gövde çiftleri | 2. yüz anahtarı + açıklaması, "Fotoğraf uygunluğu" başlığı + gövdesi, isim önerisi başlığı + gövdesi | başlık üst köşeler, gövde alt köşeler; öneri kapalıyken tam |
| İç görseller | foto küçük resmi, galeri görseli | `6px − 1px`; kapsayıcıda `overflow: hidden` |
| Pill | galeri etiketi, elçi rozeti, seri kartı rozeti | 999px |
| Düz | tam ekran katmanlar (lightbox, modal arka planı, çekmece kabı); **≤820px'te** modal ve çekmece panelleri | 0 |

Bizde: `global.css:129-131` `--r-btn`, `--r-card`, `--r-input` → 6px (`--r-field` zaten 6px, `--r-modal 14px` ve `--r-pill` aynı kalır). Bileşen CSS'lerindeki sabit yarıçaplar ve segmentli gruplar tek tek taranır.

### 6.2 Önizleme paneli (R2b)
- `.preview` artık iki temada da `background: none; border: none; border-radius: 0`; blur yok (`C:582-590`). Bizde gündüz zaten böyle; gece de çerçevesiz olur.
- ≤860px yapışkan çubuk gecede opak `#07070F` zemin + alt `1px var(--line)` (`C:5386-5389`). Gündüz çubuğu değişmedi.

### 6.3 Ödeme butonu (R2c)
- İkon: `assets/btn_coin_stack.png` (iki yatık + bir yaslanmış sikke, şeffaf PNG), 58×52 kutuda `object-fit: contain`, `drop-shadow(0 3px 5px rgba(0,0,0,.55))`, `margin-left: -10px`. Hover: `translateY(-2px) rotate(-3deg)` 450ms. ≤720px: 50×45, `margin-left: -6px`.
- Etiket: "Ödemeye Geç", gövde fontu 600, 14.5px, ls .15em, renk `#F8E3A8` (iki temada aynı). ≤720px: 13.5px, ls .12em. Buton `gap: 22px` (≤720px 16px). Gülümseme yok.

---

## 7. Sepet çekmecesi indirim kodu (R2c)

Konum: çekmece altbilgisinde, TOPLAM satırının üstünde (`H:819-837`).

- Satır: girdi (placeholder "İndirim kodu", max 24, büyük harf gösterim, ls .08em) + "Uygula" butonu (Cinzel 9.5px ls .2em, altın kenar). ≤420px alt alta.
- Mesaj satırı (12px 300): hata gece `#E9A5A5` / gündüz `#9E3B3B`; başarı gece `#8FBF8F` / gündüz `#2F6B33`.
  - Boş: "Lütfen bir indirim kodu girin."
  - Bedelsiz sepet: "Bu siparişte indirim uygulanabilecek bir bedel bulunmuyor."
  - Geçersiz: "Kod geçersiz veya süresi dolmuş."
- Uygulanınca satır gizlenir, yerine kutu: "✦ **KOD** · %5" + sağda "Kaldır" (Cinzel 9px). Kutu altın kenarlı, `rgba(201,168,76,.07)` zemin.
- Uygulanmışken TOPLAM'ın üstünde iki satır: "Ara Toplam" ve "İndirim" (`−₺…`, yeşil). Enter uygular; yazmaya başlayınca mesaj silinir; sepet boşalınca kod düşer.
- Çekmece ile referansın ödeme penceresi aynı ara toplam / indirim satırlarını gösterir; bizde ödeme ikas checkout'ta.

ikas eşlemesi: kod ikas kuponudur. CartPage'deki kupon akışı ortak bir sub-component'e alınıp çekmecede de kullanılır; indirim tutarı ikas sepetinden okunur. Elçi kodları (%5, elçiye komisyon) admin'de kupon olarak kurulur; bu Faz 12 kapsamıdır.

---

## 8. Elçi paneli (Faz 12 — kapsam kararı bekliyor)

- Panel yeniden açık: giriş "MONA-ECE22" / "monart" demo bilgileriyle (`L:2403-2409`), oturum `sessionStorage` `monart_amb_session`. Giriş notu: "Erişim bilgileriniz kabul e-postanızda tarafınıza iletilmiştir. Önizleme için: MONA-ECE22 · monart".
- "Başvuru / Elçi Girişi" sekmeleri tanıtım metninin altına taşındı (`H:1562-1566`).
- "İş Ortaklığı Modelleri" bölümü (3 model) kaldırıldı.
- Panel istatistiklerinde tutar ile ₺ bölünmez; kart grid'i ≤1080px 2, ≤520px 1 sütun (`C:5228-5231`).
- "Reklam Şeffaflığı" maddesi (`H:1676`): "Elçi; 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 61. maddesi, Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği (m. 22 — örtülü reklam yasağı) ve Reklam Kurulu'nun Sosyal Medya Etkileyicileri Kılavuzu uyarınca; para, bedelsiz ürün veya indirim dâhil her türlü fayda karşılığı yaptığı paylaşımlarda ticari iş birliğini açıkça belirtmekle yükümlüdür ("#reklam", "#işbirliği" vb.). Etiket, takipçinin ekranı kaydırmasına gerek kalmadan ilk bakışta okunabilir büyüklükte ve arka plandan ayırt edilebilir renkte olmalıdır. Örtülü reklam yasaktır; bu yükümlülüğün ihlali hâlinde Marka sözleşmeyi derhal feshedebilir ve indirim kodunu kapatabilir."
- Elçi kodu sepette %5 indirim verir ve siparişe `Indirim_Kodu`, `Indirim_Orani`, `Indirim_Sahibi` olarak yazılır (`L:1586-1588`).
