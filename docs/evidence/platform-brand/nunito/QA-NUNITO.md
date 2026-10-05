# QA en vivo de la plataforma M3TRIC tras el cambio de tipografía a Nunito

Fecha: 2026-10-05. Ejecuta: QA en vivo de la tipografía. Alcance: solo lectura sobre el despliegue; las únicas escrituras en AWS fueron crear y borrar usuarios temporales de Cognito (uno por visita: secciones 8 y 10.5). Lo medido es del despliegue real; lo emulado (la tipografía anterior) o sintético (series de `/live`, retención de la fuente) se rotula como tal. Evidencia en esta carpeta; datos crudos y consolidados en `findings.json`.

**Actualización posterior (2026-10-05, release 66acab7):** NU-01 y NU-02 se corrigieron y se re-verificaron en vivo; ver la sección 10. Las secciones 1 a 9 describen la release 57681b2 tal como se midió.

## 1. Resumen

**Nunito es la fuente que de verdad se pinta, en el DOM y en los gráficos.** En los 34 estados medidos (login, las rutas del shell y de `/live`, el tutorial, los seis cajones y el detalle de dispositivo, a 1440 y a 390 px) `document.fonts` solo trae «Nunito Variable» 200 1000 con la cara `latin` cargada; cada carga de página pide un único archivo, `/assets/nunito-latin-wght-normal-BzFMHfZw.woff2`, del propio origen y byte a byte igual al del paquete `@fontsource-variable/nunito` 5.3.0; los únicos hosts distintos del propio son AWS Location, Cognito y el bucket de capas. CDP (`CSS.getPlatformFontsForNode`) da `isCustomFont: true` e instancia `Nunito-*` (en `postScriptName`; `familyName` es siempre «Nunito ExtraLight», NU-03) en el encabezado, la navegación, los botones, los KPI y el placeholder, y `font-semibold` se pinta `Nunito-SemiBold`. De 28.158 glifos de texto del DOM, 27.364 (97,18 %) están en Nunito; los otros 794 son la atribución de MapLibre (264, `Helvetica Neue` de la CSS de la biblioteca) y el texto monoespaciado intencional (530, `Menlo`). Los tres gráficos de ECharts se pintan en Nunito: 0 píxeles de diferencia frente a la misma opción forzada a Nunito, y de 62 a 4.383 frente a `sans-serif` y `system-ui`, tanto con la fuente ya cargada (camino cálido) como con caché vacía (frío).

**La cara más ancha rompió una vista.** Nunito es en mediana un 4,7 % más ancha que Barlow (p90 +10,3 %, máximo +20,2 %; 791 textos de una línea medidos sobre el mismo despliegue). En 30 de los 34 estados eso no cambia nada que importe: ningún desborde horizontal, ninguna etiqueta de navegación en dos líneas, el cajón de 390 px abre y cierra en las seis rutas, y como mucho el texto ocupa una línea más (hasta +64 px de alto de página). En los cuatro estados de **`/map` con la escala Meso** sí: a 1440×900 las tres «Editar límites» pasan a dos líneas, la columna izquierda gana 48 px y el panel recorta 50 px de «Capas de imagen», contra 0 px con Barlow emulada (con la lista de sensores abierta, de 26 a 74 px). Es **NU-01 (media)**, una regresión introducida por la tipografía sobre un diseño que ya estaba al límite (QA-05 y QA-04).

**Un defecto latente en los gráficos (NU-02, baja).** El gráfico de tendencia de Inicio no se repinta cuando llega la fuente. Con la fuente retenida 5 s y la tendencia servida al instante, el gráfico se pintó a los 1.091 ms con la fuente aún sin lista, no se volvió a pintar cuando la fuente se liberó a los 5.726 ms y quedó en `system-ui` (4.383 píxeles de diferencia frente a Nunito). Hoy no se ve porque `/api/live/trend` tarda 16,4 a 16,6 s (NU-06) y el gráfico se pinta mucho después de la fuente; el detalle de `/live` se repinta cada segundo y se corrige solo.

Cifras de la parte que sale bien:

| Verificación | Resultado |
|---|---|
| `document.fonts` | 34/34 estados: única familia «Nunito Variable» 200 1000, cargada solo `latin`; 0 caras de otra familia |
| Peticiones de fuente | 18/18 cargas de página: 1 petición al `.woff2` propio, HTTP 200, 39.128 bytes; 0 a Google |
| Archivo servido | SHA-256 `ba344451eab25b21…`, idéntico al del paquete 5.3.0 |
| CDP: encabezado, navegación, botón, KPI, placeholder, `font-semibold` | 28, 17, 30, 20, 4 y 20 estados, todos `isCustomFont: true` y `Nunito-*`; `font-semibold` = 600 → `Nunito-SemiBold` en 20/20 |
| Censo CDP | 1.338 nodos de texto, 28.158 glifos: 97,18 % Nunito; el resto, explicado al 100 %; pesos computados frente a pintados: 0 discrepancias en 6 pesos |
| Gráficos (3) | 0 px frente a Nunito en cálido y frío; con series sintéticas (leyenda y marcas de eje) 0 px frente a Nunito y 10.657 a 10.736 frente a `sans-serif`; tooltip en Nunito |
| Desborde horizontal, etiquetas de navegación en dos líneas | 0 de 34 estados con desborde de contenido; 113 etiquetas medidas, ninguna en dos líneas (ocupación máxima del ancho útil 0,55 en la barra lateral y 0,49 en el cajón) |
| Cajón de 390 px | 6/6 rutas correctas (abre, cierra con botón y con Escape, devuelve el foco, bloquea el desplazamiento) |
| Errores de consola, `pageerror`, peticiones fallidas, HTTP ≥ 400, 503 de `/api/live/*` | 0, 0, 0, 0 y 0 |
| Cambios de diseño frente a Barlow emulada | 1 regresión (NU-01), 3 defectos previos agravados (todos `/map` Meso), 14 estados con reflujo sin recorte, 16 sin diferencias que importen |

## 2. Entorno y release

| Elemento | Valor |
|---|---|
| URL | https://d3pz2gipvkcx1b.cloudfront.net (distribución E3LBUHUINTWS0F, estado Deployed, modificada 2026-10-05T17:03:26Z) |
| Stack | `m3tric-staging-PlatformPreviewStack`, UPDATE_COMPLETE, última actualización 2026-10-05T17:02:36Z |
| Release | `platform-live-57681b216098fc5fc0c90ad83a8bb337b2bb4d11` (salida `ReleaseId` del stack; `GitSha` `57681b2…`) |
| Artefactos servidos | `index.html` (last-modified 17:04:10 GMT), `/assets/index-CM7aqOCU.js`, `/assets/index-D4EmbbLo.css`, `/assets/nunito-latin-wght-normal-BzFMHfZw.woff2` y cuatro subconjuntos más declarados por `@font-face` y no descargados (`cyrillic-ext`, `cyrillic`, `vietnamese`, `latin-ext`) |
| Tipografía | `@fontsource-variable/nunito` 5.3.0 (SIL OFL 1.1): 5 `@font-face` «Nunito Variable», peso 200 1000, `unicode-range`; la pila del `body` es `"Nunito Variable", Nunito, system-ui, sans-serif` |
| Lambdas (solo lectura) | `live-api` y `live-trend` modificadas 17:03:13Z (mismo `CodeSha256`); concurrencia reservada 2 en ambas; tiempo máximo 10 s y 20 s |
| Navegador | Chromium 153.0.8010.12 (headless), Playwright 1.63.0, macOS (Darwin 27.0.0, arm64), locale es-CO, zona America/Bogota |
| Viewports | 1440×900 y 390×844, escala 1 (agente de escritorio con viewport de 390, sin emulación táctil, como en QA-REPORT); gráficos a escala 2 |
| Usuario | `smoke-qa-nunito-1791223529`, grupo `admin`, creado 18:05:29Z y eliminado 18:56:19Z (sección 8) |
| Cuenta AWS | 147997127433, us-east-2 |
| Corridas (las que dan los datos; UTC) | principal 1440 18:33:02–18:33:59; principal 390 18:34:00–18:35:05; control Barlow 1440 18:35:10–18:36:06; control Barlow 390 18:36:07–18:37:13; gráficos 18:41:33–18:42:29; estrés 18:50:35–18:51:25 |

## 3. Método

Reutilicé el método de QA-REPORT §3 (un Chromium, rutas en secuencia, gestos reales, Playwright sin `force`) y amplié `live-font-check.mjs` (familias computadas, `document.fonts`, peticiones de fuente, hosts, desborde).

