import { expect, test, type Page } from "@playwright/test";

const FAILSAFE_WAIT_MS = 3500;

/** Product of the opacity of an element and all its ancestors: what the user actually sees. */
async function effectiveOpacities(page: Page, selector: string): Promise<Array<{ text: string; opacity: number }>> {
  return page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(sel)).map((el) => {
      let o = 1;
      for (let n: Element | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      return { text: (el.textContent ?? "").trim().slice(0, 40), opacity: o };
    });
  }, selector);
}

test.describe("hydration failure (R1)", () => {
  test("blocked JS chunks: content is hidden at first, then the failsafe reveals every section heading", async ({
    page,
  }) => {
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const hiddenAtStart = (await effectiveOpacities(page, "section h2")).filter((h) => h.opacity === 0);
    expect(hiddenAtStart.length, "the test is meaningful: headings start hidden under .js").toBeGreaterThan(5);

    await page.waitForTimeout(FAILSAFE_WAIT_MS);
    await expect(page.locator("html")).not.toHaveClass(/\bjs\b/);
    await expect(page.locator("html")).not.toHaveAttribute("data-hydrated", /.*/);
    const headings = await effectiveOpacities(page, "section h2");
    expect(headings.length).toBeGreaterThanOrEqual(8);
    expect(headings.filter((h) => h.opacity !== 1), "headings not fully visible after the failsafe").toEqual([]);
  });

  test("healthy load: hydration marks <html> and keeps the reveal state", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "");
    await page.waitForTimeout(FAILSAFE_WAIT_MS);
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
  });
});

test.describe("reveal layer (R13)", () => {
  test("every [data-reveal] keeps its opacity/transform transition (utilities do not clobber it)", async ({ page }) => {
    await page.goto("/");
    const props = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-reveal]")).map((el) => getComputedStyle(el).transitionProperty),
    );
    expect(props.length).toBeGreaterThan(10);
    expect(props.filter((p) => !p.includes("opacity") || !p.includes("transform"))).toEqual([]);
  });

  test("Products card hover transition animates border-color and changes it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const card = page.locator("#productos ul > li > [data-reveal] > div").first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    const transition = await card.evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transition).toContain("border-color");
    const before = await card.evaluate((el) => getComputedStyle(el).borderTopColor);
    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).borderTopColor)).not.toBe(before);
  });
});

test.describe("accessible names", () => {
  test("Contact h2 reads as words, not glued spans", async ({ page }) => {
    await page.goto("/");
    const h2 = page.locator("#contacto-title");
    const text = await h2.evaluate((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim());
    expect(text).toBe("Entender mejor para decidir mejor");
    await expect(page.getByRole("heading", { level: 2, name: "Entender mejor para decidir mejor", exact: true })).toHaveCount(1);
  });

  test("Hero h1 reads as words, not glued spans", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Entender el territorio para anticipar el riesgo.", exact: true }),
    ).toHaveCount(1);
  });
});

test.describe("static server hardening (R21)", () => {
  test("malformed percent-encoding answers 400, not 500", async ({ request }) => {
    const response = await request.get("/%E0%A4%A");
    expect(response.status()).toBe(400);
  });

  test("path traversal never leaves out/", async ({ request }) => {
    const response = await request.get("/%2e%2e/%2e%2e/package.json");
    expect(response.status()).toBe(404);
  });
});

test.describe("robots (R23)", () => {
  test("robots.txt has no non-standard Host directive", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Sitemap: https:\/\//);
    expect(body).not.toMatch(/^Host:/im);
  });
});
