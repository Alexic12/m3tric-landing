// Shared by check-config.mjs and check-artifact.mjs: one env loader and one set of release rules.
// Plain node (no TypeScript toolchain), so src/config/site.ts mirrors the email rule on purpose.
import { resolve } from "node:path";
import nextEnv from "@next/env"; // CJS package: named imports are not detected by node

const { loadEnvConfig } = nextEnv;

export const ROOT = resolve(import.meta.dirname, "..", "..");

/**
 * Loads env files exactly like `next build` (production mode): process.env wins, then
 * .env.production.local, .env.local, .env.production, .env. Returns the merged environment.
 */
export function loadReleaseEnv(dir = ROOT) {
  const { combinedEnv } = loadEnvConfig(dir, false, { info: () => {}, error: console.error });
  return combinedEnv;
}

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
// Reserved / non-routable names and example domains (RFC 2606, RFC 6761, mDNS, corporate split-horizon).
const BLOCKED_HOST = /(^|\.)(localhost|local|internal|example|test|invalid)$|(^|\.)example\.(com|org|net)$/i;
const BLOCKED_MAIL_DOMAIN = /(^|\.)(localhost|local|internal|example|test|invalid)$|(^|\.)example\.(com|org|net)$|^test\./i;
export const STRICT_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const E164 = /^\+[1-9]\d{7,14}$/;

/** Returns why a hostname cannot be a production host, or null when acceptable. */
function hostProblem(hostname) {
  if (hostname.startsWith("[")) return "IP literal";
  if (IPV4.test(hostname)) return "IP literal";
  if (hostname.endsWith(".")) return "trailing dot";
  if (BLOCKED_HOST.test(hostname)) return "reserved or example host";
  if (!hostname.includes(".")) return "single-label host";
  return null;
}

function checkUrl(name, value, { originOnly }) {
  if (!value) return [`${name}: falta / missing (obligatoria / required)`];
  let url;
  try {
    url = new URL(value);
  } catch {
    return [`${name}: no es una URL válida / not a valid URL ("${value}")`];
  }
  const problems = [];
  if (url.protocol !== "https:") problems.push(`${name}: debe usar https / must use https ("${value}")`);
  if (url.username || url.password)
    problems.push(`${name}: no admite usuario ni contraseña / userinfo not allowed ("${value}")`);
  const reason = hostProblem(url.hostname);
  if (reason) problems.push(`${name}: host no permitido en release / host not allowed: ${reason} ("${url.hostname}")`);
  if (originOnly && value !== url.origin)
    problems.push(
      `${name}: debe ser solo el origen (sin ruta, query, hash ni barra final) / must be the bare origin ${url.origin} ("${value}")`,
    );
  return problems;
}

/** Pure validation of the public release configuration. Returns a list of problems (empty = valid). */
export function validate(env) {
  const get = (key) => (env[key] ?? "").trim();
  const problems = [
    ...checkUrl("NEXT_PUBLIC_SITE_URL", get("NEXT_PUBLIC_SITE_URL"), { originOnly: true }),
    ...checkUrl("NEXT_PUBLIC_PLATFORM_URL", get("NEXT_PUBLIC_PLATFORM_URL"), { originOnly: false }),
  ];

  const email = get("NEXT_PUBLIC_CONTACT_EMAIL");
  if (!email) {
    problems.push("NEXT_PUBLIC_CONTACT_EMAIL: falta / missing (obligatoria / required)");
  } else if (!STRICT_EMAIL.test(email)) {
    problems.push(`NEXT_PUBLIC_CONTACT_EMAIL: correo inválido / invalid email ("${email}")`);
  } else if (BLOCKED_MAIL_DOMAIN.test(email.split("@")[1])) {
    problems.push(`NEXT_PUBLIC_CONTACT_EMAIL: dominio de ejemplo o prueba / example or test domain ("${email}")`);
  }

  const phone = get("NEXT_PUBLIC_CONTACT_PHONE");
  if (phone && !E164.test(phone)) {
    problems.push(`NEXT_PUBLIC_CONTACT_PHONE: debe ser E.164, p. ej. +573001234567 / must be E.164 ("${phone}")`);
  }
  return problems;
}
