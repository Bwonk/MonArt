# MonArt Konfigüratör — Kişiselleştirme Mantığı Spesifikasyonu

Kaynak: `reference/MonArtDEMO_clean/monart-lux.js` (kısaltma `L`), `MonArt Lux.html:199-755` (`H`), `monart-lux.css` (`C`). Bu doküman referans prototipin "atölye" (wizard) davranışını satır referanslarıyla çıkarır ve son bölümde ikas / Preact'e nasıl taşınacağını belirler.

> **Referans v2 (16.09.2026):** satır numaraları ilk sürüme (`MonArtDEMO_clean`) aittir. Yeni sürüm `reference/MonArt2_clean/` portre yönü (§7), Osmanlı sol yay (§3.5), zincir uzunluğu (§10.6) ve yeni sipariş anahtarları (§10.4) ekledi. Tüm farklar ve yeni satır numaraları: `docs/reference-v2-changes.md`.

Akış: **Materyal** → **1. Yüz** (seri, cinsiyet, opsiyonlar, isim, tarih, 3 foto) → **2. Yüz** (opsiyonel, ek ücret) → **Özet / Keseye At**. Sol sticky panelde canvas sikke önizlemesi her state değişiminde yeniden çizilir.

---

## 1. State modeli

### 1.1 `APP` (`L:84-98`)

```js
const APP = {
  materialType: '22k',                      // 'silver' | '14k' | '22k'
  platedBy: { silver: false, '14k': false }, // 24K kaplama tercihi, materyal başına hatırlanır ('22k' anahtarı yok)
  orderNote: '',                            // yazılır (L:2117) ama hiçbir yerde okunmaz (ölü)
  material: '22 Ayar Altın',                // materialLabel() türevi
  price: 160000,                            // computePrice() türevi (TRY)
  giftMode: false, giftCode: null,          // hediye sertifikası satışı
  redeemed: false, redeemCode: null,        // sertifika kodu doğrulandı → fiyat 0
  backEnabled: false,                       // 2. yüz + ek ücret
  currentFace: 'front',                     // canvas'ta çizilen yüz
  front: { theme: 0, gender: 'M', text: '', date: '01.01.01', roman: 'I·I·I', photoFiles: [null,null,null], beard: false, bust: false, sarik: false },
  back:  { theme: 1, gender: 'F', text: '', date: '01.01.01', roman: 'I·I·I', photoFiles: [null,null,null], beard: false, bust: false, sarik: false },
};
```

`FaceData`: `theme` (0 Roma, 1 Osmanlı, 2 Mısır), `gender` `'M'|'F'`, `text`, `date` (`GG.AA.YY`), `roman` (Roma rakamı), `photoFiles[3]`, `beard`, `bust`, `sarik`. İki yüz tamamen bağımsızdır.

### 1.2 `THEMES` (`L:24-34`)

| idx | key | name / sub | limit | dateOn | opsiyon | görsel anahtarları |
|---|---|---|---|---|---|---|
| 0 | `roma` | Roma / İmparator Serisi | 20 | **true** | `bustOpt: true` | `bay`, `bayan`, `bay_silver`, `bayan_silver`, `bay_nobust`, `bayan_nobust`, `bay_nobust_silver`, `bayan_nobust_silver` |
| 1 | `osmanli` | Osmanlı / Sultan Serisi | 20 | false | `sarikOpt: true`, `beardOpt: false` | `bay`, `bayan`, `bay_silver`, `bayan_silver`, `bay_nosarik`, `bayan_nosarik`, `bay_nosarik_silver`, `bayan_nosarik_silver`, `bay_sakal`, `bay_silver_sakal` |
| 2 | `misir` | Mısır / Firavun Serisi | 15 | false | — (`beardOpt: false`) | `bay`, `bayan`, `bay_silver`, `bayan_silver` |

Tüm görseller `L:159-167`'de `loadImg()` ile önceden yüklenir. `coinScale` (`L:186,255`) hiçbir temada tanımlı değildir → daima 1.

### 1.3 Materyal ve fiyat sabitleri (`L:64-82`)

```js
const MATERIALS = {
  silver: { name: '925 Ayar Gümüş', short: '925 Gümüş', price: 22000 },
  '14k':  { name: '14 Ayar Altın',  short: '14K Altın',  price: 90000 },
  '22k':  { name: '22 Ayar Altın',  short: '22K Altın',  price: 160000 },
};
const BACK_SURCHARGE = { silver: 8000, '14k': 14000, '22k': 24000 };  // 2. yüz ek ücreti
const PLATING_PRICE = 3000;              // gümüşe 24K kaplama
const PLATING_FREE_FOR = '14k';          // 14K'da kaplama ücretsiz
function platingAllowed(m) { return m === 'silver' || m === PLATING_FREE_FOR; }
function platedOf(m)       { return !!APP.platedBy[m]; }
function isPlatedLook()    { return platingAllowed(APP.materialType) && platedOf(APP.materialType); }
function effectiveMatType(){ return isPlatedLook() ? '22k' : APP.materialType; }   // görsel için efektif materyal
const MAT_SPEC = { silver: '8–10 gr', '14k': '10–12 gr', '22k': '14–16 gr' };
const COIN_DIAMETER = '32 mm';
```

`MATERIALS[*].short` kullanılmaz. `MAT_SPEC`/`COIN_DIAMETER` HTML'de elle tekrar edilmiştir (`H:261,267,273`) → çift kaynak.

### 1.4 İsim önerileri (`L:37-62`)

