# M3TRIC Landing v2 — Especificación de implementación end-to-end

- **Versión:** 2.0 · 2026-09-30
- **Fuentes de verdad:** `docs/20260428_Manual de marca - Metric.pptx` (manual de identidad, abril 2026) · `docs/entregables/Anexo_1_Alcance_Tecnico_Landing_AWS_M3TRIC_2026-09-23.pdf` (alcance contractual) · `README.md` raíz (capacidades implementadas vs. límites conocidos).
- **Precedencia ante conflicto:** Anexo 1 (qué se entrega) > Manual de marca (cómo se ve y suena) > README (qué se puede afirmar) > esta spec.

---

## 1. Objetivo y criterio de éxito

Reconstruir la landing pública de M3TRIC sobre el sistema visual del manual de marca, como sitio estático exportable (`out/`) listo para S3 + CloudFront, que cumpla los criterios de aceptación 1–8 del Anexo 1 §10.

**Hecho significa:** `npm run release` pasa (config de producción válida + lint + typecheck + build estático + escaneo de artefacto) y `npm run test:e2e` pasa en Chromium, Firefox y WebKit, con evidencia de capturas en 360/768/1280/1920 px, auditoría axe sin violaciones serias/críticas y Lighthouse documentado.

**Fuera de alcance de esta entrega** (Anexo 1 §13.2 y gates G5–G6): recursos AWS, dominio, DNS, TLS, formulario con almacenamiento, CRM, CMS, analítica, cookies. La landing no guarda ni envía datos personales.

## 2. Audiencias y mensajes

| Audiencia | Necesita | Mensaje principal | CTA |
|---|---|---|---|
| Entidades de gestión del riesgo, infraestructura y territorio | Anticipar comportamiento del terreno | Integrar datos dispersos en una lectura del territorio | Hablar con el equipo |
| Productores y operadores agrícolas | Leer la variabilidad del suelo | El suelo no se comporta igual en toda la extensión de un cultivo | Hablar con el equipo |
| Investigadores y aliados académicos | Rigor, método, tecnología | Rigor técnico · Precisión · Confiabilidad | Ver tecnología |
| Usuarios existentes | Entrar a la plataforma | — | Abrir plataforma |

Regla editorial (Anexo 1 §6.1): toda capacidad se marca **Disponible** (existe y es verificable en el MVP según README) o **En evolución** (visión). No se nombran clientes, aliados ni entidades sin aprobación escrita. No hay cifras inventadas.

## 3. Sistema de marca (del manual)

### 3.1 Concepto
- Arquetipo **Sabio creador**: conocimiento técnico convertido en herramientas útiles.
- El **"3"** del wordmark son tres barras = tres capas de información: **sensores en campo, drones, información satelital**. Es el ancla del sistema. Regla derivada del comentario de stakeholders en el manual: *usar el 3 de forma consistente* — tríadas de valores/beneficios y el motivo de tres barras como elemento gráfico recurrente (separadores, indicadores de escala, viñetas, loaders).
- Tono: técnico pero comprensible, preciso, cercano, directo, sin complejidad innecesaria.

### 3.2 Color — tokens (valores exactos del manual)

| Token | Hex | Rol |
|---|---|---|
| `--m3-green-900` Verde oscuro | `#004124` | Marca, fondos oscuros, texto principal sobre claro |
| `--m3-green-700` Verde medio | `#2C694F` | Superficies secundarias oscuras, hover |
| `--m3-green-400` Verde claro | `#74C69D` | Barras del "3", acentos sobre oscuro |
| `--m3-green-200` Verde pastel | `#B7E3C7` | Fondos claros de marca, acentos suaves |
| `--m3-beige` Beige | `#F6F2EA` | Fondo cálido alterno (editorial) |
| `--m3-yellow` Amarillo | `#FFD166` | Escala de interpretación — nivel 1 |
| `--m3-orange` Naranja | `#F77F00` | Escala de interpretación — nivel 2 |
| `--m3-red` Rojo | `#D62828` | Escala de interpretación — nivel 3 |
| `--m3-black` / `--m3-white` | `#000000` / `#FFFFFF` | Tipografía editorial, fondos |

