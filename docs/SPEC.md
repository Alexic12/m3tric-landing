# M3TRIC Landing — Especificación end-to-end (v3)

| Campo | Valor |
|---|---|
| Versión | 3.0 · 2026-10-01 (v2: 2026-09-30, en el historial de git como `docs/SPEC-landing-v2.md`) |
| Alcance | Producto/UX, marca, frontend, calidad, infraestructura como código, CI/CD, publicación en AWS y trazabilidad |
| Fuentes de verdad | `docs/20260428_Manual de marca - Metric.pptx` (raíz del workspace) · `docs/entregables/Anexo_1_Alcance_Tecnico_Landing_AWS_M3TRIC_2026-09-23.pdf` · `README.md` raíz del workspace (capacidades vs. límites) · instrucciones del owner (sesiones 2026-09-30 y 2026-10-01) |
| Precedencia ante conflicto | Anexo 1 (qué se entrega) > instrucciones del owner > Manual de marca (cómo se ve y suena) > README (qué se puede afirmar) > esta spec |
| Matriz de trazabilidad | `docs/TRACEABILITY.md` (requisito → spec → implementación → verificación → evidencia) |
| Decisiones | `docs/adr/ADR-*.md` |

---

## 0. Requisitos (IDs trazables)

Todo requisito tiene un ID. La matriz `docs/TRACEABILITY.md` enlaza cada ID con la sección de esta spec, los archivos que lo implementan, la prueba que lo verifica y la evidencia.

### 0.1 Owner (instrucciones directas)
| ID | Requisito | Origen |
|---|---|---|
| REQ-O01 | Diseño gráfico basado en el manual de marca (logos, colores, tipografía, tono) | 2026-09-30 |
| REQ-O02 | 100 % funcional, grado *production release*, con pruebas visuales | 2026-09-30 |
| REQ-O03 | Página pensada para usuarios no técnicos: centrada en **qué van a obtener** | 2026-10-01 |
| REQ-O04 | Profundidad técnica más abajo, con diseño de nivel *enterprise* | 2026-10-01 |
| REQ-O05 | Spec completa, trazable end to end, todo documentado | 2026-10-01 |
| REQ-O06 | Despliegue mediante IaC usando GitHub Actions hasta tener una URL de CloudFront funcional | 2026-10-01 |

### 0.2 Contractuales (Anexo 1 §5, actividades 1–16)
REQ-C01 brief y estructura · REQ-C02 UX/UI responsive alineado a identidad · REQ-C03 arquitectura de información y navegación · REQ-C04 frontend funcional con recursos visuales e interactivos · REQ-C05 secciones (propuesta de valor, plataforma, escalas M1/M2/M3, productos, capacidades, tecnología, casos de uso, contacto, CTA) · REQ-C06 conexión por URL a la plataforma · REQ-C07 SEO técnico · REQ-C08 accesibilidad WCAG 2.1 AA · REQ-C09 optimización de rendimiento · REQ-C10 pruebas de calidad documentadas · REQ-C11 Chrome, Edge, Firefox, Safari · REQ-C12 hasta dos rondas de ajustes · REQ-C13 configuración de despliegue y versión publicada · REQ-C14 código y activos · REQ-C15 manual técnico y guía de contenidos · REQ-C16 entrega final.

### 0.3 Criterios de aceptación (Anexo 1 §10)
REQ-A01 sin placeholders ni enlaces vacíos · REQ-A02 360 px a escritorio amplio sin desbordes · REQ-A03 CTA y contactos funcionan, login oficial · REQ-A04 build/lint sin errores, `out/` presente · REQ-A05 metadata/OG/favicon/sitemap/robots del dominio · REQ-A06 teclado, foco, contraste, alternativas, movimiento · REQ-A07 Lighthouse documentado · REQ-A08 smoke en 4 navegadores · REQ-A09 dominio y HTTPS · REQ-A10 S3 privado, SSE-S3, versionado, OAC, GET directo 403 · REQ-A11 TLS 1.2+, headers/CSP, retención, alerta presupuestal, sin credenciales largas · REQ-A12 rollback probado, IaC, manuales, inventario.

### 0.4 Marca (Manual de identidad)
REQ-B01 logo oficial y sus variantes (lám. 8, 11) · REQ-B02 paleta exacta (lám. 10) · REQ-B03 tipografía DIN 2014 Rounded o sustituto declarado (lám. 10) · REQ-B04 el "3" como sistema: tríadas y tres barras (lám. 8 + comentario de stakeholders) · REQ-B05 tono de voz técnico, comprensible, cercano (lám. 5) · REQ-B06 alcance más allá del riesgo: cultivos, terreno, infraestructura, ambiente (comentario de stakeholders, lám. 6) · REQ-B07 SEO "Metric" vs "M3TRIC" (comentario de stakeholders, lám. 8).