```js
const NAME_SUGGESTIONS = {
  roma:    [{ g:'M', title:'IMPERATOR' }, { g:'F', title:'AUGUSTA' }],
  osmanli: [{ g:'M', title:'KAPUDAN' },   { g:'F', title:'VALİDE SULTAN', suffix:true }],
  misir:   [{ g:'M', title:'PHARAOH', tight:true }, { g:'F', title:'QUEEN', tight:true }],
};
// suggParts(s): suffix → { prefill: ' '+title, caret: 0 } (isim başa yazılır)
//               aksi   → { prefill: title+' ', caret: son }
//               tight  → ayırıcı boşluk yok (Mısır: hiyeroglifte boşluk gerekmez)
```
Her öneri kartının `desc` metni vardır (`L:39-49`). `SUGGESTION_NOTES.misir` boşluk uyarısıdır (`L:60-62`).

### 1.5 Karakter güvenliği (`L:13-21`)

`fontSafe()` Türkçe/Fransızca/İspanyolca aksanlı harfleri Latin karşılığına indirir (ş→s, ç→c, ğ→g, ı→i, İ→I, ö→o, ü→u, â→a, î→i, û→u, é/è→e, ñ→n; büyük harfler dahil) çünkü canvas fontlarında (özellikle AlphaKufi) bu glifler yoktur.

---

## 2. Seçim → görsel matrisi

### 2.1 `getCoinImg(themeIdx, gender, matType, beard, bust, sarik)` (`L:133-156`)

`isSilver = matType === 'silver'`; `drawCoin` bu fonksiyonu **`effectiveMatType()`** ile çağırır (`L:178`). Öncelik sırası (ilk eşleşen kazanır):

1. `t.sarikOpt && sarik === false` → `{bay|bayan}_nosarik[_silver]`
2. `t.bustOpt && bust === false` → `{bay|bayan}_nobust[_silver]`
3. `gender === 'M' && beard && t.beardOpt` → `bay_silver_sakal` / `bay_sakal`
4. `isSilver` → `bay_silver` / `bayan_silver`
5. fallback → `bay` / `bayan`

**Altın / gümüş kararı tek noktadadır:** `effectiveMatType() === 'silver'`. 14K ve 22K aynı altın PNG'yi kullanır; fark yalnızca canvas filtresidir (bkz. §3). **Gümüş + kaplama açık → `'22k'` döner → altın PNG çizilir (22K görünümü).**

### 2.2 Tam matris (22 dosya, `assets/`)

| Seri | Cinsiyet | Efektif materyal | Opsiyon | Dosya |
|---|---|---|---|---|
| Roma | M | altın (14k/22k) | büstlü | `coin_roma_bay_clean_tone_flip.png` |
| Roma | M | altın | büstsüz | `coin_roma_bay_nobust_tone_flip.png` |
| Roma | M | gümüş | büstlü | `coin_roma_bay_silver_clean_tone_flip.png` |
| Roma | M | gümüş | büstsüz | `coin_roma_bay_nobust_silver_tone_flip.png` |
| Roma | F | altın | büstlü | `coin_roma_bayan_v2_tone_flip.png` |
| Roma | F | altın | büstsüz | `coin_roma_bayan_nobust_tone_flip.png` |
| Roma | F | gümüş | büstlü | `coin_roma_bayan_silver_tone_flip.png` |
| Roma | F | gümüş | büstsüz | `coin_roma_bayan_nobust_silver_tone_flip.png` |
| Osmanlı | M | altın | sarıklı | `coin_osmanli_bay_tone.png` |
| Osmanlı | M | altın | sarıksız | `coin_osmanli_bay_nosarik_fit.png` |
| Osmanlı | M | gümüş | sarıklı | `coin_osmanli_bay_silver_tone.png` |
| Osmanlı | M | gümüş | sarıksız | `coin_osmanli_bay_nosarik_silver_fit.png` |
| Osmanlı | F | altın | sarıklı | `coin_osmanli_bayan_tone.png` |
| Osmanlı | F | altın | sarıksız | `coin_osmanli_bayan_nosarik_fit.png` |
| Osmanlı | F | gümüş | sarıklı | `coin_osmanli_bayan_silver_tone.png` |
| Osmanlı | F | gümüş | sarıksız | `coin_osmanli_bayan_nosarik_silver_fit.png` |
| Osmanlı | M | altın | sakallı *(ulaşılamaz, `beardOpt:false`)* | `coin_osmanli_bay_sakal_tone.png` |
| Osmanlı | M | gümüş | sakallı *(ulaşılamaz)* | `coin_osmanli_bay_silver_sakal_tone.png` |
| Mısır | M | altın | — | `coin_misir_bay_gold_v3_flip.png` |
| Mısır | M | gümüş | — | `coin_misir_bay_silver_tone_flip.png` |
| Mısır | F | altın | — | `coin_misir_bayan_gold_prev_flip.png` |
| Mısır | F | gümüş | — | `coin_misir_bayan_silver_tone_flip.png` |

