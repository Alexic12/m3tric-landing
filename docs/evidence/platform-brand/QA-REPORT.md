# QA en vivo de la plataforma M3TRIC tras la unificación de marca (U4)

Fecha: 2026-10-02. Ejecuta: U4 «QA en vivo». Alcance: solo lectura sobre el código; las únicas escrituras en AWS fueron crear y borrar un usuario temporal de Cognito. Todo lo medido es del despliegue real, no de un doble.

## 1. Resumen

**La marca está aplicada y se comprueba en vivo.** En las 20 vistas medidas (login, ocho rutas y el detalle de `/live`, a 1440 y a 390 px) el idioma, el título, la tipografía, los degradados, el desenfoque y los textos en inglés cumplen en 20 de 20 (28 de 28 superficies para el inglés). Frente al «antes»: degradados 44 → 0, elementos con `backdrop-filter` 25 → 0, coincidencias en inglés 38 → 0, `lang` `en` → `es-CO`, Inter → Barlow, barra lateral fija de 288 px a 390 px → barra superior más cajón.

**La marca no introdujo ninguna regresión que yo haya podido medir, pero la sesión destapó cinco defectos y siete observaciones de la plataforma.** Los dos importantes:

- **QA-01 (alta).** En `/map`, con un lote seleccionado en escala Meso o Macro, el panel «Capas de imagen» tapa los controles de la columna izquierda por debajo de unos 1150 px de ancho, y a 390 px el selector Micro/Meso/Macro queda fuera del área visible del mapa. El panel no se puede cerrar.
- **QA-02 (alta, de infraestructura).** Desde las 15:13Z `/api/live/*` responde 503 «Servicio temporalmente no disponible». Lo medido apunta a un tope de concurrencia reservada de 2 en la Lambda `live-api` y a un tiempo agotado de 10 s en `snapshot`; no hay indicio de que sea el despliegue de la marca, pero la causa raíz no está aislada.

Cifras de la parte que sale bien:

| Verificación | Resultado |
|---|---|
| `lang`, `title`, Barlow en `body` y `h1`, caras tipográficas, sin degradados, sin `backdrop-filter`, sin imágenes rotas | 20/20 vistas cada una |
| Peticiones a Google (`googleapis`, `gstatic`) | 0 en vivo y 0 en 34 archivos servidos |
| Errores de consola, `pageerror`, peticiones fallidas, HTTP ≥ 400 | 0 (fuera de la prueba negativa de contraseña) |
| Anillo de foco (Tab real) | `#004124` en el campo de usuario del login y `#74C69D` en las 15 paradas de las dos barras laterales oscuras |
| Cajón de 390 px | 6/6 rutas correctas |
| axe (wcag2a/2aa/21a/21aa) | 0 reglas serious/critical en 5 de 6 vistas |
| Niveles de alerta | Atención `rgb(255, 209, 102)` con tinta, «Normal» verde oscuro, «Registrado» neutro |

## 2. Entorno y release

