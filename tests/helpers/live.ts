import type { Page } from "@playwright/test";

/** Staging values of the live deployment (release deploy-2-19f4f15); override when testing another environment. */
export const LIVE_PLATFORM_URL = process.env.LIVE_PLATFORM_URL ?? "https://d3pz2gipvkcx1b.cloudfront.net/login";

export const PENDING_CHANNELS_TEXT = "Los canales de contacto se publicarán con el dominio oficial.";

/** The single warning the 3D stack is allowed to print (three.js Clock deprecation). */
export const KNOWN_WARNING = /THREE\.Clock.*deprecated|THREE\.THREE\.Clock/i;

/**
 * Warnings the browser itself prints, not the page:
 *  - Chrome's ANGLE/Metal advisory "GL Driver Message ... GPU stall due to ReadPixels" (performance hint from the GPU driver);
 *  - Firefox's "WebGL context was lost." when ScaleVisual's hasWebGL2() probe releases its throw-away context on purpose
 *    (the real scene context is created afterwards and the viewer ends in data-visual="3d").
 */
export const ENGINE_NOTICE = /GL Driver Message .*GPU stall due to ReadPixels|JavaScript Warning: "WebGL context was lost\."/;

export interface Telemetry {
  errors: string[];
  warnings: string[];
  responses: Array<{ url: string; status: number }>;
  failed: string[];
  requestOrigins: Set<string>;
}

/** Records console errors/warnings, page errors, every response and every failed request. Call before page.goto. */
export async function recordTelemetry(page: Page): Promise<Telemetry> {
  const t: Telemetry = { errors: [], warnings: [], responses: [], failed: [], requestOrigins: new Set() };
  page.on("console", (m) => {
    if (m.type() === "error") t.errors.push(m.text());
    if (m.type() === "warning") t.warnings.push(m.text());
  });
  page.on("pageerror", (e) => t.errors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => t.responses.push({ url: r.url(), status: r.status() }));
  page.on("requestfailed", (r) => t.failed.push(`${r.url()} ${r.failure()?.errorText ?? ""}`));
  page.on("request", (r) => {
    // data: and blob: never leave the browser; they are not a network origin.
    if (/^(data|blob):/.test(r.url())) return;
    t.requestOrigins.add(new URL(r.url()).origin);
  });
  // Registered before any page script runs so a violation during load is not missed.
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] };
    w.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      w.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI}`);
    });
  });
  return t;
}

export async function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
}