Not: `bust`/`sarik` başlangıçta `false` olduğundan ilk çizim **büstsüz / sarıksız** varyantı seçer (bkz. §13 bug #16-17).

### 2.3 Gümüş PNG yoksa desatürasyon (`L:213-225`)

`effectiveMatType()==='silver'` ve gümüş görsel tanımsızsa clip içinde `ctx.fillStyle='rgba(180,180,200,0.55)'; ctx.globalCompositeOperation='saturation'; fillRect(...)` ile altın PNG grileştirilir. Her üç tema da `bay_silver`/`bayan_silver` tanımladığı için **pratikte hiç tetiklenmez**.

---

## 3. Canvas render pipeline

### 3.1 `drawCoin(forceFace)` (`L:174-261`)

- Canvas `#coin-canvas` (`H:219`), `SIZE = 560` (`L:173`); CSS'te masaüstü `max-width:280px` (`C:613-622`), mobil 240px (`C:1783-1798`) → 2x/2.33x DPR.
- `data = APP[face]`, `img = getCoinImg(data.theme, data.gender, effectiveMatType(), data.beard, data.bust, data.sarik)`.
- Geometri: `cx = cy = 280`, `R = SIZE*0.46 = 257.6`.
- Halo ve kenar halkaları **kaldırılmış** (`L:189`, `L:228-229` yorumları). Radial gradient (`#FFE08A → #C9A84C → #5A4310`) yalnız görsel yüklenmemişse fallback olarak çizilir (`L:204-209`).
- Clip: `arc(cx,cy,R,0,2π)` → `clip()`.
- Görsel + **materyal filtresi** (`L:197-202`):

| Efektif materyal | PNG | `ctx.filter` |
|---|---|---|
| `22k` (kaplama dahil) | altın | `saturate(1.30) brightness(0.94)` |
| `14k` | altın | yok (PNG'nin kendi tonu) |
| `silver` | gümüş | yok |

- Metin katmanı (`L:231-260`):

| Seri | İsim motoru | Tarih motoru |
|---|---|---|
| Roma | `drawArcText(text, cx, cy, R*0.76 = 195.78)` üst yay | `drawBottomArcText(roman, …, 195.78)` alt yay (Roma rakamı) |
| Osmanlı | `drawSideText(text, cx, cy, R*0.60 = 154.56, 'right', 'script', 'bottom')` sağ yan yay, AlphaKufi | *(kod var, `dateOn:false` → çalışmaz)* |
| Mısır | **yazı çizilmez** (metin yalnız siparişe gider) | — |

### 3.2 Mürekkep rengi (`L:264-277`)

```js
inkStops(): silver ? ['#FFFFFF','#DCE0E8','#7E848F'] : ['#FFF0B8','#EBCB72','#9A7218']
inkShadow(a): silver ? `rgba(18,20,26,${a})` : `rgba(40,26,4,${a})`
inkGradient(x0,y0,x1,y1): 3 stop'lu lineer gradyan (0 / 0.5 / 1)
```
Karar `APP.materialType`'a göredir, `effectiveMatType()` değil → gümüş + kaplama durumunda sikke altın görünürken yazı gümüş tonunda kalır (bug #18).

### 3.3 `drawArcText` — Roma üst yay (`L:370-410`)

```
text      = fontSafe(text.toUpperCase()); n = text.length
maxArc    = π * 0.82                      // 147.6°
pitch     = radius * maxArc / n
fontSize  = round(clamp(pitch * 0.92, 15, 30))
usedPitch = min(pitch, fontSize / 0.92)
spread    = min(maxArc, usedPitch * n / radius)
font      = `700 ${fontSize}px Cinzel, serif`; textAlign center; textBaseline middle
grad      = inkGradient(cx, cy - radius - fontSize, cx, cy - radius + fontSize)   // dikey
cursor    = -π/2 - spread/2               // üst merkezden simetrik, soldan sağa
her harf: angularWidth = spread / n (EŞİT pay); ang = cursor + angularWidth/2
          translate(cx + cos(ang)*radius, cy + sin(ang)*radius); rotate(ang + π/2)
          gölge inkShadow(0.92) @ (1.1, 1.1)  [aynı çağrı iki kez, L:402-403]; yüzey grad @ (0,0)
```
Örnek: 5 harf → 30px, spread 0.83 rad; 20 harf → 23px, spread 2.55 rad.

### 3.4 `drawBottomArcText` — Roma alt yay (`L:413-446`)

```
maxArc = π * 0.7 (126°); fontSize = round(clamp(pitch * 0.90, 13, 24)); font `600 … Cinzel`
grad   = inkGradient(cx, cy + radius - fontSize, cx, cy + radius + fontSize)
cursor = π/2 + spread/2; her harfte cursor -= angularWidth (soldan sağa okunur)
rotate(ang - π/2)  // harf tepeleri merkeze
gölge inkShadow(0.7) @ (0.7, 0.7)
```

### 3.5 `drawSideText` — Osmanlı yan yay (`L:280-368`)

İmza `drawSideText(text, cx, cy, radius, side, kind, anchor, leftAngle, bottomAngleLeftOverride)`; kullanılan tek çağrı `side='right', kind='script', anchor='bottom'`.

```
text      = fontSafe(text.toLocaleLowerCase('tr')).slice(0, 22)     // script → küçük harf (İ→i, I→ı)
fam       = '"AlphaKufi", "Cinzel", serif'; weight = 400; fontSize = 30; spacing = 1.0
maxSpread = 1.95 rad
widths[i] = measureText(ch).width + spacing; total = Σ widths; spread = total / radius
spread > maxSpread ise fontSize = max(15, fontSize * maxSpread / spread) ve yeniden ölç
grad      = inkGradient(cx - radius, cy, cx + radius, cy)            // yatay
dir = -1; rotOffset = -π/2; startCursor = 0.95 rad (alt-sağ, ~saat 4:30) → yazı yukarı doğru sarar
her harf: angularWidth = widths[i] / total * spread (ORANTILI); ang = cursor + dir*angularWidth/2
          rotate(ang + rotOffset); gölge inkShadow(0.75) @ (0.8, 0.8); yüzey grad
```
Ölü dallar: `side='left'`, `leftAngle`, `bottomAngleLeftOverride`, `kind!=='script'` (Cinzel 600, limit 40), `grooveStart/End`. Osmanlı tarih için `data.date.split('').reverse()` (`L:248`) — `dateOn:false` yüzünden çalışmaz.

**v2 — portre yönü ile sol yay** (`MonArt2_clean/monart-lux.js:247-260`, `291-382`): isim portrenin önündeki yaya yazılır; `dir === 'left'` ise `side='left'`. Yeni imza `drawSideText(text, cx, cy, radius, side, kind, anchor, leftAngle, bottomAngleOverride, wideArea)`.
```
wide      = wideArea ?? (side === 'right')          // isim true, tarih false
charLimit = wide ? 22 : 10;  maxSpread = wide ? 1.95 : 1.25
sağ yay:  startCursor = bottomAngleOverride ?? 0.95;       step = -1   (değişmedi)
sol yay:  bottom = bottomAngleOverride ?? (π − 0.95)
          startCursor = bottom + spread;                   step = -1
          → harf tepesi yine merkeze dönük (rotOffset −π/2), metnin SONU alta sabit, başı yukarı tırmanır
her harf: ang = cursor + step * angularWidth / 2;  cursor += step * angularWidth
```
Tarih dalı v2'de ters çevirme yapmaz, açıyı aynalar (`θ → π − θ`); bizde Osmanlı tarihi yine kapalı.

### 3.6 Yüz çevirme animasyonu

CSS `.preview-canvas { transition: transform 280ms cubic-bezier(.55,.04,.55,1); transform-origin: center }` + `.is-flipping { transform: scaleX(0) }` (`C:624-631`). `flipToFace(target, {scrollToStep})` (`L:952-975`): `is-flipping` ekle → 280 ms sonra `APP.currentFace = target`, `setFace`, class kaldır (geri açılır) → istenirse `#step-{target}` top−100'e smooth scroll.

---

## 4. Metin kuralları

- **Limit:** `THEMES[i].limit` (Roma 20, Osmanlı 20, Mısır 15); `syncFaceUI` input `maxlength`'ini set eder (`L:601`).
- **Büyük harf:** input handler `value.toUpperCase().slice(0, limit)` (`L:831`, locale'siz) + CSS `text-transform: uppercase` (`C:916`).
- **Tema değişince** (`L:808-822`): metin yeni limite kırpılır; `!dateOn` ise `date`/`roman` silinir (geri dönüşü yok).
- **Sayaç:** `[data-char-count]` = `${len} / ${limit}`, limitte `is-max` (`C:852` turuncu).
- **Placeholder:** seri + cinsiyete göre ilk öneri başlığı (`L:602-604`).
- **Opt-in** (`setupFieldOptIns` `L:1759-1796`): isim ve tarih alanları `[data-field-opt]` checkbox'ıyla açılır/kapanır; kapatınca input ve state temizlenir (`text=''` / `date='', roman=''`), `[data-roman]` → `—`; input'a tıklamak kutuyu otomatik açar. Başlangıç: açık.
- **Öneriler** (`syncFaceUI` `L:634-670`): her çağrıda `innerHTML` ile yeniden yazılır; hint butonu varsayılan açık; kart `data-suggest={prefill}`; iki cinsiyet grubu da gösterilir (filtre yok). Tıklama (`L:846-865`): `value = prefill.toUpperCase().slice(0,limit)`, caret `suffix ? 0 : sonda`, `requestAnimationFrame` ile focus + `setSelectionRange`.

---

## 5. Tarih mantığı (`L:100-122`)

```js
formatDate(raw): d = raw.replace(/\D/g,'').slice(0,6); ≤2 → d; ≤4 → GG.AA; 6 → GG.AA.YY
toRoman(n): standart M CM D CD C XC L XL X IX V IV I
dateToRoman(str): str.split('.') → parseInt → 0/NaN parçaları düşer → toRoman → '·' (U+00B7) ile birleştir
```
- Yalnız `dateOn:true` seride (Roma) görünür (`L:610-611`).
- `'01.01.01'` varsayılanı ilk focus'ta temizlenir (`L:871-882`).
- Canvas'a giden değer `data.roman`; ham tarih `Yuz*_Tarih_Raw` olarak siparişe gider.
- Kısmi giriş geçerli: `19` → `XIX`, `19.08` → `XIX·VIII`. `00.08.97` → `VIII·XCVII` (gün kaybolur, bug #24).

---

## 6. Materyal adımı ve fiyat

### 6.1 `setMaterial(matType)` (`L:474-502`)
`APP.materialType` set → kaplama kartı (`[data-plate-toggle]`, iki kopya `#plateCard` ve `#giftPlateCard`) `hidden = !platingAllowed`, checkbox `= platedOf`, açıklama `'14 ayar altın gövde üzerine 24 ayar altın kaplama.'` / `'925 gümüş gövde üzerine 24 ayar altın kaplama.'`, fiyat `'Ücretsiz'` (14K) / `'+₺3.000'` → `APP.material = materialLabel()` → `APP.price = computePrice()` → `.mat-card`/`.gift-card` `is-active` → `renderPriceAndBadge()` → `updateBackToggleUI()` → `drawCoin()` → `renderSummary()`.

`materialLabel()` (`L:469-473`): kaplamalı gümüş `'925 Ayar Gümüş · 24 Ayar Altın Kaplama'`, kaplamalı 14K `'14 Ayar Altın · 24 Ayar Altın Kaplama'`, aksi `MATERIALS[m].name`.

Kaplama checkbox'ı (`L:705-708`): `APP.platedBy[materialType] = checked` → `setMaterial(materialType)`. Önizlemede `effectiveMatType()` `'22k'` döner → altın PNG + 22K filtresi.

### 6.2 `computePrice()` (`L:461-468`)
```js
if (APP.redeemed && !APP.giftMode) return 0;
const base = MATERIALS[m].price;
const withBack = APP.backEnabled ? base + BACK_SURCHARGE[m] : base;
return withBack + (m === 'silver' && platedOf('silver') ? PLATING_PRICE : 0);
```

| Materyal | Tek yüz | Çift yüz | + Kaplama (tek / çift) |
|---|---|---|---|
| 925 Gümüş | 22.000 | 30.000 | 25.000 / 33.000 |
| 14K Altın | 90.000 | 104.000 | ücretsiz (90.000 / 104.000) |
| 22K Altın | 160.000 | 184.000 | kaplama yok |

### 6.3 Yardımcılar
- `updateBackToggleUI()` (`L:504-514`): `[data-back-surcharge]` → `(+₺{BACK_SURCHARGE[m]})`; materyal/hediye kartlarındaki `data-price-base` fiyatlarına 2. yüz açıkken surcharge eklenir.
- `renderPriceAndBadge(animate)` (`L:531-544`): etiket `'Toplam Fiyat'` / redeem'de `'Sertifika ile Karşılandı'`; `₺` + `toLocaleString('tr-TR')`; `animate` → `price-pop` class (`C:2380-2381`, scale 1.12) — yalnız `setBackEnabled` çağırır.

---

## 7. Yüz seçenekleri (`syncFaceUI` `L:582-676`)

| Kontrol | Görünür | State | Görsele etkisi |
|---|---|---|---|
| Cinsiyet `[data-gender]` | daima | `gender` | `bay` ↔ `bayan` görseli |
| **Portre Yönü** `[data-dir]` (v2) | daima; cinsiyetten sonra | `dir` (`'right'` varsayılan) | `left` → görsel aynalanır; Osmanlı'da isim sol yaya geçer. "i" düğmesi `#dirModal` bilgi penceresini açar (metinler `docs/reference-v2-changes.md` §2.2) |
| Büst `[data-bust]` | yalnız Roma (`bustOpt`) | `bust` | `false` → `_nobust` |
| Sarık `[data-sarik-cb]` | yalnız Osmanlı (`sarikOpt`); `checked = sarik !== false` | `sarik` | `false` → `_nosarik` |
| Sakal `[data-beard-cb]` | hiç (`beardOpt:false`) | `beard` | `bay_sakal` (ölü) |
| Hiyeroglif rehberi `[data-glyph-guide]` | yalnız Mısır | — | — |
| Tarih alanı | yalnız Roma (`dateOn`) | — | — |

Handler kalıbı (`L:776-805`): state yaz → `is-active` toggle → gerekirse `setFace(face)` → `drawCoin()` → `renderSummary()`. Tema/cinsiyet/metin ayrıca `syncFaceUI()` çağırır; büst/sarık/sakal çağırmaz.

---

## 8. İki yüz

- `setBackEnabled(on)` (`L:516-529`): `APP.backEnabled`, fiyat yeniden hesap, iki toggle (`#back-face-toggle`, `#gift-back-toggle`) senkron, `#step-back.is-disabled-face` (form alanları `display:none`, `C:2374-2379`), otomatik `flipToFace`, `renderPriceAndBadge(true)`.
- `flipCoin()` (`L:976-981`): 2. yüz kapalıysa önce açar (bu da flip tetikler), sonra `flipToFace(next, {scrollToStep:true})` → çift flip yarışı (bug #21).
- **Aynı fotoğraf** `[data-same-photo]` (`L:916-947`): açılınca `back.photoFiles = front.photoFiles.slice()` (anlık kopya), arka yüz foto inputları `disabled`, telif kutusu işaretlenip kilitlenir (`is-locked`).
- `setupScrollFaceSync()` (`L:984-1018`): `refY = innerHeight * 0.45`; referans çizgisi `#step-front`/`#step-back` içindeyse o yüz, değilse merkezi yakın olan; değişince `flipToFace(target)` (2. yüz kapalıysa back'e geçmez). rAF-throttled, passive scroll.
- `setFace(face)` (`L:574-580`): yüz etiketini değiştirir, `drawCoin(); syncFaceUI()`.

---

## 9. Fotoğraflar

- Her yüzde 3 slot `input[type=file][accept=image/*][data-slot=0|1|2]` (`H:396-422`, `570-596`), etiket "Favori 1/2/3", alt metin "JPG / PNG · Max 5MB" (yalnızca metin; **doğrulama yok**).
- Handler (`L:897-913`): `data.photoFiles[slot] = file`; `URL.createObjectURL` ile önizleme (revoke edilmez); dosya adı etikete yazılır; `.upload.is-filled`.
- **Telif onayı** `uploadRightsOk()` (`L:1553-1567`): görünür ve işaretsiz `[data-upload-rights]` varsa (2. yüz kapalıysa onunki atlanır) `is-missing` + `consentShake` + toast `'✦ Lütfen görsel telif ve baskı kalitesi sorumluluğunu onaylayınız.'` + scroll; fotoğraf yüklenmemiş olsa bile zorunludur.
- **Foto rehberi** (`L:1709-1755`): `label.upload` tıklaması capture fazında yakalanır → `#photoGuideModal` (45°/60°/90° açılar, `photo_guide_angles.jpg`) → "Devam" → `lbl.dataset.guideOk='1'` + `input.click()`.

---

## 10. Özet ve sepet

### 10.1 `renderSummary()` (`L:678-697`)
- `#sum-material` = `{APP.material} · {MAT_SPEC[m]} · 32 mm (±1 gr farklılık gösterebilir)`
- `#sum-front` / `#sum-back` = `{Tema} · {♂ Bay|♀ Bayan} · {METİN|—}{ · ROMA (dateOn ise)}` — 2. yüz kapalıyken de yazılır (bug #27).
- `#sum-total` = `₺{price}`.
- Stil testi `[data-style-opt]` (`L:1933-1938`, `H:641-657`): yalnız `is-active` class'ı; hiçbir yerde okunmaz.

### 10.2 Hediye modu
- Modlar: `self` / `gift` / `redeem` (`H:679-701`). `setGiftMode(on)` (`L:1490-1515`): `body.gift-mode`, `#gift-panel`, buton metni `btn_gift` ↔ `btn_addcart`, fiyat yeniden.
- Kod formatı `MONETARTS-XXXX-XXXX-XXXX`; `generateGiftCode()` (`L:1486-1489`) `Math.random().toString(36).slice(2,6)` × 3; doğrulama regex `^MONETARTS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$` (`L:737`); geçerli → `redeemed = true`, fiyat 0, mesaj `'Mirasınız teslim alındı — tasarımınız ücretsiz…'`.
- `addGiftConfirmed()` (`L:1516-1551`): sepete sertifika satırı (`productId: 'monart-gift-certificate'`, `variantId: materialType`, `properties: {Tip, Maden, Sertifika_Kodu}`).
- `consumeRedemption()` (`L:1577-1589`): sepete ekleyince kodu tüketir, fiyat tam fiyata döner.

### 10.3 `addToCart()` akışı
`addToCart` (`L:1570-1576`): giftMode → `addGiftConfirmed`; değilse `uploadRightsOk()` → `openSealModal()` (`#sealModal`, "kalıba döküldükten sonra geri dönüşü mümkün değildir") → `[data-seal-confirm]` → `addToCartConfirmed()` (`L:1591-1624`): `buildLineItemProperties()`, canvas snapshot (**bug #15**: `getElementById('preview-canvas')` yanlış id, daima boş), `CART.items.push({ title: '{Tema} · {Bay|Bayan} · {Materyal}', meta: 'Ön: … · Arka: …', price, frontImg, properties })`, `renderCart(); openCart()`, taslak `window.ikas.cart.addItem({ productId:'monart-coin-necklace', variantId: materialType, quantity:1, customProperties })`, toast.

### 10.4 `buildLineItemProperties()` (`L:1460-1483`) — 19 anahtar

| Key | Türetme | Örnek |
|---|---|---|
| `Materyal` | `APP.material` | `925 Ayar Gümüş · 24 Ayar Altın Kaplama` |
| `Yuz1_Tema` / `Yuz2_Tema` | `THEMES[theme].name` | `Roma` |
| `Yuz1_Cinsiyet` / `Yuz2_Cinsiyet` | `M ? 'Bay' : 'Bayan'` | `Bay` |
| `Yuz1_Bust` / `Yuz2_Bust` | `bustOpt ? (bust ? 'Büstlü' : 'Büstsüz') : ''` | `Büstsüz` |
| `Yuz1_Sakal` / `Yuz2_Sakal` | `(beardOpt && M) ? … : ''` | `''` (daima) |
| `Yuz1_Sarik` / `Yuz2_Sarik` | `sarikOpt ? (sarik !== false ? 'Sarıklı · Tülbentli' : 'Açık Baş (Sarıksız)') : ''` | `Açık Baş (Sarıksız)` |
| `Yuz1_Metin` / `Yuz2_Metin` | `text` | `IMPERATOR MARCUS` |
| `Yuz1_Tarih_Raw` / `Yuz2_Tarih_Raw` | `dateOn ? date : ''` | `19.08.97` |
| `Yuz1_Tarih_Roma` / `Yuz2_Tarih_Roma` | `dateOn ? roman : ''` | `XIX·VIII·XCVII` |
| `Yuz1_Fotograf` / `Yuz2_Fotograf` | `photoFiles.map(f => f?.name ?? '—').join(' \| ')` | `ali_90.jpg \| ali_60.jpg \| —` |
| *(redeem'de)* `Sertifika_Kodu`, `Odeme` | `redeemCode`, `'Hediye sertifikası ile karşılandı'` | |
| *(v2)* `Yuz1_Portre_Yonu` / `Yuz2_Portre_Yonu` | `dir === 'left' ? 'Sola Bakan Profil' : 'Sağa Bakan Profil'` | `Sağa Bakan Profil` |
| *(v2)* `Zincir_Uzunlugu` | `(APP.chain \|\| '55') + ' cm'` | `55 cm` |
| *(v2)* `Indirim_Kodu`, `Indirim_Orani`, `Indirim_Sahibi` | sepet indirim kodu; bizde ikas kuponu, satıra yazılmaz | `ECE22`, `%5`, `Elçi · Ece Valide` |

Eksik: `backEnabled`, `orderNote`, kaplama bayrağı (yalnız etikette), stil testi.

### 10.5 `resetDesign()` (`L:547-572`, `#clear-design`)
Her iki yüzde `theme=0, text='', date='', roman='', beard/bust/sarik=false, photoFiles=[null×3]`, v2'de `dir='right'`; foto önizlemeleri, opt-in kutuları (açık), aynı-foto, telif kutuları sıfırlanır; `setFace('front')`. **Sıfırlanmayan:** materyal, kaplama, `backEnabled`, zincir (v2), hediye/redeem, sepet, stil testi. `date` `''` olur (başlangıç `'01.01.01'` idi).

### 10.6 Zincir uzunluğu (v2, `MonArt2_clean/MonArt Lux.html:655-664`, `monart-lux.js:730-736`)
Üst seviye alan, "2. Yüzü Kişiselleştir"den sonra ve Sipariş Notu'ndan önce. `APP.chain` = `'50' | '55' | '60'`, varsayılan `'55'`. Tıklama aktif sınıfı değiştirir ve `renderSummary()` çağırır; fiyatı etkilemez, özet satırına yazılmaz, yalnız sipariş satırında `Zincir_Uzunlugu`.

---

## 11. Mobil sticky önizleme (`L:1283-1319`, `C:1758-1835`)

`≤ 860px`: `.preview { position: sticky; top: var(--header-h); height: 136px; grid-template-columns: 96px 1fr 96px }`, sikke `.preview__stage` 240×240 (bar'dan 104px taşar), fiyat kutusu sağda mutlak, yüz etiketi gizli. JS clamp: `overlap = (HEADER_H 84 + h + COIN_OVERFLOW 104 + GAP 16) − addToCartButton.top`; `overlap > 0` ise `transform: translate3d(0, -overlap, 0)` → sikke "Keseye At" butonunu örtmez. Masaüstü: `.preview { sticky; top: calc(--header-h + 20px); max-height: calc(100vh - --header-h - 32px); overflow: auto }`, stage `max-width: 280px`.

---

## 12. Fontlar

| Yer | `ctx.font` |
|---|---|
| Roma isim (`L:384`) | `700 {fs}px Cinzel, serif` |
| Roma tarih (`L:424`) | `600 {fs}px Cinzel, serif` |
| Osmanlı (`L:292,316`) | `400 {fs}px "AlphaKufi", "Cinzel", serif` |

Yükleme (`L:2196-2206`): `document.fonts.ready.then(drawCoin)` + `document.fonts.load('400 40px "AlphaKufi"')`/`'400 30px'` → `drawCoin()`. Referansta AlphaKufi yerel ttf'dir (`C:6-12`); **ikas'ta yerel font kullanılamaz** → Google Fonts **Reem Kufi** tema tipografi token'ı (`Coin Script`).

---

## 13. Gotcha listesi

**Ölü kod / ulaşılamaz:** Osmanlı tarih dalı (`dateOn:false`); sakal (`beardOpt:false` → UI, state, 2 PNG, `Yuz*_Sakal`); `drawBottomDate` (`L:448-458`); `drawSideText` non-script dalı ve `groove*`; `coinScale`; gümüş desatürasyon; `MATERIALS.short`; `APP.orderNote`; `.preview.is-pinned`; `#material-badge` (HTML'de yok); stil testi; `flipBtn.disabled=false` sabit; quota/welcome modalları zorla kapalı (`L:1656-1657`, `L:1693`).

**Gerçek buglar:** (15) snapshot `preview-canvas` ≠ `coin-canvas` → sepet küçük resmi boş; (16) sarık `false` başlar, "default on" idiomu (`!== false`) bozuk → Osmanlı sarıksız açılır; (17) büst `false` başlar → Roma canvas büstsüz, tema kartı thumbnail'i büstlü; (18) `inkStops/inkShadow` `APP.materialType` kullanır (kaplamada tutarsız); (19) `drawArcText` gölgesi iki kez; (20) Osmanlı kadın tarih açısı yorumla çelişir (ölü); (21) `flipCoin` çift flip; (22) `setupScrollFaceSync` `lastTarget` erken set; (23) `generateGiftCode` <4 karakter üretebilir; (24) `dateToRoman` 0'ı düşürür; (25) `revokeObjectURL` yok; (26) fotoğrafta boyut/tip doğrulaması yok; (27) `renderSummary` 2. yüzü koşulsuz yazar; (28) büst checkbox senkronsuz; (29) `uploadRightsOk` `offsetParent` testi kırılgan; (30) `resetDesign` date `''` vs init `'01.01.01'`; (31) hediye moduna geçince redeem fiyatı sessizce tam fiyata döner.

**Çift kaynak:** fiyatlar (`MATERIALS` ↔ HTML `data-price-base`), gramaj/çap (`MAT_SPEC` ↔ `.mat-spec`), surcharge metni (`(+₺24.000)` HTML sabiti), kaplama fiyatı (`PLATING_PRICE` ↔ `'+₺3.000'` literal ↔ HTML), `HEADER_H`/`COIN_OVERFLOW` (JS ↔ CSS), sayaç/roman HTML default'ları (`0 / 15`, `XIX·VIII·XCVII`) state ile uyumsuz, kaplama kartı ve 2. yüz toggle'ı ikişer kopya, tema thumbnail'leri hard-coded ve `THEMES` path'lerinden bağımsız.

---

## 14. ikas'a taşıma haritası

### 14.1 Ürün ve opsiyon modeli (admin'de kurulacak)
- Tek ürün **"Sikke Kolye"**; **varyant tipi Materyal**: 925 Ayar Gümüş / 14 Ayar Altın / 22 Ayar Altın (fiyat varyantta). `MATERIALS` sabitleri koda gömülmez; fiyat `getProductVariantFormattedFinalPrice` ile gösterilir.
- **Product Option Set** (ikas kişiselleştirme; admin kurulum listesi ve isim sözleşmesi: `docs/configurator-admin-setup.md`):

| Referans alanı | ikas opsiyonu | Not |
|---|---|---|
| 24K kaplama | CHECKBOX, fiyatlı (AMOUNT 3000; 14K için `otherPrices` 0) | 22K varyantında gizli (koşullu opsiyon veya UI'da gizle) |
| 2. yüzü kişiselleştir | CHECKBOX, fiyatlı (`otherPrices` materyale göre 8000/14000/24000) | parent → Yüz2 alanları child opsiyon |
| Yüz1/2 Seri | CHOICE box (Roma/Osmanlı/Mısır) | görsel + metin limitini belirler |
| Yüz1/2 Cinsiyet | CHOICE (Bay/Bayan) | |
| Yüz1/2 Portre Yönü (v2) | CHOICE (Sağa Bakan Profil / Sola Bakan Profil) | varsayılan sağ; Yüz2 child |
| Zincir Uzunluğu (v2) | CHOICE (50 cm / 55 cm / 60 cm), üst seviye | varsayılan 55, fiyatsız |
| Yüz1 Büst | CHOICE (Büstlü/Büstsüz) — Roma child | |
| Yüz1/2 Sarık | CHOICE (Sarıklı · Tülbentli / Açık Baş) — Osmanlı child | |
| Yüz1/2 İsim | TEXT (max 20; Mısır 15 kodda kırpılır) | canvas'a yazılır |
| Yüz1 Tarih | TEXT `GG.AA.YY` — Roma child | Roma rakamı kodda üretilir, `Tarih_Roma` ayrı TEXT olarak da yazılabilir |
| Fotoğraflar | FILE (min 0, max 3) yüz başına | `productOptionFileUpload` |
| Telif onayı | CHECKBOX zorunlu | |
| Sipariş notu | TEXT_AREA (400) | |

Değerler `IkasOrderLineItemOption.values[]` olarak sipariş satırına düşer; referansın `Yuz1_*` custom property şeması gereksizdir. Akış: `getProductOptionSet(product)` → `getDisplayedOptions` → `setTextValue/selectValue/setCheckboxValue/productOptionFileUpload` → `validateOptionSet` → `addItemToCart(variant, product, 1)` → `initProductOptionSetValues`.

- Hediye sertifikası: ayrı ürün (`giftProduct` prop'u, aynı Materyal varyantları) + redeem için ikas **kupon kodu** (`MONETARTS-XXXX-XXXX-XXXX`), sepete eklendikten sonra `saveCouponCode` ile uygulanır. Admin kurulumu: `docs/configurator-admin-setup.md`.

### 14.2 Bileşen mimarisi
- **`CoinConfigurator` section** (PRODUCT prop, `usePageData`), sub-component'ler: `MaterialStep`, `FaceDesignStep` (×2), `SummaryStep`, `SealModal`, `PhotoGuideModal`, `CoinCanvas`.
- **`src/utils/coin.ts`** saf fonksiyonlar (referanstan birebir, testlenebilir): `toRoman`, `dateToRoman`, `formatDate`, `fontSafe`, `pickCoinImage(theme, gender, effectiveMat, {bust, sarik})`, `arcTextLayout(n, radius)` (font/spread), `sideTextLayout(widths, radius)`, `effectiveMaterial(mat, plated)`.
- **`CoinCanvas`** (`useRef` + `useEffect`, 560×560): §3 pipeline; yeniden çizim tetikleyicileri: yüz, materyal, kaplama, seri, cinsiyet, büst/sarık, metin, roman. Flip: `is-flipping` 280 ms + yüz değişimi.
- **Görsel matrisi**: 22 PNG `upload_images` ile CDN'e; section'da `CoinArtwork` COMPONENT_LIST child'ı (seri ENUM, cinsiyet ENUM, materyal ENUM altın/gümüş, varyant ENUM büstlü/büstsüz/sarıklı/sarıksız, IMAGE) → kod `pickCoinImage` ile eşleştirir; bulunamazsa en yakın (opsiyonsuz) görsel.
- **Fontlar**: Cinzel tema token'ı mevcut; `Coin Script` (Reem Kufi 400) token'ı ikas tarafından yüklenir; `CoinCanvas` `document.fonts.load('700 30px "Cinzel"')` + `'400 30px "Reem Kufi"'` sonrası çizer. `ctx.font` string'lerinde `"Reem Kufi"` kullanılır.
- **Metinler** TEXT prop'lar (adım başlıkları, etiketler, öneri kartları, toast/uyarı metinleri, trust rozetleri).

### 14.3 Referans bug'larından düzeltilecekler
Büst ve sarık varsayılanı **`true`** (kart görseliyle tutarlı); snapshot doğru canvas'tan (`toDataURL` 260px JPEG, `monart-atelier.js:67-79` yaklaşımı); mürekkep rengi `effectiveMaterial`'a göre; tek flip; `URL.revokeObjectURL`; 5 MB + `image/jpeg|png` doğrulaması; özet 2. yüzü yalnız açıkken yazar; reset simetrik.

### 14.4 Atılacaklar
Osmanlı tarih dalı, sakal, `drawBottomDate`, `groove*`, `coinScale`, gümüş desatürasyon, stil testi, `is-pinned`, `#material-badge`, HTML'deki tüm fiyat/gramaj sabitleri (tek kaynak ikas ürün verisi + `MAT_SPEC` TEXT prop'ları).
