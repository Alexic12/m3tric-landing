# Informe QA — M3TRIC landing v2 (WU4 + lote final de correcciones)

Fecha: 2026-09-30 · Rama `feat/landing-v2-brand` · Sin commit. Estado: **final** (incluye el lote de correcciones R1–R23 / D1–D5).

## 1. Entorno

| Elemento | Valor |
|---|---|
| SO | macOS 27.0 (Darwin 27.0.0), Node v25.6.0 |
| Playwright | `npx playwright --version` → 1.63.0 · `@axe-core/playwright` 4.13.0 |
| Chromium | 153.0.8010.12 · Chrome (canal) 154.0.8037.58 · Firefox 155.0 · WebKit 26.6 · Edge: no instalado |
| Artefacto bajo prueba | `out/` construido con `NEXT_PUBLIC_SITE_URL=https://m3tric-test.co`, `PLATFORM_URL=https://app.m3tric-test.co/login`, `CONTACT_EMAIL=contacto@m3tric-test.co`, `CONTACT_PHONE=+573000000000` (dominios falsos, solo verificación) |
| Servidor | `node scripts/serve-out.mjs` en `127.0.0.1:4173` (solo loopback; lo levanta `webServer` de `playwright.config.ts`) |

## 2. Cómo reproducir

```bash
npm i && npx playwright install firefox webkit      # chromium y chrome ya presentes
npm run test:e2e            # next build con las 4 variables en línea (sintaxis sh macOS/Linux) + playwright test, todos los proyectos
npm run test:e2e:update     # build + regenera snapshots de regresión (solo chromium, visual.spec.ts)
npx playwright test --project=chromium tests/e2e/interaction.spec.ts   # un proyecto / un spec
node tests/helpers/serve-gzip.mjs & npm run evidence:lighthouse         # Lighthouse móvil + escritorio (servidor gzip :4174) -> docs/evidence
npm run evidence:contrast   # contraste medido sobre fotografía (hero, contacto, casos de uso) -> contrast-hero.md
npm run test:unit           # node:test de las reglas de configuración de release
```

Las expectativas salen de `tests/helpers/env.ts` (mismos valores por defecto que el build). Si `out/` se construye con otros valores, exportarlos también al ejecutar `playwright test`.

Evidencia generada: `link-matrix.md`, `axe-1280.json`, `axe-390.json`, `axe-390-menu-open.json`, `console-3d.json`, `contrast-hero.md`, `screenshots/<navegador>-<ancho>.webp` (16; el spec escribe PNG en `test-results/screens/` y `npm run test:e2e` los convierte con `tests/helpers/to-webp.py`, calidad 80; las capturas WebKit, que corren a DPR 2 y superan el límite de 16383 px de WebP, se reducen a la mitad), `lighthouse-{mobile,desktop}-gzip.report.{html,json}`, snapshots en `tests/e2e/__snapshots__/` (4, chromium; regenerados por el cambio de copy del hero).

## 3. Resultados (corrida final, pass / fail / skip)

| Spec | chromium | firefox | webkit | chrome |
|---|---|---|---|---|
| content (+404) | 13/0/0 | 13/0/0 | 13/0/0 | 13/0/0 |
| links | 2/0/0 | 2/0/0 | 2/0/0 | 2/0/0 |
| responsive (8 anchos) | 8/0/0 | 8/0/0 | 8/0/0 | 8/0/0 |
| visual (4 anchos) | 4/0/0 | 4/0/0 | 4/0/0 | 4/0/0 |
| interaction | 18/0/0 | 18/0/0 | 18/0/0 | 18/0/0 |
| **resilience (nuevo)** | 9/0/0 | 9/0/0 | 9/0/0 | 9/0/0 |
| a11y | 5/0/0 | 2/0/3 | 2/0/3 | 2/0/3 |
| three | 4/0/0 | 0/0/4 | 0/0/4 | 0/0/4 |
| **Total** | 63/0/0 | 56/0/7 | 56/0/7 | 56/0/7 |

Total: **231 passed, 0 failed, 0 flaky, 21 skipped** (252 tests). Skips intencionales: axe y 3D solo en chromium (motor-específicos).

