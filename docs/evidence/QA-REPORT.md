# Informe QA — M3TRIC landing v3 (WU-R5: QA en vivo + evidencia)

Fecha: 2026-10-01 · Rama `docs/v3-traceability` · Sin commit. Release en vivo bajo prueba: **`deploy-2-19f4f15`** (commit `19f4f15890b2…`, perfil staging).

## 1. Entorno

| Elemento | Valor |
|---|---|
| SO / Node | macOS 27.0 (Darwin 27.0.0), Node v25.6.0 |
| Playwright | 1.63.0 · `@axe-core/playwright` 4.13.0 · Lighthouse 12.8.2 (`npx lighthouse@12`, Chrome headless 154) |
| Navegadores | Chromium 153.0.8010.12 · Chrome (canal) 154 · Firefox 155.0 · WebKit 26.6 · Edge: no instalado |
| Artefacto local | `out/` del script `build:e2e` (perfil **production** con valores falsos: `m3tric-test.co`, correo y teléfono ficticios) servido en `127.0.0.1:4173` |
| Sitio en vivo | `https://d21guxd9tjai7a.cloudfront.net` (CloudFront, HTTP/2 + h3 anunciado, brotli; perfil **staging**: `noindex, nofollow`, sin correo/teléfono, plataforma `https://d3pz2gipvkcx1b.cloudfront.net/login`) |

## 2. Cómo reproducir

```bash
npm run test:unit                 # node:test (scripts/**)
npm run test:e2e                  # build:e2e + playwright (4 proyectos) + capturas WebP
npm run evidence:contrast         # con `npm run serve:out` en :4173 -> contrast-hero.md
node tests/helpers/serve-gzip.mjs & npm run evidence:lighthouse   # Lighthouse local (servidor gzip :4174)
npm run test:live                 # suite en vivo (playwright.live.config.ts; LIVE_URL opcional) + capturas WebP en live/screenshots
npm run evidence:live-lighthouse  # Lighthouse 12 móvil y escritorio x3 contra la URL en vivo -> docs/evidence/live
cd infra && npm test              # propiedad de otro lote
```

## 3. Suite local (`npm run test:e2e`) — resultados por proyecto

Corrida final: **323 passed, 0 failed, 0 flaky, 21 skipped** (344 tests; `retries: 0`). Repetida una segunda vez sin tocar nada: idéntica (323/0/0/21). Pass / fail / skip:

| Spec | chromium | firefox | webkit | chrome |
|---|---|---|---|---|
| content (+404) | 22/0/0 | 22/0/0 | 22/0/0 | 22/0/0 |
| cta | 6/0/0 | 6/0/0 | 6/0/0 | 6/0/0 |
| links | 2/0/0 | 2/0/0 | 2/0/0 | 2/0/0 |
| responsive (8 anchos) | 8/0/0 | 8/0/0 | 8/0/0 | 8/0/0 |
| visual (4 anchos; snapshots solo chromium) | 4/0/0 | 4/0/0 | 4/0/0 | 4/0/0 |
| interaction | 26/0/0 | 26/0/0 | 26/0/0 | 26/0/0 |
| resilience | 9/0/0 | 9/0/0 | 9/0/0 | 9/0/0 |
| a11y | 5/0/0 | 2/0/3 | 2/0/3 | 2/0/3 |
| three | 4/0/0 | 0/0/4 | 0/0/4 | 0/0/4 |
| **Total** | **86/0/0** | **79/0/7** | **79/0/7** | **79/0/7** |

Skips intencionales: axe y 3D solo en chromium.

| Otras suites | Resultado |
|---|---|
| `npm run test:unit` | **117 pass / 0 fail** (12 suites) |
| `cd infra && npm test` (solo lectura; **otro lote edita `infra/**` en paralelo**) | 45 pass / **16 fail** de 61 en 4 archivos al momento de la corrida: las expectativas (versión de bootstrap CDK, tabla de supresiones cdk-nag, outputs, rol de CloudFormation) no coinciden con el árbol de `infra/` a medio editar. No es un resultado de este lote; debe volver a correrse cuando termine ese lote |

## 4. Suite en vivo (`npm run test:live`) — release `deploy-2-19f4f15`

