# Identidad compartida landing ↔ plataforma — Especificación end to end

| Campo | Valor |
|---|---|
| Versión | 1.2 · 2026-10-02 (cierre: estados finales de REQ-U01..U05 en §11, resultado medido y seguimientos en §14; §4.2 corregida a los cinco pesos de Barlow que carga la plataforma) · 1.1 · 2026-10-02 (alineada con el kit construido: `paths.json` como fuente del logo, manifiesto sin `sourceCommit`, pesos 300–800, guías neutras) |
| Alcance | Un solo sistema visual para la landing pública (`Alexic12/m3tric-landing`, público) y la plataforma (`Alexic12/M3TRIC_Platform › m3tric-platform/frontend`, privado): paleta, tipografía, logo, componentes, idioma, pruebas, despliegue y trazabilidad |
| Fuente de verdad visual | Manual de identidad M3TRIC (abril 2026) interpretado en `docs/SPEC.md` §3 y materializado en `brand/` (este repo) |
| Precedencia | Instrucciones del owner (2026-10-02) > Manual de marca > `docs/SPEC.md` > esta spec > decisiones previas de UI de la plataforma (`docs/enterprise-agro/25-ui-decision-record.md`, que no fijaba paleta ni tipografía) |
| Registro de decisiones | Landing: `docs/adr/ADR-008..010`. Plataforma: `docs/platform-live-dashboard/07-decisiones-owner.md` (DEC-53..DEC-58) |
| Trazabilidad | `docs/TRACEABILITY.md` (filas REQ-U*) + `docs/enterprise-agro/26-identidad-compartida.md` en la plataforma |

---

## 0. Requisitos del owner (2026-10-02)

| ID | Requisito literal | Lectura operativa |
|---|---|---|
| REQ-U01 | «El estilo con degradados en la plataforma no lo veo en la landing… debemos llevar el estilo de la landing a la plataforma… que todo se mantenga uniforme y compartan estilo» | La landing es la referencia. La plataforma adopta sus tokens (color, tipografía, radios, foco, sombras), sus componentes base (botón, panel, insignia, aviso) y su lenguaje (superficies planas, hairlines, verde oscuro como ancla). Desaparecen degradados y vidrio esmerilado. |
| REQ-U02 | «El logo debería aparecer en la plataforma en vez de escribir solo M3TRIC» | El wordmark vectorial oficial (lámina 8 del manual) reemplaza el texto «M3TRIC» en la barra lateral, el panel de inicio de sesión, la navegación móvil y la vista pública en vivo. |
| REQ-U03 | «El idioma de la plataforma debería estar en español también» | Toda la interfaz en español (es-CO): textos, títulos de pestaña, fechas y números, `lang`. Español como único idioma del producto. |
| REQ-U04 | «La fuente de la landing y de la plataforma no es la que se recomienda en el manual… ¿podemos usar la que se recomienda?» | Sí, con licencia: DIN 2014 Rounded es comercial (Paratype). Ambos sitios comparten hoy Barlow autohospedada y quedan preparados para cargar DIN 2014 Rounded en cuanto exista la licencia web, sin cambiar código (§6). |
| REQ-U05 | «spec end to end… implementado, probado y desplegado, todo al 100 %… todo trazable y documentado» | Esta spec, pruebas automatizadas en ambos repos, evidencia en vivo y despliegue por los mecanismos de cada repo (GitHub Actions en la landing; ceremonia plan → change set → smoke en la plataforma). |

