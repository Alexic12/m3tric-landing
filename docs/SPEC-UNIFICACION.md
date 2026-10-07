# Identidad compartida landing ↔ plataforma — Especificación end to end

| Campo | Valor |
|---|---|
| Versión | 1.4 · 2026-10-05 (cierre de la tipografía: la landing publicada y verificada en vivo; la plataforma desplegada con Nunito, corregida tras la QA en vivo (PR #194) y verificada en vivo; REQ-U04 Verificado; ADR-012: §0 (REQ-U04), §4.2 (pila de la plataforma corregida a «Nunito Variable»), §6, §7 (punto 4), §8 (actualización del 2026-10-05), §11 (REQ-U04 y REQ-U05) y §14 (nota, §14.5, §14.6 y la nueva §14.7); sin otros cambios) · 1.3 · 2026-10-05 (tipografía única Nunito por decisión del owner, ADR-012: §0 (REQ-U04), §2 (DEC-54 revisada), §3, §4.2, §6 (retirada del diseño de DIN 2014 Rounded), §7 a §12 y §14; sin otros cambios) · 1.2 · 2026-10-02 (cierre: estados finales de REQ-U01..U05 en §11, resultado medido y seguimientos en §14; §4.2 corregida a los cinco pesos de Barlow que carga la plataforma) · 1.1 · 2026-10-02 (alineada con el kit construido: `paths.json` como fuente del logo, manifiesto sin `sourceCommit`, pesos 300–800, guías neutras) |
| Alcance | Un solo sistema visual para la landing pública (`Alexic12/m3tric-landing`, público) y la plataforma (`Alexic12/M3TRIC_Platform › m3tric-platform/frontend`, privado): paleta, tipografía, logo, componentes, idioma, pruebas, despliegue y trazabilidad |
| Fuente de verdad visual | Manual de identidad M3TRIC (abril 2026) interpretado en `docs/SPEC.md` §3 y materializado en `brand/` (este repo) |
| Precedencia | Instrucciones del owner (2026-10-02) > Manual de marca > `docs/SPEC.md` > esta spec > decisiones previas de UI de la plataforma (`docs/enterprise-agro/25-ui-decision-record.md`, que no fijaba paleta ni tipografía) |
| Registro de decisiones | Landing: `docs/adr/ADR-008..010` (ADR-010 retirada) y `ADR-012` (tipografía). Plataforma: `docs/platform-live-dashboard/07-decisiones-owner.md` (DEC-53..DEC-58) |
| Trazabilidad | `docs/TRACEABILITY.md` (filas REQ-U*) + `docs/enterprise-agro/26-identidad-compartida.md` en la plataforma |

---

## 0. Requisitos del owner (2026-10-02)

| ID | Requisito literal | Lectura operativa |
|---|---|---|
| REQ-U01 | «El estilo con degradados en la plataforma no lo veo en la landing… debemos llevar el estilo de la landing a la plataforma… que todo se mantenga uniforme y compartan estilo» | La landing es la referencia. La plataforma adopta sus tokens (color, tipografía, radios, foco, sombras), sus componentes base (botón, panel, insignia, aviso) y su lenguaje (superficies planas, hairlines, verde oscuro como ancla). Desaparecen degradados y vidrio esmerilado. |
| REQ-U02 | «El logo debería aparecer en la plataforma en vez de escribir solo M3TRIC» | El wordmark vectorial oficial (lámina 8 del manual) reemplaza el texto «M3TRIC» en la barra lateral, el panel de inicio de sesión, la navegación móvil y la vista pública en vivo. |
| REQ-U03 | «El idioma de la plataforma debería estar en español también» | Toda la interfaz en español (es-CO): textos, títulos de pestaña, fechas y números, `lang`. Español como único idioma del producto. |
| REQ-U04 | «La fuente de la landing y de la plataforma no es la que se recomienda en el manual… ¿podemos usar la que se recomienda?» | El 2026-10-02 la respuesta fue «sí, con licencia»: DIN 2014 Rounded es comercial (Paratype). El 2026-10-05 el owner decidió, tras comparar alternativas, usar **Nunito** (OFL 1.1) en ambos sitios y no licenciar DIN 2014 Rounded: es una desviación consciente del manual (ADR-012, §6). La landing la usa desde el release 3.4.0 (`deploy-13-25fffc8`); la plataforma, desde su despliegue del 2026-10-05 (`57681b2`, corregido en `66acab7`; §4.2 y §14.7). Ambos sitios se verificaron en vivo ese día (§14.7). |
| REQ-U05 | «spec end to end… implementado, probado y desplegado, todo al 100 %… todo trazable y documentado» | Esta spec, pruebas automatizadas en ambos repos, evidencia en vivo y despliegue por los mecanismos de cada repo (GitHub Actions en la landing; ceremonia plan → change set → smoke en la plataforma). |

Definición de hecho: (1) kit de marca versionado en la landing y sincronizado en la plataforma con hashes; (2) plataforma sin degradados, con tokens de marca, logo oficial, la tipografía única de ambos sitios (Barlow en el cierre del 2026-10-02; Nunito desde ADR-012) y 100 % español, con sus 810+ pruebas en verde más las nuevas; (3) ambas versiones publicadas y verificadas en vivo (consola, CSP, sin terceros, fuente computada, `lang`, cero textos en inglés en la navegación, axe); (4) trazabilidad y decisiones registradas en los dos repos.

---

## 1. Diagnóstico (antes)

Fuente: exploración del código el 2026-10-02 y capturas en vivo (`docs/evidence/platform-brand/before/`).

| Aspecto | Landing (referencia) | Plataforma (hoy) |
|---|---|---|
| Stack | Next 16, React 19, Tailwind 4 | Vite 6, React 18, Tailwind 3.4 |
| Paleta | Manual: `#004124 #2C694F #74C69D #B7E3C7 #F6F2EA` + cálidos solo para niveles | Paleta previa: `#1B4332 #3A8A5C #2ECC71 #143226 #F7FAF8 #D0DDD5 …` (`tailwind.config.js`) y variables `--app-*` en `src/index.css` |
| Tipografía | Barlow autohospedada (next/font), pila `"DIN 2014 Rounded", Barlow, system-ui` | Inter + JetBrains Mono desde Google Fonts (`index.html` l. 10-12): petición a terceros, no coincide con el manual |
| Degradados / vidrio | Ninguno (superficies planas) | 8 degradados (body, `.app-shell`, `.app-brand-mark`, `.app-nav-link-active`, `.btn-primary`, login ×2, `.live-shell`) y 7 clases con `backdrop-filter: blur` |
| Logo | Vector oficial (`src/components/brand/Logo.tsx`) | Texto «M3TRIC» (`MainLayout.tsx` l. 113, `LoginPage.tsx` l. 134); `public/icon.svg` ya es el de la landing |
| Idioma | Español | Mixto: ~60 % de archivos en español; inglés en `LoginPage`, `DashboardPage`, `AlertsPage`, `ProtectedRoute`, `ErrorBoundary`, `MapPage`, `SettingsPage`, `ReportsPage`, `MapView`; `lang="en"`; fechas con locale del navegador en 3 páginas y `es-CO` en otras 3 |
| Pruebas | Playwright 3 motores, axe, contraste medido | vitest (63 archivos, ~810 pruebas), `src/test/contrast.test.ts` sobre `--app-*`, presupuesto LCP < 2 s local (`scripts/perf-budget.mjs`) |

---

## 2. Decisiones

| ID | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| **DEC-53** | El **kit de marca vive en la landing** (`brand/`) y la plataforma lo **copia por commit con sha256** (`scripts/brand-sync.mjs` + `src/brand/manifest.json`). Pruebas de deriva en ambos repos. | Una sola fuente de verdad sin registro npm ni submódulos; cada versión de la plataforma declara qué commit del kit usa. | Paquete npm (requiere registro privado); submódulo (fricción, y el repo de la plataforma excluye rutas anidadas sensibles). |
| **DEC-54** (revisada el 2026-10-05) | **Tipografía:** **Nunito** (OFL 1.1) autohospedada en los dos repos, sin Google Fonts: decisión del owner del 2026-10-05, desviación consciente del manual (DIN 2014 Rounded; ADR-012). Reemplaza el texto original de DEC-54 —Barlow en ambos sitios y DIN 2014 Rounded cuando existiera licencia web, con los archivos fuera de git y servidos desde un bucket privado—, que se conserva en ADR-010 como historia (§6). | Una tipografía abierta, sin costo de licencia ni peticiones a terceros (CSP `font-src 'self'`); el owner la eligió tras comparar la muestra del manual con Barlow, Nunito, Nunito Sans y Rubik sobre textos reales de M3TRIC. | Licenciar DIN 2014 Rounded y mantener Barlow (descartadas por el owner); Adobe Fonts (script de terceros, no autohospedable); commitear los .woff2 (prohibido en repo público). |
| **DEC-55** | **Español único**, textos en el código (sin librería i18n). Enumeraciones visibles al usuario en `src/lib/labels.ts`; fechas y números en `src/lib/format.ts` con `es-CO`; prueba guardián que falla ante palabras de interfaz en inglés. | Producto contractualmente en español; una capa de diccionario para 90 archivos sería infraestructura para un idioma hipotético. | Diccionario `t()` (+3–5 KB, ~90 archivos tocados sin beneficio hoy). |
| **DEC-56** | Título de pestaña de la plataforma: **«M3TRIC \| Plataforma»**; `lang="es-CO"`. | Con la interfaz en español, el nombre en inglés era la única pieza fuera del idioma; conserva el patrón «M3TRIC \|» que fijó el owner. | Mantener «Geospatial Analytics Platform» (inconsistente con REQ-U03). **Pendiente de confirmación del owner**; revertible en una línea. |
| **DEC-57** | Shell de la plataforma: **barra lateral verde oscuro `#004124`** con logo *reverse* y activo en `#74C69D`; contenido en blanco/beige con paneles planos (`rounded-3xl`, hairline `#004124/10`, sombra suave), botones píldora, foco visible por superficie. | Es la gramática de la landing (header sobre hero, secciones oscuras/claras) trasladada a una aplicación. | Barra lateral blanca (menos presencia de marca; el activo en verde claro no alcanzaría AA). |
| **DEC-58** | Niveles de alerta = escala de interpretación del manual (`#FFD166` Atención, `#F77F00` Alerta, `#D62828` Crítico) en mapa, tablero y gráficos; series de gráficos con la paleta de verdes + neutros; los cálidos **solo** para niveles. | Misma regla editorial que la landing (§3.2 de `docs/SPEC.md`). | Mantener ámbar/naranja previos (`#F39C12`, `#C05621`). |

---

## 3. Kit de marca (landing, fuente de verdad)

```
brand/
  README.md                 — qué contiene, cómo se consume y cómo se sincroniza
  documentos.md             — marca en documentos: página, logo, paleta en papel, tipografía, tablas, gráficas, XLSX/CSV (kit 1.2.0, 2026-10-07; autorizada por el owner)
  manifest.json             — { version, generatedAt, files: { ruta: sha256 } }  (generado: npm run brand:build; el commit de origen lo registra la plataforma al sincronizar)
  tokens.json               — paleta exacta del manual, tipografía (Nunito: pila, nombre, licencia, pesos), radios, foco, sombras, niveles
  tokens.css                — las mismas variables como :root (--m3-green-900 … --m3-red, --m3-ink, --m3-muted, --m3-beige, --m3-font-sans)
  logo/
    paths.json              — viewBox + path d del cuerpo y de las tres barras (fuente única del logo)
    m3tric-logo-color.svg   — cuerpo #004124, barras #74C69D (fondos claros)
    m3tric-logo-reverse.svg — cuerpo #B7E3C7, barras #74C69D (fondos #004124)
    m3tric-logo-mono-dark.svg / m3tric-logo-mono-light.svg
    m3tric-mark.svg         — tres barras sobre cuadrado #004124 (favicon; pendiente de validación de marca)
  motifs/triple-bar.svg     — proporciones exactas de las barras del "3" (64.49 · 64.49 · 91.7 × 23.52, gap 14.26)
  images/aerial-wide-1280.webp, aerial-tall-747.webp, globe-1000.webp — fotografía del manual sin texto incrustado
```

`brand/fonts/`, el espacio reservado para DIN 2014 Rounded, se eliminó el 2026-10-05 (ADR-012): el kit no lleva archivos de fuente.

Reglas: `brand/logo/paths.json` es la fuente del logo (`Logo.tsx` lo importa; los SVG se generan de él); `tokens.json` es la única lista de hex. Pruebas (`scripts/brand-kit.test.mjs`, `node --test`): (a) cada hex de `src/app/globals.css @theme` existe en `tokens.json` con el mismo valor; (b) `Logo.tsx` importa `paths.json` y los SVG generados coinciden con él; (c) `manifest.json` coincide con los sha256 de los archivos (deriva = fallo). `npm run release` ejecuta `test:unit`, que incluye estas pruebas.

---

## 4. Plataforma — sistema visual objetivo (REQ-U01, U02)

### 4.1 Tokens (Tailwind 3.4 + variables)
`tailwind.config.js` importa `src/brand/tokens.json`. Nombres nuevos `m3-*`; los alias previos `m3tric.*` se **repuntan** a valores de marca (tabla) y se eliminan cuando ya no tengan usos.

| Antes (`m3tric.*` / `--app-*`) | Después | Uso |
|---|---|---|
| primary `#1B4332`, `--app-text`, `--app-accent-strong` | `#004124` (`m3-green-900`) | Texto principal, botón primario, barra lateral |
| dark `#143226` | `#002A17` (`m3-green-950`) | Pie / franjas técnicas |
| secondary `#3A8A5C`, `--app-accent-mid`, `--app-text-muted #4a6e5a` | `#2C694F` (`m3-green-700`) | Texto secundario sobre claro (6.48:1), hover |
| accent `#2ECC71`, `--app-accent` | `#74C69D` (`m3-green-400`) | Barras del "3", acento **solo sobre oscuro**, anillo de foco sobre oscuro |
| — | `#B7E3C7` (`m3-green-200`) | Botón primario sobre oscuro, fondos suaves, texto secundario sobre oscuro |
| surface `#F7FAF8`, `--app-bg-alt` | `#F6F2EA` (`m3-beige`) | Fondo alterno / zonas editoriales |
| border `#D0DDD5` | `rgba(0,65,36,.10)` hairline (`m3-green-900/10`) | Bordes de panel, divisores |
| dim `#7A9E8A`, `--app-text-dim #557761` | `#4B5563` (`m3-muted`) | Texto terciario (7.56:1 sobre blanco) |
| warning `#F39C12` / `--app-warning #b7791f`, danger `#C05621`, success `#2F9E62`, blue `#2980b9`, teal | Niveles: `#FFD166` Atención · `#F77F00` Alerta · `#D62828` Crítico; éxito = `#2C694F`; informativo = `#004124` sobre `#B7E3C7`/20 | Insignias, avisos, marcadores, series |
| `--app-surface rgba(255,255,255,.97)` + blur | `#FFFFFF` sólido + sombra suave `0 2px 10px rgba(0,65,36,.06)` | Paneles flotantes sobre mapa (AA garantizado sin vidrio) |

Prohibido como texto: `#74C69D` sobre blanco/beige (2.04:1). `src/test/contrast.test.ts` se actualiza a los tokens nuevos y sigue exigiendo AA para texto principal, secundario y terciario sobre blanco, beige y `#004124`.

### 4.2 Componentes (todo en `src/index.css @layer components` + `src/components/ui/*`)
- **Shell:** `body`/`.app-shell` fondo blanco plano (sin radial); `.app-shell-sidebar` `#004124` sólido, texto `#B7E3C7`, logo reverse (`<BrandLogo variant="reverse" />`, ancho 120 px), enlace activo con fondo `rgba(255,255,255,.08)` + barra `#74C69D` (patrón del header de la landing), sin blur; móvil: barra superior `#004124` con logo + menú.
- **Botones:** `.btn-primary` = `#004124`/blanco (sobre claro) · `.btn-primary-on-dark` = `#B7E3C7`/`#004124` · `.btn-secondary` = borde `#004124` texto `#004124` · `.btn-ghost`; `rounded-full`, `min-height 44px`, `font-weight 700`, sin degradado.
- **Paneles:** `.app-panel` = blanco, `rounded-3xl`, hairline, sombra suave; `.app-panel-elevated` = igual (sin `backdrop-filter`).
- **Campos:** `.field-input` fondo blanco, borde hairline, foco anillo 2 px `#004124` (sobre claro) / `#74C69D` (sobre oscuro), `rounded-2xl`.
- **Insignias / avisos:** forma + texto, nunca solo color; niveles con la escala del manual.
- **Eyebrows / meta:** `.app-eyebrow`, `.page-eyebrow` → tipografía meta de la landing (12–13 px, tracking +0.08em) con el motivo `TripleBar` opcional.
- **Vista en vivo (`.live-*`):** mismo tratamiento (sin radial ni blur); selector de ventana como píldoras de marca.
- **Gráficos (ECharts):** leyenda/ejes con `#2C694F`/`#4B5563`/hairline; guías nominales (rangos de referencia, no alertas) en `#4B5563` discontinuo con rótulo `#2C694F`; series: `#004124, #2C694F, #4B5563, #74C69D, #0B0F0D, #B7E3C7` — los tonos oscuros primero y los pálidos al final, porque sobre blanco `#74C69D` (2.04:1) y `#B7E3C7` (1.3:1) solo sirven como series secundarias con trazo grueso; los cálidos quedan reservados a niveles.
- **Mapa:** marcadores y capas con la paleta; paneles flotantes sólidos.
- **Login (`LoginPage.tsx`):** dos columnas; izquierda `#004124` con fotografía aérea del kit + velo ≥ 70 % + `NodeNetwork` ligero + logo reverse + tagline del manual («Entender el territorio para anticipar el riesgo.», Bold + Light); derecha panel blanco plano con el formulario. Sin degradados. Imagen con `width/height`, `loading="eager"`.
- **Logo:** `src/brand/BrandLogo.tsx` (SVG en línea con los `path` del kit; `role="img"`, `aria-label="M3TRIC"`; variantes `color|reverse|mono-dark|mono-light`). Reemplaza el texto en `MainLayout` (l. 109-113), `LoginPage` (l. 134), navegación móvil y `.live-brand`.
- **Tipografía:** **Nunito** en ambos sitios (decisión del owner del 2026-10-05, ADR-012). Landing: `next/font/google`, una sola fuente variable (release 3.4.0, `deploy-13-25fffc8`). Plataforma (desplegada el 2026-10-05, `57681b2`): `@fontsource-variable/nunito` 5.3.0 (OFL-1.1; el paquete trae `nunito-latin-wght-normal.woff2` y su variante cursiva, con CSS `index.css`/`wght.css`) reemplaza a `@fontsource/barlow` 5.3.0, que cargaba cinco pesos (300/400/500/700/800); se importa en `main.tsx` **después** de `maplibre-gl.css` y antes de `index.css`. **El paquete registra la familia como «Nunito Variable», no como «Nunito», y un navegador solo descarga una cara para una familia que la página nombra:** `fontFamily.sans = ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif']` y la regla `body` de `src/index.css` es `font-family: 'Nunito Variable', var(--m3-font-sans)`, de modo que la pila del kit (`Nunito, system-ui, sans-serif`, la de `--m3-font-sans`) queda intacta como cola; una guarda de `brand.test.ts` exige que la primera familia de ambas esté declarada por un `@font-face`. Los gráficos (ECharts pinta sobre un canvas, que no hereda la fuente de la página) usan `CHART_FONT_FAMILY` (`"Nunito Variable"` seguido de la pila del kit, en `src/brand/chartTheme.ts`) como `textStyle.fontFamily` raíz (Tech Lead). `mono` = pila de sistema; `index.html` sigue sin `preconnect` ni `<link>` de Google Fonts (retirados el 2026-10-02); el kit se re-sincronizó (1.1.0) desde el commit `1dc8046` de la landing (la rama del PR #21; la fusión es `25fffc8`). `font-semibold` (600; 73 usos) pasa de negrita a SemiBold real: la fuente variable tiene ese peso y Barlow, con cinco pesos, no. Escala: títulos de página 28–36 px / 800; secciones 20–22 / 700; cuerpo 15–16 / 400; meta 12–13.
- **Iconos:** lucide, trazo 1.5 (igual que la landing).
- **Movimiento:** transiciones ≤ 200 ms de color/sombra; respeto a `prefers-reduced-motion`.

### 4.3 Accesibilidad y rendimiento
- AA en todos los pares de texto (prueba de contraste); foco visible en cada control; objetivos ≥ 44 px; `lang="es-CO"`.
- Presupuesto vigente `LCP < 2000 ms` en `/login` y `/map` (`npm run perf:budget`, local): se re-mide tras el cambio; quitar Google Fonts elimina una conexión a terceros en la ruta crítica. Resultado de la medición: §14.4.
- Sin peticiones a terceros desde la interfaz (verificado en vivo).

---

## 5. Plataforma — español (REQ-U03)

- `index.html`: `lang="es-CO"`, `<title>M3TRIC | Plataforma</title>` (DEC-56).
- Archivos a traducir (inglés → español, tono del manual: claro, directo, formal «usted»): `LoginPage.tsx`, `DashboardPage.tsx`, `AlertsPage.tsx`, `components/auth/ProtectedRoute.tsx`, `components/common/ErrorBoundary.tsx`, `MapPage.tsx`, `SettingsPage.tsx`, `ReportsPage.tsx`, `maps/MapView.tsx`, el eyebrow en inglés de `MainLayout.tsx` y cualquier otro que detecte la prueba guardián.
- `src/lib/labels.ts`: enumeraciones visibles (estado de alerta: Activa · Reconocida · Resuelta · Silenciada · Disparada; estado de sensor: Registrado · Activo · Inactivo; conectividad: En línea · Con retraso · Sin señal · Sin datos; niveles: Normal · Atención · Alerta · Crítico) consumidas por `AlertsPage`, `SensorsPage`, `PlatformLivePage`, `HomePage`, `StatusBadge`.
- `src/lib/format.ts`: `formatDate`, `formatDateTime`, `formatNumber`, `formatRelative` con `es-CO` y zona `America/Bogota`; reemplaza los `toLocaleString()` sin locale (`AlertsPage` l. 101-102, `DashboardPage` l. 152, `MapView`) y unifica los `Intl` existentes.
- Glosario mínimo: Sign In → Iniciar sesión · Signing in… → Iniciando sesión… · Welcome back → Le damos la bienvenida · Username/Password → Usuario / Contraseña · Passwords do not match → Las contraseñas no coinciden · Unable to sign in → No fue posible iniciar sesión · Loading… → Cargando… · Total Sensors → Sensores en total · Active Sensors → Sensores activos · Recent Alerts → Alertas recientes · Unable to load → No se pudo cargar · All Statuses → Todos los estados · Save / Cancel → Guardar / Cancelar · Coming soon → Próximamente · Session expired → Su sesión expiró; inicie sesión de nuevo. Nombres técnicos se conservan: GeoTIFF, MQTT, CSV, GNSS, NDVI.
- Prueba guardián `src/test/spanish-ui.test.ts`: recorre `src/**/*.tsx` (sin pruebas) y falla si el texto JSX o `placeholder/title/aria-label/alt` contiene palabras de interfaz en inglés de una lista cerrada (`Sign in|Loading|Unable|Welcome|Save|Cancel|Total|Active|Resolved|Coming soon|Settings|Dashboard|Alerts|Reports|Sensors|Map` como palabra completa), con lista blanca de términos técnicos.
- Pruebas existentes con texto en inglés (≈7 archivos, sobre todo `App.test.tsx`) se actualizan al texto nuevo. Las ≈32 pruebas que ya afirman español no cambian.

---

## 6. Tipografía (REQ-U04) — retirada del diseño de DIN 2014 Rounded (ADR-012)

**Retirada (ADR-012).** El 2026-10-05 el owner decidió usar **Nunito** en ambos sitios y no licenciar DIN 2014 Rounded (desviación consciente del manual, lámina 10). Se retira el diseño de servicio de DIN —bucket privado de fuentes, comportamiento `/fonts/*` en las dos distribuciones y `@font-face` activado por bandera—, que nunca se implementó en código ni en infraestructura; queda en ADR-010 como historia.

La CSP conserva `font-src 'self'`, los archivos de fuente siguen prohibidos en el repositorio público y no existe ninguna bandera `NEXT_PUBLIC_BRAND_FONT` ni `VITE_BRAND_FONT`. Landing: Nunito con `next/font/google` desde el release 3.4.0 (`deploy-13-25fffc8`). Plataforma: `@fontsource-variable/nunito`, desplegada el 2026-10-05 (§4.2 y §14.7).

---

## 7. Landing — cambios

1. `brand/` (§3) + `scripts/brand-kit.test.mjs` + `npm run brand:build`.
2. `docs/SPEC.md` §3.3: estado de la tipografía (DEC-54) y referencia al kit; `docs/adr/ADR-008` (kit compartido), `ADR-009` (español único en plataforma), `ADR-010` (DIN: licencia y servicio desde bucket privado; retirada el 2026-10-05, ADR-012); `docs/TRACEABILITY.md`: filas REQ-U01..U05; `CHANGELOG.md` 3.2.0.
3. Sin cambios visuales en la landing (3.2.0).
4. 2026-10-05 (release 3.4.0, ADR-012): Nunito reemplaza a Barlow en la landing (`src/app/layout.tsx`, `src/app/globals.css`, `brand/tokens.json` y `brand/tokens.css`) y se elimina `brand/fonts/`. Este sí es un cambio visual: Nunito es más ancha y más suave que Barlow (`CHANGELOG.md` 3.4.0). Publicado como `deploy-13-25fffc8` (PR #21, fusionado como `25fffc8`) y verificado en vivo el 2026-10-05 (§14.7).

---

## 8. Plataforma — cambios (frontend + docs)

| Área | Archivos | Unidad |
|---|---|---|
| Kit sincronizado | `src/brand/kit/**` (copia íntegra de `brand/**`, incluido `logo/paths.json`), `src/brand/manifest.json` (manifiesto del kit + `sourceCommit`), `scripts/brand-sync.mjs`, `src/brand/brand.test.ts` (hashes = manifest; `tailwind.config.js` colores = tokens; sin `gradient` ni `backdrop-filter` en el código) | U2 |
| Tokens y estilos | `tailwind.config.js`, `src/index.css`, `src/main.tsx` (import de `@fontsource/barlow`), `index.html` (sin Google Fonts; `lang`; título), `package.json` (+`@fontsource/barlow`) | U2 |
| Logo y shell | `src/brand/BrandLogo.tsx`, `components/layout/MainLayout.tsx`, `pages/LoginPage.tsx` (restyle + español), `.live-*` en `index.css`, `PlatformLivePage` shell | U2 |
| Español | `src/lib/labels.ts`, `src/lib/format.ts`, los archivos de §5, `src/test/spanish-ui.test.ts`, pruebas afectadas | U3 |
| Contraste | `src/test/contrast.test.ts` con tokens nuevos | U2 |
| Docs | `docs/enterprise-agro/26-identidad-compartida.md` (spec local + evidencia), `docs/platform-live-dashboard/07-decisiones-owner.md` (DEC-53..58), evidencia archivada en la landing, `docs/evidence/platform-brand/` (capturas antes/después, QA en vivo y Lighthouse; sin copia en la plataforma, §14) | U4/U5 |

Actualización del 2026-10-05 (ADR-012): el release de la plataforma del 2026-10-05 (PR #193, `57681b2`) cambia la tipografía; la tabla describe el release del 2026-10-02 (con Barlow). Cambia `package.json` (`@fontsource-variable/nunito` 5.3.0 en lugar de `@fontsource/barlow` 5.3.0), `src/main.tsx` (el import de la fuente), `tailwind.config.js` (`fontFamily.sans`), la regla `body` de `src/index.css`, `src/brand/chartTheme.ts` (`CHART_FONT_FAMILY`), `src/brand/brand.test.ts` (guardas de tipografía) y el kit sincronizado (1.1.0; §4.2). El PR #194 (`66acab7`) corrige dos defectos que la QA en vivo halló en ese release: la maquetación de `/map` en escala Meso (NU-01) y el repintado de los gráficos cuando la fuente llega tarde (NU-02; hook `useRepaintWhenFontReady`). Despliegue y verificación: §14.7.

Restricciones conocidas: orden de imports `maplibre-gl.css` → `index.css` en `main.tsx` es **load-bearing** (no mover); el capturador de rollback exige que todo `*.svg`/`*.json` citado por el JS servido exista; no se tocan backend, API ni auth.

---

## 9. Pruebas y evidencia

| Capa | Landing | Plataforma |
|---|---|---|
| Unitarias | `test:unit` (+ `brand-kit.test.mjs`) | `npm test` (≈810 + `brand.test.ts` + `spanish-ui.test.ts` + `contrast.test.ts` actualizada) |
| Estáticas | lint, typecheck, hygiene | `npm run lint`, `tsc -b`, hygiene del repo |
| Build | `npm run release` | `npm run build` (dist) |
| Rendimiento | — (sin cambios) | `npm run perf:budget` local: LCP < 2000 ms en `/login` y `/map`, antes y después |
| En vivo (post-deploy) | `npm run test:live` (sin cambios) | Script Playwright (desde el repo de la landing) con usuario temporal de Cognito: 0 errores de consola, 0 violaciones CSP, 0 orígenes de terceros, fuente computada = Nunito (la corrida del 2026-10-02 midió Barlow, §14.2), `lang=es-CO`, título, 0 palabras inglesas de la lista en la navegación y páginas principales, axe sin violaciones serias/críticas, capturas 1440/390 de login, inicio, mapa, sensores, en vivo, ajustes |
| Evidencia | `docs/evidence/platform-brand/{before,after}/`, informes en `docs/evidence/platform-brand/QA-REPORT.md` | enlace desde `26-identidad-compartida.md` |

---

## 10. Despliegue

- **Landing:** PR → CI → merge → `Deploy staging` (en 3.2.0, sin cambios visuales: publica el kit y la documentación; el release 3.4.0 con Nunito sí cambia la apariencia, ADR-012).
- **Plataforma:** PR (CI: «Plataforma web — compilación, lint y pruebas», «Qué cambió», «Repository hygiene») → merge → ceremonia: plan manual sobre el SHA de `main` → verificación de checksums → publicación de assets faltantes → change set (0 reemplazos; solo frontend, `ReleaseId`, deployment de API) → ejecución → smoke en vivo (§9). Rollback: change set con la plantilla anterior (bundle previo capturado por el plan).

---

## 11. Trazabilidad (resumen; detalle en `docs/TRACEABILITY.md` y `26-identidad-compartida.md`)

| REQ | Implementación | Verificación | Evidencia | Estado (2026-10-02; REQ-U04, 2026-10-05) |
|---|---|---|---|---|
| U01 | `brand/`, `tailwind.config.js`, `index.css`, componentes | `brand.test.ts`, `contrast.test.ts`, capturas | `docs/evidence/platform-brand/QA-REPORT.md` §4.1, §4.3, §4.6, §4.7 y §5; `after/` frente a `before/`. Falta la aceptación explícita del owner de la apariencia de la plataforma desplegada (§12) | Parcial |
| U02 | `BrandLogo.tsx`, `MainLayout`, `LoginPage`, `.live-brand` | `brand.test.ts` (paths = kit), capturas, smoke (`role="img"` M3TRIC) | QA-REPORT §4.1 (V07), §4.3; `after/login-*.webp`. Favicon derivado: validación de marca pendiente (n.º 5) | Parcial |
| U03 | §5 | `spanish-ui.test.ts`, pruebas actualizadas, smoke (`lang`, scan de inglés) | QA-REPORT §4.1 (V01, V02, V10, V11) y §5. Pendientes del owner: confirmar DEC-56 y aprobar el copy del inicio de sesión (§12) | Parcial |
| U04 | Tipografía única en ambos sitios: Nunito (decisión del owner 2026-10-05, ADR-012). Landing: `next/font/google`, `brand/tokens.json` (`font`) y `brand/tokens.css`. Plataforma (desplegada el 2026-10-05, `57681b2`, y corregida en `66acab7`): `@fontsource-variable/nunito` (familia «Nunito Variable»), `tailwind.config.js`, `src/index.css` (`body`), `src/brand/chartTheme.ts` (`CHART_FONT_FAMILY`), el hook `useRepaintWhenFontReady` (PR #194) y el kit 1.1.0 re-sincronizado | `brand-kit.test` (pila tipográfica y ausencia de archivos de fuente); plataforma: `brand.test` (incluye la guarda de que la primera familia de la pila esté declarada por un `@font-face`); landing: verificación en vivo hecha (fuente computada = Nunito; sin terceros); plataforma: humo HTTP y QA en vivo hechos (fuente computada y pintada; sin terceros; `QA-NUNITO.md`, con su re-verificación) | Landing: release 3.4.0 publicado como `deploy-13-25fffc8` (run `37338733353`, CI 7/7 con e2e en chromium, firefox y webkit); verificación en vivo del 2026-10-05 (Tech Lead; sin salida cruda archivada): fuente computada de `h1` y `body` = Nunito a 1440 y 390 px, un archivo variable, 1 petición de fuente (antes, 5), 0 hosts de terceros (§14.7). Plataforma: PR #193 (`57681b2`, change set `nunito-57681b2`) y, tras la QA, PR #194 (`66acab7`, change set `nu-fix-66acab7`), ambos en `UPDATE_COMPLETE` y con humo HTTP (§14.7); QA en vivo archivada en `docs/evidence/platform-brand/nunito/` (34 estados con Chromium: fuente pintada = Nunito por CDP, 1 petición de fuente del propio origen por carga, 97,18 % de los glifos en Nunito, 0 errores; halló NU-01 y NU-02, corregidos y re-verificados en `66acab7`; §14.7). Antecedente con Barlow (2026-10-02; no prueba Nunito): QA-REPORT §4.1 (V03 a V06) y §4.2 (V13) | Verificado — ambos sitios medidos en vivo el 2026-10-05; el componente subjetivo (la tipografía en sí) lo resolvió el owner tras la comparación (ADR-012) |
| U05 | esta spec, ADR-008..010 (ADR-010 retirada), ADR-012, DEC-53..63 (DEC-54 revisada), matriz | revisión | ambos repos; `docs/TRACEABILITY.md` §7. El Tech Lead revisó la documentación de ambos el 2026-10-02 (versión 1.2 de esta spec); los cambios del 2026-10-05 (ADR-012 y su cierre, versión 1.4) son posteriores y esa revisión no los cubre; no incluye la revisión independiente | Verificado |

Criterio y condiciones de cada estado: `docs/TRACEABILITY.md` §6.2, §6.3 y §7. Un requisito con un componente subjetivo (copy, marca, apariencia) queda Parcial hasta la aprobación que le falta. REQ-U04 es el caso en que esa aprobación ya existe: el owner decidió la tipografía (ADR-012) y lo que quedaba era técnico, y se verificó en vivo.

---

## 12. Dependencias del owner
1. Licencia web de DIN 2014 Rounded: **cerrada el 2026-10-05** (el owner eligió Nunito y no se licencia DIN, ADR-012; se conserva el número porque otros documentos citan los puntos 2 y 3). 2. Confirmar «M3TRIC \| Plataforma» como nombre en español de la pestaña (DEC-56). 3. Aprobación del copy en español del inicio de sesión. 4. Validación de marca del favicon (ya pendiente). 5. Aceptación explícita de la apariencia de la plataforma desplegada, tras revisarla (REQ-U01).

## 13. Unidades de trabajo y orden
U1 kit en la landing (sonnet) ‖ U3 español en la plataforma (sonnet) → U2 restyle + logo + fuente en la plataforma (sonnet, sobre U1) → gate visual del Tech Lead → U4 QA local (vitest, lint, build, perf) → PRs + merges → despliegues (landing GHA; plataforma ceremonia) → U4 QA en vivo → U5 docs/trazabilidad en ambos repos.

---

## 14. Resultado (2026-10-02)

Cierre del programa. El estado de cada requisito está en §11 y en `docs/TRACEABILITY.md` §7: REQ-U05 es Verificado; REQ-U01 a U04 quedan en Parcial porque cada uno espera una aprobación del owner, la validación de marca del cliente o, en REQ-U04, la licencia de DIN 2014 Rounded (motivo sustituido el 2026-10-05: el owner eligió Nunito, ambos sitios se verificaron en vivo y REQ-U04 pasó a Verificado; ADR-012 y §14.7; lista al final de esta sección). Lo medido sobre la plataforma proviene de la QA en vivo contra el despliegue real (`docs/evidence/platform-brand/QA-REPORT.md`; `docs/evidence/platform-brand/README.md` explica la evidencia). Las cifras de PR, plan, change set, stack, humo HTTP y totales de pruebas las verificó el Tech Lead el 2026-10-02 contra GitHub y AWS y no tienen salida cruda archivada en este repositorio.

Nota del 2026-10-05 (versión 1.3): la decisión de tipografía (ADR-012) cambia REQ-U04 y retira §6. Lo medido el 2026-10-02 corresponde a Barlow en ambos sitios y se conserva como antecedente; no prueba Nunito. El resto de §14 no se reevaluó.

Nota del 2026-10-05 (versión 1.4): la landing se publicó como `deploy-13-25fffc8` y se verificó en vivo; la plataforma se desplegó con Nunito (PR #193, `57681b2`), la QA en vivo halló dos defectos de la tipografía (NU-01 y NU-02), se corrigieron (PR #194, `66acab7`) y se re-verificaron, y REQ-U04 pasa a Verificado. Las cifras y los hallazgos están en §14.7. §14.1 a §14.4 siguen siendo las del release anterior, con Barlow; se actualizaron §14.5 (punto 3) y §14.6 (n.º 1, 5, 7 y 11; nuevos n.º 12 y 13).

### 14.1 Despliegue

| Repositorio | Resultado |
|---|---|
| Landing | Kit de marca incorporado en `deploy-8-605dacb` (el sitio no cambia: `brand/` no se publica); serie de colores de gráficos del kit en `deploy-9-79d4f45`; variable `CONTACT_EMAIL` del environment en `deploy-10-79d4f45` (mismo commit que `deploy-9`); co-marca de EAFIT en `deploy-11-cd7d8b9` (ADR-011). Smoke 10/10 en los cuatro |
| Plataforma | PR #190, squash en `main` `1c8e17d4e4aa79f90747fdd70110612f0da059e2`, con CI en verde (IaC, Lambdas Python, Plataforma web, «Qué cambió» y Repository hygiene). Plan run `37019712510`: 115 checksums verificados y bundle de rollback capturado. 4 assets publicados: frontend `9ba89048…`, Lambda `platform-admin` `9835a826…`, Lambda `platform-live` `53bdb980…` y plantilla `8de1eb01…`. Change set `identidad-compartida-1c8e17d`: 229 entradas, 0 reemplazos; diferencias reales: el asset del frontend, el código de 11 Lambdas (2 zips), el `ReleaseId` (`platform-live-1c8e17d…`), la rotación del deployment del API y las tildes de 2 respuestas de la pasarela. Stack `m3tric-staging-PlatformPreviewStack` en UPDATE_COMPLETE, sin eventos fallidos |
| Humo HTTP de la plataforma | `lang` `es-CO`; título «M3TRIC \| Plataforma»; 0 peticiones a Google Fonts; 5 `woff2` de Barlow servidos (200, unos 22 KB cada uno, `content-type: binary/octet-stream`); icono idéntico al de la landing; API 400 «Solicitud inválida.»; configuración del mapa 200 |

### 14.2 QA en vivo de la plataforma

Chromium 153.0.8010.12, Playwright 1.63.0, 20 vistas (inicio de sesión, ocho rutas y el detalle de `/live`, a 1440 y 390 px). Usuario temporal de Cognito, eliminado al terminar.

| Medida | Antes | Después |
|---|---|---|
| Elementos con degradado | 44 (en 9 rutas) | 0 en las 20 vistas |
| Elementos con `backdrop-filter` | 25 | 0 |
| Textos en inglés (misma expresión regular) | 38 | 0 en 28 superficies |
| Tipografía del cuerpo | Inter, desde Google Fonts | Barlow propia (5 pesos); 0 peticiones a Google |
| `lang` y título | `en` · «M3TRIC \| Geospatial Analytics Platform» | `es-CO` · «M3TRIC \| Plataforma» |
| Barra lateral a 390 px | Fija de 288 px | Barra superior y cajón, correcto en 6 de 6 rutas |
| Anillo de foco | No medido | `#004124` en el inicio de sesión; `#74C69D` en las 15 paradas de las dos barras laterales oscuras |
| axe (WCAG 2.0 y 2.1, A y AA) | No medido | 0 reglas serious/critical en 5 de 6 vistas; 1 serious (`role-img-alt`) en el detalle de `/live` (QA-03, preexistente) |
| Niveles de alerta | No medido | Atención `#FFD166` con tinta (13,38:1), Normal `#004124` con texto blanco, «Registrado» neutro; comprobados sobre la hoja de estilos real |
| Errores de consola, `pageerror` y peticiones fallidas | 0 | 0 (salvo la prueba negativa de contraseña) |
| Orígenes de red | No registrados | El propio, AWS Location (teselas), Cognito y el bucket de superposiciones |
| Contraseña incorrecta | No medido | «Usuario o contraseña incorrectos.» |

Hallazgos QA-01 a QA-12, con su dueño y siguiente acción: `docs/TRACEABILITY.md` §6.6. La QA no midió ninguna regresión introducida por la marca: QA-01 a QA-04 son preexistentes y de QA-05 no se pudo determinar si lo es. QA-02 (503 en `/api/live/*`) es de infraestructura y su causa raíz no está aislada.

### 14.3 Pruebas

- Landing: unitarias 208/208 (incluye las 60 de `scripts/brand-kit.test.mjs`); subconjunto de e2e en chromium 59/59, con la prueba de la co-marca de EAFIT (`content.spec.ts`).
- Plataforma: vitest 1180/1180 (72 archivos; la definición de hecho de §0 pedía «810+»), pruebas de las Lambdas 262 y 472, tsc, lint y build en verde.

### 14.4 Rendimiento (DEC-61)

- La comparación antes/después se hizo con una sola versión de Lighthouse (12.8.2, vía `npx`, móvil simulado) sobre `/login`: LCP 2973 ms en el sitio en vivo antes del cambio (rendimiento 87) y 2909 ms con el código nuevo servido en local (FCP 2456 ms, rendimiento 89). Informes: `docs/evidence/platform-brand/lighthouse/login-antes-en-vivo.report.json` y `login-despues-local.report.json`. Los puntajes de rendimiento son los del resumen del Tech Lead (campo `categories.performance.score` de cada informe).
- `npm run perf:budget` usa Lighthouse 13.4.1 y reportó 3,0 s en `/login` y 2,7 s en `/map`; sus cifras no se mezclan con las del 12.8.2.
- El presupuesto de §4.3 (LCP < 2000 ms) no se cumple con ninguna de las dos mediciones; el cambio no lo empeora (2973 → 2909 ms). El «después» se midió en local: no se midió el LCP del sitio en vivo con el código nuevo (AT-UX-3 sigue abierto).

### 14.5 Desviaciones respecto del diseño

1. **Pesos de Barlow.** La plataforma cargaba cinco (300, 400, 500, 700 y 800), no cuatro; §4.2 se corrigió en la versión 1.2.
2. **CSP.** DEC-54 y ADR-010 citan `font-src 'self'`. La landing lo tiene; la plataforma no envía Content-Security-Policy (QA-06), así que «sin tipografía externa» se verificó por red y escaneo estático, no por política.
3. **Tipo MIME de las fuentes.** Los `woff2` de la plataforma se sirven como `binary/octet-stream`: los de Barlow, el 2026-10-02, y el de Nunito, el 2026-10-05 (`/assets/nunito-latin-wght-normal-BzFMHfZw.woff2`, 200, 39 128 bytes; §14.7). El smoke de DIN de ADR-010 (retirada) exigía `font/woff2`. La QA del 2026-10-05 añade que el `woff2` de Nunito se sirve sin `Cache-Control` (NU-05; recomendación: `font/woff2` y `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` con hash). Sigue abierto (§14.6, n.º 1).
4. **Objetivos táctiles.** §4.2 y §4.3 piden 44 px como mínimo; se observó que `btn-ghost` y `live-window-selector` quedan por debajo (observación del Tech Lead; adenda a DEC-62 en la plataforma).
5. **CSS muerto.** §4.2 prohíbe degradados y vidrio y en ejecución se cumple (0 elementos), pero el CSS publicado conserva utilidades de degradado y de `backdrop-filter` sin uso, nacidas de cadenas de prueba que Tailwind escanea (QA-08).
6. **Arnés de la QA.** §9 prevé un script de Playwright; fue temporal y no se archivó (`QA-REPORT.md` §9). Se archivan sus datos crudos y su método; el seguimiento n.º 10 propone archivar un arnés repetible.

### 14.6 Seguimientos

| # | Seguimiento | Propietario | Origen |
|---|---|---|---|
| 1 | Servir los `woff2` con `content-type: font/woff2` (medido con los de Barlow el 2026-10-02 y con el de Nunito el 2026-10-05: `binary/octet-stream` en ambos; sigue abierto) y, para `/assets/*` con hash, con `Cache-Control: public, max-age=31536000, immutable` (el de Nunito no lleva `Cache-Control`) | Plataforma | Humo HTTP; §14.5, punto 3; NU-05 de la QA del 2026-10-05 |
| 2 | Excluir `*.test.*` del `content` de Tailwind para eliminar el CSS muerto de degradado y vidrio | Plataforma | QA-08 |
| 3 | Enviar una CSP desde la política de cabeceras de CloudFront de la plataforma | Plataforma | QA-06 |
| 4 | Carga diferida (lazy-load) de ECharts | Plataforma | AT-UX-3 |
| 5 | Panel «Capas de imagen» del mapa como hoja inferior con botón de cierre por debajo de unos 1200 px (QA-01 **persiste** a 390 px tras el PR #194: el panel recorta 34 px, antes 136 con `57681b2`, y el selector de escala queda fuera de la vista) | Plataforma | QA-01; re-medido en la QA del 2026-10-05 |
| 6 | Nombre accesible para los contenedores de ECharts con `role="img"` | Plataforma | QA-03 |
| 7 | Nombres de lote visibles en «Lotes existentes» (QA-04 **mejorado** por el PR #194: el nombre mide 246 px, con `title` y sin truncar a 1440, 1280 y 390; con `57681b2` medía 0 px) | Plataforma | QA-04; re-medido en la QA del 2026-10-05 |
| 8 | Capacidad de `live-api` y `live-trend` (concurrencia reservada 2, Lambda de 10 s, ráfaga de 5 en el stage) | Plataforma (infraestructura) | QA-02 |
| 9 | Objetivos táctiles de `btn-ghost` y `live-window-selector` a 44 px | Plataforma | §14.5, punto 4 |
| 10 | Archivar un arnés repetible de la QA en vivo (Playwright) en el repositorio de la plataforma | Plataforma | §14.5, punto 6; `QA-REPORT.md` §9 |
| 11 | **Hecho el 2026-10-05.** Tipografía Nunito: verificar en vivo la plataforma desplegada con `@fontsource-variable/nunito` (fuente computada y pintada, y ausencia de peticiones a terceros). El despliegue de la plataforma, su QA en vivo con la re-verificación y la verificación en vivo de la landing están hechos (§14.7) | Plataforma · Tech Lead | ADR-012; REQ-U04 |
| 12 | Tiempo de respuesta de `/api/live/trend` (16,4–16,6 s; Lambda `live-trend` de 20 s con concurrencia reservada 2): investigar qué parte es la consulta, acotar o cachear el cálculo y subir la concurrencia reservada (junto con el n.º 8) | Plataforma (infraestructura) | NU-06 de la QA del 2026-10-05 |
| 13 | Ayuda de «Capas de imagen» de `/map` en escala Meso, alcanzable solo con la rueda sobre una caja de desplazamiento anidada (140 px de alto a 1440×900; 104 px a 1280×800): dar más alto a esa pila o hacer que se desplace toda la columna | Plataforma | NU-07 de la QA del 2026-10-05 |

Pendientes del Owner y del Cliente (no son seguimientos técnicos; cada uno mantiene en Parcial el requisito indicado): aceptación explícita de la apariencia de la plataforma desplegada tras una revisión visual (REQ-U01, §12); validación de marca del favicon (REQ-U02, dependencia n.º 5); confirmar el título «M3TRIC \| Plataforma» (DEC-56) y aprobar el copy en español del inicio de sesión (REQ-U03, §12); vector oficial de la Universidad EAFIT y confirmación de su oficina de marca (REQ-O07, ADR-011). La licencia de DIN 2014 Rounded ya no figura: se cerró el 2026-10-05 (ADR-012); REQ-U04 pasó a Verificado el 2026-10-05 (§14.7), con el seguimiento n.º 11 hecho. Pendiente del Owner que no condiciona el estado de REQ-B03 ni de REQ-U04: informar a la oficina de marca de la desviación respecto del manual (lámina 10; ADR-012).

### 14.7 Resultado 2026-10-05 (tipografía)

Cierre de la tipografía (ADR-012). Las cifras del release de la landing, de su verificación en vivo y de los dos despliegues de la plataforma (PR, plan, assets, change set, humo HTTP y pruebas) las verificó el Tech Lead el 2026-10-05 contra GitHub, AWS y los sitios publicados; no tienen salida cruda archivada en este repositorio. La QA en vivo de la plataforma sí está archivada: `docs/evidence/platform-brand/nunito/` (`QA-NUNITO.md`, con la re-verificación en su §10; `findings.json`, con la clave `recheck`; 34 capturas WebP; 36 archivos, 1,64 MB). Lo medido el 2026-10-02 (§14.1 a §14.4) corresponde al release anterior, con Barlow.

| Concepto | Resultado |
|---|---|
| Landing: release | PR #21 fusionado como `25fffc8` (commit de la rama `1dc8046773655e4f2389d9e5b431d1ff44a02029`); release `deploy-13-25fffc8`, run `37338733353`, CI 7/7 (incluidos los e2e de chromium, firefox y webkit) y smoke en el job de publicación |
| Landing: verificación en vivo | Script de Playwright (`live-font-check.mjs`): fuente computada de `h1` y `body` = Nunito a 1440 y 390 px; `document.fonts` cargadas = `Nunito 200 1000 normal`, un solo archivo variable (`/_next/static/media/07454f8ad8aaac57-s.p.fc65572f.woff2`); 1 petición de fuente (con Barlow, 5); 0 hosts de terceros; `h1` de 2 líneas a 1440 px y 4 a 390 px, igual que con Barlow; solo desbordan las etiquetas `.sr-only` ocultas que ya desbordaban; ancho de página exacto. Sin salida cruda archivada |
| Plataforma: PR y CI | PR #193, squash en `main` `57681b2`. CI: «Plataforma web — compilación, lint y pruebas» en verde (2 min 17 s), «Qué cambió» y «Repository hygiene» en verde; los demás jobs se omitieron por el detector de cambios |
| Plataforma: plan | Run `37344355202` («Plan manual — Platform Live MVP», alcance `platform-live`): 110/110 checksums verificados y bundle de rollback capturado |
| Plataforma: assets | 9 en el manifiesto; 7 ya estaban en el bucket y se publicaron 2: el frontend (`10e3727da6e9…`, zip de 1132 KB) y la plantilla (`887cf6cf252f…`, JSON) |
| Plataforma: change set y ejecución | `nunito-57681b2`: 229 entradas, 0 reemplazos; Add/Remove solo de la rotación del deployment del API Gateway. Diferencias reales de la plantilla (sin contar etiquetas): `SourceObjectKeys` del deployment del frontend, `ReleaseId` (`platform-live-57681b216098fc5fc0c90ad83a8bb337b2bb4d11`) y el `DeploymentId` del stage; el change set marca 3 `DirectModification`. Ejecutado el 2026-10-05 a las 17:02:36Z: `UPDATE_COMPLETE`, 0 eventos fallidos |
| Plataforma: humo HTTP | `lang="es-CO"`; título «M3TRIC \| Plataforma»; 0 referencias a Google Fonts; CSS servido `index-D4EmbbLo.css` con 7 apariciones de `Nunito Variable` y 0 de Barlow; `/assets/nunito-latin-wght-normal-BzFMHfZw.woff2` → 200, 39 128 bytes, `content-type: binary/octet-stream` (§14.5, punto 3; §14.6, n.º 1); `/map-config.json` 200; `/api/live/overview` → 400 «Solicitud inválida.» |
| Plataforma: pruebas (`57681b2`) | vitest 1184/1184 (72 archivos); kit 1.1.0 sincronizado desde `1dc8046`, idéntico byte a byte al `brand/` de `deploy-13-25fffc8` |
| Plataforma: QA en vivo, primera corrida (`57681b2`) | Chromium 153.0.8010.12, Playwright 1.63.0; 34 estados (login, rutas del shell y de `/live`, tutorial, seis cajones y detalle de dispositivo, a 1440 y 390 px); usuario temporal de Cognito `smoke-qa-nunito-1791223529`, eliminado y con su ausencia comprobada. `document.fonts`: solo «Nunito Variable» 200 1000, cara `latin`, en 34/34. Peticiones de fuente: 1 por carga de página (18/18), del propio origen, 39.128 bytes, con SHA-256 idéntico al del paquete 5.3.0; hosts: el propio, AWS Location, Cognito y el bucket de capas (0 no esperados, 0 a Google). CDP (`CSS.getPlatformFontsForNode`): `isCustomFont: true` e instancia `Nunito-*` en encabezado, navegación, botones, KPI y placeholder; `font-semibold` (600) → `Nunito-SemiBold` en 20/20. Censo: 1.338 nodos de texto y 28.158 glifos, 97,18 % en Nunito (el resto, intencional: atribución de MapLibre, 264 glifos, y `font-mono`, 530). Gráficos: los 3 de ECharts pintan en Nunito (0 px de diferencia frente a Nunito forzada). Diseño: ningún desborde horizontal, 0 de 113 etiquetas de navegación en dos líneas y cajón de 390 px correcto en 6/6 rutas; 0 errores de consola y de página, 0 peticiones fallidas y 0 respuestas 503. Nunito es en mediana un 4,7 % más ancha que Barlow emulada sobre el mismo despliegue (p90 +10,3 %, máximo +20,2 %) |
| Plataforma: hallazgos | NU-01 (media, regresión de la tipografía): `/map` en escala Meso a 1440×900, «Editar límites» ×3 en dos líneas y la columna izquierda recorta el panel «Capas de imagen» 50 px (74 px con la lista de sensores abierta; 0 con Barlow emulada). NU-02 (baja, latente): el gráfico de tendencia de Inicio no se repinta si la fuente llega después de los datos. NU-06 (media, infraestructura, ajena a la tipografía): `/api/live/trend` responde en 16,4–16,6 s (Lambda `live-trend` de 20 s, concurrencia reservada 2). Observaciones: NU-03 (CDP informa `familyName` «Nunito ExtraLight»; el peso se evalúa en `postScriptName`), NU-04 (atribución de MapLibre y `font-mono` fuera de Nunito, intencional) y NU-05 (`woff2` como `binary/octet-stream` y sin `Cache-Control`; §14.6, n.º 1). QA-01 persiste a 390 px (agravado en esta corrida); QA-04 y QA-12 persistían; QA-02 no reapareció |
| Plataforma: corrección (PR #194) | Rama `fix/nunito-map-meso-y-repintado`, commit `85ca55d`, squash en `main` `66acab72f6f9e03472eaedf26d8644cd8c32f3c3`. Acciones del lote con `whitespace-nowrap` y en grupo con `flex-wrap` bajo el nombre (nombre `min-w-[8rem] flex-1 truncate`, con `title`); columna izquierda `max-h-full min-w-min overflow-y-auto`; bloque de sensores `relative`; hook `useRepaintWhenFontReady` (`document.fonts.load('12px "Nunito Variable"')` y `resize()` una vez) en el gráfico de Inicio y en `LiveLineChart`. 21 pruebas nuevas: vitest 1205/1205 (74 archivos), `tsc`, lint y build; reproducción en Chromium con fixtures: recorte 50/74 → 0/0 px, 1 repintado y 0 px. CI del PR: el job «Plataforma web» se canceló por la fusión (concurrencia) y se re-ejecutó con éxito; «Repository hygiene» en verde en el PR |
| Plataforma: segundo despliegue (`66acab7`) | Plan run `37369233164` (110/110 checksums), 2 assets publicados, change set `nu-fix-66acab7` (229 entradas, 0 reemplazos, 3 modificaciones directas) ejecutado a las 20:56:39Z: `UPDATE_COMPLETE`, 0 eventos fallidos. Humo: entrada `index-DIokBpOc.js` con el fragmento `useRepaintWhenFontReady-Cn6BNdVv.js`, 7 reglas «Nunito Variable», `map-config` 200 y API 400 «Solicitud inválida.» |
| Plataforma: re-verificación (`66acab7`) | `QA-NUNITO.md` §10; usuario temporal `smoke-qa-nunito2-1791234189`, eliminado y con su ausencia comprobada; dos pasadas con las mismas cifras. NU-01 **corregido**: panel 0/0 px a 1440×900 y 1280×800, con la lista cerrada y abierta; «Editar límites» de 90,1×24 px en una línea (15 de 15); nombre de lote de 246 px (15 de 15); texto de ayuda alcanzable con la rueda; contenedor del mapa 1086×642, sin cambio. NU-02 **corregido**: con la fuente retenida 4 s y 5 s, 1 repintado y 0 px, con la huella del canvas idéntica a la del camino cálido. QA-05 corregido; QA-04 mejorado (el nombre se ve). QA-01 sin cambio a 390 px (recorte de 34 px; selector de escala fuera de la vista). Nuevo NU-07 (baja): la ayuda de «Capas de imagen» solo se alcanza por un cuadro de desplazamiento anidado de 140 px (104 px a 1280); «Subir imagen» queda recortado 15/39 px a 1280×800 hasta desplazar; no es regresión. Censo de fuentes y errores sin cambios (0) |
| Estado de los requisitos | REQ-U04 y REQ-B03: **Verificado** (ambos sitios medidos en vivo; el componente subjetivo —la tipografía en sí— lo resolvió el owner tras la comparación, ADR-012). REQ-U01 sigue Parcial (aceptación visual de la apariencia de la plataforma pendiente) |

La nota sobre la CSP (§14.5, punto 2) no cambia. Seguimientos abiertos tras este cierre (§14.6): n.º 1 (tipo MIME y `Cache-Control` de los `woff2`; NU-05), n.º 5 (QA-01), n.º 12 (NU-06) y n.º 13 (NU-07). Límites de la QA (`QA-NUNITO.md` §6 y §10.4): un solo navegador (Chromium), sin axe, Lighthouse ni lector de pantalla; la «tipografía anterior» es una emulación con Barlow; los gráficos de `/live` se midieron sin series reales (dispositivos «Callado»); el arnés no se archivó. Las cifras de PR, plan, change set y humo del segundo despliegue son del Tech Lead: la QA comprobó en AWS el `GitSha` del stack, su hora de actualización, el estado de la distribución, el paquete servido y el fragmento del hook.
