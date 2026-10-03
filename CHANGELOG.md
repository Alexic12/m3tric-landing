# Changelog

Todas las versiones de la landing de M3TRIC.

---

## [3.3.1] - 2026-10-03 — Documentación

Cierre de la trazabilidad de la identidad compartida con la plataforma. Solo documentación y evidencia: sin cambios de código ni visuales en el sitio.

### Agregado
- **Evidencia de la plataforma desplegada** en `docs/evidence/platform-brand/`: `QA-REPORT.md` (QA en vivo del PR #190, `1c8e17d`: 20 vistas a 1440 y 390 px, 36 verificaciones y los hallazgos QA-01 a QA-12), `after/` (53 archivos: datos crudos, informes axe y capturas) y `README.md`, que explica cada carpeta y cómo se produjo. Se suman a `before/` y `lighthouse/` (3.3.0).
- `docs/SPEC-UNIFICACION.md` §14 «Resultado»: cifras del despliegue y de la QA, desviaciones respecto del diseño y seguimientos.
- `docs/evidence/live/contacto-mailto-2026-10-02.txt`: comprobación en vivo del correo de contacto (REQ-O08), con el comando `curl` y su salida.
- `docs/TRACEABILITY.md`: filas REQ-O07 (co-marca de EAFIT, ADR-011; Parcial) y REQ-O08 (correo de contacto; Verificado), la sección 6.6 con los hallazgos de la QA de la plataforma y, en la evidencia identificada, los releases `deploy-8` a `deploy-11`, el PR #190 y la comprobación en vivo del correo.

### Cambiado
- `docs/TRACEABILITY.md`: corte al 2026-10-02. REQ-U05 pasa de Preparado a Verificado; REQ-U01, U02, U03 y U04 pasan a Parcial: se midieron en vivo y cada uno espera la aceptación visual del owner, la validación de marca del favicon, la confirmación de DEC-56 y del copy del inicio de sesión, o la licencia de DIN 2014 Rounded. Resumen de 48 requisitos: 22 Verificado, 22 Parcial, 1 Preparado, 2 Pendiente y 1 Dependencia del cliente. REQ-A03 cita las pruebas e2e vigentes (`cta` e `interaction`) en lugar de la del botón «Hablar», retirado en 3.1.1 y 3.1.2. Se corrigen las referencias a `docs/SPEC.md` (v3.5) y a ADR-001..011.
- `docs/SPEC.md` 3.5: §0.1 incorpora REQ-O07 (co-marca de EAFIT) y REQ-O08 (correo de contacto).
- `docs/SPEC-UNIFICACION.md` 1.2: estados en §11 y §14; §12 suma la aceptación visual del owner; §4.2 corregida a los cinco pesos de Barlow que carga la plataforma (300 a 800).
- ADR-008 y ADR-009: estado «Aceptada — implementada y verificada» con su evidencia y la aceptación del owner pendiente. ADR-011: sección de evidencia (release y prueba e2e). ADR-010: pesos de Barlow de la plataforma (300 a 800); su ejecución sigue esperando la licencia.
- `README.md`: ADR-001 a ADR-011, `docs/evidence/platform-brand/`, `EafitLogo` en la estructura y la suite `cta`. `docs/ASSETS.md`: inventario de la co-marca de EAFIT (`EafitLogo.tsx` y `eafit-paths.json`).

### Conocido / Pendiente
- Owner y Cliente: aceptación explícita de la apariencia de la plataforma desplegada (REQ-U01); validación de marca del favicon (REQ-U02); confirmar el título «M3TRIC | Plataforma» (DEC-56) y aprobar el copy en español del inicio de sesión (REQ-U03); licencia web de DIN 2014 Rounded (REQ-U04); vector oficial de la Universidad EAFIT y confirmación de su oficina de marca (REQ-O07).
- Plataforma (repositorio privado, propietario «Plataforma»): QA-01 a QA-05, QA-06 (sin CSP) y la medición del LCP en vivo (AT-UX-3). QA-01 y QA-02 son de severidad alta. Detalle y siguiente acción: `docs/TRACEABILITY.md` §6.6.
- El script de la QA en vivo de la plataforma no se archivó (`docs/evidence/platform-brand/QA-REPORT.md` §9); el seguimiento n.º 10 de `docs/SPEC-UNIFICACION.md` §14.6 propone archivar un arnés repetible.

---

## [3.3.0] - 2026-10-02

### Agregado
- Co-marca de la **Universidad EAFIT** en la barra superior, a la derecha del logo M3TRIC: wordmark vectorizado (`src/components/brand/EafitLogo.tsx`) en azul EAFIT `#004B85` sobre la barra blanca y en blanco sobre el hero; nombre accesible «Universidad EAFIT»; sin enlace (ADR-011).
- Correo de contacto aprobado por el owner (`amarula2@eafit.edu.co`) configurado como variable del entorno `landing-staging`: el sitio publica `mailto:` en contacto y pie de página.
- Evidencia «antes» del rediseño de la plataforma en `docs/evidence/platform-brand/` (capturas e informes de Lighthouse).

## [3.2.1] - 2026-10-02

### Cambiado
- `brand/tokens.json › chartSeries`: orden de la paleta de series con los tonos oscuros primero y los pálidos (`#74C69D`, `#B7E3C7`) al final, por legibilidad de líneas sobre blanco (hallazgo de la verificación en navegador de la plataforma).

## [3.2.0] - 2026-10-02

Identidad compartida entre la landing y la plataforma: kit de marca versionado y decisiones registradas. Especificación: `docs/SPEC-UNIFICACION.md` (v1.0); `docs/SPEC.md` pasa a la versión 3.3. Sin cambios visuales en el sitio.

### Agregado

- **Kit de marca** `brand/` (ADR-008, DEC-53), con dos fuentes editables y todo lo demás generado o copiado:
  - Fuentes: `tokens.json` (paleta exacta del manual, niveles de alerta, tipografía, radios, foco, sombra, geometría de las tres barras y serie de colores para gráficos) y `logo/paths.json` (vectores del wordmark).
  - Generado: `tokens.css`, los cuatro SVG del logo (`color`, `reverse`, `mono-dark` y `mono-light`), `motifs/triple-bar.svg` y `manifest.json` (`version`, `generatedAt` y el sha256 de cada archivo; no lleva commit de origen: lo registra la plataforma al sincronizar).
  - Copiado byte a byte: `logo/m3tric-mark.svg` (de `src/app/icon.svg`) y tres fotografías del manual sin texto incrustado (de `public/images/`).
  - Espacio documentado para DIN 2014 Rounded (`fonts/README.md`), sin archivos de fuente.
  - El directorio no se publica en el sitio: no pasa por `public/` ni por `out/`. La plataforma lo copia por commit con sha256.
- **`npm run brand:build`** (`scripts/brand-build.mjs`): genera lo derivado y las copias a partir de las dos fuentes. Es idempotente y rechaza cualquier archivo que no esté en el inventario del kit, lo que mantiene los archivos de fuente con licencia fuera del repositorio público.
- **Pruebas de deriva** (`scripts/brand-kit.test.mjs`, 60 pruebas, dentro de `test:unit` y por tanto de `npm run release`): fallan si los colores de `src/app/globals.css` o de `src/config/brand.ts` difieren de `tokens.json`, si un SVG o `Logo.tsx` difieren de `paths.json`, si `manifest.json` no coincide con los archivos o si aparece un archivo de fuente bajo `brand/`.
- **`.gitattributes`**: `brand/** text eol=lf`.
- **Decisiones**: ADR-008 (kit de marca compartido), ADR-009 (español único en la plataforma) y ADR-010 (DIN 2014 Rounded: licencia y servicio desde un bucket privado; sus archivos nunca entran a git).
- **`docs/SPEC-UNIFICACION.md`**: especificación end to end de la identidad compartida (REQ-U01..U05, DEC-53..58, kit, sistema visual, español, tipografía, pruebas y despliegue).
- **Trazabilidad** (`docs/TRACEABILITY.md`, sección 7): filas REQ-U01..U05 en estado Preparado, con sus brechas. Sin evidencia ejecutada.

### Cambiado
- `docs/ASSETS.md`: inventario del kit `brand/` (fuentes, generados, copias y licencias), logo desde `brand/logo/paths.json`, DIN 2014 Rounded según ADR-010 y `npm run brand:build` en scripts y checklist.

- `src/components/brand/Logo.tsx` importa los trazados de `brand/logo/paths.json` y ya no los contiene.
- `docs/SPEC.md` 3.3: §3.3 y §3.4 remiten a ADR-010 y al kit `brand/` (el logo tiene una sola fuente, `brand/logo/paths.json`); §14 y §15 incluyen `docs/SPEC-UNIFICACION.md`, `brand/README.md` y ADR-008..010.
- `docs/CONTENIDOS.md` (Logo, Favicons, Tokens, Fuente, Imágenes y referencia rápida): el logo y los colores se cambian en el kit y se regeneran con `npm run brand:build`; los archivos de DIN 2014 Rounded nunca se agregan al repositorio (ADR-010).
- `docs/adr/ADR-001`: referencia a ADR-010, que reemplaza el procedimiento de agregar los `.woff2` con `next/font/local`.
- `README.md`: `brand/`, `npm run brand:build`, `docs/SPEC-UNIFICACION.md`, `brand/README.md` y ADR-001 a ADR-010.
- `docs/TRACEABILITY.md`: el resumen por estado pasa a 46 requisitos (5 nuevos en Preparado); REQ-O05 y REQ-B03 apuntan a SPEC 3.3 y a ADR-010.

### Conocido / Pendiente

- Barlow sigue siendo la tipografía de la landing. DIN 2014 Rounded requiere licencia web (dependencia del cliente n.º 7); nada de su diseño de servicio se despliega antes de tenerla.
- Los cambios en la plataforma (repositorio privado) se registran allí: `docs/enterprise-agro/26-identidad-compartida.md` y `docs/platform-live-dashboard/07-decisiones-owner.md` (DEC-53..58).
- Pendientes del Owner: confirmar el título «M3TRIC | Plataforma» (DEC-56, aplicada por defecto) y aprobar el copy en español del inicio de sesión. Estado y brechas: `docs/TRACEABILITY.md`.

---

## [3.1.2] - 2026-10-01

### Cambiado
- Se retira el botón «Hablar con el equipo» de toda la página (hero y banda tras los casos de uso; la barra superior ya no lo tenía desde 3.1.1). El contacto se alcanza por el enlace «Contacto» de la navegación. En el hero, «Abrir plataforma» queda como único CTA, en estilo primario. La banda «¿Su caso es uno de estos? Hablemos.» se retira porque sin botón no cumplía función.

## [3.1.1] - 2026-10-01

### Cambiado
- Barra superior: se retira el botón «Hablar con el equipo» (escritorio, móvil y menú) porque duplicaba el enlace «Contacto». El CTA se mantiene en el hero, en la banda tras los casos de uso y en la sección de contacto. En el menú móvil, «Abrir plataforma» pasa a ser el CTA principal.

## [3.1.0] - 2026-10-01

Endurecimiento de seguridad de la cadena de entrega tras la auditoría, robustez de CI y QA en vivo contra CloudFront. Especificación: `docs/SPEC.md` (v3.2). Release en vivo: `deploy-3-7c618b7`.

### Seguridad

- **Auditoría de seguridad** (hallazgos H1, H2, M1, M2 y L): todos corregidos y verificados en vivo. Resumen, registro de la migración, simulación de 13 políticas IAM, revisión de CloudTrail, cabeceras y riesgos residuales en `docs/evidence/live/security-hardening.md`.
- **Ningún rol del bootstrap compartido** (`cdk-hnb659fds-*`) en el despliegue del sitio: el stack del sitio usa `CliCredentialsStackSynthesizer` con un bucket de assets propio (`m3tric-staging-landing-cdk-assets-147997127433-us-east-2`) y el rol de GitHub no tiene `sts:AssumeRole` (Deny explícito).
- **Rol de ejecución de CloudFormation acotado** `m3tric-staging-landing-cfn-exec`: sin permisos de IAM, con CloudFront fijado por ID (`infra/config/staging.json › siteCloudFront`). El rol de GitHub solo crea change sets del stack del sitio con ese rol. Variable nueva del environment: `AWS_CFN_EXEC_ROLE_ARN`.
- **Confianza OIDC por repositorio, environment, rama y workflow**: tres `sub` exactos (`deploy.yml`, `publish.yml`, `rollback.yml` en `refs/heads/main`); el repositorio personaliza el `sub` con `include_claim_keys: ["repo","context","ref","job_workflow_ref"]`.
- **Sin token OIDC mientras corre código de dependencias**: los jobs `synth` (deploy) y `build` (publish) no tienen environment ni `id-token`; los jobs con el rol descargan el artefacto por id y verifican su sha256.
- **La política de publicación** pasa del stack del sitio al de identidad (`LandingSitePublish`); el stack del sitio queda sin recursos `AWS::IAM::*`.
- **Cabeceras de implementación del origen fuera**: `server: AmazonS3`, `x-amz-version-id` y `x-amz-server-side-encryption` ya no se exponen (`RemoveHeadersConfig`); las 7 cabeceras de seguridad se mantienen.
- **Gobernanza de GitHub**: ruleset `main-protegida` (PR y checks obligatorios, sin borrado, sin *force-push*, sin *bypass*); environment `landing-staging` sin *bypass* de administradores; solo actions de GitHub y `aws-actions/configure-aws-credentials`, fijadas por SHA; aprobación obligatoria de workflows de forks.
- **Riesgos aceptados o pendientes**: TLS 1.0/1.1 con el certificado por defecto de `*.cloudfront.net` (necesita dominio y ACM), CSP con `'unsafe-inline'`, subject OIDC mutable, PR con 0 aprobaciones (un solo mantenedor), sin S3 Block Public Access a nivel de cuenta. Fuera de alcance, para el dueño de la cuenta: el rol `github_actions` confía en `repo:f2x-flypass/prereview-bot:*`.

### Cambiado

- **CI más robusto**: cada job E2E instala solo su navegador; `apt` con reintentos y plazos cortos; E2E de WebKit en `macos-15` (el espejo de Ubuntu detuvo dos veces la instalación de sus dependencias).
- `deploy.yml` ahora encadena `ci → synth → infra → publish (build → publish)`; `publish.yml` se divide en `build` y `publish`.
- `docs/SPEC.md` pasa a la versión 3.2 (§10, §11 y §12 alineados con el diseño endurecido); `docs/OPERACION.md`, `infra/README.md`, `docs/adr/ADR-002` y `README.md` actualizados.

### Agregado

- **QA en vivo contra CloudFront** (`docs/evidence/live/`): suite `npm run test:live` (41 pasadas, 0 fallos, 16 omitidas solo-chromium; repetida tras el endurecimiento con el mismo resultado), axe (0 violaciones a 1280 y 390 px), capturas y Lighthouse ×3 (móvil Perf 100 / A11y 100 / BP 100, **LCP 1,52 s** frente al presupuesto de 2,5 s; SEO 69 esperado por el `noindex` de staging). `docs/evidence/QA-REPORT.md` y `browser-matrix.md` regenerados con la suite v3.
- **Rollback probado** (REQ-A12): deploy → rollback → restauración (runs `36869421270`, `36870809775`, `36871068392`), smoke 10/10 en cada uno.
- **Trazabilidad actualizada** (`docs/TRACEABILITY.md`): 20 de 41 requisitos en Verificado con evidencia identificada; el resto queda Parcial, Preparado, Pendiente o Dependencia del cliente, con sus brechas.

---

## [3.0.0] - 2026-10-01

Rediseño centrado en lo que obtiene el usuario, infraestructura como código, CI/CD y trazabilidad de requisitos. Especificación: `docs/SPEC.md` (v3).

### Agregado

- **Rediseño para usuarios no técnicos** (REQ-O03, REQ-O04): la página abre con lo que el usuario obtiene y deja el detalle técnico en una franja propia. Orden de secciones: Hero (tres resultados: avisos a tiempo, mapa claro del terreno, reportes para decidir) · Lo que usted obtiene (`#beneficios`) · Para quién es (`#casos`) · Cómo funciona (`#como-funciona`) · Escalas (`#escalas`, pestañas M1 Punto / M2 Zona / M3 Territorio) · Por qué M3TRIC (`#por-que`) · Preguntas frecuentes (`#preguntas`) · Para equipos técnicos (`#tecnico`) · Contacto (`#contacto`).
- **Preguntas frecuentes** con acordeón nativo (`<details>`, funciona sin JavaScript) y JSON-LD `FAQPage` generado desde el mismo contenido (`src/content/landing.ts` → `faq`).
- **Perfiles de release** `staging` y `production` (`RELEASE_PROFILE`, `NEXT_PUBLIC_RELEASE_PROFILE`) e identificador de despliegue `NEXT_PUBLIC_RELEASE_ID`, publicado en el meta `m3tric:release`. En staging el correo de contacto es opcional (ADR-003).
- **`noindex` en staging** en tres capas: meta robots, `robots.txt` con `Disallow: /` y cabecera `X-Robots-Tag` en CloudFront (ADR-004).
- **Infraestructura como código** en `infra/` (AWS CDK v2, TypeScript): `m3tric-staging-LandingDeliveryIdentityStack` (rol de GitHub Actions por OIDC, desplegado una vez por una persona) y `m3tric-staging-LandingSiteStack` (S3 privado con BPA, SSE-S3 y versionado; CloudFront con OAC, CSP y cabeceras de seguridad; bucket de logs con retención de 90 días; presupuesto mensual con aviso al 80 %). Pruebas de plantilla con `vitest` y `cdk-nag` (ADR-002).
- **CI/CD con GitHub Actions** (`.github/workflows/`): `ci.yml`, `deploy.yml`, `publish.yml` y `rollback.yml`, con todas las *actions* fijadas por SHA y autenticación solo por OIDC.
- **Scripts de publicación y verificación** (`scripts/deploy/`): `publish.sh` (caché por tipo de contenido e invalidación de CloudFront), `smoke.mjs` (10 comprobaciones contra la URL publicada), `manifest.mjs` y `upload-manifest.sh` (`_deploy/manifest.json` con commit, run, huella SHA-256 de cada archivo y resultado del smoke). `scripts/hygiene.sh` (acciones fijadas, archivos prohibidos, marcadores de conflicto).
- **Trazabilidad**: IDs de requisito en `docs/SPEC.md` §0, `docs/TRACEABILITY.md` (requisito → spec → implementación → verificación → evidencia, con estado según el Anexo 1 §3 y brechas abiertas) y `docs/adr/ADR-001` a `ADR-007`.
- **Pruebas** nuevas en `scripts/` (reglas de artefacto, higiene, manifiesto) y en `infra/test/` (configuración, identidad, sitio, `cdk-nag`).

### Cambiado

- Reglas de release compartidas en `scripts/lib/release-config.mjs` y `scripts/lib/artifact-rules.mjs` (las usan `check:config`, `check:artifact` y el smoke). `check:artifact` ahora exige además el JSON-LD `FAQPage` y la coherencia del perfil (meta `noindex`, `robots.txt` y `m3tric:release`).
- Navegación: Beneficios · Casos de uso · Cómo funciona · Escalas · Preguntas · Técnico · Contacto, con «Abrir plataforma» y «Hablar con el equipo» como acciones.
- Suite E2E adaptada a la nueva arquitectura de información. CI la ejecuta en chromium, firefox y webkit sin comparar snapshots visuales, que dependen del sistema operativo (ADR-006).
- `docs/OPERACION.md` reescrito alrededor del pipeline real. El rollback pasa a ser **reconstrucción desde git** (ADR-007).
- `README.md`, `docs/CONTENIDOS.md` y `docs/ASSETS.md` actualizados a v3.

### Eliminado

- Claves de contenido de v2 en `src/content/landing.ts`: `proposal`, `platform`, `products`, `capabilities` y `technology`. Sus secciones se reemplazan por `whyM3tric`, `howItWorks`, `benefits` y `technical`.
- Procedimiento manual de publicación con `aws s3 sync` por pasos y el rollback por restauración de versiones de S3.

### Seguridad

- Sin credenciales de larga duración: solo OIDC, con confianza exacta al environment `landing-staging` de este repositorio.
- CSP y cabeceras de seguridad aplicadas en CloudFront (HSTS de dos años, `X-Frame-Options: DENY`, `Permissions-Policy`).
- **Riesgo aceptado (ADR-002):** el rol de ejecución de CloudFormation del bootstrap de CDK de la cuenta tiene `AdministratorAccess`; quien pueda ejecutar un job en el environment `landing-staging` puede, en la práctica, cambiar cualquier recurso de CloudFormation de la cuenta. Mitigado con la restricción del environment a `main` y las demás medidas del ADR; endurecimiento recomendado antes de producción.

### Conocido / Pendiente

- La evidencia de `docs/evidence/` (informe de QA, matriz de navegadores, contraste, axe, Lighthouse) corresponde a v2 y debe regenerarse con v3; solo `link-matrix.md` es de v3.
- LCP móvil local de 2,9 s frente al presupuesto de 2,5 s; la aceptación se mide en CloudFront (ADR-005).
- Sin dominio propio: TLS 1.2+ mínimo y dominio productivo son dependencia del cliente (REQ-A09).
- Estado de cada requisito y brechas abiertas: `docs/TRACEABILITY.md`.

---

## [2.0.0] - 2026-09-30

### Agregado

- **Sistema de identidad visual completo**: Implementación de la marca M3TRIC del manual oficial (20260428_Manual de marca - Metric.pptx) con paleta de 8 colores, tipografía Barlow (fallback de DIN 2014 Rounded), logo en 4 variantes y motivos recurrentes (triple bar, red de nodos).
- **Estructura de secciones**: 9 secciones semanticamente marcadas con navegación smooth-scroll, skip link, y active links por scroll (`IntersectionObserver`).
  - Hero: propuesta de valor + 3 capas de información
  - Propuesta: manifiesto + 3 valores + globo terráqueo
  - Plataforma: 4 pasos + ilustración SVG
  - Escalas: selector M1/M2/M3 + visor 3D (terreno low-poly) + fallback SVG
  - Productos: 3 líneas (sensórica, analítica, visualización)
  - Capacidades: Disponible vs. En evolución + escala de interpretación (amarillo/naranja/rojo)
  - Tecnología: flujo de datos + stack verificado (Python/FastAPI/PostgreSQL/React)
  - Casos de uso: 4 vértices (riesgo, agrícola, infraestructura, ambiente)
  - Contacto: CTA final + canales configurables

- **Visor 3D interactivo** (`@react-three/fiber`, `three.js`):
  - Terreno procedural low-poly con 3 capas renderables (M1 puntos con pulso, M2 franja, M3 retícula)
  - Carga diferida solo cuando la sección entra en viewport
  - Fallback SVG ilustrativo para navegadores sin WebGL o con `prefers-reduced-motion`
  - Presupuesto: chunk 3D ≤ 250 KB gzip

- **Contenido tipado** (`src/content/landing.ts`):
  - Fuente única de verdad para todos los textos (copy, títulos, CTA, metadatos)
  - Validación de tipos en build (`npm run typecheck`)
  - Regla editorial "Disponible" vs "En evolución" sin afirmaciones no verificadas

- **Configuración fail-closed**:
  - Variables públicas validadas: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLATFORM_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` (opcional)
  - Scripts de validación: `check:config` (antes del build), `check:artifact` (después del export)
  - `npm run release` aborta si hay problemas (no hay artefacto parcial)

- **Export estático**: Sitio compilado a HTML/CSS/JS puro listo para S3 + CloudFront
  - `next.config.ts` con `output: "export"`, `trailingSlash: false`, imágenes pre-optimizadas
  - `robots.txt` y `sitemap.xml` dinámicos (basados en `SITE_URL`)
  - 404 personalizado (`not-found.tsx`) con navegación

- **SEO técnico**:
  - Metadatos en español (es-CO): título, descripción, canonical, Open Graph, Twitter Card
  - JSON-LD `Organization` + `WebSite` con `alternateName: "Metric"` (búsqueda)
  - Semántica HTML5: un solo `<h1>`, secciones con `aria-labelledby`, nav/main/footer

- **Accesibilidad WCAG 2.1 AA**:
  - Contrastes validados (11.79:1 mínimo para texto sobre marcas; medición directa sobre fotografía en `docs/evidence/contrast-hero.md`)
  - Foco visible personalizado (anillo verde claro sobre oscuro)
  - Menú móvil accesible con ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label`, cierre con Escape
  - Fondo inert mientras menú abierto (`main`, `footer`, skip link); foco atrapado en el dialog y devuelto al botón al cerrar
  - Tabs de escalas con navegación por flechas (ARIA tabs)
  - Objetivos táctiles ≥ 44×44 px
  - Respeto a `prefers-reduced-motion` (sin animaciones, 3D estático, contenido inmediato)

- **Rendimiento** (medido con gzip en localhost):
  - Lighthouse móvil: Performance 95, Accessibility 100, Best Practices 100, SEO 100
  - Lighthouse desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 100
  - LCP móvil gzip: 2.9 s (presupuesto 2.5 s no alcanzado; debe re-medirse en CloudFront con HTTP/2 + brotli)
  - CLS ≤ 0.05 ✓ (móvil 0, desktop 0)
  - TBT ≤ 200 ms ✓ (móvil 10 ms, desktop 0 ms)
  - JS inicial sin chunk 3D ≤ 180 KB ✓ (135 KB transferidos en 7 scripts)
  - Imágenes WebP (calidad 78; móvil hero 480 px con calidad 55 = 25 KB)
  - Fuente Barlow con `display: swap`
  - Hidratación failsafe: si JS falla, contenido visible después de 3 s

- **Animaciones sutiles**:
  - `Reveal`: entrada de elementos al viewport con CSS + un `IntersectionObserver` compartido (opacity + translateY, 500 ms), sin dependencia de animación
  - Escena 3D pausada fuera del viewport
  - Respeto a `prefers-reduced-motion: reduce`

- **Documentación completa**:
  - `README.md`: qué es, requisitos, inicio rápido, scripts, variables, estructura
  - `docs/CONTENIDOS.md`: guía de actualización de contenidos por sección
  - `docs/OPERACION.md`: procedimiento de build y publicación (S3 + CloudFront)
  - `docs/ASSETS.md`: inventario de activos, licencias, orígenes
  - `docs/evidence/`: capturas, reportes QA, axe, Lighthouse (pendiente de QA)

- **Seguridad**:
  - Sin secretos en repo (variables en `.env.production.local` git-ignored)
  - Enlaces externos con `rel="noopener noreferrer"`
  - CSP documentada (aplicable en CloudFront Response Headers Policy)
  - No hay datos personales almacenados ni enviados

### Cambiado

- Reemplazo completo del contenido de prueba (default Next.js) por landing oficial
- Tipografía: Barlow (OFL) como fallback de DIN 2014 Rounded (licencia comercial del cliente, no incluida)
- Estructura de componentes: Server Components por defecto, `"use client"` solo en Header (scroll), Reveal (motion), Scales (tabs 3D), ActiveSection (navegación)

### Removed

- Legacy from v1: secciones antiguas (navbar/footer de prueba), logo inventado (M3tricLogo), componente `GlobeScene` anterior, componentes `ScaleIllustrations` obsoletos, SVG de plantilla Next (`next.svg`, `vercel.svg`), favicon antiguo (`favicon.ico`), módulo `src/lib/platform.ts`
- Dependencias removidas: `framer-motion`, `@react-three/drei`; `@types/three` movido a devDependencies
- Rutas dinámicas, Node.js runtime (export estático puro)

### Conocido / Límites

- Escalas M2 y M3 marcadas "En evolución" (drones e información satelital aún no integrados)
- Sin WebGL o `prefers-reduced-motion`: visor 3D muestra fallback SVG (no interactivo, sí visualización de capas)
- Sin formulario persistente (email es mailto:, sin backend de almacenamiento)
- Sin analítica, CRM, cookies de rastreo (Anexo 1 §13.2: fuera de alcance)

### Seguridad

- `'unsafe-inline'` en Content-Security-Policy requerido por bootstrap inline de Next.js export (riesgo aceptado, documentado)
- HTTPS obligatorio en release (validación fail-closed)
- Bucket S3 privado con OAC, Block Public Access ON

### Pruebas

- Playwright E2E (`@playwright/test`) contra `out/` servido localmente
- Axe accessibility sin violaciones serious/critical
- Lighthouse en móvil y desktop
- Navegadores: Chromium, Firefox, WebKit (Safari)
- Responsive: 360/768/1280/1920 px sin desbordamiento horizontal
- 3D: carga correctamente con WebGL, fallback SVG sin WebGL, sin errores de consola

---

## Pendiente del cliente (Anexo 1 §14; vigente en 3.0.0, ver `docs/SPEC.md` §16 y `docs/TRACEABILITY.md`)

Decisiones que no bloquean el build de código, pero sí el release a producción:

1. ⏳ URL oficial del login de la plataforma (`NEXT_PUBLIC_PLATFORM_URL`)
2. ⏳ Dominio productivo (`NEXT_PUBLIC_SITE_URL`)
3. ⏳ Correo (y opcional teléfono) de contacto aprobados
4. ⏳ Validación de marca del favicon derivado (tres barras + cuadrado verde) — equipo de marca
5. ⏳ Licencia web de DIN 2014 Rounded (opcional; hoy Barlow OFL) — legal
6. ⏳ Mención institucional (p. ej. Universidad EAFIT) o logos de aliados — solo con aprobación escrita
7. ⏳ Ronda de ajustes 1 en copy de la sección Infraestructura/Ambiente (use-case copy)
8. ⏳ Smoke manual en Safari real (checklist en `docs/evidence/browser-matrix.md`)
9. ⏳ Smoke manual en Edge (no instalado en máquina de tests)

---

## Notas de release

- El sitio es **completamente estático** (HTML/CSS/JS pre-compilado). No hay Next.js runtime ni API routes.
- **Gates de release** (`npm run release`) validan configuración, linting, tipos y contenido del artefacto.
- **Seguridad aplicada en CloudFront** (Response Headers Policy): CSP, HSTS, X-Frame-Options, etc. (definida como código desde 3.0.0 en `infra/`).
- **Rollback**: en 2.0.0 se describía por S3 versioning o re-sync manual; desde 3.0.0 es por reconstrucción desde git con el workflow `Rollback staging` (ADR-007, `docs/OPERACION.md`).

---

## Cambios respecto a v1 (landing anterior)

*v1 era un prototipo rápido con fines de demostración. v2 es una landing de producción con todos los detalles de UX, a11y, SEO, seguridad y documentación.*

- ✅ Sistema de marca coherente (no colores ad-hoc)
- ✅ Visor 3D interactivo (vs. ilustración estática)
- ✅ Contenido tipado y versionable (vs. strings inline)
- ✅ Documentación técnica completa para mantenimiento (vs. no docs)
- ✅ Tests E2E (vs. manual smoke)
- ✅ Validación fail-closed en release (vs. build manual)
- ✅ Accesibilidad WCAG AA (vs. sin auditoría)
