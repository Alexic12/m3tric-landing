# Guía de actualización de contenidos

Todos los textos, títulos, mensajes y llamadas a la acción de la landing viven en **un solo archivo**: `src/content/landing.ts`. Esta guía explica cómo modificarlos sin tocar componentes y qué reglas editoriales hay que respetar.

## Reglas editoriales (obligatorias)

Vienen de `docs/SPEC.md` §2 y del Anexo 1 §6.1.

### Escritura para no técnicos

Aplica a todo lo que está **por encima** de la franja «Para equipos técnicos» (Hero, Beneficios, Casos de uso, Cómo funciona, Escalas, Por qué M3TRIC, Preguntas frecuentes y Contacto):

- Frases de **20 palabras o menos**; verbos en presente; segunda persona formal («usted»).
- Hablar de **resultados**, no de componentes: «le avisa cuando una medición cruza el límite que usted define», no «motor de umbralización».
- **Prohibido** arriba de la franja técnica: siglas sin explicar (API, IoT, PostGIS, CDK, GIS), nombres de librerías y jerga estadística. La prueba `content › «the value zone avoids unexplained jargon (spec section 2)»` falla si aparecen `API`, `IoT`, `PostGIS`, `CDK`, `GIS`, `FastAPI`, `IA` o «tiempo real». «AWS» se permite porque la pregunta sobre el alojamiento lo escribe completo.
- Nada de cifras, clientes, aliados o testimonios **sin aprobación escrita**.

### Honestidad: Disponible / En evolución

Toda capacidad, escala o beneficio se marca como:

- **Disponible**: existe y es verificable hoy en la plataforma (README raíz del workspace, «Implementadas y verificables»).
- **En evolución**: es visión o está en desarrollo (drones, satélite, escalas meso y macro, detección general de anomalías, procesamiento asíncrono, modelos predictivos).

No se pueden hacer afirmaciones sobre capacidades no verificadas. El estado se muestra con texto y forma, no solo con color. Los colores amarillo, naranja y rojo se reservan **exclusivamente** para los niveles de alerta Atención / Alerta / Crítico.

## Fuente única de verdad

`src/content/landing.ts` exporta objetos tipados. Los componentes **solo leen** estos objetos; no hay textos en JSX.

| Export | Para qué sirve | Se muestra en |
|---|---|---|
| `navItems` | Enlaces del menú (`id` = ancla, `label` = texto) | Header, menú móvil, Footer |
| `a11y` | Etiquetas ARIA y alternativas de texto | Todo el sitio |
| `cta` | Textos de los botones («Abrir plataforma», «Escribir al equipo») y asunto del correo | Header, Hero, Contacto |
| `brand` | Lema y «Todos los derechos reservados.» | Pie de página |
| `footer` | Rótulo de secciones del pie | Footer |
| `statusLabels` | «Disponible» / «En evolución» | Insignias de estado |
| `notFound` | Textos de la página 404 | `/404.html` |
| `hero` | Sección `#inicio` | Hero |
| `benefits` | Sección `#beneficios` | «Lo que usted obtiene» |
| `useCases` | Sección `#casos` | «Para quién es» |
| `howItWorks` | Sección `#como-funciona` | «Cómo funciona» |
| `scales` | Sección `#escalas` | «Escalas» |
| `whyM3tric` | Sección `#por-que` | «Por qué M3TRIC» |
| `faq` | Sección `#preguntas` y el JSON-LD `FAQPage` | «Preguntas frecuentes» |
| `technical` | Sección `#tecnico` | «Para equipos técnicos» |
| `contact` | Sección `#contacto` | «Hablemos» |

Tipos y constantes relacionados:

- `ScaleId` (`"m1" | "m2" | "m3"`) vive en `src/types.ts`; lo usan el contenido y la escena 3D.
- `Status` (`"available" | "evolving"`) vive en `src/content/landing.ts`.
- Los colores literales que no pueden ser tokens CSS (`themeColor`) viven en `src/config/brand.ts`.
- El visual de escalas (SVG de respaldo y escena 3D) se monta en el cliente al acercarse al viewport; sin JavaScript ese recuadro decorativo queda vacío y la información sigue en el texto.