Definición de hecho: (1) kit de marca versionado en la landing y sincronizado en la plataforma con hashes; (2) plataforma sin degradados, con tokens de marca, logo oficial, Barlow y 100 % español, con sus 810+ pruebas en verde más las nuevas; (3) ambas versiones publicadas y verificadas en vivo (consola, CSP, sin terceros, fuente computada, `lang`, cero textos en inglés en la navegación, axe); (4) trazabilidad y decisiones registradas en los dos repos.

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
| **DEC-54** | **Tipografía:** Barlow (OFL) autohospedada en los dos repos, sin Google Fonts. **DIN 2014 Rounded** se integra en cuanto exista licencia web: los archivos **nunca entran a git** (la landing es pública y las EULA prohíben redistribuir) y se sirven bajo `/fonts/*` desde un bucket privado compartido, con `@font-face` activado por configuración (§6). | Cumple el manual sin violar la licencia ni abrir peticiones a terceros (CSP `font-src 'self'`). | Adobe Fonts (script de terceros, no autohospedable); commitear los .woff2 (prohibido en repo público). |
| **DEC-55** | **Español único**, textos en el código (sin librería i18n). Enumeraciones visibles al usuario en `src/lib/labels.ts`; fechas y números en `src/lib/format.ts` con `es-CO`; prueba guardián que falla ante palabras de interfaz en inglés. | Producto contractualmente en español; una capa de diccionario para 90 archivos sería infraestructura para un idioma hipotético. | Diccionario `t()` (+3–5 KB, ~90 archivos tocados sin beneficio hoy). |
| **DEC-56** | Título de pestaña de la plataforma: **«M3TRIC \| Plataforma»**; `lang="es-CO"`. | Con la interfaz en español, el nombre en inglés era la única pieza fuera del idioma; conserva el patrón «M3TRIC \|» que fijó el owner. | Mantener «Geospatial Analytics Platform» (inconsistente con REQ-U03). **Pendiente de confirmación del owner**; revertible en una línea. |
| **DEC-57** | Shell de la plataforma: **barra lateral verde oscuro `#004124`** con logo *reverse* y activo en `#74C69D`; contenido en blanco/beige con paneles planos (`rounded-3xl`, hairline `#004124/10`, sombra suave), botones píldora, foco visible por superficie. | Es la gramática de la landing (header sobre hero, secciones oscuras/claras) trasladada a una aplicación. | Barra lateral blanca (menos presencia de marca; el activo en verde claro no alcanzaría AA). |
| **DEC-58** | Niveles de alerta = escala de interpretación del manual (`#FFD166` Atención, `#F77F00` Alerta, `#D62828` Crítico) en mapa, tablero y gráficos; series de gráficos con la paleta de verdes + neutros; los cálidos **solo** para niveles. | Misma regla editorial que la landing (§3.2 de `docs/SPEC.md`). | Mantener ámbar/naranja previos (`#F39C12`, `#C05621`). |

---

## 3. Kit de marca (landing, fuente de verdad)

```
brand/
  README.md                 — qué contiene, cómo se consume y cómo se sincroniza
  manifest.json             — { version, generatedAt, files: { ruta: sha256 } }  (generado: npm run brand:build; el commit de origen lo registra la plataforma al sincronizar)
  tokens.json               — paleta exacta del manual, tipografía (pila, pesos), radios, foco, sombras, niveles
  tokens.css                — las mismas variables como :root (--m3-green-900 … --m3-red, --m3-ink, --m3-muted, --m3-beige, --m3-font-sans)
  logo/
    paths.json              — viewBox + path d del cuerpo y de las tres barras (fuente única del logo)
    m3tric-logo-color.svg   — cuerpo #004124, barras #74C69D (fondos claros)
    m3tric-logo-reverse.svg — cuerpo #B7E3C7, barras #74C69D (fondos #004124)
    m3tric-logo-mono-dark.svg / m3tric-logo-mono-light.svg
    m3tric-mark.svg         — tres barras sobre cuadrado #004124 (favicon; pendiente de validación de marca)
  motifs/triple-bar.svg     — proporciones exactas de las barras del "3" (64.49 · 64.49 · 91.7 × 23.52, gap 14.26)
  images/aerial-wide-1280.webp, aerial-tall-747.webp, globe-1000.webp — fotografía del manual sin texto incrustado
  fonts/README.md           — slot de DIN 2014 Rounded (nombres de archivo esperados, pesos, procedimiento) — sin archivos
```

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
- **Tipografía:** `@fontsource/barlow` 300/400/500/700/800 (latin) importado en `main.tsx` **después** de `maplibre-gl.css` y antes de `index.css`; `fontFamily.sans = ["DIN 2014 Rounded", "Barlow", "system-ui", "sans-serif"]`; `mono` = pila de sistema; se eliminan `preconnect` y `<link>` de Google Fonts en `index.html`. Escala: títulos de página 28–36 px / 800; secciones 20–22 / 700; cuerpo 15–16 / 400; meta 12–13.
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

