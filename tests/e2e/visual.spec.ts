import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { fontsReady, scrollThrough, scrollToTop } from "../helpers/page";

const WIDTHS = [360, 768, 1280, 1920];
// Raw PNGs stay in test-results/ (git-ignored); `npm run evidence:screens` converts them to WebP in docs/evidence/screenshots.
const SCREENSHOT_DIR = join(__dirname, "..", "..", "test-results", "screens");

for (const width of WIDTHS) {
  test(`full-page screenshot at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await scrollThrough(page);
    await page.waitForTimeout(800); // reveal transitions (0.5 s) finish
    await fontsReady(page);
    await scrollToTop(page);
    await page.waitForTimeout(500); // header returns to transparent
    await fontsReady(page);

    await page.screenshot({
      path: join(SCREENSHOT_DIR, `${testInfo.project.name}-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });

    if (testInfo.project.name === "chromium") {
      await expect(page).toHaveScreenshot(`landing-${width}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.01,
        mask: [page.locator("[data-visual]")],
      });
    }
  });
}
