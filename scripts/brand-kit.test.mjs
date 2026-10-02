// Drift guards for the brand kit (brand/): the landing, the kit and its manifest must always agree.
// Everything is fail-closed and exact. The oracles are independent of the builder: the palette, the chart series, the logo
// path digest, the file inventory and the mirror pairs are typed here as literals; the manifest is checked with its own file
// walk and hashing; the SVGs are parsed instead of compared with the builder's template; and a parser that finds nothing
// fails instead of passing vacuously. Fix drift with `npm run brand:build` (see brand/README.md).
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { after, describe, test } from "node:test";
import { buildKit, checkTokens, renderTokensCss, unexpectedFiles, writeKit } from "./brand-build.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const BRAND = join(ROOT, "brand");

const HEX = /^#[0-9A-Fa-f]{6}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FONT_FILE = /\.(woff2?|ttf|otf|eot|ttc|otc|dfont|pfb|pfm)$/i;
const GEOMETRY_TOLERANCE = 0.005; // the kit rounds geometry to 2 decimals

// docs/SPEC-UNIFICACION.md section 3: the complete kit. A hard-coded list on purpose, so changing the kit's file set is
// a conscious edit here and not a side effect of editing the builder.
const KIT_FILES = [
  "README.md",
  "fonts/README.md",
  "images/aerial-tall-747.webp",
  "images/aerial-wide-1280.webp",
  "images/globe-1000.webp",
  "logo/m3tric-logo-color.svg",
  "logo/m3tric-logo-mono-dark.svg",
  "logo/m3tric-logo-mono-light.svg",
  "logo/m3tric-logo-reverse.svg",
  "logo/m3tric-mark.svg",
  "logo/paths.json",
  "manifest.json",
  "motifs/triple-bar.svg",
  "tokens.css",
  "tokens.json",
];

// Kit file -> the landing file it must equal byte for byte. Typed here, not imported from the builder.
const MIRROR_PAIRS = {
  "logo/m3tric-mark.svg": "src/app/icon.svg",
  "images/aerial-wide-1280.webp": "public/images/aerial-wide-1280.webp",
  "images/aerial-tall-747.webp": "public/images/aerial-tall-747.webp",
  "images/globe-1000.webp": "public/images/globe-1000.webp",
};

// Manual de identidad (abril 2026) as interpreted in docs/SPEC.md 3.2, plus white (src/config/brand.ts BRAND_WHITE).
// Typed here on purpose: neither tokens.json nor the builder may certify themselves.
const MANUAL_PALETTE = {
  "green-950": "#002A17",
  "green-900": "#004124",
  "green-700": "#2C694F",
  "green-400": "#74C69D",
  "green-200": "#B7E3C7",
  beige: "#F6F2EA",
  yellow: "#FFD166",
  orange: "#F77F00",
  red: "#D62828",
  ink: "#0B0F0D",
  muted: "#4B5563",
  white: "#FFFFFF",
};

// docs/SPEC-UNIFICACION.md 4.2: the greens plus neutrals. The warm colours are reserved for alert levels.
const CHART_SERIES = ["#004124", "#2C694F", "#4B5563", "#74C69D", "#0B0F0D", "#B7E3C7"];

// sha256 of JSON.stringify([viewBox, body, bars]) of logo/paths.json. It equals the original inline strings of Logo.tsx at
// 7f32145 (blob f5fb27b8). A literal, so redrawing the official wordmark is a deliberate edit here, never a side effect.
const LOGO_PATHS_SHA256 = "00a53b1e83ae9927e4172f0b3b890c9fe21baf3f2f90d22a1a97e90fc75133b8";

// Wordmark colours per spec (docs/SPEC.md 3.4, lamina 11). Independent of the builder's table.
const VARIANTS = {
  color: { body: "#004124", bars: "#74C69D", barsOpacity: 1 },
  reverse: { body: "#B7E3C7", bars: "#74C69D", barsOpacity: 1 },
  "mono-dark": { body: "#000000", bars: "#000000", barsOpacity: 0.5 },
  "mono-light": { body: "#FFFFFF", bars: "#FFFFFF", barsOpacity: 0.5 },
};