Reglas:
- Los cálidos (amarillo→naranja→rojo) **solo** representan niveles de interpretación/alerta. Nunca decoración ni botones.
- Contraste WCAG AA (calculado): `#004124`/blanco 11.79 ✔ · `#004124`/beige 10.56 ✔ · `#004124`/pastel 8.32 ✔ · `#B7E3C7`/`#004124` 8.32 ✔ · `#74C69D`/`#004124` 5.79 ✔ · `#FFD166`/`#004124` 8.17 ✔ · `#2C694F`/blanco 6.48 ✔ · `#2C694F`/beige 5.80 ✔ · `#4B5563`/blanco 7.56 ✔.
- **Prohibido como texto:** `#74C69D` sobre blanco (2.04 ✘) y sobre `#2C694F` (3.18 ✘); `#F77F00` sobre `#004124` (4.49, solo texto ≥ 24 px o formas). Texto secundario sobre claro: `#2C694F` o `#4B5563`.
- **Excepción decorativa:** los numerales grandes de los pasos (patrón de la lámina 12 del manual) pueden ir en `#74C69D` sobre beige solo si son `aria-hidden` y el orden lo transmite un `<ol>` (WCAG 1.4.3 exime el contenido decorativo).
- Texto sobre fotografía: siempre con velo `#004124` ≥ 70 % detrás del texto.

### 3.3 Tipografía
- Manual: **DIN 2014 Rounded** (licencia comercial, no disponible en el repo).
- Web: pila `"DIN 2014 Rounded", var(--font-barlow), system-ui, sans-serif`. **Barlow** (OFL, Google Fonts vía `next/font`, autohospedada en el build) es la alternativa libre más cercana: estructura DIN, `g` de un piso, terminales suavizados. Si el cliente licencia DIN 2014 Rounded para web, se agregan los `.woff2` con `next/font/local` y la pila no cambia.
- Pesos: 300 (Light), 400, 500, 700, 800. Patrón editorial del manual: mezcla de **Bold** + *Light* en el mismo titular ("**Entender mejor** para **decidir mejor**").
- Escala (fluida con `clamp`): Display 56→120 px/0.95 · H2 36→64/1.0 · H3 22→28/1.15 · Lead 18→22/1.5 · Body 16–17/1.6 · Meta 12–13, tracking +0.08em, mayúsculas solo en metadatos cortos.

### 3.4 Logo
- Fuente: formas libres de la lámina 8 del manual, convertidas a SVG vectorial exacto (viewBox `0 0 503.1 99.09`): cuerpo `M · TR · I · C` + tres barras del "3".
- Variantes (lámina 11) como prop `variant`:
  - `color` — cuerpo `#004124`, barras `#74C69D` (fondos claros/pastel).
  - `reverse` — cuerpo `#B7E3C7` o blanco, barras `#74C69D` (fondos `#004124`).
  - `mono-dark` — cuerpo negro 100 %, barras negro 50 % (fondo blanco).
  - `mono-light` — cuerpo blanco 100 %, barras blanco 50 % (fondo negro).
- Área de protección: altura de una barra del "3" alrededor. Tamaño mínimo: 96 px de ancho.
- Accesibilidad: `role="img"` + `aria-label="M3TRIC"`; en enlaces de inicio, el texto accesible es "M3TRIC, ir al inicio".
- SEO: el manual señala el riesgo de búsqueda "Metric" vs "M3TRIC" → metadata y JSON-LD incluyen `alternateName: "Metric"`.
- **Favicon/ícono** (derivado, a validar por marca): las tres barras del "3" en `#74C69D` sobre cuadrado redondeado `#004124`. SVG + PNG 180/192/512.

