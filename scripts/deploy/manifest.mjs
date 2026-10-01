// Builds deploy-manifest.json: what was deployed, from which commit/run, and what the smoke said.
//   env (required): COMMIT (or GITHUB_SHA), RELEASE_ID, SITE_URL, STACK_NAME, BUCKET_NAME, DISTRIBUTION_ID,
//                   RELEASE_PROFILE, GITHUB_RUN_ID, GITHUB_REPOSITORY, SMOKE_OUT (smoke result path)
//   env (optional): GITHUB_SERVER_URL, OUT_DIR (default out), MANIFEST_OUT (default deploy-manifest.json)
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Every file under `dir` as { path (posix, relative), sha256, bytes }, sorted by path. */
export function listFiles(dir) {
  const files = [];
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      const data = readFileSync(full);
      files.push({
        path: relative(dir, full).split(sep).join("/"),
        sha256: createHash("sha256").update(data).digest("hex"),
        bytes: data.length,
      });
    }
  };
  walk(dir);
  return files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Pure assembly; throws when a required value is missing so a half-empty manifest is never written. */
export function buildManifest({ env, files, smoke, now = new Date() }) {
  const need = (key) => {
    const value = (env[key] ?? "").trim();
    if (!value) throw new Error(`manifest: missing required value ${key}`);
    return value;
  };
  const runId = need("GITHUB_RUN_ID");
  const server = (env.GITHUB_SERVER_URL ?? "https://github.com").trim();
  const commit = (env.COMMIT ?? env.GITHUB_SHA ?? "").trim();
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`manifest: COMMIT must be a 40-hex sha ("${commit}")`);
  if (!Array.isArray(files) || files.length === 0) throw new Error("manifest: no files to record");
  if (!smoke || typeof smoke !== "object") throw new Error("manifest: missing smoke result");
  return {
    commit,
    releaseId: need("RELEASE_ID"),
    runId,
    runUrl: `${server}/${need("GITHUB_REPOSITORY")}/actions/runs/${runId}`,
    siteUrl: need("SITE_URL"),
    stack: { name: need("STACK_NAME"), bucket: need("BUCKET_NAME"), distributionId: need("DISTRIBUTION_ID") },
    profile: need("RELEASE_PROFILE"),
    builtAt: now.toISOString(),
    files,
    smoke,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const outDir = process.env.OUT_DIR || "out";
    const smokePath = process.env.SMOKE_OUT;
    if (!smokePath) throw new Error("manifest: SMOKE_OUT is required");
    const manifest = buildManifest({
      env: process.env,
      files: listFiles(outDir),
      smoke: JSON.parse(readFileSync(smokePath, "utf8")),
    });
    const target = process.env.MANIFEST_OUT || "deploy-manifest.json";
    writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`manifest: ${target} written (${manifest.files.length} files, smoke passed=${manifest.smoke.passed})`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
