import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { EMAIL, PHONE, PLATFORM_URL, SITE_URL } from "../helpers/env";

interface LinkInfo {
  name: string;
  href: string;
  target: string | null;
  rel: string | null;
  hiddenInDom: boolean;
  where: string;
}

const MATRIX_PATH = join(__dirname, "..", "..", "docs", "evidence", "link-matrix.md");

test("link matrix (EV-06)", async ({ page }, testInfo) => {
  await page.goto("/");
  const { links, ids } = await page.evaluate(() => {
    const nameOf = (a: HTMLAnchorElement) =>
      (
        a.getAttribute("aria-label") ||
        a.textContent?.trim() ||
        a.querySelector("[aria-label]")?.getAttribute("aria-label") ||
        a.querySelector("title")?.textContent?.trim() ||
        a.querySelector("img")?.getAttribute("alt") ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim();
    const where = (a: Element) =>
      a.closest("header")
        ? a.closest("#menu-movil")
          ? "header (menú móvil)"
          : "header"
        : a.closest("footer")
          ? "footer"
          : (a.closest("section")?.id ?? "main");
    const links = Array.from(document.querySelectorAll("a")).map((a) => ({
      name: nameOf(a),
      href: a.getAttribute("href") ?? "",
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel"),
      hiddenInDom: a.closest("[hidden]") !== null,
      where: where(a),
    }));
    return { links, ids: Array.from(document.querySelectorAll("[id]")).map((e) => e.id) };
  });

  expect(links.length).toBeGreaterThan(10);
  const rows: Array<{ link: LinkInfo; type: string; problems: string[] }> = [];

  for (const link of links as LinkInfo[]) {
    const problems: string[] = [];
    let type = "other";
    const { href, name } = link;

    if (href === "" || href === "#") problems.push("empty or bare '#' href");

    if (href.startsWith("#") && href.length > 1) {
      type = "anchor";
      if (!ids.includes(href.slice(1))) problems.push(`no element with id "${href.slice(1)}"`);
    } else if (href.startsWith("mailto:")) {
      type = "mailto";
      const [addr, query = ""] = href.slice("mailto:".length).split("?");
      if (addr !== EMAIL) problems.push(`address ${addr} != ${EMAIL}`);
      const subject = new URLSearchParams(query).get("subject") ?? "";
      if (subject.length === 0) problems.push("missing subject");
    } else if (href.startsWith("tel:")) {
      type = "tel";
      if (href !== `tel:${PHONE}`) problems.push(`${href} != tel:${PHONE}`);
    } else if (/^https?:\/\//.test(href) || href.startsWith("/")) {
      type = /^https?:\/\//.test(href) && !href.startsWith(SITE_URL) ? "external" : "internal";
    }

    const isPlatformCta = /abrir plataforma/i.test(name);
    const isPlatformNamed = /plataforma/i.test(name);
    if (isPlatformCta || isPlatformNamed) {
      type = "platform-cta";
      if (href !== PLATFORM_URL) problems.push(`platform link ${href} != ${PLATFORM_URL}`);
    }

    if (link.target === "_blank" && !(link.rel ?? "").includes("noopener")) {
      problems.push(`target=_blank without rel=noopener (rel=${link.rel})`);
    }
    rows.push({ link, type, problems });
  }

  if (testInfo.project.name === "chromium") {
    const md = [
      "# Matriz de enlaces (EV-06)",
      "",
      `Generada por \`tests/e2e/links.spec.ts\` (proyecto chromium, 2026-09-30) contra \`out/\` construido con SITE_URL=${SITE_URL}, PLATFORM_URL=${PLATFORM_URL}, EMAIL=${EMAIL}, PHONE=${PHONE}.`,
      "",
      `Total de enlaces \`<a>\`: ${rows.length} · Con problemas: ${rows.filter((r) => r.problems.length).length}`,
      "",
      "| # | Ubicación | Texto accesible | href | Tipo | Resultado |",
      "|---|---|---|---|---|---|",
      ...rows.map(
        (r, i) =>
          `| ${i + 1} | ${r.link.where} | ${r.link.name.replace(/\|/g, "\\|") || "(vacío)"} | \`${r.link.href}\` | ${r.type}${
            r.link.target ? ` (target=${r.link.target}, rel=${r.link.rel})` : ""
          } | ${r.problems.length ? `FAIL: ${r.problems.join("; ")}` : "PASS"} |`,
      ),
      "",
    ].join("\n");
    writeFileSync(MATRIX_PATH, md);
  }

  expect(rows.filter((r) => r.type === "platform-cta").length, "platform CTAs found").toBeGreaterThanOrEqual(3);
  expect(rows.filter((r) => r.type === "mailto").length, "mailto links found").toBeGreaterThanOrEqual(1);
  expect(rows.filter((r) => r.type === "tel").length, "tel links found").toBeGreaterThanOrEqual(1);
  const failing = rows.filter((r) => r.problems.length).map((r) => `${r.link.name} -> ${r.link.href}: ${r.problems.join("; ")}`);
  expect(failing).toEqual([]);
});

test("external links that open a new tab carry rel=noopener; cross-origin links are listed", async ({ page }) => {
  await page.goto("/");
  const external = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href^='http']"))
      .filter((a) => a.origin !== location.origin)
      .map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
  );
  for (const a of external.filter((x) => x.target === "_blank")) {
    expect(a.rel, a.href).toContain("noopener");
  }
  test.info().annotations.push({
    type: "cross-origin-links",
    description: JSON.stringify(external.map((e) => ({ href: e.href, target: e.target || null, rel: e.rel || null }))),
  });
});
