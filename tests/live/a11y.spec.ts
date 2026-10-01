import { writeFileSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { scrollThrough } from "../helpers/page";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const EVIDENCE = join(__dirname, "..", "..", "docs", "evidence", "live");

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "axe rules are engine-independent; one reference run in chromium");
});

for (const width of [1280, 390]) {
  test(`axe at ${width}px: zero serious/critical violations on the live site`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/");
    await scrollThrough(page);
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    writeFileSync(join(EVIDENCE, `axe-${width}.json`), JSON.stringify(results, null, 2));
    const summary = results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    test.info().annotations.push({ type: "axe-summary", description: JSON.stringify(summary) });
    expect(summary.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
}
