# Guía de Actualización de Contenidos

Para mantener la landing de M3TRIC actualizada, todos los textos, títulos, mensajes y llamadas a la acción viven en **un solo archivo**: `src/content/landing.ts`. Esta guía explica cómo modificar cada sección sin tocar componentes.

## Fuente única de verdad

`src/content/landing.ts` es un módulo TypeScript que exporta objetos tipados con:

- **Navegación**: `navItems` — enlaces del menú y header
- **Accesibilidad**: `a11y` — textos de etiquetas ARIA
- **Llamadas a acción**: `cta` — botones y enlaces
- **Marca**: `brand` — lema y derechos
- **Secciones**: `hero`, `proposal`, `platform`, `scales`, `products`, `capabilities`, `technology`, `useCases`, `contact` — todo el contenido visible

Los componentes **solo leen** estos objetos. No hay strings en JSX.

### Tipos y constantes compartidas

- `ScaleId` (`"m1" | "m2" | "m3"`) vive en `src/types.ts`; lo usan el contenido y la escena 3D.
- `Status` (`"available" | "evolving"`, se muestra como "Disponible" / "En evolución") vive en `src/content/landing.ts`, junto con sus etiquetas.
- Los colores literales que no pueden ser tokens CSS (`themeColor` del layout y el manifest) viven en `src/config/brand.ts`.
- El visual de escalas (SVG de respaldo y escena 3D) se monta en el cliente al acercarse al viewport; sin JavaScript ese recuadro decorativo queda vacío y la información sigue en el texto de la sección.

## Actualizar contenido por sección

### 1. Navegación y menú

**Ubicación**: `navItems`

```typescript
export const navItems = [
  { id: "propuesta", label: "Propuesta" },
  { id: "plataforma", label: "Plataforma" },
  { id: "escalas", label: "Escalas" },
  { id: "productos", label: "Productos" },
  { id: "capacidades", label: "Capacidades" },
  { id: "tecnologia", label: "Tecnología" },
  { id: "casos", label: "Casos de uso" },
  { id: "contacto", label: "Contacto" },
] as const;
```

**Para cambiar un enlace del menú:**

1. Editar `label` (texto visible)
2. NO cambiar `id` (usado para scroll y navegación)

Ejemplo: cambiar "Propuesta" a "Nuestra propuesta":

```typescript
{ id: "propuesta", label: "Nuestra propuesta" },
```

### 2. Héroe (sección 1)

**Ubicación**: `hero`

```typescript
export const hero = {
  meta: "Lectura multiescala del territorio",
  titleBold: "Entender el territorio",
  titleLight: "para anticipar el riesgo.",
  lead: "M3TRIC integra sensores en campo...",
  layers: [
    { label: "Sensores en campo", active: 1 },
    { label: "Drones", active: 2 },
    { label: "Información satelital", active: 3 },
  ],
} as const;
```

**Campos:**

- `meta` — etiqueta gris arriba del título (p. ej. "Lectura multiescala del territorio")
- `titleBold` y `titleLight` — son dos **partes del mismo H1**, con mezcla de pesos tipográficos. El componente las renderiza juntas: *"**Entender el territorio** para anticipar el riesgo."*
- `lead` — párrafo intro (tipo texto grande)
- `layers` — las tres fuentes de datos (orden y labels)

**Para cambiar el titular:**

```typescript
export const hero = {
  // ...
  titleBold: "Leer el territorio",
  titleLight: "para prever crisis.",
  // ...
};
```

El componente renderizará: *"**Leer el territorio** para prever crisis."*

### 3. Propuesta de valor (sección 2)

**Ubicación**: `proposal`

```typescript
export const proposal = {
  index: "01",
  kicker: "Propuesta de valor",
  statement: [
    { text: "La lectura multiescala", bold: true },
    { text: " del territorio, basada en la integración de datos, es el núcleo de ", bold: false },
    { text: "nuestra solución.", bold: true },
  ],
  paragraphs: [
    "En territorios complejos, el problema...",
    "M3TRIC responde a esta brecha...",
  ],
  values: [
    { title: "Rigor técnico", text: "Soluciones basadas..." },
    { title: "Precisión", text: "Información confiable..." },
    { title: "Confiabilidad", text: "Consistencia en..." },
  ],
};
```

