# MonArt — Yol Haritası ve Oturum Devri

Bu dosya, her yeni sohbetin **ilk okuyacağı** yerdir. Proje tek bir uzun sohbette değil, faz faz ayrı sohbetlerde ilerler. Her faz bitince bu dosyadaki **Durum** tablosu ve **Açık uçlar** listesi güncellenir, sonra commit edilir.

---

## 0. Yeni sohbete nasıl başlanır

Bu dosya `CLAUDE.md` içindeki import sayesinde her yeni oturumda otomatik yüklenir. Dosya atmaya veya uzun mesaj yazmaya gerek yok. Yeni sohbeti proje klasöründe (`~/orca/projects/MonArt`) aç ve yalnızca şunu yaz:

```
Faz N'e başlayalım.
```

Alt adımlı fazlarda alt adımı yaz (ör. `Faz R2c'ye başlayalım.`). Sıradaki iş §1 Durum tablosunda ⏳ ile işaretli ilk satırdır.

**Her fazda izlenecek akış** (Claude bunu kendiliğinden uygular):
1. Fazın "Okunacaklar" listesindeki dosyaları incele.
2. Kısa bir faz planı yaz, fazdaki "Karar gerekli" maddelerini sor ve onay al.
3. Onaydan sonra kodu yaz, `check --json` ve `build` çalıştır, editor'a yerleştir.
4. Faz bitince bu dosyadaki Durum ve Açık uçlar tablolarını güncelle.
5. Commit ve push yalnızca kullanıcı isteyince.

Oturumdan önce senin terminalinde (sıra önemli):

```
npx ikas-component dev      # önce bu, 5201 portunu tutar
ikas theme dev              # sonra bu, tünel açar ve editor URL'si verir
```

Editor URL'sini tarayıcıda açık tut. MCP editor araçları ancak editor bağlıyken çalışır.

---

## 1. Durum

| Faz | Kapsam | Durum |
|---|---|---|
| 0 | Design token'ları (`src/global.css`), tema global'leri, Day/Night şemaları | ✅ bitti |
| 1 | Header, Footer, CartDrawer, LanguageSwitcher, NewsletterForm, Icons | ✅ bitti (14.09.2026: Header referans navbar'ına eşitlendi — sağ küme sırası, küçük harf nav, çerçeveli "Özel Tasarım", tek dilde de "TR ⌄", sikke logosu büyütüldü. Logo **her sayfada** ana sayfadaki konfigüratör sikkesinin hizasında durur: CSS'te `--w-page`, `--w-preview`, `--w-header`, `--gutter` ve `100cqw` ile hesaplanır, JS ölçümü yok; bu token'lar değişirse hiza da değişir, 860px altında logo solda. Yayın önizlemesinde 1200/1480px'te ana sayfa, Koleksiyon, sepet, KVKK, Hakkımızda ve 404'te aynı konum; 880px'te sağ kümeyle çakışma yok; 400px, Day/Night, dil menüsü, Esc ve logo → ana sayfa doğrulandı) |
| 2 | Hero + SeriesCard, OriginStory, BespokeCall, Faq + FaqItem | ✅ bitti |
| 3 | CoinConfigurator (canvas, iki yüz, hediye/redeem, mühür ve foto rehberi modalları) | ✅ bitti |
| 4 | Konfigüratör canlı test + ürün bağlama + ürün sayfası | ✅ bitti (fotoğraf yükleme ve sipariş satırı elle testi Faz 11 QA'ya ertelendi) |
| 5 | Koleksiyon galerisi + Lightbox | ✅ bitti (yayın önizlemesinde uçtan uca test edildi) |
| 6 | Sepet sayfası + drawer'da kişiselleştirme özeti | ✅ bitti (editör önizlemesinde masaüstü, 380px, Day/Night, kupon ve adet test edildi) |
| 7 | Statik içerik sayfaları: Hakkımızda, SSS, 7 hukuki doküman + Görsel Hakları | ✅ bitti (editörde masaüstü, 380px, Day/Night; yayın önizlemesinde metinler, link akışları, Night düzeltmeleri ve yan menü aktif vurgusu — masaüstü ve 400px çip kayması — doğrulandı) |
| 8 | Formlar: İletişim + Özel Tasarım talebi | ✅ bitti (editör önizlemesinde masaüstü, 380px, Day/Night, doğrulama, klavye ve iki formun gönderimi test edildi; panelde mesajın görünmesi ve görselli talep kullanıcı testi bekliyor) |
| 9 | Marka Elçileri sayfası: tanıtım + başvuru formu | ✅ bitti (editör önizlemesinde masaüstü, 380px, Day/Night, doğrulama ve telefonsuz gerçek gönderim test edildi; e-postadaki mesaj biçimi kullanıcı kontrolü bekliyor) |
| 10 | Hazır hesap sayfaları + 404 | ✅ bitti. 404 yayında test edildi. Hazır hesap sayfaları yayında test edildi ama **kullanıcı kararıyla bırakıldı** (font ve gece modu ayarlanamıyor): yerine 10b/10c'de kendi section'larımız yazılıyor |
| 10b | Üyelik section'ları: giriş, kayıt, şifremi unuttum, şifre yenileme, e-posta doğrulama | ✅ bitti (yayında: doğrulamalar, şifre göster/gizle, sayfalar arası linkler, token'sız ekranlar, 400px, Day/Night, gerçek giriş → Hesabım, girişliyken yönlendirme, `?redirect=` ve dış yönlendirme engeli, çıkış; sosyal buton hata bandı. Gerçek kayıt ve şifre sıfırlama e-postası gönderimi kullanıcı onayı bekliyor) |
| 10c | Hesap section'ı: profil + hesap silme, siparişler, sipariş detayı (sikke özeti, kargo takibi, iade talebi), adresler, favoriler | ✅ kod bitti (`AccountPage`, `docs/account-pages.md` §3.6); hazır `account` grubu kapatıldı, 5 sayfa yeniden açıldı. Yayında profil, boş sipariş/favori, favori kartı, adres ekle/düzenle/sil, silme penceresi, gece, 400px, çıkış, girişsiz yönlendirme ve `?redirect` dönüşü test edildi. Favoriler kullanıcı kararıyla gizli (`showFavorites`). Son düzeltmeler editörde, yayın bekliyor. Kalan testler Faz 11 QA'ya ertelendi |
| 11 | Link bağlama, dil routing'leri, QA, yayın | ⏳ 4 alt adım: **11a** linkler + küçük kod düzeltmeleri ✅ (editörde; yayın bekliyor) · **11b** yayın önizlemesinde QA · **11c** SEO + admin ayarları · **11d** 6 dil + üretim yayını |
| ref | Referans eşitleme: "04 — Mühür" stil testi + tipografi (`docs/typography-audit.md`) | ✅ 14.09.2026. Stil testi ("Bir testi beğenin", 3 vazo, yalnız görsel) Ana sayfa ve Ürün sayfasında. Gündüz alt metinler dik 300 ve çerçevesiz önizleme/özet, gece italik ve çerçeveli (referansın iki teması). `global.css` ve tema tipografisi değişmedi. Yayın önizlemesinde gündüz/gece, 400px ve form sayfaları ölçüldü. Son iki küçük düzeltme (2. yüz anahtarı ls, Footer "Bize Ulaşın" 11px) editörde, sonraki yayında önizlemeye çıkar |
| R2 | **Referans v2 eşitleme** (`reference/MonArt2_clean/`, farklar `docs/reference-v2-changes.md`). 11b QA'sından önce biter; her alt adım ayrı sohbette yapılabilir, ayrıntı §6 "Faz R2" | ⏳ 3/4 alt adım bitti |
| R2a | Doküman: v2 farkları, admin opsiyon listesi, faz planı | ✅ 16.09.2026 |
| R2b | Köşe sistemi 6px + içerik (Footer sloganı, galeri etiketleri, 3 hukuki metin, foto rehberi, gece önizleme çerçevesi) | ✅ 16.09.2026. Yayın önizlemesinde doğrulandı: gündüz/gece köşeler, gece önizleme çerçevesiz, 400px gece mobil çubuk opak + alt çizgi, galeri etiketleri yok, sekme/kart/CTA 6px, Mesafeli Satış md. 4–7, Hediye Sertifikası süresiz, Kullanım Şartları fikri mülkiyet maddesi, Footer sloganı yok, sepet çekmecesi 6px, foto rehberi yeni metin. Son düzeltme (cinsiyet anahtarında seçili düğmenin dış köşeleri) editörde, sonraki yayında görünür |
| R2c | Sepet çekmecesi: indirim kodu + Ara Toplam/İndirim + sikke yığını PNG'li "Ödemeye Geç" butonu | ✅ 16.09.2026. Yayın önizlemesinde doğrulandı: çekmecede boş kod, geçersiz kod (yazınca uyarı siliniyor), test kuponu uygula → Ara Toplam/İndirim/₺0 → kaldır; gündüz/gece, 400px (taşma yok); sepet sayfası kuponu (geçersiz, küçük harfle uygulama, kaldır) aynı; buton görseli iki yerde. Son düzeltme (400px'te "Uygula" yazısı ortalı) editörde, sonraki yayında görünür |
| R2d | Konfigüratör: portre yönü + bilgi penceresi, zincir uzunluğu, mobil açıklama, telif metinleri | ⏳ sıradaki. Admin ön koşulu kuruldu (16.09.2026, 3 opsiyon) |
| 12 | Marka Elçileri paneli (referans v2'de demo girişle yeniden açık) | ⏳ kapsam faz başında konuşulacak (kullanıcı kararı 16.09.2026: ayrı faz) |

---

## 2. Referans kaynaklar

| Dosya | Ne için |
|---|---|
| `CLAUDE.md` | ikas Code Components kuralları, CLI komutları, MCP araçları |
| `docs/reference-inventory.md` | Referans sitenin tüm global'leri, sayfaları, bileşenleri ve ikas eşlemesi |
| `docs/theme-globals.md` | Oluşturulan tema renkleri, tipografi, breakpoint, keyframe id'leri |
| `docs/configurator-logic.md` | Konfigüratörün tam mantık spesifikasyonu |
| `docs/configurator-admin-setup.md` | Konfigüratör için admin'de kurulacak ürün, varyant, opsiyon seti ve kuponlar |
| `docs/collection-gallery.md` | Koleksiyon galerisi spec'i: prop yapısı, lightbox, `?seri=` ve konfigüratör parametreleri |
| `docs/forms.md` | İletişim, Özel Tasarım ve Elçi başvurusu formları: ikas iletişim formu API'si, mesaj biçimi, doğrulama, opsiyon üzerinden görsel yükleme |
| `reference/MonArt2_clean/` | **Güncel** statik prototip (v2, 15.09.2026, git dışında). Ana dosyalar: `MonArt Lux.html`, `monart-lux.js`, `monart-lux.css`, `monart-bespoke.js`. Tarayıcıda açmak için `python3 -m http.server --directory reference/MonArt2_clean` (Chrome eklentisi `file://` açmıyor) |
| `reference/MonArtDEMO_clean/` | İlk prototip (v1). Faz 0–11a ve eski dokümanlardaki satır numaraları buna ait; yalnız karşılaştırma için |
| `docs/reference-v2-changes.md` | v1 → v2 farkları, birebir yeni metinler, ikas eşlemesi ve faz ataması |
| `~/.claude/plans/ilk-nce-users-yigitozen-orca-projects-mo-sharded-umbrella.md` | Faz 2 sonrası doküman düzeltme planı |

---

## 3. Değişmez kurallar

Bunlar önceki fazlarda hata yapılıp düzeltilen konular. Her fazda geçerli.

**ikas / CLI**
- `ikas.config.json`, `types.ts`, `global-types.ts`, `src/components/index.ts` elle düzenlenmez. Bileşen ve prop yalnız `npx ikas-component config ...` ile eklenir.
- Kullanıcıya görünen her metin TEXT prop'tur, varsayılan değeri Türkçe referans metnidir.
- Storefront API'si kullanmadan önce MCP'den doğrula (`get_function_doc`, `get_model_guide`). İmza tahmin edilmez.
- Her fazın sonunda `npx ikas-component check --json` ve `npx ikas-component build` temiz olmalı.
- Parent, COMPONENT_LIST child'larının prop değerlerini okuyamaz. Sekme başlığı, URL parametresi gibi parent'ın bilmesi gereken sabit sayıda öğe section üzerinde düz prop olarak tutulur, editörde prop grubuyla ayrılır (CoinConfigurator, CollectionGallery).

**CSS**
- Yalnız class seçici kullan. CSS derlemede `.cc_<id>` ile scope'lanır.
- `global.css` içindeki `@keyframes` adları derlemede prefix alır. Bileşen CSS'i global keyframe adını kullanamaz, `.mon-anim-*` utility class'larını kullanır. Bileşenin kendi `@keyframes`'i sorunsuzdur.
- Alt bileşen CSS'inde `.mon-night` gibi bağlam seçicisi çalışmaz. `--heading`, `--gold` gibi token'lar kullanılır.
- Breakpoint: `@media (max-width: bp(5pw2fQi7Yr))` (860px, ana mobil) ve `bp(5Xmvk6D0gV)` (640px). Diğer id'ler `docs/theme-globals.md`'de.
- `.mon-btn`, `.mon-field`, `.mon-card`, `.mon-eyebrow`, `.mon-panel`, `.mon-backdrop` gibi utility'ler `global.css`'te hazır, yeniden yazılmaz.
- Tasarım düzeltmeleri bileşenin `styles.css`'ine yazılır; `global.css` token'ları ve utility'leri değiştirilmez. **Tek istisna (kullanıcı kararı 16.09.2026):** referans v2'nin köşe sistemi için `--r-btn`, `--r-card`, `--r-input` 6px yapılır (R2b).
- Vitrinde başlık öğeleri (`h1`–`h4`) inline davranabiliyor; önünde veya arkasında inline/inline-flex öğe (buton, ikon, eyebrow) varsa aynı satıra biniyor. Başlık class'ına `display: block` ver (Faz 4'te SealModal, BespokeCall ve SeriesCard böyle düzeltildi).
- Büyük görselde (lightbox vb.) `srcset`'in doğal genişliğine güvenme. CDN küçük kaynağı büyütmediği için görsel olduğundan küçük çiziliyor. Boyutu kapsayıcıdan ver: `width/height: 100%; object-fit: contain`.
- COMPONENT_LIST child'ının (FaqItem, SeriesCard) wrapper'ı global token'ları gündüz değerine sıfırlar; parent'ın gece paleti child'a inmez. Child kökünde de `useSectionTheme()` className ve style'ı uygulanır (Faz 7'de düzeltildi).
- Section'lar arasında boşluk için `margin` kullanma: gece modunda aradan sayfanın beyaz zemini görünür. Boşluk `padding` ile verilir (Faz 7'de Footer düzeltildi).
- Tarayıcıya özgü değerleri (URL, localStorage) ilk render'da okuma; `useState` boş/varsayılanla başlasın, değer `useEffect`'te set edilsin. Hydrate mevcut DOM attribute'larını yamamaz, ilk render'da farklı değer okunursa fark hiç görünmez (Faz 7 LegalPage aktif vurgusu).
- Ortalı büyük başlıkta tireli kelime ("Co-Creation") tireden bölünüyor. Kelimeyi `white-space: nowrap` bir span'a al (Faz 9 AmbassadorProgram).
- Grid öğesi sütunundan genişse `justify-self: center` onu başa hizalıyor. Ortalamak için negatif yatay margin kullan: `margin-inline: calc((100% - <genişlik>) / 2)`.
- Sikke logosu (`46ba7812…`, 9:16, koyu zemin) dairede `object-fit: cover` + `scale(1.15)` ile gösterilir; büyütmeden sikkenin çevresinde koyu halka kalıyor. Header'da oran `logoCoinScale` prop'u (varsayılan 115).

