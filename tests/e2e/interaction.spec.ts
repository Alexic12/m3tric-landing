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

test.describe("mobile CTA hierarchy (390x844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("header shows the compact primary 'Hablar'; the menu offers both CTAs and 'Hablar con el equipo' lands on #contacto", async ({
    page,
  }) => {
    await page.goto("/");
    const headerCta = page.locator("header").getByRole("link", { name: "Hablar con el equipo" }).first();
    await expect(headerCta).toBeVisible();
    await expect(headerCta).toHaveText("Hablar con el equipo"); // textContent keeps the visually hidden tail
    const visibleWidth = await headerCta.evaluate((el) => el.getBoundingClientRect().width);
    expect(visibleWidth, "compact: much narrower than the full label").toBeLessThan(120);
    await expect(page.locator("header nav[aria-label='Navegación principal']")).toBeHidden();
    await expect(page.locator("header").getByRole("link", { name: "Abrir plataforma" }).first()).toBeHidden();

    await page.locator("header button[aria-controls='menu-movil']").click();
    const menu = page.locator("#menu-movil");
    await expect(menu.getByRole("link", { name: "Hablar con el equipo" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Abrir plataforma" })).toBeVisible();
    await menu.getByRole("link", { name: "Hablar con el equipo" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#contacto$/);
    await waitForScrollSettled(page);
    await expectHeadingClearOfHeader(page, "contacto");
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
  for (const name of ["Hablar con el equipo", "Abrir plataforma"]) {
    test(`hero CTA "${name}" is not overlapped at 1280x${height}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height });
      await page.goto("/");
      const cta = page.locator("#inicio").getByRole("link", { name });
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
}

test.describe("FAQ accordion (native <details>)", () => {
  const items = (page: Page) => page.locator("#preguntas details");

  test("six questions; each summary wraps an h3 and offers a target of at least 44px", async ({ page }) => {
    await page.goto("/");
    await expect(items(page)).toHaveCount(6);
    await expect(page.locator("#preguntas summary > h3")).toHaveCount(6);
    await expect(page.getByRole("heading", { level: 3, name: "¿Qué necesito para empezar?" })).toHaveCount(1);
    const heights = await page.locator("#preguntas summary").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
  });

  test("the first answer starts open, the rest closed; a click opens and closes", async ({ page }) => {
    await page.goto("/");
    await expect(items(page).nth(0)).toHaveAttribute("open", "");
    await expect(items(page).nth(1)).not.toHaveAttribute("open", /.*/);
    const second = items(page).nth(1);
    const answer = second.locator("p");
    await expect(answer).toBeHidden();
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
    await expect(answer).toBeVisible();
    await expect(answer).toContainText("Mediciones de sensores en campo");
    await second.locator("summary").click();
    await expect(second).not.toHaveAttribute("open", /.*/);
    await expect(answer).toBeHidden();
  });

  test("keyboard: Enter and Space toggle a focused question and the focus ring is visible", async ({ page }) => {
    await page.goto("/");
    const third = items(page).nth(2);
    const summary = third.locator("summary");
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(third).toHaveAttribute("open", "");
    await page.keyboard.press("Space");
    await expect(third).not.toHaveAttribute("open", /.*/);
    await page.keyboard.press("Enter");
    await expect(third).toHaveAttribute("open", "");
    await expect(summary).toBeFocused();
    // :focus-visible after keyboard activation: a real outline, not the browser default being stripped.
    const outline = await summary.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThan(0);
  });

  test("the chevron rotates when a question opens (CSS only)", async ({ page }) => {
    await page.goto("/");
    const second = items(page).nth(1);
    const chevron = second.locator("summary svg");
    // Tailwind 4 drives rotation through the individual `rotate` property, not `transform`.
    const rotation = () =>
      chevron.evaluate((el) => {
        const value = getComputedStyle(el).rotate;
        return value === "none" ? 0 : Math.round(parseFloat(value));
      });
    await expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(Math.abs(await rotation())).toBe(0);
    await second.locator("summary").click();
    await expect.poll(async () => Math.abs(await rotation())).toBe(180);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("the accordion still opens and closes", async ({ page }) => {
      await page.goto("/");
      const fourth = items(page).nth(3);
      await expect(fourth.locator("p")).toBeHidden();
      await fourth.locator("summary").click();
      await expect(fourth.locator("p")).toBeVisible();
      await expect(fourth.locator("p")).toContainText("CSV");
    });
  });
});