> **Importante: las pruebas fijan parte del copy.** `tests/e2e/content.spec.ts` y `interaction.spec.ts` comprueban cantidades (3 resultados en el hero, 3 beneficios, 4 casos, 4 pasos, 3 escalas, 3 valores, 6 preguntas, 5 pasos del flujo de datos) y varios textos literales (títulos de beneficios, pasos, pestañas de escalas, valores, bloques técnicos, la primera pregunta). Si cambia una cantidad o uno de esos textos, actualice también la prueba correspondiente en el mismo cambio.

## Actualizar contenido por sección

### Navegación (`navItems`)

```ts
{ id: "beneficios", label: "Beneficios" }
```

Edite `label` (texto visible). **No cambie `id`**: es el ancla de scroll y debe coincidir con el `id` de la sección. El orden de las anclas en la página es: `inicio`, `beneficios`, `casos`, `como-funciona`, `escalas`, `por-que`, `preguntas`, `tecnico`, `contacto` (`#por-que` no tiene entrada de menú: se lee en el flujo).

### Hero (`hero`)

| Campo | Qué es |
|---|---|
| `meta` | Etiqueta pequeña sobre el titular («Monitoreo del territorio») |
| `titleBold`, `titleLight` | Dos partes del **mismo H1**, con mezcla de pesos: «**Entender el territorio** para anticipar el riesgo.» |
| `lead` | Bajada del titular |
| `imageAlt` | Texto alternativo de la foto (vacío: es decorativa) |
| `outcomes` | **Tres** resultados (`icon`, `label`, `text`). `icon`: `alerts`, `map` o `reports` |

### Lo que usted obtiene (`benefits`)

| Campo | Qué es |
|---|---|
| `index`, `kicker`, `title` | Numeración, rótulo y titular de la sección |
| `deliverablesLabel` | Rótulo de la lista de entregables («Lo que recibe») |
| `items` | **Tres** tarjetas: `icon` (`monitor`, `alerts`, `reports`), `title`, `text`, `deliverables` (lista de entregables concretos) y `status` |
| `evolvingNote` | Nota «En evolución» de la sección (drones y satélite) |

Principio: **prueba en lugar de promesa**. Cada beneficio nombra el entregable concreto («Tablero de sensores», «Reporte de alertas»).

### Para quién es (`useCases`)

| Campo | Qué es |
|---|---|
| `imageAlt` | Texto alternativo de la foto de la sección |
| `situationLabel`, `givesLabel` | Rótulos «La situación» y «Lo que obtiene» |
| `items` | **Cuatro** casos: `icon` (`risk`, `agro`, `infra`, `environment`), `title`, `scope`, `situation` y `gives` |

Los casos de **Infraestructura** y **Ambiente** están marcados en el código con «Pendiente de aprobación editorial (ronda de ajustes 1)». No se publican como definitivos hasta que el cliente los apruebe (`docs/TRACEABILITY.md`, REQ-C12).

### Cómo funciona (`howItWorks`)

`steps`: **cuatro** pasos (`title`, `text`) — Medimos, Revisamos y organizamos, Le avisamos, Usted decide. `mockCaption` es el pie de la vista ilustrativa del producto; debe seguir diciendo que es una **vista ilustrativa**.

### Escalas (`scales`)

```ts
{ id: "m1", code: "M1", name: "Punto", reads: "...", source: "Sensores en campo", status: "available" }
```

- `id`: `"m1"`, `"m2"`, `"m3"`. **No cambiar**: está vinculado al selector 3D y a los ids de las pestañas.
- `code` y `name` forman la etiqueta de la pestaña («M1 · Punto»).
- `reads` (qué le muestra, en lenguaje llano), `source` (de dónde viene la información) y `status`.
- Marcar una escala como `"available"` solo cuando exista y sea verificable.
- `labels`: rótulos «Qué le muestra» y «De dónde viene».

