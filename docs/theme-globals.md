# MonArt — ikas Tema Global'leri (oluşturuldu 2026-09-11)

Editor "Styles" panelinde MCP ile oluşturuldu. Renk/tipografi/keyframe id'leri mağazaya özeldir (portable değil); component kodunda runtime listeleri (`getThemeColors()`, `getThemeTypography()`, `getThemeKeyframes()`) veya prop'lar üzerinden okunmalı. Color-scheme **slot** id'leri portable'dır → `src/theme-tokens.ts`.

## Color schemes
| Scheme | id | className | Varsayılan |
|---|---|---|---|
| Day (fildişi) | `WhIKBfy0wc` | `_WhIKBfy0wc` | ✔ |
| Night (koyu altın) | `eMAHxjlNKs` | `_eMAHxjlNKs` | |

Slot'lar (23): Background, Background/Surface, Background/Surface Deep, Background/Ivory, Text, Text/Dim, Text/Muted, Text/Ink, Accent, Accent/Light, Accent/Dim, Accent/Deep, Line, PrimaryButton/Background, PrimaryButton/Text, State/Success, State/Error ve konfigüratörün gündüz metin renkleri için 6 slot — id'ler `src/theme-tokens.ts` içinde.

Konfigüratör gündüz slot'ları (17.09.2026). Değerleri yalnız Day şemasında girildi; Night şeması Day'den devralıyor ve konfigüratör gece bunları kullanmıyor. `CoinConfigurator` kökünde `--cfg-day-*` değişkenlerine bağlanır (`dayTextVars()`), kurallar `styles.css` `.cfg:not(.mon-night)`.

| Slot | Day | id | Konfigüratörde |
|---|---|---|---|
| Configurator/Day Text | #1A1105 | `AAiI2Pg3hs` | açıklama, ipucu, malzeme adı/fiyatı, özet değeri, etiketler, seri adı, sayaç, isim/tarih alanı, Roma rakamı, öneri ipucu/başlık/adı, "Favori n" |
| Configurator/Day Text Secondary | #4A360A | `LxffeZiUYT` | özet etiketleri, alan alt yazıları, öneri açıklaması, yükleme alt yazısı |
| Configurator/Day Text Soft | #5A4A22 | `nbMe3TliYa` | büst/sarık ve kaplama açıklaması, yön ve zincir alt metni |
| Configurator/Day Label | #6D5210 | `AIet3wM4iu` | adım numarası, sipariş notu etiketi, fotoğraf onay metni |
| Configurator/Day Emphasis | #573F0C | `R8Lr3VvT9q` | başlıklardaki italik vurgu |
| Configurator/Day Faint | #30281A | `EhOzlwQi30` | saydamlıkla: malzeme özelliği (%60), "(isteğe bağlı)" (%60), not sayacı (%55), hiyeroglif uyarısı (%82) |

Mevcut slot'lardan: Text → ana başlık, cinsiyet/yön/zincir düğmeleri, seçili "Kendim İçin"; Accent/Light → adım başlıkları, 2. yüz açıklaması, placeholder (%45); Text/Ink → büst/sarık ve kaplama kartı adı (referans #2A1F08, Ink #231D10).

## Renkler (32)
| Grup | Ad | Değer | id |
|---|---|---|---|
| Gold | Gold | #C9A84C | rthJScKfiJ |
| Gold | Light | #F0D060 | zpVyXFqs1L |
| Gold | Pale | #E8D5A0 | 2iEYR7JaKd |
| Gold | Dim | #8B6914 | oaKJ18e846 |
| Gold | Deep | #5A4310 | cwCkk0lz4N |
| Gold | On Gold | #0C0A04 | 6hHhJzWrtt |
| Day | Page | #FFFFFF | 4Plr8cMVx1 |
| Day | Ivory | #F6F1E7 | HiK4tdjRRf |
| Day | Sand | #EFE8D8 | jAzCkiskc8 |
| Day | Sand Deep | #E7DDC8 | F8kxWgoBdm |
| Day | Bronze | #7A5A12 | a01PKQp4x5 |
| Day | Bronze Strong | #5A4310 | Fd51vzIrKl |
| Day | Bronze Dim | #856312 | kDAXpm8TiY |
| Day | Bronze Deep | #3A2A06 | OPR6QgeswS |
| Day | Text | #3E2E08 | 0HLP4iQaGY |
| Day | Text Dim | #5E480F | y8i0dhLsYk |
| Day | Text Muted | #7A5F22 | 40U9EfkL0V |
| Day | Ink | #231D10 | iZrE29gO8X |
| Day | Line | rgba(120,90,20,.26) | 4KrF3zXiCb |
| Night | Page | #000000 | Rz1HLaWmom |
| Night | Black | #04040C | KcWDh2xRRj |
| Night | Dark | #070710 | 53YDd0GAkE |
| Night | Dark Deep | #0B0B14 | wefnFXjxkg |
| Night | Text | #D4B96A | lD8xjpEyFh |
| Night | Text Dim | #6B5A2A | vNoIVqmWNm |
| Night | Text Muted | #3A3020 | S0719REc4C |
| Night | Ink | #E8E0CC | S8lHrtJIpr |
| Night | Line | rgba(201,168,76,.12) | AtSjBeKPA8 |
| State | Error | #B03434 | uiRjEvc2RZ |
| State | Warning | #D97757 | o8dJS5HAEv |
| State | Success Day | #3F7A3F | 08bjgUie0C |
| State | Success Night | #8FBF8F | 4xZGzbOUC3 |