### 3.5 Fotografía e imagen
- Key visual: aérea de ladera cultivada con tinte verde y red de nodos (lámina 12). Recortes sin el logo/texto incrustado: `aerial-wide` (2897×1100) y `aerial-tall` (1050×1760). Globo monocromo de la lámina 3 (1000×667) para la sección de propuesta.
- Entrega en `public/images/` como WebP (calidad 78) en anchos 640/1280/1920 (+ 2560 para `aerial-wide`), servidos con `<img srcset sizes>` o `<picture>`, con `width/height` explícitos (CLS 0), `loading="lazy"` salvo el hero (`fetchpriority="high"`).
- Estilo editorial del manual: mucho blanco, titulares grandes negros o verde oscuro, textos secundarios en gris, barra de metadatos superior (`M3TRIC · Manual de identidad · Abril, 2026`) → se reutiliza como **barra meta** de sección (`01 — Propuesta de valor`).

### 3.6 Iconografía y motivos
- `lucide-react` a trazo 1.5, terminaciones redondeadas (coherente con los glifos del logo). Tamaños 20/24.
- Motivo **Tres barras** (`<TripleBar/>`): tres cápsulas horizontales (proporción de las barras del logo: corta, corta, larga) usado como marcador de sección, indicador de escala activa (1/2/3 barras encendidas) y separador.
- Motivo **Red de nodos**: SVG ligero de puntos y líneas (como el overlay de la foto) para fondos de secciones oscuras. Sin canvas continuo.

### 3.7 Movimiento
- `framer-motion`: aparición al entrar en viewport (opacity + translateY 16 px, 500 ms, `ease [0.16,1,0.3,1]`), una sola vez. Nada de parallax pesado.
- `prefers-reduced-motion: reduce` → sin transformaciones; contenido visible de inmediato; la escena 3D se muestra estática.
- Nada parpadea más de 3 veces por segundo. Ninguna animación bloquea la lectura ni la interacción.

## 4. Arquitectura de información

Página única, español (`lang="es-CO"`). Anclas con `scroll-margin-top` igual a la altura del header.

| # | Ancla | Sección (Anexo 1 §6) | Fondo |
|---|---|---|---|
| — | `#contenido` | Skip link "Saltar al contenido" | — |
| 0 | — | Header fijo | blanco translúcido / `#004124` sobre hero |
| 1 | `#inicio` | Hero — propuesta de valor principal | `#004124` + aérea |
| 2 | `#propuesta` | Propuesta de valor (manifiesto + 3 valores) | blanco |
| 3 | `#plataforma` | Plataforma — "¿Cómo lo hacemos?" 4 pasos + vista de producto | beige |
| 4 | `#escalas` | Escalas M1/M2/M3 + recurso 3D | `#004124` |
| 5 | `#productos` | Productos (3 líneas) | blanco |
| 6 | `#capacidades` | Capacidades: Disponible / En evolución | pastel `#B7E3C7` 30 % |
| 7 | `#tecnologia` | Tecnología: flujo de datos + stack | blanco |
| 8 | `#casos` | Casos de uso (4 vértices) | beige |
| 9 | `#contacto` | CTA final + contacto | `#004124` + aérea vertical |
| — | — | Footer | `#000` o `#002a17` |

Navegación: Propuesta · Plataforma · Escalas · Productos · Capacidades · Tecnología · Casos de uso · Contacto. Header: logo (izq.), enlaces (≥ 1280 px; en menor ancho, menú), botón **Abrir plataforma** (siempre visible ≥ 360 px como ícono+texto compacto). Enlace activo por sección (`IntersectionObserver`, `aria-current="true"`).

## 5. Contenido (copy aprobado para implementación)

Todo el copy vive en `src/content/landing.ts` (tipado) para que la guía de actualización de contenidos apunte a un solo archivo. Fuente entre corchetes.

