// Runs Lighthouse (mobile + desktop) against the gzip measurement server (approximates CloudFront).
// Usage: npm run evidence:lighthouse
//   1. build with the fake test env (see the test:e2e script), 2. `node tests/helpers/serve-gzip.mjs` (port 4174).
// Override with LH_URL / LH_TAG (e.g. LH_URL=http://127.0.0.1:4173/ LH_TAG= for the uncompressed server).
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const OUT_DIR = resolve(import.meta.dirname, "..", "..", "docs", "evidence");
const URL_UNDER_TEST = process.env.LH_URL ?? "http://127.0.0.1:4174/";
mkdirSync(OUT_DIR, { recursive: true });

for (const form of ["mobile", "desktop"]) {
  const base = join(OUT_DIR, `lighthouse-${form}${process.env.LH_TAG ?? "-gzip"}`);
  const args = [
    "--yes",
    "lighthouse@12",
    URL_UNDER_TEST,
    "--output=html",
    "--output=json",
    `--output-path=${base}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    '--chrome-flags=--headless=new',
    "--quiet",
  ];
  if (form === "desktop") args.push("--preset=desktop");
  const result = spawnSync("npx", args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
