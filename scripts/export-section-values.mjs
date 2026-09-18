#!/usr/bin/env node
/**
 * Editördeki bütün sayfaların section prop değerlerini tek bir JSON'a aktarır.
 *
 * Devir yedeği içindir: kod ve prop şeması repo'da taşınır, ama prop DEĞERLERİ
 * (655 TEXT/RICH_TEXT, görsel id'leri, ürün id'leri, PAGE link hedefleri) yalnız
 * bağlı editörde durur. Kullanımı ve yeni mağazaya geri basma yöntemi:
 * docs/store-handover.md §3.F.
 *
 * Ön koşul: `npx ikas-component dev` çalışıyor ve `ikas theme dev` ile editör bağlı.
 *
 *   node scripts/export-section-values.mjs [--out backup/...json] [--port 5201]
 *
 * MCP'ye ihtiyaç duymaz; MCP sunucusunun kendisi de bu CLI'yi çağırıyor.
 */
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = resolve(projectRoot, "node_modules/.bin/ikas-component");

const argv = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const port = argOf("--port", null);
const stamp = new Date().toISOString().slice(0, 10);
const outPath = resolve(projectRoot, argOf("--out", `backup/section-values-${stamp}.json`));

/** CLI'yi çağırır ve stdout'taki JSON'u döndürür. Editör yanıtları büyük olabilir. */
function cli(args) {
  const full = port ? [...args, "--port", port] : args;
  return new Promise((res, rej) => {
    execFile(bin, full, { cwd: projectRoot, maxBuffer: 256 * 1024 * 1024 }, (err, stdout, stderr) => {
      const text = (stdout || "").trim();
      if (!text) return rej(new Error(`${args[0]}: çıktı yok. ${stderr || err?.message || ""}`));
      try {
        res(JSON.parse(text));
      } catch {
        // CLI bazen JSON'dan önce satır basıyor; son JSON gövdesini ayıkla.
        const i = text.indexOf("{");
        if (i < 0) return rej(new Error(`${args[0]}: JSON ayrıştırılamadı.\n${text.slice(0, 400)}`));
        try {
          res(JSON.parse(text.slice(i)));
        } catch (e) {
          rej(new Error(`${args[0]}: JSON ayrıştırılamadı (${e.message}).`));
        }
      }
    });
  });
}

/**
 * Değerlerin içinde geçen id'leri toplar — devirde yeniden eşlenmesi gerekenler.
 * Prop TİPİNE değil değerin ŞEKLİNE bakar: COMPONENT_LIST child'larının (SeriesCard,
 * FaqItem) prop tipleri parent'ın şemasında yok, ama değer kalıpları aynı.
 */
function collectIds(node, acc) {
  if (!node || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const v of node) collectIds(v, acc);
    return acc;
  }
  // IMAGE / IMAGE_LIST öğesi: { id: "theme-images/<uuid>", altText? }
  if (typeof node.id === "string" && node.id.startsWith("theme-images/")) acc.images.add(node.id);
  // PRODUCT: { productId, variantId? }
  if (typeof node.productId === "string") {
    acc.products.add(node.productId);
    if (node.variantId) acc.variants.add(node.variantId);
  }
  // LINK: PAGE hedefi sayfa id'si, EXTERNAL göreli href
  if (node.linkType === "PAGE" && typeof node.pageId === "string") acc.pages.add(node.pageId);
  if (node.linkType === "EXTERNAL" && typeof node.externalLink === "string" && node.externalLink.startsWith("/")) {
    acc.hrefs.add(node.externalLink);
  }
  for (const v of Object.values(node)) collectIds(v, acc);
  return acc;
}

const main = async () => {
  process.stdout.write("Sayfalar okunuyor… ");
  const { pages } = await cli(["list-pages"]);
  console.log(`${pages.length} sayfa`);

  const out = {
    exportedAt: new Date().toISOString(),
    note: "Editördeki prop değerlerinin yedeği. Geri basma: docs/store-handover.md §3.F",
    pages: [],
  };
  const commonSeen = new Set();
  let placements = 0;
  let withValues = 0;

  for (const page of pages) {
    const label = page.name || page.pageType;
    let roster;
    try {
      roster = await cli(["list-page-sections", "--page-id", page.id]);
    } catch (e) {
      console.log(`  ! ${label}: ${e.message}`);
      out.pages.push({ ...page, error: e.message });
      continue;
    }
    const sections = roster.sections || [];
    placements += sections.length;
    if (!sections.length) {
      out.pages.push({ ...page, sections: [] });
      console.log(`  ${label}: section yok`);
      continue;
    }

    const ids = sections.map((s) => s.elementId).join(",");
    const byElement = new Map(sections.map((s) => [s.elementId, s]));
    let values = [];
    try {
      const r = await cli(["get-section-values", "--page-id", page.id, "--element-ids", ids]);
      // Değer kaydında componentId/name yok; roster'dan taşı ki yedek kendi kendini anlatsın.
      // `props` (prop ŞEMASI) kaydedilmez: ikas.config.json'dan üretilebiliyor, her
      // yerleşimde tekrarlanıp dosyayı şişiriyor ve içindeki `writeExample`
      // yer tutucuları ("<product-id>") id envanterini kirletiyor.
      values = (r.sections || []).map(({ props, ...v }) => {
        const meta = byElement.get(v.elementId);
        return { componentId: meta?.componentId, name: meta?.name, ...v };
      });
    } catch (e) {
      console.log(`  ! ${label}: değerler alınamadı — ${e.message}`);
    }

    // Header/Footer common: değerleri INDEX'te saklanıyor, bir kez yedekle.
    const kept = [];
    for (const v of values) {
      const canon = v.common?.canonicalElementId;
      if (canon) {
        if (commonSeen.has(canon)) {
          kept.push({ elementId: v.elementId, componentId: v.componentId, commonRef: canon });
          continue;
        }
        commonSeen.add(canon);
      }
      kept.push(v);
      withValues++;
    }

    out.pages.push({ ...page, sections: kept });
    console.log(`  ${label}: ${sections.length} yerleşim`);
  }

  const acc = { images: new Set(), products: new Set(), variants: new Set(), pages: new Set(), hrefs: new Set() };
  for (const page of out.pages) for (const s of page.sections || []) collectIds(s.propValues, acc);
  out.idInventory = {
    note: "Yeni mağazada yeniden eşlenmesi gereken id'ler (docs/store-handover.md §3.B, §3.E, §3.F).",
    imageIds: [...acc.images].sort(),
    productIds: [...acc.products].sort(),
    variantIds: [...acc.variants].sort(),
    linkedPageIds: [...acc.pages].sort(),
    relativeHrefs: [...acc.hrefs].sort(),
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");

  const kb = Math.round((await import("node:fs")).statSync(outPath).size / 1024);
  console.log(`\n${placements} yerleşim, ${withValues} değer kaydı → ${outPath} (${kb} KB)`);
  console.log(`Görsel: ${acc.images.size} · ürün: ${acc.products.size} · varyant: ${acc.variants.size} · PAGE linki: ${acc.pages.size} · göreli link: ${acc.hrefs.size}`);
};

main().catch((e) => {
  console.error(`\nHata: ${e.message}`);
  console.error("Dev server çalışıyor ve editör bağlı mı? `npx ikas-component dev` + `ikas theme dev`");
  process.exit(1);
});
