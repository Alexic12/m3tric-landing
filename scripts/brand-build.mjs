// Builds the M3TRIC brand kit (brand/) from its two sources of truth. Documentation: brand/README.md.
//   sources    brand/tokens.json, brand/logo/paths.json     hand-edited; every hex and every logo path lives only here
//   derived    tokens.css, logo/m3tric-logo-{color,reverse,mono-dark,mono-light}.svg, motifs/triple-bar.svg, manifest.json
//   mirrored   logo/m3tric-mark.svg <- src/app/icon.svg, images/*.webp <- public/images/*.webp (byte copies)
//   authored   README.md (carried through so the manifest covers it)
// The kit is an explicit inventory: a file under brand/ that is not listed here fails the build before anything is
// written. That is how a stray font file is detected; keeping fonts out of this public repository is up to
// .gitignore and scripts/hygiene.sh (Nunito is fetched at build time by next/font, so no font file is ever committed).
// Output is deterministic (sorted keys, LF, trailing newline) and the manifest date only moves when content does, so
// re-running is a no-op; scripts/brand-kit.test.mjs proves it.
//   node scripts/brand-build.mjs               build in place (brand/)
//   node scripts/brand-build.mjs --out <dir>   build a complete copy of the kit in <dir>, which must not exist or be empty
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(import.meta.dirname, "..");

// One-ink versions. Black is not a brand colour (the palette has none), so mono-dark carries it as a literal.
const MONO_DARK_INK = "#000000";
const MONO_BARS_OPACITY = 0.5;
const GEOMETRY_DECIMALS = 2;

// Wordmark variants. Colours are token names resolved against tokens.color; a "#"-prefixed value is a literal. This table
// is the single source of the variant list, of the files written for it and of the colour tokens checkTokens requires.
const LOGO_VARIANTS = {
  color: { body: "green-900", bars: "green-400", barsOpacity: 1 },
  reverse: { body: "green-200", bars: "green-400", barsOpacity: 1 },
  "mono-dark": { body: MONO_DARK_INK, bars: MONO_DARK_INK, barsOpacity: MONO_BARS_OPACITY },
  "mono-light": { body: "white", bars: "white", barsOpacity: MONO_BARS_OPACITY },
};
const isLiteral = (ref) => ref.startsWith("#");
/** Colour tokens the logo variants dereference: tokens.color must define every one, or a fill would render as "undefined". */
const LOGO_COLOR_TOKENS = [...new Set(Object.values(LOGO_VARIANTS).flatMap(({ body, bars }) => [body, bars]))].filter((ref) => !isLiteral(ref));

/** Kit path -> repo path. Byte copies, so the kit cannot disagree with what the landing ships. */
const MIRRORS = {
  "logo/m3tric-mark.svg": "src/app/icon.svg",
  "images/aerial-wide-1280.webp": "public/images/aerial-wide-1280.webp",
  "images/aerial-tall-747.webp": "public/images/aerial-tall-747.webp",
  "images/globe-1000.webp": "public/images/globe-1000.webp",
};

/** Hand-written files inside brand/: the two sources and the documentation. */
const AUTHORED = ["README.md", "logo/paths.json", "tokens.json"];

/** macOS litter. Gitignored, so never part of the kit. */
const IGNORED = new Set([".DS_Store"]);
const FONT_FILE = /\.(woff2?|ttf|otf|eot|ttc|otc|dfont|pfb|pfm)$/i;

const HEX = /^#[0-9A-Fa-f]{6}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VIEW_BOX = /^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/;
// The path-data alphabet and nothing else: no character that could close the attribute or inject markup.
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]+$/;
// A value that lands inside a CSS declaration must not be able to end it, open a block or close a comment.
const UNSAFE_CSS = /[;{}\r\n]|\/\*|\*\//;

const text = (value) => Buffer.from(value, "utf8");
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const byPath = ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0);
const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
/** Geometry as short decimal text without float noise (23.52 * 3 + 14.26 * 2 -> "99.08"). */
const num = (n) => String(Number(n.toFixed(GEOMETRY_DECIMALS)));
/** Calendar date in UTC (toISOString is always UTC). */
const utcDate = (now = new Date()) => now.toISOString().slice(0, 10);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isPositive = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;