**Campos:**

- `index` — número de sección (usado como etiqueta visual)
- `kicker` — subtítulo
- `statement` — frase clave con trozos bold/light (array de `{ text, bold }`)
- `paragraphs` — dos párrafos del manifiesto
- `values` — 3 valores con título y descripción

**Para cambiar un valor:**

```typescript
values: [
  {
    title: "Innovación",
    text: "Tecnología de punta para resolver..."
  },
  // ...
]
```

### 4. Plataforma — "¿Cómo lo hacemos?" (sección 3)

**Ubicación**: `platform`

```typescript
export const platform = {
  index: "02",
  kicker: "Plataforma",
  title: "¿Cómo lo hacemos?",
  lead: "Del dato disperso a la decisión oportuna, en cuatro pasos.",
  steps: [
    {
      title: "Capturamos información",
      text: "Integramos datos de sensores...",
    },
    // ... 3 pasos más
  ],
  mockCaption: "Vista ilustrativa de la plataforma",
};
```

**Para cambiar un paso:**

```typescript
steps: [
  {
    title: "Recopilamos datos",
    text: "Integramos información de múltiples fuentes...",
  },
  // ...
]
```

### 5. Escalas (sección 4)

**Ubicación**: `scales`

```typescript
export const scales = {
  index: "03",
  kicker: "Escalas",
  title: "El comportamiento del territorio no ocurre en un solo nivel.",
  items: [
    {
      id: "m1",
      code: "M1",
      name: "Micro",
      reads: "Observaciones y estado de sensores...",
      source: "Sensores en campo",
      status: "available", // o "evolving"
    },
    // ... M2, M3
  ],
};
```

**Campos:**

- `id` — identificador único (`"m1"`, `"m2"`, `"m3"`), usado en el visor 3D
- `code` — código mostrado (p. ej. "M1")
- `name` — nombre (p. ej. "Micro")
- `reads` — qué lee esa escala
- `source` — fuente principal de datos
- `status` — `"available"` (Disponible) o `"evolving"` (En evolución)

**NO cambiar `id`** — está vinculado al selector 3D.

**Para marcar M3 como disponible** (cuando esté implementada):

```typescript
{ id: "m3", code: "M3", ..., status: "available" }
```

### 6. Productos (sección 5)

**Ubicación**: `products`

```typescript
export const products = {
  index: "04",
  kicker: "Productos",
  title: "Tres líneas de producto, una sola lectura.",
  items: [
    {
      icon: "sensors", // "sensors" | "analytics" | "map"
      title: "Sensórica e integración",
      text: "Las observaciones de sensores...",
      bullets: ["Ingesta individual y por lotes", ...],
      status: "available",
    },
    // ... 2 productos más
  ],
  evolvingNote: {
    label: "En evolución",
    text: "Integración de drones...",
  },
};
```

**Para agregar un bullet a un producto:**

```typescript
bullets: [
  "Ingesta individual y por lotes",
  "Normalización de datos",
  "Validación de observaciones",
  "Nuevo feature aquí", // ← agregar
]
```

### 7. Capacidades (sección 6)

**Ubicación**: `capabilities`

```typescript
export const capabilities = {
  index: "05",
  kicker: "Capacidades",
  available: {
    title: "Disponible hoy",
    items: [
      "API de datos con autenticación...",
      "Gestión de localizaciones...",
      // ...
    ],
  },
  evolving: {
    title: "En evolución",
    items: [
      "Lectura meso y macro (drones y satélite)",
      // ...
    ],
  },
};
```

**Regla editorial (Anexo 1 §6.1):** toda capacidad debe estar marcada **Disponible** (existe y es verificable en la plataforma según el README) o **En evolución** (visión). No se pueden hacer afirmaciones sobre capacidades no verificadas.

**Para agregar una capacidad disponible:**

