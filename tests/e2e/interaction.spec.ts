import { expect, test, type Page } from "@playwright/test";
import { NAV_IDS } from "../helpers/env";
import { tabChord, waitForScrollSettled } from "../helpers/page";

/** Header must end above the section heading, and nothing may be painted over the heading's centre. */
async function expectHeadingClearOfHeader(page: Page, sectionId: string) {
  const heading = page.locator(`#${sectionId} h2`).first();
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("opacity", "1");
  const m = await page.evaluate((id) => {
    const h2 = document.querySelector(`#${id} h2`) as HTMLElement;
    const header = document.querySelector("header") as HTMLElement;
    const h = h2.getBoundingClientRect();
    const hb = header.getBoundingClientRect();
    const x = h.left + Math.min(h.width / 2, 200);
    const y = h.top + h.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      headerBottom: hb.bottom,
      headingTop: h.top,
      headingBottom: h.bottom,
      viewportHeight: window.innerHeight,
      hitInsideHeading: hit !== null && h2.contains(hit),
      hit: hit ? `${hit.tagName.toLowerCase()}${hit.id ? `#${hit.id}` : ""}` : null,
    };
  }, sectionId);
  expect(m.headerBottom, `#${sectionId}: header bottom vs h2 top`).toBeLessThanOrEqual(m.headingTop);
  expect(m.headingBottom, `#${sectionId}: h2 within viewport`).toBeLessThanOrEqual(m.viewportHeight);
  expect(m.hit, `#${sectionId}: element at h2 centre is ${m.hit}`).not.toBeNull();
  expect(m.hitInsideHeading, `#${sectionId}: element at h2 centre is ${m.hit}`).toBe(true);
}

test.describe("mobile menu (390x844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus, closes with Escape and restores focus", async ({ page }, testInfo) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Abrir menú" });
    const panel = page.locator("#menu-movil");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();

    await button.click();
    const toggle = page.locator("header button[aria-controls='menu-movil']");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest("#menu-movil")), { message: "focus inside panel" })
      .toBe(true);

    // Modal semantics: a named dialog, with everything behind it inert.
    await expect(panel).toHaveAttribute("role", "dialog");
    await expect(panel).toHaveAttribute("aria-modal", "true");
    await expect(panel).toHaveAttribute("aria-label", "Menú de navegación");
    for (const selector of ["main", "footer", 'a[href="#contenido"]']) {
      await expect(page.locator(selector).first(), `${selector} inert while the menu is open`).toHaveAttribute("inert", "");
    }

    // Focus that ended up outside the header (clicked body / blurred) is pulled back on the next Tab.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press(tabChord(testInfo));
    expect(await page.evaluate(() => !!document.activeElement?.closest("header")), "Tab from body re-enters the header").toBe(true);

    const focusableCount = await page.evaluate(
      () =>
        Array.from(
          document.querySelectorAll<HTMLElement>('header a[href], header button:not([disabled]), header [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null).length,
    );
    for (let i = 0; i < focusableCount + 2; i++) {
      await page.keyboard.press(tabChord(testInfo));
      const inside = await page.evaluate(() => !!document.activeElement?.closest("header"));
      expect(inside, `focus escaped the header after ${i + 1} Tab presses`).toBe(true);
    }
    for (let i = 0; i < focusableCount + 2; i++) {
      await page.keyboard.press(tabChord(testInfo, true));
      const inside = await page.evaluate(() => !!document.activeElement?.closest("header"));
      expect(inside, `focus escaped the header after ${i + 1} Shift+Tab presses`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    for (const selector of ["main", "footer", 'a[href="#contenido"]']) {
      await expect(page.locator(selector).first(), `${selector} no longer inert`).not.toHaveAttribute("inert", /.*/);
    }
  });

  test("opens by keyboard (Enter) and closes by keyboard", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("header button[aria-controls='menu-movil']");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("choosing a link closes the menu and lands on the section without the header covering it", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("header button[aria-controls='menu-movil']");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.locator("#menu-movil").getByRole("link", { name: "Escalas" }).click();
    await expect(page.locator("#menu-movil")).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/#escalas$/);
    await waitForScrollSettled(page);
    await expectHeadingClearOfHeader(page, "escalas");
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow, "body scroll lock released").not.toBe("hidden");
    await expect(page.locator("main"), "main live again after navigating").not.toHaveAttribute("inert", /.*/);
  });
});

