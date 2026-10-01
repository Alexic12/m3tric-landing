import { expect, test } from "@playwright/test";
import { tabChord } from "../helpers/page";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile menu dialog: opens, traps focus with real Tab presses, closes with Escape and restores focus", async ({ page }, testInfo) => {
  await page.goto("/");
  const toggle = page.locator("header button[aria-controls='menu-movil']");
  const panel = page.locator("#menu-movil");
  await expect(panel).toBeHidden();

  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toHaveAttribute("aria-modal", "true");
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("#menu-movil"))).toBe(true);
  await expect(page.locator("main")).toHaveAttribute("inert", "");

  const focusable = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>('header a[href], header button:not([disabled]), header [tabindex]:not([tabindex="-1"])')).filter(
        (el) => el.offsetParent !== null,
      ).length,
  );
  for (const backwards of [false, true]) {
    for (let i = 0; i < focusable + 2; i++) {
      await page.keyboard.press(tabChord(testInfo, backwards));
      const inside = await page.evaluate(() => !!document.activeElement?.closest("header"));
      expect(inside, `focus escaped the header after ${i + 1} ${backwards ? "Shift+" : ""}Tab presses`).toBe(true);
    }
  }

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert", /.*/);
});