```typescript
available: {
  title: "Disponible hoy",
  items: [
    // ... items existentes
    "Exportación de reportes en múltiples formatos",
  ],
}
```

### 8. Tecnología (sección 7)

**Ubicación**: `technology`

```typescript
export const technology = {
  index: "06",
  kicker: "Tecnología",
  title: "Del dato en campo a la decisión.",
  flow: [
    "Captura",
    "Ingesta y validación",
    "Almacenamiento geoespacial",
    "Análisis",
    "Visualización y alertas",
  ],
  stack: [
    { group: "Datos y API", items: ["Python 3.11", "FastAPI", "SQLAlchemy"] },
    { group: "Geoespacial", items: ["PostgreSQL 16", "PostGIS 3.4"] },
    { group: "Interfaz", items: ["React", "TypeScript", "Next.js"] },
    { group: "Nube", items: ["AWS CDK"] },
  ],
};
```

**No modificar** `flow` o `stack` sin validar que refleje la arquitectura real. Si se agregó una dependencia nueva, actualizar aquí.

### 9. Casos de uso (sección 8)

**Ubicación**: `useCases`

```typescript
export const useCases = {
  index: "07",
  kicker: "Casos de uso",
  title: "Un mismo método, cuatro frentes.",
  items: [
    {
      icon: "risk", // "risk" | "agro" | "infra" | "environment"
      title: "Gestión del riesgo",
      scope: "Deslizamientos y movimientos en masa",
      text: "El comportamiento del terreno empieza...",
    },
    // ... 3 casos más
  ],
};
```

**Para cambiar un caso de uso:**

```typescript
{
  icon: "agro",
  title: "Agricultura de precisión",
  scope: "Optimización del rendimiento por parcela",
  text: "Cada sector del terreno requiere un abordaje diferente...",
}
```

### 10. Contacto (sección 9)

**Ubicación**: `contact`

```typescript
export const contact = {
  index: "08",
  kicker: "Contacto",
  titleBold1: "Entender mejor",
  titleLight: "para",
  titleBold2: "decidir mejor",
  text: "Cuéntenos qué territorio necesita entender...",
  emailLabel: "Correo",
  phoneLabel: "Teléfono",
};
```

El titular es una mezcla de dos bold + light: *"**Entender mejor** para **decidir mejor**"*

---

## Configuración: variables de entorno

### Contacto: correo y teléfono

**NO editar en `landing.ts`.** Estos datos se configuran vía variables de entorno:

```bash
NEXT_PUBLIC_CONTACT_EMAIL=hola@m3tric.co
NEXT_PUBLIC_CONTACT_PHONE=+573012345678
```

Si el teléfono falta o está vacío, su campo no se renderiza (nunca un enlace vacío).

Ver `docs/OPERACION.md` para configurar en producción.

### URL de la plataforma

**NO editar en `landing.ts`.** La URL se configura vía:

```bash
NEXT_PUBLIC_PLATFORM_URL=https://app.m3tric.co/login
```

Todos los botones "Abrir plataforma" usan esta URL. Se valida en `npm run release`.

### Dominio del sitio

```bash
NEXT_PUBLIC_SITE_URL=https://m3tric.co
```

Se usa en:

- Metadatos (canonical, Open Graph)
- `robots.txt` y `sitemap.xml` (dinámicos)
- JSON-LD (Organization)

---

## Imágenes

### Fotos brand (hero, casos de uso, globo)

**Ubicación**: `public/images/`

**Archivos:**

- `aerial-wide-*.webp` — foto hero (aérea de ladera), 4 anchos: 640, 1280, 1920, 2560 px
- `aerial-tall-*.webp` — foto vertical (hero móvil, casos de uso, contacto), 3 anchos: 480 (q55, solo hero móvil), 640, 747 px
- `globe-*.webp` — globo (sección propuesta), 2 anchos: 640, 1000 px

**Para reemplazar una foto:**

1. Obtener archivo PNG del manual de marca: `docs/20260428_Manual de marca - Metric.pptx`
2. Guardar en un directorio temporal (ej. `~/Downloads/brand-images/`)
3. Ejecutar el script de optimización:

