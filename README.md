# M3TRIC Landing v2

Sitio público estático de M3TRIC: lectura multiescala del territorio. Construido con Next.js 16, exportado como contenido estático listo para S3 + CloudFront.

## Qué es

M3TRIC es una plataforma que integra sensores en campo, observación aérea e información satelital para interpretar el comportamiento del territorio en tres escalas complementarias:

- **M1 (Micro)**: observaciones de sensores en puntos específicos — *Disponible*
- **M2 (Meso)**: agregaciones y patrones en zonas — *En evolución*
- **M3 (Macro)**: visión territorial estratégica — *En evolución*

Esta landing presenta la propuesta de valor, la plataforma, los productos, capacidades y casos de uso, con un visor 3D interactivo de las tres escalas (con fallback SVG para navegadores sin WebGL).

## Requisitos

- **Node.js**: versión 20 o superior
- **npm**: versión 10 o superior

## Inicio rápido

```bash
# Instalar dependencias
npm ci

# Desarrollo local (http://localhost:3000)
npm run dev

# Build de producción (genera out/)
npm run release

# Servir el build localmente (http://localhost:4173)
npm run serve:out
```

### Variables de configuración

Crear `.env.production.local` con los siguientes valores (obligatorios para `npm run release`):

| Variable | Obligatoria | Validación | Ejemplo |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sí | HTTPS, bare origin solo (sin path/query/hash/trailing slash), dominio público válido | `https://m3tric.co` |
| `NEXT_PUBLIC_PLATFORM_URL` | Sí | HTTPS, dominio público válido, sin userinfo | `https://app.m3tric.co/login` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Sí | Email válido (strict regex), no dominio de ejemplo/test | `hola@m3tric.co` |
| `NEXT_PUBLIC_CONTACT_PHONE` | No | E.164 si presente (ej. +573001234567), se omite del HTML si falta | `+573012345678` |

**Validación de hosts**: No se aceptan IP literales (`127.0.0.1`, `[::1]`), single-label hosts, `.local`, `.internal`, `.test`, `.example`, dominios de ejemplo (`example.{com,org,net}`), ni trailing dots.

Si falta una variable obligatoria o falla la validación, `npm run release` falla inmediatamente (fail-closed).

## Scripts

| Script | Comando | Qué hace |
|---|---|---|
| `npm run dev` | `next dev` | Servidor de desarrollo con hot-reload en http://localhost:3000 |
| `npm run build` | `next build` | Build de Next.js (genera `.next/`, no el export estático) |
| `npm run start` | `npm run serve:out` | Sirve el contenido de `out/` en http://localhost:4173 |
| `npm run lint` | `eslint` | Valida estilo de código (sin fix automático en release) |
| `npm run typecheck` | `tsc --noEmit` | Valida tipos TypeScript sin generar archivos |
| `npm run test:unit` | `node --test "scripts/**/*.test.mjs"` | Tests unitarios de las reglas de release (validación, configuración) |
| `npm run check:config` | `node scripts/check-config.mjs` | Valida variables públicas (paso 1 del release) |
| `npm run check:artifact` | `node scripts/check-artifact.mjs` | Valida contenido de `out/` (paso 5 del release) |
| `npm run release` | Ver abajo | Pipeline completo de producción (fail-closed) |
| `npm run serve:out` | `node scripts/serve-out.mjs` | Servidor estático para `out/` en http://localhost:4173 (usado por tests y preview local) |
| `npm run test:e2e` | Ver abajo | Suite E2E Playwright contra `out/` (4 navegadores, 231 tests) |
| `npm run test:e2e:update` | Ver abajo | Regenera snapshots de regresión visual (Chromium) |
| `npm run evidence:lighthouse` | `node tests/helpers/lighthouse.mjs` | Genera reportes Lighthouse (móvil + desktop con gzip) → `docs/evidence/` |
| `npm run evidence:contrast` | `node tests/helpers/contrast.mjs && python3 tests/helpers/contrast.py` | Mide contrastes de texto sobre fotografía → `docs/evidence/contrast-hero.md` |
| `npm run evidence:screens` | `python3 tests/helpers/to-webp.py` | Convierte capturas PNG a WebP (calidad 80) → `docs/evidence/screenshots/` |