/** Throws one error listing every problem found in tokens.json, so a bad edit is fixed in a single pass. */
export function checkTokens(tokens) {
  const problems = [];
  const hex = (label, value) => {
    if (typeof value !== "string" || !HEX.test(value)) problems.push(`${label}: expected #RRGGBB, got ${JSON.stringify(value)}`);
  };
  const css = (label, value) => {
    if (typeof value !== "string" || value.trim() === "" || UNSAFE_CSS.test(value))
      problems.push(`${label}: not a safe CSS value, got ${JSON.stringify(value)}`);
  };
  const group = (label) => {
    const value = tokens?.[label];
    if (!isObject(value) || Object.keys(value).length === 0) {
      problems.push(`${label}: expected a non-empty object`);
      return {};
    }
    return value;
  };

  if (typeof tokens?.version !== "string" || !SEMVER.test(tokens.version))
    problems.push(`version: expected MAJOR.MINOR.PATCH, got ${JSON.stringify(tokens?.version)}`);
  css("source", tokens?.source);

  const color = group("color");
  for (const [name, value] of Object.entries(color)) hex(`color.${name}`, value);
  for (const name of LOGO_COLOR_TOKENS) {
    if (!Object.hasOwn(color, name)) problems.push(`color.${name}: missing, but the logo variants use it`);
  }
  for (const [name, target] of Object.entries(group("level"))) {
    if (!Object.hasOwn(color, target)) problems.push(`level.${name}: ${JSON.stringify(target)} is not a colour in tokens.color`);
  }

  css("font.family", tokens?.font?.family);
  for (const label of ["radius", "shadow"]) {
    for (const [name, value] of Object.entries(group(label))) css(`${label}.${name}`, value);
  }
  const focus = group("focus");
  for (const [name, value] of Object.entries(focus)) css(`focus.${name}`, value);
  hex("focus.onLight", focus.onLight);
  hex("focus.onDark", focus.onDark);

  const bar = tokens?.tripleBar;
  if (!Array.isArray(bar?.widths) || bar.widths.length === 0 || !bar.widths.every(isPositive))
    problems.push("tripleBar.widths: expected a non-empty array of positive numbers");
  if (!isPositive(bar?.height)) problems.push("tripleBar.height: expected a positive number");
  if (!isPositive(bar?.gap)) problems.push("tripleBar.gap: expected a positive number");

  if (!Array.isArray(tokens?.chartSeries) || tokens.chartSeries.length === 0) problems.push("chartSeries: expected a non-empty array");
  else tokens.chartSeries.forEach((value, i) => hex(`chartSeries[${i}]`, value));

  if (problems.length > 0) throw new Error(`brand/tokens.json is invalid:\n  - ${problems.join("\n  - ")}`);
}

/** Throws when logo/paths.json is not plain, well-formed path data. */
function checkPaths(paths) {
  const problems = [];
  if (typeof paths?.viewBox !== "string" || !VIEW_BOX.test(paths.viewBox))
    problems.push(`viewBox: expected "minX minY width height", got ${JSON.stringify(paths?.viewBox)}`);
  for (const label of ["body", "bars"]) {
    const list = paths?.[label];
    if (!Array.isArray(list) || list.length === 0) {
      problems.push(`${label}: expected a non-empty array of path strings`);
      continue;
    }
    list.forEach((d, i) => {
      if (typeof d !== "string" || !PATH_DATA.test(d)) problems.push(`${label}[${i}]: not plain SVG path data`);
    });
  }
  if (problems.length > 0) throw new Error(`brand/logo/paths.json is invalid:\n  - ${problems.join("\n  - ")}`);
}