**Tema**
- Varsayılan şema Day (fildişi), ikincisi Night.
- Her section kökü `useSectionTheme()` (`src/utils/theme-mode.ts`) ile className ve style alır.
- Renk slot'ları için `slotVar()` kullanılır (`src/theme-tokens.ts`). Slot CSS değişken adı slot id'sinden farklı harf büyüklüğündedir.

**Font ve dil**
- Yerel font dosyası yok. Tüm fontlar Google Fonts adıyla tema tipografi token'ıdır. Kufi yazı Reem Kufi (`Coin Script` token'ı).
- Dil sistemi referansın i18n script'i ile taşınmaz. ikas admin'de dil başına storefront routing kurulur. Kodda `baseStore.languageOptions` + `setLanguage()`, `IkasStorefrontConfig.routings`, `withRoutePrefix()` kullanılır. TEXT prop değerleri editor'da routing başına girilir.

**Dev ortamı**
- Port 5201 makinedeki tüm ikas projeleri tarafından paylaşılır. Editor araçlarından önce sahibini kontrol et:
  ```
  lsof -nP -iTCP:5201 -sTCP:LISTEN
  lsof -p <pid> | grep cwd      # ~/orca/projects/MonArt olmalı
  ```
- Editor'da import edilmiş yabancı bileşen MCP ile silinemez, Studio arayüzünden silinir.
- Sayfadan section kaldırmak (`remove_page_section`) kullanıcı onayı ister.
- Editör önizlemesinde link tıklaması sayfa değiştirmiyor. Sayfalar arası akışlar (URL parametresiyle açılış vb.) yalnız yayınlanmış önizlemede test edilebilir. `publish_theme` dry-run dahil izin ister.
- Kod değişikliği editöre `build` + `import_section` ile gider; section yeniden mount olur (açık lightbox/sekme sıfırlanır).
- `ikas-component dev` açıkken kaynak dosyadaki her değişiklik bağlı editöre de gider ve section'ları yeniden mount eder (başka oturumun değişikliği de). Önizlemede form doldururken kod değiştirme; doldurulmuş form sıfırlanır (Faz 8).