- **Pasadas.** Un solo navegador a la vez; un contexto por ancho, cerrado antes del siguiente. En las pasadas principales la caché HTTP va desactivada por CDP (`Network.setCacheDisabled`): cada carga pide todos los archivos y la lista de peticiones de fuente es completa. Cada ruta se mide tras `networkidle` (máximo 20 s), `document.fonts.ready` y 1,5 s. Los estados que son un cambio de estado en el mismo documento (escala Meso, listas, tutorial, cajón y el detalle de dispositivo) no piden fuentes y se marcan `navigated: false`.
- **Gestos.** Login por la interfaz (`fill` y clic); tutorial cerrado con «Cerrar tutorial» antes de medir `/sensors`; escala Meso con clic real en «Meso»; lista «Sensores en el mapa» con clic en su resumen; tarjeta del dispositivo con clic; cajón con «Abrir menú», «Cerrar menú» y Escape. No se pulsó ningún botón de escritura («Empezar», «Guardar prefijo», «+ Nuevo lote», «Subir imagen», «Eliminar…»).
- **Tipografía (DOM).** Por estado: `document.fonts` (familia, peso, estado, subconjunto por `unicode-range`), peticiones y respuestas de tipo `font`, hosts de todas las peticiones, y CDP `CSS.getPlatformFontsForNode` sobre seis elementos (encabezado, etiqueta de navegación, botón, celda o KPI, placeholder —también sobre el `div` del shadow DOM de usuario que lo pinta— y un `.font-semibold`) y, además, sobre **todos** los nodos de texto del documento (el censo), uniendo cada nodo con el peso computado de su elemento. Un nodo sin caja (`display:none`) no cuenta.
- **Controles de la sonda.** En `/login`: «Nunito» sin «Variable» resuelve a `Times` (no hay Nunito instalada que pueda enmascarar un fallo de la web font), `sans-serif` a `Helvetica`, `system-ui` a `.SF NS` y «Nunito Variable» a `Nunito-Regular` con `isCustomFont: true`; el archivo servido se comparó con el del paquete por SHA-256.
- **Gráficos.** Un gancho instalado antes de cualquier script registra cada `fillText` de un canvas de ECharts con su `ctx.font` y `document.fonts.check(font, texto)` en ese instante. La instancia se obtiene por el componente `echarts-for-react` (React fiber) porque `window.echarts` no existe. Diferencial de píxeles, síncrono para que ningún repintado de React se interponga: leo el canvas tal como está pintado y lo repinto con `setOption({textStyle:{fontFamily}})` forzado a Nunito, `sans-serif` y `system-ui`; la opción original se restaura y se comprueba que los píxeles vuelven a ser los mismos. Recorte del contenedor a escala 2 y, en la misma página, un `div` con las etiquetas del gráfico en «Nunito Variable» 12 px junto a otro en `sans-serif` 12 px. Dos caminos: cálido (login por la interfaz, navegación SPA, caché activa) y frío (contexto nuevo con la sesión restaurada, caché vacía y desactivada, URL directa).
- **Gráficos sin datos.** Los dos dispositivos están «Callado» y las gráficas de `/live` solo dibujan «°»; para ver leyenda y marcas de eje inyecté dos series sintéticas en la instancia real (opción, ejes y manejo de fuente reales; datos inventados, solo en la página, restauradas después).
- **Prueba de estrés.** Retiene el `.woff2` 5 s (Inicio) o 14 s (`/live`) con `page.route` y repite una respuesta de `/api/live/trend` capturada en una primera visita (la real tarda 16 s); compara una huella del canvas antes y después de que llegue la fuente.
- **Diseño.** Desborde: elementos visibles con `scrollWidth > clientWidth + 1` y `overflow-x` distinto de `auto`/`scroll` (los contenedores de desplazamiento intencionales se excluyen y se cuentan; se excluyen `svg`, canvas y los contenedores de MapLibre y ECharts). Etiquetas de navegación: líneas de cada enlace (rectángulos de línea de sus nodos de texto) y alto del texto entre el `line-height`. Botones: `button`, `[role=button]`, `summary`, `input` de botón y `a.btn*` de menos de 44 px. Recorte: `overflow-y` `hidden`/`clip` con `scrollHeight > clientHeight + 2`, listando qué hijos quedan bajo el borde. Controles tapados: `elementFromPoint` en el centro de cada control visible; si el centro cae fuera de un ancestro que se desplaza, se cuenta aparte (alcanzable); si cae fuera de un ancestro con `overflow:hidden`, «recortado»; si lo ocupa otro elemento, «tapado».
- **Control (la tipografía anterior).** Misma secuencia, mismo usuario, minutos después, con `@fontsource/barlow` 5.3.0 (300/400/500/700/800, `latin`) superpuesta por `@font-face` con data URL y `font-family` en `html, body` con `!important`: solo cambia la tipografía (mismo DOM, CSS y datos). Comprobé que el control pinta Barlow y no Nunito: 27.405 glifos `Barlow-*`, 0 `Nunito-*`. Reproduce el valor de QA-05 (26 px cortados con la lista abierta frente a los 25 px de QA-05). Por cada elemento con texto compara las líneas de su texto propio, el ancho del texto y la altura de la página.
- **Red y consola.** Por estado: errores y avisos de consola, `pageerror`, `requestfailed`, respuestas ≥ 400 (los 503 de `/api/live/*` se apartan), hosts y tiempos de `/api/*`. Las URL se guardan sin cadena de consulta (la de AWS Location lleva la clave del mapa).

**Correcciones a mi propio arnés.** Descarté las corridas de depuración y la evidencia sale de la última de cada pasada. Antes de aceptar los números contrasté los datos crudos y corregí errores míos, no de la plataforma: (1) un KPI que además era `font-semibold` pisaba el marcador del elemento y rompía dos estados; (2) la medición del tutorial tomó el contenedor oculto del cajón (`div#app-drawer[role=dialog]` va primero en el DOM) y no veía sus botones; (3) la prueba de controles tapados contaba como tapados los elementos desplazados dentro de una lista y el `input` oculto de la subida; (4) la heurística de «botón con la etiqueta en dos líneas» marcaba tarjetas de varias líneas por diseño; (5) el registro de textos del canvas agrupaba los de todos los gráficos y mi propio diferencial lo contaminaba; (6) la primera prueba de estrés leyó «unloaded» como «loaded» y midió antes de que llegara la fuente; (7) el criterio del encargo «`familyName` = `Nunito-*`» no es lo que informa CDP (NU-03). Los avisos de consola «Multiple readback operations using getImageData» los provoca mi sonda y se cuentan aparte.

## 4. Resultados

### 4.1 Resumen por página y ancho

«Fuente OK» exige que se cumplan todas las comprobaciones tipográficas del estado (`document.fonts`, peticiones y hosts, CDP por elemento, `font-semibold`, censo y pesos; sección 4.2). «Diseño» compara con la tipografía anterior emulada: **OK** (sin hallazgos), **OK con reflujo** (más líneas o más alto de página, sin desborde, recorte ni etiqueta de navegación en dos líneas), **Defecto previo agravado** o **REGRESIÓN**. Cada fila agrupa los estados de su página (la de Sensores incluye el tutorial); los estados con la lista de sensores del mapa abierta se detallan en 4.4 y los seis cajones tienen su propia fila.

| Página | Ancho | Fuente OK | Diseño | Notas |
|---|---|---|---|---|
| Login (antes de autenticar) | 1440 | OK | OK |  |
| Login (antes de autenticar) | 390 | OK | OK |  |
| Inicio (/ → /dashboard) | 1440 | OK | OK con reflujo | gráfico de tendencia en Nunito; la página mide 1 px más (1.409 → 1.410) |
| Inicio (/ → /dashboard) | 390 | OK | OK con reflujo | +18 px: «Datos parciales: la ventana de 7 días…» pasa de 1 a 2 líneas |
| Mapa · Micro | 1440 | OK | OK | sin diferencias; con la lista abierta tampoco |
| Mapa · Micro | 390 | OK | OK | sin diferencias con la lista cerrada |
| Mapa · Meso | 1440 | OK | **REGRESIÓN** | **NU-01**: «Editar límites» ×3 en 2 líneas (88,8×40 px frente a 91×24); el panel recorta 50 px (Barlow: 0); con la lista abierta 74 px (Barlow: 26, QA-05) |
| Mapa · Meso | 390 | OK | **Defecto previo agravado** | QA-01 persiste: 15 controles tapados (18 con Barlow); recorte 136 px (88); el selector Micro/Meso/Macro queda 131 px bajo el panel (83) |
| Sensores (tutorial y página) | 1440 | OK | OK con reflujo | +4 px de alto de página |
| Sensores (tutorial y página) | 390 | OK | OK con reflujo | +24 px de alto de página |
| Análisis · lista (/live) | 1440 | OK | OK |  |
| Análisis · lista (/live) | 390 | OK | OK |  |
| Análisis · detalle de dispositivo | 1440 | OK | OK con reflujo | +16 px (una línea más en «Una sola trama de inclinometría…»); h1 en 2 líneas (QA-12, igual con Barlow) |
| Análisis · detalle de dispositivo | 390 | OK | OK |  |
| Alertas | 1440 | OK | OK |  |
| Alertas | 390 | OK | OK |  |
| Reportes (extra) | 1440 | OK | OK |  |
| Reportes (extra) | 390 | OK | OK |  |
| Configuración (extra) | 1440 | OK | OK |  |
| Configuración (extra) | 390 | OK | OK |  |
| /live/raw (extra) | 1440 | OK | OK |  |
| /live/raw (extra) | 390 | OK | OK con reflujo | +64 px: el h1 «Telemetría recibida en AWS» y un párrafo ganan una línea |
| Cajón de navegación (6 rutas del shell) | 390 | OK | OK con reflujo | 6/6: abre, cierra, Escape, foco; «Rol: Administrador…» pasa de 2 a 3 líneas |

### 4.2 Tipografía en el DOM

| # | Verificación | Esperado | Observado | Veredicto |
|---|---|---|---|---|
| F01 | document.fonts | solo «Nunito Variable» 200 1000, al menos una cara en estado loaded | 34/34 estados con la única familia «Nunito Variable» 200 1000 (5 caras declaradas: cyrillic-ext, cyrillic, vietnamese, latin-ext, latin); en 34/34 la única cargada es latin; ninguna cara de otra familia | PASS |
| F02 | Peticiones de archivos de fuente | solo /assets/nunito-*.woff2 del mismo origen | 18/18 cargas de página con exactamente 1 petición, /assets/nunito-latin-wght-normal-BzFMHfZw.woff2, mismo origen, HTTP 200, 39.128 bytes; los 16 estados que son cambios de estado en el mismo documento (escala Meso, listas, tutorial, cajón, detalle de dispositivo) no piden fuentes | PASS |
| F03 | Hosts de terceros | solo AWS Location, Cognito y el bucket de capas | 42 peticiones a maps.geo.us-east-2.amazonaws.com, 2 a cognito-idp.us-east-2.amazonaws.com (envío del login, 1 por ancho), 2 al bucket de capas (escala Meso); 296 al propio origen; 0 hosts no esperados (0 a Google) | PASS |
| F04 | Identidad del archivo servido | el woff2 servido es el del paquete @fontsource-variable/nunito 5.3.0 | SHA-256 ba344451eab25b21… idéntico byte a byte a files/nunito-latin-wght-normal.woff2 del paquete (39.128 bytes) | PASS |
| F05 | CDP getPlatformFontsForNode: Encabezado (h1 o primer encabezado) | isCustomFont true e instancia Nunito-* (en postScriptName; familyName es «Nunito ExtraLight», NU-03) | encontrado en 28 estados; 28/28 con isCustomFont true y Nunito; postScriptName: Nunito-ExtraBold ×24, Nunito-Bold ×4 | PASS |
| F06 | CDP getPlatformFontsForNode: Etiqueta de navegación | isCustomFont true e instancia Nunito-* (en postScriptName; familyName es «Nunito ExtraLight», NU-03) | encontrado en 17 estados; 17/17 con isCustomFont true y Nunito; postScriptName: Nunito-Bold ×3, Nunito-Medium ×14 | PASS |
| F07 | CDP getPlatformFontsForNode: Botón | isCustomFont true e instancia Nunito-* (en postScriptName; familyName es «Nunito ExtraLight», NU-03) | encontrado en 30 estados; 30/30 con isCustomFont true y Nunito; postScriptName: Nunito-Bold ×22, Nunito-SemiBold ×8 | PASS |
| F08 | CDP getPlatformFontsForNode: Celda de tabla o valor KPI (o el texto numérico mayor) | isCustomFont true e instancia Nunito-* (en postScriptName; familyName es «Nunito ExtraLight», NU-03) | encontrado en 20 estados; 20/20 con isCustomFont true y Nunito; postScriptName: Nunito-SemiBold ×16, Nunito-Regular ×2, Nunito-Medium ×2 | PASS |
| F09 | CDP getPlatformFontsForNode: Placeholder de input | isCustomFont true e instancia Nunito-* (en postScriptName; familyName es «Nunito ExtraLight», NU-03) | encontrado en 4 estados; 4/4 con isCustomFont true y Nunito; postScriptName: Nunito-Regular ×4; también sobre el div del shadow DOM de usuario que pinta el placeholder: 4/4 | PASS |
| F10 | font-semibold | peso computado 600, pintado Nunito-SemiBold | 20/20 estados con un elemento .font-semibold: peso computado «600» y postScriptName «Nunito-SemiBold» (isCustomFont true) | PASS |
| F11 | Censo CDP de todos los nodos de texto | todo el texto en Nunito salvo excepciones documentadas | 34 estados, 1.338 nodos de texto con caja, 28.158 glifos: 27.364 en Nunito (97,18 %); los 794 restantes son 264 de la atribución de MapLibre (Helvetica Neue, CSS de la biblioteca) y 530 de `font-mono` (Menlo); sin explicar: 0; sobre el texto sin esas dos excepciones: 100,00 % | PASS |
| F12 | Peso computado frente a peso pintado | cada peso CSS se pinta con su instancia (400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold) | 6 pesos (300, 400, 500, 600, 700, 800); glifos con instancia distinta de la esperada: 0 | PASS |
| F13 | Controles de la sonda | sin «Nunito» instalada en el sistema; la sonda distingue web font de fuentes del sistema | «Nunito» sin Variable resuelve a Times (isCustomFont false); sans-serif a Helvetica; system-ui a .SF NS; «Nunito Variable» a Nunito-Regular (isCustomFont true) | PASS |
| F14 | Nota de método: familyName | familyName «Nunito-*» (según el encargo) | familyName es «Nunito ExtraLight» en todos los pesos (nombre de la instancia por defecto del archivo variable); el peso lo da postScriptName (Nunito-Regular, -Medium, -SemiBold, -Bold, -ExtraBold, -Light) | INFO |