## 6. Tipografía DIN 2014 Rounded (REQ-U04) — fase condicionada a licencia

Hechos: familia de Paratype (2021), seis pesos y versión variable; licencia web en Fontspring (perpetua, autohospedable) o MyFonts (familia desde USD 149; estilos sueltos desde USD 36); Adobe Fonts la ofrece solo vía script de Adobe (descartado, DEC-54). No existe copia licenciada en los equipos ni en los repos.

Diseño listo para ejecutar cuando se compre la licencia (no se despliega antes):
1. **Bucket privado de fuentes** (BPA, SSE-S3, OAC) creado por `m3tric-staging-LandingSiteStack` con nombre generado por CloudFormation (prefijo `m3tric-staging-landingsitestack-*`, el único que el rol de ejecución acotado puede administrar); política de bucket con `AWS:SourceArn` de **ambas** distribuciones (landing `E1J2L9XZIAGQ7M`, plataforma `E3LBUHUINTWS0F`).
2. Comportamiento `/fonts/*` en las dos distribuciones hacia ese bucket (landing: `infra/`; plataforma: `PlatformPreviewStack`, por su ceremonia).
3. Una persona sube `DIN2014Rounded-Variable.woff2` (o los pesos 300/400/500/700/800, los mismos que usa Barlow hoy) a `s3://…/din-2014-rounded/`.
4. `@font-face "DIN 2014 Rounded"` con `src: url(/fonts/din-2014-rounded/…)` y `font-display: swap`, emitido **solo** cuando `NEXT_PUBLIC_BRAND_FONT=din` (landing) / `VITE_BRAND_FONT=din` (plataforma), para que ningún build cite un archivo inexistente (el capturador de rollback de la plataforma exige que todo recurso citado responda 200). La pila `"DIN 2014 Rounded", Barlow, system-ui` ya está en ambos: sin la fuente cae en Barlow sin cambios de código.
5. Smoke: `/fonts/din-2014-rounded/*.woff2` → 200 `font/woff2`; fuente computada del `h1` = «DIN 2014 Rounded».

Costo: < USD 1/mes. Decisión del owner: comprar la licencia (recomendado: Fontspring, familia o variable) o quedarse con Barlow.

---

## 7. Landing — cambios

1. `brand/` (§3) + `scripts/brand-kit.test.mjs` + `npm run brand:build`.
2. `docs/SPEC.md` §3.3: estado de la tipografía (DEC-54) y referencia al kit; `docs/adr/ADR-008` (kit compartido), `ADR-009` (español único en plataforma), `ADR-010` (DIN: licencia y servicio desde bucket privado); `docs/TRACEABILITY.md`: filas REQ-U01..U05; `CHANGELOG.md` 3.2.0.
3. Sin cambios visuales en la landing.

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

Restricciones conocidas: orden de imports `maplibre-gl.css` → `index.css` en `main.tsx` es **load-bearing** (no mover); el capturador de rollback exige que todo `*.svg`/`*.json` citado por el JS servido exista; no se tocan backend, API ni auth.

---

## 9. Pruebas y evidencia

| Capa | Landing | Plataforma |
|---|---|---|
| Unitarias | `test:unit` (+ `brand-kit.test.mjs`) | `npm test` (≈810 + `brand.test.ts` + `spanish-ui.test.ts` + `contrast.test.ts` actualizada) |
| Estáticas | lint, typecheck, hygiene | `npm run lint`, `tsc -b`, hygiene del repo |
| Build | `npm run release` | `npm run build` (dist) |
| Rendimiento | — (sin cambios) | `npm run perf:budget` local: LCP < 2000 ms en `/login` y `/map`, antes y después |
| En vivo (post-deploy) | `npm run test:live` (sin cambios) | Script Playwright (desde el repo de la landing) con usuario temporal de Cognito: 0 errores de consola, 0 violaciones CSP, 0 orígenes de terceros, fuente computada = Barlow, `lang=es-CO`, título, 0 palabras inglesas de la lista en la navegación y páginas principales, axe sin violaciones serias/críticas, capturas 1440/390 de login, inicio, mapa, sensores, en vivo, ajustes |
| Evidencia | `docs/evidence/platform-brand/{before,after}/`, informes en `docs/evidence/platform-brand/QA-REPORT.md` | enlace desde `26-identidad-compartida.md` |

