import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Router, getDefaultSrc, createMediaSrcset, IkasImage } from "@ikas/bp-storefront";
import { Props } from "./types";
import { useSectionTheme, cx } from "../../utils/theme-mode";
import { linkAttrs, linkHref, withQuery } from "../../utils/links";
import { SERIES, Series, Gender, MaterialKey, designQuery, parseSeries } from "../../utils/coin";
import Lightbox, { LightboxItem } from "../../sub-components/Lightbox";

type RowKey = "Silver" | "Gold14" | "Gold22";
type ColKey = "Male" | "Female" | "Model" | "Packaging";

const ROWS: Array<{ key: RowKey; material: MaterialKey }> = [
  { key: "Silver", material: "silver" },
  { key: "Gold14", material: "14k" },
  { key: "Gold22", material: "22k" },
];
const COLS: Array<{ key: ColKey; gender?: Gender }> = [
  { key: "Male", gender: "M" },
  { key: "Female", gender: "F" },
  { key: "Model" },
  { key: "Packaging" },
];

interface Cell {
  id: string;
  image: IkasImage | null;
  name: string;
  sub: string;
  colText: string;
  rowText: string;
  is22k: boolean;
  lbIndex: number;
}

interface SeriesContent {
  key: Series;
  tab: string;
  eyebrow: string;
  title: string;
  titleItalic: string;
  body: string[];
  tags: string[];
}

