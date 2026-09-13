# Koleksiyon Galerisi — Faz 5 spec

Referanstaki `#gallery` overlay'i ve lightbox'ı ayrı bir "Koleksiyon" sayfasına taşınır.
Kaynak: `MonArt Lux.html` 1513–1570 ve 1766–1784, `monart-lux.js` 1021–1255 ve 1839–1894,
`monart-lux.css` 1364–1712, gündüz kuralları 3607–3861.

---

## 1. Referansta ne var

- **Başlık çubuğu** (sticky): "← Ana Sayfa" · "Kadim Seriler" · ×.
- **Seri sekmeleri** ×3: Roma, Osmanlı, Mısır. Aktif sekme alt çizgili; gündüzde kutulu.
- **Hikâye kartı** (aktif seriye göre): eyebrow, iki satırlı başlık (ikinci satır italik),
  "MonetArts Miras Notu · Lütfen Okuyunuz" daveti (iki yanda altın çizgi), 2 paragraf
  (gündüzde solda altın çizgili parşömen), 3 etiket, "Seriyi Keşfet →" butonu.
- **Grid**: 3 satır (925 Gümüş, 14 Ayar, 22 Ayar) × 4 sütun (Bay, Bayan, Model, Paketleme).
  Kartlar 1:1, hover'da alttan gradient ile ad ve ayar. Mobilde 2 sütun.
  - Gümüş ve 14 Ayar satırında Bay ve Bayan gerçek sikke görseli. Gümüş satırı gümüş render,
    14 Ayar satırı altın render.
  - 22 Ayar Bay/Bayan ile tüm Model ve Paketleme hücreleri boş yuva (`<image-slot>`,
    prototipte elle görsel sürükleme aracı). Üzerinde "Model · 925 Gümüş" etiketi.
- **Lightbox**: yalnız görselli hücreler. Önceki/sonraki, sayaç "1 / 4", ad "Roma · Bay",
  alt satır "925 Gümüş · Erkek", "✦ Bu Modeli Tasarla", mobilde ipucu
  "← kaydır → · çift tıkla zoom". Masaüstünde tık = zoom (×2), dokunmatikte çift dokunma.
  Kaydırma 40px eşiği, zoom'dayken kapalı. Klavye: Esc, ←, →.
- **"Bu Modeli Tasarla" ve "Seriyi Keşfet"**: ikisi de `lbChooseDesign()`. Referans yalnız
  ön yüzün **serisini** değiştirir (cinsiyet ve materyal değişmez), galeriyi kapatır,
  konfigüratöre kaydırır.

## 2. ikas yapısı

### 2.1 Neden `GallerySeries` child'ı yok

ROADMAP'teki öneri seri başına bir COMPONENT_LIST child'ıydı. ikas'ta parent, child'ların
prop değerlerini okuyamıyor (`IkasComponentRenderer` opak liste alır). Sekme başlıkları,
`?seri=` parametresi ve seriler arası lightbox parent'ta olmak zorunda. Seri sayısı da sabit
(konfigüratör tam 3 seriyi destekliyor). Bu yüzden 3 seri **section üzerinde düz prop** olarak
tutulur, editörde seri başına prop grubu ile ayrılır. CoinConfigurator da aynı yaklaşımı
kullanıyor.

### 2.2 `CollectionGallery` section — prop'lar

**Genel (grup "Sayfa")**
| Prop | Tip | Varsayılan |
|---|---|---|
| `backLink` | LINK | PAGE INDEX, label "Ana Sayfa" |
| `title` | TEXT | "Kadim Seriler" |
| `inviteText` | TEXT | "MonetArts Miras Notu · Lütfen Okuyunuz" |
| `discoverText` | TEXT | "Seriyi Keşfet" |
| `designLink` | LINK | PAGE INDEX (konfigüratörün olduğu sayfa) |
| `showEmptyCells` | BOOLEAN | true |
| `backgroundColor` | COLOR | `#FBFAF7` (referans gündüz galeri zemini) |
| `anchorId` | TEXT | "galeri" |

**Grid etiketleri (grup "Grid")**: `colMale` "Bay", `colFemale` "Bayan", `colModel` "Model",
`colPackaging` "Paketleme", `rowSilver` "925 Gümüş", `row14k` "14 Ayar", `row22k` "22 Ayar",
`genderMale` "Erkek", `genderFemale` "Kadın".

