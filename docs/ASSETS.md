# Inventario de activos y licencias

Catálogo completo de archivos del proyecto (imágenes, iconos, fuentes, componentes, kit de marca) con origen, dimensiones, licencias y propósito.

---

## Activos en `public/`

### Imágenes (`public/images/`)

Fotos de marca optimizadas en WebP. Generadas desde PNG originales del manual de marca vía `scripts/optimize-images.py`.

| Archivo | Origen | Dimensiones | Licencia | Propósito | Nota |
|---|---|---|---|---|---|
| `aerial-wide-2560.webp` | Manual 20260428_Manual de marca - Metric.pptx, lámina 12 | 2560 × 980 px | Propiedad M3TRIC | Hero — foto aérea de ladera (tamaño máximo) | Servido en srcset solo en pantallas 4K; calidad 78 |
| `aerial-wide-1920.webp` | Manual, lámina 12 | 1920 × 735 px | Propiedad M3TRIC | Hero — foto aérea de ladera (desktop) | Ancho típico para 1920 px viewport |
| `aerial-wide-1280.webp` | Manual, lámina 12 | 1280 × 490 px | Propiedad M3TRIC | Hero — foto aérea de ladera (tablet) | Ancho para 1280 px viewport |
| `aerial-wide-640.webp` | Manual, lámina 12 | 640 × 245 px | Propiedad M3TRIC | Hero — foto aérea de ladera (móvil) | Ancho mínimo para responsividad |
| `aerial-tall-747.webp` | Manual, lámina 12 | 747 × 1256 px | Propiedad M3TRIC | Casos de uso — foto aérea vertical | Desktop; orientación portrait; calidad 78 |
| `aerial-tall-640.webp` | Manual, lámina 12 | 640 × 1073 px | Propiedad M3TRIC | Casos de uso — foto aérea vertical | Tablet; orientación portrait; calidad 78 |
| `aerial-tall-480.webp` | Manual, lámina 12 | 480 × 805 px | Propiedad M3TRIC | Casos de uso — foto aérea vertical | Móvil; orientación portrait; calidad 55 (hero móvil, LCP-crítico) |
| `globe-1000.webp` | Manual, lámina 3 (globo monocromo) | 1000 × 667 px | Propiedad M3TRIC | «Por qué M3TRIC» — globo terráqueo con red de nodos | Desktop |
| `globe-640.webp` | Manual, lámina 3 | 640 × 427 px | Propiedad M3TRIC | «Por qué M3TRIC» — globo terráqueo | Móvil |

**Notas técnicas:**

- **Formato**: WebP (calidad 78, método 6 lossless) — 30–40 % menor que PNG sin pérdida visual
- **Srcset**: renderizadas con `<img srcset="">` en componentes para seleccionar ancho correcto según viewport
- **Loading**: `loading="lazy"` excepto hero (`fetchpriority="high"`)
- **Alt**: descriptivo en inglés/español (accesibilidad + SEO)
- **CLS**: `width` y `height` explícitos para prevenir layout shift

### Open Graph (`public/og.png`)

| Archivo | Dimensiones | Origen | Licencia | Propósito |
|---|---|---|---|---|
| `og.png` | 1200 × 630 px | Diseño de marca M3TRIC | Propiedad M3TRIC | Compartir en redes sociales (Facebook, Twitter, LinkedIn, WhatsApp) |

**Notas:**

- Contiene logo + propuesta de valor (texto legible en thumbnail)
- Exportada a 72 DPI (suficiente para web)
- Actualizar si cambia la identidad visual o el mensaje principal

### Favicon e iconos (`public/icon.*`, `public/apple-icon.png`)

Las rutas `public/icon.*` y `public/apple-icon.png` del encabezado y de otros documentos son las rutas servidas: `icon.svg` y `apple-icon.png` están en `src/app/` y Next.js los sirve en `/icon.svg` y `/apple-icon.png`; `icon-192.png` e `icon-512.png` están en `public/`.