export function CollectionGallery(props: Props) {
  const {
    backLink,
    title = "Kadim Seriler",
    inviteText = "",
    discoverText = "Seriyi Keşfet",
    designLink,
    colMale = "Bay",
    colFemale = "Bayan",
    colModel = "Model",
    colPackaging = "Paketleme",
    rowSilver = "925 Gümüş",
    row14k = "14 Ayar",
    row22k = "22 Ayar",
    genderMale = "Erkek",
    genderFemale = "Kadın",
    showEmptyCells = true,
    lbCta = "Bu Modeli Tasarla",
    lbHint = "",
    lbPrev = "Önceki",
    lbNext = "Sonraki",
    lbClose = "Kapat",
    lbZoom = "Yakınlaştır",
    lbOpen = "Büyüt",
    anchorId = "galeri",
    backgroundColor = "#FBFAF7",
  } = props;
  const p = props as unknown as Record<string, unknown>;
  const text = (key: string) => (typeof p[key] === "string" ? (p[key] as string) : "");

  const theme = useSectionTheme();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* Sekme adı boş bırakılan seri gizlenir. */
  const series: SeriesContent[] = SERIES.map((key) => ({
    key,
    tab: text(`${key}Tab`),
    eyebrow: text(`${key}Eyebrow`),
    title: text(`${key}Title`),
    titleItalic: text(`${key}TitleItalic`),
    body: [text(`${key}Body1`), text(`${key}Body2`)].filter(Boolean),
    tags: [text(`${key}Tag1`), text(`${key}Tag2`), text(`${key}Tag3`)].filter(Boolean),
  })).filter((s) => s.tab);

  const [activeKey, setActiveKey] = useState<Series>(series[0]?.key ?? "roma");
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const active = series.find((s) => s.key === activeKey) ?? series[0];

  /* Açılışta ?seri= parametresi (SSR ile uyum için mount sonrası) */
  useEffect(() => {
    let q: Record<string, string> = {};
    try {
      q = Router.router_getQueryParams() ?? {};
    } catch {
      /* router hazır değil — varsayılan seri */
    }
    const fromUrl = parseSeries(q.seri);
    if (fromUrl && series.some((s) => s.key === fromUrl)) setActiveKey(fromUrl);
  }, []);

  const selectSeries = (key: Series, focus = false) => {
    setActiveKey(key);
    setLbIndex(null);
    if (focus) tabRefs.current[key]?.focus();
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seri", key);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      /* editör önizlemesi vb. — URL güncellenemezse sessizce geç */
    }
  };

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const last = series.length - 1;
    const next = e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    selectSeries(series[next].key, true);
  };

  const colLabel: Record<ColKey, string> = { Male: colMale, Female: colFemale, Model: colModel, Packaging: colPackaging };
  const rowLabel: Record<RowKey, string> = { Silver: rowSilver, Gold14: row14k, Gold22: row22k };
  const designHref = linkHref(designLink) || "";

  const cells: Cell[] = [];
  const lbItems: LightboxItem[] = [];
  if (active) {
    for (const row of ROWS) {
      for (const col of COLS) {
        const image = (p[`${active.key}${row.key}${col.key}`] as IkasImage | null | undefined) ?? null;
        const gender = col.gender ? (col.gender === "M" ? genderMale : genderFemale) : "";
        const name = `${active.tab} · ${colLabel[col.key]}`;
        const sub = [rowLabel[row.key], gender].filter(Boolean).join(" · ");
        const cell: Cell = {
          id: `${active.key}-${row.key}-${col.key}`,
          image,
          name,
          sub,
          colText: colLabel[col.key],
          rowText: rowLabel[row.key],
          is22k: row.key === "Gold22",
          lbIndex: -1,
        };
        if (image) {
          cell.lbIndex = lbItems.length;
          lbItems.push({
            image,
            alt: `${active.tab} · ${colLabel[col.key]} · ${rowLabel[row.key]}`,
            title: name,
            subtitle: sub,
            ctaHref: designHref ? withQuery(designHref, designQuery({ series: active.key, gender: col.gender, material: row.material })) : undefined,
          });
        }
        if (image || showEmptyCells) cells.push(cell);
      }
    }
  }
  const closeLightbox = useCallback(() => setLbIndex(null), []);

  const discoverHref = active && designHref ? withQuery(designHref, designQuery({ series: active.key })) : "";

  return (
    <section
      id={anchorId || undefined}
      className={cx("cg", theme.className)}
      style={{ ...theme.style, ...(!theme.isNight && backgroundColor ? { backgroundColor } : {}) }}
    >
      <header className="cg__head">
        {backLink?.href ? (
          <a className="cg__back" {...linkAttrs(backLink)}>
            <span aria-hidden="true">←</span> <span>{backLink.label}</span>
          </a>
        ) : (
          <span />
        )}
        {title && <h1 className="cg__title">{title}</h1>}
        <span />
      </header>

      <div className="cg__inner">
        {series.length > 1 && (
          <div className="cg__tabs" role="tablist" aria-label={title || undefined}>
            {series.map((s, i) => {
              const selected = s.key === active?.key;
              return (
                <button
                  key={s.key}
                  ref={(el) => {
                    tabRefs.current[s.key] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`cg-tab-${s.key}`}
                  aria-selected={selected}
                  aria-controls="cg-panel"
                  tabIndex={selected ? 0 : -1}
                  className={cx("cg__tab", selected && "is-active")}
                  onClick={() => selectSeries(s.key)}
                  onKeyDown={(e) => onTabKey(e as unknown as KeyboardEvent, i)}
                >
                  {s.tab}
                </button>
              );
            })}
          </div>
        )}

        {active && (
          <div id="cg-panel" role="tabpanel" aria-labelledby={series.length > 1 ? `cg-tab-${active.key}` : undefined}>
            <article key={active.key} className="cg-story mon-anim-fade-up">
              {active.eyebrow && <div className="cg-story__eyebrow">{active.eyebrow}</div>}
              {(active.title || active.titleItalic) && (
                <h2 className="cg-story__title">
                  {active.title && <span className="cg-story__title-line">{active.title}</span>}
                  {active.titleItalic && <span className="cg-story__title-line cg-story__title-line--it">{active.titleItalic}</span>}
                </h2>
              )}
              {inviteText && (
                <div className="cg-story__invite">
                  <span className="cg-story__invite-line" aria-hidden="true" />
                  <span>{inviteText}</span>
                  <span className="cg-story__invite-line" aria-hidden="true" />
                </div>
              )}
              {active.body.length > 0 && (
                <div className="cg-story__scroll">
                  {active.body.map((b, i) => (
                    <p key={i} className="cg-story__body">
                      {b}
                    </p>
                  ))}
                </div>
              )}
              {active.tags.length > 0 && (
                <ul className="cg-story__tags">
                  {active.tags.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
              {discoverText && discoverHref && (
                <a className="cg-story__cta" href={discoverHref}>
                  {discoverText} <span aria-hidden="true">→</span>
                </a>
              )}
            </article>

            <div className="cg-grid">
              {cells.map((c) =>
                c.image ? (
                  <button
                    key={c.id}
                    type="button"
                    className={cx("cg-item", c.is22k && "is-22k")}
                    aria-label={`${lbOpen}: ${c.name} · ${c.sub}`}
                    onClick={() => setLbIndex(c.lbIndex)}
                  >
                    <img
                      className="cg-item__img"
                      src={getDefaultSrc(c.image)}
                      srcSet={createMediaSrcset(c.image)}
                      sizes="(max-width: 860px) 46vw, 320px"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    <span className="cg-item__overlay" aria-hidden="true">
                      <span className="cg-item__name">{c.colText}</span>
                      <span className="cg-item__sub">{c.rowText}</span>
                    </span>
                  </button>
                ) : (
                  <div key={c.id} className="cg-item cg-item--empty" aria-hidden="true">
                    <span className="cg-item__ast">✦</span>
                    <span className="cg-item__tag">
                      {c.colText} · {c.rowText}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <Lightbox
        items={lbItems}
        index={lbIndex}
        onIndexChange={setLbIndex}
        onClose={closeLightbox}
        ctaLabel={lbCta}
        hint={lbHint}
        prevLabel={lbPrev}
        nextLabel={lbNext}
        closeLabel={lbClose}
        zoomLabel={lbZoom}
      />
    </section>
  );
}

export default CollectionGallery;