---

## 1. Objetivo y definición de hecho

Una landing pública de M3TRIC que un gerente, un alcalde, un ingeniero de obra o un productor entienda en 30 segundos —**qué obtiene, para qué le sirve y cómo empezar**— y que un equipo técnico pueda auditar más abajo. Publicada como sitio estático en S3 + CloudFront, desplegada por GitHub Actions con CDK, con cada requisito trazado a su evidencia.

**Hecho significa:**
1. `npm run release` pasa con el perfil del entorno (§9).
2. CI verde en GitHub (lint, typecheck, unitarias, e2e en 3 motores, pruebas de IaC con cdk-nag, synth).
3. El workflow `Deploy` desplegó la infraestructura y el sitio, y su smoke contra la URL pública pasó.
4. La URL de CloudFront responde con el sitio, cabeceras de seguridad, 404 propio y S3 directo en 403.
5. `docs/TRACEABILITY.md` no tiene requisitos sin evidencia, salvo los marcados como dependencia del cliente.

---

## 2. Audiencias, mensajes y regla editorial (REQ-O03, REQ-B05)

| Audiencia | Lo que le importa | Lo que le decimos | CTA |
|---|---|---|---|
| Decisor no técnico (gerencia de riesgo, entidades territoriales, operadores de infraestructura, productores) | Saber a tiempo, tener claridad, justificar decisiones | "Le avisamos cuando su terreno cambia, se lo mostramos en un mapa y le entregamos reportes para decidir." | **Hablar con el equipo** |
| Equipo técnico del cliente (ingeniería, TI, investigación) | Método, datos, seguridad, integración | Franja "Para equipos técnicos": capacidades, flujo de datos, stack, seguridad | Leer detalle técnico |
| Usuario existente | Entrar | — | **Abrir plataforma** (header y contacto) |

**Escritura para no técnicos** (aplica a todo lo que está por encima de la franja técnica):
- Frases de ≤ 20 palabras; verbos en presente; segunda persona formal ("usted", como el manual: "Conozca las condiciones de su suelo").
- Hablar de resultados, no de componentes: "le avisa cuando una medición cruza el límite que usted define", no "motor de umbralización".
- Prohibido arriba de la franja técnica: siglas sin explicar (API, IoT, PostGIS, CDK, GIS), nombres de librerías, jerga estadística.
- Nada de cifras, clientes, aliados o testimonios sin aprobación escrita.

**Regla de honestidad** (Anexo 1 §6.1): lo que hoy hace el MVP se presenta como hecho; drones, satélite y las escalas meso/macro se presentan como **En evolución**. Fuente: README raíz, "Implementadas y verificables" y "Límites conocidos".

---

## 3. Sistema de marca (REQ-O01, REQ-B01..B04)

### 3.1 Concepto
- Arquetipo **Sabio creador**: conocimiento técnico convertido en herramientas útiles.
- El **"3"** del wordmark son tres barras = tres capas de información (**sensores en campo, drones, información satelital**). Regla: tríadas visibles (3 resultados, 3 valores, 3 escalas) y el motivo de tres barras como marcador, indicador y separador.

### 3.2 Color — tokens exactos del manual
| Token | Hex | Rol |
|---|---|---|
| `--color-m3-green-900` Verde oscuro | `#004124` | Marca, fondos oscuros, texto principal sobre claro |
| `--color-m3-green-950` (derivado) | `#002A17` | Pie de página y franja técnica |
| `--color-m3-green-700` Verde medio | `#2C694F` | Superficies secundarias, texto secundario sobre claro |
| `--color-m3-green-400` Verde claro | `#74C69D` | Barras del "3", acentos sobre oscuro |
| `--color-m3-green-200` Verde pastel | `#B7E3C7` | Fondos suaves, acentos sobre oscuro |
| `--color-m3-beige` Beige | `#F6F2EA` | Fondo cálido alterno |
| `--color-m3-yellow` / `-orange` / `-red` | `#FFD166` / `#F77F00` / `#D62828` | **Solo** niveles de alerta: Atención / Alerta / Crítico |
| `--color-m3-ink` / `--color-m3-muted` | `#0B0F0D` / `#4B5563` | Texto editorial / secundario |

Contraste (calculado): `#004124`/blanco 11.79 · `#004124`/beige 10.56 · `#B7E3C7`/`#004124` 8.32 · `#74C69D`/`#004124` 5.79 · `#2C694F`/blanco 6.48 · `#4B5563`/blanco 7.56. **Prohibido como texto:** `#74C69D` sobre blanco (2.04) o sobre `#2C694F` (3.18). **Excepción decorativa:** numerales grandes `aria-hidden` con orden en `<ol>` (WCAG 1.4.3). Texto sobre foto: velo `#004124` ≥ 70 %, contraste medido (`npm run evidence:contrast`).