/** :root custom properties for every scalar token. The names are the contract with the platform: do not rename lightly. */
export function renderTokensCss(tokens) {
  const lines = [];
  const section = (title) => lines.push(...(lines.length > 0 ? [""] : []), `  /* ${title} */`);
  const add = (name, value) => lines.push(`  --m3-${name}: ${value};`);

  section("Palette");
  for (const [name, value] of Object.entries(tokens.color)) add(name, value);
  section("Alert levels: the only place the warm colours are allowed");
  for (const [name, target] of Object.entries(tokens.level)) add(`level-${name}`, `var(--m3-${target})`);
  section("Typography");
  add("font-sans", tokens.font.family);
  section("Shape and elevation");
  for (const [name, value] of Object.entries(tokens.radius)) add(`radius-${name}`, value);
  for (const [name, value] of Object.entries(tokens.shadow)) add(`shadow-${name}`, value);
  section("Focus ring");
  for (const [name, value] of Object.entries(tokens.focus)) add(`focus-${kebab(name)}`, value);
  section("Chart series");
  tokens.chartSeries.forEach((value, i) => add(`chart-${i + 1}`, value));

  return [
    "/*",
    ` * M3TRIC brand kit ${tokens.version} - ${tokens.source}.`,
    " * Generated by scripts/brand-build.mjs from brand/tokens.json. Do not edit by hand.",
    " */",
    ":root {",
    ...lines,
    "}",
    "",
  ].join("\n");
}

/** One standalone wordmark SVG. The path data is paths.json verbatim: the shapes are never redrawn. */
function renderLogoSvg(paths, variant, color) {
  const { body, bars, barsOpacity } = LOGO_VARIANTS[variant];
  const ink = (ref) => (isLiteral(ref) ? ref : color[ref]);
  const group = (fill, opacity, list) => [
    `  <g fill="${fill}"${opacity === 1 ? "" : ` fill-opacity="${opacity}"`}>`,
    ...list.map((d) => `    <path d="${d}"/>`),
    "  </g>",
  ];
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${paths.viewBox}" role="img" aria-label="M3TRIC">`,
    "  <title>M3TRIC</title>",
    ...group(ink(body), 1, paths.body),
    ...group(ink(bars), barsOpacity, paths.bars),
    "</svg>",
    "",
  ].join("\n");
}

/** The three bars of the "3" as a decorative motif: same geometry as src/components/brand/TripleBar.tsx. */
function renderTripleBarSvg({ widths, height, gap }) {
  const step = height + gap;
  const totalHeight = height * widths.length + gap * (widths.length - 1);
  const rects = widths.map(
    (width, i) => `  <rect x="0" y="${num(i * step)}" width="${num(width)}" height="${num(height)}" rx="${num(height / 2)}"/>`,
  );
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(Math.max(...widths))} ${num(totalHeight)}" aria-hidden="true" focusable="false" fill="currentColor">`,
    ...rects,
    "</svg>",
    "",
  ].join("\n");
}

/**
 * { version, generatedAt, files: { path: sha256 } }. Hash contract (documented in brand/README.md): sha256 as lowercase hex
 * over the raw bytes of each file; keys are posix paths relative to brand/, sorted; manifest.json is not listed in itself.
 * `generatedAt` is a UTC calendar date, kept from `previous` while version and hashes are unchanged: it records when the
 * content last changed, not when someone last ran the build, which is what makes a re-run a no-op.
 */
function buildManifest({ version, files, previous, today }) {
  const hashes = Object.fromEntries([...files].map(([path, data]) => [path, sha256(data)]).sort(byPath));
  const unchanged =
    isObject(previous) &&
    previous.version === version &&
    ISO_DATE.test(previous.generatedAt) &&
    JSON.stringify(previous.files) === JSON.stringify(hashes);
  return { version, generatedAt: unchanged ? previous.generatedAt : today, files: hashes };
}

function readRequired(path, label) {
  try {
    return readFileSync(path);
  } catch (error) {
    throw new Error(`cannot read ${label}: ${error.code ?? error.message}`);
  }
}