**Flakiness:** suite completa ejecutada 2 veces consecutivas tras el último cambio de código: 231/0/0 en ambas (`unexpected` = 0, `flaky` = 0, `retries: 0`).

Pruebas nuevas o ampliadas en este lote:
- `resilience.spec.ts` (9 × 4 navegadores): **R1** con `page.route` bloqueando `/_next/static/chunks/*.js`, los `h2` empiezan ocultos (prueba no vacía) y a los 3.5 s todos tienen opacidad efectiva 1 y `<html>` perdió la clase `js`; con carga sana `data-hydrated` está presente y `js` se mantiene · **R13** todo `[data-reveal]` conserva `transition-property` con `opacity` y `transform`, y la tarjeta de Productos anima y cambia `border-color` al pasar el ratón · **R23** nombre accesible/`textContent` normalizado del h2 de contacto = "Entender mejor para decidir mejor" (y del h1 del hero) · **R21** `%E0%A4%A` → 400 y recorrido `..` → 404 · **R23** `robots.txt` sin `Host:`.
- `interaction.spec.ts` (**R6**): el panel del menú tiene `role="dialog"`, `aria-modal="true"`, `aria-label`; `main`, `footer` y el skip link quedan `inert` mientras está abierto y dejan de estarlo al cerrar con Escape o al navegar; Tab desde el `body` devuelve el foco al header; `<main id="contenido">` tiene `tabindex="-1"`.
- `scripts/check-config.test.mjs` (**R2**, `node:test`, 68 casos): aceptados y rechazados, incl. `[::1]`, `127.0.0.2`, `https://m3tric.co@evil.com`, `https://m3tric.co/x`, `http://`, `javascript:`, `LOCALHOST`, punto final, etiqueta única, `.local/.internal/.test/.invalid/.example`, `example.(com|org|net)`, correos con coma/salto de línea/`?bcc=`.

Notas de alcance de las pruebas:
- Todos los gestos son reales (`locator.click`, `keyboard.press`, `mouse.wheel`); ningún `force` ni `evaluate(el.click())`.
- Responsive: fallo si `scrollWidth > clientWidth` o si algún elemento **no recortado por un ancestro con overflow** excede el ancho del viewport +1 px; los elementos decorativos recortados (p. ej. NodeNetwork) se cuentan como anotación y no fallan (desviación documentada de la redacción literal del spec, porque no pueden producir scroll).
- Header sólido/transparente: no existe atributo de estado; se mide el alfa del fondo computado de `header > div[aria-hidden]` (0 arriba, >0.9 tras 400 px) y la clase `on-dark`.
- Skip link: tras Enter se comprueba el hash `#contenido` y que el siguiente Tab caiga dentro de `<main>`.

## 4. Defectos (D-1..D-5) — estado final

| ID | Severidad | Hallazgo | Estado |
|---|---|---|---|
| D-1 | Media | **LCP móvil sobre presupuesto** (§10: ≤ 2.5 s) | **Mitigado, no cerrado.** LCP móvil gzip 3.3 s → **2.9 s** (perf 92 → 95); ver §7 para el desglose y por qué el modelo de Lighthouse no baja de ~2.8 s sin recortar pesos tipográficos o contenido |
| D-2 | Baja | Imagen hero de 1920 px pesa 205 KB | Sin cambio (informativo): el presupuesto es a 1280 px (`aerial-wide-1280.webp` = 127 KB, cumple). En móvil el hero usa ahora `aerial-tall-480.webp` (25 KB) |
| D-3 | Baja | Asunto del `mailto` = "Contacto desde el sitio M3TRIC"; §5.9 indica "Contacto desde m3tric — [sitio]" | Abierto: decisión de redacción del Tech Lead (`cta.mailSubject`) |
| D-4 | Baja (observación) | "Abrir plataforma" navega en la misma pestaña sin `rel` | **Cerrado**: se eliminó la prop `external` del `Button` (sin uso); si se decide abrir en pestaña nueva hay que reintroducirla junto con `rel="noopener noreferrer"` |
| D-5 | Info | axe deja `color-contrast` como "incomplete" sobre hero/secciones oscuras | **Cerrado con medición directa**: `contrast-hero.md` (hero, contacto, tarjeta de casos de uso a 1280 y 390 px; 0 incumplimientos; peor caso hero: lead móvil 4.84:1 vs 4.5, h1 Light 4.22:1 vs 3.0 por ser texto grande). No fue necesario reforzar el velo. axe sigue reportando 58/50 nodos "incomplete" (limitación de la herramienta) |

