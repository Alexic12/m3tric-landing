import { expect, test } from "@playwright/test";
import { EMAIL, SECTION_IDS, SITE_URL } from "../helpers/env";
import { scrollThrough } from "../helpers/page";

test.describe("content and metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has exactly one h1", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("all nine sections exist with their anchor ids", async ({ page }) => {
    for (const id of SECTION_IDS) {
      await expect(page.locator(`section#${id}`), `section#${id}`).toHaveCount(1);
    }
  });

  test("every section[aria-labelledby] points to an existing heading (h1 for the hero, h2 otherwise)", async ({
    page,
  }) => {
    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll("section[aria-labelledby]")).map((s) => {
        const target = document.getElementById(s.getAttribute("aria-labelledby") ?? "");
        return { section: s.id, tag: target?.tagName ?? null, text: target?.textContent?.trim() ?? "" };
      }),
    );
    expect(results.length).toBeGreaterThanOrEqual(SECTION_IDS.length);
    for (const r of results) {
      expect(r.tag, `section#${r.section}`).not.toBeNull();
      expect(r.text.length, `section#${r.section} heading text`).toBeGreaterThan(0);
      expect(r.tag, `section#${r.section}`).toBe(r.section === "inicio" ? "H1" : "H2");
    }
  });

  test("heading levels never skip a level", async ({ page }) => {
    const levels = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => ({
        level: Number(h.tagName[1]),
        text: (h.textContent ?? "").trim().slice(0, 50),
      })),
    );
    let previous = 0;
    for (const h of levels) {
      expect(h.level, `"${h.text}" (h${h.level}) after h${previous}`).toBeLessThanOrEqual(previous + 1);
      previous = h.level;
    }
  });

  test("html lang is es-CO", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
  });

  test("title and meta description are non-empty Spanish", async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/M3TRIC/);
    expect(title).toMatch(/territorio/i);
    const description = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    expect(description.length).toBeGreaterThan(20);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).toMatch(/\b(para|el|la|los|de|e)\b/);
    expect(description).not.toMatch(/\b(the|and|for)\b/i);
  });

  test("canonical and og:url start with SITE_URL", async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(canonical?.startsWith(SITE_URL), `canonical=${canonical}`).toBe(true);
    expect(ogUrl?.startsWith(SITE_URL), `og:url=${ogUrl}`).toBe(true);
  });

  test("og:image is absolute, reachable, a 1200x630 PNG", async ({ page, request }) => {
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toMatch(/^https:\/\//);
    expect(ogImage?.startsWith(SITE_URL)).toBe(true);
    // The fake release domain does not resolve; the same path is served by the local static server.
    const response = await request.get(new URL(ogImage ?? "").pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const body = await response.body();
    expect(body.readUInt32BE(16), "png width").toBe(1200);
    expect(body.readUInt32BE(20), "png height").toBe(630);
  });

  test("JSON-LD parses and declares M3TRIC / Metric", async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? "");
    const nodes: Array<Record<string, unknown>> = data["@graph"] ?? [data];
    expect(nodes.length).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.name).toBe("M3TRIC");
      expect(node.alternateName).toBe("Metric");
      expect(String(node.url).startsWith(SITE_URL)).toBe(true);
    }
  });

  test("rendered text contains no forbidden strings", async ({ page }) => {
    // textContent (not innerText) so CSS text-transform cannot change case; "método" must not match TODO.
    const text = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
      return clone.textContent ?? "";
    });
    const forbidden: Array<[string, RegExp]> = [
      ["TODO", /\bTODO\b/],
      ["lorem", /lorem/i],
      ["placeholder", /placeholder/i],
      ["localhost", /localhost/i],
      ["example.com", /example\.com/i],
    ];
    for (const [label, pattern] of forbidden) {
      expect(text, `forbidden text: ${label}`).not.toMatch(pattern);
    }
    expect("método".match(forbidden[0][1])).toBeNull();
  });

  test("forbidden strings are also absent from href/src/alt attributes", async ({ page }) => {
    const attrs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[href],[src],[alt],[aria-label]")).flatMap((el) =>
        ["href", "src", "alt", "aria-label"].map((a) => el.getAttribute(a) ?? ""),
      ),
    );
    const joined = attrs.join("\n");
    expect(joined).not.toMatch(/localhost|127\.0\.0\.1|example\.com|lorem|\bTODO\b/i);
    expect(joined).toContain(EMAIL);
  });

  test("no console errors, page errors or failed requests across a full scroll-through", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("response", (r) => r.status() >= 400 && problems.push(`http ${r.status()}: ${r.url()}`));
    page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
    await page.goto("/");
    await scrollThrough(page);
    await page.waitForTimeout(500);
    expect(problems).toEqual([]);
  });
});

test.describe("404 page", () => {
  test("unknown route returns 404 with the not-found screen and a link home", async ({ page, request }) => {
    const raw = await request.get("/no-existe");
    expect(raw.status()).toBe(404);
    const response = await page.goto("/no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Esta página no existe" })).toBeVisible();
    const home = page.locator('a[href="/"]');
    await expect(home).toBeVisible();
    await home.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("h1")).not.toHaveText("Esta página no existe");
  });
});
