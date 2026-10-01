// Lighthouse 12 against the LIVE staging URL (EV-09, ADR-005): mobile + desktop, 3 runs each.
// Usage: npm run evidence:live-lighthouse   (LIVE_URL overrides the target; LH_RUNS the number of runs)
// Writes docs/evidence/live/lighthouse-{mobile,desktop}-run{N}.report.{html,json} and lighthouse-live-summary.json
// (all runs + the median run by performance score; ties broken by LCP).
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const OUT_DIR = resolve(import.meta.dirname, "..", "..", "docs", "evidence", "live");
const URL_UNDER_TEST = (process.env.LIVE_URL ?? "https://d21guxd9tjai7a.cloudfront.net") + "/";
const RUNS = Number(process.env.LH_RUNS ?? 3);
mkdirSync(OUT_DIR, { recursive: true });

const metrics = (lhr) => ({
  perf: Math.round(lhr.categories.performance.score * 100),
  a11y: Math.round(lhr.categories.accessibility.score * 100),
  bestPractices: Math.round(lhr.categories["best-practices"].score * 100),
  seo: Math.round(lhr.categories.seo.score * 100),
  lcpMs: Math.round(lhr.audits["largest-contentful-paint"].numericValue),
  fcpMs: Math.round(lhr.audits["first-contentful-paint"].numericValue),
  cls: Number(lhr.audits["cumulative-layout-shift"].numericValue.toFixed(4)),
  tbtMs: Math.round(lhr.audits["total-blocking-time"].numericValue),
  speedIndexMs: Math.round(lhr.audits["speed-index"].numericValue),
});

const summary = { url: URL_UNDER_TEST, generatedAt: new Date().toISOString(), forms: {} };
for (const form of ["mobile", "desktop"]) {
  const runs = [];
  for (let n = 1; n <= RUNS; n++) {
    const base = join(OUT_DIR, `lighthouse-${form}-run${n}`);
    const args = [
      "--yes",
      "lighthouse@12",
      URL_UNDER_TEST,
      "--output=html",
      "--output=json",
      `--output-path=${base}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new",
      "--quiet",
    ];
    if (form === "desktop") args.push("--preset=desktop");
    const result = spawnSync("npx", args, { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status ?? 1);
    const lhr = JSON.parse(readFileSync(`${base}.report.json`, "utf8"));
    runs.push({ run: n, lighthouseVersion: lhr.lighthouseVersion, ...metrics(lhr) });
  }
  const ranked = [...runs].sort((a, b) => a.perf - b.perf || b.lcpMs - a.lcpMs);
  summary.forms[form] = { runs, medianRun: ranked[Math.floor(ranked.length / 2)].run };
}
writeFileSync(join(OUT_DIR, "lighthouse-live-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
