# Tipografi karşılaştırması (referans ↔ tema)

14.09.2026'da yapıldı. Referansta olup bizde eksik kalan "04 — Mühür" stil testi bu işte eklendi.

## Yöntem

- Referans `python3 -m http.server --directory reference/MonArtDEMO_clean` ile açıldı (Chrome eklentisi `file://` açmıyor). Bizim tema yayın önizlemesinde (`3svte-dev-monoart.myikas.com`) açıldı. İkisi de 1200px genişlikte ve gündüz temasındaydı.
- Her sayfada, kendi metni en az 3 karakter olan görünür öğelerin hesaplanmış stili toplandı: font-family, boyut, ağırlık, stil, harf aralığı, büyük harf dönüşümü. Metin küçük harfe çevrilip ilk 60 karakteri anahtar yapıldı; iki taraf bu anahtarla eşleştirildi.
- `javascript_tool` çıktısı yaklaşık 1 KB'ta kesiliyor. Bu yüzden satırlar sayfaya `<article><pre>` olarak basılıp `get_page_text` ile okundu.
- Gizli modalların (mühür, fotoğraf rehberi, sepet) değerleri için `getComputedStyle` kullanıldı; bu yöntem gizli öğelerde de font değeri döndürür. Ayrıca `monart-lux.css` statik olarak okundu.
- Fontlar yayında tam yüklü: Montserrat 300–700 + 400 italik, Cinzel 400–700. Ağırlık yerine başka ağırlık çizilmiyor.

## Ana kural: referansın iki teması

`monart-lux.css:4187` ("KURUMSAL ALT METİN NORMALİZASYONU") yalnız `body.theme-day` altında çalışıyor:

- **Gündüz:** açıklama ve alt metinler dik, Montserrat 300, ls .012em. Önizleme ve özet paneli çerçevesiz (`:3506`, `:3533`).
- **Gece:** aynı metinler italik 400, paneller çerçeveli.

Tema ilk yazıldığında iki temaya da gece hali uygulanmıştı. Artık gündüz değerleri temel kuralda, gece değerleri section kökündeki `.<kök>.mon-night …` kuralında duruyor. Alt bileşenlerin gece kuralı parent section'ın CSS'inde:

| Alt bileşen | Gece kuralının yeri |
|---|---|
| FaceDesigner, SealModal | CoinConfigurator |
| CartDrawer, CartLine | Header ve CartPage |
| FormField | ContactForm, AmbassadorProgram, BespokeRequest |

`global.css` ve editördeki tema tipografisi (Editorial vb.) **değiştirilmedi** (kullanıcı kararı). Düzeltmeler bileşen CSS'inde. Bileşen seçicisi `.cc_<id>` ile scope'landığı için global utility'yi (`.mon-editorial`, `.mon-step-num`, `.mon-label`) yerelde geçer.

## Yapılan düzeltmeler

