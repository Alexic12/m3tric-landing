# Matriz de trazabilidad — M3TRIC Landing v3

Corte: 2026-10-01 · `main` en `7c618b7` · Release en vivo `deploy-3-7c618b7` en `https://d21guxd9tjai7a.cloudfront.net` (run `36920298884`).

Esta matriz enlaza cada requisito de `docs/SPEC.md` §0 con la sección de la spec, los archivos que lo implementan, la prueba que lo verifica y la evidencia. Es un documento de **auditoría**: dice lo que está comprobado y lo que no.

## Cómo leer esta matriz

| Columna | Qué contiene |
|---|---|
| **ID** | Identificador de `docs/SPEC.md` §0 (`REQ-O` owner · `REQ-C` contractual, Anexo 1 §5 · `REQ-A` aceptación, Anexo 1 §10 · `REQ-B` marca). |
| **Requisito** | Resumen. El texto completo está en la spec. |
| **Spec (§)** | Sección de `docs/SPEC.md` donde se especifica. |
| **Implementación** | Archivos concretos que lo cumplen (rutas relativas a la raíz del repositorio). |
| **Verificación** | Prueba exacta: archivo y título del test, o script y nombre del *check*. Ver la convención de abreviaturas abajo. |
| **Evidencia** | Ruta en `docs/evidence/` o run de GitHub Actions identificado. |
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

- **Verificado** solo si hay evidencia reproducible de la versión v3 **citada en la fila**: un run de GitHub Actions identificado, un archivo de `docs/evidence/` (todos regenerados con v3) o una prueba de plantilla de `infra/test/`. Donde la verificación depende de un hecho que solo se comprobó contra AWS o GitHub (sin salida cruda archivada), la fila lo dice y remite a `docs/evidence/live/security-hardening.md`.
- **Parcial** = hay evidencia comprobable, pero falta una parte que depende del cliente, de una prueba manual o de una aceptación escrita; la columna Evidencia dice cuál.
- **Preparado** = la implementación existe, pero no hay resultado archivado que la supere.
- Un requisito con un componente subjetivo (copy, marca, accesibilidad más allá de lo automático) **no** pasa a Verificado por tener pruebas automáticas verdes: queda Parcial hasta la aprobación o la revisión que le falta.
- Los estados se actualizan **solo** contra evidencia identificada (Anexo 1 §5, «Criterio»).

### Evidencia identificada (leída al corte)

| Fuente | Qué es | Versión / alcance |
|---|---|---|
| Run `36920298884` (Deploy staging) | `deploy-3-7c618b7`: CI (Hygiene, Infra CDK, Release gate staging y production, E2E chromium, firefox y webkit en macOS) → CDK synth → CDK deploy → Publish build → Publish publish; smoke 10/10 | v3 en vivo |
| Runs `36869421270`, `36870809775`, `36871068392` | `deploy-1-19f4f15` → `rollback-36870809775-f4bdc1c` → `deploy-2-19f4f15`; smoke 10/10 en cada uno | v3 en vivo; ciclo de rollback |
| `docs/evidence/QA-REPORT.md` | Informe v3: suite local 323 pasadas / 0 fallos / 21 omitidas; unitarias 117 pasadas; suite en vivo 41 pasadas / 0 fallos / 16 omitidas; Lighthouse en vivo; despliegue y rollback | v3 (release en vivo bajo prueba: `deploy-2-19f4f15`) |
| `docs/evidence/browser-matrix.md` | Chromium 153, Chrome 154, Firefox 155, WebKit 26.6, local y en vivo; Edge y Safari real sin ejecutar | v3 |
| `docs/evidence/contrast-hero.md`, `axe-*.json`, `lighthouse-*-gzip.report.*`, `screenshots/`, `console-3d.json`, `link-matrix.md` | Evidencia local regenerada con la suite v3 (`QA-REPORT.md` §6 y §7). `link-matrix.md` dice «2026-09-30» en el encabezado porque la fecha está escrita en `tests/e2e/links.spec.ts`; el contenido se regeneró (37 enlaces, 0 con problemas) | v3 |
| `docs/evidence/live/**` | `lighthouse-live-summary.json`, `lighthouse-{mobile,desktop}-run{1,2,3}.report.json`, `axe-*.json`, `screenshots/` contra CloudFront | v3 en vivo, medido sobre `deploy-2-19f4f15` |
| `docs/evidence/live/security-hardening.md` | Auditoría de seguridad, migración, simulación de 13 políticas, CloudTrail, cabeceras, gobernanza de GitHub, riesgos residuales; suite en vivo 41/0/16 repetida sobre `deploy-3-7c618b7` | 2026-10-01 |

### Convención de abreviaturas en «Verificación»

- **E2E** (Playwright, `tests/e2e/<nombre>.spec.ts`): `content`, `links`, `responsive`, `visual`, `interaction`, `resilience`, `a11y`, `three`. Se escribe `archivo › «título del test»`.
- **En vivo** (`npm run test:live`, `tests/live/`): `runtime`, `menu`, `a11y`, `screenshots`, `http` (ver `QA-REPORT.md` §4).
- **Unitarias** (`npm run test:unit`, `node --test`): `config.test` = `scripts/check-config.test.mjs` · `rules.test` = `scripts/lib/artifact-rules.test.mjs` · `hygiene.test` = `scripts/hygiene.test.mjs` · `manifest.test` = `scripts/deploy/manifest.test.mjs`.
- **IaC** (`cd infra && npm test`, vitest): `app.test` = `infra/test/app.test.ts` · `site.test` = `infra/test/landing-site-stack.test.ts` · `identity.test` = `infra/test/delivery-identity-stack.test.ts` · `infra-config.test` = `infra/test/config.test.ts`.
- **Gates y scripts**: `check:config` (`scripts/check-config.mjs`) · `check:artifact` (`scripts/check-artifact.mjs`) · `hygiene` (`scripts/hygiene.sh`) · `smoke «nombre»` (`scripts/deploy/smoke.mjs`, se ejecuta en el workflow `publish.yml`) · `evidence:*` (scripts de `package.json`).
- **CI** = `.github/workflows/ci.yml`; **Deploy** = `deploy.yml`; **Publish** = `publish.yml`; **Rollback** = `rollback.yml`.
- **Run de despliegue** = run `36920298884` salvo que la fila cite otro.