---

## 10. Despliegue

- **Landing:** PR → CI → merge → `Deploy staging` (sin cambios visuales; publica el kit y la documentación).
- **Plataforma:** PR (CI: «Plataforma web — compilación, lint y pruebas», «Qué cambió», «Repository hygiene») → merge → ceremonia: plan manual sobre el SHA de `main` → verificación de checksums → publicación de assets faltantes → change set (0 reemplazos; solo frontend, `ReleaseId`, deployment de API) → ejecución → smoke en vivo (§9). Rollback: change set con la plantilla anterior (bundle previo capturado por el plan).

---

## 11. Trazabilidad (resumen; detalle en `docs/TRACEABILITY.md` y `26-identidad-compartida.md`)

| REQ | Implementación | Verificación | Evidencia | Estado (2026-10-02) |
|---|---|---|---|---|
| U01 | `brand/`, `tailwind.config.js`, `index.css`, componentes | `brand.test.ts`, `contrast.test.ts`, capturas | `docs/evidence/platform-brand/QA-REPORT.md` §4.1, §4.3, §4.6, §4.7 y §5; `after/` frente a `before/`. Falta la aceptación explícita del owner de la apariencia de la plataforma desplegada (§12) | Parcial |
| U02 | `BrandLogo.tsx`, `MainLayout`, `LoginPage`, `.live-brand` | `brand.test.ts` (paths = kit), capturas, smoke (`role="img"` M3TRIC) | QA-REPORT §4.1 (V07), §4.3; `after/login-*.webp`. Favicon derivado: validación de marca pendiente (n.º 5) | Parcial |
| U03 | §5 | `spanish-ui.test.ts`, pruebas actualizadas, smoke (`lang`, scan de inglés) | QA-REPORT §4.1 (V01, V02, V10, V11) y §5. Pendientes del owner: confirmar DEC-56 y aprobar el copy del inicio de sesión (§12) | Parcial |
| U04 | Barlow en ambos; slot DIN (§6) | smoke (fuente computada; sin terceros) | QA-REPORT §4.1 (V03 a V06) y §4.2 (V13); licencia = dependencia del owner | Parcial |
| U05 | esta spec, ADR-008..010, DEC-53..63, matriz | revisión | ambos repos; `docs/TRACEABILITY.md` §7. El Tech Lead revisó la documentación de ambos el 2026-10-02; no incluye la revisión independiente | Verificado |

Criterio y condiciones de cada estado: `docs/TRACEABILITY.md` §6.2, §6.3 y §7. Un requisito con un componente subjetivo (copy, marca, apariencia) queda Parcial hasta la aprobación que le falta.

---

## 12. Dependencias del owner
1. Licencia web de DIN 2014 Rounded (compra) → activa §6. 2. Confirmar «M3TRIC \| Plataforma» como nombre en español de la pestaña (DEC-56). 3. Aprobación del copy en español del inicio de sesión. 4. Validación de marca del favicon (ya pendiente). 5. Aceptación explícita de la apariencia de la plataforma desplegada, tras revisarla (REQ-U01).

## 13. Unidades de trabajo y orden
U1 kit en la landing (sonnet) ‖ U3 español en la plataforma (sonnet) → U2 restyle + logo + fuente en la plataforma (sonnet, sobre U1) → gate visual del Tech Lead → U4 QA local (vitest, lint, build, perf) → PRs + merges → despliegues (landing GHA; plataforma ceremonia) → U4 QA en vivo → U5 docs/trazabilidad en ambos repos.

---

## 14. Resultado (2026-10-02)