| Bileşen | Referans değeri (gündüz) |
|---|---|
| CoinConfigurator | Adım no büyük harfsiz ("04 — Mühür"). Açıklama, hint ve fiyat alt satırı dik 300. Başlık vurgusu italik 700. Önizleme ve özet gündüzde çerçevesiz (mobil çubuk zeminli kalır). Güven satırı sola hizalı. Malzeme özelliği dik .06em. Kaplama fiyatı 14/500. Hediye: "Kendim İçin" 11px, sekmeler 10px, etiket 600 .24em. Kupon alanı büyük harfsiz. Toast 10px .3em. **Stil testi** eklendi (yalnız görsel) |
| FaceDesigner | Alan alt yazısı ve yükleme alt yazısı dik 300. Öneri grup başlığı 10/600 .26em; isim .22em, büyük harfsiz; açıklama 11.5 italik. Onay metni 10.5 + lowercase. "Favori n" 700 |
| SealModal | Metin 16px, gündüz 300 (gece 400), lh 1.8. Başlık ls .03em, mobilde 18px. Butonlar 12.5px .16em; vazgeç 500 |
| PhotoGuideModal | Bölüm başlığı Montserrat 15/700 .08em. Paragraf 15px, lh 1.6. `em` dik 400 `--gold-dim`. Giriş 17px (mobil 13). Figcaption 13/500, büyük harfsiz |
| Hero, SeriesCard | Açıklama dik 300; hero mobilde 13.5px. Seri alt yazısı gündüz 400 .012em (gece 500 .32em). Seri açıklaması ≤768'de 12.5px |
| OriginStory, BespokeCall, FaqItem | Vurgu 500 italik. BespokeCall başlığı büyük harfsiz. SSS mobil: soru 13.5, cevap 12.5 |
| Footer | Sütun başlığı 10/700. Link ve metinler dik 300 (gece italik 400). "ambassadors" 10/300 lowercase |
| CartDrawer, CartLine | Başlık ls .04em, mobilde 18px. Satır meta 12px dik 300. Satır fiyatı Montserrat 13/700 (sepet sayfasında Cinzel kaldı). Toplam etiketi 10.5/500. Boş durum Montserrat 14/300 ve 12.5/300, büyük harfsiz |
| CollectionGallery, Lightbox | Galeri başlığı, hikâye başlığı, hücre adı ve lightbox adı büyük harf |
| ContactForm / AmbassadorProgram / BespokeRequest | Etiket: İletişim Montserrat 11/400 .18em, Elçi Montserrat 9.5/500 .24em, Özel Tasarım Cinzel 400. Onay metni gündüz 300. Özel Tasarım başlığı 500 .1em, büyük harfsiz (sayfa boyutu korundu). Eyebrow'lar 400 |

## Bilerek bırakılanlar

- `.mon-btn` line-height 1.2: referansta `<a>` butonları ~4px daha uzun. Değişiklik global olurdu.
- Referansın ≤720'de seri adını 12px yapan gündüz kuralı muhtemelen kaza; uygulanmadı.
- Galeri hücre adı mobilde 16px kaldı: referans 22px ama bizim mobil grid 2 sütun.
- Hukuki sayfa, İletişim ve Özel Tasarım başlık boyları: referansta modal, bizde sayfa.
- Rusça başlıklar referansta Cormorant Garamond'a düşüyor (Cinzel'de Kiril yok). Bizde tema fontu değil; 11d'de dil kurulurken bakılacak.
- Tipografi dışı farklar:
  - Hero alt satırı (`hero__subtitle`) referansta gizli, bizde görünüyor.
  - "Temizle" butonunda ikon yok.
  - Özette 2. yüz satırı ve varsayılan tarih (`configurator-logic.md` 27/30, bilerek).

## Seri seçimine bağlı tipografi (R2e analizi, 17.09.2026)

Soru: referansta Tema · Seri (Roma / Osmanlı / Mısır) değişince konfigüratördeki yazıların tipografisi değişiyor mu, bizde karşılığı var mı?

### Yöntem

- Referans v2 `python3 -m http.server 8765 --directory reference/MonArt2_clean`, bizimki yayın önizlemesi (`3svte-dev-monoart.myikas.com/#atolye`). İkisi de gündüz, ~1300px.
- **Referansın kendi içinde:** `#wizard` altındaki metinli tüm görünür öğeler (164 öğe: form, önizleme paneli, özet) üç seride toplandı; font-family, boyut, ağırlık, stil, harf aralığı, büyük harf, satır yüksekliği ve renk karşılaştırıldı.
- **Referans ↔ bizim:** 1. yüzün 23 öğesi (seri kartı, etiketler, cinsiyet, büst/sarık kartı, hiyeroglif uyarısı ve rehberi, isim alanı ve placeholder'ı, sayaç, öneri kartları, Mısır notu, tarih, Roma rakamı) seçiciyle eşlendi ve üç seride ölçüldü.
- Canvas yazısı iki sitede aynı isimle ("AYŞE SULTAN", "MEHMET KAPUDAN") yakından çekildi. Kod `monart-lux.js:240-460` ile `CoinCanvas` satır satır karşılaştırıldı.
- Gece ve 400px ayrıca ölçülmedi. `monart-lux.css` ve `monart-atelier.css`'te seriye bağlı seçici yok (`roma`/`osmanli`/`misir`/`theme-card` aramaları). `syncFaceUI` (`L:606-700`) yalnız içerik ve görünürlük değiştiriyor (`is-active`, `hidden`, `style.display`, `placeholder`, `maxlength`, öneri kartlarının `innerHTML`'i). Seriye göre tipografi farkı bu yüzden tema ya da genişlikle ortaya çıkamaz. 2. yüz aynı fonksiyondan geçiyor.

