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