## Tipografi (13) — `__patternElementEnum__` prop'u ile seçilir, `className` uygulanır
| Ad | Font | Weight | Size | LH | LS | Transform | id |
|---|---|---|---|---|---|---|---|
| Display | Cinzel | 600 | 56px | 1.14 | 4px | uppercase | zpHQSeRqgJ |
| Heading | Cinzel | 700 | 40px | 1.16 | .005em | uppercase | Fb6mo4Luan |
| Title | Cinzel | 700 | 26px | 1.2 | .02em | uppercase | 8c4rabz6jm |
| Step Title | Cinzel | 400 | 32px | 1.2 | — | uppercase | 3oos4TQNhB |
| Price | Cinzel | 700 | 28px | 1.2 | .01em | — | 63c1aEx0Sa |
| Eyebrow | Montserrat | 500 | 10px | 1.4 | .5em | uppercase | K5KPgNYCZa |
| Label | Montserrat | 400 | 9.5px | 1.4 | .32em | uppercase | 2DYRdt9gjp |
| Nav | Montserrat | 500 | 10px | 1.4 | .22em | uppercase | jrsmmgVQ82 |
| Button | Montserrat | 700 | 10.5px | 1.2 | .22em | uppercase | snNMfgXJSf |
| **Body (varsayılan)** | Montserrat | 400 | 17px | 1.55 | — | — | SI1FPz6rfq |
| Editorial | Montserrat | 400 italic | 17.5px | 1.65 | — | — | gA8nav3Fcv |
| Prose | Montserrat | 400 | 17px | 1.85 | .012em | — | xFbu2ZRdn8 |
| Input | Montserrat | 400 | 13px | 1.4 | .18em | uppercase | jGKl9ygT8d |

Not: `Coin Script` (Reem Kufi, `jyOhk5VMAx`) 17.09.2026'da silindi. Canvas'taki Osmanlı yazısı lisanslı AlphaKufi; koda gömülü (`src/utils/alpha-kufi-font.ts`), `CoinCanvas` `FontFace` ile yükler.

Not: Display referansta `clamp(32px,6vw,72px)`; tema stili sabit 56px, responsive küçültme component CSS'inde `bp()` ile yapılır.

## Breakpoint'ler — CSS'te `@media (max-width: bp(<id>))`
| Ad | px | id |
|---|---|---|
| Mobile (ana) | 860 | 5pw2fQi7Yr |
| Tablet | 768 | si9uMMi7m4 |
| Small | 640 | 5Xmvk6D0gV |
| XSmall | 560 | U8z79vEgVL |

## Keyframe'ler — `animation-name: <ref>`
| Ad | Tip | Süre / easing / tekrar | ref |
|---|---|---|---|
| Float | keyframe | 6s ease-in-out infinite (translateY 0→-12px→0) | _CbNR57NRuY |
| Shimmer | keyframe | 5s linear infinite (bg-pos 0→200%) | _mPbWt386Ac |
| Scroll Pulse | keyframe | 2.4s ease-in-out infinite | _QXcjZWUq9R |
| Price Pop | keyframe | .4s ease (scale 1.12) | _gAIB4hZogJ |
| Reveal | keyframe | .22s ease | _c0yLEhRBvm |
| Fade Up | keyframe | .5s cubic-bezier(.2,.7,.2,1) | _2zipd5vD0C |
| Shake | keyframe | .4s ease (±4px) | _9NxNHSvNYx |
| Coin Depth | keyframe | .6s cubic-bezier(.42,0,.28,1) (scale 1.1) | _bCsYpKnraV |
| Gold Sweep | keyframe | 4.2s ease-in-out infinite | _nJJPbI83BM |
| Card Lift | transition | transform .5s cubic-bezier(.2,.7,.2,1) → translateY(-8px) | _rrM70GqmnH |

Aynı animasyonlar `src/global.css` içinde `.mon-anim-*` utility'leri olarak da mevcut (editor'a bağımlı olmayan yedek).