### Sonuç 1 — Arayüz tipografisi seriye göre değişmiyor

Referansta üç seri arasında 164 öğenin hiçbirinde hesaplanmış stil farkı yok. Seri değişince yalnız şunlar değişiyor, bizde de hepsi aynı:

| Değişen | Roma | Osmanlı | Mısır | Bizde |
|---|---|---|---|---|
| Görünen alanlar | Büst kartı, tarih + Roma rakamı | Sarık kartı | Hiyeroglif uyarısı + rehberi, öneri notu | aynı |
| İsim limiti (sayaç) | 20 | 20 | 15 | aynı |
| Placeholder (Bay / Bayan) | IMPERATOR / AUGUSTA | KAPUDAN / VALİDE SULTAN | PHARAOH / QUEEN | aynı |
| Öneri kartları | IMPERATOR İSİM, AUGUSTA İSİM | KAPUDAN İSİM, İSİM VALİDE SULTAN | PHARAOHİSİM, QUEENİSİM (boşluksuz) | aynı |

### Sonuç 2 — Seriye göre değişen tek tipografi sikke üzerindeki yazı

| Seri | Referans (`drawCoin`) | Bizde (`CoinCanvas`) |
|---|---|---|
| Roma | Üst yay isim Cinzel 700 büyük harf 15–30px; alt yay Roma rakamı Cinzel 600 13–24px | aynı |
| Osmanlı | Portrenin önündeki yan yay, **AlphaKufi** 400 küçük harf (`tr`), 15–30px, en fazla 22 karakter | aynı yerleşim ve ölçüler, font **Reem Kufi** |
| Mısır | Yazı çizilmiyor (kartuş görselin içinde) | aynı |

Görünür tek fark Osmanlı'nın fontu. AlphaKufi Latin harfleri Arap yazısı gibi kuyruklu ve açılı çizen bir süs fontu. Reem Kufi ise düz, geometrik bir sans. Kullanıcının gördüğü değişim büyük olasılıkla Roma'nın Cinzel büyük harfinden Osmanlı'nın bu Kufi küçük harfine geçiş.

- `assets/alpha-kufi.ttf` ad tablosu: "Typeface © (your company). 2010. All Rights Reserved", lisans ve tasarımcı alanı yok. Dosya temaya taşınamaz.
- Google Fonts'ta 32 aday aynı metinle çizildi: Reem Kufi (+ Fun, Ink), Kufam, Blaka (+ Ink), Handjet, Aref Ruqaa (+ Ink), Rakkas, Marhey, Mirza, Lalezar, Noto Kufi Arabic, El Messiri, Changa, Harmattan, Jomhuria, Katibeh, Vibes, Alkalami, Ruwudu, Gulzar, Lateef, Tajawal, Almarai, Lemonada, Oi, Rubik Wet Paint, Sedan SC. Latin harfi Arap yazısı gibi çizen tek aday **Blaka**. O da siyah harf (blackletter) karışımı ve kalın, ince AlphaKufi'ye benzemiyor. Diğerlerinin Latin harfleri düz serif ya da sans.

### Sonuç 3 — Yalnız bir seride görünen öğelerde küçük farklar (gündüz)

| Öğe (seri) | Referans | Bizde |
|---|---|---|
| Öneri notu (Mısır) `.name-suggestions__note` | 13px dik 400, lh 1.6, üst boşluk 14px | 12px italik 400, lh 1.55 |
| Hiyeroglif rehberi alt başlığı (Mısır) `.glyph-guide .field-label .sub` | 9.5px 300 büyük harf, ls .012em, #4A360A | 11px 300 büyük harfsiz (genel `.fd__sub`) |
| Hiyeroglif uyarısı paragrafı (Mısır) | rgba(48,40,26,.82) | rgba(74,58,24,.85) |

### Yan bulgu — gündüz metin renkleri (seriden bağımsız)

