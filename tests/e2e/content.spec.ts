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

  test("all nine sections exist with their anchor ids, in the v3 order", async ({ page }) => {
    for (const id of SECTION_IDS) {
      await expect(page.locator(`section#${id}`), `section#${id}`).toHaveCount(1);
    }
    const order = await page.evaluate(() => Array.from(document.querySelectorAll("main > section")).map((s) => s.id));
    expect(order).toEqual([...SECTION_IDS]);
  });

  test("value zone comes first: the technical zone sits after the FAQ and before the contact", async ({ page }) => {
    const y = (id: string) => page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const [beneficios, preguntas, tecnico, contacto] = await Promise.all(["beneficios", "preguntas", "tecnico", "contacto"].map(y));
    expect(beneficios).toBeLessThan(preguntas);
    expect(preguntas).toBeLessThan(tecnico);
    expect(tecnico).toBeLessThan(contacto);
  });

  test("hero states the outcomes: three of them, each with a label and one line", async ({ page }) => {
    const outcomes = page.locator("#inicio ul[aria-label='Lo que obtiene con M3TRIC'] > li");
    await expect(outcomes).toHaveCount(3);
    await expect(outcomes.nth(0)).toContainText("Avisos a tiempo");
    await expect(outcomes.nth(1)).toContainText("Un mapa claro de su terreno");
    await expect(outcomes.nth(2)).toContainText("Reportes para decidir");
  });

  test("benefits: three outcome cards, each with its deliverables and an honest status", async ({ page }) => {
    const cards = page.locator("#beneficios ul > li > [data-reveal] > div");
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0).locator("h3")).toHaveText("Vigilancia continua de su terreno");
    await expect(cards.nth(1).locator("h3")).toHaveText("Avisos cuando importa");
    await expect(cards.nth(2).locator("h3")).toHaveText("Reportes para decidir");
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).getByText("Lo que recibe"), `card ${i} deliverables label`).toHaveCount(1);
      await expect(cards.nth(i).getByText("Disponible", { exact: true })).toHaveCount(1);
    }
    await expect(cards.nth(2).locator("ul > li")).toHaveCount(5);
    await expect(page.locator("#beneficios").getByText("En evolución", { exact: true })).toHaveCount(1);
  });

  test("use cases: four cases, each split into the situation and what the user obtains", async ({ page }) => {
    const cases = page.locator("#casos ul > li");
    await expect(cases).toHaveCount(4);
    await expect(page.locator("#casos").getByText("La situación", { exact: true })).toHaveCount(4);
    await expect(page.locator("#casos").getByText("Lo que obtiene", { exact: true })).toHaveCount(4);
  });

  test("how it works: four ordered steps and the illustrative product view", async ({ page }) => {
    const steps = page.locator("#como-funciona ol > li");
    await expect(steps).toHaveCount(4);
    await expect(steps.locator("h3")).toHaveText(["Medimos", "Revisamos y organizamos", "Le avisamos", "Usted decide"]);
    await expect(page.locator("#como-funciona figure svg[role='img']")).toHaveCount(1);
    await expect(page.locator("#como-funciona figcaption")).toHaveText("Vista ilustrativa de la plataforma");
  });

  test("scale tabs carry the plain-language labels", async ({ page }) => {
    await expect(page.locator("#escala-tab-m1")).toHaveText("M1 · Punto");
    await expect(page.locator("#escala-tab-m2")).toHaveText("M2 · Zona");
    await expect(page.locator("#escala-tab-m3")).toHaveText("M3 · Territorio");
  });

  test("why M3TRIC: the three brand values", async ({ page }) => {
    await expect(page.locator("#por-que h3")).toHaveText(["Rigor técnico", "Precisión", "Confiabilidad"]);
  });

  test("technical zone: the three spec-sheet blocks with honest availability", async ({ page }) => {
    const zone = page.locator("#tecnico");
    await expect(zone.locator("h3")).toHaveText(["Capacidades", "Flujo de datos", "Tecnología y seguridad"]);
    await expect(zone.getByRole("heading", { level: 4 })).toHaveText(["Disponible hoy", "En evolución"]);
    await expect(zone.locator("ol > li")).toHaveCount(5);
    await expect(zone.getByText("PostGIS 3.4", { exact: true })).toBeVisible();
    for (const level of ["Atención", "Alerta", "Crítico"]) {
      await expect(zone.getByText(level, { exact: true })).toBeVisible();
    }
  });

  test("the value zone avoids unexplained jargon (spec section 2)", async ({ page }) => {
    const text = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#inicio, #beneficios, #casos, #como-funciona, #escalas, #por-que, #preguntas, #contacto"))
        .map((s) => s.textContent ?? "")
        .join(" "),
    );
    // Hero image alt aside, none of these terms may appear above the technical zone. "AWS" is allowed: the FAQ spells it out.
    for (const term of [/\bAPI\b/, /\bIoT\b/, /PostGIS/, /\bCDK\b/, /\bGIS\b/, /FastAPI/, /\bIA\b/, /tiempo real/i]) {
      expect(text, `jargon in the value zone: ${term}`).not.toMatch(term);
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
    expect(results.length).toBe(SECTION_IDS.length);
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

  test("JSON-LD parses; Organization and WebSite declare M3TRIC / Metric; FAQPage mirrors the visible FAQ", async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? "");
    const nodes: Array<Record<string, unknown>> = data["@graph"] ?? [data];
    expect(nodes.length).toBeGreaterThan(0);
    const identity = nodes.filter((n) => n["@type"] === "Organization" || n["@type"] === "WebSite");
    expect(identity.map((n) => n["@type"]).sort()).toEqual(["Organization", "WebSite"]);
    for (const node of identity) {
      expect(node.name).toBe("M3TRIC");
      expect(node.alternateName).toBe("Metric");
      expect(String(node.url).startsWith(SITE_URL)).toBe(true);
    }
    const faqNode = nodes.find((n) => n["@type"] === "FAQPage") as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
    expect(faqNode, "FAQPage node").toBeTruthy();
    const visible = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#preguntas details")).map((d) => ({
        question: (d.querySelector("summary h3")?.textContent ?? "").trim(),
        answer: (d.querySelector("p")?.textContent ?? "").trim(),
      })),
    );
    expect(faqNode.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }))).toEqual(visible);
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

test("header carries the EAFIT co-brand next to the M3TRIC logo (owner decision 2026-10-02)", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header");
  await expect(header.getByRole("img", { name: "Universidad EAFIT" })).toBeVisible();
  await expect(header.getByRole("img", { name: /M3TRIC/ }).first()).toBeVisible();
  // The co-brand is a mark, not a link: it must not point anywhere.
  await expect(header.getByRole("link", { name: /Universidad EAFIT/ })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(400);
  await expect(header.getByRole("img", { name: "Universidad EAFIT" })).toBeVisible();
});