### 5.1 Hero
- Meta: `Lectura multiescala del territorio`
- H1: **Entender el territorio** *para anticipar el riesgo.* [lámina 10]
- Lead: "M3TRIC integra sensores en campo, observación aérea e información satelital con modelos analíticos para ofrecer una lectura integral del comportamiento del terreno." [lámina 1, ajustada a lo disponible]
- CTA primario: **Abrir plataforma** → `PLATFORM_URL` · CTA secundario: **Hablar con el equipo** → `#contacto`
- Indicador de tres capas (las tres barras rotuladas): Sensores en campo · Drones · Información satelital.

### 5.2 Propuesta de valor
- Meta: `01 — Propuesta de valor`
- Titular: "La lectura multiescala del territorio, basada en la integración de datos, es el núcleo de nuestra solución." [lámina 4]
- Cuerpo (2 párrafos): manifiesto lámina 1 — "En territorios complejos… el problema no es la falta de datos, sino la dificultad para integrarlos y convertirlos en decisiones oportunas." / "M3TRIC responde a esta brecha…"
- Tres valores [lámina 2]: **Rigor técnico** — "Soluciones basadas en evidencia, modelos analíticos y validación en campo." · **Precisión** — "Información confiable y detallada para decisiones críticas, gracias a la conexión de múltiples fuentes." · **Confiabilidad** — "Consistencia en la información que soporta decisiones críticas."
- Imagen: globo monocromo (alt: "Globo terráqueo nocturno atravesado por líneas de conexión entre regiones").

### 5.3 Plataforma — "¿Cómo lo hacemos?" [lámina 12]
1. **Capturamos información** — Integramos datos de sensores en campo, imágenes aéreas y satelitales.
2. **Analizamos el terreno** — Aplicamos modelos para interpretar las condiciones del suelo en diferentes escalas.
3. **Identificamos zonas clave** — Detectamos áreas de riesgo o potencial productivo.
4. **Entregamos decisiones** — Indicadores y alertas accionables para la toma de decisiones. [comentario de stakeholder, lámina 1]

Vista de producto: ilustración SVG de interfaz (mapa con sensores, serie temporal, lista de alertas con los tres niveles cálidos) — ilustrativa, rotulada "Vista ilustrativa de la plataforma", no captura real.

### 5.4 Escalas [README; lámina 4]
| Escala | Nombre | Qué lee | Fuente principal | Estado |
|---|---|---|---|---|
| M1 | Micro | Observaciones y estado de sensores en puntos específicos | Sensores en campo | Disponible |
| M2 | Meso | Agregaciones, tendencias y patrones en zonas y cuencas | Drones y agregación regional | En evolución |
| M3 | Macro | Visión territorial para decisiones estratégicas | Información satelital | En evolución |

Frase guía: "El comportamiento del territorio no ocurre en un solo nivel." [lámina 7, Educación]. Selector accesible (tabs ARIA) que cambia la escala activa en la escena 3D y el panel de texto.

**Recurso 3D** (Anexo 1 §6): terreno procedural low-poly (`@react-three/fiber`) con tres capas conmutables — M1 puntos de sensores con pulso, M2 franja de sobrevuelo, M3 retícula satelital. Paleta de marca, sin texturas externas.
- Carga diferida (`next/dynamic`, `ssr:false`) solo cuando la sección entra en viewport (`IntersectionObserver`, rootMargin 200 px).
- `frameloop="demand"` + animación mínima; pausa fuera de viewport; DPR máx. 1.75.
- Fallback: sin WebGL, error de contexto o `prefers-reduced-motion` → ilustración SVG equivalente de las tres capas (misma escala activa). `aria-hidden` en el canvas; la información vive en el texto.
- Presupuesto: chunk 3D ≤ 250 KB gz, fuera del bundle inicial.

### 5.5 Productos
Tres líneas (regla del 3):
1. **Sensórica e integración** — Ingesta individual y por lotes, normalización y validación de observaciones de sensores en campo. *Disponible*.
2. **Analítica territorial** — Estadísticas, tendencias, agrupamiento espacial y consultas geográficas. *Disponible*.
3. **Visualización y alertas** — Mapa de sensores, alertas por cruce de umbral y reportes (CSV, resumen ambiental, salud de sensores, alertas, análisis espacial). *Disponible*.