Los títulos de test están en inglés porque así están escritos en los archivos; se citan literalmente.

---

## 1. Requisitos del owner (REQ-O)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-O01 | Diseño basado en el manual de marca | §3 | `src/app/globals.css` (`@theme`), `src/config/brand.ts`, `src/components/brand/{Logo,TripleBar,NodeNetwork}.tsx`, `src/app/layout.tsx` (Barlow) | `npm run evidence:contrast` (`tests/helpers/contrast.mjs` + `contrast.py`) · `visual › «full-page screenshot at 1280px»` | `docs/evidence/contrast-hero.md` (v3: 45 filas, 0 incumplimientos) · `docs/evidence/screenshots/` (v3) · `docs/evidence/live/screenshots/` (360 y 1280 px en 3 motores). **Falta**: validación de marca del favicon derivado (cliente n.º 5) y de la fidelidad al manual; ninguna prueba automática la juzga | Parcial |
| REQ-O02 | 100 % funcional, grado *production release*, con pruebas visuales | §1, §6, §8, §13 | `package.json` (`release`), `.github/workflows/ci.yml` (jobs `web`, `e2e`, `infra`), `tests/e2e/**` | `visual › «full-page screenshot at 360px»` (y 768, 1280, 1920) · todas las suites E2E · CI · `npm run release` con ambos perfiles | Run de despliegue: CI verde, incluido `Release gate (production)` · `QA-REPORT.md` §3 (323 pasadas / 0 fallos) y §4 (41 / 0 / 16 en vivo) · capturas en vivo en `docs/evidence/live/screenshots/`. Los snapshots de regresión visual son solo locales (chromium, ADR-006); la cobertura de Safari/Edge reales se sigue en REQ-A08 | Verificado |
| REQ-O03 | Página para usuarios no técnicos, centrada en lo que obtienen | §2, §5.1–§5.7 | `src/content/landing.ts` (`hero`, `benefits`, `useCases`, `howItWorks`, `faq`), `src/components/sections/{Hero,Benefits,UseCases,HowItWorks,Faq}.tsx` | `content › «the value zone avoids unexplained jargon (spec section 2)»` · `content › «hero states the outcomes: three of them, each with a label and one line»` · `content › «benefits: three outcome cards, each with its deliverables and an honest status»` | Pruebas verdes en CI y en `QA-REPORT.md` §3 (`content` 22/0/0 por motor). **Falta**: aprobación escrita del copy nuevo de v3 (ronda 1, REQ-C12); la prueba solo detecta jerga, no juzga si el texto es comprensible para el público | Parcial |
| REQ-O04 | Profundidad técnica más abajo, nivel *enterprise* | §4.1, §5.8 | `src/components/sections/TechnicalZone.tsx`, `src/content/landing.ts` (`technical`) | `content › «technical zone: the three spec-sheet blocks with honest availability»` · `content › «value zone comes first: the technical zone sits after the FAQ and before the contact»` · en vivo `runtime · estructura` (orden de las 9 secciones) | `QA-REPORT.md` §3 y §4 · CI del run de despliegue · capturas en vivo | Verificado |
| REQ-O05 | Spec completa, trazable end to end, todo documentado | §0, §14 | `docs/SPEC.md` (v3.2), `docs/TRACEABILITY.md`, `docs/adr/ADR-001..007`, `docs/OPERACION.md`, `docs/CONTENIDOS.md`, `docs/ASSETS.md`, `infra/README.md`, `README.md`, `CHANGELOG.md`, `docs/evidence/live/security-hardening.md` | Revisión documental contra los archivos fuente (sin prueba automática); `hygiene` cubre solo archivos prohibidos | Este documento. Cada fila de evidencia remite a un run o archivo identificado. **Falta**: revisión independiente de la documentación y revisión del cliente (REQ-C15) | Parcial |
| REQ-O06 | Despliegue por IaC con GitHub Actions hasta tener URL de CloudFront funcional | §10, §11 | `infra/bin/landing.ts`, `infra/lib/{landing-app,delivery-identity-stack,landing-site-stack,config,names,nag}.ts`, `infra/config/staging.json`, `.github/workflows/{ci,deploy,publish,rollback}.yml`, `scripts/deploy/{publish.sh,smoke.mjs,manifest.mjs,upload-manifest.sh}` | `app.test › «selects stacks by their physical names (cdk deploy m3tric-staging-LandingSiteStack)»` · `site.test › «outputs exactly the values the deploy workflow reads»` · `identity.test › «defines the role with the exact name, path and one-hour session cap»` · smoke (10 checks, `docs/OPERACION.md` §8) | URL funcional `https://d21guxd9tjai7a.cloudfront.net` desplegada por Actions: runs `36869421270`, `36871068392` y `36920298884` (todos los jobs verdes, smoke 10/10); `deploy-3-7c618b7` en vivo por la cadena de entrega endurecida (`docs/evidence/live/security-hardening.md` §2) | Verificado |