| Archivo | Dimensiones | Origen | Licencia | Propósito | Nota |
|---|---|---|---|---|---|
| `icon.svg` | Viewbox sin límite | Manual lámina 8 (tres barras del logo) + colores de marca | Propiedad M3TRIC | Favicon vectorial (navegadores modernos) | Mantener SVG exacto sin simplificar. Servido en /icon.svg desde `src/app/icon.svg`; el kit guarda una copia byte a byte (`brand/logo/m3tric-mark.svg`) |
| `apple-icon.png` | 180 × 180 px | Derivado de icon.svg | Propiedad M3TRIC | Icono para iOS home screen (retina) | PNG sin transparencia (fondo sólido). Servido en /apple-icon.png desde `src/app/apple-icon.png` |
| `icon-192.png` | 192 × 192 px | Derivado de icon.svg | Propiedad M3TRIC | Web Manifest + Android launcher | Usado en Progressive Web App |
| `icon-512.png` | 512 × 512 px | Derivado de icon.svg | Propiedad M3TRIC | Web Manifest (pantalla de carga) | Resolución máxima para Chrome/Edge |

**Validar con**: Equipo de marca (Anexo 1 §14, decisión pendiente 4).

---

## Componentes SVG embebidos (`src/components/brand/`)

### Logo (`src/components/brand/Logo.tsx`)

**Vectores originales**: Manual de marca M3TRIC, lámina 8

**Fuente de los trazados**: `brand/logo/paths.json` (única fuente: `viewBox`, `body` y `bars`). Los cuatro SVG de `brand/logo/` se generan de ese archivo con `npm run brand:build`.

**Código fuente**: `/src/components/brand/Logo.tsx` — componente React que importa `brand/logo/paths.json` (ya no contiene trazados) y renderiza cuatro variantes:

| Variante | Cuerpo | Barras | Fondo | Uso |
|---|---|---|---|---|
| `color` | Verde oscuro `#004124` 100 % | Verde claro `#74C69D` 100 % | Blanco / beige | Fondos claros (default) |
| `reverse` | Blanco/Verde pastel 100 % | Verde claro `#74C69D` 100 % | Verde oscuro `#004124` | Fondos oscuros (footer) |
| `mono-dark` | Negro `#000` 100 %, barras gris 50 % | Negro `#000` 50 % | Blanco | Impresión B&W, copias |
| `mono-light` | Blanco `#FFF` 100 %, barras gris 50 % | Blanco `#FFF` 50 % | Negro | Impresión B&W, fondos oscuros |

**Propiedades:**

- Ancho recomendado: ≥ 96 px (mínimo para legibilidad)
- Área de protección: altura de una barra alrededor (margen)
- Accesibilidad: `role="img"` + `aria-label="M3TRIC"`

### TripleBar (`src/components/brand/TripleBar.tsx`)

**Concepto**: Tres cápsulas horizontales (motivo recurrente del "3").

**Usos:**

- Marcador de sección (p. ej. `01`, `02`, etc.)
- Separador visual entre bloques
- Indicador de escala (1/2/3 barras coloreadas según escala activa M1/M2/M3)

**Propiedades:**

- Color: verde claro `#74C69D` (marca)
- Tamaño: configurable (default 24 × 8 px por barra)
- Estado activo: puede renderizar 1/2/3 barras llenas

### NodeNetwork (`src/components/brand/NodeNetwork.tsx`)

**Concepto**: SVG ligero de puntos y líneas (como overlay de la foto aérea).

**Uso:**

- Fondo decorativo en secciones oscuras (p. ej. secciones 1, 4, 9)
- Evoca la red de sensores (IoT) del sistema

**Propiedades:**

- Color: verde claro `#74C69D` a baja opacidad
- SVG embebido (no externo) para evitar request extra

---

## Kit de marca (`brand/`)

Fuente única de la identidad visual que comparten la landing y la plataforma (ADR-008). Hay dos archivos fuente escritos a mano; el resto se genera o se copia. Detalle de uso y de actualización: `brand/README.md`.