`familyName` de CDP es «Nunito ExtraLight» en todos los pesos (la instancia por defecto del archivo variable); el peso que de verdad se pinta lo da `postScriptName`, que es lo que muestran las tablas siguientes (NU-03).

**Fuente pintada por elemento** (`postScriptName` sin el prefijo `Nunito-`; en todas las celdas `isCustomFont` es `true`, y una fuente que no fuera Nunito se marcaría «[NO Nunito]»; — = el estado no tiene ese elemento). En los estados de 390 px la navegación solo existe en el cajón; el placeholder solo existe en `/sensors` y `/settings`.

| Estado | Encabezado | Navegación | Botón | Celda o KPI | Placeholder | `font-semibold` (peso computado → pintado) |
|---|---|---|---|---|---|---|
| `login-1440` | ExtraBold | — | Bold | — | — | — |
| `dashboard-1440` | ExtraBold | Bold | Bold | SemiBold | — | 600 → SemiBold |
| `map-micro-1440` | ExtraBold | Medium | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-meso-1440` | ExtraBold | Medium | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-meso-1440-lista` | ExtraBold | Medium | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-micro-1440-lista` | ExtraBold | Medium | SemiBold | SemiBold | — | 600 → SemiBold |
| `sensors-tutorial-1440` | Bold | — | Bold | — | — | — |
| `sensors-1440` | ExtraBold | Medium | Bold | SemiBold | Regular | 600 → SemiBold |
| `alerts-1440` | ExtraBold | Medium | Bold | — | — | — |
| `reports-1440` | ExtraBold | Medium | Bold | — | — | — |
| `settings-1440` | ExtraBold | Medium | Bold | Regular | Regular | 600 → SemiBold |
| `live-1440` | ExtraBold | — | Bold | SemiBold | — | 600 → SemiBold |
| `live-device-1440` | ExtraBold | Medium | Bold | Medium | — | 600 → SemiBold |
| `live-raw-1440` | Bold | — | — | SemiBold | — | 600 → SemiBold |
| `login-390` | ExtraBold | — | Bold | — | — | — |
| `dashboard-390` | ExtraBold | — | Bold | SemiBold | — | 600 → SemiBold |
| `dashboard-390-drawer` | — | Bold | Bold | — | — | — |
| `map-micro-390` | ExtraBold | — | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-meso-390` | ExtraBold | — | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-meso-390-lista` | ExtraBold | — | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-micro-390-lista` | ExtraBold | — | SemiBold | SemiBold | — | 600 → SemiBold |
| `map-390-drawer` | — | Medium | Bold | — | — | — |
| `sensors-tutorial-390` | Bold | — | Bold | — | — | — |
| `sensors-390` | ExtraBold | — | Bold | SemiBold | Regular | 600 → SemiBold |
| `sensors-390-drawer` | — | Medium | Bold | — | — | — |
| `alerts-390` | ExtraBold | — | — | — | — | — |
| `alerts-390-drawer` | — | Medium | Bold | — | — | — |
| `reports-390` | ExtraBold | — | — | — | — | — |
| `reports-390-drawer` | — | Medium | Bold | — | — | — |
| `settings-390` | ExtraBold | — | Bold | Regular | Regular | 600 → SemiBold |
| `settings-390-drawer` | — | Medium | Bold | — | — | — |
| `live-390` | ExtraBold | — | Bold | SemiBold | — | 600 → SemiBold |
| `live-device-390` | ExtraBold | Bold | Bold | Medium | — | 600 → SemiBold |
| `live-raw-390` | Bold | — | — | SemiBold | — | 600 → SemiBold |

**Censo de todos los nodos de texto.** Excepciones: «MapLibre» = atribución del mapa (`Helvetica Neue`, CSS de la biblioteca); «mono» = `font-mono` (`Menlo`: topics MQTT y `code`). Ninguna excepción está sin explicar.

| Estado | Nodos con caja | Glifos | En Nunito | Fuera de Nunito |
|---|---|---|---|---|
| `login-1440` | 14 | 320 | 100,00 % | 0 |
| `dashboard-1440` | 46 | 775 | 97,16 % | MapLibre 22 |
| `map-micro-1440` | 32 | 599 | 96,33 % | MapLibre 22 |
| `map-meso-1440` | 72 | 1.161 | 98,11 % | MapLibre 22 |
| `map-meso-1440-lista` | 73 | 1.192 | 98,15 % | MapLibre 22 |
| `map-micro-1440-lista` | 38 | 668 | 96,71 % | MapLibre 22 |
| `sensors-tutorial-1440` | 58 | 1.553 | 93,17 % | mono 106 |
| `sensors-1440` | 49 | 1.309 | 91,90 % | mono 106 |
| `alerts-1440` | 21 | 516 | 100,00 % | 0 |
| `reports-1440` | 21 | 508 | 100,00 % | 0 |
| `settings-1440` | 57 | 1.642 | 100,00 % | 0 |
| `live-1440` | 15 | 354 | 100,00 % | 0 |
| `live-device-1440` | 118 | 1.759 | 100,00 % | 0 |
| `live-raw-1440` | 16 | 519 | 100,00 % | 0 |
| `login-390` | 10 | 218 | 100,00 % | 0 |
| `dashboard-390` | 32 | 526 | 95,82 % | MapLibre 22 |
| `dashboard-390-drawer` | 45 | 721 | 96,95 % | MapLibre 22 |
| `map-micro-390` | 18 | 355 | 93,80 % | MapLibre 22 |
| `map-meso-390` | 58 | 917 | 97,60 % | MapLibre 22 |
| `map-meso-390-lista` | 58 | 917 | 97,60 % | MapLibre 22 |
| `map-micro-390-lista` | 24 | 424 | 94,81 % | MapLibre 22 |
| `map-390-drawer` | 37 | 619 | 96,45 % | MapLibre 22 |
| `sensors-tutorial-390` | 44 | 1.300 | 91,85 % | mono 106 |
| `sensors-390` | 35 | 1.057 | 89,97 % | mono 106 |
| `sensors-390-drawer` | 48 | 1.252 | 91,53 % | mono 106 |
| `alerts-390` | 7 | 272 | 100,00 % | 0 |
| `alerts-390-drawer` | 20 | 467 | 100,00 % | 0 |
| `reports-390` | 7 | 264 | 100,00 % | 0 |
| `reports-390-drawer` | 20 | 459 | 100,00 % | 0 |
| `settings-390` | 43 | 1.381 | 100,00 % | 0 |
| `settings-390-drawer` | 56 | 1.576 | 100,00 % | 0 |
| `live-390` | 15 | 350 | 100,00 % | 0 |
| `live-device-390` | 115 | 1.693 | 100,00 % | 0 |
| `live-raw-390` | 16 | 515 | 100,00 % | 0 |
| **Total** | **1.338** | **28.158** | **97,18 %** | MapLibre 264, mono 530 |

**Peso computado frente a peso pintado** (suma de los 34 estados; instancia que CDP informa para cada nodo):

| Peso CSS | Nodos | Glifos | Instancia pintada | Discrepancias |
|---|---|---|---|---|
| 300 | 2 | 50 | Nunito-Light (50) | 0 |
| 400 | 519 | 18.085 | Nunito-Regular (18.085) | 0 |
| 500 | 283 | 3.187 | Nunito-Medium (3.187) | 0 |
| 600 | 186 | 1.950 | Nunito-SemiBold (1.950) | 0 |
| 700 | 314 | 3.777 | Nunito-Bold (3.777) | 0 |
| 800 | 34 | 315 | Nunito-ExtraBold (315) | 0 |

### 4.3 Gráficos (ECharts, canvas)