Corrida final: **41 passed, 0 failed, 0 flaky, 16 skipped** en chromium, firefox y webkit. Ejecutada **dos veces consecutivas** con el mismo resultado (41/0/0/16). Skips intencionales: axe y HTTP solo en chromium (independientes del motor). Sin `force`; todos los gestos son reales.

| Spec (tests/live) | Qué verifica | chromium | firefox | webkit |
|---|---|---|---|---|
| runtime · recorrido completo | Toda respuesta de la página y subrecursos es 200/304 y del mismo origen (`page.on('response')`); 0 orígenes de terceros; 0 `requestfailed`; 0 errores de consola; 0 eventos `securitypolicyviolation` (listener vía `addInitScript` antes de cargar); scroll completo + `#escalas` + cambio de pestañas M2/M3. Chromium: `[data-visual="3d"]` visible y 1 `<canvas>`; firefox/webkit: `3d` o `fallback` (ambos terminaron en `3d`) | ✔ | ✔ | ✔ |
| runtime · estructura | `main > section[id]` = inicio, beneficios, casos, como-funciona, escalas, por-que, preguntas, tecnico, contacto (en orden); un `h1`; `meta robots` = `noindex, nofollow`; cabecera `X-Robots-Tag` noindex+nofollow; meta `m3tric:release` presente | ✔ | ✔ | ✔ |
| runtime · CTAs de staging | Todos los "Abrir plataforma" (≥ 3) = URL de plataforma; 0 `mailto:`/`tel:`; texto `pendingChannels` visible en `#contacto` | ✔ | ✔ | ✔ |
| runtime · desbordamiento | Sin scroll horizontal a 360, 390, 768, 1280, 1920 | 5/5 | 5/5 | 5/5 |
| menu | Diálogo móvil (390 px): abre con clic, `role=dialog` + `aria-modal`, `main` `inert`, trampa de foco con Tab / Shift+Tab reales (WebKit con `tabChord`), Escape cierra y devuelve el foco al botón | ✔ | ✔ | ✔ |
| a11y | axe (wcag2a/aa, 21a/aa) a 1280 y 390: **0 violaciones** (0 serious/critical) | ✔ | — | — |
| screenshots | Página completa a 360 y 1280 en los 3 motores → `live/screenshots/*.webp` (6 archivos, **2.6 MB**, < 8 MB) | ✔ | ✔ | ✔ |
| http | Cabeceras de seguridad (CSP, HSTS, nosniff, XFO DENY, Referrer-Policy, Permissions-Policy, X-Robots-Tag) en `/`, en una respuesta 404 y en un asset `_next/static` (este además `max-age=31536000, immutable`); `/no-existe-*` → 404 con el cuerpo idéntico a `/404.html` ("Esta página no existe"); respuesta comprimida (`br`/`gzip`); `http://` → **301** a `https://<mismo host>/`; `/_deploy/manifest.json` `releaseId` = meta `m3tric:release`, perfil staging | 6/6 | — | — |

Advertencias de consola aceptadas (solo avisos, nunca errores), documentadas en `tests/helpers/live.ts`:
- `THREE.Clock … deprecated` (la ya aceptada; aparece en firefox y webkit, no en chromium).
- Chrome: `GL Driver Message … GPU stall due to ReadPixels` — aviso de rendimiento del driver ANGLE/Metal emitido por el navegador, no por el código de la página.
- Firefox: `WebGL context was lost.` — Firefox lo imprime cuando `ScaleVisual.hasWebGL2()` libera a propósito su contexto de sondeo (`WEBGL_lose_context`); el contexto real de r3f se crea después y el visor termina en `data-visual="3d"` con 1 canvas (verificado con un script aparte).

Datos de axe en vivo (`live/axe-*.json`): 1280 → 0 violaciones, 1 regla incompleta (`color-contrast`, 64 nodos), 30 reglas pasadas; 390 → 0 violaciones, `color-contrast` incompleta (56 nodos), 30 pasadas. Igual que en local, el contraste sobre fotografía se verifica con medición directa (§7).

## 5. Lighthouse en vivo (EV-09, ADR-005) — CloudFront, Lighthouse 12.8.2, 3 corridas por factor

Informe de la **corrida mediana** (ordenada por Perf y luego LCP). Todas las corridas: `live/lighthouse-{mobile,desktop}-run{1,2,3}.report.json`; HTML solo de la corrida 1 de cada factor (la mediana de escritorio es la run1; la mediana móvil, run3, se conserva en JSON para limitar el peso); resumen máquina-legible en `live/lighthouse-live-summary.json`.