Referans v1'de de olan `monart-lux.css:3726` ("Soluk metinler → derin koyu bronz/siyah") gündüzde form metinlerini `#1A1105 !important` yapıyor, ikincil metinleri `#4A360A`. Önceki eşitleme renkleri ölçmemişti. Bizde bu metinler altın tonlarında kaldı:

| Öğe | Referans | Bizde |
|---|---|---|
| Seri adı, isim ve tarih etiketi, sayaç, öneri başlığı ve ipucu, öneri adı, isim alanı değeri, Roma rakamı | #1A1105 | #5A4310 – #856312 arası altın/bronz |
| Cinsiyet düğmeleri | #3E2E08 (seçili ve seçisiz aynı) | seçili #5A4310, seçisiz #856312 |
| Alan alt yazıları, öneri açıklaması | #4A360A | #856312 / #5E480F |
| Placeholder | rgba(90,67,16,.45) | #7A5F22 |

Satır yüksekliği farkları (`normal` ↔ px) görsel değil, listelenmedi.

### Kararlar ve uygulananlar (17.09.2026)

- **Kufi fontu:** şimdilik Reem Kufi kalıyor. Kullanıcı AlphaKufi'nin lisans sahibiyle görüşecek (ROADMAP §5). *Güncelleme aşağıda: lisans alındı, AlphaKufi'ye geçildi.*
- **Mısır farkları düzeltildi:** `.fd__sugg-note` 13px dik, lh 1.6, üst boşluk 14px. Hiyeroglif alt başlığı `fd__sub--glyph` (9.5px büyük harf; gece ls .22em, `CoinConfigurator/styles.css`).
- **Gündüz renkleri R2e'ye alındı.** Konfigüratörün tamamı metin eşlemesiyle ölçüldü: referansta 137 metin, 79 renk farkı. 9 metin bizde farklı yazıldığı ya da bulunmadığı için eşlenemedi (fiyat biçimi, "Atölye" eyebrow'u, güven satırı, "Keseye At"). Bunlar tek tek ölçüldü. Farklar `CoinConfigurator/styles.css`'te `.cfg:not(.mon-night)` bloğuna sabit renk olarak yazıldı, gece kuralları değişmedi:

| Referans rengi | Bizde uygulanan öğeler |
|---|---|
| #1A1105 | açıklama ve adım ipucu, malzeme adı ve fiyatı, özet değerleri, alan etiketleri (Portre Yönü, İsim · Ünvan, Tarih, Fotoğraf, Hiyeroglif Rehberi), sayaç (limit dolunca uyarı rengi kalır), seri adı, isim/tarih alanı değeri, Roma rakamı, öneri ipucu, grup başlığı ve adı, "Favori n" |
| #4A360A | özet etiketleri, alan alt yazıları, öneri açıklaması, yükleme alt yazısı |
| #3E2E08 | ana başlık, cinsiyet/yön/zincir düğmeleri, seçili "Kendim İçin Tasarla" |
| #5A4310 | adım başlıkları, 2. yüz açıklaması |
| #573F0C | başlıklardaki italik vurgu |
| #6D5210 | adım numarası, sipariş notu etiketi |
| #2A1F08 / #5A4A22 | büst/sarık ve kaplama kartı adı / açıklaması, yön ve zincir alt metni |
| #6A5114 | fotoğraf onay metni |
| rgba(48,40,26,.6 / .55 / .82) | malzeme özelliği ve "(isteğe bağlı)" / not sayacı / hiyeroglif uyarısı |
| rgba(90,67,16,.45) | isim ve tarih placeholder'ı |

Ayrıca gündüzde öneri kartlarının soluklaştırması kaldırıldı (`opacity: 1`, referans `.name-suggestion { opacity: 1 !important }`). Pasif kart yine soluk.

Not: bu sabit renkler gündüzde editördeki renk slot'larını geçer. Gündüz paleti editörden değiştirilirse konfigüratör metinleri değişmez.