**Lightbox (grup "Lightbox")**: `lbCta` "Bu Modeli Tasarla", `lbHint`
"← kaydır → · çift tıkla zoom", `lbPrev` "Önceki", `lbNext` "Sonraki", `lbClose` "Kapat",
`lbZoom` "Yakınlaştır".

**Seri başına (grup "Roma", "Osmanlı", "Mısır"; önek `roma`, `osmanli`, `misir`)**
| Prop | Tip | Roma varsayılanı |
|---|---|---|
| `…Tab` | TEXT | "Roma" (boşsa sekme gizlenir) |
| `…Eyebrow` | TEXT | "✦ Roma Serisi · Hikayesi ✦" |
| `…Title` | TEXT | "İmparatorluğun Mührü," |
| `…TitleItalic` | TEXT | "Sevginin Tanığı." |
| `…Body1`, `…Body2` | TEXT | referans paragrafları |
| `…Tag1`…`…Tag3` | TEXT | "El Kalemkâr", "Roma Rakamı", "Defne Frizi" |
| `…SilverMale`, `…SilverFemale`, `…SilverModel`, `…SilverPackaging` | IMAGE | — |
| `…Gold14Male` … `…Gold14Packaging` | IMAGE | — |
| `…Gold22Male` … `…Gold22Packaging` | IMAGE | — |

Toplam yaklaşık 24 genel + 3 × 21 seri = ~87 prop.

Görsel alt metni TEXT'lerden türetilir: "Roma · Bay · 925 Gümüş".

### 2.3 Sub-component `Lightbox`

`src/sub-components/Lightbox/`. Genel amaçlı (ileride ürün sayfasında da kullanılabilir).
Props: `items: { image, title, subtitle, alt }[]`, `index`, `onIndexChange`, `onClose`,
etiketler, isteğe bağlı `cta: { label, onClick }`, `hint`.

- `role="dialog" aria-modal="true"`, açılınca odak kapat butonunda, kapanınca tetikleyen
  karta döner. Tab odağı lightbox içinde döner.
- Body scroll kilidi açıkken.
- Görsel değişiminde 150ms opaklık geçişi. `prefers-reduced-motion` altında geçiş ve zoom
  animasyonu kapalı.
- Görsel `getDefaultSrc` + `createMediaSrcset`, `sizes="90vw"`.

### 2.4 URL ve davranış

- Sayfa: CUSTOM PAGE "Koleksiyon", slug `koleksiyon`, vitrinde `/pages/koleksiyon`. Sıra: Header · CollectionGallery · Footer.
- `?seri=roma|osmanli|misir` açılışta sekmeyi seçer (`Router.router_getQueryParams()`).
  Sekme değişince URL `history.replaceState` ile güncellenir, sayfa yeniden yüklenmez.
- Başlık çubuğu: site Header'ı zaten sabit olduğu için ikinci bir sticky çubuk yok.
  Üstte "← Ana Sayfa" linki ve `h1` başlık; × kaldırılır (geri linkiyle aynı işi yapıyordu).
- Boş hücre: ince altın çerçeve, ortada ✦, altta "Model · 925 Gümüş" etiketi.
  `showEmptyCells` kapalıysa boş hücreler render edilmez.
- 22 Ayar hücrelerindeki `saturate(1.3) brightness(.94)` filtresi korunur (merchant görsel
  yüklerse uygulanır).

### 2.5 Konfigüratöre geçiş (karar: seri + cinsiyet + materyal, hedef Ana sayfa)

"Bu Modeli Tasarla" ve "Seriyi Keşfet" `designLink` href'ine parametre ekler:
`?seri=osmanli&cinsiyet=bayan&materyal=14k`. `designLink` varsayılanı Ana sayfa (INDEX).
CoinConfigurator açılışta bu parametreleri okur, ön yüzü ve materyali ayarlar, kendini görünür
alana kaydırır (`scroll-margin-top` header yüksekliği). Sonra yalnız bu üç parametreyi URL'den
siler; sayfa yenilenince seçim ve kaydırma tekrarlanmaz. Parametre yoksa davranış bugünkü gibi.
Referanstan fark: referans yalnız seriyi değiştiriyordu.

| Parametre | Değerler | Konfigüratörde |
|---|---|---|
| `seri` | `roma`, `osmanli`, `misir` | ön yüz serisi |
| `cinsiyet` | `bay`, `bayan` | ön yüz cinsiyeti |
| `materyal` | `gumus`, `14k`, `22k` | materyal (varyant) |

