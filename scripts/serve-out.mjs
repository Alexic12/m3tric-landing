// Zero-dependency static server for out/ (used by tests and local preview).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "out");
const PORT = Number(process.env.PORT ?? 4173);
// Loopback only: this server is for local preview and tests, never to be reachable from the network.
const HOST = "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

async function resolveFile(pathname) {
  // Throws URIError on malformed escapes; the request handler answers 400.
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const candidates = pathname.endsWith("/") || clean === ""
    ? [join(ROOT, clean, "index.html")]
    : [join(ROOT, clean), join(ROOT, `${clean}.html`)];
  for (const file of candidates) {
    if (file !== ROOT && !file.startsWith(ROOT + sep)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url ?? "/", `http://${HOST}`);
    const file = await resolveFile(pathname);
    const target = file ?? join(ROOT, "404.html");
    const body = await readFile(target);
    res.writeHead(file ? 200 : 404, {
      "Content-Type": TYPES[extname(target).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": body.length,
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    const malformed = error instanceof URIError || error?.code === "ERR_INVALID_URL";
    res.writeHead(malformed ? 400 : 500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(malformed ? "Bad request" : "Internal error");
  }
});

server.listen(PORT, HOST, () => console.log(`Serving out/ at http://${HOST}:${PORT}`));