## 5. Resumen axe (wcag2a, wcag2aa, wcag21a, wcag21aa; chromium)

| Escenario | Violaciones (todas) | serious/critical | moderate/minor | Incompletos | Pasadas |
|---|---|---|---|---|---|
| 1280 tras scroll | 0 | 0 | 0 | 1 regla (color-contrast, 58 nodos) | 29 |
| 390 tras scroll | 0 | 0 | 0 | 1 regla (color-contrast, 50 nodos) | 29 |
| 390 menú abierto | 0 | 0 | 0 | 1 regla (color-contrast, 21 nodos) | 29 |

Movimiento reducido: todos los `[data-reveal]` con opacidad 1 inmediatamente tras la carga (PASS en 4 navegadores). Sin JavaScript: todos los `section h2` visibles con opacidad efectiva 1 (PASS en 4 navegadores).

## 6. 3D y consola (chromium)

- Con WebGL (SwiftShader headless): `[data-visual="3d"]` aparece y existe 1 `<canvas>` al entrar `#escalas`.
- `--disable-3d-apis` (se verifica que `getContext('webgl')` falla): permanece `fallback`, `<svg>` visible, 0 canvas, 0 errores.
- `reducedMotion: reduce`: `fallback` + SVG visible.
- Consola durante scroll completo + cambio de pestañas: **0 errores**, 0 `pageerror`, 0 respuestas ≥ 400 (también comprobado en los 4 navegadores en `content.spec`). Única advertencia: `THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` (aceptada; `console-3d.json`).
- La fuente de la capa SVG de respaldo (`TerrainFallback`) se monta solo cuando el visual se acerca al viewport y en su propio chunk (saca ~11 KB gz del HTML inicial); sin JavaScript la caja del visual queda vacía (es decorativa, `aria-hidden`).
- Chunk 3D ≈ 226 KB gz (`out/_next/static/chunks/d1e88cf352711940.js`, medido con gzip -6) ≤ 250 KB.

## 7. Lighthouse (EV-09) contra presupuestos §10

Los números son de **localhost**: no hay latencia ni pérdida reales; el throttling simulado de Lighthouse (4G lento, CPU ×4, HTTP/1.1 con 6 conexiones) compensa solo en parte. `serve-out.mjs` **no comprime**, lo que penaliza artificialmente; por eso existe `tests/helpers/serve-gzip.mjs` (solo medición, emula CloudFront con gzip y caché) y los reportes guardados son los del servidor gzip (`lighthouse-{mobile,desktop}-gzip.report.*`; los de serve-out sin gzip se retiraron del repositorio para mantener `docs/evidence` < 15 MB y se citan abajo solo como cifra).

| Corrida | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| **Móvil, gzip** | **95** | 100 | 100 | 100 | **2.9 s** | 0 | 10 ms |
| Escritorio, gzip | 100 | 100 | 100 | 100 | 0.8 s | 0 | 0 ms |
| Móvil, serve-out sin gzip (no guardado) | 77 | — | — | — | 5.8 s | 0 | 11 ms |
| Escritorio, serve-out sin gzip (no guardado) | 97 | — | — | — | 1.3 s | 0 | 0 ms |

Antes del lote (misma máquina, gzip): móvil perf 92–93, LCP 3.2–3.3 s; escritorio 99.

Presupuestos (móvil, gzip): Perf ≥ 90 **cumple (95)** · A11y/BP/SEO ≥ 95 cumplen (100) · LCP ≤ 2.5 s **NO cumple (2.9 s)** · CLS ≤ 0.05 cumple (0) · TBT ≤ 200 ms cumple (10 ms) · JS inicial ≤ 180 KB gz cumple (135 KB transferidos en 7 scripts).