| Gráfico | Dónde | Textos dibujados | `getOption().textStyle.fontFamily` | Fuente lista al dibujar | Píxeles de diferencia: Nunito / sans-serif / system-ui | Veredicto |
|---|---|---|---|---|---|---|
| Tendencia de «Humedad de suelo» (1038×320), cálido | `/dashboard` | «%», «29 sep» … «5 oct» | `"Nunito Variable", Nunito, system-ui, sans-serif` | sí (8/8) | 0 / 4.065 / 4.383 | Nunito |
| Ídem, frío | `/dashboard` | ídem | `"Nunito Variable", Nunito, system-ui, sans-serif` | sí (8/8) | 0 / 4.065 / 4.383 | Nunito |
| «Cabeceo por sensor» (489×320), cálido | `/live`, detalle | «°» (sin datos) | `"Nunito Variable", Nunito, system-ui, sans-serif` | sí (3/3) | 0 / 62 / 78 | Nunito |
| «Alabeo por sensor», cálido | `/live`, detalle | «°» (sin datos) | `"Nunito Variable", Nunito, system-ui, sans-serif` | sí (3/3) | 0 / 62 / 78 | Nunito |
| «Cabeceo…» y «Alabeo…» (resultados idénticos), frío | `/live`, detalle | «°» (sin datos) | `"Nunito Variable", Nunito, system-ui, sans-serif` | sí (4/4) | 0 / 62 / 78 | Nunito |
| «Cabeceo…» con 2 series sintéticas | `/live`, detalle | leyenda «Sensor 1A», «Sensor 2A»; marcas «13:26»…; ejes «-0,6»…«0,8» | `"Nunito Variable", Nunito, system-ui, sans-serif` | sí | 0 / 10.736 / 11.192 | Nunito |

La fuente de las etiquetas de eje (12 px), de la leyenda (12 px) y del tooltip (14 px) que informa el modelo de ECharts es esa misma pila. El tooltip HTML de Inicio, abierto con el ratón y medido con CDP, se pinta `Nunito-Regular` y `Nunito-Bold`, `isCustomFont: true`. La fuente estaba lista antes del primer texto en todas las lecturas: se cargó a los 883 ms y el gráfico de Inicio dibujó a los 17.389 ms (frío); en `/live` a los 253 ms frente a 2.839 ms.

**Comparación a la vista.** Miré, para cada gráfico, el recorte a escala 2, el tramo DOM en «Nunito Variable» 12 px y el tramo en `sans-serif` 12 px (`chart-dashboard-1*.webp`, `chart-live-1-synthetic*.webp`; `chart-live-1.webp` y `chart-live-2.webp` solo contienen «°»). Los glifos del gráfico **coinciden con la muestra Nunito**: terminales redondeados en s, e, p, c, t, S y en los dígitos 1, 2, 3, 6 y 8, y puntos redondos en los dos puntos de «13:26»; la `sans-serif` del sistema (Helvetica) tiene los terminales cortados y los dos puntos cuadrados. El rasgo de la «a» de dos pisos no se pudo juzgar a la vista porque ningún gráfico dibuja una «a» minúscula; lo cubre el diferencial de píxeles, que es exacto (0 píxeles).

**Prueba de estrés (fuente retenida; no es un tiempo observado en producción).**

| Escenario | Fuente retenida | Primer texto del gráfico | Textos pintados con la fuente sin lista | Fuente liberada | ¿Se repintó? | Final |
|---|---|---|---|---|---|---|
| Inicio, URL directa, tendencia repetida al instante | 5.000 ms | 1.091 ms | 16 | 5.726 ms | **no** (misma huella del canvas) | **`system-ui`**: 0 px frente a `system-ui`, 4.383 frente a Nunito |
| `/live`, detalle abierto con un clic | 14.000 ms | 2.180 ms | 2 al primer pintado y 22 en total hasta que llegó la fuente (en cada gráfico) | 15.023 ms | sí (la página repinta cada segundo) | Nunito (0 px) |

`chart-dashboard-stress-font-late-1.webp` es el gráfico de Inicio tal como queda tras llegar la fuente. Ver NU-02.

### 4.4 Diseño

| Estado | Doc. `scrollWidth`/`clientWidth` | Desbordes | Recorte (px) | Navegación en 2 líneas | Botones < 44 px (propios) | Etiqueta de botón en 2 líneas | Tapados / recortados | Δ alto de página vs Barlow (px) | Diseño |
|---|---|---|---|---|---|---|---|---|---|
| `login-1440` | 1440/1440 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `dashboard-1440` | 1440/1440 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +1 | OK con reflujo |
| `map-micro-1440` | 1440/1440 | 0 | 0 | 0 de 7 | 8 | 0 | 0 / 0 | +0 | OK |
| `map-meso-1440` | 1440/1440 | 0 | 50 | 0 de 7 | 21 | 3 | 0 / 0 | +0 | **REGRESIÓN** |
| `map-meso-1440-lista` | 1440/1440 | 0 | 74 | 0 de 7 | 21 | 3 | 0 / 0 | +0 | **Defecto previo agravado** |
| `map-micro-1440-lista` | 1440/1440 | 0 | 0 | 0 de 7 | 8 | 0 | 0 / 0 | +0 | OK |
| `sensors-tutorial-1440` | 1440/1440 | 0 | 0 | 0 de 0 | 7 | 0 | 0 / 0 | +4 | OK con reflujo |
| `sensors-1440` | 1440/1440 | 0 | 0 | 0 de 7 | 4 | 0 | 0 / 0 | +4 | OK con reflujo |
| `alerts-1440` | 1440/1440 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK |
| `reports-1440` | 1440/1440 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK |
| `settings-1440` | 1440/1440 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK |
| `live-1440` | 1440/1440 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `live-device-1440` | 1440/1440 | 0 | 0 | 0 de 4 | 0 | 0 | 0 / 0 | +16 | OK con reflujo |
| `live-raw-1440` | 1440/1440 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `login-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `dashboard-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +18 | OK con reflujo |
| `dashboard-390-drawer` | 390/390 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +18 | OK con reflujo |
| `map-micro-390` | 390/390 | 0 | 0 | 0 de 0 | 8 | 0 | 0 / 0 | +0 | OK |
| `map-meso-390` | 390/390 | 1 (campo de texto) | 136 | 0 de 0 | 21 | 3 | 15 / 0 | +0 | **Defecto previo agravado** |
| `map-meso-390-lista` † | 390/390 | 1 (campo de texto) | 136 | 0 de 0 | 21 | 3 | 17 / 7 | +0 | **Defecto previo agravado** |
| `map-micro-390-lista` | 390/390 | 0 | 0 | 0 de 0 | 8 | 0 | 1 / 0 | +0 | Defecto previo |
| `map-390-drawer` | 390/390 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK con reflujo |
| `sensors-tutorial-390` | 390/390 | 0 | 0 | 0 de 0 | 7 | 0 | 0 / 0 | +24 | OK con reflujo |
| `sensors-390` | 390/390 | 0 | 0 | 0 de 0 | 4 | 0 | 0 / 0 | +24 | OK con reflujo |
| `sensors-390-drawer` | 390/390 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +24 | OK con reflujo |
| `alerts-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `alerts-390-drawer` | 390/390 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK con reflujo |
| `reports-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `reports-390-drawer` | 390/390 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK con reflujo |
| `settings-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `settings-390-drawer` | 390/390 | 0 | 0 | 0 de 7 | 0 | 0 | 0 / 0 | +0 | OK con reflujo |
| `live-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +0 | OK |
| `live-device-390` | 390/390 | 0 | 0 | 0 de 4 | 0 | 0 | 0 / 0 | +0 | OK |
| `live-raw-390` | 390/390 | 0 | 0 | 0 de 0 | 0 | 0 | 0 / 0 | +64 | OK con reflujo |

Las 113 etiquetas de navegación miden 0,9 veces su `line-height` (una línea: el rectángulo del texto ocupa el 90 % del interlineado); la «Configuración» de la barra lateral ocupa hasta el 55 % del ancho útil del enlace y las del cajón el 49 %. A 390 px el `scrollWidth` del documento es 390 en los 20 estados. Los estados con el tutorial abierto se miden sobre el diálogo (`skipHitTest`). El único desborde de contenido que aparece (1 en cada estado Meso de 390 px) es `input#overlay-name-589e169ae71146e7b943fbb505eba930` (`scrollWidth` 187 frente a `clientWidth` 154; con Barlow 182 frente a 154), un campo de texto cuyo valor, «relieve_valle_aburra_rgb», es más largo que su caja. Con Barlow aparecían además tres desbordes `button.flex-1.truncate.text-left` (el nombre de cada lote, `scrollWidth` 51–53 frente a `clientWidth` 3, truncado con puntos suspensivos); con Nunito el botón mide 0 px y ya no se cuenta.

† El clic real en «Sensores en el mapa» agotó el tiempo a los 6 s (el resumen queda tapado por el panel: QA-01), de modo que `map-meso-390-lista` es el mismo estado que `map-meso-390`; una repetición aparte sí logró abrirla.

**Qué cambia al pasar de Barlow a Nunito** (solo diferencias; todo lo demás es igual, elemento a elemento; las filas de «Editar límites» y del nombre del lote valen también para el estado con la lista abierta de su misma escala y ancho):

| Estado | Diferencia | Barlow emulada | Nunito |
|---|---|---|---|
| `dashboard-1440` | Alto de la página | 1.409 px | 1.410 px (+1) |
| `map-meso-1440` | Recorte del panel `div.app-panel.relative.h-[38rem]` | 0 px | 50 px |
| `map-meso-1440` | «Editar límites» (3 botones) | 1 línea, 91×24 px | 2 líneas, 88,8×40 px |
| `map-meso-1440` | Botón con el nombre del lote (QA-04) | 3 px de ancho (texto truncado) | 0 px (no se ve) |
| `map-meso-1440-lista` | Recorte del panel `div.app-panel.relative.h-[38rem]` | 26 px | 74 px |
| `sensors-1440` | Alto de la página | 1.008 px | 1.012 px (+4) |
| `live-device-1440` | Texto «Una sola trama de inclinometría, recibid…» en líneas | 1 | 2 |
| `live-device-1440` | Alto de la página | 2.151 px | 2.167 px (+16) |
| `dashboard-390` | Texto «Datos parciales: la ventana de 7 días aú…» en líneas | 1 | 2 |
| `dashboard-390` | Alto de la página | 1.901 px | 1.919 px (+18) |
| `dashboard-390-drawer` | Texto «Rol: Administrador — Puede crear, editar…» en líneas (igual en los seis cajones) | 2 | 3 |
| `map-meso-390` | Recorte del panel `div.app-panel.relative.h-[38rem]` | 88 px | 136 px |
| `map-meso-390` | «Editar límites» (3 botones) | 1 línea, 91×24 px | 2 líneas, 88,8×40 px |
| `map-meso-390` | Botón con el nombre del lote (QA-04) | 3 px de ancho (texto truncado) | 0 px (no se ve) |
| `map-meso-390` | Controles tapados / recortados | 18 / 0 | 15 / 0 |
| `map-meso-390-lista` † | Recorte del panel `div.app-panel.relative.h-[38rem]` | 88 px | 136 px |
| `map-meso-390-lista` † | Controles tapados / recortados | 21 / 6 | 17 / 7 |
| `sensors-390` | Alto de la página | 1.534 px | 1.558 px (+24) |
| `live-raw-390` | Texto «Telemetría recibida en AWS…» en líneas | 1 | 2 |
| `live-raw-390` | Texto «Ventana operativa acotada de llegadas MQ…» en líneas | 3 | 4 |
| `live-raw-390` | Alto de la página | 1.188 px | 1.252 px (+64) |
| `live-raw-390` | Líneas del h1 | 1 | 2 |