| Archivo | Clase | Origen | Licencia | Propósito |
|---|---|---|---|---|
| `tokens.json` | Fuente (escrito a mano) | Manual de identidad M3TRIC (abril 2026), interpretado en `docs/SPEC.md` §3 | Proyecto (autoría propia; los valores de marca son los del manual) | Única lista de hex del kit; además, niveles de alerta, tipografía (pila, pesos y estado de DIN), radios, foco, sombra, geometría de las tres barras y serie de gráficos |
| `logo/paths.json` | Fuente (escrito a mano) | Manual, lámina 8 (formas libres del wordmark) | Propiedad M3TRIC | Única fuente de los trazados del logo; no se redibuja |
| `tokens.css` | Generado de `tokens.json` | — | Proyecto | Las mismas variables como `:root` (`--m3-*`) |
| `logo/m3tric-logo-{color,reverse,mono-dark,mono-light}.svg` | Generado de `paths.json` | Manual, láminas 8 y 11 | Propiedad M3TRIC | Variantes del wordmark |
| `motifs/triple-bar.svg` | Generado de `tokens.json` (geometría de las tres barras) | Manual, lámina 8 (el «3» como tres barras) | Propiedad M3TRIC | Motivo decorativo en `currentColor` |
| `manifest.json` | Generado | — | Proyecto | `version`, `generatedAt` (solo fecha) y sha256 de cada archivo del kit salvo él mismo |
| `logo/m3tric-mark.svg` | Copia byte a byte de `src/app/icon.svg` | Tres barras del logo sobre cuadrado `#004124` | Propiedad M3TRIC | Marca para favicon; pendiente de validación de marca (dependencia del cliente n.º 5) |
| `images/aerial-wide-1280.webp`, `images/aerial-tall-747.webp` | Copia byte a byte de `public/images/` | Manual, lámina 12 | Propiedad M3TRIC | Fotografía del manual sin texto incrustado |
| `images/globe-1000.webp` | Copia byte a byte de `public/images/` | Manual, lámina 3 | Propiedad M3TRIC | Fotografía del manual sin texto incrustado |
| `README.md`, `fonts/README.md` | Escritos a mano | — | Proyecto | Documentación del kit; `fonts/README.md` reserva el espacio de DIN 2014 Rounded, **sin archivos de fuente** |

**Reglas:**

- **Inventario explícito**: `scripts/brand-build.mjs` solo acepta los archivos de la tabla. Cualquier otro archivo bajo `brand/` hace fallar `npm run brand:build` y `scripts/brand-kit.test.mjs`; así no entran archivos de fuente con licencia (`.woff`, `.woff2`, `.ttf`, `.otf`, …) a un repositorio público (ADR-010).
- **No se publica en el sitio**: `brand/` vive en la raíz del repositorio y no pasa por `public/` ni por `out/`.
- **Las copias no se editan**: `logo/m3tric-mark.svg` e `images/*.webp` se regeneran con `npm run brand:build` cuando cambia su origen, y las pruebas fallan si difieren.
- **Fin de línea**: `.gitattributes` fija `brand/** text eol=lf`.
- **Espejos en la landing**: `src/app/globals.css` (`@theme`), `src/config/brand.ts`, los colores de `Logo.tsx` y la geometría de `TripleBar.tsx` repiten valores del kit; las pruebas fallan si dejan de coincidir.
- **Plataforma**: copia el kit por commit con sha256 (ADR-008).

---

## Fuentes (`src/app/layout.tsx`, `next/font/google`)

### Barlow (producción)

| Propiedad | Valor | Licencia |
|---|---|---|
| **Fuente** | Barlow (Google Fonts) | SIL Open Font License 1.1 |
| **Pesos** | 300 (Light), 400, 500, 700, 800 | OFL 1.1 |
| **Subsets** | Latin (latino, sin caracteres extendidos) | OFL 1.1 |
| **Display** | `swap` — mostrar fallback mientras carga | CSS Font Loading API |
| **Hospedaje** | Autohospedada en build (Next.js `next/font/google`) | Descargada en tiempo de build |