### 3.3 Tipografía (REQ-B03, ADR-001)
Pila `"DIN 2014 Rounded", var(--font-barlow), system-ui, sans-serif`. Barlow (OFL) autohospedada vía `next/font`. Pesos 300/400/500/700/800; mezcla **Bold** + *Light* en titulares (patrón lámina 12). Escala fluida: Display 56→120 px · H2 36→64 · H3 22→28 · Lead 18→22 · Body 16–17 · Meta 12–13.

### 3.4 Logo (REQ-B01)
Vector exacto de las formas libres de la lámina 8 (`src/components/brand/Logo.tsx`, no redibujar). Variantes de la lámina 11: `color`, `reverse`, `mono-dark`, `mono-light`. Mínimo 96 px de ancho; área de protección = altura de una barra. `alternateName: "Metric"` en JSON-LD (REQ-B07). Favicon derivado (tres barras sobre `#004124`), pendiente de validación de marca.

### 3.5 Imagen, iconos y movimiento
- Fotografía: aérea verde con red de nodos (lámina 12) en recortes sin texto incrustado; globo monocromo (lámina 3). WebP con `srcset`, `width/height` explícitos.
- Iconos: `lucide-react`, trazo 1.5.
- Movimiento: aparición única al entrar en viewport (CSS + `IntersectionObserver` compartido, 500 ms). Con `prefers-reduced-motion` todo aparece de inmediato. Si la hidratación falla, el contenido se muestra a los 3 s (failsafe).

---

## 4. Arquitectura de información v3 (REQ-O03, REQ-O04, REQ-C03, REQ-C05)

Página única, `lang="es-CO"`. Dos zonas: **zona de valor** (lenguaje llano) y **zona técnica** (franja oscura, densidad enterprise). Cada sección contractual del Anexo conserva un ancla identificable.

| # | Ancla | Sección (título visible) | Sección contractual (REQ-C05) | Zona |
|---|---|---|---|---|
| 0 | — | Header | — | — |
| 1 | `#inicio` | Hero | Propuesta de valor (principal) + CTA | Valor |
| 2 | `#beneficios` | Lo que usted obtiene | **Productos** (expresados como resultados) | Valor |
| 3 | `#casos` | Para quién es | **Casos de uso** | Valor |
| 4 | `#como-funciona` | Cómo funciona | **Plataforma** | Valor |
| 5 | `#escalas` | Del punto al territorio | **Escalas M1/M2/M3** + recurso 3D | Valor |
| 6 | `#por-que` | Por qué M3TRIC | **Propuesta de valor** (manifiesto + 3 valores) | Valor |
| 7 | `#preguntas` | Preguntas frecuentes | (apoyo a contacto) | Valor |
| 8 | `#tecnico` | Para equipos técnicos | **Capacidades** + **Tecnología** | Técnica |
| 9 | `#contacto` | Hablemos | **Contacto** + **CTA** | Valor |
| — | — | Footer | — | — |

Navegación (desktop ≥ 1280 px): Beneficios · Casos de uso · Cómo funciona · Escalas · Preguntas · Técnico · Contacto. A la derecha: enlace secundario **Abrir plataforma** + botón primario **Hablar con el equipo**. En móvil: logo, botón **Hablar** compacto y menú (diálogo modal accesible con ambos CTA).

### 4.1 Patrones *enterprise* que se aplican
- Ritmo y retícula: 12 columnas, contenedor 1280 px, márgenes 16/24/32 px, secciones de 96–128 px de alto de respiro.
- Jerarquía: kicker con tres barras + titular grande + bajada de 1–2 líneas; nunca dos titulares compitiendo.
- **Prueba en lugar de promesa**: cada beneficio muestra el *entregable concreto* ("tablero con la última lectura de cada sensor", "reporte de salud de sensores").
- Estados honestos visibles (Disponible / En evolución) con texto y forma, no solo color.
- Franja técnica tipo *spec sheet*: tablas limpias, monoespaciado solo en etiquetas cortas, iconografía de línea, fondo `#002A17`.
- CTA repetido en tres puntos (hero, después de casos de uso, contacto) sin ser invasivo; nada de pop-ups.

---

## 5. Contenido v3 (todo en `src/content/landing.ts`)