const read = (...parts) => readFileSync(join(...parts), "utf8");
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const near = (a, b) => Math.abs(a - b) <= GEOMETRY_TOLERANCE;
const tokens = JSON.parse(read(BRAND, "tokens.json"));
const paths = JSON.parse(read(BRAND, "logo", "paths.json"));

/** Own file walk (not the builder's) so the checks below do not trust the code that wrote the files. */
function walk(dir) {
  const found = [];
  const visit = (current) => {
    for (const name of readdirSync(current)) {
      if (name === ".DS_Store") continue; // macOS litter, gitignored
      const full = join(current, name);
      if (statSync(full).isDirectory()) visit(full);
      else found.push(relative(dir, full).split(sep).join("/"));
    }
  };
  visit(dir);
  return found.sort();
}

/** { path: sha256 } for every file under `dir`: a before/after picture for "nothing may have been written". */
const snapshot = (dir) => Object.fromEntries(walk(dir).map((rel) => [rel, sha256(readFileSync(join(dir, rel)))]));

/** The first capture group of `pattern` in `source`, or a failure that says what could not be parsed. */
function grab(source, pattern, what) {
  const match = pattern.exec(source);
  assert.ok(match, `cannot parse ${what}: the format changed, so update this test's parser (a parser that finds nothing would pass vacuously)`);
  return match[1];
}

describe("palette: tokens.json vs src/app/globals.css", () => {
  const theme = grab(read(ROOT, "src", "app", "globals.css"), /@theme\s*\{([^}]*)\}/, "the @theme block of src/app/globals.css");
  const declared = new Map(); // token name -> raw value
  for (const [, name, value] of theme.matchAll(/--color-m3-([a-z0-9-]+)\s*:\s*([^;]+);/g)) declared.set(name, value.trim());

  test("every --color-m3-* is a #RRGGBB equal to its token (case-insensitive)", () => {
    assert.ok(declared.size > 0, "no --color-m3-* declarations parsed");
    for (const [name, value] of declared) {
      assert.match(value, HEX, `--color-m3-${name} is not a #RRGGBB value: ${value}`);
      assert.ok(Object.hasOwn(tokens.color, name), `--color-m3-${name} has no counterpart in brand/tokens.json`);
      assert.equal(value.toUpperCase(), tokens.color[name].toUpperCase(), `--color-m3-${name} differs from brand/tokens.json`);
    }
  });

  test("the landing @theme and the kit define the same brand colours (white is Tailwind's own --color-white)", () => {
    const expected = Object.keys(tokens.color).filter((name) => name !== "white");
    assert.deepEqual([...declared.keys()].sort(), expected.sort());
  });

  test("the font stack equals tokens.font.family (Barlow is the next/font variable in the landing)", () => {
    const stack = grab(theme, /--font-sans\s*:\s*([^;]+);/, "--font-sans in @theme").trim();
    assert.equal(stack.replace("var(--font-barlow)", "Barlow"), tokens.font.family);
  });
});

describe("palette: tokens.json vs the manual", () => {
  test("tokens.color is the manual's palette, exactly (case-insensitive)", () => {
    const upper = Object.fromEntries(Object.entries(tokens.color).map(([name, value]) => [name, value.toUpperCase()]));
    assert.deepEqual(upper, MANUAL_PALETTE);
  });

  test("chartSeries is the spec's series, in order (case-insensitive)", () => {
    assert.deepEqual(tokens.chartSeries.map((hex) => hex.toUpperCase()), CHART_SERIES);
  });
});

describe("src/config/brand.ts", () => {
  test("every BRAND_* constant is the matching token", () => {
    const source = read(ROOT, "src", "config", "brand.ts");
    const constants = [...source.matchAll(/export const BRAND_([A-Z0-9_]+) = "(#[0-9A-Fa-f]{6})";/g)];
    assert.ok(constants.length > 0, "no BRAND_* constants parsed");
    for (const [, key, value] of constants) {
      const name = key.toLowerCase().replace(/_/g, "-");
      assert.ok(Object.hasOwn(tokens.color, name), `BRAND_${key} has no token "${name}" in brand/tokens.json`);
      assert.equal(value.toUpperCase(), tokens.color[name].toUpperCase(), `BRAND_${key} differs from brand/tokens.json`);
    }
  });
});

