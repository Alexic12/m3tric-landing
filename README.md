# M3TRIC Landing v3

Sitio público estático de M3TRIC. Construido con Next.js 16 (exportación estática), publicado en S3 privado + CloudFront y desplegado por GitHub Actions con AWS CDK.

La página está escrita para quien decide, no para quien programa: primero **qué obtiene** (avisos a tiempo, un mapa claro del terreno, reportes para decidir) y, más abajo, una franja técnica con capacidades, flujo de datos y tecnología.

## Qué es

M3TRIC es una plataforma que integra sensores en campo, observación aérea e información satelital para interpretar el comportamiento del territorio en tres escalas complementarias:

- **M1 (Punto)**: observaciones de sensores en puntos específicos — *Disponible*
- **M2 (Zona)**: agregaciones y patrones en zonas — *En evolución*
- **M3 (Territorio)**: visión territorial estratégica — *En evolución*

Estructura de la página (`src/app/page.tsx`): Hero · Lo que usted obtiene · Para quién es · Cómo funciona · Escalas (con visor 3D y respaldo SVG) · Por qué M3TRIC · Preguntas frecuentes · Para equipos técnicos · Contacto.

## Requisitos

- **Node.js 24.19.0** (versión fijada en CI y en `infra/`)
- **npm** (se usa `npm ci`)
- Python 3 con Pillow solo para `npm run evidence:contrast` / `evidence:screens` y para regenerar imágenes (`scripts/optimize-images.py`)

## Inicio rápido

```bash
# Instalar dependencias
npm ci

# Desarrollo local (http://localhost:3000)
npm run dev

# Release local: valida configuración, lint, tipos, build y artefacto (genera out/)
npm run release

# Servir out/ localmente (http://localhost:4173)
npm run serve:out
```

`npm run release` necesita las variables de la sección siguiente. Parta de `.env.example`:

```bash
cp .env.example .env.production.local   # y complete con valores aprobados
```

## Perfiles de release y variables

El perfil decide qué es obligatorio (ADR-003) y si el sitio es indexable (ADR-004). Todas las variables `NEXT_PUBLIC_*` se incrustan en el HTML en el build y **no son secretas**.

| Variable | `production` | `staging` | Qué hace |
|---|---|---|---|
| `RELEASE_PROFILE` | obligatoria | obligatoria | `staging` o `production`; la lee el gate de release |
| `NEXT_PUBLIC_RELEASE_PROFILE` | obligatoria | obligatoria | Debe ser igual a `RELEASE_PROFILE`; la lee la aplicación (`noindex`, bloque de contacto) |
| `NEXT_PUBLIC_RELEASE_ID` | opcional | opcional | Identificador del despliegue (`^[A-Za-z0-9._-]{1,64}$`); queda en el meta `m3tric:release`. Vacío = `local` |
| `NEXT_PUBLIC_SITE_URL` | obligatoria | obligatoria | Origen `https` puro, sin barra final; dominio público |
| `NEXT_PUBLIC_PLATFORM_URL` | obligatoria | obligatoria | URL `https` del login de la plataforma, sin usuario/contraseña |
| `NEXT_PUBLIC_CONTACT_EMAIL` | **obligatoria** | opcional | Correo de contacto (`mailto:`); si está presente se valida siempre |
| `NEXT_PUBLIC_CONTACT_PHONE` | opcional | opcional | Teléfono en E.164 (`+573001234567`); si falta, no se muestra |

No se aceptan IP literales, hosts de una sola etiqueta, punto final ni `.local`, `.internal`, `.test`, `.example`, `.invalid`, `localhost` o `example.{com,org,net}`. Si falta una variable obligatoria o falla la validación, `npm run release` se detiene con código 1 (*fail-closed*).

- **staging**: el sitio es `noindex, nofollow` (meta, `robots.txt` con `Disallow: /` y cabecera `X-Robots-Tag`) y sin correo configurado la sección Contacto muestra solo «Abrir plataforma».
- **production**: indexable, `robots.txt` anuncia el sitemap y el correo de contacto es obligatorio.

En desarrollo (`npm run dev`), si faltan `NEXT_PUBLIC_SITE_URL` o `NEXT_PUBLIC_PLATFORM_URL` se usan valores de `localhost` y se avisa por consola. **Nunca publicar así**: `check:artifact` lo rechaza.