### Pipeline de release (`npm run release`)

Ejecuta **en orden** (fail-closed: si cualquier paso falla, todo se detiene):

1. `test:unit` — tests de las reglas de configuración y validación
2. `check:config` — valida que todas las variables obligatorias existan y sean válidas (HTTPS, sin localhost/example.com)
3. `lint` — ESLint (sin fix automático)
4. `typecheck` — TypeScript (sin generar archivos)
5. `next build` — genera export estático en `out/`
6. `check:artifact` — verifica que `out/` no contenga:
   - Hosts prohibidos: `localhost`, `127.0.0.1`, `example.com`
   - Palabras prohibidas: `TODO`, `lorem`, `placeholder`
   - Archivos requeridos: `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `og.png`, `icon.svg`, `apple-icon.png`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest`
   - URLs válidas en `out/index.html` (exactamente `PLATFORM_URL` y `SITE_URL`)

Si **cualquier paso falla**, el build se detiene con código 1. No hay artefacto parcial.

**Output**: `out/` listo para publicar (o error explicativo si falla la validación).

## Configuración

### Entorno de desarrollo

En desarrollo (`npm run dev`, `npm run build`), si faltan variables, se usan valores por defecto:

- `NEXT_PUBLIC_SITE_URL` → `http://localhost:3000`
- `NEXT_PUBLIC_PLATFORM_URL` → `http://localhost:5173/login`

Se muestra una advertencia en consola, pero el desarrollo continúa. **Nunca publicar así.**

### Entorno de producción

Crear `.env.production.local` (git-ignored) con los valores reales aprobados. Ejemplo:

```
NEXT_PUBLIC_SITE_URL=https://m3tric.co
NEXT_PUBLIC_PLATFORM_URL=https://app.m3tric.co/login
NEXT_PUBLIC_CONTACT_EMAIL=hola@m3tric.co
NEXT_PUBLIC_CONTACT_PHONE=+573012345678
```

Validar antes de `npm run release`:

```bash
# Solo valida configuración, no hace build
npm run check:config

# OK → procede con el release
npm run release
```