Ancho del texto con Nunito sobre el mismo texto con Barlow (791 elementos de una línea y de al menos 20 px, con repeticiones entre estados): mínimo 0,922, p10 1,005, p25 1,029, **mediana 1,047**, p75 1,073, p90 1,103, p99 1,141, máximo 1,202. «Editar límites» ocupaba 74,8 px en una caja de 91 px con Barlow, con casi nada de holgura: por eso fue lo primero en partirse.

**Botones de menos de 44 px** (informativo: el alto de un control es relleno más `line-height` y no depende del ancho de la tipografía, salvo cuando la etiqueta se parte):

| Control | Selector | Alto (px) | Ancho (px) | Dónde |
|---|---|---|---|---|
| Pastillas Mapa/Satélite/Híbrido y Micro/Meso/Macro | `button.rounded-full.px-3.py-1.5` | 28 | 53–66 | `/map` |
| «Activada» (atenuación) | `button.rounded-full.px-3.py-1.5` | 28 | 72 | `/map` Meso |
| «Eliminar la capa…» | `button.btn-ghost.px-3.py-1.5` | 28 | 94 | `/map` Meso |
| «Lote activo: …» (resumen) | `summary.flex.cursor-pointer.select-none` | 25 | 262 | `/map` Meso |
| «Sensores en el mapa (n)» (resumen) | `summary.cursor-pointer.select-none.font-semibold` | 20 | 258–294 | `/map` |
| Entrada de la lista de sensores | `button.flex.w-full.items-center` | 37 | 258–294 | `/map` Micro, lista abierta |
| «Editar límites» ×3 | `button.btn-ghost.!px-2.!py-1` | 40 (24 con Barlow) | 88,8 | `/map` Meso |
| «Renombrar lote …» ×3, «Eliminar lote …» ×3 | `button.btn-ghost.!px-2.!py-1` | 24 | 64–81 | `/map` Meso |
| «Subir … en el orden» ×2 | `button.btn-ghost.px-2.py-1` | 24 | 32 | `/map` Meso |
| «¿Cómo funciona?» | `button.btn-ghost` | 38,5 | 170 | `/sensors` |
| «Reanudar registro» | `button.btn-ghost` | 36 | 180 | `/sensors` |
| «Copiar topic de …» ×2 | `button.btn-ghost.px-2.py-1` | 24 | 32 | `/sensors` |
| «Cerrar tutorial» | `button.btn-ghost.px-2.py-2` | 32 | 32 | tutorial |
| «Ver luego» | `button.btn-ghost` | 38,5 | 94,5 | tutorial |
| Puntos de paso del tutorial ×5 | `button.h-2.w-2.rounded-full` | 8 | 8–20 | tutorial |
| Controles de MapLibre (zoom, brújula, atribución; no propios) | `button.maplibregl-ctrl-*`, `summary.maplibregl-ctrl-attrib-button` | 29 y 24 | 29 y 24 | `/map`, Inicio |

**Cajón a 390 px** (`dashboard`, `map`, `sensors`, `alerts`, `reports`, `settings`):

| Ruta | Abre | Cierra con el botón | Cierra con Escape | Foco vuelve a «Abrir menú» | Desplazamiento bloqueado / `main` inerte | Etiquetas en 2 líneas |
|---|---|---|---|---|---|---|
| `dashboard` | sí | sí | sí | sí | sí / sí | 0 de 7 |
| `map` | sí | sí | sí | sí | sí / sí | 0 de 7 |
| `sensors` | sí | sí | sí | sí | sí / sí | 0 de 7 |
| `alerts` | sí | sí | sí | sí | sí / sí | 0 de 7 |
| `reports` | sí | sí | sí | sí | sí / sí | 0 de 7 |
| `settings` | sí | sí | sí | sí | sí / sí | 0 de 7 |

### 4.5 Red, consola y fallos

| Verificación | Observado |
|---|---|
| Hosts | propio 296; `maps.geo.us-east-2.amazonaws.com` 42 (teselas y glifos); `cognito-idp.us-east-2.amazonaws.com` 2 (un envío de login por ancho); `m3tric-staging-platform-overlays-147997127433-us-east-2.s3.us-east-2.amazonaws.com` 2 (capa de imagen de Meso); ningún otro |
| Archivos de fuente | 18 peticiones en 18 cargas, todas a `/assets/nunito-latin-wght-normal-BzFMHfZw.woff2`; ninguna a los otros cuatro subconjuntos |
| Errores de consola, `pageerror`, `requestfailed` (salvo `ERR_ABORTED`), respuestas ≥ 400 | 0, 0, 0 y 0 en los 34 estados y en los dos envíos del login; `ERR_ABORTED`: 0 |
| 503 de `/api/live/*` (QA-02) | 0: no reapareció |
| Avisos de consola | 59 «Expected value to be of type number, but found null instead.» y 1 «…found string instead.» (validación de estilos de MapLibre sobre el estilo de AWS Location), 8 del controlador GL («GL Driver Message … GL_CLOSE_PATH_NV»): los mismos tipos que QA-11; no son errores |
| Glifos del mapa base | el mapa pide pilas `Amazon Ember …, Noto Sans …` a AWS Location (WebGL): fuera del alcance de la marca |
| `/api/live/trend` | 200 en 16.622, 16.389, 16.372 y 16.417 ms (Nunito 1440, Barlow 1440, Nunito 390, Barlow 390): NU-06 |

## 5. Defectos y observaciones

Severidad: alta (función inalcanzable o servicio caído), media, baja, informativa. «Regresión» significa que la introduce la tipografía; lo sé por el control con Barlow emulada sobre el mismo despliegue, no por deducción del código.

### Defectos

**NU-01. `/map`, escala Meso, 1440×900: las tres «Editar límites» pasan a dos líneas y la columna izquierda queda recortada 50 px. Severidad media. Regresión.**
*Estado tras la release 66acab7: corregido a 1440×900 y 1280×800, con el matiz NU-07 (sección 10).*
- Dónde: administrador con lote seleccionado (`medellin`, `medellín`, `rionegro`; queda activo el primero), escala Meso. Ver `ab-map-meso-1440.webp` (Barlow emulada a la izquierda, Nunito a la derecha, con el borde del panel marcado) y `map-meso-1440.webp`.
- Medido: cada botón «Editar límites» pasa de 91×24 px en una línea (texto de 74,8 px) a 88,8×40 px en dos; las tres filas ganan 16 px, la columna izquierda supera el panel `div.app-panel.relative.h-[38rem]` (`overflow:hidden`, scrollHeight 692 frente a clientHeight 642) y se cortan 50 px: la segunda frase de ayuda de «Capas de imagen», «La ubicación de la imagen es independiente del límite de su lote.», queda cortada por la mitad (25 px por debajo del borde). Con Barlow emulada el recorte es 0 px. Con «Sensores en el mapa» desplegado (`map-meso-1440-lista.webp`): 26 px con Barlow (QA-05 midió 25) y **74 px** con Nunito (49 px de la frase de ayuda y 9 px de «Arrastre aquí un GeoTIFF…»).
- Alcance: la columna no se desplaza (el panel recorta, no hay `overflow-y:auto`), así que el texto cortado es inalcanzable; «Subir imagen» sigue visible. A 390 px el panel ya estaba roto (QA-01) y el recorte pasa de 88 a 136 px.
- Atribución: causada por la tipografía sobre un diseño ya al límite. Con Barlow el texto (74,8 px) cabía por décimas de píxel en la caja del botón (91 px, con relleno `!px-2` de 8 px por lado) y QA-05 ya medía 1 px de holgura en el panel con la lista cerrada; con Nunito (+4,7 % de mediana, más en esa etiqueta) se parte. Es el mismo punto frágil de QA-05, y en QA-04 el botón con el nombre del lote pasa de 3 px a 0 px.
- Recomendación: dejar que las acciones de cada lote pasen a una segunda línea (`flex-wrap`) o usar iconos con nombre accesible; acotar la altura de la columna con `max-height` y `overflow-y:auto` (la de QA-05) para que nada quede inalcanzable; cerrar el arreglo midiendo `scrollHeight - clientHeight ≤ 0` del panel con la lista abierta y cerrada a 1440×900 y a 1280×800.

**NU-02. El gráfico de tendencia de Inicio no se repinta cuando llega la fuente. Severidad baja (latente).**
*Estado tras la release 66acab7: corregido (sección 10).*
- Prueba (estrés): con el `.woff2` retenido 5.000 ms y la tendencia servida al instante, el gráfico escribió 16 textos a los 1.091 ms con `document.fonts.check` falso; la fuente se liberó a los 5.726 ms (y estuvo lista poco después) y la huella del canvas no cambió (`8aa3dfcf` antes y después); al comparar con las opciones forzadas, el canvas coincide con `system-ui` (0 px) y no con Nunito (4.383 px). Ver `chart-dashboard-stress-font-late-1.webp`. En `/live`, con la fuente retenida 14.000 ms, los gráficos se pintaron con la fuente sin lista, se repintaron al llegar (la página los repinta cada segundo) y acabaron idénticos a Nunito.
- Por qué no se ve hoy: `/api/live/trend` tarda 16,4 a 16,6 s, el primer texto del gráfico llega entre los 16,7 y los 20,2 s y la fuente ya estaba a los 0,9 s. Aparecería con una primera visita sin caché y una red lenta, o en cuanto la API sea rápida o esté en caché.
- Causa: ECharts pinta el texto en un canvas, que no se repinta cuando una web font termina de cargar; el cambio de pila (`CHART_FONT_FAMILY`) solo corrige el nombre de la familia. Las pruebas del PR atan las declaraciones de la pila (`brand.test.ts`), no el instante en que el canvas pinta.
- Recomendación: esperar la fuente antes de pintar (`await document.fonts.load('12px "Nunito Variable"')`) o repintar al terminar (`document.fonts.addEventListener('loadingdone', …)` y `resize()` o `setOption` sobre la instancia); y una prueba que retenga el `.woff2` y compare píxeles como esta.

