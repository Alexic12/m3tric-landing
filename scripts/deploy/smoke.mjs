// Post-deploy smoke (spec 11.4). Node >= 18 (fetch), no dependencies.
//   SITE_URL          required  origin under test, e.g. https://dxxxx.cloudfront.net
//   PLATFORM_URL      required  every "Abrir plataforma" link must equal it
//   EXPECT_PROFILE    required  staging | production
//   EXPECT_RELEASE_ID optional  must equal the m3tric:release meta (strongly recommended in deploys)
//   BUCKET_NAME + AWS_REGION    optional; both set => direct S3 GET must return 403. Otherwise that
//                               check is reported as SKIPPED (never as passed).
//   SMOKE_OUT         optional  path of the JSON result (always written, also on failure)
// Eventual consistency (invalidation, edge propagation): failed checks are retried with backoff until
// the deadline; a check only counts as failed if it never passed.
import { writeFileSync } from "node:fs";
import { anchorHrefsByText, profileProblems } from "../lib/artifact-rules.mjs";

const env = (key) => (process.env[key] ?? "").trim();
const DEADLINE_MS = Number(env("SMOKE_DEADLINE_MS") || 120_000);
const FIRST_DELAY_MS = 2_000;
const MAX_DELAY_MS = 15_000;
const REQUEST_TIMEOUT_MS = 15_000;
const IMMUTABLE_CACHE = /max-age=31536000/;

const siteUrl = env("SITE_URL");
const platformUrl = env("PLATFORM_URL");
const profile = env("EXPECT_PROFILE");
const releaseId = env("EXPECT_RELEASE_ID");
const bucket = env("BUCKET_NAME");
const region = env("AWS_REGION");

