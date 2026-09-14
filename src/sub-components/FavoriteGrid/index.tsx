import { useEffect, useState } from "preact/hooks";
import { observer } from "@ikas/component-utils";
import {
  customerStore,
  getFavoriteProducts,
  removeIkasProductFromFavorites,
  getSelectedProductVariant,
  getSelectedProductVariantHref,
  getProductVariantMainImage,
  getProductVariantFormattedFinalPrice,
  getProductVariantFormattedSellPrice,
  hasProductVariantDiscount,
  getDefaultSrc,
  createMediaSrcset,
  IkasNavigationLink,
  IkasProduct,
} from "@ikas/bp-storefront";
import type { AccountTexts } from "../../utils/account-texts";
import { linkAttrs } from "../../utils/links";
import { HeartIcon } from "../Icons";

interface Props {
  t: AccountTexts;
  emptyLink?: IkasNavigationLink | null;
}

function FavoriteCard({ product, t, onRemove }: { product: IkasProduct; t: AccountTexts; onRemove: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const variant = getSelectedProductVariant(product);
  const href = getSelectedProductVariantHref(product);
  const media = variant ? getProductVariantMainImage(variant) : undefined;
  const image = media && !media.isVideo ? media.image : null;
  const discounted = variant ? hasProductVariantDiscount(variant) : false;

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    await onRemove();
    setBusy(false);
  };

  return (
    <li className={`fav__card${busy ? " is-busy" : ""}`}>
      <a className="fav__media" href={href} tabIndex={-1} aria-hidden="true">
        {image ? (
          <img src={getDefaultSrc(image)} srcSet={createMediaSrcset(image)} sizes="(max-width: 640px) 50vw, 280px" alt="" loading="lazy" />
        ) : (
          <span className="fav__media-empty" />
        )}
      </a>
      <button
        type="button"
        className="fav__remove"
        aria-label={`${t.removeFavoriteLabel}: ${product.name}`}
        onClick={remove}
        disabled={busy}
      >
        <HeartIcon className="fav__heart" />
      </button>
      <div className="fav__body">
        <a className="fav__name" href={href}>
          {product.name}
        </a>
        {variant && (
          <p className="fav__price">
            {discounted && <s className="fav__price-old">{getProductVariantFormattedSellPrice(variant)}</s>}
            <span>{getProductVariantFormattedFinalPrice(variant)}</span>
          </p>
        )}
        {t.designText && (
          <a className="acc-link fav__design" href={href}>
            {t.designText}
            <span aria-hidden="true"> →</span>
          </a>
        )}
      </div>
    </li>
  );
}

/** Favorilerim: favori ürün kartları; "Tasarla" konfigüratöre (ürün sayfasına) götürür. */
const FavoriteGrid = observer(function FavoriteGrid({ t, emptyLink }: Props) {
  const [products, setProducts] = useState<IkasProduct[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    getFavoriteProducts(customerStore)
      .then((list) => alive && setProducts(list ?? []))
      .catch((err) => {
        console.error("[FavoriteGrid]", err);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const remove = async (product: IkasProduct) => {
    const ok = await removeIkasProductFromFavorites(product).catch(() => false);
    if (ok) setProducts((list) => (list ?? []).filter((p) => p.id !== product.id));
  };

  if (failed) {
    return (
      <div className="acc-banner acc-banner--row" role="alert">
        <span>{t.favoritesErrorText}</span>
        <button type="button" className="acc-link" onClick={() => setAttempt((a) => a + 1)}>
          {t.retryText}
        </button>
      </div>
    );
  }

  if (!products) {
    return (
      <div className="fav__grid" aria-busy="true">
        <span className="mon-sr-only">{t.loadingText}</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="acc-skel acc-skel--tile" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="acc-card acc-empty">
        <p className="acc-empty__text">{t.favoritesEmptyText}</p>
        {emptyLink?.href && emptyLink.label && (
          <a className="mon-btn mon-btn--gold" {...linkAttrs(emptyLink)}>
            {emptyLink.label}
          </a>
        )}
      </div>
    );
  }

  return (
    <ul className="fav__grid">
      {products.map((p) => (
        <FavoriteCard key={p.id} product={p} t={t} onRemove={() => remove(p)} />
      ))}
    </ul>
  );
});

export default FavoriteGrid;