### 5.1 Hero (`#inicio`)
- Kicker: `Monitoreo del territorio`
- H1: **Entender el territorio** *para anticipar el riesgo.* (tagline del manual)
- Bajada: "M3TRIC reúne en un solo lugar la información de los sensores instalados en su terreno, le avisa cuando algo cambia y le entrega reportes claros para decidir a tiempo."
- CTA primario: **Hablar con el equipo** → `#contacto` · Secundario: **Abrir plataforma** → `PLATFORM_URL`.
- Franja de tres resultados (REQ-B04), cada uno con ícono y una línea: **Avisos a tiempo** · **Un mapa claro de su terreno** · **Reportes para decidir**.

### 5.2 Lo que usted obtiene (`#beneficios`) — productos como resultados
Kicker `01 — Lo que usted obtiene`. Titular: "Información clara para decidir, no más datos sueltos." Tres tarjetas (mapeo a las líneas de producto de v2 para trazabilidad):
1. **Vigilancia continua de su terreno** (línea *Sensórica e integración*) — "Sus sensores en campo envían datos que M3TRIC recibe, revisa y organiza. Usted ve la última lectura de cada punto y si algún sensor dejó de reportar." Entregables: tablero de sensores · estado y última lectura · historial de mediciones. *Disponible*.
2. **Avisos cuando importa** (línea *Visualización y alertas*) — "Usted define los límites aceptables. Cuando una medición los cruza, M3TRIC genera una alerta con su nivel: Atención, Alerta o Crítico." Entregables: alertas por niveles · registro de eventos · sin avisos duplicados. *Disponible*.
3. **Reportes para decidir** (línea *Analítica territorial*) — "Tendencias, comparaciones por zona y reportes listos para comités, entes de control o su equipo." Entregables: resumen ambiental · salud de sensores · reporte de alertas · análisis espacial · exportación CSV. *Disponible*.

Nota *En evolución*: "Integración de drones e imágenes satelitales para leer zonas y regiones completas."

### 5.3 Para quién es (`#casos`)
Kicker `02 — Para quién es`. Titular: "Un mismo método para cuatro frentes." Cuatro tarjetas con **situación → lo que M3TRIC le da**:
1. **Gestión del riesgo** — Deslizamientos y movimientos en masa. Situación: "El comportamiento del terreno empieza mucho antes de que sea visible." (manual, lám. 7) Le da: "Seguimiento continuo de los puntos críticos y avisos cuando una medición cambia."
2. **Agricultura** — Variabilidad del suelo. Situación: "El suelo no se comporta igual en toda la extensión de un cultivo." (manual, lám. 7) Le da: "Lecturas por punto para entender dónde y cuándo actuar."
3. **Infraestructura** — Obras y activos. Situación: "Una obra depende de la estabilidad del terreno que la rodea." Le da: "Mediciones periódicas del entorno y alertas ante cambios." *(copy pendiente de aprobación editorial — ronda 1)*
4. **Ambiente** — Variables hídricas, climáticas y ambientales. Situación: "Las variables del ambiente cambian a distintas escalas." Le da: "Registro ordenado de las mediciones y reportes para su seguimiento." *(copy pendiente de aprobación editorial — ronda 1)*

Cierre de sección: banda con CTA **Hablar con el equipo**.

### 5.4 Cómo funciona (`#como-funciona`) — plataforma
Kicker `03 — Cómo funciona`. Titular: "De la medición en campo a la decisión, en cuatro pasos." Pasos (lámina 12, en lenguaje llano):
1. **Medimos** — "Los sensores en su terreno registran las variables que importan."
2. **Revisamos y organizamos** — "M3TRIC valida cada dato y lo ubica en el mapa."
3. **Le avisamos** — "Si algo cruza el límite definido, usted recibe una alerta con su nivel."
4. **Usted decide** — "Con el historial y los reportes, decide con evidencia."
Vista ilustrativa del producto (SVG; rotulada "Vista ilustrativa de la plataforma").

### 5.5 Del punto al territorio (`#escalas`)
Kicker `04 — Escalas`. Titular: "El territorio no se entiende desde un solo punto." Bajada: "M3TRIC organiza la información en tres escalas que se complementan." Tabs accesibles M1/M2/M3 con recurso 3D (sin cambios técnicos respecto a v2):
| Escala | Qué le muestra (llano) | Fuente | Estado |
|---|---|---|---|
| M1 · Punto | "Lo que pasa en cada sensor, en detalle." | Sensores en campo | Disponible |
| M2 · Zona | "Cómo se comporta un sector completo." | Drones y agregación por zonas | En evolución |
| M3 · Territorio | "La visión de conjunto para decisiones estratégicas." | Información satelital | En evolución |

### 5.6 Por qué M3TRIC (`#por-que`) — propuesta de valor
Kicker `05 — Por qué M3TRIC`. Titular (manual lám. 4, abreviado): "La lectura del territorio basada en la integración de datos es el núcleo de lo que hacemos." Párrafo del manifiesto (lám. 1) en ≤ 3 frases. Tres valores (lám. 2): **Rigor técnico** · **Precisión** · **Confiabilidad**. Imagen del globo.