### Por qué M3TRIC (`whyM3tric`)

`statement`: frase del manifiesto en trozos `{ text, bold }`. `paragraph`: párrafo breve. `values`: **tres** valores (Rigor técnico, Precisión, Confiabilidad). `globeAlt`: texto alternativo del globo.

### Preguntas frecuentes (`faq`)

`items`: **seis** pares `{ question, answer }`. Reglas:

- **Solo respuestas verificables.** Ejemplo: no prometer plazos, precios ni integraciones que no existan.
- Las preguntas y respuestas se publican también como JSON-LD `FAQPage` en `src/app/layout.tsx`. La forma `{ question: string; answer: string }[]` es un contrato con ese archivo y la prueba `content › «JSON-LD parses; Organization and WebSite declare M3TRIC / Metric; FAQPage mirrors the visible FAQ»` exige que lo visible y lo estructurado coincidan.
- Cada respuesta es texto plano (sin HTML).

### Para equipos técnicos (`technical`)

| Campo | Qué es |
|---|---|
| `capabilities` | `available` («Disponible hoy») y `evolving` («En evolución»), cada una con su lista |
| `flow` | **Cinco** pasos del flujo de datos (`title`, `detail`) |
| `stack` | `groups` (`group`, `items`) y `security` (`icon`: `roles`, `encryption`, `code`; `text`) |
| `legend` | Escala de interpretación Atención / Alerta / Crítico |

**No modifique `flow` ni `stack` sin validar que reflejan la arquitectura real.** Esta es la única zona donde se permiten términos técnicos.

### Contacto (`contact`)

`titleBold1` + `titleLight` + `titleBold2` forman el titular: «**Entender mejor** para **decidir mejor**» (el nombre accesible debe leerse «Entender mejor para decidir mejor»). `text` invita a escribir. `pendingChannels` es el texto que se muestra **cuando no hay correo configurado** (perfil staging): «Los canales de contacto se publicarán con el dominio oficial.» El bloque nunca muestra un enlace vacío: sin correo solo aparece «Abrir plataforma».

---

## Configuración: variables de entorno

Los datos de contacto y las URL **no se editan en `landing.ts`**: se configuran por variables (perfiles, `README.md` y `docs/OPERACION.md` §3).

| Dato | Variable | Dónde se usa |
|---|---|---|
| Correo de contacto | `NEXT_PUBLIC_CONTACT_EMAIL` | Contacto y Footer (`mailto:` con el asunto de `cta.mailSubject`). Obligatorio en `production`, opcional en `staging` |
| Teléfono | `NEXT_PUBLIC_CONTACT_PHONE` | Contacto y Footer (`tel:`). Si falta, no se muestra |
| Login de la plataforma | `NEXT_PUBLIC_PLATFORM_URL` | Todos los botones «Abrir plataforma» |
| Dominio del sitio | `NEXT_PUBLIC_SITE_URL` | Canonical, Open Graph, `sitemap.xml`, JSON-LD |

En el despliegue por GitHub Actions, `CONTACT_EMAIL`, `CONTACT_PHONE` y `PLATFORM_URL` son **variables del environment `landing-staging`**; `SITE_URL` se lee de las salidas del stack. Para cambiar el contacto en staging basta editar la variable y ejecutar de nuevo el workflow `Deploy staging`.

---

## Imágenes

### Fotos de marca (hero, casos de uso, contacto, globo)

**Ubicación**: `public/images/`

- `aerial-wide-*.webp` — foto del hero (640, 1280, 1920 y 2560 px de ancho)
- `aerial-tall-*.webp` — foto vertical (480 solo para el hero móvil, calidad 55; 640 y 747 para Casos de uso y Contacto)
- `globe-*.webp` — globo de «Por qué M3TRIC» (640 y 1000 px)

**Para reemplazar una foto:**

