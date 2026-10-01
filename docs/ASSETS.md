# Inventario de activos y licencias

Catálogo completo de archivos del proyecto (imágenes, iconos, fuentes, componentes) con origen, dimensiones, licencias y propósito.

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

| Archivo | Dimensiones | Origen | Licencia | Propósito | Nota |
|---|---|---|---|---|---|
| `icon.svg` | Viewbox sin límite | Manual lámina 8 (tres barras del logo) + colores de marca | Propiedad M3TRIC | Favicon vectorial (navegadores modernos) | Mantener SVG exacto sin simplificar |
| `apple-icon.png` | 180 × 180 px | Derivado de icon.svg | Propiedad M3TRIC | Icono para iOS home screen (retina) | PNG sin transparencia (fondo sólido) |
| `icon-192.png` | 192 × 192 px | Derivado de icon.svg | Propiedad M3TRIC | Web Manifest + Android launcher | Usado en Progressive Web App |
| `icon-512.png` | 512 × 512 px | Derivado de icon.svg | Propiedad M3TRIC | Web Manifest (pantalla de carga) | Resolución máxima para Chrome/Edge |

**Validar con**: Equipo de marca (Anexo 1 §14, decisión pendiente 4).

---

## Componentes SVG embebidos (`src/components/brand/`)

### Logo (`src/components/brand/Logo.tsx`)

**Vectores originales**: Manual de marca M3TRIC, lámina 8

**Código fuente**: `/src/components/brand/Logo.tsx` — componente React que renderiza cuatro variantes:

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
| **Fuente** | DIN 2014 Rounded | Licencia comercial (NO incluida en repo) |
| **Tipo** | Tipografía corporativa de Metric | Definida en manual de marca §3.3 |
| **Si se licencia** | Agregar `.woff2` vía `next/font/local` | Ver `docs/CONTENIDOS.md` para procedimiento |

**La pila NO cambia** si se agrega DIN 2014 — Next.js inyecta la variable automáticamente.

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
| `scripts/lib/release-config.mjs`, `scripts/lib/artifact-rules.mjs` | Reglas compartidas del gate de release y del smoke | Proyecto |
| `scripts/hygiene.sh` | Higiene del repositorio (acciones fijadas, archivos prohibidos) | Proyecto |
| `scripts/deploy/{publish.sh,smoke.mjs,manifest.mjs,upload-manifest.sh}` | Publicación, verificación y manifiesto de despliegue | Proyecto |
| `infra/**` | App AWS CDK (stacks de identidad y de sitio) | Proyecto |
| `.github/workflows/{ci,deploy,publish,rollback}.yml` | Pipeline CI/CD | Proyecto |

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
- [ ] Si cambiaron proporciones: buscar componentes que usen `width/height` fijos y actualizar
- [ ] Ejecutar `npm run dev` y verificar visualmente en 3 anchos de pantalla
- [ ] Si actualizaste logo: validar con equipo de marca (Anexo 1 §14.4)
- [ ] Si actualizaste tokens de color: verificar contrastes (WCAG AA mínimo)
- [ ] `npm run release` en local y abrir un PR; la publicación la hace `Deploy staging` al fusionar a `main` (`docs/OPERACION.md` §6)

---

## Referencias

- **Manual de marca**: `docs/20260428_Manual de marca - Metric.pptx` (láminas 1, 3, 8, 12)
- **Spec técnica**: `docs/SPEC.md` (§3 marca, §7 arquitectura)
- **Licencias OSI**: https://opensource.org/licenses
- **Google Fonts Barlow**: https://fonts.google.com/specimen/Barlow
- **Lucide React**: https://lucide.dev