**NU-06. `/api/live/trend` responde 200 en 16,4–16,6 s y el gráfico de Inicio aparece a los ~17 s. Severidad media (infraestructura, ajena a la tipografía).** Cuatro cargas de Inicio: 16.622, 16.389, 16.372 y 16.417 ms (con Nunito y con Barlow emulada: no depende de la tipografía). La Lambda `live-trend` tiene un tiempo máximo de 20 s (1.024 MB) y concurrencia reservada 2, la misma de QA-02. Queda a menos de 4 s de su tiempo máximo. No aislé la causa (hipótesis: el volumen de tramas de `m3tric-ke-test-01`, que transmitía cada 0,5 s). Para el dueño de `platform-live`: investigar qué parte del tiempo es la consulta, acotar o cachear el cálculo y subir la concurrencia reservada.

### Observaciones

**NU-03. CDP informa `familyName` «Nunito ExtraLight» en todos los pesos. Informativa (método).** El archivo es una fuente variable cuya instancia por defecto es ExtraLight; Chromium nombra la familia con ella y expone el peso aplicado en `postScriptName` (`Nunito-SemiBold` para 600, etc.). El criterio «`familyName` = `Nunito-*`» se evaluó sobre `postScriptName`; `isCustomFont` es `true` en todos los casos. Conviene ajustar la plantilla de verificación (también la del PR, que cita `Nunito-ExtraBold` como `familyName`).

**NU-04. Texto que no es Nunito, por diseño. Informativa.** Atribución de MapLibre (264 glifos, `Helvetica Neue`, CSS de la biblioteca), `font-mono` (530 glifos, `Menlo`: topics MQTT y `code` de `/sensors`) y las etiquetas del mapa base, que se dibujan en WebGL con pilas de AWS Location (`Amazon Ember …`, `Noto Sans …`). La atribución y la monoespaciada ya constaban en QA-12. Los gráficos y el tooltip de ECharts, en cambio, sí son Nunito.

**NU-05. El `.woff2` se sirve como `binary/octet-stream` y sin `Cache-Control`. Severidad baja (preexistente).** Cabeceras de `/assets/nunito-latin-wght-normal-BzFMHfZw.woff2`: `content-type: binary/octet-stream`, sin `cache-control`, `last-modified` 17:04:10 GMT. Chromium la carga igual; sin `Cache-Control` el navegador depende de la frescura heurística. Recomendación: `font/woff2` y `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` con hash.

### Defectos previos re-medidos (no los introduce Nunito)

