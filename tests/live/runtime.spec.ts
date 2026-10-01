import { expect, test } from "@playwright/test";
import { SECTION_IDS } from "../helpers/env";
import { ENGINE_NOTICE, KNOWN_WARNING, cspViolations, recordTelemetry } from "../helpers/live";
import { scrollThrough } from "../helpers/page";

test("full scroll-through: only 200/304 same-origin responses, no third parties, no failures, no console errors, no CSP violations", async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const t = await recordTelemetry(page);
  const main = await page.goto("/");
  expect(main?.status()).toBe(200);
  await scrollThrough(page);

  // The 3D viewer: WebGL in chromium must mount the canvas; the other engines may legitimately stay on the fallback.
  const viewer = page.locator("#escalas [data-visual]");
  await page.locator("#escalas").scrollIntoViewIfNeeded();
  await viewer.scrollIntoViewIfNeeded();
  if (test.info().project.name === "chromium") {
    await expect(page.locator('#escalas [data-visual="3d"]')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#escalas [data-visual] canvas")).toHaveCount(1);
  } else {
    await expect(viewer).toHaveAttribute("data-visual", /^(3d|fallback)$/);
    await page.waitForTimeout(3000); // let a late 3D mount (or its failure) surface
    await expect(viewer).toHaveAttribute("data-visual", /^(3d|fallback)$/);
  }
  await page.locator("#escala-tab-m2").click();
  await page.locator("#escala-tab-m3").click();
  await page.waitForTimeout(1000);

  expect(t.responses.length, "responses were observed").toBeGreaterThan(10);
  const offOrigin = t.responses.filter((r) => new URL(r.url).origin !== origin);
  expect(offOrigin, "responses from other origins").toEqual([]);
  expect([...t.requestOrigins].filter((o) => o !== origin), "requests to third-party origins").toEqual([]);
  const badStatus = t.responses.filter((r) => r.status !== 200 && r.status !== 304);
  expect(badStatus, "responses other than 200/304").toEqual([]);
  expect(t.failed, "failed requests").toEqual([]);
  expect(t.errors, "console errors").toEqual([]);
  expect(await cspViolations(page), "securitypolicyviolation events").toEqual([]);
  expect(
    t.warnings.filter((w) => !KNOWN_WARNING.test(w) && !ENGINE_NOTICE.test(w)),
    "warnings other than the accepted THREE.Clock deprecation and browser-emitted engine notices",
  ).toEqual([]);
  test.info().annotations.push({ type: "responses", description: String(t.responses.length) });
});

test("page structure: section ids in SPEC order, one h1, staging robots meta and release meta", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.headers()["x-robots-tag"]).toMatch(/noindex/i);
  expect(response?.headers()["x-robots-tag"]).toMatch(/nofollow/i);

  const ids = await page.evaluate(() => Array.from(document.querySelectorAll("main > section[id]")).map((s) => s.id));
  expect(ids).toEqual([...SECTION_IDS]);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator('meta[name="m3tric:release"]')).toHaveAttribute("content", /^[\w.-]+$/);
});

test("staging CTAs: every 'Abrir plataforma' is the platform URL, no mailto/tel, pending-channels text visible", async ({ page }) => {
  const { LIVE_PLATFORM_URL, PENDING_CHANNELS_TEXT } = await import("../helpers/live");
  await page.goto("/");
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a"))
      .filter((a) => (a.textContent ?? "").includes("Abrir plataforma"))
      .map((a) => a.href),
  );
  expect(hrefs.length, "at least header + hero + contact").toBeGreaterThanOrEqual(3);
  expect(hrefs.filter((h) => h !== LIVE_PLATFORM_URL)).toEqual([]);
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
  const contact = page.locator("#contacto");
  await contact.scrollIntoViewIfNeeded();
  await expect(contact.getByText(PENDING_CHANNELS_TEXT)).toBeVisible();
});

for (const width of [360, 390, 768, 1280, 1920]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await scrollThrough(page);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(m.scrollWidth, `scrollWidth ${m.scrollWidth} vs clientWidth ${m.clientWidth}`).toBeLessThanOrEqual(m.clientWidth);
  });
}