Model ve Paketleme hücrelerinden gelen CTA yalnız `seri` ve `materyal` taşır.

### 2.6 Bağlanan linkler

- `SeriesCard`'a yeni ENUM prop `seriesKey` (özel enum "Seri": Roma/Osmanlı/Mısır). Doluysa
  kart linkine `?seri=<key>` eklenir. Ana sayfadaki 3 kartın linki → Koleksiyon PAGE.
- Hero `secondaryCta` ("Koleksiyonları İncele") → Koleksiyon PAGE.
- Footer'daki "Roma/Osmanlı/Mısır Serisi" linkleri → EXTERNAL `/pages/koleksiyon?seri=…`
  (PAGE linki parametre taşıyamıyor; dil prefix'i Faz 11'de ele alınır).

### 2.7 Kimlikler

| Kayıt | id |
|---|---|
| `CollectionGallery` section | `wnbxmerd-Cv0kAyhqw9` |
| Özel enum "Seri" (roma/osmanli/misir) | `5rzSm7oLdF` |
| Koleksiyon sayfası (CUSTOM, `/pages/koleksiyon`) | `zQWeWMtpEV` |
| Sayfa sırası | Header `E2CEgC1Ty0` · CollectionGallery `KmMWViHQSH` · Footer `tyvOc9iBPx` |

Görseller: seri başına gümüş ve 14 Ayar satırının Bay/Bayan hücreleri, konfigüratörün yüklü
sikke görselleriyle aynı id'ler. 22 Ayar, Model ve Paketleme hücreleri boş (yer tutucu).

## 3. Test listesi

1. Masaüstü ve 400px: sekmeler, hikâye kartı, grid (4 → 2 sütun), boş hücreler.
2. `/pages/koleksiyon?seri=misir` doğrudan açılınca Mısır sekmesi seçili.
3. Sekme değişince URL güncelleniyor.
4. Lightbox: aç, ← →, Esc, sayaç, tık zoom, odak geri dönüşü.
5. "Bu Modeli Tasarla" → konfigüratör doğru seri, cinsiyet, materyal ile açılıyor ve kayıyor.
6. Seri kartı → doğru sekme. Hero CTA → Koleksiyon.
7. Night şeması, `prefers-reduced-motion`, konsol hatası yok.
8. `check --json` ve `build` temiz.

### Sonuç (2026-09-13, editör önizlemesi)

| # | Durum |
|---|---|
| 1 | ✅ 1280 ve 400px. 640px altında davet çizgileri gizlendi (iki satıra kırılınca kenarda tire gibi kalıyordu) |
| 2 | ✅ (yayın önizlemesi) `/pages/koleksiyon?seri=misir` → Mısır seçili, "Seriyi Keşfet" `/?seri=misir` |
| 3 | ✅ Sekme tıklaması ve ← → klavye geçişi. Yayın önizlemesinde URL `?seri=osmanli` oluyor |
| 4 | ✅ Aç, ← →, Esc, sayaç, tık zoom, çift dokunma zoom, parmakla kaydırma (iki yön; zoom'dayken kapalı), kapanınca odak karta dönüyor. Görsel boyutu `object-fit: contain` ile düzeltildi |
| 5 | ✅ (yayın önizlemesi) "Osmanlı · Bayan · 14 Ayar" → `/?seri=osmanli&cinsiyet=bayan&materyal=14k` → 14 Ayar, ön yüz Osmanlı · ♀ Bayan seçili, parametreler URL'den silindi. Yumuşak kaydırma ilk yayında çalışmadı (gizli sekmede animasyon duruyor, erken tetikleniyordu); `load` sonrası anlık atlamaya çevrildi. İkinci yayında konfigüratör tam header'ın altına atlıyor (`top` = 84px) |
| 6 | ✅ Seri kartı (Osmanlı) → `/pages/koleksiyon?seri=osmanli`, Osmanlı seçili. Hero → `/pages/koleksiyon`. Footer seri linkleri `/koleksiyon?…` 404 veriyordu, `/pages/koleksiyon?seri=…` yapıldı; Mısır linki Mısır sekmesini açıyor |
| 7 | ✅ Night şeması. Yayın önizlemesinde konsol hatası yok, `html lang="tr"` |
| 8 | ✅ |
