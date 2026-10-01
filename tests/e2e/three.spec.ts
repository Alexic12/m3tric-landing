import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { scrollThrough } from "../helpers/page";

const EVIDENCE = join(__dirname, "..", "..", "docs", "evidence");
const KNOWN_WARNING = /THREE\.Clock.*deprecated|THREE\.THREE\.Clock/i;

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "WebGL launch flags and the 3D contract are verified on chromium only");
});

test.describe("with WebGL", () => {
  test("3D scene mounts a canvas when #escalas scrolls into view", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#escalas [data-visual]")).toHaveAttribute("data-visual", "fallback");
    await page.locator("#escalas").scrollIntoViewIfNeeded();
    await page.locator("#escalas [data-visual]").scrollIntoViewIfNeeded();
    await expect(page.locator('#escalas [data-visual="3d"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#escalas [data-visual] canvas")).toHaveCount(1);
  });

  test("console is clean across a full scroll-through; only the known THREE.Clock warning appears", async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
      if (m.type() === "warning") warnings.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto("/");
    await scrollThrough(page);
    await expect(page.locator('#escalas [data-visual="3d"]')).toHaveCount(1, { timeout: 10_000 });
    await page.locator("#escala-tab-m2").click();
    await page.locator("#escala-tab-m3").click();
    await page.waitForTimeout(1000);
    writeFileSync(join(EVIDENCE, "console-3d.json"), JSON.stringify({ errors, warnings }, null, 2));
    expect(errors, "console errors").toEqual([]);
    const unknown = warnings.filter((w) => !KNOWN_WARNING.test(w));
    expect(unknown, "warnings other than the accepted THREE.Clock deprecation").toEqual([]);
  });
});

test.describe("without WebGL (--disable-3d-apis)", () => {
  test("stays on the SVG fallback", async ({ playwright, baseURL }) => {
    const browser = await playwright.chromium.launch({ args: ["--disable-3d-apis"] });
    const page = await (await browser.newContext({ baseURL, locale: "es-CO" })).newPage();
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto("/");
    const webgl = await page.evaluate(() => {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
    });
    expect(webgl, "launch flag actually disabled WebGL").toBe(false);
    await page.locator("#escalas [data-visual]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    const visual = page.locator("#escalas [data-visual]");
    await expect(visual).toHaveAttribute("data-visual", "fallback");
    await expect(visual.locator("svg").first()).toBeVisible();
    await expect(visual.locator("canvas")).toHaveCount(0);
    await browser.close();
    expect(errors).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("uses the fallback even when WebGL is available", async ({ page }) => {
    await page.goto("/");
    await page.locator("#escalas [data-visual]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await expect(page.locator("#escalas [data-visual]")).toHaveAttribute("data-visual", "fallback");
    await expect(page.locator("#escalas [data-visual] svg").first()).toBeVisible();
  });
});