describe("logo: brand/logo/*.svg vs paths.json and Logo.tsx", () => {
  /** The <g> groups of a wordmark SVG, each with its fill, opacity and path data. */
  function parseLogo(svg) {
    const groups = [...svg.matchAll(/<g fill="([^"]+)"(?: fill-opacity="([^"]+)")?>([\s\S]*?)<\/g>/g)].map(([, fill, opacity, inner]) => ({
      fill,
      opacity: opacity === undefined ? 1 : Number(opacity),
      d: [...inner.matchAll(/<path d="([^"]*)"\/>/g)].map((m) => m[1]),
    }));
    return { groups, pathCount: (svg.match(/<path\b/g) ?? []).length };
  }

  test("logo/paths.json is the official wordmark: its digest equals the pinned one", () => {
    assert.equal(sha256(JSON.stringify([paths.viewBox, paths.body, paths.bars])), LOGO_PATHS_SHA256);
  });

  for (const [variant, expected] of Object.entries(VARIANTS)) {
    const svg = read(BRAND, "logo", `m3tric-logo-${variant}.svg`);

    test(`${variant}: xmlns, viewBox, role, accessible name and title`, () => {
      const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${paths.viewBox}" role="img" aria-label="M3TRIC">\n  <title>M3TRIC</title>\n`;
      assert.ok(svg.startsWith(head), "unexpected opening of the SVG");
      assert.ok(svg.endsWith("</svg>\n"), "the SVG must close with </svg> and a newline");
    });

    test(`${variant}: path d strings equal paths.json and the fills are the spec's`, () => {
      const { groups, pathCount } = parseLogo(svg);
      assert.equal(groups.length, 2, "expected one body group and one bars group");
      assert.equal(pathCount, paths.body.length + paths.bars.length, "unexpected extra or missing <path>");
      assert.deepEqual(groups[0].d, paths.body, "body paths differ from paths.json");
      assert.deepEqual(groups[1].d, paths.bars, "bar paths differ from paths.json");
      assert.deepEqual(
        [groups[0].fill, groups[0].opacity, groups[1].fill, groups[1].opacity],
        [expected.body, 1, expected.bars, expected.barsOpacity],
      );
    });
  }

  const logo = read(ROOT, "src", "components", "brand", "Logo.tsx");

  test("Logo.tsx imports paths.json and carries no path data of its own", () => {
    assert.match(logo, /import\s+\w+\s+from\s+"(\.\.\/)+brand\/logo\/paths\.json";/, "Logo.tsx must import brand/logo/paths.json");
    // "M<number> <number>" is how every path of the wordmark starts; the default label "M3TRIC" must not trip it.
    assert.doesNotMatch(logo, /["'`]M\s*-?\d+(?:\.\d+)?[\s,]+-?\d/, "inline path data found in Logo.tsx: the shapes must come only from paths.json");
  });

  test("Logo.tsx COLORS equal the kit's variants", () => {
    const colors = [...logo.matchAll(/"?([a-z-]+)"?:\s*\{\s*body:\s*"(#[0-9A-Fa-f]{6})",\s*bars:\s*"(#[0-9A-Fa-f]{6})",\s*barsOpacity:\s*([0-9.]+)\s*\}/g)];
    const parsed = Object.fromEntries(
      colors.map(([, variant, body, bars, opacity]) => [variant, { body: body.toUpperCase(), bars: bars.toUpperCase(), barsOpacity: Number(opacity) }]),
    );
    assert.ok(colors.length > 0, "cannot parse COLORS from Logo.tsx: the format changed, so update this test's parser");
    assert.deepEqual(parsed, VARIANTS);
  });
});

describe("triple bar: tokens.tripleBar vs TripleBar.tsx and motifs/triple-bar.svg", () => {
  test("TripleBar.tsx geometry equals tokens.tripleBar", () => {
    const source = read(ROOT, "src", "components", "brand", "TripleBar.tsx");
    assert.equal(Number(grab(source, /const BAR_H = ([0-9.]+);/, "BAR_H")), tokens.tripleBar.height);
    assert.equal(Number(grab(source, /const GAP = ([0-9.]+);/, "GAP")), tokens.tripleBar.gap);
    const widths = grab(source, /const WIDTHS = \[([0-9.,\s]+)\] as const;/, "WIDTHS").split(",").map((w) => Number(w.trim()));
    assert.deepEqual(widths, tokens.tripleBar.widths);
  });

  test("the motif draws exactly that geometry in currentColor", () => {
    const svg = read(BRAND, "motifs", "triple-bar.svg");
    const { widths, height, gap } = tokens.tripleBar;
    const rects = [...svg.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" rx="([^"]+)"\/>/g)].map((m) => m.slice(1).map(Number));
    assert.equal(rects.length, widths.length);
    rects.forEach(([x, y, width, h, rx], i) => {
      assert.ok(x === 0 && near(y, i * (height + gap)) && near(width, widths[i]) && near(h, height) && near(rx, height / 2), `bar ${i + 1}: ${[x, y, width, h, rx]}`);
    });
    const viewBox = grab(svg, /viewBox="([^"]+)"/, "the motif viewBox").split(" ").map(Number);
    assert.ok(viewBox[0] === 0 && viewBox[1] === 0 && near(viewBox[2], Math.max(...widths)) && near(viewBox[3], height * widths.length + gap * (widths.length - 1)), `viewBox ${viewBox}`);
    assert.match(svg, /fill="currentColor"/);
    assert.doesNotMatch(svg, /#[0-9A-Fa-f]{3,6}\b/, "the motif must take its colour from the context");
  });
});

describe("tokens.css", () => {
  test("is exactly what the builder renders from tokens.json", () => {
    assert.equal(read(BRAND, "tokens.css"), renderTokensCss(tokens));
  });

  test("declares every token under the documented names and values", () => {
    const declared = Object.fromEntries([...read(BRAND, "tokens.css").matchAll(/^\s*(--m3-[a-z0-9-]+):\s*(.+);$/gm)].map(([, name, value]) => [name, value]));
    const expected = {
      ...Object.fromEntries(Object.entries(tokens.color).map(([name, value]) => [`--m3-${name}`, value])),
      ...Object.fromEntries(Object.entries(tokens.level).map(([name, color]) => [`--m3-level-${name}`, `var(--m3-${color})`])),
      "--m3-font-sans": tokens.font.family,
      "--m3-radius-card": tokens.radius.card,
      "--m3-radius-field": tokens.radius.field,
      "--m3-radius-pill": tokens.radius.pill,
      "--m3-shadow-soft": tokens.shadow.soft,
      "--m3-focus-on-light": tokens.focus.onLight,
      "--m3-focus-on-dark": tokens.focus.onDark,
      "--m3-focus-width": tokens.focus.width,
      "--m3-focus-offset": tokens.focus.offset,
      ...Object.fromEntries(tokens.chartSeries.map((value, i) => [`--m3-chart-${i + 1}`, value])),
    };
    assert.deepEqual(declared, expected);
  });

  test("keeps the names that the spec and the platform rely on", () => {
    const css = read(BRAND, "tokens.css");
    for (const line of [
      "--m3-green-900: #004124;",
      "--m3-red: #D62828;",
      "--m3-ink: #0B0F0D;",
      "--m3-muted: #4B5563;",
      "--m3-beige: #F6F2EA;",
      '--m3-font-sans: "DIN 2014 Rounded", Barlow, system-ui, sans-serif;',
      "--m3-radius-card: 1.5rem;",
    ]) {
      assert.ok(css.includes(`  ${line}\n`), `tokens.css lost ${line}`);
    }
  });
});

describe("tokens.json is internally consistent", () => {
  test("passes the builder's own validation", () => {
    assert.doesNotThrow(() => checkTokens(tokens));
  });

  test("the focus ring colours are the dark and the light green of the palette", () => {
    assert.equal(tokens.focus.onLight, tokens.color["green-900"]);
    assert.equal(tokens.focus.onDark, tokens.color["green-400"]);
  });

  test("chart series use palette colours and never a warm alert colour", () => {
    const palette = new Set(Object.values(tokens.color));
    const warm = new Set(["yellow", "orange", "red"].map((name) => tokens.color[name]));
    assert.ok(tokens.chartSeries.length > 0);
    for (const hex of tokens.chartSeries) {
      assert.ok(palette.has(hex), `${hex} is not in the palette`);
      assert.ok(!warm.has(hex), `${hex} is reserved for alert levels`);
    }
  });

  test("levels map to the warm colours and carry Spanish names", () => {
    assert.deepEqual(tokens.level, { attention: "yellow", alert: "orange", critical: "red" });
    assert.deepEqual(tokens.levelLabel, { attention: "Atención", alert: "Alerta", critical: "Crítico" });
  });

  test("the font stack names DIN 2014 Rounded first and Barlow as its fallback", () => {
    assert.equal(tokens.font.fallback, "Barlow");
    assert.ok(tokens.font.family.startsWith('"DIN 2014 Rounded", Barlow, '), tokens.font.family);
  });
});

describe("manifest.json", () => {
  const manifest = JSON.parse(read(BRAND, "manifest.json"));
  const onDisk = walk(BRAND).filter((path) => path !== "manifest.json");

  test("has version, generatedAt and files, in that order", () => {
    assert.deepEqual(Object.keys(manifest), ["version", "generatedAt", "files"]);
    assert.equal(manifest.version, tokens.version);
    assert.match(manifest.generatedAt, CALENDAR_DATE);
    assert.ok(!Number.isNaN(Date.parse(manifest.generatedAt)), `${manifest.generatedAt} is not a real date`);
  });

  test("lists every file of brand/ (sorted) and nothing else, never itself", () => {
    assert.deepEqual(Object.keys(manifest.files), onDisk);
  });

  test("every sha256 equals the file on disk", () => {
    for (const path of onDisk) {
      assert.match(manifest.files[path], SHA256, `${path}: malformed hash`);
      assert.equal(manifest.files[path], sha256(readFileSync(join(BRAND, path))), `${path} drifted from manifest.json: run npm run brand:build`);
    }
  });
});

describe("kit inventory", () => {
  test("brand/ holds exactly the files of the spec, no more, no less", () => {
    assert.deepEqual(walk(BRAND), KIT_FILES);
  });

  for (const [rel, source] of Object.entries(MIRROR_PAIRS)) {
    test(`brand/${rel} is a byte copy of ${source}`, () => {
      const copy = readFileSync(join(BRAND, rel));
      assert.ok(copy.equals(readFileSync(join(ROOT, source))), `brand/${rel} differs from ${source}: run npm run brand:build`);
    });
  }

  for (const rel of walk(BRAND).filter((path) => /\.(json|css|svg|md)$/.test(path))) {
    test(`brand/${rel} is LF-only and ends with exactly one newline`, () => {
      const text = read(BRAND, rel);
      assert.ok(!text.includes("\r"), "carriage return found");
      assert.ok(text.endsWith("\n") && !text.endsWith("\n\n"), "must end with exactly one newline");
    });
  }
});

describe("line endings and binaries are pinned by .gitattributes (manifest.json hashes raw bytes)", () => {
  /** `git check-attr <name>` over `files` as { path: value }, asked of git itself, in this checkout. */
  function attr(name, files) {
    const out = execFileSync("git", ["check-attr", name, "--", ...files], { cwd: ROOT, encoding: "utf8" });
    return Object.fromEntries(
      out.trimEnd().split("\n").map((line) => {
        const [path, , value] = line.split(": ");
        return [path, value];
      }),
    );
  }
  const kit = walk(BRAND).map((rel) => `brand/${rel}`);
  const textFiles = [...kit.filter((path) => /\.(json|css|svg|md)$/.test(path)), "src/app/icon.svg"];
  const images = kit.filter((path) => path.endsWith(".webp"));

  test("brand/images/globe-1000.webp is binary: git check-attr text is unset", () => {
    assert.equal(attr("text", ["brand/images/globe-1000.webp"])["brand/images/globe-1000.webp"], "unset");
  });

  test("brand/tokens.json is checked out with LF: git check-attr eol is lf", () => {
    assert.equal(attr("eol", ["brand/tokens.json"])["brand/tokens.json"], "lf");
  });

  test("every text file of the kit, and the favicon it mirrors, is eol=lf", () => {
    assert.ok(textFiles.length > 1, "no text files found");
    const eol = attr("eol", textFiles);
    for (const path of textFiles) assert.equal(eol[path], "lf", `${path}: eol is ${eol[path]}, expected lf`);
  });

  test("every image of the kit is binary: text is unset", () => {
    assert.ok(images.length > 0, "no images found");
    const text = attr("text", images);
    for (const path of images) assert.equal(text[path], "unset", `${path}: text is ${text[path]}, expected unset`);
  });
});

describe("licensed fonts stay out of the repository", () => {
  test("no font file anywhere under brand/", () => {
    assert.deepEqual(walk(BRAND).filter((path) => FONT_FILE.test(path)), []);
  });

  test("brand/fonts holds only its README", () => {
    assert.deepEqual(walk(join(BRAND, "fonts")), ["README.md"]);
  });

  for (const ext of ["woff", "woff2", "ttf", "otf", "eot"]) {
    test(`.gitignore ignores *.${ext}`, () => {
      const result = spawnSync("git", ["check-ignore", "-q", "--", `brand/fonts/DIN2014Rounded-Variable.${ext}`], { cwd: ROOT });
      assert.equal(result.status, 0, `git check-ignore exited ${result.status}: .gitignore must list *.${ext} (licensed fonts never enter this public repo, ADR-010)`);
    });
  }
});

describe("npm scripts", () => {
  const scripts = JSON.parse(read(ROOT, "package.json")).scripts;

  test("brand:build runs the builder", () => {
    assert.equal(scripts["brand:build"], "node scripts/brand-build.mjs");
  });

  test("test:unit globs every scripts/**/*.test.mjs, so these guards run in npm run release", () => {
    assert.match(scripts["test:unit"], /"scripts\/\*\*\/\*\.test\.mjs"/);
  });
});

describe("brand-build", () => {
  const scratch = mkdtempSync(join(tmpdir(), "brand-kit-"));
  after(() => rmSync(scratch, { recursive: true, force: true }));

  /** Runs the builder that lives in `root` (the real repo by default) as a child process, like `npm run brand:build`. */
  const build = (args = [], root = ROOT) =>
    spawnSync(process.execPath, [join(root, "scripts", "brand-build.mjs"), ...args], { cwd: root, encoding: "utf8" });

  /** A throwaway repo root with the real builder, the real kit and the real mirror sources: safe to run, break and rebuild. */
  let repos = 0;
  function makeRepo() {
    const root = join(scratch, `repo-${repos++}`);
    cpSync(BRAND, join(root, "brand"), { recursive: true });
    mkdirSync(join(root, "scripts"), { recursive: true });
    cpSync(join(ROOT, "scripts", "brand-build.mjs"), join(root, "scripts", "brand-build.mjs"));
    for (const source of Object.values(MIRROR_PAIRS)) {
      mkdirSync(dirname(join(root, source)), { recursive: true });
      cpSync(join(ROOT, source), join(root, source));
    }
    return root;
  }
  const editTokens = (root, edit) => {
    const edited = JSON.parse(read(root, "brand", "tokens.json"));
    edit(edited);
    writeFileSync(join(root, "brand", "tokens.json"), `${JSON.stringify(edited, null, 2)}\n`);
  };

  test("rebuilding the kit elsewhere reproduces brand/ exactly (idempotence)", () => {
    const out = join(scratch, "rebuilt");
    const result = build(["--out", out]);
    assert.equal(result.status, 0, result.stderr);
    const rebuilt = walk(out);
    assert.deepEqual(rebuilt, walk(BRAND), "the file set differs: a stray file in brand/, or a file the build no longer produces");
    const drifted = rebuilt.filter((rel) => !readFileSync(join(out, rel)).equals(readFileSync(join(BRAND, rel))));
    assert.deepEqual(drifted, [], `these files would change on a rebuild (run npm run brand:build): ${drifted.join(", ")}`);
  });

  test("an in-place build of an unchanged repo says 'up to date' and touches nothing", () => {
    const repo = makeRepo();
    const before = snapshot(join(repo, "brand"));
    const result = build([], repo);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`${KIT_FILES.length} files, up to date`));
    assert.deepEqual(snapshot(join(repo, "brand")), before);
  });

  test("the CLI also runs, and still fails when it must, when reached through a symlinked directory", () => {
    // argv[1] keeps the link while import.meta.url does not. An entry-point guard that compares them with === skips the whole
    // build silently and exits 0 (macOS temp dirs sit behind a symlink; Linux /tmp does not, hence this explicit test).
    const repo = makeRepo();
    const link = join(scratch, "link-to-repo");
    symlinkSync(repo, link, "dir");
    const ran = build([], link);
    assert.equal(ran.status, 0, ran.stderr);
    assert.match(ran.stdout, new RegExp(`${KIT_FILES.length} files, up to date`), "a skipped entry point prints nothing");
    const refused = build(["--out", join(link, "brand")], link);
    assert.equal(refused.status, 1, "a refusal must still exit 1 through the link");
    assert.match(refused.stderr, /already exists and is not an empty directory/);
  });

  test("--out accepts a directory that exists but is empty", () => {
    const empty = join(scratch, "empty");
    mkdirSync(empty);
    const result = build(["--out", empty]);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(walk(empty), KIT_FILES);
  });

  test("--out refuses a non-empty directory, a plain file and the kit's own directory, and writes nothing", () => {
    const occupied = join(scratch, "occupied");
    mkdirSync(occupied);
    writeFileSync(join(occupied, "keep.txt"), "mine\n");
    const file = join(scratch, "a-file");
    writeFileSync(file, "mine\n");
    const repo = makeRepo();
    const kitBefore = snapshot(join(repo, "brand"));

    for (const [target, root] of [[occupied, ROOT], [file, ROOT], [join(repo, "brand"), repo]]) {
      const result = build(["--out", target], root);
      assert.equal(result.status, 1, `--out ${target} must be refused`);
      assert.match(result.stderr, /already exists and is not an empty directory/);
    }
    assert.deepEqual(walk(occupied), ["keep.txt"], "nothing may be written into somebody else's directory");
    assert.equal(read(file), "mine\n");
    assert.deepEqual(snapshot(join(repo, "brand")), kitBefore);
  });

  test("an unknown argument, or --out without a directory, is rejected with the usage", () => {
    for (const args of [["--nope"], ["--out"], ["--out", "a", "b"]]) {
      const result = build(args);
      assert.equal(result.status, 1, args.join(" "));
      assert.match(result.stderr, /usage:/);
    }
  });

  test("a font file in brand/fonts stops the build with exit 1 before anything is written", () => {
    const repo = makeRepo();
    editTokens(repo, (t) => {
      t.color.yellow = "#FFD167"; // a real change: without the font, tokens.css and manifest.json would be rewritten
    });
    writeFileSync(join(repo, "brand", "fonts", "DIN2014Rounded-Variable.woff2"), "not a real font");
    const before = snapshot(join(repo, "brand"));

    const result = build([], repo);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /licensed font files must never enter this public repository/);
    assert.match(result.stderr, /fonts\/DIN2014Rounded-Variable\.woff2/);
    assert.match(result.stderr, /Nothing was written/);
    assert.deepEqual(snapshot(join(repo, "brand")), before, "tokens.css and manifest.json must not have been rewritten");
    assert.ok(!read(repo, "brand", "tokens.css").includes("#FFD167"), "the stale tokens.css must still be the old one");
  });

  test("deleting a colour the logo needs makes the CLI exit 1 and leaves every file untouched (never fill=\"undefined\")", () => {
    const repo = makeRepo();
    editTokens(repo, (t) => {
      delete t.color.white;
    });
    const before = snapshot(join(repo, "brand"));

    const result = build([], repo);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /color\.white: missing, but the logo variants use it/);
    assert.deepEqual(snapshot(join(repo, "brand")), before);
    for (const rel of walk(join(repo, "brand")).filter((path) => path.endsWith(".svg"))) {
      assert.doesNotMatch(read(repo, "brand", rel), /undefined/, rel);
    }
  });

  test("the date stamp moves only when content moves, and a second build writes nothing", () => {
    const repo = makeRepo();
    const brand = join(repo, "brand");
    rmSync(join(brand, "manifest.json")); // a first build: there is no previous manifest to keep the date from
    writeKit(buildKit({ root: repo, today: "2026-01-01" }), brand);
    assert.equal(JSON.parse(read(brand, "manifest.json")).generatedAt, "2026-01-01");

    assert.deepEqual(writeKit(buildKit({ root: repo, today: "2027-02-02" }), brand), [], "unchanged sources must write nothing");
    assert.equal(JSON.parse(read(brand, "manifest.json")).generatedAt, "2026-01-01", "the date must survive a no-op build");

    editTokens(repo, (t) => {
      t.color.yellow = "#FFD167";
    });
    assert.deepEqual(writeKit(buildKit({ root: repo, today: "2027-03-03" }), brand).sort(), ["manifest.json", "tokens.css"]);
    assert.equal(JSON.parse(read(brand, "manifest.json")).generatedAt, "2027-03-03");
    assert.match(read(brand, "tokens.css"), /--m3-yellow: #FFD167;/);
  });

  const badTokens = {
    "a colour that is not #RRGGBB": [(t) => (t.color.red = "red"), /color\.red/],
    "a level that points at an unknown colour": [(t) => (t.level.alert = "purple"), /level\.alert/],
    "a CSS value that could end its declaration": [(t) => (t.radius.card = "1rem; } body { display: none"), /radius\.card/],
    "a bar height of zero": [(t) => (t.tripleBar.height = 0), /tripleBar\.height/],
    "a chart series entry that is not a colour": [(t) => (t.chartSeries[2] = "#12345"), /chartSeries\[2\]/],
    "a version that is not semver": [(t) => (t.version = "v1"), /version/],
    // Every colour token the logo variants dereference: without it a fill would be written as "undefined".
    ...Object.fromEntries(
      ["green-900", "green-400", "green-200", "white"].map((name) => [
        `a missing colour that the logo variants use (${name})`,
        [
          (t) => {
            delete t.color[name];
          },
          new RegExp(`color\\.${name}: missing`),
        ],
      ]),
    ),
  };
  for (const [label, [edit, pattern]] of Object.entries(badTokens)) {
    test(`fails closed on ${label}`, () => {
      const repo = makeRepo();
      editTokens(repo, edit);
      assert.throws(() => buildKit({ root: repo }), pattern);
    });
  }

  test("fails closed on logo path data that could inject markup", () => {
    const repo = makeRepo();
    const edited = { ...paths, body: ['M0 0" onload="alert(1)', ...paths.body.slice(1)] };
    writeFileSync(join(repo, "brand", "logo", "paths.json"), `${JSON.stringify(edited, null, 2)}\n`);
    assert.throws(() => buildKit({ root: repo }), /body\[0\]/);
  });

  test("fails closed when an authored file or a mirrored source is missing, or tokens.json is not JSON", () => {
    const missingAuthored = makeRepo();
    rmSync(join(missingAuthored, "brand", "README.md"));
    assert.throws(() => buildKit({ root: missingAuthored }), /cannot read brand\/README\.md/);

    const missingMirror = makeRepo();
    rmSync(join(missingMirror, "src", "app", "icon.svg"));
    assert.throws(() => buildKit({ root: missingMirror }), /cannot read src\/app\/icon\.svg/);

    const notJson = makeRepo();
    writeFileSync(join(notJson, "brand", "tokens.json"), "{ nope");
    assert.throws(() => buildKit({ root: notJson }), /tokens\.json is not valid JSON/);
  });

  test("reports files that are not part of the kit (a font, for instance) and ignores .DS_Store", () => {
    const repo = makeRepo();
    const brand = join(repo, "brand");
    const kit = buildKit({ root: repo });
    assert.deepEqual(unexpectedFiles(brand, kit), []);

    writeFileSync(join(brand, ".DS_Store"), "x");
    assert.deepEqual(unexpectedFiles(brand, kit), []);

    writeFileSync(join(brand, "fonts", "DIN2014Rounded-Variable.woff2"), "x");
    assert.deepEqual(unexpectedFiles(brand, kit), ["fonts/DIN2014Rounded-Variable.woff2"]);
    assert.throws(() => writeKit(kit, brand), /licensed font files must never enter this public repository/);
  });
});