```bash
python3 scripts/optimize-images.py ~/Downloads/brand-images/
```

Esto genera WebP en los 4 anchos correctos, con calidad 78 (recomendado para web).

**Si cambió la proporción o dimensiones:**

- Buscar dónde se renderiza la foto (en componentes de secciones)
- Actualizar `width` y `height` props para prevenir Cumulative Layout Shift (CLS)

Ejemplo: si la nueva `aerial-wide` tiene proporción diferente:

```typescript
// Componente Hero.tsx
<img
  src={heroImage}
  width={2897} // ← verificar el nuevo ancho base
  height={1100} // ← verificar la nueva altura base
  alt={a11y...}
/>
```

### Open Graph (`public/og.png`)

- **Tamaño**: 1200 × 630 px (obligatorio para redes sociales)
- **Contenido**: logo M3TRIC + propuesta de valor
- **Actualizar si**: cambia la identidad visual o el mensaje principal
- **Ubicación**: preexportado en `public/og.png`

---

## Logo y favicons

### Logo principal (`src/components/brand/Logo.tsx`)

El logo es un **componente React** que renderiza el SVG exacto del manual de marca (lámina 8):

```typescript
export const Logo = ({ variant = "color" }: { variant?: LogoVariant }) => {
  // Soporta 4 variantes:
  // - "color": cuerpo verde oscuro, barras verde claro (fondos claros)
  // - "reverse": cuerpo/barras blanco, barras verdes (fondos oscuros)
  // - "mono-dark": todo negro 100%/50% (fondo blanco)
  // - "mono-light": todo blanco 100%/50% (fondo negro)
};
```

**NO rediseñar.** Si el manual de marca se actualiza:

1. Exportar las formas vectoriales de la lámina 8 como SVG
2. Verificar viewBox y proporciones
3. Reemplazar los paths `<path d="M..." />` en el componente
4. Mantener los nombres de variables de color

### Favicons y web icons

**Ubicación**: `public/icon.svg`, `public/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png`

**Contenido**: Derivado de las tres barras del logo (lámina 8) sobre un cuadrado redondeado verde oscuro.

**Para actualizar:**

1. Generar desde el manual de marca (si cambió la identidad)
2. `icon.svg` — versión vectorial de alta fidelidad
3. `apple-icon.png` — 180 × 180 px para iOS
4. `icon-192.png` — 192 × 192 px para web manifest
5. `icon-512.png` — 512 × 512 px para web manifest + Android

**Validar:** No cambiar sin aprobación del equipo de marca (§2, "Decisiones pendientes del cliente").

---

## Tipografía y color (tokens de marca)

### Tokens CSS (`src/app/globals.css`)

Los colores y fuentes están centralizados en `@theme`:

```css
@theme {
  --color-m3-green-900: #004124;    /* Verde oscuro — marca, fondos */
  --color-m3-green-950: #002a17;    /* Verde casi negro — pie de página (derivado, no está en el manual) */
  --color-m3-green-700: #2c694f;    /* Verde medio — superficies secundarias */
  --color-m3-green-400: #74c69d;    /* Verde claro — barras, acentos */
  --color-m3-green-200: #b7e3c7;    /* Verde pastel — fondos claros */
  --color-m3-beige: #f6f2ea;        /* Beige — editorial alterno */
  --color-m3-yellow: #ffd166;       /* Amarillo — escala nivel 1 (Atención) */
  --color-m3-orange: #f77f00;       /* Naranja — escala nivel 2 (Alerta) */
  --color-m3-red: #d62828;          /* Rojo — escala nivel 3 (Crítico) */
  --color-m3-ink: #0b0f0d;          /* Negro — texto principal */
  --color-m3-muted: #4b5563;        /* Gris — texto secundario */

  --font-sans: "DIN 2014 Rounded", var(--font-barlow), system-ui, sans-serif;
}
```

**Reglas de uso (obligatorio):**

