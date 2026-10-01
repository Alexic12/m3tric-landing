import type { Page, TestInfo } from "@playwright/test";

/** Scrolls the page in viewport-sized steps with the real wheel so reveals and lazy loaders fire. */
export async function scrollThrough(page: Page): Promise<void> {
  const viewportHeight = page.viewportSize()?.height ?? 900;
  const step = Math.round(viewportHeight * 0.7);
  let previous = -1;
  for (let i = 0; i < 80; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === previous) break;
    previous = y;
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(120);
  }
}

export async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => window.scrollY === 0);
}

export async function fontsReady(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** Waits for a programmatic/anchor scroll to stop moving (smooth scrolling included). */
export async function waitForScrollSettled(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let stable = 0;
        const tick = () => {
          const now = window.scrollY;
          stable = now === last ? stable + 1 : 0;
          last = now;
          if (stable >= 8) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

export function skipUnlessProject(testInfo: TestInfo, names: string[], reason: string): void {
  testInfo.skip(!names.includes(testInfo.project.name), reason);
}

/**
 * Keyboard chord that moves focus to the next/previous focusable element.
 * macOS WebKit (like Safari) skips links on a bare Tab unless "Press Tab to highlight each item"
 * is on; Alt+Tab is the documented way to tab through every control there.
 */
export function tabChord(testInfo: TestInfo, backwards = false): string {
  const alt = testInfo.project.name === "webkit" && process.platform === "darwin";
  return `${alt ? "Alt+" : ""}${backwards ? "Shift+" : ""}Tab`;
}

/** Normalised text of the h2 of every top-level section, in page order. */
export async function sectionTitles(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("main > section h2")).map((h) => (h.textContent ?? "").replace(/\s+/g, " ").trim()),
  );
}
