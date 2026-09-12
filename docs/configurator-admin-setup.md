# Konfigüratör — ikas Admin Kurulum Listesi

`CoinConfigurator` section'ı ürün verisini koddan değil, ikas admin'de tanımlanan **ürün + varyant + Product Option Set** üzerinden okur. Bu doküman, section'ın çalışması için admin'de kurulması gerekenleri ve kodun bunları **nasıl eşlediğini** (isim sözleşmesi) anlatır. Kişiselleştirme mantığının tamamı için `docs/configurator-logic.md`.

Mağazada şu an ürün, kategori ve PRODUCT sayfası yok. Section, ürün bağlanana kadar **tasarım/önizleme** kısmını çalıştırır; "Keseye At" butonu pasif kalır ve `productMissingText` uyarısı gösterilir.

---

## 1. Ürün: "Sikke Kolye"

| Alan | Değer |
|---|---|
| Ürün adı | Sikke Kolye (isim serbest; kod adı okumaz) |
| Ürün tipi | Fiziksel |
| Varyant tipi | **Materyal** |
| Varyant değerleri | `925 Ayar Gümüş` · `14 Ayar Altın` · `22 Ayar Altın` |
| Fiyat | varyant başına (referans: 22.000 / 90.000 / 160.000 ₺) |
| Stok | her varyant için stok takibi kapalı ya da yüksek stok (kişiye özel üretim) |

**Eşleme kuralı:** kod varyant değerinin adını normalize eder (küçük harf, Türkçe karakterler sadeleştirilir) ve şu anahtarları arar:

| Materyal | Adında geçmesi gereken | Örnek geçerli adlar |
|---|---|---|
| Gümüş | `925` veya `gümüş`/`silver` | "925 Ayar Gümüş", "Gümüş 925" |
| 14K | `14` (tek başına sayı) veya `14k`/`14 ayar` | "14 Ayar Altın", "14K Altın" |
| 22K | `22` veya `22k`/`22 ayar` | "22 Ayar Altın", "22K" |

Varyant adında hem `14` hem `22` geçmemeli. Kart üstünde görünen ad `materialSilverName / material14kName / material22kName` TEXT prop'larından gelir, varyant adı yalnızca eşleme içindir.

---

## 2. Product Option Set (kişiselleştirme)

Admin → Ürünler → **Ürün Opsiyonları** → yeni set → ürüne bağla.

Kod opsiyonları **adındaki anahtar kelimelerle** bulur (`findOption`); bu kelimeler section'ın **"Opsiyon Sözleşmesi"** prop grubundan okunur ve editor'da değiştirilebilir. Varsayılan sözleşme:

| Prop | Varsayılan anahtar | Opsiyon adı bunu **içermeli** |
|---|---|---|
| `optFace1` | `Yüz 1` | tüm 1. yüz opsiyonları |
| `optFace2` | `Yüz 2` | tüm 2. yüz opsiyonları |
| `optSeries` | `Seri` | |
| `optGender` | `Cinsiyet` | |
| `optBust` | `Büst` | |
| `optSarik` | `Sarık` | |
| `optName` | `İsim` | |
| `optDate` | `Tarih` | (Roma rakamı opsiyonuyla karışmasın: "Tarih" ≠ "Roma Rakamı") |
| `optRoman` | `Roma Rakamı` | |
| `optPhotos` | `Fotoğraf` | |
| `optBackFace` | `2. Yüz` | üst seviye CHECKBOX |
| `optPlating` | `Kaplama` | üst seviye CHECKBOX |
| `optConsent` | `Telif` | yüz başına CHECKBOX |
| `optNote` | `Sipariş Notu` | üst seviye TEXT_AREA |

Bir opsiyon "Yüz 1" **ve** "Seri" kelimelerini içeriyorsa 1. yüzün seri opsiyonu kabul edilir. Sözleşme değişecekse hem admin'deki isimler hem editor'daki prop birlikte güncellenmeli.

### 2.1 Kurulacak opsiyonlar (sırayla)

Üst seviye:

| # | Opsiyon adı | Tip | Ayar | Fiyat |
|---|---|---|---|---|
| 1 | **Kaplama** (24 Ayar Altın Kaplama) | CHECKBOX | zorunlu değil | AMOUNT **3.000 ₺** (kod, 14K seçiliyken UI'da "Ücretsiz" gösterir ve 22K'da kartı gizler; ikas tarafında farklı fiyat isteniyorsa `otherPrices` ile para birimi bazında verilebilir) |
| 2 | **2. Yüz** (2. Yüzü Kişiselleştir) | CHECKBOX | zorunlu değil | AMOUNT — referans materyale göre 8.000 / 14.000 / 24.000 ₺. ikas opsiyon fiyatı varyanta göre değişemez; **tek fiyat** girin (öneri 14.000 ₺) ya da RATIO (%15) kullanın; kod RATIO'yu varyant fiyatı üzerinden hesaplar |
| 3 | **Sipariş Notu** | TEXT_AREA | max 400 | — |

1. Yüz (üst seviye; her zaman aktif):

| # | Opsiyon adı | Tip | Değerler / ayar | Zorunlu |
|---|---|---|---|---|
| 4 | **Yüz 1 · Seri** | CHOICE | `Roma` · `Osmanlı` · `Mısır` | evet |
| 5 | **Yüz 1 · Cinsiyet** | CHOICE | `Bay` · `Bayan` | evet |
| 6 | **Yüz 1 · Büst** | CHOICE | `Büstlü` · `Büstsüz` | hayır (yalnız Roma) |
| 7 | **Yüz 1 · Sarık** | CHOICE | `Sarıklı` · `Açık Baş` | hayır (yalnız Osmanlı) |
| 8 | **Yüz 1 · İsim** | TEXT | max 20 | hayır |
| 9 | **Yüz 1 · Tarih** | TEXT | max 8 (GG.AA.YY) | hayır |
| 10 | **Yüz 1 · Roma Rakamı** | TEXT | max 40 | hayır (kod otomatik doldurur) |
| 11 | **Yüz 1 · Fotoğraf** | FILE | min 0 · max 3 · jpg/png/webp | hayır |
| 12 | **Yüz 1 · Telif** | CHECKBOX | "Fotoğrafların telif hakkına sahibim" | **evet** |

2. Yüz — **"2. Yüz" CHECKBOX'ının child opsiyonları** olarak (ikas'ta "koşullu/alt opsiyon"): aynı 9 opsiyon, adları `Yüz 2 · …`. Child olarak kurulunca CHECKBOX kapalıyken ikas doğrulaması bunları istemez. Child kurulamıyorsa üst seviyeye de eklenebilir; kod 2. yüz kapalıyken değerleri boş bırakır, bu durumda **hiçbirini zorunlu yapmayın**.

### 2.2 CHOICE değer eşlemesi

Kod değeri de anahtar kelimeyle seçer; değer adı şunları içermeli:

| Opsiyon | Kodun aradığı | Uyarı |
|---|---|---|
| Seri | `roma` / `osman` / `misir` | |
| Cinsiyet | Bay: `bay`, `erkek`, `male` · Bayan: `bayan`, `kadın`, `female` | "Bay" ararken "Bayan" dışlanır; "Bay" değeri "Bayan"dan **önce** olmalı gerekmez, dışlama var |
| Büst | Büstlü: `büstlü`, `var`, `evet` · Büstsüz: `büstsüz`, `yok`, `hayır` | |
| Sarık | Sarıklı: `sarıklı`, `tülbent`, `var` · Açık: `açık`, `sarıksız`, `yok` | Bayan için "Tülbentli" de geçerli |

### 2.3 Sipariş satırında görünüm

Tüm değerler `IkasOrderLineItemOption.values[]` olarak sipariş satırına düşer; ek "custom property" yok. Fotoğraflar FILE opsiyonu üzerinden ikas CDN'e yüklenir (sepete eklerken `productOptionFileUpload`).

---

## 3. Hediye modu

### 3.1 Ürün: "Hediye Sertifikası"

