import { expect, test, type APIResponse } from "@playwright/test";

// HTTP checks do not depend on a rendering engine; run them once.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "protocol-level checks are engine-independent");
});

function expectSecurityHeaders(res: APIResponse, label: string) {
  const h = res.headers();
  expect(h["content-security-policy"], `${label} CSP`).toContain("default-src 'self'");
  expect(h["content-security-policy"], `${label} CSP`).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"], `${label} CSP`).toContain("object-src 'none'");
  expect(h["strict-transport-security"], `${label} HSTS`).toMatch(/max-age=63072000/);
  expect(h["x-content-type-options"], `${label} nosniff`).toBe("nosniff");
  expect(h["x-frame-options"]?.toUpperCase(), `${label} XFO`).toBe("DENY");
  expect(h["referrer-policy"], `${label} Referrer-Policy`).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"], `${label} Permissions-Policy`).toContain("camera=()");
  expect(h["x-robots-tag"], `${label} X-Robots-Tag`).toMatch(/noindex.*nofollow/i);
}

test("security headers on /", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/text\/html/);
  expect(res.headers()["cache-control"]).toMatch(/no-cache/);
  expectSecurityHeaders(res, "/");
});

test("security headers on the 404 response; unknown path serves the site's own 404 page", async ({ request }) => {
  const missing = await request.get(`/no-existe-${Date.now()}`);
  expect(missing.status()).toBe(404);
  expectSecurityHeaders(missing, "404");
  const own = await request.get("/404.html");
  expect(own.status()).toBe(200);
  const body = await missing.text();
  expect(body).toBe(await own.text());
  expect(body).toContain("Esta página no existe");
});

test("security headers and immutable cache on a _next/static asset", async ({ request }) => {
  const home = await (await request.get("/")).text();
  const asset = /\/_next\/static\/[^"'\s)]+\.js/.exec(home)?.[0];
  expect(asset, "home references a _next/static JS file").toBeTruthy();
  const res = await request.get(asset!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/javascript/);
  expect(res.headers()["cache-control"]).toMatch(/max-age=31536000/);
  expect(res.headers()["cache-control"]).toMatch(/immutable/);
  expectSecurityHeaders(res, "asset");
});

test("responses are compressed (br or gzip)", async ({ request }) => {
  const res = await request.get("/", { headers: { "accept-encoding": "br, gzip" } });
  expect(res.headers()["content-encoding"]).toMatch(/^(br|gzip)$/);
});

test("http:// redirects 301 to the same host over https", async ({ playwright, baseURL }) => {
  const url = new URL(baseURL!);
  const ctx = await playwright.request.newContext({ maxRedirects: 0 });
  const res = await ctx.get(`http://${url.host}/`);
  expect(res.status()).toBe(301);
  expect(res.headers()["location"]).toBe(`https://${url.host}/`);
  await ctx.dispose();
});

test("the live manifest reports the same release as the page's m3tric:release meta", async ({ request }) => {
  const [html, manifest] = await Promise.all([request.get("/").then((r) => r.text()), request.get("/_deploy/manifest.json").then((r) => r.json())]);
  const release = /<meta name="m3tric:release" content="([^"]+)"/.exec(html)?.[1];
  expect(release).toBeTruthy();
  expect(manifest.releaseId).toBe(release);
  expect(manifest.profile).toBe("staging");
});