**Declaración** (`src/app/layout.tsx`):

```typescript
import { Barlow } from "next/font/google";

const barlow = Barlow({
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});
```

**Pila en CSS** (`src/app/globals.css`):

```css
--font-sans: "DIN 2014 Rounded", var(--font-barlow), system-ui, sans-serif;
```

- Intenta DIN 2014 Rounded (opcional, licencia comercial)
- Fallback: Barlow (OFL, autohospedada)
- Tercer fallback: `system-ui` (fuente del sistema)

### DIN 2014 Rounded (opcional, cliente)

| Propiedad | Valor | Nota |
|---|---|---|
| **Fuente** | DIN 2014 Rounded | Licencia comercial de Paratype (NO incluida en el repositorio ni en el sitio; ADR-010) |
| **Tipo** | Tipografía corporativa de Metric | Definida en manual de marca §3.3 |
| **Estado** | Pendiente de licencia | Hoy la tipografía efectiva es Barlow; `font.din.status` es `pending-license` en `brand/tokens.json` |
| **Si se licencia** | Los `.woff2` **nunca se agregan al repositorio** (es público y las licencias de fuentes comerciales prohíben redistribuirlos). Se sirven bajo `/fonts/*` desde un bucket privado compartido con la plataforma y el `@font-face` se activa por configuración | Diseño en `docs/adr/ADR-010-din-2014-rounded-licencia-y-servicio.md` y `brand/fonts/README.md`; todavía no está implementado |

**La pila CSS no cambia** si se licencia DIN 2014 Rounded: ya la nombra en primer lugar y, sin el archivo, cae en Barlow. `npm run brand:build` y `scripts/brand-kit.test.mjs` fallan si aparece un archivo de fuente bajo `brand/`.

---

## Dependencias (`package.json`)

### Componentes y utilidades

| Paquete | Versión | Licencia | Propósito | Notas |
|---|---|---|---|---|
| **next** | 16.1.6 | MIT | Framework (App Router, export estático) | Compilador + bundler |
| **react** | 19.2.3 | MIT | Biblioteca de componentes | UI declarativa |
| **react-dom** | 19.2.3 | MIT | Rendering en DOM | Enlace entre React y HTML |
| **@react-three/fiber** | ^9.5.0 | MIT | Binding React → Three.js | Escena 3D (M1/M2/M3) |
| **three** | ^0.183.2 | MIT | Motor 3D WebGL | Geometrías, materiales, rendering |
| **lucide-react** | ^0.577.0 | ISC | Iconografía | Iconos SVG React (20/24 px, trazo 1.5) |

### Build y tipado

| Paquete | Versión | Licencia | Propósito |
|---|---|---|---|
| **tailwindcss** | ^4 | MIT | Utilidades CSS (tema en `@theme`) |
| **@tailwindcss/postcss** | ^4 | MIT | Plugin PostCSS (procesamiento CSS) |
| **typescript** | ^5 | Apache 2.0 | Tipado estático (no requerido en runtime) |
| **@types/react** | ^19 | MIT | Tipos para React |
| **@types/react-dom** | ^19 | MIT | Tipos para React DOM |
| **@types/node** | ^20 | MIT | Tipos para Node.js |
| **eslint** | ^9 | MIT | Linter (validación de código) |
| **eslint-config-next** | 16.1.6 | MIT | Configuración ESLint para Next.js |
| **@types/three** | ^0.183.1 | MIT | Tipos para Three.js |

**Nota**: No hay Redis, "IA", o dependencias externas de runtime (excepto lo necesario para render 3D).

---

## Licencias de dependencias (resumen)

### MIT (2024 Open Source Initiative approved)

Permite uso comercial, modificación, distribución y uso privado. Requiere conservar la licencia en copias.