## Scripts

| Script | Comando | Qué hace |
|---|---|---|
| `npm run dev` | `next dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | `next build` | Build de Next.js; con `output: "export"` genera `out/` |
| `npm run start` | `npm run serve:out` | Sirve `out/` en http://localhost:4173 |
| `npm run lint` | `eslint` | Valida estilo de código |
| `npm run typecheck` | `tsc --noEmit` | Valida tipos sin generar archivos |
| `npm run test:unit` | `node --test "scripts/**/*.test.mjs"` | Pruebas de reglas de configuración, reglas de artefacto, higiene, manifiesto y deriva del kit de marca (`scripts/brand-kit.test.mjs`) |
| `npm run check:config` | `node scripts/check-config.mjs` | Valida las variables públicas según el perfil |
| `npm run check:artifact` | `node scripts/check-artifact.mjs` | Valida `out/`: archivos requeridos, texto prohibido, enlaces exactos, JSON-LD y coherencia del perfil |
| `npm run hygiene` | `bash scripts/hygiene.sh` | Acciones fijadas por SHA, archivos prohibidos y marcadores de conflicto (requiere estar en un worktree de git) |
| `npm run brand:build` | `node scripts/brand-build.mjs` | Genera el kit de marca (`brand/`) a partir de `brand/tokens.json` y `brand/logo/paths.json`; es idempotente. Ver `brand/README.md` |
| `npm run release` | ver abajo | Pipeline de release completo (*fail-closed*) |
| `npm run serve:out` | `node scripts/serve-out.mjs` | Servidor estático para `out/` (preview local y pruebas) |
| `npm run build:e2e` | `RELEASE_PROFILE=production … next build` | Build con perfil production y dominios de verificación (`m3tric-test.co`) para la suite E2E |
| `npm run test:e2e` | `build:e2e && playwright test && evidence:screens` | Suite Playwright completa (chromium, firefox, webkit, chrome) y conversión de capturas |
| `npm run test:e2e:ci` | `build:e2e && playwright test --ignore-snapshots --project=chromium --project=firefox --project=webkit` | Lo que ejecuta CI, sin comparar snapshots (ADR-006) |
| `npm run test:e2e:update` | `build:e2e && playwright test --project=chromium tests/e2e/visual.spec.ts --update-snapshots` | Regenera los snapshots de regresión visual (chromium) |
| `npm run evidence:lighthouse` | `node tests/helpers/lighthouse.mjs` | Lighthouse móvil y escritorio → `docs/evidence/` |
| `npm run evidence:contrast` | `node tests/helpers/contrast.mjs && python3 tests/helpers/contrast.py` | Contraste medido sobre fotografía → `docs/evidence/contrast-hero.md` |
| `npm run evidence:screens` | `python3 tests/helpers/to-webp.py` | Convierte capturas PNG a WebP → `docs/evidence/screenshots/` |

### Pipeline de release (`npm run release`)

Ejecuta **en orden**; si cualquier paso falla, se detiene:

1. `test:unit`
2. `check:config`
3. `lint`
4. `typecheck`
5. `next build` (genera `out/`)
6. `check:artifact`

Detalle de `check:artifact` y del resto del flujo de publicación: `docs/OPERACION.md`.

### Infraestructura (`infra/`)

```bash
cd infra
npm ci
npm run typecheck   # tsc sobre bin/lib y sobre las pruebas
npm run lint        # eslint, cero advertencias
npm test            # vitest: plantillas exactas + cdk-nag
npm run synth       # cdk synth con env=staging y valores de prueba
```

## Infraestructura y despliegue

La infraestructura es una app AWS CDK v2 (TypeScript) en `infra/`, con dos stacks en la cuenta `147997127433`, región `us-east-2`:

| Stack | Quién lo despliega | Qué contiene |
|---|---|---|
| `m3tric-staging-LandingDeliveryIdentityStack` | Una persona (ya desplegado) | Rol de GitHub Actions por OIDC (confianza exacta: environment `landing-staging`, rama `main` y workflow `deploy`/`publish`/`rollback`, con la política de publicación), rol de ejecución de CloudFormation acotado y sin IAM, y bucket de assets propio |
| `m3tric-staging-LandingSiteStack` | GitHub Actions | Bucket S3 privado (BPA, SSE-S3, versionado), CloudFront con OAC, cabeceras de seguridad y CSP (quita las cabeceras de implementación del origen), bucket de logs y presupuesto. Sin recursos IAM |

Ningún rol del bootstrap compartido de CDK interviene en el despliegue del sitio. Detalle, modelo de seguridad y supresiones de `cdk-nag`: `infra/README.md`. Decisiones: `docs/adr/ADR-002`. Auditoría de seguridad, migración y verificación en vivo: `docs/evidence/live/security-hardening.md`.

## CI/CD

Los workflows están en `.github/workflows/`. Todas las *actions* están fijadas por SHA de 40 caracteres (lo exige `scripts/hygiene.sh`).

| Workflow | Cuándo corre | Qué hace |
|---|---|---|
| `ci.yml` | En cada pull request y como parte de `deploy.yml` | `hygiene`; gate de release por perfil (`staging` y `production`); E2E en chromium y firefox (Ubuntu) y webkit (macOS); infra (lint, typecheck, vitest + cdk-nag, `cdk synth`). Sin credenciales de AWS |
| `deploy.yml` («Deploy staging») | Push a `main` y manual (`reason` obligatorio) | `ci` → `synth` (sin token OIDC) → `infra` (`cdk deploy` del stack del sitio por OIDC, con el rol de ejecución acotado) → `publish.yml` |
| `publish.yml` | Llamado por `deploy.yml` y `rollback.yml` | `build` (sin token OIDC: `npm run release` con perfil staging) → `publish` (verifica el artefacto, `publish.sh`, invalidación, smoke, manifiesto `_deploy/manifest.json`) |
| `rollback.yml` («Rollback staging») | Manual (`ref` + `reason`) | Reconstruye un commit anterior de `main` y lo publica (ADR-007) |

Variables del environment de GitHub `landing-staging`: `AWS_DEPLOY_ROLE_ARN`, `AWS_CFN_EXEC_ROLE_ARN`, `AWS_REGION`, `PLATFORM_URL` (y, opcionales, `CONTACT_EMAIL`, `CONTACT_PHONE`). `main` está protegida por el ruleset `main-protegida` (PR y checks obligatorios). Procedimiento completo, verificación y resolución de problemas: `docs/OPERACION.md`.

## Estructura del proyecto

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Metadatos, Barlow, JSON-LD (Organization, WebSite, FAQPage), meta m3tric:release
│   ├── page.tsx              # Ensamble de secciones
│   ├── globals.css           # Tokens de color y tipografía, utilidades (@theme repite brand/tokens.json)
│   ├── robots.ts             # robots.txt según perfil
│   ├── sitemap.ts            # sitemap.xml
│   ├── not-found.tsx         # 404 propio
│   └── icon.svg, apple-icon.png
├── config/
│   ├── site.ts               # Lector único de variables públicas y perfil de release
│   └── brand.ts              # Constantes de marca que no pueden ser tokens CSS (deben coincidir con brand/tokens.json)
├── content/
│   └── landing.ts            # Todo el copy del sitio — fuente única
├── components/
│   ├── brand/                # Logo (importa brand/logo/paths.json), TripleBar, NodeNetwork, EafitLogo (co-marca de EAFIT, ADR-011)
│   ├── ui/                   # Button, SectionHeading, StatusBadge, Reveal
│   ├── layout/               # Header, Footer, SkipLink, HydrationMarker
│   ├── sections/             # Hero, Benefits, UseCases, HowItWorks, Scales,
│   │                         # WhyM3tric, Faq, TechnicalZone, Contact
│   └── three/                # TerrainScene (3D) y TerrainFallback (SVG)
public/                       # images/*.webp, og.png, iconos
brand/                        # Kit de marca compartido con la plataforma (tokens, logo, motivos, imágenes, manifiesto); no se publica en el sitio
scripts/
├── check-config.mjs, check-artifact.mjs, serve-out.mjs, hygiene.sh, optimize-images.py
├── brand-build.mjs           # Genera el kit de marca (npm run brand:build)
├── brand-kit.test.mjs        # Pruebas de deriva del kit (parte de test:unit)
├── lib/                      # release-config.mjs, artifact-rules.mjs (reglas compartidas)
└── deploy/                   # publish.sh, smoke.mjs, manifest.mjs, upload-manifest.sh
infra/                        # App CDK (bin/, lib/, config/, test/)
tests/
├── e2e/                      # Playwright: content, links, cta, responsive, visual, interaction, resilience, a11y, three
└── helpers/                  # env, page, lighthouse, contrast, serve-gzip
.github/workflows/            # ci, deploy, publish, rollback
docs/                         # SPEC, SPEC-UNIFICACION, TRACEABILITY, OPERACION, CONTENIDOS, ASSETS, adr/, evidence/
```

