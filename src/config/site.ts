/**
 * Single reader of public configuration. Every access uses the literal
 * `process.env.NEXT_PUBLIC_X` form so Next.js inlines it at build time.
 *
 * Release validation lives in scripts/lib/release-config.mjs (plain node, no TS
 * toolchain), so its rules are intentionally mirrored here.
 */
const DEV_SITE_URL = "http://localhost:3000";
const DEV_PLATFORM_URL = "http://localhost:5173/login";

// Same rule as scripts/lib/release-config.mjs. A value that fails it never becomes a mailto: link.
const STRICT_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const rawEmail = clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
const email = rawEmail && STRICT_EMAIL.test(rawEmail) ? rawEmail : undefined;
const phone = clean(process.env.NEXT_PUBLIC_CONTACT_PHONE);

export interface SiteConfig {
  siteUrl: string;
  platformUrl: string;
  contact: { email?: string; phone?: string };
}

// The URL ternaries test the inlined literal directly, so in a release build the
// minifier folds them and the localhost dev fallbacks never reach the bundle
// (scripts/check-artifact.mjs fails the release if they do). A whitespace-only
// value is rejected by scripts/check-config.mjs before a release build runs.
export const siteConfig: SiteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.trim() : DEV_SITE_URL,
  platformUrl: process.env.NEXT_PUBLIC_PLATFORM_URL
    ? process.env.NEXT_PUBLIC_PLATFORM_URL.trim()
    : DEV_PLATFORM_URL,
  contact: { email, phone },
};

if (process.env.NODE_ENV === "development") {
  const problems: string[] = [];
  if (!clean(process.env.NEXT_PUBLIC_SITE_URL)) problems.push("NEXT_PUBLIC_SITE_URL (falta / missing)");
  if (!clean(process.env.NEXT_PUBLIC_PLATFORM_URL)) problems.push("NEXT_PUBLIC_PLATFORM_URL (falta / missing)");
  if (!rawEmail) problems.push("NEXT_PUBLIC_CONTACT_EMAIL (falta / missing)");
  else if (!email) problems.push("NEXT_PUBLIC_CONTACT_EMAIL (inválido, no se mostrará / invalid, will not render)");
  if (problems.length > 0) {
    console.warn(
      `[M3TRIC] Configuración pública incompleta; se usan valores de desarrollo y \`npm run release\` fallará / ` +
        `Incomplete public configuration; dev fallbacks in use and \`npm run release\` will fail: ${problems.join(", ")}. ` +
        "Ver / See .env.example.",
    );
  }
}

/** `email` already matches STRICT_EMAIL, so the address part is safe to keep raw. */
export function mailtoHref(subject: string): string | undefined {
  const { email: to } = siteConfig.contact;
  if (!to) return undefined;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}