### 5.7 Preguntas frecuentes (`#preguntas`)
Acordeón accesible (`<details>`/`<summary>` nativo, funciona sin JS). Solo respuestas verificables:
1. **¿Qué necesito para empezar?** — "Una conversación con nuestro equipo para entender su terreno y qué necesita medir. A partir de ahí definimos juntos la puesta en marcha."
2. **¿Qué información integra hoy M3TRIC?** — "Mediciones de sensores en campo. La integración de drones e imágenes satelitales está en evolución."
3. **¿Cómo me entero si algo cambia?** — "En la plataforma, con alertas por niveles (Atención, Alerta, Crítico) cuando una medición cruza el límite definido."
4. **¿Puedo usar la información fuera de la plataforma?** — "Sí. Puede descargar reportes y exportar los datos en formato CSV."
5. **¿Quién puede ver la información?** — "Solo las personas autorizadas. El acceso es con usuario y contraseña, y cada persona tiene un rol: administración, operación o consulta."
6. **¿Dónde se aloja la plataforma?** — "En infraestructura en la nube de Amazon Web Services (AWS), definida como código."

### 5.8 Para equipos técnicos (`#tecnico`) — capacidades + tecnología
Franja oscura `#002A17`, kicker `06 — Para equipos técnicos`, titular "El detalle, para quien lo necesita." Tres bloques en pestañas o columnas (sin JS obligatorio: en móvil se apilan):
- **Capacidades** — *Disponible hoy*: API de datos con autenticación y roles · gestión de localizaciones, sensores y observaciones · ingesta individual y por lotes con validación · alertas deduplicadas por cruce de umbral · estadísticas, tendencias y análisis espacial · mapa de sensores con última lectura · reportes exportables · infraestructura como código en AWS. *En evolución*: lectura meso y macro (drones y satélite) · detección general de anomalías · procesamiento asíncrono y reportes en la nube · modelos predictivos.
- **Flujo de datos** — Captura → Ingesta y validación → Almacenamiento geoespacial → Análisis → Visualización y alertas.
- **Tecnología y seguridad** — Python 3.11 · FastAPI · SQLAlchemy · PostgreSQL 16 + PostGIS 3.4 · React + TypeScript · Next.js (este sitio) · AWS CDK. Acceso con roles; tráfico cifrado (HTTPS); infraestructura versionada como código.
- Leyenda de la escala de interpretación (Atención / Alerta / Crítico).

### 5.9 Contacto (`#contacto`)
Titular del manual: **Entender mejor** *para* **decidir mejor**. Texto: "Cuéntenos qué terreno necesita entender. Le mostramos cómo M3TRIC puede ayudarle." Canales: solo los configurados (correo `mailto:` con asunto "Contacto desde el sitio M3TRIC", teléfono `tel:` formateado para lectura). Siempre: **Abrir plataforma**. Sin correo configurado (perfil staging), el bloque muestra "Abrir plataforma" y el texto "Los canales de contacto se publicarán con el dominio oficial." — nunca un enlace vacío.

### 5.10 Footer
Logo reverse · tagline · anclas · contacto configurado · "© {año} M3TRIC. Todos los derechos reservados."

---

## 6. Frontend (REQ-C04, REQ-O02)

Next.js 16 App Router, `output: "export"`, Tailwind 4, React 19, three.js/r3f solo en el chunk diferido del visor de escalas. Server Components por defecto; cliente solo en Header, Reveal/HydrationMarker, Scales (tabs) y el visor 3D. Sin framer-motion, sin drei. Estructura vigente en `README.md`. Los componentes de v2 se reutilizan; las secciones nuevas son `Benefits`, `UseCases` (reescrita), `HowItWorks` (antes Platform), `Scales`, `WhyM3tric` (antes Proposal), `Faq`, `TechnicalZone` (fusiona Capabilities + Technology + Products técnicos), `Contact`.

## 7. SEO (REQ-C07, REQ-A05, REQ-B07)
Metadata en español, canonical, Open Graph 1200×630, Twitter card, JSON-LD `Organization` + `WebSite` + `FAQPage` (las preguntas de §5.7), `robots.txt`, `sitemap.xml`, manifest. **Perfil staging: `noindex, nofollow`** en meta robots, `robots.txt` con `Disallow: /` y cabecera `X-Robots-Tag` en CloudFront (ADR-004). Perfil production: indexable.