| Elemento | Valor |
|---|---|
| URL | https://d3pz2gipvkcx1b.cloudfront.net (distribución E3LBUHUINTWS0F, estado Deployed) |
| Stack | `m3tric-staging-PlatformPreviewStack`, UPDATE_COMPLETE, última actualización 2026-10-02T14:34:52Z |
| Release | `platform-live-1c8e17d…`: commit `1c8e17d` «Identidad compartida con la landing: estilo, logo, español y tipografía (#190)», 2026-10-02 09:24 -05, squash de `25bcc1f`. `git diff 25bcc1f 1c8e17d` sobre `m3tric-platform/frontend` está vacío, de modo que el código fuente que cito es el desplegado |
| Artefactos servidos | `index.html` (last-modified 14:36:34 GMT), `/assets/index-Dwjw5J09.js`, `/assets/index-XyEHejSI.css` |
| Lambdas | `live-api` y `live-trend` modificadas a las 14:35:36Z, `live-parser` a las 14:37:11Z (mismo `CodeSha256`) |
| Navegador | Chromium 153.0.8010.12, Playwright 1.63.0, headless, locale es-CO, zona America/Bogota, escala 1 |
| Viewports | 1440×900 y 390×844 (agente de escritorio con viewport de 390, igual que la captura «antes»; no es emulación táctil) |
| axe | axe-core 4.13.0 con `@axe-core/playwright` 4.13.0 |
| Usuario | `smoke-qa-1790951964`, grupo `admin`, creado con `admin-create-user` y contraseña permanente; eliminado al final (sección 9) |
| Cuenta AWS | 147997127433, us-east-2 |

## 3. Método

- Un solo Chromium, páginas en secuencia; sin suites de prueba ni paralelismo. Cada ruta se mide tras `networkidle` y 1,5 s.
- Gestos reales: el foco se mide con la tecla Tab y se lee el estilo computado del elemento enfocado; el cajón, los selectores de escala y el tutorial se accionan con clics reales y sin `force`. Los «clics de prueba» (`trial`) de Playwright solo comprueban que el control es visible, estable y recibe eventos en su punto; no ejecutan la acción. No se pulsó «Empezar», «Crear sensor», «Eliminar», «+ Nuevo lote» ni «Subir imagen».
- Por página se recogen consola (error y warning), `pageerror`, `requestfailed`, respuestas ≥ 400, hosts de las peticiones y eventos `securitypolicyviolation` (con el escucha instalado antes de cualquier script). Las URL se guardan sin cadena de consulta.
- La prueba de contraseña incorrecta va en un cubo propio: por diseño produce un 400 de Cognito y un error de consola.
- Controles flotantes del mapa: caja de cada control recortada por los contenedores con `overflow`, cruces entre pares y `elementFromPoint` en el centro de cada control interactivo. Se distingue el contenido que requiere desplazamiento dentro de una columna con barra propia (alcanzable) del recortado por el `overflow:hidden` del panel (no alcanzable).
- Lecturas AWS: `sts`, `cognito-idp describe-user-pool` e `initiate-auth`, `cloudformation list-stacks`, `cloudfront get-distribution` y `get-response-headers-policy`, `lambda get-function-configuration` y `get-function-concurrency`, `apigateway get-stage` y `get-gateway-responses`, `cloudwatch get-metric-statistics`. Escrituras: `admin-create-user`, `admin-set-user-password`, `admin-add-user-to-group` y `admin-delete-user`.
- Contraste de las comprobaciones que axe deja en «revisión manual»: cálculo propio sobre los valores de los tokens, en el peor caso.
- Escaneo estático con `curl` de `index.html`, el paquete principal y los 31 recursos que referencia.

**Correcciones a mi propio arnés.** Hice ocho corridas (dos completas, cinco solo de `/map` y una de `/live`) y descarté la primera. Antes de aceptar cada veredicto contrasté los datos crudos, y eso destapó errores míos, no de la plataforma: el agregador leía el objeto equivocado; CDP no devuelve fuentes de `body` (no tiene texto propio); el primer `details > summary` del mapa era la atribución de MapLibre y no la lista de sensores; el nombre accesible del botón de descarga es «Descargar el archivo original de…»; los clics de prueba desplazan el panel con `overflow:hidden` y alteraban las mediciones siguientes (ahora se captura antes y se restaura el desplazamiento); y la lectura del borde del campo de usuario caía en mitad de la transición de 200 ms (ahora se espera 350 ms tras cada Tab). `/map` se repitió cinco veces; la última es la definitiva y las demás rutas salen de la segunda corrida completa.

## 4. Resultados por verificación

### 4.1 Identidad y contenido (20 vistas: login, 8 rutas y detalle de `/live`, a 1440 y 390)

| # | Verificación | Esperado | Observado | Veredicto |
|---|---|---|---|---|
| V01 | `html lang` | `es-CO` | `es-CO` en 20/20 | PASS |
| V02 | `document.title` | `M3TRIC \| Plataforma` | idéntico en 20/20 | PASS |
| V03 | `font-family` computado de `body` | contiene Barlow | `"DIN 2014 Rounded", Barlow, system-ui, sans-serif` en 20/20 | PASS |
| V04 | `font-family` computado del `h1` | contiene Barlow | 20/20 (en el login: 32 px, peso 800) | PASS |
| V05 | `document.fonts` | Barlow cargada | Barlow 300/400/500/700/800 `loaded`; ninguna cara Inter ni JetBrains Mono, en 20/20 | PASS |
| V06 | Fuente realmente pintada (CDP `getPlatformFontsForNode`) | solo Barlow web font | login 1440 y 390: `h1` Barlow-ExtraBold, `p` y `label` Barlow-Medium, `button` Barlow-Bold, todo web font | PASS |
| V07 | Logo `role=img` de nombre /M3TRIC/ | presente | 1 `svg` visible en login (160×31,5 a 1440; 128×25,2 a 390); `getByRole` lo encuentra | PASS |
| V08 | `background-image` con `gradient`, incluidos `::before`/`::after` | 0 | 0 en 20/20; 0 nodos SVG de degradado | PASS |
| V09 | `backdrop-filter` distinto de `none` | 0 | 0 en 20/20 | PASS |
| V10 | Contraseña incorrecta | error en español | «Usuario o contraseña incorrectos.» en un `role=alert`, a 1440 y a 390 | PASS |
| V11 | Palabras inglesas de la lista (mayúsculas exactas) en texto visible, atributos y título | 0 | 0 en 28 superficies (20 vistas, 6 cajones, 2 tutoriales); 0 más sin distinguir mayúsculas | PASS |
| V12 | Imágenes rotas | 0 | 0 en 20/20 | PASS |

El regex se probó con casos conocidos («Sign in», «Zoom   in», «Map marker», «Pitch y Roll», «Loading…») antes de fiarme del cero. «Total» sería un falso positivo en español («Total de sensores»); no apareció ningún caso.

### 4.2 Red, consola y CSP

| # | Verificación | Esperado | Observado | Veredicto |
|---|---|---|---|---|
| V13 | Peticiones a Google | 0 | 0 hosts de Google en vivo; 0 coincidencias de `fonts.googleapis`, `fonts.gstatic`, `googleapis.com`, `gstatic.com`, `googletagmanager`, `google-analytics` en los 34 archivos servidos | PASS |
| V14 | Orígenes de mapa (esperados) | AWS Location y/o OSM | `maps.geo.us-east-2.amazonaws.com`: 77 peticiones en 7 páginas. `tile.openstreetmap.org`: 0 | PASS |
| V15 | Cualquier otro origen = hallazgo | ninguno desconocido | 4 hosts en total: el propio (357 peticiones, 23 páginas), AWS Location, `cognito-idp.us-east-2.amazonaws.com` (4, autenticación) y `m3tric-staging-platform-overlays-147997127433-us-east-2.s3.us-east-2.amazonaws.com` (2, capa de imagen de `/map`). Los dos últimos son esperados por diseño | INFO (QA-09) |
| V16 | Errores de consola y `pageerror` | 0 | 0 (excluida la prueba negativa) | PASS |
| V17 | `requestfailed` salvo `ERR_ABORTED` | 0 | 0 | PASS |
| V18 | Respuestas HTTP ≥ 400 | 0 | 0 (excluida la prueba negativa). Ver QA-02 para las corridas posteriores | PASS |
| V19 | Prueba negativa | 1 error de consola y 1 HTTP 400 de Cognito por viewport | exactamente eso, a 1440 y a 390 | PASS |
| V20 | `securitypolicyviolation` | 0 | 0 eventos. **No hay CSP**: la política de cabeceras de CloudFront es `Managed-SecurityHeadersPolicy` con `ContentSecurityPolicy` vacío y el HTML no trae `<meta>`; el cero no demuestra nada | INFO (QA-06) |

### 4.3 Anillo de foco (Tab real)

| # | Contexto | Paradas | `outline` medido | Veredicto |
|---|---|---|---|---|
| V21 | Login, campo «Usuario», 1440 y 390 | Tab nº 1 | `rgb(0, 65, 36)` 2 px solid, offset 2 px, `:focus-visible`; borde del campo `rgb(0, 65, 36)` ya asentado | PASS |
| V22 | `/live` 1440 (detalle), barra lateral oscura | 6 (marca y 5 enlaces) | `rgb(116, 198, 157)` 2 px solid en las 6 | PASS |
| V23 | Shell 1440 (`/dashboard`), barra lateral oscura | 9 (logo, 7 enlaces y «Cerrar sesión») | `rgb(116, 198, 157)` 2 px solid en las 9 | PASS |
| V24 | `/live` 390, navegación móvil clara (informativo) | 6 | `rgb(0, 65, 36)` 2 px solid | PASS |

Capturas con el foco visible: `focus-login-username-1440.webp`, `focus-login-username-390.webp`, `focus-live-sidebar-1440.webp`, `focus-shell-sidebar-1440.webp`, `focus-live-mobile-nav-390.webp`. La barra lateral de `/live` solo existe en la vista de detalle (con un único dispositivo o tras elegirlo); con los dos dispositivos del staging se muestra primero la lista, así que el clic en una tarjeta fue un gesto de solo lectura.

### 4.4 Móvil (390 px), cajón y tutorial

| # | Verificación | Observado | Veredicto |
|---|---|---|---|
| V25 | Sin desplazamiento horizontal | `scrollWidth` = `clientWidth` = 390 en las 10 vistas | PASS |
| V26 | La barra lateral fija de 288 px ya no ocupa el ancho | `aside` con `display:none` en las 6 rutas del shell; barra superior de 64 px; botón «Abrir menú» de 44×44; contenido de 390 px | PASS |
| V27 | Cajón de navegación | 6/6 rutas: panel de 320×844, `role=dialog` con `aria-modal`, foco inicial en «Cerrar menú», `main` inerte, Escape cierra y devuelve el foco a «Abrir menú»; ocho enlaces en español | PASS |
| V28 | `/live` y `/live/raw` | No tienen barra superior ni cajón (están fuera de `MainLayout` por DEC-18); `/live` usa su propia navegación móvil | N/A |
| V29 | Tutorial de primera visita en `/sensors` | Aparece una vez (512×347 a 1440, 358×363 a 390), se cierra con `aria-label="Cerrar tutorial"`, deja `m3tric_onboarding_tutorial_seen=true` y ningún diálogo abierto. A 1440 se leyeron los 5 pasos con los puntos de paso, sin tocar «Siguiente» ni «Empezar» | PASS |

### 4.5 Mapa: superposiciones (`/map`)

| Estado | Controles medidos | Cruces | Tapados por otro control | Recortados | Fuera del panel | Clics de prueba | Veredicto |
|---|---|---|---|---|---|---|---|
| 1440 Micro | 6 | 0 | 0 | 0 | 0 | 10/10 | PASS |
| 1440 Micro con lista de sensores abierta | 6 | 0 | 0 | 0 | 0 | | PASS |
| 1440 Meso (lote seleccionado, panel de capas visible) | 9 | 0 | 0 | 0 | 0 | 15/15 | PASS |
| 1440 Meso con lista abierta | 9 | 0 | 0 | 0 | 1 (Subir imagen, 25 px) | | FAIL (QA-05) |
| 390 Micro | 6 | 0 | 0 | 0 | 0 | 10/10 | PASS |
| 390 Micro con lista abierta | 6 | 0 | 0 | 0 | 0 | | PASS |
| 390 Meso | 9 | 6 | 20 | 1 (Selector de escala) | 1 | 11/15 | FAIL (QA-01) |
| 390 Meso con lista | 9 | 6 | 20 | 1 | 3 | la lista no se pudo abrir con un clic real | FAIL (QA-01) |

Controles medidos en Meso: controles de MapLibre, atribución, selector de vista, «Lote activo», «Atenuación», «Sensores en el mapa», zona «Capas de imagen/Subir imagen», selector de escala y el panel «Lote seleccionado / Capas de imagen». El panel de capas sí se pudo medir sin escribir nada: el administrador ve los lotes existentes. A 1440 el panel (x 935-1351) queda a 17 px de los controles de MapLibre (x 1368) y 18 px por debajo del selector de escala, es decir, el arreglo de la marca funciona.

### 4.6 axe (wcag2a, wcag2aa, wcag21a, wcag21aa)

| Vista | Reglas con violación | serious/critical | Pasan | Revisión manual |
|---|---|---|---|---|
| `/login` 1440 | 0 | 0 | 26 | 1 (`color-contrast`, 7 nodos) |
| `/dashboard` 1440 | 0 | 0 | 26 | 0 |
| `/sensors` 1440 (tras el tutorial) | 0 | 0 | 25 | 0 |
| `/live` 1440, lista de dispositivos | 0 | 0 | 21 | 0 |
| `/live` 1440, detalle de dispositivo | **1** | **1** (`role-img-alt`, 2 nodos) | 29 | 1 (`th-has-data-cells`) |
| `/dashboard` 390 con el cajón abierto | 0 | 0 | 21 | 2 (`bypass`, `color-contrast`) |

Los «incomplete» de contraste los resolví por cálculo en el peor caso, no por medición de píxeles. Login: texto blanco sobre el velo del 80 % de `#004124` aplicado a un píxel de foto completamente blanco, 6,57:1; `#B7E3C7`, 4,64:1; párrafo al 90 % de blanco, 5,70:1. Cajón: `#B7E3C7` sobre la tarjeta (blanco al 8 % sobre `#004124`), 6,65:1. Todos superan 4,5:1.

### 4.7 Niveles de alerta

| # | Verificación | Observado | Veredicto |
|---|---|---|---|
| V30 | «Atención» (clase `status-badge-attention`) | fondo `rgb(255, 209, 102)`, texto `rgb(11, 15, 13)`, contraste 13,38:1, marca circular | PASS |
| V31 | «Normal» (tono `success`) | fondo `rgb(0, 65, 36)`, texto blanco, contraste 11,79:1 | PASS |
| V32 | Neutro (tono `default`) | sin relleno, borde discontinuo `rgb(44, 105, 79)`, texto del mismo color | PASS |
| V33 | El naranja de Alerta solo vive en `status-badge-alert` | de los 8 tonos, solo `alert` tiene fondo `rgb(247, 127, 0)` | PASS |
| V34 | «Registrado» en `/sensors` | clase `status-badge-default`, fondo `rgba(0, 0, 0, 0)`, borde discontinuo; nada naranja | PASS |
| V35 | «Callado» en `/live` (nivel Atención) | 4 insignias con fondo `rgb(255, 209, 102)` y tinta | PASS |
| V36 | «Atención» y «Normal» naturales en `/dashboard` | no aparecen con los datos de hoy: solo «Sin datos» (neutra) y «Sin señal» (crítica `rgb(214, 40, 40)`) | N/A, cubierto por la sonda de clase |

V30 a V33 se miden sobre la hoja de estilos real: inyecto un elemento con las clases de la aplicación en la página servida, leo el estilo computado y lo retiro. No sustituye ver la insignia en pantalla (V35 y V34 sí son naturales).

## 5. Antes y después

El «antes» sale de `docs/evidence/platform-brand/before/findings.json`; apliqué el mismo regex a sus textos, botones y marcadores (el «después» además cubre atributos y título).

| Medida | Antes | Después |
|---|---|---|
| Tipografía del cuerpo | `Inter, system-ui, …` en 9/9 rutas; Inter 400/500/600/700 cargadas; JetBrains Mono declarada; etiquetas en `ui-monospace` | `"DIN 2014 Rounded", Barlow, system-ui, sans-serif` en 20/20; solo Barlow declarada (5 pesos, todos cargados) y pintada como web font |
| Origen de la tipografía | Google Fonts (según el encargo; la captura anterior no registró hosts) | Propio: 5 archivos `.woff2` en `/assets` (200 la primera vez, 304 después); 0 peticiones a Google |
| `lang` | `en` (9/9) | `es-CO` (20/20) |
| `title` | `M3TRIC \| Geospatial Analytics Platform` | `M3TRIC \| Plataforma` |
| Elementos con degradado | 44 en 9 rutas (hasta 8 en `/dashboard`; 8 valores distintos) | 0 de 20 vistas |
| Elementos con `backdrop-filter` | 25 en 9 rutas (hasta 6 en `/map`) | 0 de 20 |
| Textos en inglés (mismo regex) | 38 coincidencias en 9 rutas | 0 en 28 superficies |
| Cadenas del shell | «Connected Platform», «Operational intelligence across sensors, territory, and environmental signals.», «Navigation», «Session», «Log out», «v0.1.0 · landing-aligned UI» | «Navegación», «Sesión», «Cerrar sesión», «Entender el territorio para anticipar el riesgo.», «v0.1.0» |
| Barra lateral a 390 px | `aside` fija de 288 px que dejaba 102 px a la columna de contenido (6 rutas del shell) | `aside` oculta; barra superior de 64 px, cajón de 320×844; contenido de 390 px |
| Errores de consola | 0 | 0 |
| Avisos de consola | MapLibre («Expected value to be of type number…», «Map cannot fit within canvas…») y avisos del controlador GL | Los mismos tipos: 115 + 1 avisos de MapLibre y 5 avisos GL (ver QA-11) |
| Anillo de foco, niveles de alerta, axe, superposiciones del mapa | no medidos | secciones 4.3 a 4.7 |

## 6. Defectos y observaciones

Severidad: alta (función inalcanzable o servicio caído), media, baja, informativa. «Preexistente» significa que no lo introduce la marca; indico en cada caso con qué lo sé.

### Defectos

**QA-01. `/map`: el panel «Capas de imagen» tapa la columna de controles y, a 390 px, el selector de escala queda fuera de vista. Severidad alta (móvil y ventanas estrechas).**
- Dónde: escala Meso o Macro con un lote seleccionado (el administrador ve «medellin», «medellín» y «rionegro»; el primero queda activo). Los 1440 y los anchos de 1200 px o más están limpios.
- Barrido de anchos, Meso con lote (ventana de escritorio redimensionada, mismo documento): 1280 px (panel de mapa de 928 px) y 1200 px (848 px) sin cruces; 1150 px (798 px) 2 cruces; 1100 px (748 px) 3; 1024 px (672 px) 4 cruces y 4 elementos tapados; 768 px (704 px) 3 y 4; 600 px (568 px) 4 y 10; 480 px (448 px) 5, 18 y el selector recortado; 390 px (358 px) 6 cruces, 20 elementos tapados y el selector recortado.
- A 390 px: el panel (416 px de ancho máximo, `right-14 top-[4.5rem] z-20`) ocupa 284 de los 358 px del mapa y cubre «Lote activo», «Atenuación», «Sensores en el mapa» y «Subir imagen», además de la atribución. El selector Micro/Meso/Macro queda en y = 894 px, 49 px por debajo del borde inferior del panel (845), recortado por su `overflow:hidden`. Ver `map-meso-390.webp` y `map-meso-768.webp`.
- Evidencia de gesto real: Playwright informa «…subtree intercepts pointer events» para «+ Nuevo lote», el interruptor «Atenuar fuera del lote», «Subir imagen» y el resumen «Sensores en el mapa» (11 de 15 clics de prueba posibles); un clic real sobre el resumen se agotó a los 4 s. Para llegar al selector Playwright tuvo que desplazar el panel de `scrollTop` 0 a 88 px, y ese contenedor no lo desplazan ni el ratón ni el tacto. Con teclado se llega tras 20 Tab y el navegador desplaza el panel solo. El panel no se puede cerrar: `OverlayPanel` acepta `onClose`, pero `EnterpriseMapView` no se lo pasa (confirmado en el código y en las capturas).
- Consecuencia: un usuario táctil en móvil que pase a Meso no ve cómo volver a Micro y no puede usar el resto de controles. La escala no se persiste, así que recargar la página es la salida.
- Atribución: preexistente. El commit de la marca movió el panel (`right-4 top-4` a `right-14 top-[4.5rem]`) y añadió `pr-14` al contenedor para despejar los controles de MapLibre; eso arregló 1440 y mejoró lo estrecho sin resolverlo. La geometría anterior (ancho `min(26rem, 100% - 2rem)`, 326 px a 390) ya cubría la columna; es una deducción del código, porque el «antes» solo tiene Meso a 1440.
- Recomendación: a menos de unos 1200 px, sacar el panel de la superposición absoluta (hoja inferior plegable o una sola columna en flujo, como ya se hizo con las otras dos pilas), darle botón de cierre visible y colocar el selector de escala en el flujo. Cerrar el arreglo midiendo `elementFromPoint` y un clic real en 390, 768, 1024 y 1150.

**QA-02. `/api/live/*` responde 503 «Servicio temporalmente no disponible». Severidad alta; infraestructura, no atribuible a la marca.**
- Línea de tiempo: en la corrida completa de 15:03 a 15:06Z `/live` y su detalle cargaron sin un solo error. Desde las 15:13Z fallan. En la repetición de 15:21Z el detalle quedó en «Preparando la visualización…» (no conservé esa captura), con 503 en `snapshot`, `series`, `devices` y `overview`; el aterrizaje en `/dashboard` también recibió un 503 en `overview`.
- Reproducción sin navegador, con el token del usuario temporal: tres `GET /api/live/devices` espaciados dieron 200 (0,46 a 1,65 s). Tres ráfagas de 5 peticiones en paralelo (lo que lanza una carga de página) dieron 503 en 4 de 5, en 3 de 4 válidas (una de las 5 fue una consulta mía mal formada, un 400 que ignoro) y en 4 de 5: dos o tres respuestas inmediatas (0,40 a 0,47 s) y una de 10,4 a 10,6 s por ráfaga. A las 15:29Z una sola petición a `snapshot?device=m3tric-scn-test-01` tardó 10,35 s y devolvió 503, mientras `devices` seguía en 200.
- Configuración leída: `live-api` y `live-trend` con `ReservedConcurrentExecutions: 2` (el parser ya está en 24); stage `preview` con `throttlingRateLimit` 2,0 y `throttlingBurstLimit` 5 para todos los métodos, sin planes de uso; el 503 corresponde a la respuesta de pasarela `INTEGRATION_FAILURE` (la de `THROTTLED` es un 429, que no vi nunca).
- CloudWatch (tramos de 5 min): `5XXError` del API 0 hasta las 10:08 locales, luego 2, 5 y 31; `live-api` con errores en 4 de 5, 10 de 11 y 16 de 25 invocaciones, `Throttles` de 2 y 10, `Duration` máxima de 10 000 ms (el límite) y `ConcurrentExecutions` en el tope de 2.
- Atribución: el despliegue (14:34 a 14:37Z) solo cambió textos de usuario en `thresholds.py` y en los handlers de `platform-admin`, y la corrida de las 15:03Z lo ejercitó sin errores; los fallos empiezan hacia las 15:13Z, cuando la estación SmartNode volvió a transmitir (`lastFrameAt` de 15:25:35Z, con 0,3 s de antigüedad). **No puedo descartar que mi sondeo contribuyera**: el volumen en los tramos con fallos (24, 18 y 43 peticiones al API en 5 min) no superó al de los tramos sin errores (41 y 37), lo que sugiere que no es solo carga, pero la causa de los 10 s no está aislada.
- Recomendación: subir la concurrencia reservada de `live-api` y `live-trend` por encima de la ráfaga de una página (hay 902 sin reservar en la cuenta), subir el límite del stage, investigar por qué `snapshot` supera 10 s con un dispositivo transmitiendo y escalonar el arranque de la página.

**QA-03. `/live` (detalle de dispositivo): axe `role-img-alt`, 2 nodos serious. Severidad media (accesibilidad, WCAG 1.1.1).**
- Los dos contenedores de ECharts (`div.echarts-for-react[role=img]`) no tienen nombre accesible. Pasa en el estado observado (dispositivo callado, gráficas sin datos). La lista de dispositivos de `/live` sí pasa. Criterio del encargo (cero serious/critical): incumplido en esta vista. `th-has-data-cells` queda en revisión manual en la tabla de inclinometría, que sí trae `<caption>`.
- Preexistente: las líneas `aria: { enabled: true, decal: { show: true } }` y el `<div role="img" aria-label=…>` envolvente de `LiveLineChart.tsx` no cambian en el commit de la marca. Causa probable (confianza media): ECharts pone `role=img` en su contenedor y solo genera la etiqueta cuando hay series con datos.
- Recomendación: marcar el contenedor interno como presentacional o darle etiqueta propia, y repetir con datos.

**QA-04. `/map`, lista «Lotes existentes»: el nombre de cada lote se reduce a 3,2 px. Severidad media (usabilidad, junto a acciones destructivas).**
- Las tres filas («medellin», «medellín», «rionegro») miden 262 px y el botón del nombre 3,2 px, con el texto recortado; solo se ven «Editar límites», «Renombrar» y «Eliminar», sin saber de qué lote. Se repite a 1440 y 390 y con la lista abierta. Ver `map-meso-1440.webp`.
- Preexistente: la captura `before/map-meso-1440.webp` muestra las mismas filas sin nombre. Causa probable: el botón del nombre usa `flex-1 truncate text-left text-sm` sin `min-w-0` (línea 517 de `FieldSelector.tsx`) y las tres acciones ocupan el ancho.
- Recomendación: dar espacio al nombre (acciones en segunda línea o iconos con tooltip).

**QA-05. `/map` 1440×900, Meso con «Sensores en el mapa» desplegado: la zona «Capas de imagen» se corta 25 px por abajo. Severidad baja.**
- La columna izquierda suma unos 652 px dentro de un contenedor de 612 px; la zona de carga baja hasta y = 857,9 frente al borde del panel en 832,9, y el desplazamiento interno `overflow-y-auto` no se activa porque la columna no está acotada en altura. Con la lista cerrada cabe con 1 px de holgura (815,9 frente a 816,9), así que cualquier altura añadida lo rompe. Ver `map-meso-1440-lista.webp`.
- No determino si es regresión: el panel «Lote activo» mide 248 px ahora y no medí el «antes» con la lista abierta.

### Observaciones

**QA-06. No hay Content-Security-Policy. Severidad media (seguridad, ajena a la marca).** `Managed-SecurityHeadersPolicy` con `ContentSecurityPolicy` vacío; los documentos solo llevan X-XSS-Protection, X-Frame-Options, HSTS, Referrer-Policy y X-Content-Type-Options. El comentario de `index.html` (DEC-54) da por hecho un `font-src 'self'` que no existe, y la sesión de Cognito vive en `localStorage`. La garantía de «sin tipografía externa» la verifiqué por red y por escaneo estático, no por política. Recomiendo una CSP en la política de cabeceras.

**QA-07. `/live` y `/live/raw` no tienen ningún enlace de salida. Severidad baja.** 0 enlaces en la lista, en `/live/raw` y, por el DOM y el código, solo anclas internas (`#resumen`…) en el detalle. Quien entra por «Análisis» pierde la barra lateral y solo vuelve con el botón Atrás o la URL. Es el diseño de DEC-18 (siguen fuera de `MainLayout`) y ocurría igual en el «antes»; lo anoto como decisión de producto.

**QA-08. CSS muerto en el paquete.** `main.css` trae `.bg-gradient-to-r`, dos utilidades `bg-[…gradient(…)]`, `.backdrop-blur-xl`, `.backdrop-saturate-150` y `.backdrop-filter`, sin ningún elemento que las use (0/20). Nacen de cadenas de prueba en `brand.test.ts` y `spanish-ui.test.ts`, que el glob de Tailwind (`./src/**/*.{js,ts,jsx,tsx}`) incluye. Inocuo en ejecución; conviene excluir `*.test.*` del `content`.

**QA-09. Orígenes que no son de mapa.** Cognito (4 peticiones, solo en el login) y el bucket S3 de superposiciones (2 peticiones, la capa de imagen que se carga en `/map` Meso) son esperados por diseño; no hubo `tile.openstreetmap.org` ni Google.

**QA-10. «Registrado» tiene dos tonos.** Neutro y discontinuo en `/sensors` (`default`), relleno verde claro en la lista de sensores del mapa (`info`, `rgba(183, 227, 199, 0.45)`). Ninguno es naranja, así que el criterio se cumple; el código de `SensorListAccessible` lo fija así.

**QA-11. Avisos de consola.** 115 de «Expected value to be of type number, but found null instead», 1 de «…found string instead» (validación de estilos de MapLibre sobre el estilo de AWS Location) y 5 avisos del controlador GL («GPU stall due to ReadPixels»). Son del mismo tipo que en el «antes» y no son errores.

**QA-12. Tipografía residual y detalle visual.** 16 elementos con `"Helvetica Neue", Arial` (la atribución de MapLibre, CSS de la librería) y 8 con monoespaciada (`code.font-mono` y los topics MQTT, intencional). De 721 elementos con texto visible, 697 usan la pila de Barlow. En `/live` a 1440 el `h1` «Monitoreo en vivo» se parte en dos líneas y deja «vivo» solo.

## 7. Límites de esta verificación

- Solo Chromium. El viewport de 390 usa un agente de escritorio y no simula gestos táctiles: la inalcanzabilidad táctil de QA-01 se deduce de que `overflow:hidden` no se desplaza con el dedo ni con la rueda, y se apoya en la geometría y en el desplazamiento programático que Playwright tuvo que hacer.
- El detalle de `/live` (barra lateral, foco, axe) viene de la corrida de las 15:03Z; después `/api/live/*` falló y no pudo repetirse. Los resultados con datos reales de gráficas (QA-03) quedan por confirmar.
- «Atención» y «Normal» naturales en `/dashboard` no se observaron porque la estación estaba callada; se cubren con la sonda de clase.
- Contraste de los «incomplete» de axe: cálculo en el peor caso, no medición de píxeles. No se probó con lector de pantalla.
- El cero de eventos CSP no es una prueba (no hay CSP). El criterio «sin Google» se sostiene en la red y en el escaneo estático.
- La atribución «preexistente» se apoya en el diff del commit, en el código anterior y en la captura «antes»; donde el «antes» no cubre el estado lo digo.
- No se midió Lighthouse en esta pasada; hay informes previos en `docs/evidence/platform-brand/lighthouse/`.
- Alturas de viewport: el panel del mapa mide `38rem` o más con independencia de la altura, por lo que medí 900 y 844 y no 700 ni 560.

## 8. Evidencia

Todo en `docs/evidence/platform-brand/after/` (53 archivos, 2,0 MB). Capturas en WebP calidad 78, máximo 1440×9000.

| Archivo | Contenido |
|---|---|
| `findings.json` | Datos crudos y consolidados: `meta` (release, infraestructura, corridas), `views` por viewport y ruta (fuentes, `lang`, `title`, hosts, degradados, textos y enlaces, insignias, foco, mapa), `network` por página, `hosts`, `axe`, `checks` (72 comprobaciones con veredicto), `englishScan`, `incidents.liveApi503`, `staticScan`, `shots` |
| `axe-login-1440.json`, `axe-dashboard-1440.json`, `axe-sensors-1440.json`, `axe-live-1440.json`, `axe-live-device-1440.json`, `axe-dashboard-390-drawer.json` | Informes de axe: violaciones completas, revisión manual, reglas que pasan y no aplicables |
| `login-1440`, `login-390`, `login-error-1440`, `login-error-390` | Login y error de contraseña incorrecta |
| `dashboard`, `map`, `sensors`, `live`, `live-raw`, `settings`, `alerts`, `reports` con sufijos `-1440` (página completa) y `-390` (ventana) | Una captura por ruta y ancho |
| `dashboard-390-drawer`, `map-390-drawer`, `sensors-390-drawer`, `settings-390-drawer`, `alerts-390-drawer`, `reports-390-drawer` | Cajón abierto a 390 |
| `live-device-1440`, `live-device-390` | Detalle de dispositivo de `/live` |
| `sensors-tutorial-1440`, `sensors-tutorial-390`, `sensors-tutorial-slide3-1440`, `sensors-tutorial-slide5-1440` | Tutorial de primera visita (pasos 3 y 5 con los puntos de paso) |
| `map-micro-1440`, `map-meso-1440`, `map-micro-390`, `map-meso-390` y las variantes `-lista` | Panel del mapa por escala y ancho, con y sin la lista de sensores |
| `map-meso-768` | Colisión a 768 px |
| `focus-login-username-1440`, `focus-login-username-390`, `focus-live-sidebar-1440`, `focus-shell-sidebar-1440`, `focus-live-mobile-nav-390` | Estados con foco |

Comparación: `docs/evidence/platform-brand/before/` (capturas y `findings.json` anteriores).

## 9. Limpieza

- Usuario temporal `smoke-qa-1790951964` eliminado con `admin-delete-user`. Comprobación posterior: `admin-get-user` devuelve `UserNotFoundException: User does not exist.` y `list-users` con el prefijo `smoke-qa-` devuelve una lista vacía.
- Script temporal `.qa-live.tmp.mjs` eliminado del repositorio. `git status` solo muestra `docs/evidence/platform-brand/after/` y este informe; no se editó ningún otro archivo.
- Eliminados también los archivos temporales con credenciales o respuestas de la API (archivo de credenciales, ráfagas, copias de seguridad de corridas).

## 10. Confianza

- Global: alta en las mediciones (todas con salida cruda en `findings.json`); media en las causas probables de QA-02 y QA-03.
- Lo que me deja menos seguro: qué desencadenó los 10 s de `snapshot` (QA-02), si el estado con datos de las gráficas sigue incumpliendo axe (QA-03) y la alcanzabilidad táctil real en un móvil (QA-01).
- Convendría que lo revisara quien lleve la infraestructura de `platform-live` (QA-02) y un revisor de accesibilidad con lector de pantalla (QA-03).