1. Obtenga el PNG del manual de marca (`docs/20260428_Manual de marca - Metric.pptx`, en la raíz del workspace).
2. Guárdelo en un directorio temporal con los nombres `aerial-wide.png`, `aerial-tall.png` y `globe.png`.
3. Ejecute el script de optimización (calidad 78; la variante `aerial-tall` de 480 px usa calidad 55):

```bash
python3 scripts/optimize-images.py ~/Downloads/brand-images/
```

Si cambió la proporción, actualice `width` y `height` en el componente que la usa (previene el desplazamiento de diseño, CLS).

Si cambió `aerial-wide-1280.webp`, `aerial-tall-747.webp` o `globe-1000.webp`, ejecute también `npm run brand:build`: el kit (`brand/images/`) las copia byte a byte y `scripts/brand-kit.test.mjs` falla si difieren.

### Open Graph (`public/og.png`)

1200 × 630 px (obligatorio para redes sociales). Regenere si cambia la identidad o el mensaje principal. La prueba `content › «og:image is absolute, reachable, a 1200x630 PNG»` verifica las dimensiones.

---

## Logo y favicons

### Logo (`src/components/brand/Logo.tsx`)

Componente React que renderiza el SVG exacto del manual (lámina 8) en cuatro variantes (`color`, `reverse`, `mono-dark`, `mono-light`). Los trazados **no están en el componente**: su única fuente es `brand/logo/paths.json` (`viewBox`, `body` y `bars`), que `Logo.tsx` importa y de la que se generan los cuatro SVG de `brand/logo/`. **No rediseñar.** Si el manual se actualiza: exporte las formas vectoriales de la lámina 8, verifique `viewBox` y proporciones, reemplace los trazados en `brand/logo/paths.json`, ejecute `npm run brand:build` (regenera los SVG y `brand/manifest.json`) y mantenga los nombres de variante. `scripts/brand-kit.test.mjs` (parte de `npm run test:unit` y, por tanto, de `npm run release`) falla si `Logo.tsx` vuelve a llevar trazados propios o si un SVG no coincide con `paths.json`. Detalle del kit: `brand/README.md`.

### Favicons y iconos web

`public/icon.svg`, `public/apple-icon.png` (180 × 180), `public/icon-192.png`, `public/icon-512.png`. Derivados de las tres barras del logo sobre un cuadrado verde oscuro. **No cambiar sin aprobación del equipo de marca**: el favicon derivado está pendiente de validación (dependencia del cliente n.º 5). El kit guarda una copia de la marca: `brand/logo/m3tric-mark.svg` es copia byte a byte de `src/app/icon.svg`; si ese archivo cambia, ejecute `npm run brand:build`.

---

## Tipografía y color

### Tokens (`src/app/globals.css`, bloque `@theme`)

| Token | Valor | Rol |
|---|---|---|
| `--color-m3-green-900` | `#004124` | Marca, fondos oscuros |
| `--color-m3-green-950` | `#002a17` | Pie de página y franja técnica (derivado, no está en el manual) |
| `--color-m3-green-700` | `#2c694f` | Superficies secundarias |
| `--color-m3-green-400` | `#74c69d` | Barras del «3», acentos sobre oscuro |
| `--color-m3-green-200` | `#b7e3c7` | Fondos suaves, acentos sobre oscuro |
| `--color-m3-beige` | `#f6f2ea` | Fondo cálido alterno |
| `--color-m3-yellow` / `-orange` / `-red` | `#ffd166` / `#f77f00` / `#d62828` | **Solo** niveles de alerta: Atención / Alerta / Crítico |
| `--color-m3-ink` / `--color-m3-muted` | `#0b0f0d` / `#4b5563` | Texto editorial / secundario |

Reglas de uso: `#74c69d` **no** se usa como texto sobre blanco (contraste 2,04) ni sobre `#2c694f` (3,18); el texto sobre fotografía lleva un velo `#004124` de al menos 70 % y se mide con `npm run evidence:contrast`. No cambie los **nombres** de las variables. Cada hex de `@theme` tiene su par en `brand/tokens.json`, la lista de colores del kit que comparte la plataforma. Para cambiar un color, edite `brand/tokens.json`, ejecute `npm run brand:build` y repita el valor en `@theme`, en `src/config/brand.ts` y, si es un color del logo, en los `COLORS` de `Logo.tsx`; `scripts/brand-kit.test.mjs` falla si no coinciden (`brand/README.md`, «Cómo actualizar el kit»).

