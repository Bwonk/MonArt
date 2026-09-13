import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  IkasProduct,
  IkasProductVariant,
  IkasImage,
  cartStore,
  getDefaultSrc,
  getDisplayedProductVariantTypes,
  getSelectedProductVariant,
  selectVariantValue,
  getProductVariantFinalPrice,
  getProductVariantFormattedFinalPrice,
  getProductOptionSet,
  setOptionRealPrices,
  hasValidProductOptionSetValues,
  initProductOptionSetValues,
  productOptionFileUpload,
  addItemToCart,
  saveCouponCode,
  formatCurrency,
  Router,
} from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import {
  FaceKey,
  FaceState,
  MaterialKey,
  Series,
  MATERIALS,
  SERIES_RULES,
  defaultFace,
  platingAllowed,
  effectiveFinish,
  is22kLook,
  artworkCandidates,
  materialFromLabel,
  dateToRoman,
  parseDesignQuery,
  DESIGN_PARAM_KEYS,
} from "../../utils/coin";
import { OPTION_CONTRACT, allOptions, findOption, findOptions, setChoiceByKeywords, setCheckbox, setText, isFile, optionExtraPrice } from "../../utils/ikas-options";
import { saveArtworkMap } from "../../utils/coin-thumbs";
import CoinCanvas from "../../sub-components/CoinCanvas";
import FaceDesigner from "../../sub-components/FaceDesigner";
import SealModal from "../../sub-components/SealModal";
import PhotoGuideModal from "../../sub-components/PhotoGuideModal";
import { FlipIcon } from "../../sub-components/Icons";

type GiftMode = "self" | "gift" | "redeem";
const GIFT_CODE_RE = /^MONETARTS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const FLIP_MS = 280;
/** Sikke görseli prop anahtarları: romaMGold, osmanliFSilverNosarik … */
const ARTWORK_KEY_RE = /^(roma|osmanli|misir)[MF](Gold|Silver)(Nobust|Nosarik)?$/;

interface MaterialCard {
  key: MaterialKey;
  name: string;
  price: string | null;
  spec: string;
  variantValue?: { id: string; name: string; variantTypeId: string; colorCode: string | null; thumbnailImageId: string | null };
}

function imgSrc(img: IkasImage | null | undefined): string | null {
  return img ? getDefaultSrc(img) : null;
}

/** Ürünün materyal varyant değerini bulur ve seçer. */
function selectMaterialVariant(product: IkasProduct, key: MaterialKey): void {
  const types = getDisplayedProductVariantTypes(product);
  for (const vt of types) {
    const dvv = vt.displayedVariantValues.find((d) => materialFromLabel(d.variantValue.name) === key);
    if (dvv) {
      selectVariantValue(product, dvv.variantValue, true);
      return;
    }
  }
}

function variantForMaterial(product: IkasProduct, key: MaterialKey): IkasProductVariant | undefined {
  return product.variants.find((v) => v.variantValues?.some((vv) => materialFromLabel(vv.name) === key));
}