## Estructura del proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Metadatos, fuente Barlow, CSS global
│   ├── page.tsx                  # Página principal (ensamble de secciones)
│   ├── globals.css               # Temas de color, escala de tipografía, utilidades
│   ├── robots.ts                 # robots.txt dinámico
│   ├── sitemap.ts                # sitemap.xml dinámico
│   ├── not-found.tsx             # 404 personalizado
│   ├── icon.svg                  # Favicon (derivado del logo)
│   ├── apple-icon.png            # Ícono para iOS
│   └── (no hay API routes ni rutas dinámicas)
│
├── config/
│   └── site.ts                   # Lector único de variables públicas (siteUrl, platformUrl, contacto)
│
├── content/
│   └── landing.ts                # Contenido de la página (copy, títulos, listas) — fuente única
│
├── components/
│   ├── brand/
│   │   ├── Logo.tsx              # Variantes del logo (color, reverse, mono-dark, mono-light)
│   │   ├── TripleBar.tsx         # Motivo de tres barras (marca + separador + indicador)
│   │   └── NodeNetwork.tsx       # Motivo de red de nodos para fondos
│   │
│   ├── ui/
│   │   ├── Button.tsx            # Botón genérico (estilo de marca)
│   │   ├── SectionHeading.tsx    # H2 + meta (índice + kicker)
│   │   ├── StatusBadge.tsx       # Badge "Disponible" / "En evolución"
│   │   └── Reveal.tsx            # Animación de entrada (scroll-triggered, respeta prefers-reduced-motion)
│   │
│   ├── layout/
│   │   ├── Header.tsx            # Encabezado fijo (nav + CTA Abrir plataforma)
│   │   ├── Footer.tsx            # Pie (logo reverse, links, contacto, derechos)
│   │   └── SkipLink.tsx          # Skip link "Saltar al contenido"
│   │
│   ├── sections/
│   │   ├── Hero.tsx              # Sección 1: propuesta + CTA + capas
│   │   ├── Proposal.tsx          # Sección 2: manifiesto + 3 valores + globo
│   │   ├── Platform.tsx          # Sección 3: 4 pasos + ilustración SVG
│   │   ├── Scales.tsx            # Sección 4: tabs M1/M2/M3 + escena 3D + fallback
│   │   ├── Products.tsx          # Sección 5: 3 líneas de producto
│   │   ├── Capabilities.tsx      # Sección 6: Disponible / En evolución + escala de colores
│   │   ├── Technology.tsx        # Sección 7: flujo + stack
│   │   ├── UseCases.tsx          # Sección 8: 4 casos de uso + foto
│   │   └── Contact.tsx           # Sección 9: CTA final + contacto
│   │
│   └── three/
│       ├── TerrainScene.tsx      # Escena 3D: terreno low-poly + 3 escalas (M1/M2/M3)
│       └── TerrainFallback.tsx   # Fallback SVG para sin WebGL / prefers-reduced-motion
│
├── public/
│   ├── images/
│   │   ├── aerial-wide-*.webp    # Foto hero (2560/1920/1280/640 px)
│   │   ├── aerial-tall-*.webp    # Foto casos de uso (747/640/480 px; 480 solo móvil, q55)
│   │   └── globe-*.webp          # Globo (1000/640 px)
│   ├── og.png                    # Open Graph (1200×630)
│   ├── icon.svg                  # SVG del logo (favicon)
│   ├── apple-icon.png            # iOS home (180×180)
│   ├── icon-192.png              # Web manifest (192×192)
│   └── icon-512.png              # Web manifest (512×512)
│
├── scripts/
│   ├── check-config.mjs          # Valida vars en release (Node puro, no TS)
│   ├── check-artifact.mjs        # Valida out/ después del build
│   ├── serve-out.mjs             # Servidor estático para out/ (local + tests)
│   └── optimize-images.py        # Convierte PNG brand a WebP en 4 anchos
│
└── tests/
    └── e2e/
        └── *.spec.ts             # Tests Playwright (contenido, responsive, a11y, 3D, CTA)
```

### Activos

| Ubicación | Contenido | Gestión |
|---|---|---|
| `public/images/` | Fotos brand WebP | Reemplazar `.webp` según ancho; mantener nombres y proporciones o actualizar `width/height` en componentes |
| `public/og.png` | Open Graph | Imagen de marca 1200×630; regenerar si cambia identidad visual |
| `public/icon.svg` y `.png` | Logo y favicons | Derivados del logo oficial (§3.4 de la spec); mantener el SVG exacto del manual |
| `src/content/landing.ts` | Textos, títulos, CTA | Actualizar aquí (sin duplicar en componentes) |
| `src/app/globals.css` | Tokens de color y tipografía | Mantener sincronizado con el manual de marca (§3.2 y 3.3) |

## Documentación

- `docs/SPEC.md` — especificación completa (ref para manuales)
- `docs/CONTENIDOS.md` — guía de actualización de textos, imágenes, contacto
- `docs/OPERACION.md` — procedimiento de publicación (S3 + CloudFront)
- `docs/ASSETS.md` — inventario de activos y licencias
- `docs/evidence/` — capturas, reportes QA, axe, Lighthouse
- `CHANGELOG.md` — historial de versiones

## Licencias

- **Barlow** (fuente) — [SIL Open Font Licence 1.1](https://github.com/jpt/barlow), autohospedada vía `next/font/google` en build
- **lucide-react** (iconografía) — [ISC](https://github.com/lucide-icons/lucide)
- **three.js**, **@react-three/fiber** — [MIT](https://threejs.org/license)
- **Next.js**, **React** — [MIT](https://opensource.org/licenses/MIT)
- **Tailwind CSS** — [MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)

Ver `docs/ASSETS.md` para inventario completo con orígenes y dimensiones.

## Soporte

- **Spec técnica**: `docs/SPEC.md`
- **Actualización de contenidos**: `docs/CONTENIDOS.md`
- **Publicación a producción**: `docs/OPERACION.md`
- **Release gate**: `npm run release` (falla si hay problemas)
