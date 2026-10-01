# Matriz de trazabilidad — M3TRIC Landing v3

Corte: 2026-10-01 · Rama `feat/landing-v2-brand` · v3 confirmada en `f4bdc1c` · PR #1 abierto.

Esta matriz enlaza cada requisito de `docs/SPEC.md` §0 con la sección de la spec, los archivos que lo implementan, la prueba que lo verifica y la evidencia. Es un documento de **auditoría**: dice lo que está comprobado y lo que no.

## Cómo leer esta matriz

| Columna | Qué contiene |
|---|---|
| **ID** | Identificador de `docs/SPEC.md` §0 (`REQ-O` owner · `REQ-C` contractual, Anexo 1 §5 · `REQ-A` aceptación, Anexo 1 §10 · `REQ-B` marca). |
| **Requisito** | Resumen. El texto completo está en la spec. |
| **Spec (§)** | Sección de `docs/SPEC.md` donde se especifica. |
| **Implementación** | Archivos concretos que lo cumplen (rutas relativas a la raíz del repositorio). |
| **Verificación** | Prueba exacta: archivo y título del test, o script y nombre del *check*. Ver la convención de abreviaturas abajo. |
| **Evidencia** | Ruta en `docs/evidence/` o, si no existe todavía, «Pendiente — despliegue». |
| **Estado** | Uno de los cinco estados del Anexo 1 §3 (citados abajo). |

### Estados (Anexo 1 §3, «Regla de estados y corte de evidencia»)

| Estado | Uso permitido |
|---|---|
| Verificado | Existe evidencia reproducible, identificada y revisada al corte. |
| Parcial | Existe una base comprobable, pero falta una parte del resultado o de su evidencia. |
| Preparado | La configuración o el artefacto está dispuesto para ejecutar el gate; aún no lo supera. |
| Pendiente | La actividad, prueba o evidencia todavía deberá ejecutarse o incorporarse. |
| Dependencia del cliente | El cierre requiere un insumo, autorización, permiso o decisión institucional. |

Regla de cumplimiento (Anexo 1 §2.1): la existencia de código, configuración o infraestructura como código **no** equivale por sí sola a publicación ni aceptación. «Preparado» no significa «entregado», «publicado», «desplegado» ni «aceptado».

### Criterio aplicado a este corte

- **Verificado** se reserva para requisitos con evidencia reproducible **de la versión v3** en `docs/evidence/` o en un run de CI/despliegue identificado. A este corte ningún requisito cumple ambas condiciones completas (ver «Estado de la evidencia»).
- **Preparado** = implementación y prueba existen en el repositorio, pero el resultado de esa prueba sobre v3 no está archivado.
- **Parcial** = hay evidencia comprobable, pero de la versión v2 o incompleta.
- Los estados se actualizan **solo** contra evidencia identificada (Anexo 1 §5, «Criterio»). Tras el despliegue, el Tech Lead sustituye cada «Pendiente — despliegue» por el enlace al run o a la ruta de `docs/evidence/live/`.

### Estado de la evidencia en `docs/evidence/` (leído al corte)

| Archivo | Versión del sitio que describe | Consecuencia |
|---|---|---|
| `link-matrix.md` | **v3** (navegación «Beneficios», «Casos de uso»…; 37 enlaces, 0 con problemas). Su encabezado dice «2026-09-30» porque la fecha está escrita en `tests/e2e/links.spec.ts`. | Vigente. |
| `QA-REPORT.md`, `browser-matrix.md` | **v2** (título «landing v2»; 231 pasadas / 0 fallos / 21 omitidas sobre la suite v2). | Hay que regenerarlos con la suite v3. |
| `contrast-hero.md` | **v2** (cita el kicker «Lectura multiescala del territorio», el menú «Propuesta · Plataforma · Productos» y «08 — Contacto»; en v3 el kicker es «Monitoreo del territorio»). | Hay que regenerarlo (`npm run evidence:contrast`). |
| `axe-*.json`, `lighthouse-*-gzip.report.*`, `screenshots/` | Generados por la suite v2 según `QA-REPORT.md`; no se verificó su contenido archivo por archivo. | Regenerar con v3. |
| `docs/evidence/live/` | No existe todavía. | Lo crea la QA en vivo (WU-R5) tras el despliegue. |

### Convención de abreviaturas en «Verificación»

