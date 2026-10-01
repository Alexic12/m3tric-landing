// Measurement-only static server: same as scripts/serve-out.mjs but with gzip and long-lived
// caching for hashed assets, to approximate CloudFront. Used for the "compressed" Lighthouse run.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..", "out");
const PORT = Number(process.env.PORT ?? 4174);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".xml", ".webmanifest"]);

async function find(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const list = pathname.endsWith("/") || clean === "" ? [join(ROOT, clean, "index.html")] : [join(ROOT, clean), join(ROOT, `${clean}.html`)];
  for (const f of list) {
    if (!f.startsWith(ROOT + sep)) continue;
    try { if ((await stat(f)).isFile()) return f; } catch { /* next */ }
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = await find(pathname);
  const target = file ?? join(ROOT, "404.html");
  let body = await readFile(target);
  const ext = extname(target);
  const headers = { "Content-Type": TYPES[ext] ?? "application/octet-stream" };
  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/images/")) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  if (COMPRESSIBLE.has(ext) && String(req.headers["accept-encoding"]).includes("gzip")) {
    body = gzipSync(body);
    headers["Content-Encoding"] = "gzip";
  }
  headers["Content-Length"] = body.length;
  res.writeHead(file ? 200 : 404, headers);
  res.end(body);
}).listen(PORT, () => console.log(`gzip server at http://localhost:${PORT}`));