Nota "En evolución": integración de drones e información satelital a escala meso y macro; modelos predictivos.

### 5.6 Capacidades [README "Implementadas y verificables" / "Límites conocidos" reformulados como hoja de ruta]
- **Disponible hoy:** API de datos con autenticación y roles · Gestión de localizaciones, sensores y observaciones · Ingesta individual y por lotes con validación · Alertas deduplicadas por cruce de umbral · Estadísticas, tendencias y análisis espacial · Mapa de sensores con última lectura · Reportes exportables · Infraestructura como código en AWS.
- **En evolución:** Lectura meso y macro (drones y satélite) · Detección general de anomalías · Procesamiento asíncrono y reportes en la nube · Modelos predictivos.
- Escala de interpretación (leyenda con los tres cálidos): Atención · Alerta · Crítico — explica cómo la plataforma comunica niveles.

### 5.7 Tecnología
Flujo en 5 pasos: Captura → Ingesta y validación → Almacenamiento geoespacial → Análisis → Visualización y alertas. Stack verificado: Python 3.11 · FastAPI · SQLAlchemy · PostgreSQL 16 + PostGIS 3.4 · React + TypeScript · Next.js (este sitio) · AWS CDK. Sin Redis, sin "IA".

### 5.8 Casos de uso [lámina 7 + comentarios de stakeholders]
1. **Gestión del riesgo** — Deslizamientos y movimientos en masa. "El comportamiento del terreno empieza mucho antes de que sea visible. El reto no es reaccionar mejor, es poder leer esas señales a tiempo."
2. **Monitoreo agrícola** — Variabilidad del suelo y eficiencia productiva. "El suelo no se comporta igual en toda la extensión de un cultivo…"
3. **Infraestructura** — Estabilidad del entorno de obras y activos lineales.
4. **Ambiente** — Variables hídricas, climáticas y ambientales en distintos niveles.

### 5.9 Contacto / CTA final [lámina 12]
- Titular: **Entender mejor** *para* **decidir mejor**
- Texto: "Cuéntenos qué territorio necesita entender. Le mostramos cómo M3TRIC integra sus datos en una sola lectura."
- Canales: solo los configurados (§6). Correo → `mailto:` con asunto prellenado "Contacto desde el sitio M3TRIC". Teléfono opcional → `tel:`. Botón **Abrir plataforma**.
- Sin formulario (exclusión Anexo 1 §13.2).

### 5.10 Footer
Logo reverse, frase "Entender el territorio para anticipar el riesgo.", anclas, contacto configurado, "© 2026 M3TRIC. Todos los derechos reservados." Sin enlaces a páginas inexistentes (sin "privacidad"/"términos" hasta que existan textos legales aprobados).

## 6. Configuración y gate de release (fail-closed)

`src/config/site.ts` es el único lector de variables públicas:

| Variable | Obligatoria en release | Validación |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sí | `https://`, sin barra final, no localhost/127.0.0.1/example |
| `NEXT_PUBLIC_PLATFORM_URL` | Sí | `https://`, no localhost/example |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Sí | correo válido, no example/test |
| `NEXT_PUBLIC_CONTACT_PHONE` | No | E.164 si existe |