- **E2E** (Playwright, `tests/e2e/<nombre>.spec.ts`): `content`, `links`, `responsive`, `visual`, `interaction`, `resilience`, `a11y`, `three`. Se escribe `archivo › «título del test»`.
- **Unitarias** (`npm run test:unit`, `node --test`): `config.test` = `scripts/check-config.test.mjs` · `rules.test` = `scripts/lib/artifact-rules.test.mjs` · `hygiene.test` = `scripts/hygiene.test.mjs` · `manifest.test` = `scripts/deploy/manifest.test.mjs`.
- **IaC** (`cd infra && npm test`, vitest): `app.test` = `infra/test/app.test.ts` · `site.test` = `infra/test/landing-site-stack.test.ts` · `identity.test` = `infra/test/delivery-identity-stack.test.ts` · `infra-config.test` = `infra/test/config.test.ts`.
- **Gates y scripts**: `check:config` (`scripts/check-config.mjs`) · `check:artifact` (`scripts/check-artifact.mjs`) · `hygiene` (`scripts/hygiene.sh`) · `smoke «nombre»` (`scripts/deploy/smoke.mjs`, se ejecuta en el workflow `publish.yml`) · `evidence:*` (scripts de `package.json`).
- **CI** = `.github/workflows/ci.yml`; **Deploy** = `deploy.yml`; **Publish** = `publish.yml`; **Rollback** = `rollback.yml`.

Los títulos de test están en inglés porque así están escritos en los archivos; se citan literalmente.

---

## 1. Requisitos del owner (REQ-O)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-O01 | Diseño basado en el manual de marca | §3 | `src/app/globals.css` (`@theme`), `src/config/brand.ts`, `src/components/brand/{Logo,TripleBar,NodeNetwork}.tsx`, `src/app/layout.tsx` (Barlow) | `npm run evidence:contrast` (`tests/helpers/contrast.mjs` + `contrast.py`) · `visual › «full-page screenshot at 1280px»` | `docs/evidence/contrast-hero.md` (v2, regenerar) · `docs/evidence/screenshots/` (v2) · v3: Pendiente — despliegue | Parcial |
| REQ-O02 | 100 % funcional, grado *production release*, con pruebas visuales | §1, §6, §8, §13 | `package.json` (`release`), `.github/workflows/ci.yml` (jobs `web`, `e2e`, `infra`), `tests/e2e/**` | `visual › «full-page screenshot at 360px»` (y 768, 1280, 1920) · todas las suites E2E · CI | `docs/evidence/QA-REPORT.md` (v2) · corrida v3 de CI: Pendiente — despliegue | Preparado |
| REQ-O03 | Página para usuarios no técnicos, centrada en lo que obtienen | §2, §5.1–§5.7 | `src/content/landing.ts` (`hero`, `benefits`, `useCases`, `howItWorks`, `faq`), `src/components/sections/{Hero,Benefits,UseCases,HowItWorks,Faq}.tsx` | `content › «the value zone avoids unexplained jargon (spec section 2)»` · `content › «hero states the outcomes: three of them, each with a label and one line»` · `content › «benefits: three outcome cards, each with its deliverables and an honest status»` | Pendiente — despliegue | Preparado |
| REQ-O04 | Profundidad técnica más abajo, nivel *enterprise* | §4.1, §5.8 | `src/components/sections/TechnicalZone.tsx`, `src/content/landing.ts` (`technical`) | `content › «technical zone: the three spec-sheet blocks with honest availability»` · `content › «value zone comes first: the technical zone sits after the FAQ and before the contact»` | Pendiente — despliegue | Preparado |
| REQ-O05 | Spec completa, trazable end to end, todo documentado | §0, §14 | `docs/SPEC.md`, `docs/TRACEABILITY.md`, `docs/adr/ADR-001..007`, `docs/OPERACION.md`, `docs/CONTENIDOS.md`, `docs/ASSETS.md`, `infra/README.md`, `README.md`, `CHANGELOG.md` | Revisión documental (sin prueba automática). Cada afirmación operativa se contrastó con los archivos fuente al redactar | Este documento | Parcial |
| REQ-O06 | Despliegue por IaC con GitHub Actions hasta tener URL de CloudFront funcional | §10, §11 | `infra/bin/landing.ts`, `infra/lib/{landing-app,delivery-identity-stack,landing-site-stack,config,names}.ts`, `infra/config/staging.json`, `.github/workflows/{ci,deploy,publish,rollback}.yml`, `scripts/deploy/{publish.sh,smoke.mjs,manifest.mjs,upload-manifest.sh}` | `app.test › «selects stacks by their physical names (cdk deploy m3tric-staging-LandingSiteStack)»` · `site.test › «outputs exactly the values the deploy workflow reads»` · `identity.test › «defines the role with the exact name, path and one-hour session cap»` · smoke (10 checks, ver `docs/OPERACION.md` §8) | Stack de identidad desplegado: `m3tric-staging-LandingDeliveryIdentityStack` (ver `infra/README.md`). Stack del sitio, URL de CloudFront y smoke: Pendiente — despliegue | Parcial |