- Next.js, React, React DOM, Tailwind CSS, Three.js, @react-three/*, lucide-react, TypeScript

### SIL Open Font License 1.1 (OFL)

Permite uso comercial de la fuente, modificación (con restricción de nombres). Requiere mantener licencia.

- Barlow (Google Fonts)

### ISC (2024 OSI approved)

Similar a MIT; muy permisiva.

- lucide-react

### Apache 2.0

Permite modificación, distribución comercial. Requiere declaración de cambios.

- TypeScript

---

## Archivos de configuración y scripts

| Archivo | Propósito | Propiedad |
|---|---|---|
| `next.config.ts` | Configuración de Next.js (export, trailingSlash, imágenes) | Proyecto |
| `tailwind.config.ts` | Configuración de Tailwind (si existe; tema en CSS) | Proyecto |
| `tsconfig.json` | Configuración TypeScript | Proyecto |
| `eslint.config.js` | Configuración ESLint | Proyecto |
| `scripts/check-config.mjs` | Validación de variables en release | Proyecto |
| `scripts/check-artifact.mjs` | Validación de artefacto `out/` | Proyecto |
| `scripts/serve-out.mjs` | Servidor estático para `out/` | Proyecto |
| `scripts/optimize-images.py` | Conversión PNG → WebP | Proyecto |
| `scripts/brand-build.mjs` (`npm run brand:build`) | Genera el kit de marca (`brand/`) desde `brand/tokens.json` y `brand/logo/paths.json`; es idempotente y rechaza archivos fuera del inventario del kit | Proyecto |
| `scripts/brand-kit.test.mjs` | Pruebas de deriva del kit: paleta, logo, motivo, `tokens.css`, manifiesto, inventario exacto y ausencia de archivos de fuente; parte de `npm run test:unit` | Proyecto |
| `scripts/lib/release-config.mjs`, `scripts/lib/artifact-rules.mjs` | Reglas compartidas del gate de release y del smoke | Proyecto |
| `scripts/hygiene.sh` | Higiene del repositorio (acciones fijadas, archivos prohibidos) | Proyecto |
| `scripts/deploy/{publish.sh,smoke.mjs,manifest.mjs,upload-manifest.sh}` | Publicación, verificación y manifiesto de despliegue | Proyecto |
| `infra/**` | App AWS CDK (stacks de identidad y de sitio) | Proyecto |
| `.github/workflows/{ci,deploy,publish,rollback}.yml` | Pipeline CI/CD | Proyecto |
| `.gitattributes` | Fija `brand/** text eol=lf` | Proyecto |
| `brand/**` | Kit de marca compartido con la plataforma | Ver «Kit de marca» |

---

## Consideraciones legales

### Marca registrada

- **M3TRIC** es marca registrada de Metric (cliente)
- Logo, colores, tipografía y contenido son propiedad intelectual de Metric
- Uso restringido a este sitio web (bajo contrato Anexo 1)

### Sin datos personales

De acuerdo con Anexo 1 §13.2 y spec §15:

- La landing **no almacena ni envía datos personales**
- No hay formularios persistentes (sin backend de almacenamiento)
- Email de contacto es mailto: (solo enlace, sin captación)

### Herramientas de terceros (no incluidas, solo desarrollo)

| Herramienta | Propósito | En producción |
|---|---|---|
| Playwright (`@playwright/test` 1.63.0) | Tests E2E | ❌ No |
| `@axe-core/playwright` 4.13.0 | Auditoría accesibilidad | ❌ No (solo tests) |
| `@next/env` 16.1.6 | Carga de variables de entorno en los scripts de release (`scripts/lib/release-config.mjs`) | ❌ No |
| Lighthouse | Auditoría de rendimiento | ❌ No (reportes locales) |
| ESLint, TypeScript | Validación | ❌ No (solo build-time) |

### Herramientas de infraestructura (`infra/package.json`, solo desarrollo y despliegue)

Ninguna se incluye en el sitio publicado. Versiones fijadas en `infra/package.json`.

| Paquete | Versión | Licencia | Propósito |
|---|---|---|---|
| `aws-cdk-lib` | 2.267.0 | Apache-2.0 | Biblioteca de constructos de AWS CDK (define los stacks) |
| `constructs` | 10.8.1 | Apache-2.0 | Modelo base de constructos de CDK |
| `cdk-nag` | 3.0.2 | Apache-2.0 | Reglas `AwsSolutions` sobre las plantillas (falla la síntesis si hay hallazgos sin justificar) |
| `zod` | 4.4.3 | MIT | Validación del esquema de `infra/config/*.json` y del contexto de despliegue |
| `vitest` | 4.1.11 | MIT | Pruebas de las plantillas sintetizadas |
| `aws-cdk` (CLI) | 2.1138.0 | Apache-2.0 | `cdk synth` / `cdk deploy` (`devDependency`) |
| `typescript` | 5.9.3 | Apache-2.0 | Compilación y tipos |
| `eslint`, `@eslint/js`, `typescript-eslint`, `globals` | 10.9.1 · 10.0.1 · 8.68.0 · 17.11.0 | MIT | Lint de `infra/` |
| `ts-node`, `@types/node` | 10.9.2 · 26.4.0 | MIT | Ejecución de `bin/landing.ts` y tipos de Node |

Las licencias son las que publica cada proyecto; este inventario no sustituye una auditoría de licencias de la cadena de dependencias transitivas.

### GitHub Actions usadas en CI/CD (fijadas por SHA de 40 caracteres)

| Action | Versión | SHA | Uso |
|---|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | Descarga del repositorio |
| `actions/setup-node` | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` | Node 24.19.0 y caché de npm |
| `actions/upload-artifact` | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | Informe de Playwright (si falla) y manifiesto de despliegue |
| `aws-actions/configure-aws-credentials` | v6.3.0 | `e1253824e5c10ff9df46874f81ed3ec929e19cfd` | Credenciales temporales por OIDC |

`scripts/hygiene.sh` (job `hygiene` de CI) falla si algún `uses:` de `.github/workflows/` no está fijado por SHA. Para actualizar una action, cambie el SHA y la versión del comentario en los workflows que la usan (`ci.yml`, `deploy.yml`, `publish.yml`, `rollback.yml`).

---

## Checklist de mantenimiento

Cuando actualices activos:

- [ ] Reemplazar PNG en directorio temporal
- [ ] Correr `python3 scripts/optimize-images.py <dir>`
- [ ] Verificar que los `.webp` aparecen en `public/images/`
- [ ] Si cambió `aerial-wide-1280`, `aerial-tall-747` o `globe-1000`: `npm run brand:build` (el kit las copia byte a byte)
- [ ] Si cambiaron proporciones: buscar componentes que usen `width/height` fijos y actualizar
- [ ] Ejecutar `npm run dev` y verificar visualmente en 3 anchos de pantalla
- [ ] Si actualizaste el logo: editar `brand/logo/paths.json`, ejecutar `npm run brand:build` y validar con equipo de marca (Anexo 1 §14.4)
- [ ] Si cambió `src/app/icon.svg`: `npm run brand:build` (`brand/logo/m3tric-mark.svg` es una copia byte a byte)
- [ ] Si actualizaste tokens de color: editar `brand/tokens.json`, ejecutar `npm run brand:build`, repetir el valor en `@theme` y `src/config/brand.ts`, y verificar contrastes (WCAG AA mínimo)
- [ ] `npm run release` en local (incluye las pruebas de deriva del kit) y abrir un PR; la publicación la hace `Deploy staging` al fusionar a `main` (`docs/OPERACION.md` §6)

---

## Referencias

- **Manual de marca**: `docs/20260428_Manual de marca - Metric.pptx` (láminas 1, 3, 8, 12)
- **Spec técnica**: `docs/SPEC.md` (§3 marca, §7 arquitectura)
- **Licencias OSI**: https://opensource.org/licenses
- **Google Fonts Barlow**: https://fonts.google.com/specimen/Barlow
- **Lucide React**: https://lucide.dev