- Desarrollo (`npm run dev`, `npm run build`): si faltan, se usan valores de desarrollo y se muestra en consola una advertencia; **nunca** se publica así.
- `npm run release` = `check:config` (falla si falta o es inválida alguna obligatoria) → `lint` → `typecheck` → `next build` (export) → `check:artifact` (falla si `out/` contiene `localhost`, `127.0.0.1`, `example.com`, `TODO`, `lorem`, `placeholder`, o si faltan `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `og.png`, íconos).
- Si falta un canal de contacto opcional, su UI no se renderiza (nunca un enlace vacío).

## 7. Arquitectura técnica

- Next.js 16 App Router, `output: "export"`, `trailingSlash: false`, `images.unoptimized: true` (imágenes preoptimizadas). Sin rutas dinámicas, sin API routes, sin runtime Node.
- Tailwind 4 con tokens en `@theme` (§3.2). Sin estilos inline de color salvo SVG.
- Server Components por defecto; `"use client"` solo en Header (menú/scroll), Reveal (motion), ScaleExplorer (tabs + 3D) y ActiveSection.
- Eliminar código sin uso: `GlobeScene`, `ScaleIllustrations` antiguos, logo antiguo, SVG de plantilla en `public/` (`next.svg`, `vercel.svg`, etc.).
- Estructura:
```
src/
  app/ layout.tsx page.tsx globals.css robots.ts sitemap.ts icon.svg apple-icon.png not-found.tsx
  config/site.ts
  content/landing.ts
  components/brand/ Logo.tsx TripleBar.tsx NodeNetwork.tsx
  components/ui/ Button.tsx SectionHeading.tsx StatusBadge.tsx Reveal.tsx
  components/layout/ Header.tsx Footer.tsx SkipLink.tsx
  components/sections/ Hero Proposal Platform Scales Products Capabilities Technology UseCases Contact
  components/three/ TerrainScene.tsx TerrainFallback.tsx
scripts/ check-config.mjs check-artifact.mjs
tests/e2e/ *.spec.ts
public/images/ public/og.png
```

## 8. SEO técnico (Anexo 1 act. 7)
- `metadata` en español: title "M3TRIC | Lectura multiescala del territorio", description ≤ 160 caracteres, `metadataBase = SITE_URL`, canonical, Open Graph (`og.png` 1200×630 de marca), Twitter card `summary_large_image`, `robots index,follow`, `themeColor #004124`.
- JSON-LD `Organization` + `WebSite` (`name: "M3TRIC"`, `alternateName: "Metric"`, `url`, `logo`). Sin datos no aprobados.
- `robots.ts` y `sitemap.ts` con `export const dynamic = "force-static"`, basados en `SITE_URL`.
- Semántica: un solo `h1`; cada sección `<section aria-labelledby>` con `h2`; `header/nav/main/footer`.

## 9. Accesibilidad (WCAG 2.1 AA, Anexo 1 act. 8)
- Contrastes de §3.2. Foco visible propio: anillo 2 px `#74C69D` + offset 2 px sobre oscuro, `#004124` sobre claro; nunca `outline: none` sin reemplazo.
- Teclado: skip link, menú móvil con `aria-expanded`, `aria-controls`, cierre con Escape, foco atrapado mientras está abierto y devuelto al botón; tabs de escalas con flechas (patrón ARIA tabs).
- Objetivos táctiles ≥ 44×44 px. Texto redimensionable a 200 % sin pérdida. Sin scroll horizontal a 320/360 px.
- `alt` descriptivo en fotos; decorativos `alt=""`/`aria-hidden`.
- Movimiento reducido respetado (§3.7).

## 10. Rendimiento (Anexo 1 act. 9) — presupuestos
- Lighthouse móvil (throttling por defecto) sobre `out/` servido localmente: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms. JS inicial (sin chunk 3D) ≤ 180 KB gz.
- Imagen hero ≤ 180 KB a 1280 px. Fuente con `display: swap` y subset latino.

## 11. Seguridad y publicación (preparado, no desplegado)
- Sin secretos en el repo ni en `NEXT_PUBLIC_*` (son públicas por diseño).
- Enlaces externos con `rel="noopener noreferrer"`.
- CSP y cabeceras a aplicar en CloudFront (Response Headers Policy), documentadas en `docs/OPERACION.md`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` + HSTS, `X-Content-Type-Options`, `Referrer-Policy strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva. (`'unsafe-inline'` en scripts es requerido por el bootstrap inline de Next export; documentado como riesgo aceptado.)

## 12. Plan de pruebas (Anexo 1 act. 10–11)
Playwright (`@playwright/test` + `@axe-core/playwright`) contra `out/` servido por un servidor estático local:
1. **Smoke/contenido:** 1 `h1`; las 9 secciones con su ancla y `h2`; cero textos prohibidos; título y meta en español.
2. **Enlaces/CTA (EV-06):** todos los "Abrir plataforma" apuntan exactamente a `PLATFORM_URL`; todas las anclas resuelven a un id existente; `mailto:` correcto; ningún `href` vacío/`#`.
3. **Responsive:** sin desbordamiento horizontal (`scrollWidth ≤ clientWidth`) en 320/360/390/768/1024/1280/1440/1920.
4. **Visual:** capturas de página completa en 360/768/1280/1920 como evidencia (EV-02) + snapshots de regresión.
5. **Interacción real:** menú móvil por teclado (Tab/Enter/Escape) y clic real; tabs de escalas por flechas; header no tapa el titular de sección tras navegar por ancla (medido con `getBoundingClientRect`).
6. **Accesibilidad:** axe sin violaciones `serious`/`critical`; reduced-motion: contenido visible sin esperar animaciones.
7. **3D:** con WebGL la escena monta el canvas; con WebGL deshabilitado se ve el fallback SVG; sin errores de consola en ningún caso.
8. **Navegadores:** Chromium, Firefox, WebKit (Safari) en Playwright + Chrome y Edge (canal) si están instalados; Safari real como smoke manual documentado.
9. **Lighthouse:** reporte JSON/HTML en `docs/evidence/`.

## 13. Entregables de documentación (Anexo 1 act. 15)
- `README.md` — qué es, cómo correr, scripts, variables.
- `docs/CONTENIDOS.md` — guía para actualizar textos (`src/content/landing.ts`), imágenes, contacto y URL.
- `docs/OPERACION.md` — build de release, verificación del artefacto, publicación a S3/CloudFront (pasos), cabeceras/CSP, rollback.
- `docs/evidence/` — capturas, reporte QA, axe, Lighthouse, matriz de navegadores y enlaces (EV-02, 06–11).
- `docs/ASSETS.md` — inventario de activos y licencias (Barlow OFL, lucide ISC, imágenes del manual de marca M3TRIC).

## 14. Decisiones pendientes del cliente (no bloquean el build; sí el release)
1. URL oficial del login de la plataforma.
2. Dominio productivo (para `SITE_URL`, canonical, sitemap, OG).
3. Correo (y opcional teléfono) de contacto aprobados.
4. Validación de marca del favicon derivado de las tres barras.
5. Licencia web de DIN 2014 Rounded (opcional; hoy Barlow).
6. Mención institucional (p. ej. Universidad EAFIT) y logos de aliados: solo con aprobación escrita.

## 15. Unidades de trabajo
| WU | Alcance (archivos) | Depende de | Modelo |
|---|---|---|---|
| WU1 Fundaciones | `next.config.ts`, `package.json` scripts, `src/app/{layout,globals.css,robots,sitemap,not-found,icon}`, `src/config/`, `src/components/brand/`, `src/components/ui/`, `scripts/`, `public/` (assets, og, íconos), borrado de legacy | — | sonnet |
| WU2 Secciones | `src/content/landing.ts`, `src/components/layout/`, `src/components/sections/`, `src/app/page.tsx` | WU1 | sonnet |
| WU3 Escena 3D | `src/components/three/` (contrato: `<TerrainScene activeScale="m1"\|"m2"\|"m3" />`, `<TerrainFallback activeScale />`) | WU1 tokens | sonnet |
| WU4 QA | `playwright.config.ts`, `tests/`, `docs/evidence/` | WU1–WU3 | sonnet |
| WU5 Docs | `README.md`, `docs/CONTENIDOS.md`, `docs/OPERACION.md`, `docs/ASSETS.md` | WU1–WU4 | haiku |
