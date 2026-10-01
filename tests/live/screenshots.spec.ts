import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { fontsReady, scrollThrough, scrollToTop } from "../helpers/page";

// Raw PNGs go to test-results/live-screens (outside the suite's outputDir); `npm run test:live` converts them to WebP.
const DIR = join(__dirname, "..", "..", "test-results", "live-screens");

for (const width of [360, 1280]) {
  test(`full-page screenshot at ${width}px`, async ({ page }, testInfo) => {
    mkdirSync(DIR, { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await scrollThrough(page);
    await page.waitForTimeout(800);
    await fontsReady(page);
    await scrollToTop(page);
    await page.waitForTimeout(500);
    const path = join(DIR, `live-${testInfo.project.name}-${width}.png`);
    await page.screenshot({ path, fullPage: true, animations: "disabled" });
    expect(path).toBeTruthy();
  });
}