### Fuente

La pila `Nunito, system-ui, sans-serif` usa **Nunito** (SIL Open Font License 1.1, Google Fonts), una fuente variable (peso 200–1000) que `next/font/google` descarga en el build y sirve desde el propio origen: sin petición a Google al visitar el sitio. El diseño usa los pesos 300, 400, 500, 700 y 800 (`font.weights` en `brand/tokens.json`). Es una decisión del owner del 2026-10-05 que se aparta conscientemente del manual, que prescribe DIN 2014 Rounded (ADR-012).

**No agregue archivos de fuente a este repositorio** (`.woff`, `.woff2`, `.ttf`, `.otf`): Nunito no los necesita porque se descarga en el build, y `.gitignore` y `npm run hygiene` los rechazan. `npm run brand:build` y `scripts/brand-kit.test.mjs` también fallan si aparece un archivo de fuente bajo `brand/`.

Para cambiar la tipografía, edite el bloque `font` de `brand/tokens.json`, ejecute `npm run brand:build` y repita la pila en `src/app/globals.css` y la declaración en `src/app/layout.tsx`; `scripts/brand-kit.test.mjs` falla si la pila no coincide con el kit.

---

## Checklist antes de publicar

- [ ] **Contenido**: sin «lorem», «placeholder» ni «TODO»; todo refleja la realidad.
- [ ] **Reglas editoriales**: sin jerga arriba de la franja técnica; cada afirmación marcada Disponible o En evolución.
- [ ] **Pruebas de copy**: si cambió cantidades o textos fijados por las pruebas, actualizó `tests/e2e/*.spec.ts`.
- [ ] **Imágenes**: si agregó o reemplazó, ejecutó `python3 scripts/optimize-images.py` y revisó anchos.
- [ ] **Variables**: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLATFORM_URL` y, en producción, `NEXT_PUBLIC_CONTACT_EMAIL` son válidas.
- [ ] **Local**: `npm run release` pasa.
- [ ] **Revisión visual**: leyó la página en 360, 768 y 1920 px; probó todos los «Abrir plataforma» y el enlace «Contacto».
- [ ] **Publicación**: abra un PR; al fusionar a `main`, `Deploy staging` publica (`docs/OPERACION.md` §6).

## Referencia rápida

| Qué cambiar | Dónde | Cómo |
|---|---|---|
| Texto de una sección | `src/content/landing.ts` | Editar el objeto de la sección |
| Correo de contacto | Variable `NEXT_PUBLIC_CONTACT_EMAIL` | `.env.production.local` (local) o variable `CONTACT_EMAIL` del environment (CI) |
| URL de la plataforma | Variable `NEXT_PUBLIC_PLATFORM_URL` | `.env.production.local` o variable `PLATFORM_URL` |
| Dominio | Variable `NEXT_PUBLIC_SITE_URL` | `.env.production.local`; en CI sale del stack |
| Fotos | `public/images/` | Reemplazar y correr `scripts/optimize-images.py`; si cambia una de las tres que copia el kit, `npm run brand:build` |
| Open Graph | `public/og.png` | Reemplazar 1200 × 630 |
| Logo | `brand/logo/paths.json` (trazados) y `src/components/brand/Logo.tsx` (colores por variante) | Solo si cambia la marca; después, `npm run brand:build` |
| Colores | `brand/tokens.json` y `src/app/globals.css` | Cambiar el hex en `tokens.json`, ejecutar `npm run brand:build` y repetirlo en `@theme` y `src/config/brand.ts`; verificar contrastes |
| Estado de una escala | `src/content/landing.ts` | `status: "available"` o `"evolving"` |
| Navegación | `src/content/landing.ts` | Editar `navItems[].label` |
