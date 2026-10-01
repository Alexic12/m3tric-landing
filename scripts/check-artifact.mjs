// Scans out/ for forbidden content and required files (fail-closed).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { ROOT, loadReleaseEnv } from "./lib/release-config.mjs";

const OUT = join(ROOT, "out");
const env = loadReleaseEnv();
const get = (key) => (env[key] ?? "").trim();
const siteUrl = get("NEXT_PUBLIC_SITE_URL");
const platformUrl = get("NEXT_PUBLIC_PLATFORM_URL");
const email = get("NEXT_PUBLIC_CONTACT_EMAIL");

const problems = [];

if (!existsSync(OUT)) {
  console.error("check:artifact FALLÓ / FAILED\n  - out/ no existe / does not exist (run next build)");
  process.exit(1);
}

const REQUIRED = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "og.png",
  "icon.svg",
  "apple-icon.png",
  "icon-192.png",
  "icon-512.png",
];
for (const file of REQUIRED) {
  if (!existsSync(join(OUT, file))) problems.push(`falta archivo / missing file: out/${file}`);
}

// Content words are scanned in markup/text only. JS and CSS are framework output: they legitimately
// contain "placeholder" (::placeholder) and a bare "localhost" (URL parser polyfill), so there we only
// look for real dev URLs: http(s)://localhost, localhost:PORT, loopback/any-address IPs and example.com.
// TODO is matched case-sensitively and with Unicode letter boundaries: JS \b treats accented
// letters as non-word, so /\bTODO\b/i falsely matched Spanish "método".
const STRICT = [
  /localhost/i,
  /127\.0\.0\.1/,
  /0\.0\.0\.0/,
  /\[::1\]/,
  /example\.com/i,
  /(?<!\p{L})TODO(?!\p{L})/u,
  /lorem/i,
  /placeholder/i,
];
const HOSTS = [/https?:\/\/localhost/i, /localhost:\d+/i, /127\.0\.0\.1/, /0\.0\.0\.0/, /\[::1\]/, /example\.com/i];
const STRICT_EXT = new Set([".html", ".txt", ".xml", ".json", ".svg", ".webmanifest"]);
const HOSTS_EXT = new Set([".js", ".mjs", ".css", ".map"]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

for (const file of walk(OUT)) {
  const ext = extname(file).toLowerCase();
  const rules = HOSTS_EXT.has(ext) ? HOSTS : STRICT_EXT.has(ext) ? STRICT : null;
  if (!rules) continue;
  const text = readFileSync(file, "utf8");
  for (const rule of rules) {
    if (rule.test(text)) problems.push(`texto prohibido / forbidden text ${rule} en / in out/${relative(OUT, file)}`);
  }
}

for (const file of ["sitemap.xml", "robots.txt"]) {
  const path = join(OUT, file);
  if (existsSync(path) && !readFileSync(path, "utf8").includes(siteUrl || "\u0000")) {
    problems.push(`${file} no contiene SITE_URL / does not contain SITE_URL (${siteUrl || "unset"})`);
  }
}

// The built page must carry exactly the configured values (React escapes & " ' in attribute values).
const escapeAttr = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const indexPath = join(OUT, "index.html");
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, "utf8");
  if (!platformUrl || !html.includes(`href="${escapeAttr(platformUrl)}"`))
    problems.push(`index.html no enlaza la PLATFORM_URL exacta / does not link the exact PLATFORM_URL (${platformUrl || "unset"})`);
  if (email && !html.includes(`href="mailto:${escapeAttr(email)}?subject=`))
    problems.push(`index.html no contiene el mailto exacto / does not contain the exact mailto (${email})`);
  if (!/\/og\.png/.test(html)) problems.push("index.html no referencia /og.png / does not reference /og.png");

  const referenced = new Set(html.match(/\/images\/[\w./-]+\.(?:webp|png|jpe?g|svg|avif)/g) ?? []);
  if (referenced.size === 0) problems.push("index.html no referencia ninguna imagen de /images / references no /images asset");
  for (const asset of referenced) {
    if (!existsSync(join(OUT, asset))) problems.push(`imagen referenciada inexistente / referenced image missing: out${asset}`);
  }
}

if (problems.length > 0) {
  console.error("check:artifact FALLÓ / FAILED");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("check:artifact OK");