## 2. Requisitos contractuales (REQ-C, Anexo 1 §5)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-C01 | Brief y estructura | §2, §4, §5 | `docs/SPEC.md`, `src/content/landing.ts` | Revisión documental; aprobación del brief por el cliente (EV-01 del Anexo) | No consta aprobación escrita en el repositorio · Pendiente — despliegue | Parcial |
| REQ-C02 | UX/UI responsive alineado a la identidad | §3, §4.1, §6 | `src/app/globals.css`, `src/components/**` | `responsive › «no horizontal overflow at 360px»` (y 320, 390, 768, 1024, 1280, 1440, 1920) · `visual › «full-page screenshot at 360px»` (y 768, 1280, 1920) | `docs/evidence/screenshots/` (v2, regenerar) · Pendiente — despliegue | Preparado |
| REQ-C03 | Arquitectura de información y navegación | §4 | `src/app/page.tsx`, `src/content/landing.ts` (`navItems`), `src/components/layout/{Header,Footer,SkipLink}.tsx` | `content › «all nine sections exist with their anchor ids, in the v3 order»` · `interaction › «nav link #beneficios lands clear of the header and becomes current»` (una por cada ancla de `NAV_IDS`) · `links › «link matrix (EV-06)»` | `docs/evidence/link-matrix.md` (v3: 37 enlaces, 0 con problemas) | Parcial |
| REQ-C04 | Frontend funcional con recursos visuales e interactivos | §3.5, §6 | `src/components/**`, `src/components/three/{TerrainScene,TerrainFallback}.tsx`, `next.config.ts` (`output: "export"`) | `interaction › «tablist semantics and keyboard pattern»` · `interaction › «the first answer starts open, the rest closed; a click opens and closes»` · `three › «3D scene mounts a canvas when #escalas scrolls into view»` · `three › «stays on the SVG fallback»` | `docs/evidence/console-3d.json` (sin errores; 1 advertencia conocida de `THREE.Clock`) · Pendiente — despliegue | Preparado |
| REQ-C05 | Secciones: propuesta de valor, plataforma, escalas M1/M2/M3, productos, capacidades, tecnología, casos de uso, contacto, CTA | §4, §5 | `src/components/sections/{Hero,Benefits,UseCases,HowItWorks,Scales,WhyM3tric,Faq,TechnicalZone,Contact}.tsx` | `content › «benefits: three outcome cards…»` · `content › «use cases: four cases, each split into the situation and what the user obtains»` · `content › «how it works: four ordered steps and the illustrative product view»` · `content › «scale tabs carry the plain-language labels»` · `content › «why M3TRIC: the three brand values»` · `content › «technical zone: the three spec-sheet blocks…»` | Pendiente — despliegue | Preparado |
| REQ-C06 | Conexión por URL a la plataforma | §5.1, §5.9, §9 | `src/config/site.ts` (`platformUrl`), `Hero.tsx`, `Header.tsx`, `Contact.tsx` | `links › «link matrix (EV-06)»` (≥ 3 CTA de plataforma = `PLATFORM_URL`) · `check:artifact` (enlace exacto a `PLATFORM_URL` en `index.html`) · smoke «Every "Abrir plataforma" link equals PLATFORM_URL» · `config.test › «PLATFORM_URL rejections»` | `docs/evidence/link-matrix.md` (filas `platform-cta`, build de prueba con dominios falsos). En vivo y URL oficial de producción: Pendiente — despliegue / dependencia del cliente n.º 2 | Parcial |
| REQ-C07 | SEO técnico | §7 | `src/app/layout.tsx` (metadata, Open Graph, JSON-LD `Organization` + `WebSite` + `FAQPage`), `src/app/robots.ts`, `src/app/sitemap.ts`, `public/og.png` | `content › «title and meta description are non-empty Spanish»` · `content › «canonical and og:url start with SITE_URL»` · `content › «og:image is absolute, reachable, a 1200x630 PNG»` · `content › «JSON-LD parses; Organization and WebSite declare M3TRIC / Metric; FAQPage mirrors the visible FAQ»` · `resilience › «robots.txt has no non-standard Host directive»` · `rules.test › «profileProblems»` · smoke «og.png, sitemap.xml, manifest.webmanifest» | Pendiente — despliegue | Preparado |
| REQ-C08 | Accesibilidad WCAG 2.1 AA | §8 | `src/components/layout/{Header,SkipLink,HydrationMarker}.tsx`, `src/components/ui/Reveal.tsx`, `src/app/globals.css` | `a11y › «no serious/critical violations at 1280px»` (y `390px`, y `390px with the menu open`) · `a11y › «every [data-reveal] is fully opaque immediately after load»` · `a11y › «all section headings are visible with opacity 1»` · `interaction › «opens, traps focus, closes with Escape and restores focus»` · `interaction › «skip link is the first tab stop and moves to #contenido»` · `content › «every section[aria-labelledby] points to an existing heading…»` · `content › «heading levels never skip a level»` | `docs/evidence/axe-1280.json`, `axe-390.json`, `axe-390-menu-open.json` (v2, regenerar) · `docs/evidence/contrast-hero.md` (v2) | Parcial |
| REQ-C09 | Optimización de rendimiento | §8, ADR-005 | `next.config.ts`, `src/app/layout.tsx` (`next/font`), `public/images/*.webp`, carga diferida del visor 3D | `npm run evidence:lighthouse` (`tests/helpers/lighthouse.mjs`) | `docs/evidence/lighthouse-{mobile,desktop}-gzip.report.{html,json}` (v2, local: móvil Perf 95 y LCP 2,9 s frente a presupuesto de 2,5 s; ver ADR-005) · Medición en CloudFront: Pendiente — despliegue | Parcial |
| REQ-C10 | Pruebas de calidad documentadas | §13 | `tests/e2e/**`, `tests/helpers/**`, `scripts/**/*.test.mjs`, `infra/test/**` | `npm run test:e2e`, `npm run test:unit`, `cd infra && npm test` | `docs/evidence/QA-REPORT.md` (v2: 231 pasadas, 0 fallos, 21 omitidas intencionales) · informe v3: Pendiente — despliegue | Parcial |
| REQ-C11 | Chrome, Edge, Firefox, Safari | §13, ADR-006 | `playwright.config.ts` (`chromium`, `firefox`, `webkit`, `chrome`) | CI job `E2E (chromium)`, `E2E (firefox)`, `E2E (webkit)` · local: proyecto `chrome` | `docs/evidence/browser-matrix.md` (v2: Chromium 153, Chrome 154, Firefox 155, WebKit 26.6). **Edge y Safari real no ejecutados** (ver REQ-A08) | Parcial |
| REQ-C12 | Hasta dos rondas de ajustes | §16.6 | Marcas «Pendiente de aprobación editorial (ronda de ajustes 1)» en `src/content/landing.ts` (`useCases.items`: Infraestructura y Ambiente) | Proceso con el cliente; sin prueba automática | **Ronda 1 abierta.** Pendiente de aprobación: copy de Infraestructura y Ambiente, más el copy nuevo de v3 redactado por WU-R1 (Beneficios, Casos de uso, Cómo funciona, Preguntas frecuentes, textos de Contacto), para el que no consta aprobación escrita | Pendiente |
| REQ-C13 | Configuración de despliegue y versión publicada | §9–§11 | `infra/**`, `.github/workflows/*.yml`, `scripts/deploy/*`, `scripts/lib/release-config.mjs`, `.env.example` | `app.test`, `site.test`, `identity.test`, `infra-config.test` · `config.test › «release profiles (ADR-003)»` · `hygiene.test › «a tag-pinned action fails»` | Configuración: en el repositorio. Versión publicada y `_deploy/manifest.json`: Pendiente — despliegue | Parcial |
| REQ-C14 | Código y activos | §14 | Repositorio (rama `feat/landing-v2-brand`, PR #1, commit `f4bdc1c`), `docs/ASSETS.md` | `hygiene` (sin archivos prohibidos ni conflictos) · `hygiene.test › «a clean repo passes (SHA-pinned action with comment, local reusable workflow, .env.example)»` | PR #1 abierto. Transferencia al cliente y aceptación escrita: Pendiente — despliegue | Preparado |
| REQ-C15 | Manual técnico y guía de contenidos | §14 | `docs/OPERACION.md`, `docs/CONTENIDOS.md`, `README.md`, `infra/README.md`, `docs/ASSETS.md` | Revisión documental contra los archivos fuente | Documentos actualizados a v3 en este corte; validación por el cliente: Pendiente — despliegue | Preparado |
| REQ-C16 | Entrega final | Anexo 1 §2.1 | — | Requiere evidencia verificable de la versión publicada, URL de plataforma, código y activos transferidos, pruebas, documentación y aceptación escrita | Pendiente — despliegue | Pendiente |

## 3. Criterios de aceptación (REQ-A, Anexo 1 §10)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-A01 | Sin placeholders ni enlaces vacíos | §9 | `scripts/check-artifact.mjs` (reglas `STRICT`/`HOSTS`, archivos requeridos), `src/config/site.ts` | `check:artifact` · `content › «rendered text contains no forbidden strings»` · `content › «forbidden strings are also absent from href/src/alt attributes»` · `links › «link matrix (EV-06)»` | `docs/evidence/link-matrix.md` (v3: 37 enlaces, 0 con problemas). Resultado de `check:artifact` sobre v3: Pendiente — despliegue | Parcial |
| REQ-A02 | 360 px a escritorio amplio sin desbordes | §8 | `src/app/globals.css`, `src/components/**` | `responsive › «no horizontal overflow at 360px»` (320, 390, 768, 1024, 1280, 1440, 1920) | `docs/evidence/QA-REPORT.md` (v2) · Pendiente — despliegue | Preparado |
| REQ-A03 | CTA y contactos funcionan; login oficial | §5.9, §9 | `src/config/site.ts` (`mailtoHref`), `src/components/sections/Contact.tsx`, `Header.tsx`, `Footer.tsx` | `links › «link matrix (EV-06)»` (`mailto:` con asunto, `tel:` exacto) · `interaction › «header shows the compact primary 'Hablar'; the menu offers both CTAs and 'Hablar con el equipo' lands on #contacto»` · `config.test › «CONTACT_EMAIL and PHONE»` | `docs/evidence/link-matrix.md` (v3, con dominios y correo de prueba). **Login oficial de producción y correo/teléfono aprobados: dependencia del cliente n.º 2 y n.º 3** | Parcial |
| REQ-A04 | Build y lint sin errores; `out/` presente | §9 | `package.json` (`release`), `scripts/check-config.mjs`, `scripts/check-artifact.mjs`, `next.config.ts` | `npm run release` · CI job `Release gate (staging)` y `Release gate (production)` · `check:artifact` (archivos requeridos en `out/`) | Run de CI sobre PR #1: Pendiente — despliegue | Preparado |
| REQ-A05 | Metadata, OG, favicon, sitemap y robots **del dominio** | §7 | `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/{og.png,icon.svg,apple-icon.png,icon-192.png,icon-512.png}` | `check:artifact` (archivos requeridos, perfil, `SITE_URL` en `sitemap.xml`) · `content › «canonical and og:url start with SITE_URL»` · smoke «og.png, sitemap.xml, manifest.webmanifest» | Con el dominio de CloudFront: Pendiente — despliegue. Con el dominio oficial y validación del favicon derivado: dependencia del cliente n.º 1 y n.º 5 | Parcial |
| REQ-A06 | Teclado, foco, contraste, alternativas, movimiento | §8 | Igual que REQ-C08 | Igual que REQ-C08, más `a11y › «every [data-reveal] is fully opaque immediately after load»` (movimiento reducido), `a11y › «all section headings are visible with opacity 1»` (sin JS), `interaction › «keyboard: Enter and Space toggle a focused question and the focus ring is visible»` y `three › «uses the fallback even when WebGL is available»` | `docs/evidence/axe-*.json` y `contrast-hero.md` (v2, regenerar) | Parcial |
| REQ-A07 | Lighthouse documentado | §8, ADR-005 | Igual que REQ-C09 | `npm run evidence:lighthouse` | Local v2: móvil Perf 95 / A11y 100 / BP 100 / SEO 100, LCP 2,9 s (presupuesto 2,5 s **no cumplido en local**, `QA-REPORT.md` D-1). Medición contra CloudFront en `docs/evidence/live/`: Pendiente — despliegue | Parcial |
| REQ-A08 | Smoke en 4 navegadores | §13 | `playwright.config.ts`, lista de verificación de `docs/evidence/browser-matrix.md` | Automático: Chromium, Firefox, WebKit (CI) y Chrome (local). **Manual: Safari real (macOS e iOS) y Edge** | `docs/evidence/browser-matrix.md`: lista de Safari sin completar; Edge «No ejecutado». Playwright WebKit no es Safari | Pendiente |
| REQ-A09 | Dominio y HTTPS | §10.2, §16.1 | — (el sitio usa el dominio `*.cloudfront.net`; supresión `AwsSolutions-CFR4` documentada en `infra/lib/landing-site-stack.ts` y `infra/README.md`) | — | Requiere dominio productivo, ACM (us-east-1) y Route 53, que provee el cliente | Dependencia del cliente |
| REQ-A10 | S3 privado, SSE-S3, versionado, OAC, GET directo = 403 | §10.2, §11.4 | `infra/lib/landing-site-stack.ts` (`SiteBucket`, `Distribution`, OAC) | `site.test › «configures the site bucket exactly: BPA, SSE-S3, versioning, owner-enforced, 90-day noncurrent expiry, access logs»` · `site.test › «lets only CloudFront (this distribution, via OAC) read the site bucket, over TLS»` · `site.test › «uses one Origin Access Control and no Origin Access Identity»` · smoke «Direct S3 GET -> 403 (bucket is private)» | GET directo al bucket real: Pendiente — despliegue | Preparado |
| REQ-A11 | TLS 1.2+, cabeceras/CSP, retención, alerta presupuestal, sin credenciales largas | §10, §12 | `infra/lib/landing-site-stack.ts` (`ResponseHeadersPolicy`, `LogsBucket`, `CfnBudget`, `Topic`), `infra/lib/delivery-identity-stack.ts` | `site.test › «sends the exact SPEC §10.2 security headers, overriding the origin, plus X-Robots-Tag in staging»` · `site.test › «configures the logs bucket exactly: BPA, SSE-S3, owner-preferred for CloudFront logs, 90-day expiry»` · `site.test › «budgets USD 10/month on Component=landing and alerts at 80% actual spend»` · `identity.test › «trusts only the landing-staging GitHub environment of this repository (exact aud + sub)»` · `app.test › «reports zero unacknowledged findings across the whole app»` · smoke «Security headers on /» | Cabeceras en vivo: Pendiente — despliegue. **TLS 1.2+**: dependencia del cliente n.º 1 (REQ-A09). **Alerta presupuestal**: el tema SNS no tiene suscripción (cliente n.º 4) y la etiqueta `Component` debe activarse en Billing tras el primer deploy | Parcial |
| REQ-A12 | Rollback probado, IaC, manuales, inventario | §11.6, ADR-007 | `.github/workflows/rollback.yml`, `infra/**`, `docs/OPERACION.md`, `docs/ASSETS.md` | `manifest.test › «assembles every documented field»` · ejecución de prueba de `rollback.yml` | Rollback probado: Pendiente — despliegue. IaC, manuales e inventario: en el repositorio | Parcial |

## 4. Marca (REQ-B)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-B01 | Logo oficial y variantes (lám. 8, 11) | §3.4 | `src/components/brand/Logo.tsx` (`color`, `reverse`, `mono-dark`, `mono-light`), `public/icon.svg` | Sin prueba dedicada; regresión visual `visual › «full-page screenshot at 1280px»` | Pendiente — despliegue | Preparado |
| REQ-B02 | Paleta exacta (lám. 10) | §3.2 | `src/app/globals.css` (`@theme`), `src/config/brand.ts` | `npm run evidence:contrast` · `visual › «full-page screenshot at 1280px»` | `docs/evidence/contrast-hero.md` (v2, regenerar) | Preparado |
| REQ-B03 | Tipografía DIN 2014 Rounded o sustituto declarado | §3.3, ADR-001 | `src/app/layout.tsx` (`Barlow`), `src/app/globals.css` (`--font-sans`) | Sin prueba automática (decisión documentada) | `docs/adr/ADR-001-barlow-sustituto-din-2014-rounded.md`. Licencia web de DIN 2014 Rounded: dependencia del cliente n.º 7 (opcional) | Parcial |
| REQ-B04 | El «3» como sistema: tríadas y tres barras | §3.1 | `src/components/brand/TripleBar.tsx`, `src/content/landing.ts` (`hero.outcomes`, `benefits.items`, `scales.items`, `whyM3tric.values`) | `content › «hero states the outcomes: three of them, each with a label and one line»` · `content › «scale tabs carry the plain-language labels»` · `content › «why M3TRIC: the three brand values»` | Pendiente — despliegue | Preparado |
| REQ-B05 | Tono de voz técnico, comprensible, cercano | §2 | `src/content/landing.ts` | `content › «the value zone avoids unexplained jargon (spec section 2)»` | Pendiente — despliegue | Preparado |
| REQ-B06 | Alcance más allá del riesgo: cultivos, terreno, infraestructura, ambiente | §5.3 | `src/content/landing.ts` (`useCases.items`), `src/components/sections/UseCases.tsx` | `content › «use cases: four cases, each split into the situation and what the user obtains»` | Copy de Infraestructura y Ambiente pendiente de aprobación (ronda 1, REQ-C12) | Parcial |
| REQ-B07 | SEO «Metric» vs «M3TRIC» | §7 | `src/app/layout.tsx` (`alternateName: "Metric"`, palabras clave) | `content › «JSON-LD parses; Organization and WebSite declare M3TRIC / Metric; FAQPage mirrors the visible FAQ»` | Pendiente — despliegue | Preparado |

---

## 5. Resumen por estado

| Estado | REQ-O | REQ-C | REQ-A | REQ-B | Total |
|---|---|---|---|---|---|
| Verificado | 0 | 0 | 0 | 0 | **0** |
| Parcial | 3 | 8 | 7 | 2 | **20** |
| Preparado | 3 | 6 | 3 | 5 | **17** |
| Pendiente | 0 | 2 | 1 | 0 | **3** |
| Dependencia del cliente | 0 | 0 | 1 | 0 | **1** |
| **Total** | 6 | 16 | 12 | 7 | **41** |

## 6. Brechas abiertas

Todos los requisitos están abiertos a este corte. Propietarios: **Tech Lead** (equipo de desarrollo), **QA en vivo** (WU-R5), **Cliente** (EAFIT / M3TRIC).

### 6.1 Acciones transversales que cierran la mayoría de las brechas

| Acción | Propietario | Qué cierra |
|---|---|---|
| A. Ejecutar la suite v3 completa en local (`npm run test:e2e`, `npm run evidence:lighthouse`, `npm run evidence:contrast`) y reemplazar `QA-REPORT.md`, `browser-matrix.md`, `contrast-hero.md`, `axe-*.json`, `lighthouse-*` y capturas (hoy v2) | Tech Lead | Evidencia local de REQ-C02, C08, C09, C10, C11, A02, A06, A07, B01, B02 |
| B. Obtener un run verde de `ci.yml` sobre el PR #1 y archivar su enlace | Tech Lead | REQ-A04, O02 y la parte automática de C07, C10, C11 |
| C. Primer despliegue (workflow `Deploy staging`) y archivar `deploy-manifest.json`, resumen del smoke y la URL | Tech Lead | REQ-O06, C13, A10, A11 (cabeceras), A05 (con dominio de CloudFront) |
| D. QA en vivo: Playwright y Lighthouse contra la URL de CloudFront en `docs/evidence/live/` | QA en vivo (WU-R5) | REQ-A07, C09, A06, A10 |
| E. Prueba de rollback (`Rollback staging`) con un commit anterior de `main` que ya contenga el pipeline | Tech Lead | REQ-A12 |
| F. Activar la etiqueta de asignación de costos `Component` en Billing tras el primer deploy | Tech Lead | Parte de REQ-A11 (alerta presupuestal efectiva) |

### 6.2 Brechas por requisito

| ID | Estado | Qué falta | Propietario | Siguiente acción |
|---|---|---|---|---|
| REQ-O01 | Parcial | Evidencia de contraste y capturas son de v2; favicon derivado sin validar | Tech Lead · Cliente | Acción A; Cliente valida favicon (n.º 5) |
| REQ-O02 | Preparado | Resultado v3 de la suite y de CI | Tech Lead | Acciones A y B |
| REQ-O03 | Preparado | Resultado v3 de las pruebas de contenido | Tech Lead | Acción B |
| REQ-O04 | Preparado | Resultado v3 de las pruebas de la zona técnica | Tech Lead | Acción B |
| REQ-O05 | Parcial | Evidencia completa en cada fila; revisión del cliente | Tech Lead | Completar «Pendiente — despliegue» tras las acciones A–E |
| REQ-O06 | Parcial | Stack del sitio no desplegado; URL de CloudFront y smoke sin evidencia | Tech Lead | Acción C |
| REQ-C01 | Parcial | No consta aprobación escrita del brief (EV-01) | Cliente | Aprobar el brief / `docs/SPEC.md` §2–§5 |
| REQ-C02 | Preparado | Capturas v3 | Tech Lead | Acción A |
| REQ-C03 | Parcial | Evidencia de navegación completa en v3 (solo hay la matriz de enlaces) | Tech Lead | Acciones A y B |
| REQ-C04 | Preparado | Resultado v3 de interacción y 3D | Tech Lead | Acciones A y B |
| REQ-C05 | Preparado | Resultado v3 de las pruebas de secciones | Tech Lead | Acción B |
| REQ-C06 | Parcial | Verificación en vivo; URL oficial de login de producción | Tech Lead · Cliente | Acción C; Cliente entrega la URL (n.º 2) |
| REQ-C07 | Preparado | Resultado v3 y verificación en vivo | Tech Lead | Acciones B y C |
| REQ-C08 | Parcial | axe y contraste son de v2 | Tech Lead | Acción A |
| REQ-C09 | Parcial | Lighthouse es de v2 y local; LCP 2,9 s frente a 2,5 s | QA en vivo | Acción D; si el LCP en vivo supera 2,5 s, aplicar ADR-005 §Decisión 4 |
| REQ-C10 | Parcial | Informe de QA es de v2 | Tech Lead | Acción A |
| REQ-C11 | Parcial | Edge y Safari real sin ejecutar; matriz v2 | Tech Lead · Cliente | Acción A; ver REQ-A08 |
| REQ-C12 | Pendiente | Ronda 1 sin cerrar: copy de Infraestructura y Ambiente y copy nuevo de v3 | Cliente | Aprobar o corregir el copy; luego abrir ronda 2 si hace falta |
| REQ-C13 | Parcial | Versión publicada y manifiesto en vivo | Tech Lead | Acción C |
| REQ-C14 | Preparado | Transferencia al cliente; PR #1 sin fusionar | Tech Lead · Cliente | Fusionar el PR; entregar el repositorio y los activos |
| REQ-C15 | Preparado | Validación de los manuales por el cliente | Cliente | Revisar `docs/OPERACION.md` y `docs/CONTENIDOS.md` |
| REQ-C16 | Pendiente | Entrega final y aceptación escrita | Cliente · Tech Lead | Cerrar las demás brechas y firmar la aceptación |
| REQ-A01 | Parcial | Resultado de `check:artifact` y de las pruebas de texto sobre v3 | Tech Lead | Acción B |
| REQ-A02 | Preparado | Resultado v3 de `responsive` | Tech Lead | Acción A |
| REQ-A03 | Parcial | Login oficial y correo/teléfono aprobados | Cliente | Entregar URL, correo y teléfono (n.º 2 y n.º 3) y construir con perfil `production` |
| REQ-A04 | Preparado | Run verde de CI | Tech Lead | Acción B |
| REQ-A05 | Parcial | Metadata con dominio oficial; favicon sin validar | Cliente | Dominio (n.º 1) y favicon (n.º 5) |
| REQ-A06 | Parcial | Evidencia v3 de axe y contraste | Tech Lead | Acciones A y D |
| REQ-A07 | Parcial | Medición en CloudFront | QA en vivo | Acción D |
| REQ-A08 | Pendiente | Smoke manual en Safari real (macOS e iOS) y Edge | Cliente · Tech Lead | Completar la lista de `docs/evidence/browser-matrix.md` (n.º 9) |
| REQ-A09 | Dependencia del cliente | Dominio, ACM (us-east-1), Route 53 | Cliente | Entregar el dominio (n.º 1); luego `docs/OPERACION.md` §14 |
| REQ-A10 | Preparado | GET directo al bucket real = 403 | Tech Lead | Acción C |
| REQ-A11 | Parcial | TLS 1.2+ (dominio propio); destinatario de la alerta; activación de la etiqueta `Component` | Cliente · Tech Lead | Cliente: n.º 1 y n.º 4; Tech Lead: acciones C y F |
| REQ-A12 | Parcial | Rollback sin probar | Tech Lead | Acción E |
| REQ-B01 | Preparado | Evidencia visual v3 | Tech Lead | Acción A |
| REQ-B02 | Preparado | Contraste v3 | Tech Lead | Acción A |
| REQ-B03 | Parcial | Licencia de DIN 2014 Rounded (opcional) | Cliente | Decidir si se licencia (n.º 7); ver ADR-001 |
| REQ-B04 | Preparado | Resultado v3 de las pruebas de tríadas | Tech Lead | Acción B |
| REQ-B05 | Preparado | Resultado v3 de la prueba de jerga | Tech Lead | Acción B |
| REQ-B06 | Parcial | Aprobación del copy de Infraestructura y Ambiente | Cliente | Ver REQ-C12 |
| REQ-B07 | Preparado | Resultado v3 de la prueba de JSON-LD | Tech Lead | Acción B |

### 6.3 Dependencias del cliente (`docs/SPEC.md` §16)

| N.º | Dependencia | Requisitos que bloquea |
|---|---|---|
| 1 | Dominio productivo + ACM + Route 53 (TLS 1.2+, apex/www) | REQ-A09, A11, A05 |
| 2 | URL oficial del login de producción | REQ-C06, A03 |
| 3 | Correo/teléfono de contacto aprobados | REQ-A03 |
| 4 | Destinatario institucional de la alerta presupuestal | REQ-A11 |
| 5 | Validación del favicon derivado | REQ-A05, O01 |
| 6 | Aprobación del copy de Infraestructura y Ambiente (ronda 1) | REQ-C12, B06 |
| 7 | Licencia web DIN 2014 Rounded (opcional) | REQ-B03 |
| 8 | Menciones institucionales y logos de aliados | Ninguno (solo con aprobación escrita) |
| 9 | Smoke manual en Safari real y Edge | REQ-A08, C11 |