Bilerek bırakılanlar: "Yüzü Çevir" / "Temizle" yazısı (#5E480F ↔ #5A4310, fark görünmüyor), onay kutusu etiketinin altın parıltısı, sipariş notu alanının zemin ve yazı rengi (renk ölçümü yalnız metin öğelerini kapsadı).

### Yayın testi (17.09.2026)

- Gündüz, 1200px, Ana sayfa: aynı metin eşlemesiyle referansa karşı yeniden ölçüldü. 79 farktan yalnız bilerek bırakılan "Yüzü Çevir" ve "Temizle" kaldı. Eşlenemeyen öğeler (not sayacı, malzeme fiyatı ve özelliği, özet değeri, kaplama kartı, seçili "Kendim İçin") tek tek referans değerinde. Sayaç limitte `--warn` rengine geçiyor.
- Mısır: öneri notu 13px dik, lh 20.8px, üst boşluk 14px; alt başlık 9.5px 300 büyük harf, #4A360A. İkisi de referansla birebir.
- Gece: 186 metnin hiçbirinde gündüz renklerinden biri yok. Tek eşleşme stil testindeki ✓ işareti; bu renk bu çalışmadan önce de sabitti. Token renkleri, öneri kartı soluklaştırması (.72) ve hiyeroglif alt başlığının italik .22em hali korunmuş.
- 400px (aynı kaynaklı iframe, gündüz): üç seride yatay taşma yok, renkler masaüstüyle aynı.
- Ürün sayfası (`/sikke-kolye`): 11 örnek öğe referans renginde, taşma yok.

### Ek: AlphaKufi ve renk slot'ları (17.09.2026)

Kullanıcı kararları: AlphaKufi'nin lisansı alındı (dafont.com "alpha_kufi", Agung Yuwanda; sitede "Donationware"). Tema müşteriye teslim edileceği için gündüz renkleri editörden değiştirilebilir olmalı.

- **Font:** `reference/MonArt2_clean/assets/alpha-kufi.ttf` (v1.00, 2010, 20.8 KB) base64 olarak `src/utils/alpha-kufi-font.ts`'e gömüldü. ikas özel font dosyası barındırmıyor ve tema tipografisi yalnız Google Fonts alıyor. `ensureEmbeddedFont()` (`src/utils/fonts.ts`) fontu bir kez `FontFace` ile yükleyip `document.fonts`'a ekliyor. `CoinCanvas` `SCRIPT_FONT = "AlphaKufi"`, Reem Kufi yüklemesi kaldırıldı. Yerleşim ve ölçü kodu değişmedi (referansla zaten aynıydı). CoinConfigurator paketi 27.8 KB büyüdü.
- **Renkler:** sabit değerler Day şemasındaki slot'lara bağlandı (tablo `docs/theme-globals.md`). Referansla birebir olmayan iki eşleme var: kart adı #2A1F08 yerine Text/Ink (#231D10), fotoğraf onay metni #6A5114 yerine Day Label (#6D5210). Saydam tonlar `color-mix` ile slot renginden türetiliyor; bu yüzden birkaç değer yuvarlama düzeyinde farklı olabilir.

Yayın testi (17.09.2026):
- AlphaKufi `FontFace` durumu `loaded`. "MEHMET KAPUDAN" ve "AYSE SULTAN" sağa ve sola bakan Osmanlı portresinde AlphaKufi ile çiziliyor, gündüz ve gece. Tema tipografisindeki Reem Kufi tanımlı ama indirilmiyor.
- Gündüz, 1200px: 92 metin referansla sayısal toleransla (±2.5 kanal, ±0.03 saydamlık) karşılaştırıldı. Farklar yalnız "Yüzü Çevir"/"Temizle" (bilerek), büst/sarık kartı adı (Text/Ink) ve fotoğraf onay metni (Day Label).
- Editör simülasyonu: 6 yeni slot ile Text, Accent/Light ve Text/Ink'in CSS değişkenleri sayfada geçici olarak değiştirildi. Konfigüratördeki ilgili 10 öğenin hepsi yeni renge geçti, değişiklik geri alınınca eski renge döndü.
- Gece: 186 metinde gündüz rengi yok (tek eşleşme stil testindeki ✓, öncesinden sabit). Gündüz değişkenleri gece kökte tanımlanmıyor.
- Ana sayfa 400px, Ürün sayfası 1200px ve 400px: üç seride taşma yok, font yüklü, renkler aynı.