| Factor | Corrida mediana | Perf | A11y | BP | SEO | LCP | FCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| **Móvil** (default, 4G simulado, CPU ×4) | run 3 de 3 | **100** | **100** | **100** | 69 (*) | **1.52 s** | 0.97 s | 0 | 5 ms |
| **Escritorio** (`--preset=desktop`) | run 1 de 3 | **100** | **100** | **100** | 69 (*) | **0.35 s** | 0.28 s | 0 | 0 ms |

Dispersión entre corridas: móvil LCP 1.520 / 1.522 / 1.523 s, escritorio 0.344 / 0.351 / 0.352 s; Perf 100 en las 6. Sin variación apreciable.

**Presupuestos §8 (móvil, en vivo): todos cumplen.** Perf ≥ 90 → 100 · A11y/BP ≥ 95 → 100 · **LCP ≤ 2.5 s → 1.52 s (cumple, margen de ~1 s)** · CLS ≤ 0.05 → 0 · TBT ≤ 200 ms → 5 ms · Peso transferido 358 KB (móvil). Protocolo de red de todos los recursos: `h2`.

(*) **SEO 69 es esperado y no se corrige**: la única auditoría fallida de la categoría es `is-crawlable` ("Page is blocked from indexing"), causada por `noindex, nofollow` + `X-Robots-Tag` del perfil staging (ADR-004). En producción debe volver a 100; hay que repetir esta medición tras el cambio de perfil. Las demás auditorías SEO pasan.

**Cierre de D-1 (LCP móvil).** En local con servidor gzip (HTTP/1.1, 6 conexiones, sin HTTP/2 ni brotli) el LCP móvil era 2.9 s; en CloudFront (HTTP/2 + brotli + h3 anunciado) es 1.52 s. Confirma la hipótesis de ADR-005: la medición local no era representativa y el presupuesto se cumple en el entorno real. No se aplicó ningún recorte de fuentes/contenido.

## 6. Lighthouse local (servidor gzip `:4174`, build e2e) — referencia, no presupuestos

| Corrida | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Móvil, gzip local | 95 | 100 | 100 | 100 | 2.93 s | 0 | 9 ms |
| Escritorio, gzip local | 100 | 100 | 100 | 100 | 0.79 s | 0 | 0 ms |

Reportes: `lighthouse-{mobile,desktop}-gzip.report.{html,json}` (sobrescritos). Aquí SEO = 100 porque el build e2e es de perfil production (indexable). Por ADR-005 el LCP ≤ 2.5 s se juzga con §5, no con esta tabla.

## 7. Contraste sobre fotografía (D5) y axe local

`npm run evidence:contrast` regenerado con el copy v3 (hero «Entender el territorio / para anticipar el riesgo.», contacto, tarjeta de casos de uso; 1280 y 390): **45 filas, 0 incumplimientos**. Peores márgenes: lead del hero a 390 px **4.53:1 vs 4.5** (margen 0.03, el más justo; cualquier cambio de foto, velo o tamaño obliga a repetir la medición), h1 línea 2 (Light, texto grande) 3.83:1 a 390 y 3.95:1 a 1280 vs 3.0, kicker 5.17:1 a 390. Nota: el contacto se midió en el build e2e (con correo y teléfono); en staging esa zona muestra el texto de canales pendientes, con el mismo color y fondo.

axe local (chromium; `axe-1280.json`, `axe-390.json`, `axe-390-menu-open.json`): 0 violaciones serious/critical en los 3 escenarios (las pruebas pasaron). `link-matrix.md`: 37 enlaces, 0 con problemas (el spec escribe la fecha fija "2026-09-30" en el encabezado; el contenido sí se regeneró hoy).

## 8. Evidencia de despliegue y rollback (GitHub Actions + manifiesto en vivo)

Verificado con `gh run view <id> --repo Alexic12/m3tric-landing --json conclusion,headSha,displayTitle` y con los logs de cada job:

| Paso | Run | Workflow | Conclusión | headSha | Release publicada | Smoke |
|---|---|---|---|---|---|---|
| Deploy inicial (push a main, "Merge PR #1") | 36869421270 | Deploy staging | success | `19f4f15` | `deploy-1-19f4f15` | 10 passed, 0 skipped |
| Rollback manual | 36870809775 | Rollback staging | success | `19f4f15` (dispatch) | `rollback-36870809775-f4bdc1c` | 10 passed, 0 skipped |
| Restauración (deploy manual) | 36871068392 | Deploy staging | success | `19f4f15` | `deploy-2-19f4f15` | 10 passed, 0 skipped |

El deploy inicial y el de restauración incluyen CI completa en verde (Hygiene, Infra CDK, Release gate staging y production, E2E chromium/firefox/webkit) y `CDK deploy`. El smoke incluye el GET directo al bucket S3 → 403 (los 10 checks, 0 omitidos).

`GET /_deploy/manifest.json` (en vivo, 2026-10-01): `releaseId: deploy-2-19f4f15`, `runId: 36871068392`, `commit: 19f4f15890b21923f26e49ca628826a4a1071eeb`, `profile: staging`, `siteUrl: https://d21guxd9tjai7a.cloudfront.net`, distribución `E1J2L9XZIAGQ7M`, 66 archivos con sha256, `smoke.passed: true`. Coincide con la meta `m3tric:release` de la página (la suite en vivo lo comprueba). El ciclo deploy → rollback → restore queda demostrado (REQ-A12). La referencia `f4bdc1c` del rollback se toma del identificador de release del propio run; el sha completo no se re-verificó.

## 9. Defectos

| ID | Severidad | Hallazgo | Estado |
|---|---|---|---|
| D-1 | Media | LCP móvil sobre presupuesto en local (2.9 s) | **Cerrado**: en CloudFront el LCP móvil es 1.52 s (§5) |
| D-2 | Baja | Imagen hero de 1920 px pesa 205 KB | Informativo; el presupuesto es a 1280 px |
| D-3 | Baja | Asunto del `mailto` ("Contacto desde el sitio M3TRIC") difiere de §5.9 | Abierto (decisión de redacción); sin impacto en staging, que no tiene correo |
| D-4 | Baja | "Abrir plataforma" sin `rel` | Cerrado (v2) |
| D-5 | Info | axe deja `color-contrast` incompleto sobre fotografía | Cerrado con medición directa (§7) |
| D-6 | Baja (pruebas) | `tests/e2e/three.spec.ts › console is clean…` es sensible al ruido del navegador: Chrome emite `GL Driver Message … GPU stall due to ReadPixels` (aviso del driver) y el test solo admite `THREE.Clock`. Fallo reproducido al correr ese spec **solo**, y siempre antes de filtrar en la suite en vivo; no apareció en dos corridas completas. No es un defecto de la app | **Abierto**: `tests/e2e/` fuera del alcance de este lote. Propuesta: aceptar ese mensaje en `three.spec.ts` igual que `tests/helpers/live.ts#ENGINE_NOTICE` |
| D-7 | Info | Lote de infra: `cd infra && npm test` con 16 fallos (§3) mientras se edita `infra/**` | Ajeno a este lote; reconfirmar al terminar |
| — | — | Defectos de la aplicación hallados en vivo | **Ninguno**: 0 errores de consola, 0 violaciones CSP, 0 solicitudes de terceros, 0 fallos de red, 0 violaciones axe |

## 10. Navegadores

Ver `browser-matrix.md`. Safari real y Edge siguen **pendientes (manuales)**; Playwright WebKit no es Safari.

## 11. Incertidumbres

- `docs/evidence` pesa ≈ 25 MB (live 11 MB: Lighthouse 8.5 MB + axe 1.3 MB + capturas 2.6 MB; capturas locales 7.5 MB; Lighthouse local 4.1 MB; axe local 2 MB). Excede el objetivo informal de 15 MB de v2; si molesta en el repositorio, bajar el HTML de las corridas 1 de Lighthouse en vivo o los JSON de axe.
- Lighthouse en vivo se midió desde una sola máquina/red (PoP de CloudFront MIA50); el LCP absoluto depende del throttling simulado, no de una red real.
- Las capturas WebKit se reducen a la mitad al superar 16383 px de WebP (ver nota en `to-webp*.py`).
- Los snapshots de regresión visual son de esta máquina (chromium 153, macOS 27).