## 8. Accesibilidad y rendimiento (REQ-C08, REQ-C09, REQ-A06, REQ-A07)
- WCAG 2.1 AA: un `h1`; secciones con `aria-labelledby`; skip link; foco visible por superficie; menú móvil como diálogo modal con fondo `inert`; tabs ARIA; acordeón nativo; objetivos ≥ 44 px; contraste medido sobre foto; movimiento reducido; contenido visible sin JS.
- Presupuestos: Lighthouse móvil Perf ≥ 90 y A11y/BP/SEO ≥ 95; LCP ≤ 2.5 s **medido en CloudFront** (el entorno local con HTTP/1.1 sin brotli no es representativo, ADR-005); CLS ≤ 0.05; TBT ≤ 200 ms; JS inicial ≤ 180 KB gz; chunk 3D ≤ 250 KB gz.

## 9. Configuración y perfiles de release (REQ-A01, REQ-A03, ADR-003)

| Variable | `production` | `staging` | Validación |
|---|---|---|---|
| `RELEASE_PROFILE` | `production` | `staging` | obligatoria en release |
| `NEXT_PUBLIC_SITE_URL` | obligatoria | obligatoria (dominio de CloudFront) | origen https puro, dominio público |
| `NEXT_PUBLIC_PLATFORM_URL` | obligatoria | obligatoria | https, sin userinfo, dominio público |
| `NEXT_PUBLIC_CONTACT_EMAIL` | obligatoria | opcional | regex estricta, sin dominios de ejemplo |
| `NEXT_PUBLIC_CONTACT_PHONE` | opcional | opcional | E.164 |
| `NEXT_PUBLIC_RELEASE_PROFILE` | derivada de `RELEASE_PROFILE` | derivada | controla `noindex` y el texto de contacto |

`npm run release` = `test:unit → check:config → lint → typecheck → next build → check:artifact`. `check:artifact` además verifica, según perfil: `noindex` presente en staging y ausente en production, y `robots.txt` coherente.

Valores de staging (no secretos, viven como *variables* del environment de GitHub): `PLATFORM_URL = https://d3pz2gipvkcx1b.cloudfront.net/login` (plataforma staging vigente); `SITE_URL` = dominio de la distribución, leído de las salidas del stack en cada deploy.

## 10. Infraestructura como código (REQ-O06, REQ-C13, REQ-A10, REQ-A11, ADR-002)

App CDK v2 en `infra/` (TypeScript), alineada con las convenciones del repo de la plataforma: `aws-cdk-lib 2.267.0`, CLI `aws-cdk 2.1138.0`, Node 24.19.0, pruebas con `vitest` + `cdk-nag` (AwsSolutions), etiquetas obligatorias y nombres `m3tric-{env}-{Stack}`.

**Cuenta y región:** 147997127433 · `us-east-2` (CloudFront es global). Bootstrap CDK existente (qualifier `hnb659fds`, versión 31).

**Etiquetas en todos los recursos:** `Application=m3tric` · `Component=landing` · `Environment=staging` · `Owner` · `CostCenter` · `ManagedBy=aws-cdk` · `DataClassification=public` · `GitSha` (40 caracteres) · `ReleaseId`.

### 10.1 `m3tric-staging-LandingDeliveryIdentityStack` (bootstrap, se despliega una vez desde local)
- Importa el proveedor OIDC existente `token.actions.githubusercontent.com`.
- Rol `m3tric-staging-landing-github-deploy` (path `/m3tric/delivery/`, sesión ≤ 1 h). Confianza: `aud = sts.amazonaws.com` y `sub = repo:Alexic12/m3tric-landing:environment:landing-staging` (StringEquals exacto: ni ramas, ni PRs, ni forks).
- Permisos: `sts:AssumeRole` sobre los roles de bootstrap `cdk-hnb659fds-{deploy,file-publishing,lookup}-role-147997127433-us-east-2`; `cloudformation:DescribeStacks` sobre el stack del sitio. Los permisos de publicación los concede el stack del sitio (§10.2), acotados a su bucket y su distribución.
- No lo puede modificar el propio workflow (vive en otro stack, desplegado por un humano). Riesgo aceptado y documentado en ADR-002: el rol de deploy de CDK ejecuta CloudFormation con la política por defecto del bootstrap; se mitiga con la regla de protección del environment (solo `main`).

