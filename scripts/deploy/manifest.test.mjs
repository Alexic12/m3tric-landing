import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { buildManifest, listFiles } from "./manifest.mjs";

const ENV = {
  COMMIT: "a".repeat(40),
  RELEASE_ID: "deploy-7-aaaaaaa",
  SITE_URL: "https://d111111abcdef8.cloudfront.net",
  STACK_NAME: "m3tric-staging-LandingSiteStack",
  BUCKET_NAME: "bucket",
  DISTRIBUTION_ID: "E123",
  RELEASE_PROFILE: "staging",
  GITHUB_RUN_ID: "42",
  GITHUB_REPOSITORY: "Alexic12/m3tric-landing",
};
const FILES = [{ path: "index.html", sha256: "0".repeat(64), bytes: 1 }];
const SMOKE = { passed: true, checks: [] };
const NOW = new Date("2026-10-01T00:00:00Z");

describe("buildManifest", () => {
  test("assembles every documented field", () => {
    assert.deepEqual(buildManifest({ env: ENV, files: FILES, smoke: SMOKE, now: NOW }), {
      commit: ENV.COMMIT,
      releaseId: "deploy-7-aaaaaaa",
      runId: "42",
      runUrl: "https://github.com/Alexic12/m3tric-landing/actions/runs/42",
      siteUrl: ENV.SITE_URL,
      stack: { name: ENV.STACK_NAME, bucket: "bucket", distributionId: "E123" },
      profile: "staging",
      builtAt: "2026-10-01T00:00:00.000Z",
      files: FILES,
      smoke: SMOKE,
    });
  });

  test("GITHUB_SHA is the commit when COMMIT is absent", () => {
    const { COMMIT, ...rest } = ENV;
    assert.equal(buildManifest({ env: { ...rest, GITHUB_SHA: COMMIT }, files: FILES, smoke: SMOKE }).commit, COMMIT);
  });

  for (const key of Object.keys(ENV).filter((k) => k !== "COMMIT")) {
    test(`fails closed without ${key}`, () => {
      assert.throws(() => buildManifest({ env: { ...ENV, [key]: "" }, files: FILES, smoke: SMOKE }), /manifest/);
    });
  }

  test("rejects a non-sha commit, no files and no smoke", () => {
    assert.throws(() => buildManifest({ env: { ...ENV, COMMIT: "main" }, files: FILES, smoke: SMOKE }), /40-hex/);
    assert.throws(() => buildManifest({ env: ENV, files: [], smoke: SMOKE }), /no files/);
    assert.throws(() => buildManifest({ env: ENV, files: FILES, smoke: undefined }), /smoke/);
  });
});

describe("listFiles", () => {
  test("hashes recursively with posix paths, sorted", () => {
    const dir = mkdtempSync(join(tmpdir(), "manifest-"));
    mkdirSync(join(dir, "_next", "static"), { recursive: true });
    writeFileSync(join(dir, "index.html"), "abc");
    writeFileSync(join(dir, "_next", "static", "a.js"), "");
    assert.deepEqual(listFiles(dir), [
      { path: "_next/static/a.js", sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", bytes: 0 },
      { path: "index.html", sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", bytes: 3 },
    ]);
  });
});