**Hazır hesap sayfaları (Faz 10) — iki grup da bırakıldı (üyelik 10b'de, hesap 10c'de); notlar ileride hazır sayfa açılırsa diye duruyor**
- Bir grubu `enable_ready_made_pages(false)` ile kapatmak o grubun sayfalarını **siler**; Header/Footer eklemiş olmak korumaz. Yerine `create_page(pageType)` ile boş sayfa açılır; Header ve Footer kendiliğinden gelir, section `index: 1` ile araya konur.
- Hazır sayfaların kendi DOM'u `data-cc-scope="ikas"` altında; bizim `global.css` `:where([data-cc-scope~="wnbxmerd"])` ile scope'landığı için onlara ulaşmaz. Font `var(--ma-font)` ile gövde fontunu miras alır, renkler section'da inline `--ma-*` değişkenleri.
- İçerik ikas'ın kendi bileşeni; section değil. Ayarlar yalnız `list_ready_made_pages` / `update_ready_made_page_prop` ile. Logo, köşe ve renkler paylaşılan `all` kapsamında, bir kez yazılır, 10 sayfaya gider.
- Tema Header/Footer'ı bu sayfalara kendiliğinden gelmez; elle eklenir. Header'ı **`index: 0`** ile ekle, yoksa hazır içeriğin altına düşer. `move_page_section` ortak Header/Footer'ı taşımayı reddeder; yanlış sıradaysa katmanlar panelinde sürükle.
- Header eklenen sayfada hazır bileşenin `showBrandBar`'ı kapatılır; `fullPageHeight` kapalı (açıkken Footer ekranın altına itiliyor).
- Hazır sayfalar tek palet alır, Night şemasına geçmez. Paylaşılan renkler Day paletine `patternValueId` ile bağlı. Ana renk Bronze + beyaz yazı; Gold denendi, beyaz zeminde link metni okunmuyordu (~2:1).
- Enum değerini `update_ready_made_page_prop`'a `{ "value": "0" }` zarfıyla ver; çıplak `"0"` sayıya dönüp reddediliyor.
- Hesabım, Siparişler vb. giriş gerektiren sayfalar editörde açılmıyor (sayfa listesinde tıklanınca Giriş'te kalıyor). Yalnız yayında, giriş yapmış müşteriyle görülür.

**Çalışma şekli**
- Yazışma Türkçe. Koddan önce kısa bir plan veya doküman, onaydan sonra kod.
- Karmaşık etkileşim mantığı ayrı bir spec dokümanında anlatılır.
- Commit ve push yalnızca istendiğinde. `reference/` asla commit edilmez.

---

## 4. Kimlikler

**Bileşenler** (`ikas.config.json` id'leri)

| Bileşen | Tip | id |
|---|---|---|
| Header | section (header) | `wnbxmerd-j4HS6I3Fd8` |
| Footer | section (footer) | `wnbxmerd-n3BlH2im0L` |
| Hero | section | `wnbxmerd-F3B4w1ciEC` |
| SeriesCard | child | `wnbxmerd-dYFA4bc8WZ` |
| OriginStory | section | `wnbxmerd-YkCgkgqJIM` |
| BespokeCall | section | `wnbxmerd-azSO30lWaH` |
| Faq | section | `wnbxmerd-94hk1Nk8b2` |
| FaqItem | child | `wnbxmerd-w7QzXBrKkP` |
| CoinConfigurator | section | `wnbxmerd-5HM2GavfPR` |
| CollectionGallery | section | `wnbxmerd-Cv0kAyhqw9` |
| CartPage | section | `wnbxmerd-0bOGxJFtlY` |
| LegalPage | section | `wnbxmerd-t47FaQ6XEn` |
| ContactForm | section | `wnbxmerd-ncdF4QsnHr` |
| BespokeRequest | section | `wnbxmerd-EXHqxAvbZ1` |
| AmbassadorProgram | section | `wnbxmerd-BFMxX7SqEq` |
| NotFound | section | `wnbxmerd-dKuZC6tweb` |
| AuthLogin | section | `wnbxmerd-jt9Ht3KkOu` |
| AuthRegister | section | `wnbxmerd-0LDctfbvBs` |
| AuthForgotPassword | section | `wnbxmerd-JEkqLQnAB4` |
| AuthRecoverPassword | section | `wnbxmerd-sHFNplFxzU` |
| AuthVerifyEmail | section | `wnbxmerd-mHwtZ0bnxo` |
| AccountPage | section | `wnbxmerd-ifgtExD5te` |

Özel enum "Seri" (`roma` / `osmanli` / `misir`): `5rzSm7oLdF`. SeriesCard'ın `seriesKey` prop'u bunu kullanır.

**Ana sayfa** — page id `wufeVJGhGX`. Section sırası ve elementId'ler:

| Sıra | Section | elementId | Çapa |
|---|---|---|---|
| 0 | Header | `I2zu1VeMMs` | — |
| 1 | Hero | `1n5ZK6zfsP` | `#hero` |
| 2 | CoinConfigurator | `CnxvAPawqP` | `#atolye` |
| 3 | OriginStory | `jx3YNxWxTg` | `#craft` |
| 4 | BespokeCall | `ajCeAaRher` | `#ozel-tasarim` |
| 5 | Faq | `SSDqTUjaBE` | `#sss` |
| 6 | Footer | `qsO74gYFds` | `#iletisim` |

**Ürün sayfası** — page id `NnPJ9lYfHR` (PRODUCT). Sıra: Header `pqNSy4UC7g` · CoinConfigurator `vCT6WKmBTD` · Footer `Z6bMdp2VzT`. Konfigüratörün `product` prop'u `usePageData: true`; diğer 160 değer Ana sayfadan kopyalandı. `giftProduct` boş.

**Koleksiyon sayfası** — page id `zQWeWMtpEV` (CUSTOM, slug `koleksiyon`, vitrinde **`/pages/koleksiyon`**; CUSTOM sayfalar `/pages/<slug>` altında yayınlanır). Sıra: Header `E2CEgC1Ty0` · CollectionGallery `KmMWViHQSH` · Footer `tyvOc9iBPx`. Galerideki 12 sikke görseli konfigüratörün yüklü görselleriyle aynı id'ler. Ana sayfadaki Hero "Koleksiyonları İncele" butonu ve 3 seri kartı bu sayfaya gider (kartlar `?seri=` ekler). Footer'ın Koleksiyon sütunu da bağlı.

**Sepet sayfası** — page id `lBaF5XFhjB` (CART). Sıra: Header `mYelHbcKWW` · CartPage `uZr5rmv1FA` · Footer `w5yumDkrtk`. "Atölyeye Dön" (`continueLink`) EXTERNAL `/#atolye`; boşsa INDEX'e gider. Drawer ve sayfa aynı `CartLine` + `CouponField` + `CoinCheckoutButton` sub-component'lerini ve `src/utils/cart-summary.ts` özetini kullanır. Özet, opsiyon adlarını `OPTION_CONTRACT` (`src/utils/ikas-options.ts`) varsayılanlarıyla eşler; konfigüratördeki "Opsiyon Sözleşmesi" prop'ları değiştirilirse sepet özeti eşleşmez. Satır küçük resmi tasarıma göre seçilir: konfigüratör sikke görsellerinin haritasını localStorage'a (`monart_artwork`, `src/utils/coin-thumbs.ts`) yazar, satır 1. yüzün seri/cinsiyet/büst/sarık ve materyal+kaplama bilgisiyle aynı görseli bulur; harita yoksa ürün görseline düşer. Her iki ürünün tüm varyantlarında yedek görsel olarak MA monogram sikkesi var (admin'den yüklendi; ödeme sayfası ve admin bunu gösterir).

**İçerik sayfaları (Faz 7)** — hepsi CUSTOM, vitrinde `/pages/<slug>`. Header ve Footer ortak (common) section; değerleri Ana sayfadaki yerleşimde tutulur, her sayfaya otomatik eklenir.

| Sayfa | page id | slug | Section'lar |
|---|---|---|---|
| Hakkımızda | `ytkXaJdSTQ` | `hakkimizda` | OriginStory `qOJkmSAuyz` · BespokeCall `1aU6fBOJpa` (Ana sayfa değerlerinin kopyası) |
| SSS | `oo5bBtJ1WP` | `sss` | Faq `67BccwoSlf` (10 FaqItem, Ana sayfa kopyası) |
| Mesafeli Satış Sözleşmesi | `vEjPFBNMLU` | `mesafeli-satis-sozlesmesi` | LegalPage `scbSmLz9RW` |
| KVKK & Görsel Gizliliği Politikası | `zp6v9sr7sa` | `kvkk` | LegalPage `X3uxT5UpyO` |
| Gizlilik Politikası | `CYw737k2W6` | `gizlilik-politikasi` | LegalPage `nB8iQpdxsX` |
| Teslimat & İade Koşulları | `4m35ejxS0Z` | `teslimat-ve-iade` | LegalPage `OP0w0iFxV2` |
| İptal ve İade Şartları | `uIC7lTSa2z` | `iptal-ve-iade` | LegalPage `sT0DGn2S06` |
| Hediye Sertifikası Şartları | `U20UofHczV` | `hediye-sertifikasi` | LegalPage `oc92cY1imV` |
| Bakım Rehberi | `RkFAJyKEeV` | `bakim-rehberi` | LegalPage `ttjsgzBC7O` |
| Kullanım Şartları (Görsel Hakları ve Sanatsal Tolerans) | `RGt1KkPkeN` | `kullanim-sartlari` | LegalPage `7pcWHVQXnw` |

Hukuki metinler referansın `LEGAL_DOCS`'undan (ve Kullanım Şartları i18n `terms_artwork_body`'den) birebir aktarıldı; gövde `<h2>` madde başlığı + `<p>`. Her LegalPage'in `navLinks` prop'unda 8 dokümanın PAGE linki var. Yan menüde aktif doküman `window.location.pathname` ile link href'i karşılaştırılarak bulunur. Editör önizlemesinde pathname `about:srcdoc` olduğu için vurgu yalnız yayında görünür. Footer'daki Yardım sütunu, 6 hukuki link, "Zanaat Hikayemiz", "Ustaya Sor" ve Header'daki "Hakkımızda" bu sayfalara PAGE linkiyle bağlı.

**Form sayfaları (Faz 8)** — CUSTOM, spec `docs/forms.md`.

| Sayfa | page id | slug | Section |
|---|---|---|---|
| İletişim | `f7IJM52GCz` | `iletisim` | ContactForm `EWmhW7xrzq` |
| Özel Tasarım | `FuhA9MUQOO` | `ozel-tasarim` | BespokeRequest `XqpBXzO0xd` (`product` = Sikke Kolye; görseller "Yüz 1 · Fotoğraf" opsiyonu üzerinden yüklenir) |

İki form da ikas iletişim formunu (`submitContactForm`) kullanır; konu, sipariş no, materyal ve görsel linkleri mesaj metnine `[İletişim]` / `[Özel Tasarım Talebi]` etiketli başlıkla yazılır. KVKK onay linki KVKK sayfasına PAGE linki. Header nav'daki "İletişim" ve "Özel Tasarım", Footer'daki "Bize Ulaşın", Ana sayfa ve Hakkımızda'daki BespokeCall butonu bu sayfalara bağlı.

**Marka Elçileri (Faz 9)** — CUSTOM, page id `WNMHBZ5MUH`, slug `elciler` (`/pages/elciler`). Section: AmbassadorProgram `RsdAcUoT6F`. Spec `docs/forms.md` §7. Kapsam yalnız tanıtım + başvuru formu; elçi girişi, panel, modeller ve sözleşme yok. Başvuru ikas iletişim formuyla `[Elçi Başvurusu]` başlığıyla gider (sosyal medya ve lokasyon başlıkta, vizyon gövdede; telefon isteğe bağlı). KVKK onay linki KVKK sayfasına, Footer alt bardaki "ambassadors" linki bu sayfaya PAGE linki. Referansın Atölye/kota, Quota ve Welcome modülleri atıldı; "Siparişlerim" Faz 10'da ikas hazır hesap sayfalarıyla karşılanır.

**Üyelik sayfaları (Faz 10b)** — kendi section'larımız, spec `docs/account-pages.md`. Hazır `membership` grubu kapalı. Sıra: Header · section · Footer.

| Sayfa | pageType | page id | Section (elementId) |
|---|---|---|---|
| Giriş | LOGIN | `5j7yy9Jlbi` | AuthLogin `xGqgbfmxEE` |
| Kayıt | REGISTER | `ijxIPPatFm` | AuthRegister `Nx1Sa4MB6s` (onay → Kullanım Şartları, pazarlama → KVKK) |
| Şifremi Unuttum | FORGOT_PASSWORD | `IryqK7prRl` | AuthForgotPassword `0JfnFa6Yk5` |
| Şifre Yenileme | RECOVER_PASSWORD | `R9bAAZDNv7` | AuthRecoverPassword `UnFJ1NmgEk` |
| E-posta Doğrulama | ACTIVATE_CUSTOMER | `oo5QdC1GPG` | AuthVerifyEmail `9bx9daIc4X` |

**Hesap sayfaları (Faz 10c)** — kendi section'ımız, spec `docs/account-pages.md` §3. Hazır `account` grubu kapalı (eski hazır sayfalar silindi, `create_page` ile yeniden açıldı). Her sayfada sıra: Header · AccountPage · Footer; section panelini sayfa tipinden seçer.

| Sayfa | pageType | page id | AccountPage elementId |
|---|---|---|---|
| Hesabım | ACCOUNT | `Vqh5UJ59QY` | `COU6yaUK5J` |
| Siparişlerim | ORDERS | `J254ofXBsd` | `AJLGTQDmyM` |
| Sipariş Detayı | ORDER_DETAIL | `FbUPMP6SkA` | `RtCdJHiKbq` |
| Adreslerim | ADDRESSES | `lnF1J8VSYD` | `s9U5lNxFnO` |
| Favoriler | FAVORITE_PRODUCTS | `sUFOCuuSsn` | `9gqQwHV78D` |

Her yerleşimde aynı 4 link: `ordersEmptyLink` EXTERNAL `/#atolye`, `refundPolicyLink` PAGE İptal ve İade (`uIC7lTSa2z`), `refundContactLink` PAGE İletişim (`f7IJM52GCz`), `favoritesEmptyLink` PAGE Koleksiyon (`zQWeWMtpEV`). Metinler beş sayfada ayrı ayrı saklanır; biri değişirse diğer dördüne de yazılmalı. Header'da `showAccount` açık: girişliyse ACCOUNT, değilse LOGIN (Faz 10'da yayında doğrulandı: `/account` ve `/account/login`). Hazır sayfaların paylaşılan (`all`) logo/renk ayarları artık hiçbir sayfada kullanılmıyor.

**404 (Faz 10)** — NOT_FOUND sayfası `dy9iv`. Sıra: Header `KvvPBJ4QXa` · NotFound `V00RRJ1EyB` · Footer `9ivOpNoMTA`. "404"teki 0 yerine MA monogram halkası (`b535ed5a…`, şeffaf) Y ekseninde döner; logo sikke görseli (`46ba7812…`) koyu kare zeminli olduğu için kullanılmadı. Birincil buton Ana Sayfa (PAGE INDEX), ikincil "Kolyeni Tasarla" EXTERNAL `/#atolye`.

**Mağaza** — `dev-monoart.myikas.com`, storefront `a9b97462-bc96-4c36-87c0-1cf0d37313e9`, vitrin satış kanalı `ed3c0b49-3edd-4b05-acf5-3f0899e03cf5`. Kategori yok.

**Ürünler ve kurulum (Faz 4)**

| Kayıt | id | Not |
|---|---|---|
| Sikke Kolye | `8e1d8132-9bb2-40d3-9435-0e85d8ff06c8` | Materyal varyantları 22.000 / 90.000 / 160.000 ₺, stoksuz satış açık, slug `sikke-kolye` |
| Miras Hediye Sertifikası | `51d4f027-1757-41cf-95c5-5e81f40ba602` | Aynı varyant ve fiyatlar, opsiyon seti yok |
| Opsiyon seti "Sikke Kişiselleştirme" | `2e4b71d3-d3a8-41c2-9c08-e5418a1fd50e` | 25 opsiyon (Kaplama (14K) ve R2d'nin 3 opsiyonu dahil); Yüz 2 opsiyonları "2. Yüzü Kişiselleştir" seçilince aktif. Admin arayüzünden kuruldu |
| Kampanya "Miras Hediye Sertifikası" | `011ebc8c-839f-492f-8ee2-4aec8c4341a1` | %100, koşul "Ürünler: Sikke Kolye", Tüm Kişiler, TRY. Koşul, müşteri ve kur ayarı admin arayüzünden düzeltildi |
| Test kuponu | `MONETARTS-TEST-2026-0001` | Tek kullanımlık, %100; ikas küçük harfle saklıyor. Sepete uygulanıp kaldırılarak test ediliyor (R2c'de çekmece ve sepet sayfasında); 16.09.2026 itibarıyla mağazada sipariş yok, kupon tüketilmedi |

**ikas admin MCP** — `ikas-admin` sunucusu local kapsamda ekli (GraphQL köprüsü: `list`, `introspect`, `execute`). Ürün, varyant, fiyat, stok, kampanya ve kupon işlemleri var. **Opsiyon seti oluşturan işlem yok**; set admin arayüzünden kurulur, sonra `updateProduct` ile `productOptionSetId` bağlanabilir. Her `execute` çağrısında `operationName` listelenmiş bir işlem adı olmalı (ör. `listProduct`). Yazma işlemleri auto mode'da izin kuralı ister. **Kampanya kurmak için admin arayüzü daha güvenli:** `createCampaign` ile kurulan kampanyada `PRODUCT` filtresi arayüzde tanınmadı (ürün seçili görünmedi), müşteri kapsamı boş "Spesifik Müşteriler" ve kur listesi boş kaldı. Sonuç `COUPON_APPLIED_WITHOUT_DISCOUNT` hatasıydı; üçü arayüzden düzeltilince kupon çalıştı.

**Yüklenmiş görseller** — logo, logotype, 20 sikke görseli, foto rehberi ve hiyeroglif rehberi CDN'de. Id'ler Ana sayfadaki section değerlerinde (`get_section_values`). Yüklenmemiş referans görselleri: `quota-modal-hero.jpg`, `welcome_atolye.png`, `style-test-1/2/3.png`, iki `*_sakal_tone.png` (kullanılmıyor).

---

## 5. Açık uçlar

Önceki fazlardan kalan, ilgili fazda kapatılacak işler.

| Konu | Nerede | Kapanacağı faz |
|---|---|---|
| Fotoğraf yükleme editör önizlemesinde otomasyonla denenemedi (iç iframe). Kullanıcı elle test edecek: 5 MB/tür reddi, yükleme, sipariş satırında dosya URL'leri | CoinConfigurator | 11 (QA) |
| Test siparişi verilip sipariş satırında tüm opsiyon değerlerinin göründüğü kontrol edilmedi (Faz 4 bitti kriteri, kullanıcı elle yapacak) | CoinConfigurator | 11 (QA) |
| %100 kupon sepetteki **tüm** Sikke Kolye adetlerini sıfırlıyor. Gerçek sertifika için sertifika bedeli kadar Sabit Tutar indirim ya da adet sınırı seçilmeli. **Kullanıcı kararı (Faz 11): merchant admin'de seçecek** | admin | merchant |
| Fiyatlar "₺ 22,000.00" biçiminde; mağaza para birimi biçimi admin ayarlarından TR'ye çevrilmeli | admin | 11 |
| Hero "Kolyeni Tasarla" ve Footer "Tasarım Atölyesi" Faz 11a'da EXTERNAL `/#atolye` yapıldı. Kalan INDEX linkleri bilerek öyle: Footer "Atölye"/"Yardım" sütun başlıkları (alt linkli başlık tıklanmaz), Galeri "Ana Sayfa" ve "Bu Modeli Tasarla" (`/?seri=…`, konfigüratör parametreyi okuyup kendine kaydırıyor) — yayında tıklanarak doğrulanacak | Hero, Footer | 11b (QA) |
| Hukuki metinler referanstaki kısa taslak. Mesafeli Satış'ta satıcı unvanı, adres, MERSİS/vergi no, iletişim ve ödeme/teslim bilgileri; KVKK'da veri sorumlusunun iletişim bilgisi ve başvuru yöntemi yok. Merchant/avukat tamamlamalı, sonra `updatedDate` doldurulmalı | LegalPage sayfaları | içerik |
| İçerik tutarsızlığı: SSS 4. soru "5 ila 15 iş günü", Teslimat ve Mesafeli Satış "10-15 iş günü" diyor. Kullanıcı kararı (Faz 11): merchant düzeltecek | SSS / hukuki | içerik |
| Mobil menü paneli hiç açılmıyordu (Faz 1): global `.mon-drawer.is-open` panelin kendisini bekliyor, `is-open` ise kapsayıcıda. Header CSS'ine `.mon-menu.is-open .mon-menu__panel` kuralı eklendi; kapalı menü ve sepet çekmecesinin gölgesi sağ kenara taşıyordu, o da giderildi. Yayında doğrulandı (400px'te panel açılıyor, kapalı çekmeceler 120px dışarıda) — kapatılabilir | Header, CartDrawer | ✅ |
| Night modunda sayfa en üstteyken Header gri görünüyordu (cam bar beyaz body zeminini gösteriyor). Faz 11a: gece cam barının altına `--bg-page` katmanı kondu; yayında bakılacak | Header | 11b (QA) |
| Hakkımızda ve SSS'te `h1` yoktu. Faz 11a: OriginStory ve Faq'a `titleAsH1` (varsayılan kapalı) eklendi, iki sayfada açıldı — yayında bakılacak | SEO | 11b (QA) |
| EXTERNAL göreli linkler (`/#atolye`, `/pages/koleksiyon?seri=…`) dil prefix'i almıyordu (Footer seri linkleri, CartPage "Atölyeye Dön", 404 "Kolyeni Tasarla", AccountPage boş durumları). Faz 11a: `linkAttrs`/`linkHref` (`src/utils/links.ts`) `/` ile başlayan href'leri `withRoutePrefix`'ten geçiriyor. İkinci routing kurulunca doğrulanacak | tüm link'ler | 11d |
| Ana vitrinde (`dev-monoart.myikas.com`) hâlâ eski tema var ve `<html lang="en">` dönüyor; büyük harfe çevrilen Türkçe metinde i → I oluyor. Bizim temanın önizlemesi `lang="tr"`. Ana temaya yayından sonra doğrula | tüm section'lar | 11 |
| Galeride 22 Ayar, Model ve Paketleme görselleri yok, yer tutucu görünüyor. Merchant yükleyecek; istenirse `showEmptyCells` kapatılır | CollectionGallery | içerik |
| İletişim formu mesajları admin panelinde görünmüyor (Gelen Kutusu'nda "ikas Form" kanalı "Yakında"); mesajlar mağaza sahibinin e-postasına geliyor — kullanıcı test mesajlarının geldiğini doğruladı. Merchant'a form mesajlarını e-postadan takip etmesi söylenmeli | admin / e-posta | bilgi |
| Özel Tasarım görselli gönderim yayında çalışıyor: 4 dosya 3+1 parça S3'e yüklendi (204), mesaj gönderildi (200), başarı ekranı açıldı; istemci kontrolleri (PDF/6 MB reddi, tekrar, 5 dosya sınırı, kaldır) doğrulandı. Kalan: e-postadaki görsel linklerinin merchant'ta açılması (anonim 403). Kullanıcı yükleme hatasını ve bucket erişimini ikas'a danışacak; sonuca göre yükleme kalır ya da WhatsApp/e-posta ile görsel isteme sürümüne geçilir | BespokeRequest | ikas yanıtı |
| **ikas `productOptionFileUpload` tarayıcıda çalışmıyor** (bp-storefront 2.9.1, S3'e elle `Content-Type: multipart/form-data` → 400 `MalformedPOSTRequest`). Konfigüratördeki fotoğraflar bu yüzden hiç yüklenmiyordu. `src/utils/option-file-upload.ts` ile aşıldı (konfigüratör + Özel Tasarım); konfigüratör eksik yüklemede artık sepete eklemiyor (`photoUploadErrorToast`). ikas SDK ekibine bildirilmeli; düzelince yardımcı kaldırılabilir | CoinConfigurator, BespokeRequest | ikas |
| Yüklenen dosyaların `optionUrl`'i imzasız S3 adresi ve 403 dönüyor (bucket kapalı). Özel Tasarım mesajındaki linkler merchant'ta açılıyor mu, kullanıcı panelden kontrol edecek; açılmıyorsa yükleme yerine WhatsApp/e-posta ile görsel istenir. Konfigüratör siparişinde dosyanın panelde açıldığı da test siparişinde görülmeli. Müşteri tarafında Faz 10c'deki sipariş detayı dosyayı storefront `getOrderLineFile` ile imzalı adresten açıyor; test siparişinde çalıştığı görülmeli | BespokeRequest, CoinConfigurator, AccountPage | 8 sonu |
| Faz 9 test başvurusu ("Test Claude", test@ornek.com, `[Elçi Başvurusu]`) gönderildi, ikas kabul etti. Mağaza sahibinin e-postasında başlık satırının (Sosyal Medya Hesabı · Hedef Kitle Lokasyonu) ve vizyon bloğunun okunur geldiğini kullanıcı kontrol edecek. Footer "ambassadors" linkinin `/pages/elciler`'e gittiği yayında doğrulanacak | admin / Footer | 11 (QA) |
| Hazır hesap sayfaları Night şemasına geçmiyordu ve ikas fontunu kullanıyordu. Faz 10c'de kendi `AccountPage` section'ımızla değiştirildi — kapatılabilir | hazır sayfalar | ✅ |
| Faz 10c son düzeltmeleri (Favoriler gizleme, adres etiketleri İl/İlçe/Mahalle, seçeneksiz mahalle alanını gizleme, adres formunda ilk alana odak, gece soluk metin kontrastı) editöre gönderildi ve beş yerleşime yazıldı; yayına alınınca geçerli olur | AccountPage | yayın |
| **Faz 10c kalan testleri** (§3.6 "Yayın testi"): "Verilerimin kopyasını gönder" e-postası, bir test siparişiyle sipariş listesi ve detay (sikke özeti, küçük resim, "Fotoğrafı aç" imzalı adresi, adresler, ödeme, toplamlar), kargo bilgisi (admin'den kargo girilince), iade talebi (kullanıcı onayıyla), hesap silme **ayrı test hesabıyla**. Yeniden yayından sonra adres formunun yeni etiketleri ve gece görünümü de bakılacak | AccountPage | 11 (QA) |
| Favoriler **gizli** (kullanıcı kararı, 2026-09-14; başka bir planı var): `AccountPage.showFavorites` varsayılan kapalı → menüde ve Hesabım özetinde yok, favori sayısı sorgulanmıyor. Sayfa (FAVORITE_PRODUCTS) ve panel duruyor; açmak için beş yerleşimde `showFavorites` açılır. Sitede favoriye ekleme düğmesi yok; boş durum metni "kalp simgesiyle" diyor | AccountPage, CoinConfigurator | kullanıcı planı |
| Kayıt formundaki onay linklerinin Kullanım Şartları ve KVKK'ya gittiği yayında bakılacak | AuthRegister | 11 (QA) |
| Google/Facebook butonları açık ama **admin'de sosyal giriş kurulu değil**: yayında Google'a basınca ikas `socialLoginError=SETTINGS_NOT_FOUND!` döndü. Butonlar artık "Sosyal hesapla giriş tamamlanamadı" bandı gösteriyor. Admin'de Google/Facebook kurulmalı ya da AuthLogin/AuthRegister'da `showGoogle` / `showFacebook` kapatılmalı. **Kullanıcı kararı (Faz 11): butonlar kalıyor, sosyal giriş QA'ya girmiyor** | admin / AuthLogin, AuthRegister | kullanıcı |
| Faz 10b'de gerçek gönderimle denenmedi (kullanıcı onayı bekliyor): kayıt formu (yeni test müşterisi), "şifremi unuttum" e-postası ve gelen linkle şifre yenileme, e-posta doğrulama linki. Yanlış şifre bandını kullanıcı elle denedi, sonucu kaydedilmedi. Mağaza captcha açarsa SDK `grecaptcha` bekler; bizde widget yok | AuthRegister, AuthForgotPassword, AuthRecoverPassword, AuthVerifyEmail | 11 (QA) |
| Dil seçici tek dilde "TR ⌄" gösteriyor (referanstaki gibi); menüde yalnız TR var. Referanstaki EN/FR/IT/RU/AR için admin'de storefront routing'leri kurulmalı (admin MCP'de routing işlemi yok, arayüzden), her routing'de TEXT prop'lar çevrilmeli, AR'de `dir="rtl"` kontrol edilmeli. **SDK notu (bp-storefront 2.9.1):** `baseStore.languageOptions` yalnız ziyaretçinin ülkesini `countryCodes`'unda taşıyan routing'lerden kurulur; ülke kodu olmayan routing'lerde (bizim TR routing'i `countryCodes: null`) liste boş kalır. `LanguageSwitcher` bu durumda `IkasStorefrontConfig.routings`'ten okur. Routing'lere ülke kodu verilirse SDK listesi yalnız o ülkenin dillerini gösterir; kurulumda buna göre karar verilmeli. **Kullanıcı kararı (Faz 11): referanstaki 6 dil.** Engel: MCP yazma araçları (`update_section_prop`, `update_page_sections`) routing id almıyor, yalnız `list_page_sections` routing durumunu okuyor; çevirinin editöre nasıl yazılacağı 11d başında araştırılacak. 655 TEXT/RICH_TEXT prop var; referansın `monart-i18n.js`'i ~200 anahtarı 6 dilde veriyor, hukuki/üyelik/hesap metinleri yalnız TR | admin / Header / tüm section'lar | 11d |
| Footer e-postası ~880px'te 21px taşıyordu; Faz 11a'da `.mon-footer__link`'e `overflow-wrap: anywhere` verildi — yayında bakılacak | Footer | 11b (QA) |
| Global `.mon-btn`'de `:focus-visible` yoktu; Faz 11a'da `global.css`'e eklendi (2px altın, 3px offset) — yayında klavyeyle bakılacak | global.css | 11b (QA) |
| Referans v2'de uygulanmayacaklar (ikas checkout / sayfa yapısı yüzünden): ödeme penceresindeki onayların "Ayrıntılar"a bölünmesi, sabit kodlu indirim kodları, nav "İletişim"in modal açması. Liste `docs/reference-v2-changes.md` §1 | — | bilgi |
| Tipografi eşitlemesinden kalan bilinçli farklar (`docs/typography-audit.md` "Bilerek bırakılanlar"): `.mon-btn` line-height (global), İletişim sayfa başlığı hâlâ 600 büyük harf (Özel Tasarım başlığı referans modalı gibi 500 ve büyük harfsiz oldu, iki form sayfası artık farklı), Hero alt satırı referansta gizli, "Temizle" ikonu yok, Rusça başlıklarda Cormorant yedeği | çeşitli | kullanıcı / 11d |

---

## 6. Fazlar

### Faz 4 — Konfigüratör canlı test ve ürün bağlama

**Amaç:** Faz 3'te yazılan konfigüratörü gerçek ürünle uçtan uca çalışır hale getirmek.

**Ön koşul (kullanıcı):** `docs/configurator-admin-setup.md`'ye göre admin'de "Sikke Kolye" ürünü, Materyal varyantları, opsiyon seti, "Hediye Sertifikası" ürünü ve en az bir test kuponu kurulmuş olmalı.

**Okunacaklar:** `docs/configurator-admin-setup.md`, `docs/configurator-logic.md` §14, `src/components/CoinConfigurator/index.tsx`, `src/utils/ikas-options.ts`.

**İşler:**
1. `search_products` ile ürün id'lerini bul, Ana sayfadaki section'da `product` ve `giftProduct` prop'larını bağla.
2. Editor önizlemesinde `docs/configurator-admin-setup.md` §5 test listesini tek tek dene. Masaüstü ve 400px mobil genişlikte ekran görüntüsü al.
3. Bulunan hataları düzelt. Özellikle kontrol et: opsiyon adı eşlemesi, CHOICE değer seçimi, 2. yüz child opsiyonları, FILE yükleme, fiyat hesabı, kupon uygulama, sepet çekmecesinin açılması.
4. PRODUCT sayfası: ürün sayfası oluşunca konfigüratörü oraya da yerleştir. Section, sayfa ürününü `product` prop'u boşken otomatik almalı mı, karar ver ve uygula.
5. Canvas önizlemesinin küçük bir görüntüsünü sepet satırına eklemek gerekiyorsa değerlendir. Referansta sepet satırında sikke küçük resmi var.

**Bitti kriteri:** Test listesi geçiyor, sipariş satırında tüm opsiyon değerleri ve fotoğraf URL'leri görünüyor.

---

### Faz 5 — Koleksiyon galerisi

**Amaç:** Referanstaki galeri overlay'ini ayrı bir sayfaya taşımak.

**Okunacaklar:** `docs/reference-inventory.md` "Sayfa 2", `MonArt Lux.html` galeri bloğu (`id="gallery"`, satır ~1513–1570) ve lightbox (~1766–1784), `monart-lux.js` `openGallery`, `selectGalleryTab`, `openLightbox`…`lbChooseDesign` (satır ~1021–1250), `monart-lux.css` galeri ve lightbox kuralları.

**Referans içerik:** Sticky başlık, 3 seri sekmesi, seçili seriye göre hikâye kartı (eyebrow, başlık, "Miras Notu", 2 paragraf, 3 etiket), 3 materyal satırı × Bay/Bayan/Model/Paketleme grid'i, boş hücreler için yer tutucu, lightbox (önceki/sonraki, zoom, kaydırma, klavye, sayaç, "Bu Modeli Tasarla").

**ikas hedefi (öneri):**
- `CollectionGallery` section. Seri başına içerik için `GallerySeries` child (COMPONENT_LIST): sekme adı, hikâye metinleri, etiketler, görsel listesi.
- Görseller editoryal olduğu için ürün listesinden değil IMAGE prop'larından gelir.
- `Lightbox` sub-component.
- Yeni PAGE "Koleksiyon" (`create_page`), seri sekmesi URL parametresiyle seçilebilir (ör. `?seri=osmanli`).

**Karar gerekli:** "Bu Modeli Tasarla" konfigüratörü o seri ve cinsiyetle açmalı mı? Açacaksa CoinConfigurator URL parametresi okuyacak şekilde güncellenir.

**Bitti kriteri:** Seri kartları ve "Koleksiyonları İncele" CTA'sı galeri sayfasına bağlı.

---

### Faz 6 — Sepet sayfası

**Amaç:** CART sayfasını temaya uygun yapmak ve kişiselleştirilmiş satırları okunur göstermek.

**Okunacaklar:** `get_section_template("cart-section")`, `src/sub-components/CartDrawer`, `MonArt Lux.html` sepet drawer'ı (satır ~759–900), `docs/reference-inventory.md` "Sayfa 4".

**İşler:**
1. `CartPage` section: satır listesi, adet, sil, kupon alanı, ara toplam, ödeme butonu. Ödeme ikas'ın kendi checkout'u.
2. Satırda opsiyon özeti: referanstaki gibi "Seri · Cinsiyet · Materyal" başlığı ve "Ön: … · Arka: …" meta satırı. Sipariş satırı opsiyon değerlerinden türetilir.
3. Aynı özet mantığını `CartDrawer`'a da uygula. Ortak yardımcıyı `src/utils/` altına koy.
4. Boş sepet durumu, "Sikke Sikke Öde" butonu stili.

**Bitti kriteri:** Konfigüratörden eklenen ürün hem drawer'da hem sepet sayfasında okunur özetle görünüyor.

---

### Faz 7 — Statik içerik sayfaları

**Amaç:** Footer'daki içerik linklerinin gideceği sayfaları kurmak.

**Okunacaklar:** `monart-lux.js` `LEGAL_DOCS` (satır ~1973–2027) ve `openTerms` (~1945), `MonArt Lux.html` legal ve terms modal'ları (~1477–1510), `get_section_template("rich-text-section")`.

**Sayfalar:**
- Hakkımızda: mevcut `OriginStory` + `BespokeCall` section'ları yeniden kullanılır.
- SSS: mevcut `Faq` section'ı.
- Hukuki: Mesafeli Satış, KVKK, Gizlilik, Teslimat ve İade, İptal, Bakım, Hediye Sertifikası + Görsel Hakları ve Sanatsal Tolerans Politikası. Toplam 8 sayfa.

**ikas hedefi:** Tek bir `LegalPage` (veya `RichTextPage`) section: başlık, güncelleme tarihi, RICH_TEXT gövde, isteğe bağlı içindekiler. Her doküman ayrı PAGE, içerik referanstan birebir aktarılır.

**Bitti kriteri:** Footer'daki hukuki ve yardım linkleri gerçek sayfalara gidiyor.

---

### Faz 8 — İletişim ve Özel Tasarım formları

**Amaç:** Referanstaki iletişim ve özel tasarım modal'larını çalışan formlara çevirmek.

**Okunacaklar:** `MonArt Lux.html` contact modal (~1433–1476) ve bespoke modal (~1084–1163), `monart-bespoke.js`, `monart-lux.js` contact submit (~2063–2110), `get_framework_guide("form-handling")`, `get_function_doc("submitContactForm")`.

**Kısıt:** ikas iletişim formu yalnız ad, soyad, e-posta, telefon ve mesaj alanlarını gönderir. Referanstaki konu, sipariş no, materyal seçimi ve dosya yükleme alanlarının karşılığı yok.

**Karar gerekli (faz başında):**
- Konu, sipariş no ve materyal seçimi mesaj metnine eklenerek mi gönderilsin?
- Özel tasarım talebindeki dosya yükleme nasıl karşılanacak? Seçenekler: dosyasız form + WhatsApp veya e-posta ile görsel isteme, ya da FILE opsiyonlu sıfır fiyatlı bir "Özel Tasarım Talebi" ürünü.

**ikas hedefi:** `ContactForm` section (İletişim PAGE), `BespokeRequest` section (Özel Tasarım PAGE). BespokeCall butonu bu sayfaya bağlanır.

**Bitti kriteri:** İki form gönderiliyor, merchant panelinde mesaj görünüyor, başarı ekranı çalışıyor.

---

### Faz 9 — Marka Elçileri

**Karar gerekli (faz başında):** Bu sayfa yapılacak mı? Referansta başvuru formu, elçi girişi ve bir elçi paneli (istatistik, indirim kodu, sözleşme) var. Panel ikas'ta hazır karşılığı olmadığı için kapsam dışı öneriliyor.

**Okunacaklar:** `docs/reference-inventory.md` "Sayfa 3", `MonArt Lux.html` `id="ambassador"` bloğu (~1574–1765), `monart-lux.js` `openAmbassador`, `setupAmbassador` (~1043–1117).

**ikas hedefi (yapılırsa):** `AmbassadorProgram` section: tanıtım metni, arma, başvuru formu (Faz 8'deki iletişim formu altyapısıyla). PAGE "Elçiler".

---

### Faz 10 — Hesap sayfaları ve 404

**Amaç:** Giriş, kayıt, şifre, hesabım, siparişler, adresler ve favoriler sayfalarını temayla uyumlu hale getirmek.

**Okunacaklar:** `list_ready_made_pages` çıktısı, `docs/theme-globals.md`, `get_section_template("not-found-section")`.

**İşler:**
1. ikas'ın hazır sayfalarını etkinleştir (`enable_ready_made_pages`). Özel kod yazılmaz.
2. Paylaşılan kapsamda logo ve renkleri tema renklerine bağla (`update_ready_made_page_prop`, `patternValueId` ile).
3. Header'daki hesap ikonunun bu sayfalara gittiğini doğrula.
4. `NotFound` section ile 404 sayfası.

---

### Faz 10c — Hesap section'ı

**Amaç:** ikas'ın hazır hesap sayfalarını (ACCOUNT, ORDERS, ORDER_DETAIL, ADDRESSES, FAVORITE_PRODUCTS) kendi `AccountPage` section'ımızla değiştirmek.

**Okunacaklar:** `docs/account-pages.md` (§1 ortak kurallar, §3 plan ve doğrulanmış API notları), `src/utils/auth.ts`, `src/components/AuthLogin/index.tsx` (form kalıbı), `src/sub-components/CartLine` + `src/utils/cart-summary.ts` + `coin-thumbs.ts` (sipariş satırı özeti), `src/sub-components/SealModal` (modal iskeleti), `src/components/LegalPage` (mobil sekme şeridi).

**Karar gerekli (faz başında):** `docs/account-pages.md` §3.3 madde 1'deki üç soru (fotoğraf indirme düğmesi, verilerimi indir, iade nedeni).

**İşler:** §3.3 sırasıyla. Hazır `account` grubu en sonda kapatılır (sayfalar silinir, `create_page` ile yeniden açılır; Faz 10b'de yaşandı).

**Bitti kriteri:** §3.4 test listesi yayında geçiyor; test müşterisiyle bir sipariş verilip detayda sikke özeti ve kargo bilgisi görülüyor; hesap silme ayrı test hesabıyla doğrulanıyor.

---

### Faz R2 — Referans v2 eşitleme

**Amaç:** `reference/MonArt2_clean/` ile gelen değişiklikleri temaya taşımak. 11b QA'sından önce biter. Alt adımlar birbirinden bağımsız; her biri ayrı sohbette "Faz R2c'ye başlayalım" gibi başlatılır.

**Her alt adımda ortak:**
- Referans tarayıcıda: `python3 -m http.server 8765 --directory reference/MonArt2_clean` (arka planda), iş bitince durdur.
- Kod → `check --json` + `build` → `import_section` (değişen section'lar; sub-component değiştiyse onu kullanan tüm section'lar) → editör değerleri `update_page_sections`.
- Görsel test yayın önizlemesinde (`https://3svte-dev-monoart.myikas.com/`): yayını kullanıcı yapar (`publish_theme` auto mode'da reddediliyor). Sayfa iframe'siz olduğundan `javascript_tool` ile ölçülür; 400px için sayfaya `position:fixed; width:400px` aynı kaynaklı iframe eklenir. Gece testi `localStorage.monart_theme = "night"`, test sonunda `day`'e döndür.
- Bitince §1 Durum satırını ve §5'i güncelle.

---

#### R2a — Doküman ✅ (16.09.2026)
`docs/reference-v2-changes.md` yazıldı; `configurator-logic.md` (§3.5 sol yay, §7 yön, §10.4 anahtarlar, §10.6 zincir, §14.1), `configurator-admin-setup.md` (§2.1–2.3 üç yeni opsiyon), `collection-gallery.md`, `reference-inventory.md` güncellendi. Kullanıcı kararları: köşe için yalnız 3 global token, yön/zincir admin opsiyonu, elçi paneli Faz 12.

#### R2b — Köşe sistemi + içerik ✅ (16.09.2026)
Yapılanlar (yeniden yapılmaz):
- `src/global.css` `--r-btn`, `--r-card`, `--r-input` = 6px (`--r-field` 6, `--r-modal` 14, `--r-pill` değişmedi).
- 6px'e çekilen bileşen kuralları: `CoinConfigurator` (kaplama/2. yüz kartı, 2. yüz açıklaması alt köşeler, not alanı, stil testi, hediye anahtarı, redeem ve hediye paneli), `FaceDesigner` (büst/sarık kartı, hiyeroglif uyarısı, Roma rakamı kutusu, iptal ayrıntısı, cinsiyet anahtarı ilk/son düğme), `CollectionGallery` (sekme, CTA, görsel kartı; hücre etiketi pill), `Header` (Özel Tasarım CTA, dropdown), `SeriesCard` (hover katmanı; rozet pill), `BespokeCall` kartı, `LanguageSwitcher`, `Lightbox` (sahne, CTA), `CoinCheckoutButton`, `CartDrawer` paneli (≤860px düz). Mühür ve foto rehberi pencereleri referansta 14px, dokunulmadı. Onay kutuları (2–3px) bilerek küçük kaldı.
- `CoinConfigurator` `.cfg__preview` iki temada çerçevesiz; ≤860px gece `var(--dark)` + alt `--line`.
- Prop varsayılanları (CLI): `CoinConfigurator.pgIntro` yeni metin, `Footer.tagline` boş, `CollectionGallery.{roma,osmanli,misir}Tag1-3` boş.
- Editör değerleri: Footer `tagline` (Ana sayfa `qsO74gYFds`), galeri 9 etiket (`KmMWViHQSH`), `pgIntro` (`CnxvAPawqP`, `vCT6WKmBTD`), LegalPage gövdeleri: Mesafeli Satış `scbSmLz9RW`, Hediye Sertifikası `oc92cY1imV`, Kullanım Şartları `7pcWHVQXnw`.

#### R2c — Sepet çekmecesi: indirim kodu + ödeme butonu ✅ (16.09.2026)
Yapılanlar (yeniden yapılmaz):
- Kullanıcı kararları: buton görseli IMAGE prop (boşsa eski SVG); çekmecede tek "İndirim" satırı (azaltan tüm ayarlamaların toplamı, `getIkasOrderDisplayedAdjustments` + `getOrderAdjustmentIsDecrement`, `formatCurrency`); sepet sayfasının kupon görünümü aynı kaldı.
- Yeni `src/sub-components/CouponField` (`variant: "page" | "drawer"`): uygula (reddedilirse küçük harfle yeniden), kaldır, uyarılar. `emptyCodeText` verilirse boş kodda uyarı gösterir (çekmece), verilmezse buton boş kodda pasif (sayfa). `freeCartText` sepet `totalPrice <= 0` iken. Gündüz renkleri bileşende, çekmecenin gece renkleri `Header/styles.css`'te (`.mon-header.mon-night .coupon__*`). Sayfa görünümünün CSS'i `CartPage/styles.css`'ten buraya taşındı (`cart-pg__coupon-*` → `coupon--page`).
- `CartDrawer`: kupon alanı TOPLAM'ın üstünde; indirim > 0 iken `kese__lines` (Ara Toplam = `getIkasOrderFormattedTotalPrice`, İndirim `−` + tutar). Uygulanmış kod kutusunda referanstaki "· %5" yok (ayarlamadaki `amount` TL tutarı, oran okunamıyor).
- `CoinCheckoutButton`: `icon` prop'u, v2 ölçüleri (≤720px literal media), `splitSmile` kaldırıldı.
- Prop'lar (CLI): Header `cartTexts` grubuna `cartCouponPlaceholder`, `cartCouponApplyText`, `cartCouponApplyingText`, `cartCouponRemoveText`, `cartCouponEmptyText`, `cartCouponErrorText`, `cartCouponFreeText`, `cartSubtotalLabel`, `cartDiscountLabel`, `checkoutIcon`; CartPage `summary` grubuna `checkoutIcon`. `checkoutButtonText` varsayılanı "Ödemeye Geç" (iki bileşen).
- Editör değerleri: `btn_coin_stack.png` → `theme-images/d1cda60c-f663-4daf-a4ec-16e74f0d4a47`; Header (`I2zu1VeMMs`) ve CartPage (`uZr5rmv1FA`) `checkoutIcon` + `checkoutButtonText`.

#### R2d — Konfigüratör: portre yönü + zincir + metinler ⏳
**Ön koşul ✅ (16.09.2026, Claude in Chrome ile admin arayüzünden kuruldu, set 25 seçenek):** "Sikke Kişiselleştirme" setinde `Zincir Uzunluğu` (üst seviye; `50 cm` / `55 cm` / `60 cm`; zorunlu), `Yüz 1 · Portre Yönü` (`Sağa Bakan Profil` / `Sola Bakan Profil`; zorunlu), `Yüz 2 · Portre Yönü` ("2. Yüzü Kişiselleştir" seçilince aktif, zorunlu değil). Üçünde de maksimum seçim 1, değerler ücretsiz. Faz başında `search_products` / storefront ürün verisiyle opsiyonların geldiği doğrulanır (admin değişikliği vitrine ~30 dk gecikebilir).

**Okunacaklar:** `docs/reference-v2-changes.md` §2–4; `docs/configurator-logic.md` §3.5, §7, §10.4–10.6; `docs/configurator-admin-setup.md` §2; referans `monart-lux.js:202-212` (aynalama), `247-260` + `291-382` (sol yay), `618-622` + `855-865` (yön), `730-736` (zincir), `2440-2467` (pencere), `MonArt Lux.html:319-331`, `655-664`, `1721-1751`, `monart-lux.css:5188-5226`; kod `src/utils/coin.ts` (`FaceState`, `defaultFace`), `src/sub-components/FaceDesigner`, `src/sub-components/CoinCanvas` (`drawSideText` yalnız sağ yay), `src/components/CoinConfigurator/index.tsx` (state satır ~214, `<CoinCanvas>` ~690), `src/utils/ikas-options.ts` (`OPTION_CONTRACT`), `src/utils/cart-summary.ts` (`summarizeLine`), `src/utils/coin-thumbs.ts` (`thumbForDesign`), `src/sub-components/SealModal` (pencere iskeleti).

**İşler:**
1. `coin.ts`: `FaceState`'e `direction: "right" | "left"` (varsayılan sağ); reset sağa döndürür.
2. `FaceDesigner`: cinsiyetten sonra etiket + "i" düğmesi + alt metin + iki seçenekli anahtar (`.fd__gender` görünümü). Düğme `onOpenDirectionInfo` çağırır.
3. Yeni `src/sub-components/DirectionInfoModal` (index.tsx + styles.css): `SealModal` iskeleti, Esc/backdrop/× kapatır, body kaydırması kilitli, `prefers-reduced-motion`. Metinler prop'tan (v2 §2.2).
4. `CoinCanvas`: `direction` prop'u; `left` ise clip içinde `translate(SIZE,0) scale(-1,1)` ile yalnız görsel; Osmanlı'da isim sol yaya (referans sol yay dalı: `startCursor = (π − 0.95) + spread`, `step = -1`). Efekt bağımlılıklarına `direction`.
5. Zincir: `CoinConfigurator`'da state (varsayılan "55"), 2. yüz kartından sonra, notun önünde üç seçenekli anahtar (`max-width: 460px`); fiyatı etkilemez, reset'te değişmez.
6. `ikas-options.ts`: `OPTION_CONTRACT`'a `direction: "Portre Yönü"`, `chain: "Zincir"`; sepete eklerken `setChoiceByKeywords` ile "sağa"/"sola" ve "50"/"55"/"60". "Opsiyon Sözleşmesi" grubuna (`options`) `optDirection`, `optChain` prop'ları (CLI).
7. `cart-summary.ts`: meta satırına sola bakan yüzde yön ve zincir; `CartLine` küçük resmi sola bakan 1. yüzde `transform: scaleX(-1)`.
8. Yeni TEXT prop'lar (CLI; gruplar `faces`, `head`, `photos`): yön etiketi, alt metin, sol/sağ seçenek, "i" aria; pencere başlık, giriş, üst etiket, alt başlık, 4 madde başlığı + metni; zincir etiketi + alt metni; `descriptionMobile` (≤980px'te `description` yerine).
9. Metin güncellemeleri (varsayılan + `CnxvAPawqP`, `vCT6WKmBTD` değerleri): `consentText` (v2 §4.2, `<strong>` gerekiyorsa prop tipi kontrol et), `consentInfoBody` (15/1-ç → 15/1-b), `consentMissingToast`.
10. `import_section`: CoinConfigurator, CartPage, Header (sepet özeti değişirse).

**Test:** yayın önizlemesinde Roma/Osmanlı/Mısır × sağ/sol, iki yüz ayrı yön; Osmanlı'da isim yaya taşınıyor ve alttan başlıyor; bilgi penceresi (Esc, backdrop, 400px); zincir seçimi; sepete ekle → çekmecede yön/zincir ve aynalı küçük resim; mobil açıklama metni; gündüz/gece.

**Bitti kriteri:** check + build temiz; test listesi geçiyor; sepete eklenen satırın opsiyonlarında Portre Yönü ve Zincir Uzunluğu var (sipariş satırı 11b QA'da).

---

### Faz 12 — Marka Elçileri paneli

**Karar gerekli (faz başında):** referans v2'deki panel (demo giriş, istatistikler, kişisel indirim kodu, sözleşme) ikas'ta nasıl karşılanacak ya da yapılacak mı. Elçi indirim kodları ikas kuponu olarak kurulabilir; komisyon takibinin karşılığı yok.

**Okunacaklar:** `docs/reference-v2-changes.md` §8, `reference/MonArt2_clean/MonArt Lux.html` `id="ambassador"` bloğu, `monart-lux.js` elçi bölümü (~2359–2435), `src/components/AmbassadorProgram`.

---

### Faz 11 — Link bağlama, dil, QA ve yayın

**İşler:**
1. Tüm INDEX'e giden linkleri düzelt: Hero CTA'ları, seri kartları, Footer kolonları, Header nav.
2. Dil: admin'de TR dışındaki diller için storefront routing'leri kurulduysa `LanguageSwitcher`'ı test et, gerekli TEXT prop'ları routing başına doldur, Arapça için `dir="rtl"` davranışını kontrol et.
3. QA: her sayfada Day ve Night şeması, 400px mobil, klavye ile gezinme, `prefers-reduced-motion`, konsol hataları. Faz 4'ten kalan elle testler (kullanıcı): konfigüratörde fotoğraf yükleme ve bir test siparişinde sipariş satırındaki opsiyon değerleri ile fotoğraf URL'leri. Referans v2 (R2): tüm sayfalarda 6px köşeler, sipariş satırında portre yönü ve zincir uzunluğu, sepet çekmecesinde kupon ve ödeme butonu.
4. SEO: sayfa başlıkları ve açıklamaları.
5. `publish_theme` ile yayın. Üretim yayını kullanıcının açık onayıyla yapılır.