### 10.2 `m3tric-staging-LandingSiteStack` (lo despliega GitHub Actions)
- **SiteBucket**: Block Public Access total, SSE-S3, versionado, `enforceSSL`, propiedad `BucketOwnerEnforced`, expiración de versiones no actuales a 90 días, `RemovalPolicy.RETAIN`, server access logs al LogsBucket.
- **LogsBucket**: SSE-S3, BPA, `enforceSSL`, propiedad `BucketOwnerPreferred` (requerida por los logs estándar de CloudFront), expiración 90 días (retención finita, REQ-A11), RETAIN.
- **Distribution**: origen S3 con **OAC**; `defaultRootObject: index.html`; HTTP/2 y HTTP/3; `redirect-to-https`; `PriceClass_100`; compresión; errores 403/404 → `/404.html` con estado 404; logs estándar al LogsBucket (`cloudfront/`).
- **Cache**: `CachingOptimized` respetando el `Cache-Control` de origen que fija la publicación (§11.3).
- **ResponseHeadersPolicy**: CSP `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'` · HSTS `max-age=63072000; includeSubDomains` · `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` · `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` · en staging `X-Robots-Tag: noindex, nofollow`.
- **Política de publicación** adjunta al rol de §10.1: `s3:ListBucket` en el bucket; `s3:GetObject/PutObject/DeleteObject` en `bucket/*`; `cloudfront:CreateInvalidation/GetInvalidation` en el ARN de la distribución.
- **Presupuesto**: AWS Budget mensual (USD, valor en config) filtrado por la etiqueta `Component=landing` si está activada como etiqueta de asignación de costos; notificación al 80 % a un tema SNS. Destinatario institucional: **dependencia del cliente** (el tema queda creado sin suscripción).
- **Salidas**: `SiteBucketName`, `DistributionId`, `DistributionDomainName`, `SiteUrl`.
- **TLS**: con el certificado por defecto de `*.cloudfront.net` CloudFront no permite fijar la política mínima. TLS 1.2+ y dominio propio (ACM en us-east-1 + Route 53) quedan como **dependencia del cliente** (REQ-A09).

### 10.3 Pruebas de IaC
`vitest` con `Template.fromStack`: BPA, cifrado, versionado, OAC (sin OAI), bucket policy solo para el servicio CloudFront con `AWS:SourceArn` de la distribución, errores 404, cabeceras exactas, `X-Robots-Tag` solo en staging, retención de logs, permisos exactos (lista cerrada de acciones) del rol de publicación, trust policy exacta (aud + sub), etiquetas obligatorias, `cdk-nag` sin errores (supresiones justificadas una a una).

## 11. CI/CD con GitHub Actions (REQ-O06, REQ-C10, REQ-C13, REQ-A12)

Todas las actions **fijadas por SHA de 40 caracteres**. Permisos mínimos por job. Node 24.19.0.

### 11.1 `ci.yml` — en PR y en push a `main`
Jobs: `hygiene` (actions fijadas por SHA, archivos prohibidos `.env*` salvo `.env.example`, `*.pem`, `cdk.out`, `node_modules`, `out`), `web` (npm ci, lint, typecheck, test:unit, build con dominios de verificación, Playwright chromium/firefox/webkit, sin la comparación de snapshots visuales, que dependen del SO, ADR-006), `infra` (npm ci, typecheck, vitest + cdk-nag, `cdk synth`). Sin credenciales AWS: corre igual en forks.

### 11.2 `deploy.yml` — en push a `main` (tras CI) y manual
1. `needs: ci` (vía `workflow_call`).
2. Job `deploy` en el environment **`landing-staging`** (protegido: solo `main`), `concurrency: landing-staging` sin cancelar en curso, `permissions: id-token: write, contents: read`.
3. OIDC → rol de §10.1 (`aws-actions/configure-aws-credentials`).
4. `cdk deploy m3tric-staging-LandingSiteStack --require-approval never` con contexto `gitSha`/`releaseId`.
5. Lee las salidas del stack.
6. Workflow reutilizable `publish.yml`: `npm run release` (perfil staging, `SITE_URL` = salida), publicación (§11.3), invalidación y espera, smoke (§11.4), manifiesto de despliegue (§11.5).

### 11.3 Publicación (`scripts/deploy/publish.sh`)
`aws s3 sync out/ s3://<bucket>/ --delete` en pasadas por tipo de contenido: `_next/static/**` → `public, max-age=31536000, immutable`; `images/**`, `og.png`, íconos → `public, max-age=86400`; `*.html`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `*.txt` del payload RSC → `no-cache`. Luego invalidación `/*` y espera a `Completed`.

### 11.4 Smoke de producción (`scripts/deploy/smoke.mjs`, Node puro)
Contra `SITE_URL`: `/` 200 con HTML de la versión (meta `m3tric:release` = `ReleaseId`); cabeceras CSP, HSTS, nosniff, `X-Frame-Options`, Referrer-Policy, Permissions-Policy; staging con `X-Robots-Tag`; `/no-existe` → 404 con la página propia; un asset de `_next/static` con `immutable`; `og.png`, `robots.txt`, `sitemap.xml` 200; todos los enlaces "Abrir plataforma" = `PLATFORM_URL`; **GET directo al bucket S3 → 403**. Falla el job si algo no cumple.