Cierre del programa. El estado de cada requisito está en §11 y en `docs/TRACEABILITY.md` §7: REQ-U05 es Verificado; REQ-U01 a U04 quedan en Parcial porque cada uno espera una aprobación del owner, la validación de marca del cliente o la licencia de DIN 2014 Rounded (lista al final de esta sección). Lo medido sobre la plataforma proviene de la QA en vivo contra el despliegue real (`docs/evidence/platform-brand/QA-REPORT.md`; `docs/evidence/platform-brand/README.md` explica la evidencia). Las cifras de PR, plan, change set, stack, humo HTTP y totales de pruebas las verificó el Tech Lead el 2026-10-02 contra GitHub y AWS y no tienen salida cruda archivada en este repositorio.

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

1. **Pesos de Barlow.** La plataforma carga cinco (300, 400, 500, 700 y 800), no cuatro; §4.2 se corrigió en la versión 1.2. ADR-010 todavía dice «400/500/700/800» para la plataforma.
2. **CSP.** DEC-54 y ADR-010 citan `font-src 'self'`. La landing lo tiene; la plataforma no envía Content-Security-Policy (QA-06), así que «sin tipografía externa» se verificó por red y escaneo estático, no por política.
3. **Tipo MIME de las fuentes.** Los `woff2` de la plataforma se sirven como `binary/octet-stream`; el smoke de DIN de §6 (punto 5) exige `font/woff2`.
4. **Objetivos táctiles.** §4.2 y §4.3 piden 44 px como mínimo; se observó que `btn-ghost` y `live-window-selector` quedan por debajo (observación del Tech Lead; adenda a DEC-62 en la plataforma).
5. **CSS muerto.** §4.2 prohíbe degradados y vidrio y en ejecución se cumple (0 elementos), pero el CSS publicado conserva utilidades de degradado y de `backdrop-filter` sin uso, nacidas de cadenas de prueba que Tailwind escanea (QA-08).
6. **Arnés de la QA.** §9 prevé un script de Playwright; fue temporal y no se archivó (`QA-REPORT.md` §9). Se archivan sus datos crudos y su método; el seguimiento n.º 10 propone archivar un arnés repetible.

### 14.6 Seguimientos

| # | Seguimiento | Propietario | Origen |
|---|---|---|---|
| 1 | Servir los `woff2` con `content-type: font/woff2` | Plataforma | Humo HTTP; §14.5, punto 3 |
| 2 | Excluir `*.test.*` del `content` de Tailwind para eliminar el CSS muerto de degradado y vidrio | Plataforma | QA-08 |
| 3 | Enviar una CSP desde la política de cabeceras de CloudFront de la plataforma | Plataforma | QA-06 |
| 4 | Carga diferida (lazy-load) de ECharts | Plataforma | AT-UX-3 |
| 5 | Panel «Capas de imagen» del mapa como hoja inferior con botón de cierre por debajo de unos 1200 px | Plataforma | QA-01 |
| 6 | Nombre accesible para los contenedores de ECharts con `role="img"` | Plataforma | QA-03 |
| 7 | Nombres de lote visibles en «Lotes existentes» | Plataforma | QA-04 |
| 8 | Capacidad de `live-api` y `live-trend` (concurrencia reservada 2, Lambda de 10 s, ráfaga de 5 en el stage) | Plataforma (infraestructura) | QA-02 |
| 9 | Objetivos táctiles de `btn-ghost` y `live-window-selector` a 44 px | Plataforma | §14.5, punto 4 |
| 10 | Archivar un arnés repetible de la QA en vivo (Playwright) en el repositorio de la plataforma | Plataforma | §14.5, punto 6; `QA-REPORT.md` §9 |

Pendientes del Owner y del Cliente (no son seguimientos técnicos; cada uno mantiene en Parcial el requisito indicado): aceptación explícita de la apariencia de la plataforma desplegada tras una revisión visual (REQ-U01, §12); validación de marca del favicon (REQ-U02, dependencia n.º 5); confirmar el título «M3TRIC \| Plataforma» (DEC-56) y aprobar el copy en español del inicio de sesión (REQ-U03, §12); licencia web de DIN 2014 Rounded (REQ-U04, §6 y ADR-010); vector oficial de la Universidad EAFIT y confirmación de su oficina de marca (REQ-O07, ADR-011).