test.describe("desktop navigation (1440x900)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const id of NAV_IDS) {
    test(`nav link #${id} lands clear of the header and becomes current`, async ({ page }) => {
      await page.goto("/");
      const link = page.locator(`nav[aria-label="Navegación principal"] a[href="#${id}"]`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await waitForScrollSettled(page);
      await expectHeadingClearOfHeader(page, id);
      await expect(link).toHaveAttribute("aria-current", "true");
      await expect(page.locator('nav[aria-label="Navegación principal"] a[aria-current="true"]')).toHaveCount(1);
    });
  }
});

test("skip link is the first tab stop and moves to #contenido", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.keyboard.press(tabChord(testInfo));
  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box && box.y >= 0, "skip link visible on focus").toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
  await expect(page.locator("#contenido")).toHaveAttribute("tabindex", "-1");
  await page.keyboard.press(tabChord(testInfo));
  const insideMain = await page.evaluate(() => !!document.activeElement?.closest("#contenido"));
  expect(insideMain, "next Tab after the skip link lands inside <main>").toBe(true);
});

test.describe("scale tabs", () => {
  test("tablist semantics and keyboard pattern", async ({ page }) => {
    await page.goto("/");
    const tablist = page.getByRole("tablist", { name: "Escalas de lectura del territorio" });
    await expect(tablist).toHaveCount(1);
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(3);
    const m1 = page.locator("#escala-tab-m1");
    const m2 = page.locator("#escala-tab-m2");
    const m3 = page.locator("#escala-tab-m3");

    await m1.click();
    await expect(m1).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#escala-panel-m1")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(m2).toHaveAttribute("aria-selected", "true");
    await expect(m1).toHaveAttribute("aria-selected", "false");
    await expect(m2).toBeFocused();
    await expect(page.locator("#escala-panel-m2")).toBeVisible();
    await expect(page.locator("#escala-panel-m1")).toBeHidden();

    await page.keyboard.press("End");
    await expect(m3).toHaveAttribute("aria-selected", "true");
    await expect(m3).toBeFocused();
    await expect(page.locator("#escala-panel-m3")).toBeVisible();

    await page.keyboard.press("Home");
    await expect(m1).toHaveAttribute("aria-selected", "true");
    await expect(m1).toBeFocused();
    await expect(page.locator("#escala-panel-m1")).toBeVisible();
  });

  test("clicking M3 shows its panel; visual container exists", async ({ page }) => {
    await page.goto("/");
    await page.locator("#escala-tab-m3").click();
    await expect(page.locator("#escala-tab-m3")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#escala-panel-m3")).toBeVisible();
    await expect(page.locator("#escala-panel-m1")).toBeHidden();
    await expect(page.locator("#escalas [data-visual]")).toHaveCount(1);
  });
});

test("header switches from transparent to solid after scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const backdrop = page.locator("header > div[aria-hidden='true']").first();
  const alpha = async () =>
    backdrop.evaluate((el) => {
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? [];
      return m.length === 4 ? Number(m[3]) : 1;
    });
  await expect.poll(alpha).toBe(0);
  await page.mouse.move(640, 450);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(400);
  await expect.poll(alpha, { message: "header background alpha after 400px scroll" }).toBeGreaterThan(0.9);
  await expect(page.locator("header")).not.toHaveClass(/on-dark/);
  await page.mouse.wheel(0, -1000);
  await expect.poll(alpha).toBe(0);
  await expect(page.locator("header")).toHaveClass(/on-dark/);
});

for (const height of [900, 700, 560]) {
  test(`hero CTA is not overlapped at 1280x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height });
    await page.goto("/");
    const cta = page.locator("#inicio").getByRole("link", { name: "Abrir plataforma" });
    await expect(cta).toBeVisible();
    const inViewportAtLoad = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 72 && r.bottom <= window.innerHeight;
    });
    test.info().annotations.push({ type: "cta-in-first-viewport", description: String(inViewportAtLoad) });
    await cta.scrollIntoViewIfNeeded();
    await waitForScrollSettled(page);
    const hit = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return {
        resolvesToLink: top !== null && (top === el || el.contains(top)),
        what: top ? `${top.tagName.toLowerCase()}.${String(top.className).slice(0, 40)}` : null,
        underHeader: r.top < 72,
      };
    });
    expect(hit.resolvesToLink, `element at CTA centre: ${hit.what}`).toBe(true);
    // Playwright's own actionability check (visible, stable, receives events at the click point).
    await cta.click({ trial: true });
  });
}