## 2. Requisitos contractuales (REQ-C, Anexo 1 §5)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-C01 | Brief y estructura | §2, §4, §5 | `docs/SPEC.md`, `src/content/landing.ts` | Revisión documental; aprobación del brief por el cliente (EV-01 del Anexo) | No consta aprobación escrita en el repositorio | Parcial |
| REQ-C02 | UX/UI responsive alineado a la identidad | §3, §4.1, §6 | `src/app/globals.css`, `src/components/**` | `responsive › «no horizontal overflow at 360px»` (y 320, 390, 768, 1024, 1280, 1440, 1920) · `visual › «full-page screenshot at 360px»` (y 768, 1280, 1920) · en vivo `runtime · desbordamiento` (360, 390, 768, 1280, 1920) | `QA-REPORT.md` §3 (`responsive` 8/0/0 por motor) y §4 (5/5 por motor en vivo) · `docs/evidence/screenshots/` y `docs/evidence/live/screenshots/` | Verificado |
| REQ-C03 | Arquitectura de información y navegación | §4 | `src/app/page.tsx`, `src/content/landing.ts` (`navItems`), `src/components/layout/{Header,Footer,SkipLink}.tsx` | `content › «all nine sections exist with their anchor ids, in the v3 order»` · `interaction › «nav link #beneficios lands clear of the header and becomes current»` (una por cada ancla de `NAV_IDS`) · `links › «link matrix (EV-06)»` · en vivo `runtime · estructura` | `docs/evidence/link-matrix.md` (37 enlaces, 0 con problemas) · `QA-REPORT.md` §3 y §4 (9 secciones en orden, un `h1`) | Verificado |
| REQ-C04 | Frontend funcional con recursos visuales e interactivos | §3.5, §6 | `src/components/**`, `src/components/three/{TerrainScene,TerrainFallback}.tsx`, `next.config.ts` (`output: "export"`) | `interaction › «tablist semantics and keyboard pattern»` · `interaction › «the first answer starts open, the rest closed; a click opens and closes»` · `three › «3D scene mounts a canvas when #escalas scrolls into view»` · `three › «stays on the SVG fallback»` · en vivo `runtime · recorrido completo` (visor 3D con 1 `<canvas>` en chromium; `3d` en los tres motores) y `menu` | `docs/evidence/console-3d.json` (sin errores; 1 advertencia conocida de `THREE.Clock`) · `QA-REPORT.md` §3 y §4 (0 errores de consola, 0 violaciones CSP en vivo) | Verificado |
| REQ-C05 | Secciones: propuesta de valor, plataforma, escalas M1/M2/M3, productos, capacidades, tecnología, casos de uso, contacto, CTA | §4, §5 | `src/components/sections/{Hero,Benefits,UseCases,HowItWorks,Scales,WhyM3tric,Faq,TechnicalZone,Contact}.tsx` | `content › «benefits: three outcome cards…»` · `content › «use cases: four cases, each split into the situation and what the user obtains»` · `content › «how it works: four ordered steps and the illustrative product view»` · `content › «scale tabs carry the plain-language labels»` · `content › «why M3TRIC: the three brand values»` · `content › «technical zone: the three spec-sheet blocks…»` · en vivo `runtime · estructura` | CI del run de despliegue · `QA-REPORT.md` §3 y §4. La existencia de las secciones está verificada; la aprobación de su copy sigue en REQ-C12 | Verificado |
| REQ-C06 | Conexión por URL a la plataforma | §5.1, §5.9, §9 | `src/config/site.ts` (`platformUrl`), `Hero.tsx`, `Header.tsx`, `Contact.tsx` | `links › «link matrix (EV-06)»` (≥ 3 CTA de plataforma = `PLATFORM_URL`) · `check:artifact` · smoke «Every "Abrir plataforma" link equals PLATFORM_URL» · en vivo `runtime · CTAs de staging` · `config.test › «PLATFORM_URL rejections»` | En vivo contra la plataforma de staging (`https://d3pz2gipvkcx1b.cloudfront.net/login`): smoke de los tres deploys y `QA-REPORT.md` §4. **Falta**: URL oficial del login de producción (cliente n.º 2) | Parcial |
| REQ-C07 | SEO técnico | §7 | `src/app/layout.tsx` (metadata, Open Graph, JSON-LD `Organization` + `WebSite` + `FAQPage`), `src/app/robots.ts`, `src/app/sitemap.ts`, `public/og.png` | `content › «title and meta description are non-empty Spanish»` · `content › «canonical and og:url start with SITE_URL»` · `content › «og:image is absolute, reachable, a 1200x630 PNG»` · `content › «JSON-LD parses; Organization and WebSite declare M3TRIC / Metric; FAQPage mirrors the visible FAQ»` · `resilience › «robots.txt has no non-standard Host directive»` · `rules.test › «profileProblems»` · smoke «og.png, sitemap.xml, manifest.webmanifest» | CI del run de despliegue (`Release gate (production)` valida el perfil indexable) · smoke 10/10 en los tres deploys · Lighthouse en vivo: SEO 69 solo por `is-crawlable` (efecto de `noindex`, ADR-004; las demás auditorías pasan, `QA-REPORT.md` §5) · Lighthouse local con perfil production: SEO 100 (`QA-REPORT.md` §6). La medición con dominio oficial es parte de REQ-A05 | Verificado |
| REQ-C08 | Accesibilidad WCAG 2.1 AA | §8 | `src/components/layout/{Header,SkipLink,HydrationMarker}.tsx`, `src/components/ui/Reveal.tsx`, `src/app/globals.css` | `a11y › «no serious/critical violations at 1280px»` (y `390px`, y `390px with the menu open`) · `a11y › «every [data-reveal] is fully opaque immediately after load»` · `a11y › «all section headings are visible with opacity 1»` · `interaction › «opens, traps focus, closes with Escape and restores focus»` · `interaction › «skip link is the first tab stop and moves to #contenido»` · `content › «every section[aria-labelledby] points to an existing heading…»` · `content › «heading levels never skip a level»` · en vivo `a11y` (axe a 1280 y 390) | axe local: 0 violaciones serious/critical en los 3 escenarios (`axe-1280.json`, `axe-390.json`, `axe-390-menu-open.json`) · axe en vivo: 0 violaciones a 1280 y 390 (`live/axe-*.json`) · contraste sobre fotografía medido: 45 filas, 0 incumplimientos, margen mínimo 0.03 (`contrast-hero.md`). **Falta**: revisión manual con lector de pantalla; axe automatizado no certifica conformidad AA completa | Parcial |
| REQ-C09 | Optimización de rendimiento | §8, ADR-005 | `next.config.ts`, `src/app/layout.tsx` (`next/font`), `public/images/*.webp`, carga diferida del visor 3D | `npm run evidence:lighthouse` (local) · `npm run evidence:live-lighthouse` (CloudFront) | Lighthouse en CloudFront (3 corridas por factor, `docs/evidence/live/lighthouse-live-summary.json`): móvil Perf 100 / A11y 100 / BP 100, **LCP 1,52 s** (presupuesto 2,5 s), CLS 0, TBT 5 ms; escritorio LCP 0,35 s (`QA-REPORT.md` §5; D-1 cerrado, ADR-005). Medido sobre `deploy-2-19f4f15`; no repetido sobre `deploy-3-7c618b7` | Verificado |
| REQ-C10 | Pruebas de calidad documentadas | §13 | `tests/e2e/**`, `tests/helpers/**`, `scripts/**/*.test.mjs`, `infra/test/**` | `npm run test:e2e`, `npm run test:unit`, `cd infra && npm test`, `npm run test:live` | `docs/evidence/QA-REPORT.md` (v3: local 323 pasadas / 0 fallos / 21 omitidas intencionales; unitarias 117 / 0; en vivo 41 / 0 / 16) · CI del run de despliegue (job `Infra (CDK)` verde: cierra D-7 del informe) | Verificado |
| REQ-C11 | Chrome, Edge, Firefox, Safari | §13, ADR-006 | `playwright.config.ts` (`chromium`, `firefox`, `webkit`, `chrome`) | CI job `E2E (chromium)`, `E2E (firefox)`, `E2E (webkit)` (WebKit en `macos-15`) · local: proyecto `chrome` | `docs/evidence/browser-matrix.md` (Chromium 153, Chrome 154, Firefox 155, WebKit 26.6; local y en vivo). **Edge y Safari real no ejecutados** (ver REQ-A08) | Parcial |
| REQ-C12 | Hasta dos rondas de ajustes | §16.6 | Marcas «Pendiente de aprobación editorial (ronda de ajustes 1)» en `src/content/landing.ts` (`useCases.items`: Infraestructura y Ambiente) | Proceso con el cliente; sin prueba automática | **Ronda 1 abierta.** Pendiente de aprobación: copy de Infraestructura y Ambiente, más el copy nuevo de v3 redactado por WU-R1 (Beneficios, Casos de uso, Cómo funciona, Preguntas frecuentes, textos de Contacto), para el que no consta aprobación escrita | Pendiente |
| REQ-C13 | Configuración de despliegue y versión publicada | §9–§11 | `infra/**`, `.github/workflows/*.yml`, `scripts/deploy/*`, `scripts/lib/release-config.mjs`, `.env.example` | `app.test`, `site.test`, `identity.test`, `infra-config.test` · `config.test › «release profiles (ADR-003)»` · `hygiene.test › «a tag-pinned action fails»` | Versión publicada `deploy-3-7c618b7` (commit `7c618b7`, perfil staging) por el run `36920298884`; manifiesto en `/_deploy/manifest.json` y artefacto `deploy-manifest-deploy-3-7c618b7`. Para `deploy-2-19f4f15`, `QA-REPORT.md` §8 registra el manifiesto (66 archivos con sha256, `smoke.passed: true`, coincide con el meta `m3tric:release`) | Verificado |
| REQ-C14 | Código y activos | §14 | Repositorio (`main` en `7c618b7`; PR #1 y #11 fusionados), `docs/ASSETS.md` | `hygiene` (sin archivos prohibidos ni conflictos) · `hygiene.test › «a clean repo passes (SHA-pinned action with comment, local reusable workflow, .env.example)»` | Código en `main` con `Hygiene` verde y ruleset `main-protegida` (`security-hardening.md` §5). **Falta**: transferencia del repositorio y los activos al cliente y aceptación escrita | Parcial |
| REQ-C15 | Manual técnico y guía de contenidos | §14 | `docs/OPERACION.md`, `docs/CONTENIDOS.md`, `README.md`, `infra/README.md`, `docs/ASSETS.md` | Revisión documental contra los archivos fuente | Documentos actualizados al pipeline y al modelo de seguridad vigentes en este corte; validación por el cliente: pendiente | Preparado |
| REQ-C16 | Entrega final | Anexo 1 §2.1 | — | Requiere evidencia verificable de la versión publicada, URL de plataforma, código y activos transferidos, pruebas, documentación y aceptación escrita | La versión publicada y las pruebas están evidenciadas (filas anteriores); faltan la URL oficial de plataforma, la transferencia y la aceptación escrita | Pendiente |

## 3. Criterios de aceptación (REQ-A, Anexo 1 §10)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-A01 | Sin placeholders ni enlaces vacíos | §9 | `scripts/check-artifact.mjs` (reglas `STRICT`/`HOSTS`, archivos requeridos), `src/config/site.ts` | `check:artifact` · `content › «rendered text contains no forbidden strings»` · `content › «forbidden strings are also absent from href/src/alt attributes»` · `links › «link matrix (EV-06)»` · en vivo `runtime · recorrido completo` (0 `requestfailed`, 0 terceros) | `docs/evidence/link-matrix.md` (37 enlaces, 0 con problemas) · `Release gate (staging)` y `Release gate (production)` verdes en el run de despliegue (ambos ejecutan `check:artifact`) · `QA-REPORT.md` §4 | Verificado |
| REQ-A02 | 360 px a escritorio amplio sin desbordes | §8 | `src/app/globals.css`, `src/components/**` | `responsive › «no horizontal overflow at 360px»` (320, 390, 768, 1024, 1280, 1440, 1920) · en vivo `runtime · desbordamiento` | `QA-REPORT.md` §3 (8 anchos × 4 motores locales) y §4 (5 anchos × 3 motores en CloudFront) | Verificado |
| REQ-A03 | CTA y contactos funcionan; login oficial | §5.9, §9 | `src/config/site.ts` (`mailtoHref`), `src/components/sections/Contact.tsx`, `Header.tsx`, `Footer.tsx` | `links › «link matrix (EV-06)»` (`mailto:` con asunto, `tel:` exacto) · `interaction › «header shows the compact primary 'Hablar'; the menu offers both CTAs and 'Hablar con el equipo' lands on #contacto»` · `config.test › «CONTACT_EMAIL and PHONE»` | `docs/evidence/link-matrix.md` (con dominios y correo de prueba) · en vivo (staging): CTA de plataforma correctos, 0 `mailto:`/`tel:` y texto de canales pendientes visible. **Login oficial de producción y correo/teléfono aprobados: dependencia del cliente n.º 2 y n.º 3**. D-3 abierto (asunto del `mailto`) | Parcial |
| REQ-A04 | Build y lint sin errores; `out/` presente | §9 | `package.json` (`release`), `scripts/check-config.mjs`, `scripts/check-artifact.mjs`, `next.config.ts` | `npm run release` · CI job `Release gate (staging)` y `Release gate (production)` · `check:artifact` (archivos requeridos en `out/`) | Run `36920298884`: `Release gate (staging)`, `Release gate (production)` y `Publish build` verdes (ejecutan `npm run release`: unitarias, config, lint, typecheck, build, artefacto) | Verificado |
| REQ-A05 | Metadata, OG, favicon, sitemap y robots **del dominio** | §7 | `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/{og.png,icon.svg,apple-icon.png,icon-192.png,icon-512.png}` | `check:artifact` (archivos requeridos, perfil, `SITE_URL` en `sitemap.xml`) · `content › «canonical and og:url start with SITE_URL»` · smoke «og.png, sitemap.xml, manifest.webmanifest» | Con el dominio de CloudFront: smoke 10/10. **Falta**: dominio oficial (cliente n.º 1) y validación del favicon derivado (cliente n.º 5); en staging `noindex` (ADR-004) | Parcial |
| REQ-A06 | Teclado, foco, contraste, alternativas, movimiento | §8 | Igual que REQ-C08 | Igual que REQ-C08, más `a11y › «every [data-reveal] is fully opaque immediately after load»` (movimiento reducido), `a11y › «all section headings are visible with opacity 1»` (sin JS), `interaction › «keyboard: Enter and Space toggle a focused question and the focus ring is visible»`, `three › «uses the fallback even when WebGL is available»` y en vivo `menu` (trampa de foco con Tab / Shift+Tab reales, Escape devuelve el foco) | `QA-REPORT.md` §3, §4 y §7 · `contrast-hero.md` (45 filas, 0 incumplimientos) · `axe-*.json` locales y `live/axe-*.json` (0 violaciones). Cada ítem del criterio (teclado, foco, contraste, alternativas, movimiento) tiene una prueba verde | Verificado |
| REQ-A07 | Lighthouse documentado | §8, ADR-005 | Igual que REQ-C09 | `npm run evidence:lighthouse` · `npm run evidence:live-lighthouse` | `docs/evidence/live/lighthouse-live-summary.json` y `lighthouse-{mobile,desktop}-run{1,2,3}.report.json` (`QA-REPORT.md` §5): móvil 100 / 100 / 100 / SEO 69, LCP 1,52 s; escritorio 100 / 100 / 100 / SEO 69, LCP 0,35 s. SEO 69 es esperado en staging (`noindex`); **debe repetirse con el perfil production**. Local: `lighthouse-*-gzip.report.*` | Verificado |
| REQ-A08 | Smoke en 4 navegadores | §13 | `playwright.config.ts`, lista de verificación de `docs/evidence/browser-matrix.md` | Automático: Chromium, Firefox, WebKit (CI y en vivo) y Chrome (local). **Manual: Safari real (macOS e iOS) y Edge** | `docs/evidence/browser-matrix.md`: Chromium, Chrome, Firefox y WebKit sin fallos; lista de Safari sin completar; Edge «No ejecutado». Playwright WebKit no es Safari | Parcial |
| REQ-A09 | Dominio y HTTPS | §10.2, §16.1 | — (el sitio usa el dominio `*.cloudfront.net`; supresión `AwsSolutions-CFR4` documentada en `infra/lib/landing-site-stack.ts` y `infra/README.md`) | — | Requiere dominio productivo, ACM (us-east-1) y Route 53, que provee el cliente. HTTPS funciona con el certificado por defecto (`http://` → 301 a `https://`, `QA-REPORT.md` §4); TLS 1.0/1.1 sigue aceptado (`security-hardening.md` §7) | Dependencia del cliente |
| REQ-A10 | S3 privado, SSE-S3, versionado, OAC, GET directo = 403 | §10.2, §11.4 | `infra/lib/landing-site-stack.ts` (`SiteBucket`, `Distribution`, OAC) | `site.test › «configures the site bucket exactly: BPA, SSE-S3, versioning, owner-enforced, 90-day noncurrent expiry, access logs»` · `site.test › «lets only CloudFront (this distribution, via OAC) read the site bucket, over TLS»` · `site.test › «uses one Origin Access Control and no Origin Access Identity»` · smoke «Direct S3 GET -> 403 (bucket is private)» | Smoke check 10 (`GET` directo al bucket real → 403, 0 omitidos) en los runs `36869421270`, `36871068392` y `36920298884` · plantillas probadas en `Infra (CDK)` (verde) · bucket de assets propio con Block Public Access total (`security-hardening.md` §2, paso a) | Verificado |
| REQ-A11 | TLS 1.2+, cabeceras/CSP, retención, alerta presupuestal, sin credenciales largas | §10, §12 | `infra/lib/landing-site-stack.ts` (`ResponseHeadersPolicy`, `LogsBucket`, `CfnBudget`, `Topic`), `infra/lib/delivery-identity-stack.ts` | `site.test › «sends the exact SPEC §10.2 security headers, overriding the origin, plus X-Robots-Tag in staging»` · `site.test › «configures the logs bucket exactly: BPA, SSE-S3, owner-preferred for CloudFront logs, 90-day expiry»` · `site.test › «budgets USD 10/month on Component=landing and alerts at 80% actual spend»` · `identity.test` (confianza exacta: `aud` y tres `sub`) · `app.test › «reports zero unacknowledged findings across the whole app»` · smoke «Security headers on /» | Cabeceras en vivo: las 7 presentes y las del origen quitadas (`security-hardening.md` §6; `QA-REPORT.md` §4 `http`). Sin credenciales largas: solo OIDC, CloudTrail sin `AssumeRole` sobre roles `cdk-hnb659fds-*` (`security-hardening.md` §4). Retención de logs 90 días (plantilla). **Falta**: TLS 1.2+ (dominio propio, cliente n.º 1 / REQ-A09); el tema SNS no tiene suscripción (cliente n.º 4); la etiqueta `Component` no está activada en Billing | Parcial |
| REQ-A12 | Rollback probado, IaC, manuales, inventario | §11.6, ADR-007 | `.github/workflows/rollback.yml`, `infra/**`, `docs/OPERACION.md`, `docs/ASSETS.md` | `manifest.test › «assembles every documented field»` · ejecución de `rollback.yml` | Rollback probado: run `36870809775` → `rollback-36870809775-f4bdc1c`, smoke 10/10, restauración con `36871068392` → `deploy-2-19f4f15` (ADR-007, `QA-REPORT.md` §8). IaC: `infra/` con `Infra (CDK)` verde. Manuales: `docs/OPERACION.md`, `infra/README.md`. Inventario: `docs/ASSETS.md` (no re-revisado en este corte) | Verificado |

## 4. Marca (REQ-B)

| ID | Requisito | Spec (§) | Implementación | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| REQ-B01 | Logo oficial y variantes (lám. 8, 11) | §3.4 | `src/components/brand/Logo.tsx` (`color`, `reverse`, `mono-dark`, `mono-light`), `public/icon.svg` | Sin prueba dedicada; regresión visual `visual › «full-page screenshot at 1280px»` | Capturas locales y en vivo (`docs/evidence/screenshots/`, `live/screenshots/`). **Falta**: revisión de marca contra el manual; el favicon derivado espera validación (cliente n.º 5) | Parcial |
| REQ-B02 | Paleta exacta (lám. 10) | §3.2 | `src/app/globals.css` (`@theme`), `src/config/brand.ts` | `npm run evidence:contrast` · `visual › «full-page screenshot at 1280px»` | `docs/evidence/contrast-hero.md` (v3, 0 incumplimientos). Mide el contraste, **no** que cada token coincida con el manual: no hay prueba que compare los valores hexadecimales | Parcial |
| REQ-B03 | Tipografía DIN 2014 Rounded o sustituto declarado | §3.3, ADR-001 | `src/app/layout.tsx` (`Barlow`), `src/app/globals.css` (`--font-sans`) | Sin prueba automática (decisión documentada) | `docs/adr/ADR-001-barlow-sustituto-din-2014-rounded.md`. Licencia web de DIN 2014 Rounded: dependencia del cliente n.º 7 (opcional) | Parcial |
| REQ-B04 | El «3» como sistema: tríadas y tres barras | §3.1 | `src/components/brand/TripleBar.tsx`, `src/content/landing.ts` (`hero.outcomes`, `benefits.items`, `scales.items`, `whyM3tric.values`) | `content › «hero states the outcomes: three of them, each with a label and one line»` · `content › «scale tabs carry the plain-language labels»` · `content › «why M3TRIC: the three brand values»` | CI del run de despliegue · `QA-REPORT.md` §3 | Verificado |
| REQ-B05 | Tono de voz técnico, comprensible, cercano | §2 | `src/content/landing.ts` | `content › «the value zone avoids unexplained jargon (spec section 2)»` | Prueba verde (solo jerga). **Falta**: aprobación editorial del tono (ronda 1, REQ-C12) | Parcial |
| REQ-B06 | Alcance más allá del riesgo: cultivos, terreno, infraestructura, ambiente | §5.3 | `src/content/landing.ts` (`useCases.items`), `src/components/sections/UseCases.tsx` | `content › «use cases: four cases, each split into the situation and what the user obtains»` | Prueba verde. Copy de Infraestructura y Ambiente pendiente de aprobación (ronda 1, REQ-C12) | Parcial |
| REQ-B07 | SEO «Metric» vs «M3TRIC» | §7 | `src/app/layout.tsx` (`alternateName: "Metric"`, palabras clave) | `content › «JSON-LD parses; Organization and WebSite declare M3TRIC / Metric; FAQPage mirrors the visible FAQ»` | CI del run de despliegue · `QA-REPORT.md` §3 | Verificado |

---

## 5. Resumen por estado

| Estado | REQ-O | REQ-C | REQ-A | REQ-B | Total | Antes (corte previo) |
|---|---|---|---|---|---|---|
| Verificado | 3 | 8 | 7 | 2 | **20** | 0 |
| Parcial | 3 | 5 | 4 | 5 | **17** | 20 |
| Preparado | 0 | 1 | 0 | 0 | **1** | 17 |
| Pendiente | 0 | 2 | 0 | 0 | **2** | 3 |
| Dependencia del cliente | 0 | 0 | 1 | 0 | **1** | 1 |
| **Total** | 6 | 16 | 12 | 7 | **41** | 41 |

Verificados: REQ-O02, O04, O06 · C02, C03, C04, C05, C07, C09, C10, C13 · A01, A02, A04, A06, A07, A10, A12 · B04, B07.

Cambios de estado respecto al corte anterior (41 filas):
- **20 pasan a Verificado**: 11 desde Preparado (REQ-O02, O04, C02, C04, C05, C07, A02, A04, A10, B04, B07) y 9 desde Parcial (REQ-O06, C03, C09, C10, C13, A01, A06, A07, A12).
- **6 pasan a Parcial**: REQ-A08 desde Pendiente (Chromium, Firefox, WebKit y Chrome ya tienen resultado; faltan Safari real y Edge) y desde Preparado REQ-O03 (falta la aprobación del copy), C14, B01, B02 y B05 (hay evidencia comprobable; falta validación del cliente o de marca).
- **Sin cambio de estado**: 11 Parcial (REQ-O01, O05, C01, C06, C08, C11, A03, A05, A11, B03, B06), 1 Preparado (REQ-C15), 2 Pendiente (REQ-C12, C16) y 1 Dependencia del cliente (REQ-A09). Su evidencia sí se actualizó.

## 6. Brechas abiertas

Quedan 21 requisitos sin cerrar (17 Parcial, 1 Preparado, 2 Pendiente, 1 Dependencia del cliente). Ninguna brecha técnica bloqueante: lo que falta es de **cliente** (insumos, aprobaciones, aceptación), de **pruebas manuales** (Safari real, Edge) o de **operación** (Billing). Propietarios: **Tech Lead** (equipo de desarrollo), **Cliente** (EAFIT / M3TRIC), **Dueño de la cuenta AWS**.

### 6.1 Acciones transversales

Cerradas en este corte (ya no son brechas):

| Acción | Cierre |
|---|---|
| A. Suite v3 completa en local y evidencia regenerada | `QA-REPORT.md` §3, §6 y §7 |
| B. Run verde de CI | Run `36920298884` |
| C. Primer despliegue con manifiesto, smoke y URL | Runs `36869421270`, `36871068392`, `36920298884` |
| D. QA en vivo (Playwright y Lighthouse contra CloudFront) | `QA-REPORT.md` §4 y §5; `docs/evidence/live/` |
| E. Prueba de rollback | Run `36870809775` (ADR-007) |

Abiertas:

| Acción | Propietario | Qué cierra |
|---|---|---|
| F. Activar la etiqueta de asignación de costos `Component` en Billing | Tech Lead | Parte de REQ-A11 (alerta presupuestal efectiva) |
| G. Suscribir al destinatario institucional al tema SNS `m3tric-staging-landing-budget-alerts` | Cliente (n.º 4) y Tech Lead | Parte de REQ-A11 |
| H. Smoke manual en Safari real (macOS e iOS) y Edge, completando `docs/evidence/browser-matrix.md` | Tech Lead · Cliente | REQ-A08, C11 |
| I. Dominio, ACM (us-east-1) y Route 53; luego repetir Lighthouse y la suite en vivo con el perfil production | Cliente (n.º 1) y Tech Lead | REQ-A09, A11 (TLS 1.2+), A05; actualiza REQ-A07 y C07 |
| J. Aprobar el copy de la ronda 1 | Cliente (n.º 6) | REQ-C12, O03, B05, B06 |
| K. Aceptación escrita y transferencia del repositorio y los activos | Cliente · Tech Lead | REQ-C14, C16, C01 |

### 6.2 Brechas por requisito (solo los no verificados)

| ID | Estado | Qué falta | Propietario | Siguiente acción |
|---|---|---|---|---|
| REQ-O01 | Parcial | Validación de marca (favicon derivado y fidelidad al manual) | Cliente | Cliente valida favicon (n.º 5) |
| REQ-O03 | Parcial | Aprobación escrita del copy nuevo de v3 | Cliente | Acción J |
| REQ-O05 | Parcial | Revisión independiente de la documentación; revisión del cliente | Tech Lead · Cliente | Revisión cruzada de `docs/` antes de la entrega |
| REQ-C01 | Parcial | No consta aprobación escrita del brief (EV-01) | Cliente | Aprobar el brief / `docs/SPEC.md` §2–§5 |
| REQ-C06 | Parcial | URL oficial del login de producción | Cliente | Entregar la URL (n.º 2) |
| REQ-C08 | Parcial | Revisión manual con lector de pantalla; margen de contraste del lead del hero a 390 px es 0.03 (cualquier cambio de foto, velo o tamaño obliga a repetir la medición) | Tech Lead | Auditoría manual de accesibilidad; repetir `evidence:contrast` ante cambios visuales |
| REQ-C11 | Parcial | Edge y Safari real sin ejecutar | Tech Lead · Cliente | Acción H |
| REQ-C12 | Pendiente | Ronda 1 sin cerrar: copy de Infraestructura y Ambiente y copy nuevo de v3 | Cliente | Acción J; luego abrir ronda 2 si hace falta |
| REQ-C14 | Parcial | Transferencia al cliente y aceptación escrita | Tech Lead · Cliente | Acción K |
| REQ-C15 | Preparado | Validación de los manuales por el cliente | Cliente | Revisar `docs/OPERACION.md` y `docs/CONTENIDOS.md` |
| REQ-C16 | Pendiente | Entrega final y aceptación escrita | Cliente · Tech Lead | Cerrar las demás brechas y firmar la aceptación |
| REQ-A03 | Parcial | Login oficial y correo/teléfono aprobados; D-3 (asunto del `mailto`) | Cliente | Entregar URL, correo y teléfono (n.º 2 y n.º 3) y construir con perfil `production` |
| REQ-A05 | Parcial | Metadata con dominio oficial; favicon sin validar | Cliente | Dominio (n.º 1) y favicon (n.º 5) |
| REQ-A08 | Parcial | Smoke manual en Safari real (macOS e iOS) y Edge | Cliente · Tech Lead | Acción H (n.º 9) |
| REQ-A09 | Dependencia del cliente | Dominio, ACM (us-east-1), Route 53 | Cliente | Entregar el dominio (n.º 1); luego `docs/OPERACION.md` §14 |
| REQ-A11 | Parcial | TLS 1.2+ (dominio propio); destinatario de la alerta; activación de la etiqueta `Component` | Cliente · Tech Lead | Cliente: n.º 1 y n.º 4; Tech Lead: acción F |
| REQ-B01 | Parcial | Revisión de marca contra el manual | Cliente | Validación de marca (n.º 5 para el favicon) |
| REQ-B02 | Parcial | Prueba que compare los tokens con la paleta del manual | Tech Lead | Añadir una prueba de tokens o aceptar la revisión visual de marca |
| REQ-B03 | Parcial | Licencia de DIN 2014 Rounded (opcional) | Cliente | Decidir si se licencia (n.º 7); ver ADR-001 |
| REQ-B05 | Parcial | Aprobación editorial del tono | Cliente | Acción J |
| REQ-B06 | Parcial | Aprobación del copy de Infraestructura y Ambiente | Cliente | Ver REQ-C12 |

### 6.3 Notas sobre requisitos Verificados

Condiciones con las que hay que leer el estado:

- **REQ-A07 / REQ-C09 / REQ-C07**: Lighthouse se midió sobre `deploy-2-19f4f15` y no se repitió sobre `deploy-3-7c618b7`. SEO 69 en staging es consecuencia del `noindex`; con el perfil production debe volver a 100 y hay que medirlo (acción I).
- **REQ-O02**: «grado *production release*» se verifica con el gate de perfil production y dominios de verificación, no con un despliegue de producción (no existe `production.json`, `docs/OPERACION.md` §14). Los snapshots visuales son solo locales (ADR-006).
- **REQ-A12**: el inventario (`docs/ASSETS.md`) no se re-revisó en este corte.
- **REQ-A10 / REQ-A11 / REQ-O06 (seguridad de la entrega)**: la simulación de políticas, CloudTrail, las cabeceras del borde y la gobernanza de GitHub están en `docs/evidence/live/security-hardening.md`, con las salidas crudas archivadas en `docs/evidence/live/security-raw-2026-10-01.txt` (los comandos están en `infra/README.md`).
- **Defectos abiertos del informe de QA**: D-3 (asunto del `mailto`, decisión de redacción) y D-6 (`three.spec.ts › console is clean…` es sensible al aviso del driver de Chrome; no afecta a CI, que no ejecuta el proyecto `chrome`). D-7 queda cerrado por el job `Infra (CDK)` verde.

### 6.4 Riesgos de seguridad residuales (aceptados o de terceros)

Detalle en `docs/evidence/live/security-hardening.md` §7 y ADR-002: TLS 1.0/1.1 con el certificado por defecto de `*.cloudfront.net` (necesita dominio + ACM); CSP con `'unsafe-inline'` (hashes en producción); subject OIDC mutable (inmutable en producción); PR con 0 aprobaciones (un solo mantenedor); sin S3 Block Public Access a nivel de cuenta (decisión del dueño de la cuenta). **Fuera de alcance, para avisar al dueño de la cuenta**: el rol `github_actions` de la misma cuenta confía en `repo:f2x-flypass/prereview-bot:*` en cualquier rama.

### 6.5 Dependencias del cliente (`docs/SPEC.md` §16)

| N.º | Dependencia | Requisitos que bloquea |
|---|---|---|
| 1 | Dominio productivo + ACM + Route 53 (TLS 1.2+, apex/www) | REQ-A09, A11, A05 |
| 2 | URL oficial del login de producción | REQ-C06, A03 |
| 3 | Correo/teléfono de contacto aprobados | REQ-A03 |
| 4 | Destinatario institucional de la alerta presupuestal | REQ-A11 |
| 5 | Validación del favicon derivado | REQ-A05, O01, B01 |
| 6 | Aprobación del copy de Infraestructura y Ambiente (ronda 1) | REQ-C12, B06 (y el copy nuevo de v3: O03, B05) |
| 7 | Licencia web DIN 2014 Rounded (opcional) | REQ-B03 |
| 8 | Menciones institucionales y logos de aliados | Ninguno (solo con aprobación escrita) |
| 9 | Smoke manual en Safari real y Edge | REQ-A08, C11 |
