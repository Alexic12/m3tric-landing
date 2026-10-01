// Measures WCAG contrast of text over photographic/gradient backgrounds (evidence D5).
// Usage: npm run evidence:contrast   (needs `out/` built and `npm run serve:out` listening on :4173)
// 1. Collects every text line box + computed colour/size/weight for each target.
// 2. Screenshots the section twice: as rendered, and with all text transparent (pure background).
// 3. tests/helpers/contrast.py samples the background pixels under each line box and writes the table.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const OUT = resolve(process.env.CONTRAST_DIR ?? join(import.meta.dirname, "..", "..", "test-results", "contrast"));
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "1280", width: 1280, height: 800 },
  { name: "390", width: 390, height: 844 },
];

// section selector -> text elements to measure (label, selector inside the section)
const TARGETS = {
  hero: {
    section: "#inicio",
    text: [
      ["h1 línea 1 (Bold, blanco)", "h1 > span:nth-child(1)"],
      ["h1 línea 2 (Light, verde pastel)", "h1 > span:nth-child(2)"],
      ["Meta (kicker)", "p.text-meta"],
      ["Lead", "p.text-lead"],
      ["Botón secundario", "a[href='#contacto']"],
      ["Leyenda de capas", "ul[aria-label] li span"],
    ],
    // Header floats over the hero; hide its text too so the background is pure.
    extraHide: "header",
    extraText: [["Enlaces del header (solo ≥1280)", "header nav a"]],
  },
  contact: {
    section: "#contacto",
    text: [
      ["Kicker", "p.text-meta"],
      ["H2 (palabras)", "#contacto-title > span"],
      ["Texto", "p.text-lead"],
      ["Enlaces de contacto", "ul a"],
    ],
  },
  usecases: {
    section: "#casos",
    // Featured card = the one with the photo.
    scope: "li:has(img)",
    text: [
      ["Título (h3)", "h3"],
      ["Alcance (meta)", "p.text-meta"],
      ["Texto", "p.text-lead"],
    ],
  },
};

const collect = (target) =>
  target.page.evaluate(
    ({ section, scope, text, extraText }) => {
      const root = document.querySelector(section);
      const scopeEl = scope ? root.querySelector(scope) : root;
      const rootRect = scopeEl.getBoundingClientRect();
      const out = [];
      // Computed colours can come back as oklab()/color-mix(); a 1x1 canvas resolves any CSS colour to sRGB RGBA.
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const toRgba = (css) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
      };
      for (const [label, selector] of [...text, ...(extraText ?? [])]) {
        const inHeader = selector.startsWith("header");
        const nodes = Array.from((inHeader ? document : scopeEl).querySelectorAll(selector));
        nodes.forEach((el, idx) => {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || el.getClientRects().length === 0) return;
          const range = document.createRange();
          range.selectNodeContents(el);
          const rects = Array.from(range.getClientRects())
            .filter((r) => r.width > 1 && r.height > 1)
            .map((r) => ({ x: r.left - rootRect.left, y: r.top - rootRect.top, w: r.width, h: r.height }));
          if (rects.length === 0) return;
          out.push({
            label: nodes.length > 1 ? `${label} #${idx + 1}` : label,
            color: toRgba(cs.color),
            fontSize: parseFloat(cs.fontSize),
            fontWeight: Number(cs.fontWeight),
            text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 48),
            rects,
          });
        });
      }
      return { box: { w: rootRect.width, h: rootRect.height }, items: out };
    },
    { section: target.section, scope: target.scope, text: target.text, extraText: target.extraText },
  );

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce", locale: "es-CO" });
  const page = await context.newPage();
  await page.goto(BASE + "/");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  for (const [key, def] of Object.entries(TARGETS)) {
    const scopeSel = def.scope ? `${def.section} ${def.scope}` : def.section;
    const el = page.locator(scopeSel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    // Keep the floating header out of non-hero shots: measure sections at their own scroll position, header hidden.
    // The fixed skip link is parked off-screen with a transform; it shows up inside tall element captures.
    const fixedChrome = key === "hero" ? "a[href='#contenido']" : "header, a[href='#contenido']";
    const chromeStyle = await page.addStyleTag({ content: `${fixedChrome}{visibility:hidden !important}` });
    const data = await collect({ page, ...def });
    await el.screenshot({ path: join(OUT, `${key}-${vp.name}-text.png`), animations: "disabled" });
    const hide = await page.addStyleTag({
      content: `${scopeSel} *, ${def.extraHide ? `${def.extraHide} *` : "x-none"} { color: transparent !important; text-shadow: none !important; }`,
    });
    await page.waitForTimeout(150);
    await el.screenshot({ path: join(OUT, `${key}-${vp.name}-bg.png`), animations: "disabled" });
    await hide.evaluate((n) => n.remove());
    await chromeStyle.evaluate((n) => n.remove());
    writeFileSync(join(OUT, `${key}-${vp.name}.json`), JSON.stringify({ viewport: vp, key, ...data }, null, 2));
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await context.close();
}
await browser.close();
console.log(`contrast inputs written to ${OUT}`);
