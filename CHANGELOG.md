# Changelog

Todas las versiones de la landing de M3TRIC.

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