### Activos

| Ubicación | Contenido | Gestión |
|---|---|---|
| `public/images/` | Fotos de marca en WebP | Regenerar con `scripts/optimize-images.py`; ver `docs/CONTENIDOS.md` |
| `public/og.png` | Open Graph 1200×630 | Regenerar si cambia la identidad visual |
| `public/icon.svg` y `.png` | Favicon e íconos | Derivados del logo; el favicon derivado espera validación de marca |
| `src/content/landing.ts` | Textos, títulos, CTA | Editar aquí; no hay texto en JSX |
| `src/app/globals.css` | Tokens de color y tipografía | Mantener sincronizado con el manual de marca y con `brand/tokens.json`; una prueba falla si difieren |
| `brand/` | Kit de marca: tokens, logo, motivos, tres imágenes y manifiesto | Se edita `tokens.json` o `logo/paths.json` y se ejecuta `npm run brand:build`; ver `brand/README.md`. No se publica en el sitio |

## Documentación

| Documento | Contenido |
|---|---|
| `docs/SPEC.md` | Especificación end-to-end (v3), con los IDs de requisito |
| `docs/SPEC-UNIFICACION.md` | Identidad compartida landing ↔ plataforma: requisitos REQ-U, decisiones DEC-53..58, kit, sistema visual, español, tipografía, pruebas y despliegue |
| `docs/TRACEABILITY.md` | Matriz requisito → spec → implementación → verificación → evidencia, y brechas abiertas |
| `docs/adr/` | Decisiones de arquitectura ADR-001 a ADR-011 |
| `docs/OPERACION.md` | Pipeline de publicación, bootstrap, rollback, verificación, caché, cabeceras, costos y resolución de problemas |
| `docs/CONTENIDOS.md` | Cómo actualizar textos, imágenes, contacto y marca |
| `docs/ASSETS.md` | Inventario de activos, dependencias y licencias |
| `docs/evidence/` | Capturas, informes de QA, axe, Lighthouse, matrices; `live/` con la QA contra CloudFront; `platform-brand/` con la evidencia de la plataforma (antes y después, QA en vivo y Lighthouse; su `README.md` explica cada carpeta) |
| `docs/evidence/live/security-hardening.md` | Auditoría de seguridad, migración, simulación de políticas IAM, cabeceras del borde, gobernanza de GitHub y riesgos residuales |
| `brand/README.md` | Kit de marca: contenido, uso, sincronización con la plataforma y cómo actualizarlo |
| `infra/README.md` | Infraestructura como código: stacks, seguridad, costos |
| `CHANGELOG.md` | Historial de versiones |

## Licencias

- **Barlow** (fuente) — [SIL Open Font Licence 1.1](https://github.com/jpt/barlow), autohospedada vía `next/font/google` en build (ADR-001)
- **lucide-react** (iconografía) — [ISC](https://github.com/lucide-icons/lucide)
- **three.js**, **@react-three/fiber** — [MIT](https://threejs.org/license)
- **Next.js**, **React** — [MIT](https://opensource.org/licenses/MIT)
- **Tailwind CSS** — [MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)

Herramientas de infraestructura y CI (AWS CDK, cdk-nag, zod, vitest, GitHub Actions): `docs/ASSETS.md`.

## Soporte

- **Especificación**: `docs/SPEC.md` · **Trazabilidad**: `docs/TRACEABILITY.md`
- **Actualización de contenidos**: `docs/CONTENIDOS.md`
- **Publicación y operación**: `docs/OPERACION.md`
- **Release gate**: `npm run release` (falla si hay problemas)