### D-1: desglose del LCP móvil

- Elemento LCP: `h1#inicio-title > span.text-light` (texto). En el trace real el LCP ocurre a los **79 ms** (localhost); el 2.9 s es la **estimación de Lantern**, que promedia un grafo optimista y uno pesimista con *todo* lo que terminó de cargar antes de ese pintado (en localhost, todo). Por eso el LCP de texto equivale aquí a "tiempo de cargar todo el camino crítico por HTTP/1.1 a 1.6 Mbps".
- Transferido antes del LCP (gzip): documento 33 KB · 5 fuentes woff2 77 KB · CSS 9 KB · 7 scripts 135 KB (React DOM 70 KB + runtime Next 40 KB + app ~11 KB gz) · imagen hero móvil 25 KB (+ globo lazy 64 KB que el navegador ya descarga por estar dentro del umbral de carga diferida).
- Medido (cada cambio aislado, LCP Lantern): imagen móvil 747 px → 480 px q55 (71 → 25 KB): −0.15 s · capa SVG de respaldo fuera del HTML inicial (montaje diferido): −0.22 s (documento 45 → 33 KB gz) · cada archivo woff2 adicional cuesta ≈ 0.15 s (2 pesos: 2.7 s; 3: 2.9 s antes de los otros cambios) · quitar el peso 500: −0.08 s · quitar la imagen del globo: −0.08 s · `inlineCss`: ≈ 0 · `preload:false` en las fuentes: LCP −0.1 s pero FCP 1.1 → 1.7 s (peor, descartado).
- Suelo: una página con solo Hero + Header y los mismos 5 pesos da **2.8 s**; el piso lo fijan framework (~110 KB gz), las 5 fuentes y la imagen. Bajar de 2.5 s exige quitar 3+ pesos tipográficos (incluye el Light 300 del titular editorial) o recortar contenido, lo que cambia el diseño aprobado. **No se aplicó.**
- Opciones restantes para el Tech Lead (ninguna aplicada): (a) subsetear Barlow a los glifos del español con `next/font/local` (≈ −35 KB, ≈ −0.2 s, requiere generar/commitear los woff2); (b) reducir a 4 pesos (sin 500; −0.08 s); (c) diferir el globo con IntersectionObserver (−0.08 s); (d) medir contra un servidor HTTP/2 + brotli como CloudFront, donde el tope de 6 conexiones y la compresión brotli no aplican igual (no se pudo montar HTTP/2 con certificado autofirmado bajo Lighthouse en esta máquina). Con (a)+(b)+(c) el modelo apunta a ≈ 2.55–2.6 s: tampoco llega a 2.5.

## 8. Navegadores

Ver `browser-matrix.md`. Edge **no ejecutado** (no instalado). Playwright WebKit ≠ Safari: **smoke manual en Safari real pendiente** (checklist en `browser-matrix.md`).

Ajuste de prueba WebKit: en macOS un `Tab` sin modificador no enfoca enlaces en WebKit/Safari (comportamiento por defecto del navegador, no un defecto de la app); los tests de teclado usan `Alt+Tab` en WebKit (`tabChord`). Con ese chord la trampa de foco y el skip link pasan en WebKit. Real Safari debe validarse a mano.

## 9. Incertidumbres

- Contraste medido sobre la captura de la imagen/velos (D-5); depende del recorte de la foto en cada ancho y de las imágenes WebP con pérdida. Si se cambia la foto, el velo o el texto, volver a correr `npm run evidence:contrast`.
- Snapshots de regresión generados en esta misma máquina (chromium 153, macOS 27); pueden requerir regeneración (`npm run test:e2e:update`) en otro SO/CI por diferencias de render de fuentes.
- `docs/evidence` pesa ≈ 13 MB (antes 92 MB): 16 capturas WebP q80 (≈ 7 MB), Lighthouse gzip móvil/escritorio (≈ 4 MB), axe (≈ 1.4 MB). Las capturas WebKit están reducidas a 1× (ver §2).