- **Verde cálido** (amarillo/naranja/rojo): **solo** para niveles de alerta. Nunca botones, decoración o texto editorial.
- **Contraste**: todos cumplen WCAG AA mínimo. Ver `docs/SPEC.md` §3.2 para contrastes específicos.
- **Tipografía**: La pila de fuentes intenta `DIN 2014 Rounded` (licencia comercial, no en el repo). Fallback es `Barlow` (OFL, autohospedada). Si el cliente licencia DIN 2014 Rounded, agregar `.woff2` vía `next/font/local` — la pila no cambia.

**Para cambiar un color:**

1. Actualizar el valor hex en `@theme`
2. Verificar contrastes con herramienta (p. ej. WebAIM)
3. **No cambiar nombres** de variables (rompería todo CSS)

**Para agregar una fuente personalizada:**

1. Si es DIN 2014 Rounded (licencia comercial), agregarse en `next/font/local`:

```typescript
// src/app/layout.tsx
import localFont from "next/font/local";

const dinRounded = localFont({
  src: [
    { path: "../../public/fonts/DIN2014-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/DIN2014-Bold.woff2", weight: "700" },
  ],
  variable: "--font-din-rounded",
});
```

2. Actualizar la pila en `globals.css`:

```css
--font-sans: "DIN 2014 Rounded", var(--font-barlow), system-ui, sans-serif;
/* Sin cambios — Next.js inyecta --font-din-rounded automáticamente */
```

---

## Checklist antes de publicar

Antes de ejecutar `npm run release`:

- [ ] **Contenido**: verificar que todos los textos reflejen la realidad (sin "lorem", "placeholder", "TODO")
- [ ] **Imágenes**: si se agregaron/reemplazaron, ejecutar `python3 scripts/optimize-images.py` y validar anchos
- [ ] **URLs**: revisar que `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLATFORM_URL` y `NEXT_PUBLIC_CONTACT_EMAIL` sean válidas
- [ ] **Disponible vs. En evolución**: confirmar que el estado de cada capacidad/escala sea correcto (no inventar features)
- [ ] **Escaneo manual**: leer la página en pantalla completa, 3 anchos de pantalla (360, 768, 1920)
- [ ] **Links**: clic en todos los "Abrir plataforma", "Hablar con el equipo", enlaces de header/footer
- [ ] **Accesibilidad**: Tab por la página, verificar que todos los botones sean accesibles
- [ ] **3D**: probar en Chrome/Firefox/Safari que el visor 3D cargue (o muestre fallback SVG)

Entonces:

```bash
npm run release
# Si todo OK:
# - out/ contiene el sitio estático listo
# - Proceder a docs/OPERACION.md para publicar a S3/CloudFront
```

---

## Referencia rápida

| Qué cambiar | Dónde | Archivo | Cómo |
|---|---|---|---|
| Texto de sección | Propuesta, Hero, Contacto, etc. | `src/content/landing.ts` | Editar el objeto de la sección |
| Email de contacto | Footer, botón CTA | `.env.production.local` | `NEXT_PUBLIC_CONTACT_EMAIL=...` |
| URL de plataforma | Todos los "Abrir plataforma" | `.env.production.local` | `NEXT_PUBLIC_PLATFORM_URL=...` |
| Dominio (sitemap, OG) | robots.txt, og.png, metadatos | `.env.production.local` | `NEXT_PUBLIC_SITE_URL=...` |
| Foto hero/casos/globo | Imagen visible | `public/images/` | Reemplazar WebP; correr `scripts/optimize-images.py` |
| Open Graph | Redes sociales | `public/og.png` | Reemplazar 1200×630 |
| Logo | Header, footer | `src/components/brand/Logo.tsx` | Actualizar SVG (solo si marca cambia) |
| Colores de marca | Todo el sitio | `src/app/globals.css` | Cambiar valores hex en `@theme` |
| Escala estado (M1/M2/M3) | Visor 3D, textos | `src/content/landing.ts` | Cambiar `status: "available"` o `"evolving"` |
| Navegación | Header, menú móvil | `src/content/landing.ts` | Editar `navItems[].label` |