### 11.5 Manifiesto y trazabilidad del despliegue
Artefacto `deploy-manifest.json` (commit, `ReleaseId`, run id, URL, ids de stack/bucket/distribución, sha256 de cada archivo de `out/`, resultado del smoke) + resumen del job. El mismo manifiesto se sube a `s3://<bucket>/_deploy/manifest.json` con `no-cache`, para saber qué versión está viva.

### 11.6 `rollback.yml` — manual
Entrada: `ref` (sha o tag) + `reason`. Hace checkout de esa referencia y ejecuta `publish.yml` (no toca la infraestructura). Reconstruir desde git en lugar de restaurar objetos: el artefacto es reproducible y queda trazado igual que un deploy (ADR-007). Se prueba una vez como parte de la entrega (REQ-A12).

## 12. Seguridad (REQ-A10, REQ-A11)
Sin secretos en el repo (el repo es **público**); los valores de despliegue son variables no sensibles del environment. Sin credenciales de larga duración: solo OIDC. Bucket privado, OAC, TLS en tránsito, SSE-S3 en reposo. CSP y cabeceras en el borde. Revisión de seguridad del IAM antes del primer deploy.

## 13. Pruebas y evidencia (REQ-C10, REQ-C11, REQ-A07, REQ-A08)
- Local/CI: `npm run test:unit`, `npm run test:e2e` (contenido, enlaces, responsive, visual, interacción con gestos reales, axe, resiliencia, 3D), `npm run evidence:contrast`, `npm run evidence:lighthouse`, `infra: npm test`.
- Post-deploy: smoke automático (§11.4) + Playwright y Lighthouse **contra la URL de CloudFront** (`docs/evidence/live/`).
- Manual: Safari real y Edge (checklist en `docs/evidence/browser-matrix.md`).

## 14. Documentación (REQ-C15, REQ-O05)
`README.md` · `docs/SPEC.md` · `docs/TRACEABILITY.md` · `docs/adr/` · `docs/CONTENIDOS.md` · `docs/OPERACION.md` (despliegue por GitHub Actions, bootstrap, rollback, smoke, troubleshooting) · `docs/ASSETS.md` · `docs/evidence/` · `infra/README.md` · `CHANGELOG.md`.

## 15. ADRs
- **ADR-001** Barlow como sustituto de DIN 2014 Rounded.
- **ADR-002** App CDK propia de la landing (no los stacks cascarón de la plataforma); identidad OIDC en stack separado desplegado por un humano; riesgo del rol de deploy de CDK.
- **ADR-003** Perfiles `staging`/`production`: en staging el correo de contacto es opcional porque no hay uno aprobado.
- **ADR-004** `noindex` en staging (dominio `cloudfront.net` provisional).
- **ADR-005** LCP medido en CloudFront, no en local.
- **ADR-006** Snapshots visuales solo locales; CI valida todo lo demás en 3 motores.
- **ADR-007** Rollback por reconstrucción desde git.

## 16. Dependencias del cliente (bloquean producción, no staging)
1. Dominio productivo + ACM + Route 53 (TLS 1.2+, apex/www) · 2. URL oficial del login de producción · 3. Correo/teléfono de contacto aprobados · 4. Destinatario institucional de la alerta presupuestal · 5. Validación del favicon derivado · 6. Aprobación del copy de Infraestructura y Ambiente (ronda 1) · 7. Licencia web DIN 2014 Rounded (opcional) · 8. Menciones institucionales/aliados · 9. Smoke manual en Safari real y Edge.

## 17. Unidades de trabajo v3
| WU | Alcance | Modelo |
|---|---|---|
| WU-R1 Rediseño | `src/content/landing.ts`, `src/components/sections/**`, `src/components/layout/Header.tsx`, `Footer.tsx`, `src/app/page.tsx`, `tests/e2e/**` (adaptar a la nueva IA) | sonnet |
| WU-R2 IaC | `infra/**` | opus (IAM y seguridad) |
| WU-R3 CI/CD y perfiles | `.github/**`, `scripts/**` (perfiles, publish, smoke, manifiesto), `src/config/site.ts`, `src/app/{layout,robots,sitemap}.ts(x)` (noindex, FAQ JSON-LD, meta release) | sonnet |
| WU-R4 Despliegue | bootstrap local, environment de GitHub, primer deploy, rollback de prueba | Tech Lead |
| WU-R5 QA en vivo + seguridad | e2e/Lighthouse contra CloudFront, revisión IAM | sonnet / opus |
| WU-R6 Trazabilidad y docs | `docs/TRACEABILITY.md`, `docs/adr/**`, docs operativos | sonnet |