| ID | Estado | Medido ahora |
|---|---|---|
| QA-01 | persiste | 390×844, Meso: 15 controles tapados (18 con Barlow emulada), el selector Micro/Meso/Macro 131 px por debajo del borde del panel (83 con Barlow); el clic real sobre «Sensores en el mapa» agotó el tiempo a los 6 s en la secuencia automática (una repetición aparte sí pudo abrirla) |
| QA-04 | persiste (algo peor) | el botón con el nombre del lote mide 3 px con Barlow emulada y 0 px con Nunito: los tres nombres siguen sin verse |
| QA-05 | persiste y se triplica | 1440×900, Meso con «Sensores en el mapa» desplegado: 26 px cortados con Barlow emulada (25 en QA-05) y 74 px con Nunito |
| QA-12 | persiste | el h1 «Monitoreo en vivo» ocupa 2 líneas en /live a 1440 con las dos tipografías y 1 línea a 390 |
| QA-02 | no reapareció | 0 respuestas 503 de /api/live/* en las 6 pasadas |

## 6. Límites de esta verificación

- Solo Chromium 153 (headless); el viewport de 390 usa un agente de escritorio y no simula gestos táctiles.
- Los dos dispositivos están «Callado» (SmartNode hace ~52 min, ke-test-01 hace 4 días): los gráficos del detalle de /live no tienen series y solo dibujan «°». La leyenda y las marcas de eje se comprobaron con series sintéticas inyectadas en la instancia real (opción, ejes y manejo de fuente reales; datos inventados y solo en la página), no con datos reales. Un gráfico de /live con datos reales no se observó.
- La «tipografía anterior» es una emulación: @fontsource/barlow 5.3.0 (300/400/500/700/800, latin) superpuesta por @font-face con data URL sobre el despliegue actual; reproduce el mismo DOM, CSS, datos y hora, y devolvió el valor de QA-05 (26 px frente a 25 px), pero no incluye otras diferencias entre las dos versiones (kit 1.1.0, opciones de gráficos).
- La prueba de estrés retiene el woff2 5 s (Inicio) y 14 s (/live) y repite una respuesta de tendencia capturada; demuestra el mecanismo, no la frecuencia con que ocurre en producción.
- Los estados de /map con la lista abierta y los de 390 dependen de la secuencia de gestos y del desplazamiento: a 390 el clic en «Sensores en el mapa» agotó el tiempo en la secuencia automática y funcionó en una repetición aparte, y un control tapado en Micro a 390 con la lista abierta no se reprodujo; esos dos estados son orientativos.
- Caché HTTP desactivada en las pasadas principales (cada carga pide los archivos): es un arranque en frío permanente, no el uso de un visitante recurrente. El camino cálido solo se midió para los gráficos.
- CDP getPlatformFontsForNode mide el texto con caja de maquetación; los nodos sin caja (display:none) no cuentan (noLayout en findings.json). El texto dibujado en WebGL (etiquetas del mapa base) y en canvas (gráficos) no es DOM: los gráficos se cubrieron con registro de fillText, diferencial de píxeles y comparación visual; las etiquetas del mapa base no se evaluaron.
- No se ejecutó axe, Lighthouse ni lector de pantalla, ni WebKit, Firefox o Edge; /reports, /settings y /live/raw se midieron sin captura.
- El arnés (qa-nunito.mjs, qa-nunito-lib.mjs, qa-nunito-controls.mjs y los scripts que arman este informe) vive en el espacio de trabajo temporal de la sesión y no se archiva en el repositorio (como en QA-REPORT.md §9): repetir la QA exige reescribirlo o recuperarlo de esa carpeta.

## 7. Evidencia

Todo en `docs/evidence/platform-brand/nunito/`. Capturas en WebP calidad 80 (≤ 150 KB cada una; las de 1440 a página completa hasta 3.200 px de alto, las de 390 a página completa).

| Archivo | Contenido |
|---|---|
| `findings.json` | Datos crudos y consolidados: `meta` (release, navegador, corridas), `servedFont`, `probeControls`, `controlBarlowProof`, `summary` (página × ancho), `checks` (34 comprobaciones con veredicto), `defects`, `limits`, `cleanup`, `aggregates`, `charts` (cálido y frío), `stress`, `recheck` (re-verificación de la release 66acab7, sección 10) y `states` (34 estados: `document.fonts`, peticiones, hosts, CDP por elemento y censo, gráficos, diseño, red y consola, comparación con Barlow emulada y veredictos) |
| `login-1440`, `login-390` | `/login` antes de autenticar |
| `dashboard-1440`, `dashboard-390`, `dashboard-390-drawer` | Inicio (`/` → `/dashboard`) y el cajón abierto a 390 |
| `map-micro-1440`, `map-micro-390`, `map-meso-1440`, `map-meso-390`, `map-meso-1440-lista` | Mapa en Micro y en Meso (con clic real en «Meso»); Meso con «Sensores en el mapa» abierto a 1440 |
| `sensors-tutorial-1440`, `sensors-tutorial-390`, `sensors-1440`, `sensors-390` | Tutorial de primera visita y `/sensors` tras cerrarlo |
| `live-1440`, `live-390`, `live-device-1440`, `live-device-390` | `/live` (lista) y detalle de «Estación SmartNode 01» |
| `alerts-1440`, `alerts-390` | `/alerts` (marcador «Fases posteriores») |
| `chart-dashboard-1`, `chart-dashboard-1-sample` | Gráfico de tendencia de Inicio (escala 2) y muestra «Nunito Variable» 12 px junto a `sans-serif` 12 px con sus mismas etiquetas |
| `chart-live-1`, `chart-live-2` y sus `-sample` | «Cabeceo» y «Alabeo» de `/live` sin datos (solo «°») y su muestra |
| `chart-live-1-synthetic`, `chart-live-1-synthetic-sample` | «Cabeceo» con dos series sintéticas inyectadas (leyenda, marcas de eje) y su muestra |
| `chart-dashboard-stress-font-late-1` | Gráfico de Inicio tal como queda cuando la fuente llega después del primer pintado (NU-02) |
| `ab-map-meso-1440` | NU-01: columna izquierda de `/map` Meso, Barlow emulada frente a Nunito, con el borde del panel marcado |
| `recheck-*` (4 imágenes) | Re-verificación de la release 66acab7 (sección 10.6); sus datos, en la clave `recheck` de `findings.json` |

La carpeta suma 36 archivos y 1,57 MiB (1,64 MB).

Los estados de `/reports`, `/settings` y `/live/raw` y los de `map-micro-*-lista`, `map-meso-390-lista` y los cajones salvo el de Inicio se midieron sin captura (presupuesto de la carpeta); sus números están en `findings.json`.

## 8. Limpieza

- Usuario temporal `smoke-qa-nunito-1791223529` eliminado con `admin-delete-user` (2026-10-05 18:56:19Z, creado 18:05:29Z). Comprobación posterior: `admin-get-user` devuelve `UserNotFoundException: User does not exist.`; `list-users` con el prefijo `smoke-qa-nunito` y con `smoke-` devuelve una lista vacía.
- Creación: `admin-create-user --message-action SUPPRESS`; el `Username` devuelto se verificó antes de seguir; contraseña permanente aleatoria con `admin-set-user-password --cli-input-json` desde un archivo de modo 600, nunca impresa; grupo `admin` (el de QA-REPORT). Variables de shell propias (`SMOKE_USER`, `POOL_ID`), sin `USERNAME` ni `path`.
- Borrados los archivos con la contraseña (archivo de contraseña, JSON y salida de `admin-set-user-password`). Antes de borrar el archivo de contraseña busqué su valor, tokens con forma de JWT y claves de AWS Location en toda la carpeta de trabajo y en esta evidencia: 0 coincidencias.
- Escrituras en AWS: `admin-create-user`, `admin-set-user-password`, `admin-add-user-to-group` y `admin-delete-user`; el resto, lecturas (`sts`, `cloudformation describe-stacks`, `cloudfront get-distribution`, `lambda list-functions`, `get-function-configuration` y `get-function-concurrency`, `apigateway get-stage`, `cognito-idp list-groups`, `describe-user-pool`, `list-users`, `admin-get-user`, `admin-list-groups-for-user`). El resto de este repositorio no se tocó.

## 9. Confianza

- Global: alta en las mediciones de tipografía y de gráficos (con salida cruda en `findings.json` y dos comprobaciones independientes del mismo hecho: CDP y diferencial de píxeles); media-alta en la atribución a la tipografía de NU-01, que se apoya en un control emulado que reprodujo el valor de QA-05.
- Lo que me deja menos seguro: que el control Barlow no sea el despliegue anterior real (solo cambia la cara); los estados de `/map` a 390 px y con la lista abierta, que dependen de la secuencia de gestos; y la frecuencia real de NU-02, que depende de la red del visitante y de la latencia futura de la API.
- Convendría que lo revisara quien lleve el frontend de la plataforma (NU-01 y NU-02), quien lleve `platform-live` (NU-06) y, para los gráficos con datos reales, alguien con un dispositivo transmitiendo.

## 10. Re-verificación 2026-10-05 (release 66acab7)

Tras el despliegue de las correcciones de NU-01 y NU-02 (PR #194 → `main` `66acab72…`, change set `nu-fix-66acab7` ejecutado a las 20:56Z: datos del encargo, que no pude verificar con `gh` porque la tarea lo prohibía) repetí en vivo las mediciones afectadas con el mismo arnés, en un modo nuevo (`recheck`, mismas sondas). Las secciones 1 a 9 no se tocan: describen la release 57681b2 tal como se midió.

| Elemento | Valor |
|---|---|
| Release | `platform-live-66acab72f6f9e03472eaedf26d8644cd8c32f3c3` (salida `ReleaseId` del stack; `GitSha` = `66acab72f6f9e03472eaedf26d8644cd8c32f3c3`, el commit del encargo) |
| Stack | `m3tric-staging-PlatformPreviewStack`, UPDATE_COMPLETE, `LastUpdatedTime` 2026-10-05T20:56:38.954Z (coincide con la hora de ejecución del change set del encargo, 20:56Z) |
| Distribución | E3LBUHUINTWS0F (d3pz2gipvkcx1b.cloudfront.net), estado Deployed, modificada 2026-10-05T20:57:29Z; `index.html` con `Last-Modified` Mon, 05 Oct 2026 20:58:45 GMT |
| Artefactos servidos | entrada `/assets/index-DIokBpOc.js`, que referencia el fragmento `/assets/useRepaintWhenFontReady-Cn6BNdVv.js` (la página lo pide en Inicio); CSS `/assets/index-sjQhGSSi.css`; el `.woff2` no cambió (SHA-256 `ba344451eab25b21…`, igual al de la QA principal) |
| Usuario | `smoke-qa-nunito2-1791234189`, grupo `admin`, creado 21:03:09Z y eliminado 21:15:31Z (10.5) |
| Corridas | dos pasadas completas, 21:08:09–21:09:59Z y 21:12:31–21:14:21Z, con las mismas cifras clave (panel, botones, nombres, recorrido de la rueda, pasadas de pintado, píxeles y huellas); los números de abajo son los de la segunda |
| Navegador y viewports | el mismo Chromium 153.0.8010.12; `/map` a 1440×900, 1280×800 y 390×844 (escala 1, agente de escritorio, caché HTTP desactivada); gráfico de Inicio a 1440×900, escala 2 |

### 10.1 Antes → después

«Antes» es la release 57681b2 (secciones 4 y 5); «después», la 66acab7. Panel = `div.app-panel.relative.h-[38rem]`; «pila inferior» = `div.relative.mt-auto.flex.min-h-0.flex-col.gap-3.overflow-y-auto` (los bloques «Sensores en el mapa» y «Capas de imagen»).

| Medida | Antes (57681b2) | Después (66acab7) | Veredicto |
|---|---|---|---|
| `/map` Meso 1440×900, lista cerrada: `scrollHeight − clientHeight` del panel | 50 px (692 frente a 642) | **0 px** (642 frente a 642) | corregido |
| Ídem, lista «Sensores en el mapa» abierta | 74 px (716 frente a 642) | **0 px** (642 frente a 642) | corregido (QA-05) |
| 1280×800, lista cerrada / abierta | sin medir con Nunito (la QA principal midió 1440 y 390) | **0 px / 0 px** (panel 928×608; su alto es el `min-height` de 608 px) | sin defecto |
| «Editar límites» | 88,8×40 px, 2 líneas (los 3 botones) | **90,1×24 px, 1 línea** (15 de 15 botones medidos en los 5 estados; `white-space: nowrap`) | corregido |
| Nombre del lote y sus acciones | nombre de 0 px (3 px con Barlow emulada) | nombre de **246 px** en los 15 medidos (15 con `title`, 0 truncados); las tres acciones, en una fila propia bajo el nombre (2 px de separación) y en una línea en 15 de 15 | mejorado (QA-04) |
| Ayuda de «Capas de imagen» (rueda del ratón sobre la pila inferior) | recortada 25 px (49 px con la lista abierta) por el panel y sin desplazamiento: inalcanzable | **alcanzable**: la rueda desplaza la pila inferior hasta el final (84 de 84 px a 1440 con la lista cerrada, 108 de 108 px abierta; 120 de 120 px y 144 de 144 px a 1280) y la ayuda queda entera a la vista en las 4 combinaciones; antes de desplazar quedaba 59, 83, 95 y 119 px por debajo de la caja | corregido, con el matiz NU-07 (10.3) |
| Contenedor del mapa | sin medir (el valor del encargo es 1086×642) | **1086×642** a 1440 (lista cerrada, abierta y tras la rueda); 926×606 a 1280 | sin cambio |
| 390×844 Meso: `scrollHeight − clientHeight` del panel | 136 px (742 frente a 606) | 34 px (640 frente a 606) | QA-01 persiste |
| 390: selector Micro/Meso/Macro por debajo del borde visible del panel | 131 px | 29 px los botones (34 px el grupo); fuera del área visible | QA-01 persiste |
| 390: controles tapados (sin el canvas del mapa) | 14 (15 con el canvas) | 16 (17 con el canvas); mismos 13 que antes más los 3 nombres de lote, menos «Subir imagen» (10.3) | QA-01 persiste |
| 390: clic real en «Sensores en el mapa» | agotó el tiempo (6 s) | agotó el tiempo (6 s) | igual |
| 390: desborde horizontal de contenido | 1 (`input#overlay-name-…`, 187 frente a 154) | 1 (`input#overlay-name-…`, 187 frente a 154) | igual |

**NU-02, gráfico de tendencia de Inicio.** Una «pasada» es una ráfaga de `fillText` con menos de 60 ms entre llamadas; el gráfico dibuja 8 textos por pasada (`%` y siete fechas). La tendencia se sirve al instante (respuesta capturada en la primera visita, como en la sección 4.3) y el `.woff2` se retiene con `page.route`.

| Escenario | Dibujos con la fuente sin lista | Repintados al llegar la fuente | Fuente liberada / `loadingdone` (ms) | Repintado (ms) | Diferencia con Nunito (px) | Huella del canvas (antes → después) |
|---|---|---|---|---|---|---|
| 57681b2, fuente retenida 5 s | 16 dibujos de 8 textos | **0** | 5.726 / — | — | 4.383 (coincide con `system-ui`: 0) | 8aa3dfcf → 8aa3dfcf |
| 66acab7, retenida 4 s | 2 pasadas de 8 textos (16 dibujos) | **1** | 4.871 / 5.117 | 5.110,5 | 0 | f138b70b → e7b917aa |
| 66acab7, retenida 5 s | 2 pasadas de 8 textos (16 dibujos) | **1** | 5.954 / 6.125 | 6.119,5 | 0 | f138b70b → e7b917aa |
| 66acab7, sin retención (tendencia al instante) | 0 (2 pasadas con la fuente lista, a 252 ms una de otra) | **0** | — / 1.211 | — | 0 | e7b917aa (sin cambio) |
| 66acab7, ruta cálida (login, SPA, tendencia real) | 0 (1 pasada, con la fuente cargada desde el login) | **0** | — / 940 (en el login) | — | 0 | e7b917aa (sin cambio) |

Diferencial de píxeles como en la sección 4.3: el canvas tal como está pintado frente al mismo gráfico forzado a Nunito (0 px), a `sans-serif` (4.052 px) y a `system-ui` (4.406 px). Los dos escenarios retenidos pintan dos veces antes de la fuente (a los 1.343 y 1.584 ms con la retención de 4 s y a los 1.394 y 1.649 ms con la de 5 s, con `document.fonts.check` falso en los 8 textos) y una vez más cuando llega, con la comprobación verdadera en los 8; el último dibujo deja la huella `e7b917aa`, idéntica en los cinco escenarios con la fuente aplicada. La captura tras el repintado (retención de 4 s) es byte a byte igual a la de la ruta cálida. El repintado empieza entre 5,5 y 6,5 ms antes del evento `loadingdone` de mi registro (cuatro observaciones: dos corridas por dos retenciones): es el orden esperable de un gancho que espera la promesa de `document.fonts.load(…)`, que se resuelve un instante antes que el evento.

**Censo de fuentes** (cargas duras con la caché desactivada; la tipografía no cambió en esta release):

| Estado | `document.fonts` | Peticiones de fuente | `h1` por CDP | Glifos en Nunito | Fuera de Nunito | Errores de consola / de página / peticiones fallidas | Hosts ajenos |
|---|---|---|---|---|---|---|---|
| Inicio 1440 | solo Nunito Variable 200 1000 (`latin`); 0 caras de otra familia | 1, `nunito-latin-wght-normal-BzFMHfZw.woff2`, HTTP 200 | «Inicio»: `Nunito-ExtraBold`, `isCustomFont` true | 774 de 796 (97,24 %) | 22 glifos: atribución de MapLibre (`Helvetica Neue`) | 0 / 0 / 0 | `maps.geo.us-east-2.amazonaws.com` |
| `/map` 1440 | solo Nunito Variable 200 1000 (`latin`); 0 caras de otra familia | 1, `nunito-latin-wght-normal-BzFMHfZw.woff2`, HTTP 200 | «Mapa»: `Nunito-ExtraBold`, `isCustomFont` true | 578 de 600 (96,33 %) | 22 glifos: atribución de MapLibre (`Helvetica Neue`) | 0 / 0 / 0 | `maps.geo.us-east-2.amazonaws.com` |
| `/map` 1280 | solo Nunito Variable 200 1000 (`latin`); 0 caras de otra familia | 1, `nunito-latin-wght-normal-BzFMHfZw.woff2`, HTTP 200 | «Mapa»: `Nunito-ExtraBold`, `isCustomFont` true | 578 de 600 (96,33 %) | 22 glifos: atribución de MapLibre (`Helvetica Neue`) | 0 / 0 / 0 | `maps.geo.us-east-2.amazonaws.com` |
| `/map` 390 | solo Nunito Variable 200 1000 (`latin`); 0 caras de otra familia | 1, `nunito-latin-wght-normal-BzFMHfZw.woff2`, HTTP 200 | «Mapa»: `Nunito-ExtraBold`, `isCustomFont` true | 333 de 355 (93,80 %) | 22 glifos: atribución de MapLibre (`Helvetica Neue`) | 0 / 0 / 0 | `maps.geo.us-east-2.amazonaws.com` |

En los cuatro estados: 0 respuestas HTTP ≥ 400, 0 respuestas 503 de `/api/live/*` y 0 discrepancias entre peso computado y pintado. En los cuatro escenarios del gráfico (cálido, sin retención, 4 s y 5 s): 0 errores de consola, `pageerror`, peticiones fallidas y HTTP ≥ 400, y una sola petición de fuente (el `.woff2` propio).

### 10.2 Veredictos

- **NU-01: corregido a 1440×900 y 1280×800.** Panel 0 px en las cuatro combinaciones (antes 50 y 74 px); «Editar límites» de 90,1×24 px en una línea; nombres de lote de 246 px; ayuda de «Capas de imagen» alcanzable con la rueda sobre la pila inferior; contenedor del mapa 1086×642 sin cambio. Matiz: la pila inferior (sensores y capas) es una caja desplazable de 140 px de alto a 1440×900 y de 104 px a 1280×800: el texto de ayuda y «Subir imagen» solo se ven al desplazarla con la rueda sobre ella (no sobre el panel de lotes); a 1280×800 «Subir imagen» queda cortado 15 px (lista cerrada) o 39 px (lista abierta) hasta desplazar.
- **NU-02: corregido.** Con la fuente retenida 4 s y 5 s y la tendencia servida al instante: 2 pasadas sin fuente, exactamente 1 repintado al llegar la fuente, 0 px frente a un pintado correcto y huella idéntica a la de la ruta cálida; ruta cálida sin cambio (1 pasada, 0 px).
- **QA-04: mejorado (resuelto en esta vista).** El nombre de cada lote mide 246 px (antes 0 px; 3 px con Barlow), con `title` y sin truncar a 1440, 1280 y 390.
- **QA-05: corregido.** El panel ya no recorta con la lista abierta (74 → 0 px a 1440; 0 px a 1280).
- **QA-01: sin cambio en lo esencial (persiste a 390×844).** El panel sigue recortando (34 px; antes 136), el selector Micro/Meso/Macro sigue por debajo del borde visible del panel (29 px; antes 131), 17 controles tapados (16 sin contar el canvas del mapa; antes 15 y 14) y el clic en «Sensores en el mapa» sigue agotando el tiempo.

### 10.3 Observaciones sobre el arreglo

- **NU-07 (baja). La ayuda de «Capas de imagen» ya se alcanza, pero solo con la rueda sobre una caja pequeña.** La columna izquierda (`div.flex.max-h-full.min-w-min.max-w-xs.flex-1.flex-col.gap-3`, con `overflow-y: auto` computado) no tiene nada que desplazar (`scrollHeight` = `clientHeight`: 610/610 a 1440, 574/574 a 1280): el desplazamiento está en su pila inferior, de 140 px de alto a 1440×900 y 104 px a 1280×800 (su contenido mide 224 px con la lista cerrada). Control negativo: con el puntero sobre una fila de lote (3 pasos de 300 px) la rueda no mueve esa caja (`scrollTop` 0 → 0) y, a 1280×800, desplaza la página 29 px. «Subir imagen» queda cortado 15 px (lista cerrada) o 39 px (abierta) a 1280×800 y 3 px a 1440×900 con la lista abierta hasta que se desplaza la caja. No es una regresión (antes la ayuda era inalcanzable) y el criterio `scrollHeight − clientHeight ≤ 0` del panel se cumple; la usabilidad depende de un desplazamiento anidado cuya pista visual no comprobé. Opciones: dar más alto a esa pila, o hacer que se desplace toda la columna (panel de lotes y pila juntos). Imágenes: `recheck-map-meso-1440-lista-scrolled.webp` y `recheck-map-meso-1280-lista-scrolled.webp` (lista abierta, tras la rueda).
- **El recuento de controles tapados a 390 px sube de 14 a 16 sin que haya empeorado.** Los 13 controles de antes siguen tapados (los cubre el panel derecho, `div.app-panel-elevated.space-y-4` dentro de un contenedor `absolute right-14`, que a 390 px cae encima de la columna izquierda); los tres nombres de lote («medellin», «medellín», «rionegro») ahora miden 246 px, y por eso cuentan como controles (antes medían 0 px); «Subir imagen» ya no sale tapado. QA-01 sigue abierto: el panel recorta 34 px y el selector Micro/Meso/Macro queda 29 px por debajo del borde visible del panel.
- **Corrección a mi métrica de controles tapados.** El canvas de MapLibre (`tabindex=0`) cuenta como control «tapado» cuando su centro cae bajo un panel de la capa; es el único «tapado» a 1280×800 (1 de 1) y 1 de los 15 de la QA principal y de los 17 de esta pasada a 390 px. El «control tapado en Micro a 390 con la lista abierta» que la sección 6 da por no reproducido era también el canvas (`map-micro-390-lista`, 1 tapado, «Mapa»): un falso positivo mío, no un defecto de la plataforma. Las cifras de esta sección se dan con y sin el canvas; las de las secciones 1 a 9 no se reescribieron.
- **Las dos primeras pasadas del gráfico no son del gancho.** Con la tendencia servida al instante el gráfico se pinta dos veces, con 241 a 255 ms de diferencia, tenga o no la fuente lista (en 57681b2 se vieron 16 dibujos de los mismos 8 textos: la misma pareja); el repintado del gancho es una tercera pasada y solo aparece cuando la fuente llega después. Con la fuente ya lista, o en la ruta cálida, no hay pasada adicional.
- NU-03 a NU-06 no se re-midieron: no formaban parte de esta release (la latencia de `/api/live/trend`, la cabecera del `.woff2` y lo demás quedan como estaban).

### 10.4 Límites de la re-verificación

- A 390 px el clic en «Sensores en el mapa» agotó el tiempo, como en la QA principal (lo tapa el panel derecho): solo se midió ese ancho con la lista cerrada, no se pudo probar la rueda sobre la pila inferior y el estado `map-meso-390-lista` es la misma escena tras un clic fallido (con la página desplazada 48 px), no comparable.
- Las dos pasadas comparten red, hora y versión del navegador, y cada una usa una sesión nueva; coinciden en todo, pero no son independientes entre sí.
- La prueba de retención sirve al instante una respuesta de `/api/live/trend` capturada en una primera visita (97.714 bytes); demuestra el mecanismo del arreglo, no la frecuencia con que la fuente llega tarde en producción. El gráfico no dibuja series en este entorno (solo `%` y siete fechas), como en la QA principal.
- Solo se midieron `/map` e Inicio: el resto de rutas, los cajones y los dispositivos no cambian respecto de las secciones 4 y 5 y no se repitieron. Solo Chromium; 390 px con agente de escritorio y sin emulación táctil.
- El PR, el change set y su hora son datos del encargo: no hice llamadas a `gh`. Lo que sí comprobé en AWS y en el sitio: el `GitSha` del stack, su hora de actualización, el estado de la distribución, el paquete servido y el fragmento del gancho.

### 10.5 Limpieza

- Usuario temporal `smoke-qa-nunito2-1791234189` (grupo `admin`) creado 2026-10-05 21:03:09Z y eliminado con `admin-delete-user` a las 21:15:31Z (rc 0). Comprobación posterior: `admin-get-user` devuelve `UserNotFoundException: User does not exist.`; `list-users` con el prefijo `smoke-qa-nunito` y con `smoke-` devuelve una lista vacía.
- Creación: `admin-create-user --message-action SUPPRESS`; el `Username` devuelto se verificó antes de seguir; contraseña permanente aleatoria de 21 caracteres con `admin-set-user-password --cli-input-json` desde un archivo de modo 600, nunca impresa; variables de shell propias (`SMOKE_USER`, `POOL_ID`, `SMOKE_EPOCH`). No se tocó `/sensors`, así que no apareció el tutorial.
- Borrados el archivo de contraseña, el JSON y la salida de `admin-set-user-password` y el archivo con el nombre de usuario. Antes de borrar el archivo de contraseña busqué su valor, tokens con forma de JWT y claves de AWS Location en 229 archivos (carpeta de trabajo, scripts de la sesión y esta evidencia): 0 coincidencias.
- Escrituras en AWS: `admin-create-user`, `admin-set-user-password`, `admin-add-user-to-group` y `admin-delete-user`; lecturas: `cloudformation describe-stacks`, `cloudfront get-distribution`, `admin-get-user`, `admin-list-groups-for-user` y `list-users`. Llamadas a `gh`: 0. El resto de este repositorio no se tocó.

### 10.6 Evidencia nueva

| Archivo | Contenido | Tamaño |
|---|---|---|
| `recheck-ab-map-meso-1440.webp` | NU-01: columna izquierda de /map Meso a 1440×900, antes (57681b2) y después (66acab7), con las cifras y el borde del panel | 78,3 KB |
| `recheck-map-meso-1440-lista-scrolled.webp` | Meso a 1440×900 con la lista abierta, tras la rueda sobre la pila inferior: la ayuda de «Capas de imagen» entera | 82,9 KB |
| `recheck-map-meso-1280-lista-scrolled.webp` | Ídem a 1280×800 | 61,4 KB |
| `recheck-ab-chart-dashboard.webp` | NU-02: gráfico de Inicio como quedaba con la fuente retenida (57681b2) y tras el repintado (66acab7) | 14,5 KB |

Datos crudos: clave `recheck` de `findings.json` (`meta`, `before`, `covered390`, `map` por ancho y estado, `charts` con la línea de tiempo de cada pasada, `census`, `verdicts`, `agreementBetweenRuns`, `cleanup`).

### 10.7 Confianza

- Global: alta. Las cifras del mapa y del gráfico salieron idénticas en dos pasadas y se apoyan en medidas directas (cajas, `scrollHeight`, recorrido de la rueda, píxeles, huellas del canvas y registro de pintado), no en deducciones del código.
- Lo que me deja menos seguro: la frecuencia real de la carrera de la fuente en producción (la latencia de la tendencia sigue enmascarándola) y la usabilidad del desplazamiento anidado de la pila inferior (NU-07), que no probé con un dedo ni con un lector de pantalla.
- Convendría que lo revisara quien lleve el frontend de la plataforma (NU-07) y, para QA-01 a 390 px, quien decida el rediseño de las superposiciones del mapa.
