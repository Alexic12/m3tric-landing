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

test.describe("CTA hierarchy: talk to the team first, open the platform second", () => {
  test("hero: primary 'Hablar con el equipo' (filled, #contacto) comes before secondary 'Abrir plataforma' (ghost)", async ({
    page,
  }) => {
    await page.goto("/");
    const links = page.locator("#inicio a").filter({ hasText: /Hablar con el equipo|Abrir plataforma/ });
    await expect(links).toHaveCount(2);
    const primary = links.nth(0);
    const secondary = links.nth(1);
    await expect(primary).toHaveText("Hablar con el equipo");
    await expect(primary).toHaveAttribute("href", "#contacto");
    await expect(secondary).toHaveText("Abrir plataforma");
    await expect(secondary).toHaveAttribute("href", PLATFORM_URL);
    expect(await isFilled(primary), "primary is a filled button").toBe(true);
    expect(await isFilled(secondary), "secondary is not filled").toBe(false);
  });

  test("header (1440): 'Abrir plataforma' is a text link before the filled 'Hablar con el equipo' button", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const platform = page.locator("header").getByRole("link", { name: "Abrir plataforma" }).first();
    const team = page.locator("header").getByRole("link", { name: "Hablar con el equipo" }).first();
    await expect(platform).toBeVisible();
    await expect(team).toBeVisible();
    await expect(platform).toHaveAttribute("href", PLATFORM_URL);
    await expect(team).toHaveAttribute("href", "#contacto");
    expect(await isFilled(platform), "platform link has no fill").toBe(false);
    expect(await isFilled(team), "team button is filled").toBe(true);
    const [p, t] = await Promise.all([platform.boundingBox(), team.boundingBox()]);
    expect(p && t && p.x + p.width <= t.x, "text link sits left of the primary button").toBe(true);
    expect(t?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("after the use cases a full-width band repeats the primary CTA", async ({ page }) => {
    await page.goto("/");
    const band = page.locator("#casos").getByRole("link", { name: "Hablar con el equipo" });
    await expect(band).toHaveCount(1);
    await expect(band).toHaveAttribute("href", "#contacto");
    await expect(page.locator("#casos").getByText("¿Su caso es uno de estos? Hablemos.")).toBeVisible();
  });

  test("clicking a 'Hablar con el equipo' button lands on the contact heading", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#casos").getByRole("link", { name: "Hablar con el equipo" }).click();
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