function parseJson(label, data) {
  try {
    return JSON.parse(data.toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

/** The previous manifest only decides the date stamp, so a missing or unreadable one just means "stamp today". */
function readPreviousManifest(brandDir) {
  try {
    return JSON.parse(readFileSync(join(brandDir, "manifest.json"), "utf8"));
  } catch {
    return undefined;
  }
}

/**
 * The complete kit as Map<path relative to brand/, Buffer>, computed from the sources only (reads, never writes).
 * `today` stamps manifest.generatedAt, but only when the content differs from the manifest already in <root>/brand.
 */
export function buildKit({ root = ROOT, today = utcDate() } = {}) {
  const brandDir = join(root, "brand");
  const under = (base, rel) => join(base, ...rel.split("/"));
  const files = new Map();

  for (const rel of AUTHORED) files.set(rel, readRequired(under(brandDir, rel), `brand/${rel}`));
  const tokens = parseJson("brand/tokens.json", files.get("tokens.json"));
  const paths = parseJson("brand/logo/paths.json", files.get("logo/paths.json"));
  checkTokens(tokens);
  checkPaths(paths);

  files.set("tokens.css", text(renderTokensCss(tokens)));
  for (const variant of Object.keys(LOGO_VARIANTS)) {
    files.set(`logo/m3tric-logo-${variant}.svg`, text(renderLogoSvg(paths, variant, tokens.color)));
  }
  files.set("motifs/triple-bar.svg", text(renderTripleBarSvg(tokens.tripleBar)));
  for (const [rel, source] of Object.entries(MIRRORS)) files.set(rel, readRequired(under(root, source), source));

  const manifest = buildManifest({ version: tokens.version, files, previous: readPreviousManifest(brandDir), today });
  files.set("manifest.json", text(`${JSON.stringify(manifest, null, 2)}\n`));
  return files;
}

/** Every file under `dir` as a posix path relative to it, sorted. A directory that does not exist holds none. */
function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      if (IGNORED.has(name)) continue;
      const full = join(current, name);
      if (statSync(full).isDirectory()) walk(full);
      else found.push(relative(dir, full).split(sep).join("/"));
    }
  };
  walk(dir);
  return found.sort();
}

/** Files under `dir` that the kit does not own. Never deleted automatically: somebody put them there. */
export function unexpectedFiles(dir, files) {
  return listFiles(dir).filter((rel) => !files.has(rel));
}

/** Throws, before anything is written, when `dir` holds files the kit does not own. */
function assertNoUnexpectedFiles(dir, files) {
  const unexpected = unexpectedFiles(dir, files);
  if (unexpected.length === 0) return;
  const fonts = unexpected.filter((rel) => FONT_FILE.test(rel));
  throw new Error(
    (fonts.length > 0 ? `font files must never enter this public repository (Nunito is fetched at build time): ${fonts.join(", ")}. ` : "") +
      `${dir} holds files that are not part of the kit: ${unexpected.join(", ")}. ` +
      "The kit is an explicit inventory: remove them, or register them in AUTHORED or MIRRORS (scripts/brand-build.mjs). Nothing was written.",
  );
}

/**
 * Writes the kit under `outDir`, touching only files whose bytes differ, and returns the paths it wrote.
 * Refuses (writing nothing) when the directory holds files that are not part of the kit.
 */
export function writeKit(files, outDir) {
  assertNoUnexpectedFiles(outDir, files);
  const written = [];
  for (const [rel, data] of files) {
    const target = join(outDir, ...rel.split("/"));
    if (existsSync(target) && readFileSync(target).equals(data)) continue;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
    written.push(rel);
  }
  return written;
}

/** --out never merges into a directory somebody already uses: it must not exist, or be empty. */
function assertFreshOutDir(dir) {
  if (!existsSync(dir)) return;
  if (!statSync(dir).isDirectory() || readdirSync(dir).some((name) => !IGNORED.has(name)))
    throw new Error(`--out ${dir} already exists and is not an empty directory`);
}

function parseArgs(argv) {
  if (argv.length === 0) return {};
  if (argv.length === 2 && argv[0] === "--out" && argv[1]) return { out: resolve(argv[1]) };
  throw new Error("usage: node scripts/brand-build.mjs [--out <dir>]");
}

/**
 * Whether this file is the program being run. argv[1] keeps symlinks (macOS temp dirs live behind one, so do symlinked
 * checkouts) that import.meta.url resolves, so a plain === would skip the whole build and still exit 0: compare real paths.
 */
function isEntryPoint() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false; // no usable argv[1] (REPL, -e): this module was imported, not run
  }
}

if (isEntryPoint()) {
  try {
    const { out } = parseArgs(process.argv.slice(2));
    if (out) assertFreshOutDir(out);
    const files = buildKit();
    const written = writeKit(files, out ?? join(ROOT, "brand"));
    for (const rel of written) console.log(`brand-build: wrote ${rel}`);
    console.log(`brand-build: ${files.size} files, ${written.length === 0 ? "up to date" : `${written.length} written`} (${out ?? "brand/"})`);
  } catch (error) {
    console.error(`brand-build: ${error.message}`);
    process.exit(1);
  }
}