const config = [];
// http is accepted for loopback only, so the script can be exercised against a local server.
if (!/^(https:\/\/[^/]+|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/.test(siteUrl)) config.push("SITE_URL must be a bare https origin");
if (!platformUrl) config.push("PLATFORM_URL is required");
if (!["staging", "production"].includes(profile)) config.push("EXPECT_PROFILE must be staging or production");
if (config.length > 0) {
  console.error(`smoke: bad configuration\n  - ${config.join("\n  - ")}`);
  process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(path, base = siteUrl) {
  const res = await fetch(`${base}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { "user-agent": "m3tric-smoke/1", "cache-control": "no-cache" },
  });
  return { status: res.status, headers: res.headers, body: await res.text() };
}

const header = (res, name) => res.headers.get(name) ?? "";
const expect = (problems, condition, message) => {
  if (!condition) problems.push(message);
};

/** Each check returns a list of problems; throwing counts as a problem too. */
const checks = [];
const check = (name, fn) => checks.push({ name, fn });

// Fetched once per attempt and shared by the checks that need the home page / robots.txt.
let home;
let robots;
const refreshShared = async () => {
  [home, robots] = await Promise.all([get("/"), get("/robots.txt")]);
};

check("GET / -> 200 HTML", async () => {
  const p = [];
  expect(p, home.status === 200, `status ${home.status}`);
  expect(p, /text\/html/i.test(header(home, "content-type")), `content-type "${header(home, "content-type")}"`);
  return p;
});

check("Release profile and release id (meta + robots.txt)", async () =>
  profileProblems({ profile, html: home.body, robotsTxt: robots.body, releaseId: releaseId || undefined }),
);

check("Security headers on /", async () => {
  const p = [];
  const csp = header(home, "content-security-policy");
  expect(p, csp.includes("default-src 'self'") && csp.includes("frame-ancestors 'none'") && csp.includes("object-src 'none'"), `CSP "${csp}"`);
  expect(p, /max-age=63072000/.test(header(home, "strict-transport-security")), `HSTS "${header(home, "strict-transport-security")}"`);
  expect(p, header(home, "x-content-type-options").toLowerCase() === "nosniff", "X-Content-Type-Options != nosniff");
  expect(p, header(home, "x-frame-options").toUpperCase() === "DENY", `X-Frame-Options "${header(home, "x-frame-options")}"`);
  expect(p, header(home, "referrer-policy") === "strict-origin-when-cross-origin", `Referrer-Policy "${header(home, "referrer-policy")}"`);
  expect(p, header(home, "permissions-policy").includes("camera=()"), `Permissions-Policy "${header(home, "permissions-policy")}"`);
  const robotsTag = header(home, "x-robots-tag");
  if (profile === "staging") expect(p, /noindex/i.test(robotsTag) && /nofollow/i.test(robotsTag), `X-Robots-Tag "${robotsTag}" (staging needs noindex, nofollow)`);
  else expect(p, !/noindex|nofollow/i.test(robotsTag), `X-Robots-Tag "${robotsTag}" must not block in production`);
  return p;
});

check("/ revalidates (Cache-Control no-cache)", async () => {
  const p = [];
  expect(p, /no-cache/.test(header(home, "cache-control")), `Cache-Control "${header(home, "cache-control")}"`);
  return p;
});

check("Unknown path -> 404 with the site's own page", async () => {
  const [missing, own] = await Promise.all([get(`/no-existe-${Date.now()}`), get("/404.html")]);
  const p = [];
  expect(p, missing.status === 404, `status ${missing.status}`);
  expect(p, own.status === 200 && missing.body === own.body, "body differs from /404.html");
  return p;
});

check("A _next/static asset is immutable", async () => {
  const p = [];
  const asset = /\/_next\/static\/[^"'\s)]+\.js/.exec(home.body)?.[0];
  if (!asset) return ["no /_next/static JS asset referenced by /"];
  const res = await get(asset);
  expect(p, res.status === 200, `${asset} status ${res.status}`);
  expect(p, /javascript/i.test(header(res, "content-type")), `${asset} content-type "${header(res, "content-type")}"`);
  expect(p, IMMUTABLE_CACHE.test(header(res, "cache-control")) && /immutable/.test(header(res, "cache-control")), `${asset} Cache-Control "${header(res, "cache-control")}"`);
  return p;
});

check("og.png, sitemap.xml, manifest.webmanifest", async () => {
  const [og, sitemap, manifest] = await Promise.all([get("/og.png"), get("/sitemap.xml"), get("/manifest.webmanifest")]);
  const p = [];
  expect(p, og.status === 200 && /image\/png/.test(header(og, "content-type")), `og.png ${og.status} ${header(og, "content-type")}`);
  expect(p, /max-age=86400/.test(header(og, "cache-control")), `og.png Cache-Control "${header(og, "cache-control")}"`);
  expect(p, sitemap.status === 200 && sitemap.body.includes(siteUrl), `sitemap.xml ${sitemap.status} (must contain ${siteUrl})`);
  expect(p, manifest.status === 200 && /application\/manifest\+json/.test(header(manifest, "content-type")), `manifest ${manifest.status} ${header(manifest, "content-type")}`);
  return p;
});

check("robots.txt -> 200 text/plain", async () => {
  const p = [];
  expect(p, robots.status === 200 && /text\/plain/.test(header(robots, "content-type")), `robots.txt ${robots.status} ${header(robots, "content-type")}`);
  return p;
});

check('Every "Abrir plataforma" link equals PLATFORM_URL', async () => {
  const hrefs = anchorHrefsByText(home.body, "Abrir plataforma");
  if (hrefs.length === 0) return ['no anchor with text "Abrir plataforma"'];
  const wrong = [...new Set(hrefs.filter((href) => href !== platformUrl))];
  return wrong.map((href) => `href "${href}" != "${platformUrl}"`);
});

const DIRECT_S3 = "Direct S3 GET -> 403 (bucket is private)";
check(DIRECT_S3, async () => {
  const res = await get("/index.html", `https://${bucket}.s3.${region}.amazonaws.com`);
  return res.status === 403 ? [] : [`direct S3 status ${res.status} (expected 403)`];
});

const directS3Enabled = Boolean(bucket && region);
const results = new Map();
const skipped = new Set();
if (!directS3Enabled) {
  skipped.add(DIRECT_S3);
  results.set(DIRECT_S3, { name: DIRECT_S3, status: "skipped", detail: "BUCKET_NAME/AWS_REGION not set: NOT verified", attempts: 0 });
}

const startedAt = new Date();
const started = Date.now();
let delay = FIRST_DELAY_MS;
let attempt = 0;
let sharedError = "";
for (;;) {
  attempt += 1;
  try {
    await refreshShared();
  } catch (error) {
    // The shared fetch failed: every pending check fails this attempt with the same reason.
    home = robots = undefined;
    sharedError = `${error.name}: ${error.message}`;
  }
  let pending = 0;
  for (const { name, fn } of checks) {
    if (skipped.has(name) || results.get(name)?.status === "pass") continue;
    let problems;
    try {
      if (!home && name !== DIRECT_S3) throw new Error(sharedError);
      problems = await fn();
    } catch (error) {
      problems = [`${error.name}: ${error.message}`];
    }
    results.set(name, { name, status: problems.length === 0 ? "pass" : "fail", detail: problems.join("; "), attempts: attempt });
    if (problems.length > 0) pending += 1;
  }
  if (pending === 0 || Date.now() - started + delay > DEADLINE_MS) break;
  console.log(`smoke: attempt ${attempt}: ${pending} check(s) failing, retrying in ${delay / 1000}s`);
  await sleep(delay);
  delay = Math.min(delay * 2, MAX_DELAY_MS);
}

const list = checks.map(({ name }) => results.get(name));
const failed = list.filter((r) => r.status === "fail");
const skippedList = list.filter((r) => r.status === "skipped");
const result = {
  siteUrl,
  profile,
  releaseId: releaseId || null,
  startedAt: startedAt.toISOString(),
  durationMs: Date.now() - started,
  passed: failed.length === 0,
  checks: list,
};
if (env("SMOKE_OUT")) writeFileSync(env("SMOKE_OUT"), `${JSON.stringify(result, null, 2)}\n`);

const mark = { pass: "PASS", fail: "FAIL", skipped: "SKIP" };
console.log(`\nsmoke ${siteUrl} (profile ${profile}, release ${releaseId || "not checked"})`);
for (const r of list) console.log(`  ${mark[r.status]}  ${r.name}${r.detail ? `\n        ${r.detail}` : ""}`);
if (skippedList.length > 0) console.log(`\nsmoke: WARNING ${skippedList.length} check(s) skipped, not verified`);
if (failed.length > 0) {
  console.error(`\nsmoke FAILED: ${failed.length} of ${list.length} check(s)`);
  process.exit(1);
}
console.log(`\nsmoke OK: ${list.length - skippedList.length} passed, ${skippedList.length} skipped`);