| Alan | Değer |
|---|---|
| Ürün adı | Miras Hediye Sertifikası |
| Varyant tipi | **Materyal** — aynı üç değer (`925 Ayar Gümüş` / `14 Ayar Altın` / `22 Ayar Altın`) |
| Fiyat | sikke fiyatıyla aynı (sertifika bedeli) |
| Opsiyon seti | **yok** (kod opsiyon senkronu yapmaz) |

Section'ın `giftProduct` prop'una bağlanır. "Miras Hediye Et" sekmesinde materyal seçilip "Sertifikayı Keseye At" ile bu ürünün ilgili varyantı sepete eklenir.

### 3.2 Sertifika kodu (redeem)

Referans akışta kod `MONETARTS-XXXX-XXXX-XXXX` biçimindedir. ikas'ta bu, **kupon kodu** olarak kurulur:

1. Admin → Pazarlama → **Kuponlar** → yeni kupon, kod `MONETARTS-AB12-CD34-EF56` biçiminde (4+4+4 büyük harf/rakam; kod bu deseni doğrular).
2. İndirim: **%100** (ya da sertifika bedeli kadar sabit tutar), yalnız "Sikke Kolye" ürününe, tek kullanımlık, kullanım sayısı 1.
3. Sertifika satışı sonrası kodu müşteriye e-posta/sertifika üzerinde iletin (manuel ya da ikas otomasyonu).

Kod tarafı: müşteri "Mirası Teslim Al" sekmesinde kodu girer → desen doğrulanır → sikke sepete eklenince `saveCouponCode` ile kupon sepete uygulanır. Kupon geçersizse `redeemFailedToast` gösterilir, ürün sepette kalır (müşteri ödeme adımında da kodu deneyebilir).

Alternatif: ikas **Hediye Kartı** ürünü; bu durumda redeem ödeme sayfasında yapılır ve section'da yalnızca bilgilendirme metni bırakılır (`showGiftMode` kapatılabilir).

---

## 4. Editor'da bağlama

1. Ana sayfa → **CoinConfigurator** → **Veri** grubu → `product` = "Sikke Kolye", `giftProduct` = "Miras Hediye Sertifikası".
2. Görsel grupları (Roma/Osmanlı/Mısır, Medya) zaten CDN görselleriyle dolduruldu; değiştirilecekse aynı isimlendirme: `{seri}{M|F}{Gold|Silver}[Nobust|Nosarik]`.
3. Fiyat etiketleri koddan değil ürün varyant fiyatlarından gelir; kaplama / 2. yüz ek ücretleri opsiyon fiyatından okunur (`+3.000 ₺` gibi).
4. Ürün bağlıyken doğrulama: materyal kartlarında fiyat görünmeli; kaplama kartında "+fiyat"; 2. yüz toggle'ında "(+fiyat)"; "Keseye At" aktif.

---

## 5. Test listesi

- [ ] Üç materyal kartı fiyatla listeleniyor; 22K'da kaplama kartı gizli; 14K'da "Ücretsiz".
- [ ] Roma: isim üst yay, tarih Roma rakamı alt yay; büst kapalıyken görsel değişiyor.
- [ ] Osmanlı: isim sağ kenar (Reem Kufi); sarık kapalıyken görsel değişiyor.
- [ ] Mısır: canvas'a yazı çizilmiyor; hiyeroglif rehberi açılıyor.
- [ ] "2. Yüzü Kişiselleştir" açılınca sikke çevriliyor, özet 2. yüzü listeliyor, fiyat artıyor.
- [ ] Fotoğraf: 3 slot, 5 MB üstü ve jpg/png/webp dışı reddediliyor, rehber modalı ilk yüklemede açılıyor.
- [ ] Telif kutusu işaretsizken "Keseye At" toast + kaydırma yapıyor.
- [ ] Mühür modalı onaylanınca ürün sepete düşüyor, sepet çekmecesi açılıyor, sipariş satırında opsiyon değerleri + fotoğraf URL'leri görünüyor.
- [ ] Hediye: sertifika ürünü sepete düşüyor. Redeem: geçerli kupon sepete uygulanıyor, geçersizde toast.
