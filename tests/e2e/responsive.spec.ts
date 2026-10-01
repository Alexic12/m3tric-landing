import { expect, test } from "@playwright/test";
import { fontsReady, scrollThrough } from "../helpers/page";

const WIDTHS = [320, 360, 390, 768, 1024, 1280, 1440, 1920];

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await scrollThrough(page);
    await fontsReady(page);

    const metrics = await page.evaluate(() => {
      const root = document.documentElement;
      const vw = root.clientWidth;
      const selectorOf = (el: Element) => {
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node !== document.body && parts.length < 4) {
          const cls = typeof node.className === "string" ? node.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
          parts.unshift(node.tagName.toLowerCase() + (node.id ? `#${node.id}` : "") + (cls ? `.${cls}` : ""));
          node = node.parentElement;
        }
        return parts.join(" > ");
      };
      // An element that pokes out of the viewport only matters when no ancestor clips it.
      const clippedByAncestor = (el: Element) => {
        for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
          const style = getComputedStyle(p);
          if (/(hidden|clip|auto|scroll)/.test(style.overflowX) && p.getBoundingClientRect().right <= vw + 1) return true;
        }
        return false;
      };
      const offenders: Array<{ selector: string; right: number; clipped: boolean }> = [];
      for (const el of Array.from(document.body.querySelectorAll("*"))) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.right > vw + 1) offenders.push({ selector: selectorOf(el), right: Math.round(rect.right), clipped: clippedByAncestor(el) });
      }
      return { scrollWidth: root.scrollWidth, clientWidth: vw, offenders };
    });

    const real = metrics.offenders.filter((o) => !o.clipped);
    test.info().annotations.push({
      type: "clipped-offenders",
      description: `${metrics.offenders.length - real.length} decorative elements exceed the viewport but are clipped by an overflow ancestor`,
    });
    expect(metrics.scrollWidth, `scrollWidth ${metrics.scrollWidth} vs clientWidth ${metrics.clientWidth}`).toBeLessThanOrEqual(
      metrics.clientWidth,
    );
    expect(real.slice(0, 15), "unclipped elements wider than the viewport").toEqual([]);
  });
}
