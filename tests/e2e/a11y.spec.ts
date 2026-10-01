import { writeFileSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { scrollThrough } from "../helpers/page";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const EVIDENCE = join(__dirname, "..", "..", "docs", "evidence");

async function runAxe(page: Page, file: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  writeFileSync(join(EVIDENCE, file), JSON.stringify(results, null, 2));
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
  }));
  test.info().annotations.push({ type: "axe-summary", description: JSON.stringify(summary) });
  return summary;
}

test.describe("axe (chromium only: engine-independent rules, single reference run)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "axe results are engine-independent; one reference run in chromium");
  });

  for (const width of [1280, 390]) {
    test(`no serious/critical violations at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/");
      await scrollThrough(page);
      await page.waitForTimeout(800);
      const summary = await runAxe(page, `axe-${width}.json`);
      expect(summary.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  }

  test("no serious/critical violations at 390px with the menu open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator("header button[aria-controls='menu-movil']").click();
    await expect(page.locator("#menu-movil")).toBeVisible();
    const summary = await runAxe(page, "axe-390-menu-open.json");
    expect(summary.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("every [data-reveal] is fully opaque immediately after load", async ({ page }) => {
    await page.goto("/");
    const opacities = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-reveal]")).map((el) => Number(getComputedStyle(el).opacity)),
    );
    expect(opacities.length).toBeGreaterThan(5);
    expect(opacities.filter((o) => o !== 1)).toEqual([]);
  });
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });
  test("all section headings are visible with opacity 1", async ({ page }) => {
    await page.goto("/");
    const headings = page.locator("section h2");
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(8);
    for (let i = 0; i < count; i++) {
      const h = headings.nth(i);
      await expect(h).toBeVisible();
      const effective = await h.evaluate((el) => {
        let o = 1;
        for (let n: Element | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o;
      });
      expect(effective, `h2 "${(await h.textContent())?.trim()}" effective opacity`).toBe(1);
    }
  });
});