export function CoinConfigurator(props: Props) {
  const {
    product,
    giftProduct,
    photoGuideImage,
    glyphGuideImage,
    eyebrow = "✦ Atölye ✦",
    title = "Kendi mirasını",
    titleAccent = "tasarla.",
    description = "",
    faceFrontLabel = "1. Yüz Görünümü",
    faceBackLabel = "2. Yüz Görünümü",
    flipLabel = "Yüzü Çevir",
    clearLabel = "Temizle",
    priceLabel = "Toplam Fiyat",
    priceSub = "",
    priceUnavailableText = "",
    step1Num = "01 — Materyal",
    step1Title = "Malzemeni",
    step1TitleAccent = "seç",
    step1Hint = "",
    materialSilverName = "925 Ayar Gümüş",
    material14kName = "14 Ayar Altın",
    material22kName = "22 Ayar Altın",
    specSilver = "",
    spec14k = "",
    spec22k = "",
    coinDiameter = "",
    specNote = "",
    platingTitle = "24 Ayar Altın Kaplama",
    platingDescSilver = "",
    platingDesc14k = "",
    platingFreeText = "Ücretsiz",
    materialMissingText = "",
    step2Num = "02 — 1. Yüz",
    step2Title = "1. Yüzü",
    step2TitleAccent = "tasarla",
    step2Hint = "",
    step3Num = "03 — 2. Yüz",
    step3Title = "2. Yüzü",
    step3TitleAccent = "tasarla",
    step3Hint = "",
    backToggleText = "2. Yüzü Kişiselleştir",
    backToggleDesc = "",
    faceDividerText = "✦ 2. Yüz Tasarımı ✦",
    photoTooLargeToast = "Fotoğraf 5 MB'tan büyük olamaz.",
    photoTypeToast = "Yalnızca JPG veya PNG yükleyebilirsiniz.",
    consentMissingToast = "",
    noteLabel = "Sipariş Notu",
    noteOptional = "",
    notePlaceholder = "",
    step4Num = "04 — Mühür",
    step4Title = "Siparişini",
    step4TitleAccent = "tamamla",
    step4Hint = "",
    sumMaterial = "Materyal",
    sumFront = "1. Yüz",
    sumBack = "2. Yüz",
    sumTotal = "Toplam",
    addToCartText = "Keseye At ✦",
    addingText = "Ekleniyor…",
    productMissingText = "",
    optionErrorText = "",
    cartErrorText = "",
    addedToast = "",
    trust1 = "",
    trust2 = "",
    trust3 = "",
    trust4 = "",
    showGiftMode = true,
    giftSelfText = "Kendim İçin Tasarla",
    giftGiftText = "Miras Hediye Et",
    giftRedeemText = "Mirası Teslim Al",
    giftIntro = "",
    giftChooseLabel = "",
    giftAddText = "Sertifikayı Keseye At ❦",
    giftAddedToast = "",
    giftMissingText = "",
    redeemIntro = "",
    redeemPlaceholder = "MONETARTS-XXXX-XXXX-XXXX",
    redeemButton = "Onayla",
    redeemOkText = "",
    redeemErrText = "",
    redeemAppliedLabel = "",
    redeemFailedToast = "",
    sealTitle = "",
    sealText = "",
    sealCancel = "",
    sealConfirm = "",
    pgTitle = "",
    pgIntro = "",
    pgCaption = "",
    pgBody = "",
    pgCancel = "İptal",
    pgConfirm = "Devam",
    optFace1 = OPTION_CONTRACT.face1,
    optFace2 = OPTION_CONTRACT.face2,
    optSeries = OPTION_CONTRACT.series,
    optGender = OPTION_CONTRACT.gender,
    optBust = OPTION_CONTRACT.bust,
    optSarik = OPTION_CONTRACT.sarik,
    optName = OPTION_CONTRACT.name,
    optDate = OPTION_CONTRACT.date,
    optRoman = OPTION_CONTRACT.roman,
    optPhotos = OPTION_CONTRACT.photos,
    optBackFace = OPTION_CONTRACT.backFace,
    optPlating = OPTION_CONTRACT.plating,
    optConsent = OPTION_CONTRACT.consent,
    optNote = OPTION_CONTRACT.note,
    anchorId = "atolye",
    backgroundColor = "#FFFFFF",
    closeLabel = "Kapat",
  } = props as Props & { closeLabel?: string };

  const theme = useSectionTheme();

  /* ------------------------------------------------------------ state */
  const [material, setMaterialState] = useState<MaterialKey>("22k");
  const [plated, setPlated] = useState<Record<MaterialKey, boolean>>({ silver: false, "14k": false, "22k": false });
  const [backEnabled, setBackEnabledState] = useState(false);
  const [currentFace, setCurrentFace] = useState<FaceKey>("front");
  const [flipping, setFlipping] = useState(false);
  const [front, setFront] = useState<FaceState>(() => defaultFace("roma", "M"));
  const [back, setBack] = useState<FaceState>(() => defaultFace("osmanli", "F"));
  const [samePhoto, setSamePhoto] = useState(false);
  const [note, setNote] = useState("");
  const [giftMode, setGiftMode] = useState<GiftMode>("self");
  const [redeemInput, setRedeemInput] = useState("");
  const [redeemCode, setRedeemCode] = useState<string | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [consentMissing, setConsentMissing] = useState<Record<FaceKey, boolean>>({ front: false, back: false });
  const [sealOpen, setSealOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideResolver = useRef<((ok: boolean) => void) | null>(null);
  const [adding, setAdding] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const frontStepRef = useRef<HTMLElement>(null);
  const backStepRef = useRef<HTMLElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const showToast = useCallback((msg: string) => {
    if (!msg) return;
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  /* ------------------------------------------------------------ ürün / opsiyon yükleme */
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    getProductOptionSet(product)
      .then(() => {
        if (cancelled) return;
        setOptionRealPrices(product);
        setOptionsLoaded(true);
      })
      .catch(() => setOptionsLoaded(true));
    // Ürünün seçili varyantından başlangıç materyalini al
    const sel = getSelectedProductVariant(product);
    const key = sel?.variantValues?.map((vv) => materialFromLabel(vv.name)).find((k): k is MaterialKey => !!k);
    if (key) setMaterialState(key);
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  const options = useMemo(() => (optionsLoaded ? allOptions(product) : []), [product, optionsLoaded]);
  /* Kaplama: admin'de birden fazla "Kaplama" opsiyonu olabilir (ör. 14K için ücretsiz ayrı opsiyon).
     14K'da en ucuzu, diğer materyallerde en pahalısı kullanılır. */
  const platingOpts = useMemo(() => findOptions(options, optPlating).slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0)), [options, optPlating]);
  const backOpt = useMemo(() => findOption(options, optBackFace), [options, optBackFace]);

  /* ------------------------------------------------------------ türetilmiş değerler */
  const isPlated = platingAllowed(material) && plated[material];
  const finish = effectiveFinish(material, isPlated);
  const look22k = is22kLook(material, isPlated);
  const variant = product ? getSelectedProductVariant(product) : undefined;
  const currencyCode = variant?.prices?.[0]?.currency ?? "TRY";
  const currencySymbol = variant?.prices?.[0]?.currencySymbol ?? "₺";

  const basePrice = variant ? getProductVariantFinalPrice(variant) : null;
  const platingOpt = platingOpts.length ? (material === "14k" ? platingOpts[0] : platingOpts[platingOpts.length - 1]) : undefined;
  const platingExtra = basePrice != null && isPlated ? optionExtraPrice(platingOpt, currencyCode, basePrice) : 0;
  const backExtra = basePrice != null && backEnabled ? optionExtraPrice(backOpt, currencyCode, basePrice) : 0;
  const totalPrice = basePrice != null ? basePrice + platingExtra + backExtra : null;
  const totalText = totalPrice != null ? formatCurrency(totalPrice, currencyCode, currencySymbol) : null;
  const platingUnitPrice = platingOpt && basePrice != null ? optionExtraPrice(platingOpt, currencyCode, basePrice) : null;
  const platingPriceText = platingUnitPrice != null && platingUnitPrice > 0 ? `+${formatCurrency(platingUnitPrice, currencyCode, currencySymbol)}` : null;
  /* "Ücretsiz" yalnız ikas tarafında da ücretsizse gösterilir; aksi halde gerçek fiyat yazılır. */
  const platingLabel = platingOpt ? (platingUnitPrice === 0 ? platingFreeText : platingPriceText) : material === "14k" ? platingFreeText : null;
  const backPriceText = backOpt && basePrice != null ? formatCurrency(optionExtraPrice(backOpt, currencyCode, basePrice), currencyCode, currencySymbol) : null;

  const materialNames: Record<MaterialKey, string> = { silver: materialSilverName, "14k": material14kName, "22k": material22kName };
  const materialSpecs: Record<MaterialKey, string> = { silver: specSilver, "14k": spec14k, "22k": spec22k };

  const materialCards: MaterialCard[] = useMemo(() => {
    const cards: MaterialCard[] = [];
    if (product) {
      for (const vt of getDisplayedProductVariantTypes(product)) {
        for (const d of vt.displayedVariantValues) {
          const key = materialFromLabel(d.variantValue.name);
          if (!key || cards.some((c) => c.key === key)) continue;
          const v = variantForMaterial(product, key);
          cards.push({ key, name: materialNames[key] || d.variantValue.name, price: v ? getProductVariantFormattedFinalPrice(v) : null, spec: materialSpecs[key], variantValue: d.variantValue });
        }
      }
    }
    if (!cards.length) {
      for (const key of MATERIALS) cards.push({ key, name: materialNames[key], price: null, spec: materialSpecs[key] });
    }
    return cards.sort((a, b) => MATERIALS.indexOf(a.key) - MATERIALS.indexOf(b.key));
  }, [product, variant?.id, materialSilverName, material14kName, material22kName, specSilver, spec14k, spec22k]);

  const artwork = (face: FaceState): string | null => {
    const keys = artworkCandidates(face.series, face.gender, finish, face.bust, face.sarik);
    for (const k of keys) {
      const img = (props as unknown as Record<string, IkasImage | null | undefined>)[k];
      if (img) return getDefaultSrc(img);
    }
    return null;
  };
  // Sepet satırı küçük resimleri için görsel haritasını paylaş (bkz. utils/coin-thumbs.ts).
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const [key, value] of Object.entries(props as unknown as Record<string, unknown>)) {
      if (!ARTWORK_KEY_RE.test(key)) continue;
      const src = imgSrc(value as IkasImage | null | undefined);
      if (src) map[key] = src;
    }
    saveArtworkMap(map);
  }, [props]);

  const thumbs = useMemo<Record<Series, string | null>>(() => {
    const p = props as unknown as Record<string, IkasImage | null | undefined>;
    return { roma: imgSrc(p.romaMGold), osmanli: imgSrc(p.osmanliMGold), misir: imgSrc(p.misirMGold) };
  }, [props.romaMGold, props.osmanliMGold, props.misirMGold]);

  const faceState = currentFace === "front" ? front : back;
  const faceRoman = SERIES_RULES[faceState.series].dateOn && faceState.dateOn ? dateToRoman(faceState.date) : "";

  /* ------------------------------------------------------------ eylemler */
  const setMaterial = (key: MaterialKey) => {
    setMaterialState(key);
    if (product) {
      selectMaterialVariant(product, key);
      setOptionRealPrices(product);
    }
  };

  const flipTo = useCallback(
    (target: FaceKey, scroll: boolean) => {
      if (target === currentFace) return;
      setFlipping(true);
      window.setTimeout(() => {
        setCurrentFace(target);
        setFlipping(false);
        if (scroll) {
          const el = target === "front" ? frontStepRef.current : backStepRef.current;
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
        }
      }, FLIP_MS);
    },
    [currentFace],
  );

  const setBackEnabled = (on: boolean) => {
    setBackEnabledState(on);
    if (!on && currentFace === "back") flipTo("front", false);
    if (on && currentFace === "front") flipTo("back", false);
  };

  const flipCoin = () => {
    if (!backEnabled) {
      setBackEnabledState(true);
      flipTo("back", true);
      return;
    }
    flipTo(currentFace === "front" ? "back" : "front", true);
  };

  const clearDesign = () => {
    setFront(defaultFace("roma", "M"));
    setBack(defaultFace("osmanli", "F"));
    setSamePhoto(false);
    setConsentMissing({ front: false, back: false });
    setCurrentFace("front");
  };

  const patchFront = (patch: Partial<FaceState>) => {
    setFront((s) => ({ ...s, ...patch }));
    if (samePhoto && patch.photos) setBack((b) => ({ ...b, photos: patch.photos!.slice() }));
    if (patch.consent !== undefined) setConsentMissing((m) => ({ ...m, front: false }));
  };
  const patchBack = (patch: Partial<FaceState>) => {
    setBack((s) => ({ ...s, ...patch }));
    if (patch.consent !== undefined) setConsentMissing((m) => ({ ...m, back: false }));
  };
  const toggleSamePhoto = (on: boolean) => {
    setSamePhoto(on);
    setBack((b) => ({ ...b, photos: on ? front.photos.slice() : [null, null, null], consent: on ? true : b.consent }));
  };

  const requestPhotoGuide = useCallback(() => {
    if (!pgBody && !photoGuideImage) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      guideResolver.current = resolve;
      setGuideOpen(true);
    });
  }, [pgBody, photoGuideImage]);
  const closeGuide = (ok: boolean) => {
    setGuideOpen(false);
    guideResolver.current?.(ok);
    guideResolver.current = null;
  };

  /* Galeriden gelen seçim: ?seri=&cinsiyet=&materyal= (docs/collection-gallery.md §2.5).
     Ürün yükleme effect'inden SONRA çalışmalı ki URL'deki materyal varyant materyalini ezsin. */
  useEffect(() => {
    let q: Record<string, string> = {};
    try {
      q = Router.router_getQueryParams() ?? {};
    } catch {
      return;
    }
    const d = parseDesignQuery(q);
    if (!d.series && !d.gender && !d.material) return;
    setFront((f) => {
      const series = d.series ?? f.series;
      return { ...f, series, gender: d.gender ?? f.gender, text: f.text.slice(0, SERIES_RULES[series].limit) };
    });
    setCurrentFace("front");
    if (d.material) setMaterial(d.material);
    // Parametreleri temizle: sayfa yenilenince seçim ve kaydırma tekrarlanmasın
    try {
      const url = new URL(window.location.href);
      for (const k of DESIGN_PARAM_KEYS) url.searchParams.delete(k);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      /* URL güncellenemezse sessizce geç */
    }
    // Çapa linki gibi anlık atla; görseller yüklenmeden atlanırsa sonradan kayan düzen hedefi kaçırır.
    let t = 0;
    const jump = () => {
      t = window.setTimeout(() => rootRef.current?.scrollIntoView({ block: "start" }), 50);
    };
    if (document.readyState === "complete") jump();
    else window.addEventListener("load", jump, { once: true });
    return () => {
      window.removeEventListener("load", jump);
      window.clearTimeout(t);
    };
  }, []);

  /* Yüz bölümü görünürken sikkeyi otomatik çevir (viewport %45 çizgisi) */
  useEffect(() => {
    let raf = 0;
    let last: FaceKey | null = null;
    const check = () => {
      raf = 0;
      const f = frontStepRef.current?.getBoundingClientRect();
      const b = backStepRef.current?.getBoundingClientRect();
      if (!f || !b) return;
      const refY = window.innerHeight * 0.45;
      let target: FaceKey;
      if (f.top <= refY && f.bottom >= refY) target = "front";
      else if (b.top <= refY && b.bottom >= refY) target = "back";
      else target = Math.abs((f.top + f.bottom) / 2 - refY) < Math.abs((b.top + b.bottom) / 2 - refY) ? "front" : "back";
      if (target === "back" && !backEnabled) return;
      if (target !== last) {
        last = target;
        if (target !== currentFace) flipTo(target, false);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [backEnabled, currentFace, flipTo]);

  /* Mobil: sticky önizleme "Keseye At" butonunu örtmesin */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    let raf = 0;
    const clamp = () => {
      raf = 0;
      const prev = previewRef.current;
      const stop = addBtnRef.current;
      if (!prev) return;
      if (!mq.matches || !stop) {
        prev.style.transform = "";
        return;
      }
      const headerH = parseFloat(getComputedStyle(prev).getPropertyValue("--header-h")) || 84;
      const overlap = headerH + prev.offsetHeight + 104 + 16 - stop.getBoundingClientRect().top;
      prev.style.transform = overlap > 0 ? `translate3d(0, ${-Math.round(overlap)}px, 0)` : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(clamp);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    clamp();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* ------------------------------------------------------------ ikas opsiyon senkronu */
  const syncOptions = () => {
    if (!product || !options.length) return;
    const faces: Array<[string, FaceState, boolean]> = [
      [optFace1, front, true],
      [optFace2, back, backEnabled],
    ];
    for (const o of platingOpts) setCheckbox(o, isPlated && o === platingOpt);
    setCheckbox(backOpt, backEnabled);
    setText(findOption(options, optNote), note);
    for (const [prefix, f, active] of faces) {
      const rule = SERIES_RULES[f.series];
      setChoiceByKeywords(findOption(options, prefix, optSeries), active ? [f.series === "roma" ? "roma" : f.series === "osmanli" ? "osman" : "misir"] : []);
      setChoiceByKeywords(findOption(options, prefix, optGender), active ? (f.gender === "M" ? ["bay", "erkek", "male"] : ["bayan", "kadin", "female"]) : [], f.gender === "M" ? ["bayan"] : []);
      setChoiceByKeywords(findOption(options, prefix, optBust), active && rule.bustOpt ? (f.bust ? ["bustlu", "var", "evet"] : ["bustsuz", "yok", "hayir"]) : []);
      setChoiceByKeywords(findOption(options, prefix, optSarik), active && rule.sarikOpt ? (f.sarik ? ["sarikli", "tulbent", "var"] : ["acik", "sariksiz", "yok"]) : []);
      setText(findOption(options, prefix, optName), active && f.nameOn ? f.text : "");
      const roman = rule.dateOn && f.dateOn ? dateToRoman(f.date) : "";
      setText(findOption(options, prefix, optDate), active && rule.dateOn && f.dateOn ? f.date : "");
      setText(findOption(options, prefix, optRoman), active ? roman : "");
      setCheckbox(findOption(options, prefix, optConsent), active && f.consent);
    }
  };
  useEffect(() => {
    syncOptions();
  }, [options, front, back, backEnabled, isPlated, note, platingOpt]);

  /* ------------------------------------------------------------ özet */
  const genderLabel = (f: FaceState) => (f.gender === "M" ? props.genderMale ?? "♂ Bay" : props.genderFemale ?? "♀ Bayan");
  const seriesLabel = (s: Series) => (s === "roma" ? props.seriesRoma ?? "Roma" : s === "osmanli" ? props.seriesOsmanli ?? "Osmanlı" : props.seriesMisir ?? "Mısır");
  const faceSummary = (f: FaceState) => {
    const rule = SERIES_RULES[f.series];
    const roman = rule.dateOn && f.dateOn ? dateToRoman(f.date) : "";
    return `${seriesLabel(f.series)} · ${genderLabel(f)} · ${(f.nameOn && f.text) || "—"}${roman ? ` · ${roman}` : ""}`;
  };
  const materialLabel = `${materialNames[material]}${isPlated ? ` · ${platingTitle}` : ""}`;

  /* ------------------------------------------------------------ sepete ekleme */
  const consentOk = (): boolean => {
    const missingFront = !front.consent;
    const missingBack = backEnabled && !samePhoto && !back.consent;
    if (!missingFront && !missingBack) return true;
    setConsentMissing({ front: missingFront, back: missingBack });
    showToast(consentMissingToast);
    const el = missingFront ? frontStepRef.current : backStepRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 80, behavior: "smooth" });
    return false;
  };

  const addToCart = () => {
    if (!product || adding) return;
    if (!consentOk()) return;
    if (sealText) setSealOpen(true);
    else void addToCartConfirmed();
  };

  const addToCartConfirmed = async () => {
    if (!product) return;
    setSealOpen(false);
    setAdding(true);
    try {
      syncOptions();
      const faces: Array<[string, FaceState, boolean]> = [
        [optFace1, front, true],
        [optFace2, back, backEnabled],
      ];
      for (const [prefix, f, active] of faces) {
        const opt = findOption(options, prefix, optPhotos);
        const files = f.photos.filter((x): x is File => !!x);
        if (active && isFile(opt) && files.length) {
          const urls = await productOptionFileUpload(opt!, files);
          if (!opt!.values?.length && urls?.length) opt!.values = urls;
        }
      }
      const optionSet = product.productOptionSet;
      if (optionSet && !hasValidProductOptionSetValues(optionSet)) {
        showToast(optionErrorText);
        return;
      }
      const v = getSelectedProductVariant(product);
      const result = await addItemToCart(v, product, 1);
      if (!result.success) {
        showToast(cartErrorText);
        return;
      }
      if (redeemCode && cartStore.cart) {
        let r = await saveCouponCode(cartStore.cart, redeemCode);
        /* ikas kupon kodlarını küçük harfle saklayabiliyor; büyük harfle reddedilirse küçük harfle yeniden dene. */
        if (!r.success && cartStore.cart) r = await saveCouponCode(cartStore.cart, redeemCode.toLocaleLowerCase("en-US"));
        if (!r.success) showToast(redeemFailedToast);
        setRedeemCode(null);
        setRedeemInput("");
        setRedeemMsg(null);
      }
      if (optionSet) initProductOptionSetValues(optionSet);
      showToast(addedToast);
      window.dispatchEvent(new CustomEvent("ikas:open-cart-sidebar"));
    } catch (err) {
      console.error("[CoinConfigurator] addToCart", err);
      showToast(cartErrorText);
    } finally {
      setAdding(false);
    }
  };

  const addGift = async () => {
    if (!giftProduct || adding) return;
    setAdding(true);
    try {
      selectMaterialVariant(giftProduct, material);
      const v = getSelectedProductVariant(giftProduct);
      const result = await addItemToCart(v, giftProduct, 1);
      if (!result.success) {
        showToast(cartErrorText);
        return;
      }
      showToast(giftAddedToast);
      window.dispatchEvent(new CustomEvent("ikas:open-cart-sidebar"));
    } catch (err) {
      console.error("[CoinConfigurator] addGift", err);
      showToast(cartErrorText);
    } finally {
      setAdding(false);
    }
  };

  const submitRedeem = () => {
    const code = redeemInput.trim().toUpperCase();
    if (GIFT_CODE_RE.test(code)) {
      setRedeemCode(code);
      setRedeemMsg({ ok: true, text: redeemOkText });
    } else {
      setRedeemCode(null);
      setRedeemMsg({ ok: false, text: redeemErrText });
    }
  };

  /* ------------------------------------------------------------ render */
  const faceTexts = props;
  const glyphSrc = imgSrc(glyphGuideImage);
  const isGift = giftMode === "gift";

  return (
    <section
      ref={rootRef}
      id={anchorId || undefined}
      className={cx("cfg", theme.className, isGift && "is-gift")}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <div className="cfg__head">
        {eyebrow && <div className="mon-eyebrow cfg__eyebrow">{eyebrow}</div>}
        <h2 className="cfg__title">
          {title} {titleAccent && <em>{titleAccent}</em>}
        </h2>
        {description && <p className="cfg__desc">{description}</p>}
      </div>

      <div className="cfg__shell">
        {/* ---------------- Sol: sticky önizleme ---------------- */}
        <div className="cfg__preview" ref={previewRef}>
          <div className="cfg__face-label">
            <span className="cfg__dot" aria-hidden="true" />
            <span>{currentFace === "front" ? faceFrontLabel : faceBackLabel}</span>
          </div>
          <div className="cfg__stage">
            <CoinCanvas
              src={artwork(faceState)}
              series={faceState.series}
              finish={finish}
              look22k={look22k}
              text={faceState.nameOn ? faceState.text : ""}
              roman={faceRoman}
              flipping={flipping}
              ariaLabel={currentFace === "front" ? faceFrontLabel : faceBackLabel}
            />
          </div>
          <div className="cfg__preview-actions">
            <button type="button" className="cfg__flip" onClick={flipCoin}>
              <FlipIcon className="cfg__flip-icon" />
              <span>{flipLabel}</span>
            </button>
            <button type="button" className="cfg__clear" onClick={clearDesign}>
              {clearLabel}
            </button>
          </div>
          <div className="cfg__price-box">
            <div className="cfg__price-label">{redeemCode ? redeemAppliedLabel : priceLabel}</div>
            <div className="mon-price cfg__price">{totalText ?? "—"}</div>
            <div className="cfg__price-sub">{totalText ? priceSub : priceUnavailableText}</div>
          </div>
        </div>

        {/* ---------------- Sağ: adımlar ---------------- */}
        <div className="cfg__form">
          {/* Adım 1 */}
          <section className="cfg__step">
            <div className="mon-step-num">{step1Num}</div>
            <h3 className="cfg__step-title">{step1Title} <em>{step1TitleAccent}</em></h3>
            {step1Hint && <p className="cfg__hint">{step1Hint}</p>}
            <div className="cfg__materials">
              {materialCards.map((m) => (
                <button key={m.key} type="button" className={cx("mon-card cfg__mat", material === m.key && "is-active")} aria-pressed={material === m.key} onClick={() => setMaterial(m.key)}>
                  <span className={`cfg__swatch cfg__swatch--${m.key}`} aria-hidden="true" />
                  <span className="cfg__mat-name">{m.name}</span>
                  <span className="cfg__mat-price">{m.price ?? ""}</span>
                  <span className="cfg__mat-spec">{[m.spec, coinDiameter].filter(Boolean).join(" · ")}</span>
                </button>
              ))}
            </div>
            {!product && materialMissingText && <p className="cfg__notice">{materialMissingText}</p>}
            {platingAllowed(material) && (
              <label className={cx("cfg__plate", isPlated && "is-active")}>
                <input type="checkbox" checked={isPlated} onChange={(e) => setPlated((p) => ({ ...p, [material]: (e.target as HTMLInputElement).checked }))} />
                <span className="cfg__plate-box" aria-hidden="true" />
                <span className="cfg__plate-body">
                  <span className="cfg__plate-name">{platingTitle}</span>
                  <span className="cfg__plate-desc">{material === "14k" ? platingDesc14k : platingDescSilver}</span>
                </span>
                {platingLabel && <span className={cx("cfg__plate-price", platingLabel === platingFreeText && "is-free")}>{platingLabel}</span>}
              </label>
            )}
          </section>

          {/* Adım 2 — 1. Yüz */}
          <section className="cfg__step" ref={frontStepRef}>
            <div className="mon-step-num">{step2Num}</div>
            <h3 className="cfg__step-title">{step2Title} <em>{step2TitleAccent}</em></h3>
            {step2Hint && <p className="cfg__hint">{step2Hint}</p>}
            <FaceDesigner
              face="front"
              state={front}
              onChange={patchFront}
              thumbs={thumbs}
              glyphGuideSrc={glyphSrc}
              texts={faceTexts}
              onActivate={() => flipTo("front", false)}
              requestPhotoGuide={requestPhotoGuide}
              onToast={showToast}
              photoTooLargeToast={photoTooLargeToast}
              photoTypeToast={photoTypeToast}
              consentMissing={consentMissing.front}
            />
          </section>

          <div className="mon-divider cfg__divider">{faceDividerText}</div>

          {/* Adım 3 — 2. Yüz */}
          <section className="cfg__step" ref={backStepRef}>
            <div className="mon-step-num">{step3Num}</div>
            <h3 className="cfg__step-title">{step3Title} <em>{step3TitleAccent}</em></h3>
            {step3Hint && <p className="cfg__hint">{step3Hint}</p>}
            <label className={cx("cfg__back-toggle", backEnabled && "is-active")}>
              <input type="checkbox" checked={backEnabled} onChange={(e) => setBackEnabled((e.target as HTMLInputElement).checked)} />
              <span className="cfg__back-box" aria-hidden="true" />
              <span className="cfg__back-text">
                {backToggleText} {backPriceText && <b>(+{backPriceText})</b>}
              </span>
            </label>
            {backToggleDesc && <p className="cfg__back-desc">{backToggleDesc}</p>}
            <FaceDesigner
              face="back"
              state={back}
              onChange={patchBack}
              thumbs={thumbs}
              glyphGuideSrc={glyphSrc}
              texts={faceTexts}
              onActivate={() => backEnabled && flipTo("back", false)}
              requestPhotoGuide={requestPhotoGuide}
              onToast={showToast}
              photoTooLargeToast={photoTooLargeToast}
              photoTypeToast={photoTypeToast}
              samePhoto={{ on: samePhoto, onToggle: toggleSamePhoto }}
              consentMissing={consentMissing.back}
              disabled={!backEnabled}
            />
          </section>

          {/* Sipariş notu */}
          <div className="cfg__note">
            <label className="cfg__note-label" htmlFor="mon-order-note">
              {noteLabel} {noteOptional && <span>{noteOptional}</span>}
            </label>
            <textarea id="mon-order-note" className="mon-field cfg__note-input" rows={3} maxLength={400} placeholder={notePlaceholder} value={note} onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} />
            <span className="cfg__note-count">{note.length} / 400</span>
          </div>

          {/* Adım 4 — Özet */}
          <section className="cfg__step">
            <div className="mon-step-num">{step4Num}</div>
            <h3 className="cfg__step-title">{step4Title} <em>{step4TitleAccent}</em></h3>
            {step4Hint && <p className="cfg__hint">{step4Hint}</p>}

            <div className="cfg__summary">
              <div className="cfg__row">
                <span className="cfg__k">{sumMaterial}</span>
                <span className="cfg__v">
                  {materialLabel}
                  {(materialSpecs[material] || coinDiameter) && <span className="cfg__v-note"> · {[materialSpecs[material], coinDiameter].filter(Boolean).join(" · ")} {specNote}</span>}
                </span>
              </div>
              {!isGift && (
                <div className="cfg__row">
                  <span className="cfg__k">{sumFront}</span>
                  <span className="cfg__v">{faceSummary(front)}</span>
                </div>
              )}
              {!isGift && backEnabled && (
                <div className="cfg__row">
                  <span className="cfg__k">{sumBack}</span>
                  <span className="cfg__v">{faceSummary(back)}</span>
                </div>
              )}
              <div className="cfg__row cfg__row--total">
                <span className="cfg__k">{sumTotal}</span>
                <span className="cfg__v cfg__total">{totalText ?? "—"}</span>
              </div>
            </div>

            {showGiftMode && (
              <div className="cfg__gift">
                <button type="button" className={cx("cfg__gift-self", giftMode === "self" && "is-active")} role="tab" aria-selected={giftMode === "self"} onClick={() => setGiftMode("self")}>
                  <span aria-hidden="true">✦</span> {giftSelfText}
                </button>
                <div className="cfg__gift-tabs" role="tablist">
                  <button type="button" className={cx("cfg__gift-tab", giftMode === "gift" && "is-active")} role="tab" aria-selected={giftMode === "gift"} onClick={() => setGiftMode("gift")}>
                    <span aria-hidden="true">❦</span> {giftGiftText}
                  </button>
                  <button type="button" className={cx("cfg__gift-tab", giftMode === "redeem" && "is-active")} role="tab" aria-selected={giftMode === "redeem"} onClick={() => setGiftMode("redeem")}>
                    <span aria-hidden="true">✦</span> {giftRedeemText}
                  </button>
                </div>

                {giftMode === "redeem" && (
                  <div className="cfg__redeem mon-anim-reveal">
                    {redeemIntro && <p className="cfg__redeem-intro">{redeemIntro}</p>}
                    <div className="cfg__redeem-row">
                      <input type="text" className="mon-field cfg__redeem-input" placeholder={redeemPlaceholder} maxLength={40} value={redeemInput} onInput={(e) => setRedeemInput((e.target as HTMLInputElement).value)} />
                      <button type="button" className="mon-btn mon-btn--gold" onClick={submitRedeem}>{redeemButton}</button>
                    </div>
                    {redeemMsg && <p className={cx("cfg__redeem-msg", redeemMsg.ok ? "is-ok" : "is-err")}>{redeemMsg.text}</p>}
                  </div>
                )}

                {isGift && (
                  <div className="cfg__gift-panel mon-anim-fade-up">
                    {giftIntro && <p className="cfg__gift-intro">{giftIntro}</p>}
                    {giftChooseLabel && <div className="mon-label cfg__gift-label">{giftChooseLabel}</div>}
                    <div className="cfg__gift-cards">
                      {materialCards.map((m) => (
                        <button key={m.key} type="button" className={cx("mon-card cfg__gift-card", material === m.key && "is-active")} aria-pressed={material === m.key} onClick={() => setMaterial(m.key)}>
                          <span className={`cfg__swatch cfg__swatch--${m.key} cfg__swatch--sm`} aria-hidden="true" />
                          <span className="cfg__gift-name">{m.name}</span>
                          <span className="cfg__gift-price">{m.price ?? ""}</span>
                        </button>
                      ))}
                    </div>
                    {!giftProduct && giftMissingText && <p className="cfg__notice">{giftMissingText}</p>}
                  </div>
                )}
              </div>
            )}

            {isGift ? (
              <button ref={addBtnRef} type="button" className="mon-btn mon-btn--brushed cfg__add" disabled={!giftProduct || adding} onClick={() => void addGift()}>
                {adding ? addingText : giftAddText}
              </button>
            ) : (
              <button ref={addBtnRef} type="button" className="mon-btn mon-btn--brushed cfg__add" disabled={!product || adding} onClick={addToCart}>
                {adding ? addingText : addToCartText}
              </button>
            )}
            {!product && productMissingText && <p className="cfg__notice cfg__notice--center">{productMissingText}</p>}

            <div className="cfg__trust">
              {[trust1, trust2, trust3, trust4].filter(Boolean).map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <SealModal open={sealOpen} title={sealTitle} html={sealText} cancelText={sealCancel} confirmText={sealConfirm} onCancel={() => setSealOpen(false)} onConfirm={() => void addToCartConfirmed()} />
      <PhotoGuideModal
        open={guideOpen}
        title={pgTitle}
        intro={pgIntro}
        imageSrc={imgSrc(photoGuideImage)}
        imageAlt={pgCaption || pgTitle}
        caption={pgCaption}
        bodyHtml={pgBody}
        cancelText={pgCancel}
        confirmText={pgConfirm}
        closeLabel={closeLabel}
        onCancel={() => closeGuide(false)}
        onConfirm={() => closeGuide(true)}
      />
      {toast && (
        <div className="cfg__toast mon-anim-fade-up" role="status">
          {toast}
        </div>
      )}
    </section>
  );
}

export default CoinConfigurator;
