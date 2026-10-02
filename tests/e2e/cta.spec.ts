import { expect, test, type Locator } from "@playwright/test";
import { EMAIL, PHONE, PHONE_DISPLAY, PLATFORM_URL } from "../helpers/env";
import { waitForScrollSettled } from "../helpers/page";

/** True when the element paints its own (non-transparent) background: a filled button, as opposed to a text link or ghost. */
async function isFilled(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? [];
    return m.length < 4 || Number(m[3]) > 0.5;
  });
}

test.describe("CTA hierarchy: 'Contacto' in the nav, 'Abrir plataforma' as the call to action", () => {
  test("no 'Hablar con el equipo' button anywhere on the page (owner decision 2026-10-01)", async ({ page }) => {
    await page.goto("/");
    // The nav link "Contacto" already leads to #contacto; the button duplicated it everywhere.
    await expect(page.getByRole("link", { name: /Hablar con el equipo/ })).toHaveCount(0);
    await expect(page.getByText(/Hablar con el equipo|¿Su caso es uno de estos\?/)).toHaveCount(0);
  });

  test("hero: 'Abrir plataforma' is the single, filled CTA", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("#inicio a").filter({ hasText: /Abrir plataforma/ });
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveAttribute("href", PLATFORM_URL);
    expect(await isFilled(links.first()), "the hero CTA is a filled button").toBe(true);
  });

  test("header (1440): only 'Contacto' leads to the contact section; 'Abrir plataforma' is the sole header CTA", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const header = page.locator("header");
    // Owner decision 2026-10-01: the "Hablar con el equipo" header button duplicated the
    // "Contacto" nav link, so the top bar keeps only the link.
    await expect(header.getByRole("link", { name: /Hablar/ })).toHaveCount(0);
    const contact = header.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Contacto" });
    await expect(contact).toBeVisible();
    await expect(contact).toHaveAttribute("href", "#contacto");
    const platform = header.getByRole("link", { name: "Abrir plataforma" }).first();
    await expect(platform).toBeVisible();
    await expect(platform).toHaveAttribute("href", PLATFORM_URL);
    expect(await isFilled(platform), "platform link stays a text link").toBe(false);
    const box = await platform.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("the nav link 'Contacto' lands on the contact heading", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Contacto" }).click();
    await expect(page).toHaveURL(/#contacto$/);
    await waitForScrollSettled(page);
    const box = await page.locator("#contacto-title").boundingBox();
    expect(box && box.y >= 72 && box.y + box.height <= 900, "contact h2 visible below the header").toBe(true);
  });

  test("contact: with a configured email the primary is 'Escribir al equipo' (mailto) and 'Abrir plataforma' is secondary", async ({
    page,
  }) => {
    await page.goto("/");
    const write = page.locator("#contacto").getByRole("link", { name: "Escribir al equipo" });
    const platform = page.locator("#contacto").getByRole("link", { name: "Abrir plataforma" });
    await expect(write).toHaveAttribute("href", new RegExp(`^mailto:${EMAIL.replace(".", "\\.")}\\?subject=`));
    await expect(platform).toHaveAttribute("href", PLATFORM_URL);
    expect(await isFilled(write)).toBe(true);
    expect(await isFilled(platform)).toBe(false);
    await expect(page.locator("#contacto").getByText("Los canales de contacto se publicarán")).toHaveCount(0);
  });

  test("the phone is shown formatted for reading while the tel: link stays E.164", async ({ page }) => {
    await page.goto("/");
    for (const scope of ["#contacto", "footer"]) {
      const tel = page.locator(`${scope} a[href^='tel:']`);
      await expect(tel, scope).toHaveCount(1);
      await expect(tel, scope).toHaveAttribute("href", `tel:${PHONE}`);
      await expect(tel, scope).toContainText(PHONE_DISPLAY);
      expect((await tel.textContent()) ?? "", `${scope} must not show the raw E.164`).not.toContain(PHONE);
    }
  });
});
