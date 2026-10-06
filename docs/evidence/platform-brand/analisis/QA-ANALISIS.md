# QA en vivo de «Análisis dentro del shell de la plataforma» (DEC-64) — release 4795cd2

Fecha: 2026-10-06. Ejecuta: WU-AN-9, QA en vivo del despliegue de `platform-live-4795cd2…`. Alcance: solo lectura sobre el despliegue; las únicas escrituras en AWS fueron crear y borrar dos usuarios temporales de Cognito (sección 12). Contrato: `M3TRIC_Platform/docs/platform-live-dashboard/08-analisis-en-el-shell.md` §7.4 (estados E1 a E6, cinco anchos, comprobaciones C1 a C16), §5 (REQ-AN), §4.6 y §4.7. Lo medido es del despliegue real; lo sintético (series y posición inventadas, inyectadas por interceptación de red en el navegador) y lo emulado (la compilación anterior servida en local) se rotula como tal. Datos crudos y consolidados en `findings.json` de esta carpeta.

**Actualización posterior (2026-10-06, release c0be045):** AN-02 está corregido y el cajón (AN-01) también en lo que dependía de su código; lo medido en la apertura el primer día era en parte un artefacto de `locator.click()`, y queda un residuo de teclado (AN-01b). Ver la sección 14; las secciones 1 a 13 describen la release 4795cd2 tal como se midió.

## 1. Resumen

**«Análisis» vive dentro del shell y se comporta como una sección más de la plataforma.** En los cinco anchos y los seis estados: 1 `main`, ninguna barra lateral ni `main` propios, ninguno de los selectores del cromo antiguo, «Análisis» con `aria-current="page"` (también en `/live/raw`) y ningún otro enlace marcado; se sale a Mapa y se vuelve con la navegación global sin usar Atrás (20 de 20 combinaciones); ningún desborde del documento ni de `.app-shell-main`; la barra de secciones queda a 0 px (≥1024) o 64 px (<1024) con la página desplazada y los anclajes (4 con el dispositivo real, 6 con datos sintéticos) dejan el título ≥ 53,1 px por debajo de ella sin que `elementFromPoint` devuelva la barra; todos los objetivos miden ≥ 44 px (los rótulos del selector pasaron de 36 a 44 px, la cápsula mide 50,8 px); el cajón abre con el foco en «Cerrar menú», deja `inert` el contenido y la barra, atrapa Tab y Escape devuelve el foco; el `h1` «Monitoreo en vivo» ocupa una línea en los cinco anchos (antes, dos líneas a 1440, QA-12, y a 1280, 1024 y 1023 en la compilación anterior servida en local); `scrollY` vuelve a 0 al cambiar de ruta; la recarga conserva el shell; las rejillas de resumen de Análisis miden ≥ 265 px entre 1024 y 1180 px; 0 errores de consola, 0 `pageerror`, 0 peticiones fallidas reales y 0 respuestas 503 en las cinco corridas principales con el administrador y las cinco de la cuenta sin dispositivos (las cancelaciones `ERR_ABORTED` por navegar y los 500 que la QA fuerza en E6 se cuentan aparte). axe no muestra ninguna regla serious o critical nueva respecto de la línea base del despliegue anterior.

**Defectos (sección 8).** Dos los introduce este cambio: **AN-01 (media-baja)**: con el detalle desplazado, abrir el cajón mueve la página (800 → 343 px a 390; 800 → 381 a 1023) y cerrarlo la lleva a 0; lo causa `html:has(.live-section-nav){scroll-padding-top}` frente a los `focus()` del propio cajón y desaparece al anularlo. **AN-02 (baja)**: `/live/raw` a 1024 px deja las tres tarjetas de resumen en 213,3 px (309,3 antes), parte «recepciones» a mitad de palabra y apoya el rótulo en el icono. El resto es preexistente: la leyenda cruza el primer tick (AN-03), `role-img-alt` (AN-04, QA-03), «Actualizar ahora» pierde el foco en cada sondeo (AN-05) y cuatro informativas (AN-06 a AN-09).

**Observación pedida por el Tech Lead (leyenda a 390 px en E2): sí hay cruce y es preexistente.** Con series sintéticas, la segunda fila de la leyenda (y 28,2 a 41,4 px) cubre 13,2×5,5 px del rótulo «-2.2» (x 21,8 a 44, y 35,9 a 48,1). La compilación anterior servida en local con los mismos datos da el mismo cruce (13,2×5,5 px). La captura `after/live-device-390.webp` es de la ventana (844 px de alto) y no llega a las gráficas, así que no sirve para compararla; ver sección 7.

| Comprobación | E1 | E2 | E3 | E4 | E5 | E6 | Inicio | Notas |
|---|---|---|---|---|---|---|---|---|
| C1 Landmarks | PASS | PASS | PASS | PASS | PASS | PASS | — |  |
| C2 Shell y estado activo | PASS | PASS | PASS | PASS | — | — | — |  |
| C3 Salir sin Atrás | PASS | PASS | PASS | PASS | — | — | — |  |
| C4 Desbordes | PASS | PASS | FAIL 1024 | PASS | PASS | PASS | — | E3 a 1024: tarjetas de 213,3 px y «recepciones» partida (AN-02) |
| C5 Barra fija | — | PASS | — | — | — | — | — |  |
| C6 Anclajes | — | PASS | — | — | — | — | — |  |
| C7 Objetivos de 44 px | PASS | PASS | PASS | PASS | — | — | — |  |
| C8 axe | PASS | PASS | PASS | — | — | — | — | E2: `role-img-alt` ×2, idéntico a la línea base (AN-04); sin reglas nuevas |
| C9 Foco y cajón | — | PASS | — | — | — | — | — | REQ-AN-11 cumple; efecto lateral en el desplazamiento (AN-01) |
| C10 Gráficas y mapa | — | PASS | — | — | — | — | — | Mapa solo con datos sintéticos: 318 px de alto (<320 por el borde); AN-06 |
| C11 Cabecera | — | PASS | — | — | — | — | — | h1 de una línea a 1440 y 1280 |
| C12 Estados | — | — | — | PASS | PASS | PASS | — | E4 reproducido con una cuenta `visualizacion` |
| C13 Consola y red | PASS | PASS | PASS | PASS | PASS | PASS | — | Cancelaciones `ERR_ABORTED` aparte; 500 de E6 forzados |
| C14 Posición del scroll | — | PASS | — | — | — | — | — |  |
| C15 Recarga | PASS | — | PASS | — | — | — | — | E1 = `/live`, E3 = `/live/raw` |
| C16 Rejilla de resumen | PASS | PASS | — | — | — | — | PASS | Columna «Inicio»: 3 columnas sin cambio; tarjetas de Inicio 213,3 y 238,7 px a 1024 y 1100 (preexistente) |

PASS = cumple en todos los anchos medidos; «FAIL 1024» = falla a ese ancho; «—» = la comprobación no aplica a ese estado. C16 se mide a 1024, 1100, 1179 y 1180 px (no a los cinco anchos).

## 2. Entorno y release

| Elemento | Valor |
|---|---|
| URL | https://d3pz2gipvkcx1b.cloudfront.net (distribución E3LBUHUINTWS0F, `Deployed`, modificada 2026-10-06T16:23:19Z) |
| Stack | `m3tric-staging-PlatformPreviewStack`, `UPDATE_COMPLETE`, última actualización 2026-10-06T16:22:21Z |
| Release | `platform-live-4795cd2ccf4d36d50fe88799cb1cddcbe89d471b` (salida `ReleaseId`; `GitSha` 4795cd2…) |
| Artefactos servidos | `index.html` (`Last-Modified` 16:24:33 GMT), `/assets/index-p8ya_va5.js`, `/assets/index-CYUYS7dQ.css`, `/assets/PlatformLivePage-YFV4uOKm.js` (43.379 bytes) |
| Marcas del paquete (8.3, pasos 1 a 3; sin control negativo) | en el *chunk*: «Secciones de la vista en vivo» 1, «Todos los dispositivos» 1, «Navegación de monitoreo» 0, «Vista en vivo · requiere sesión» 0; en la hoja: `.live-section-nav` 1, `.live-sidebar`, `.live-shell` y `.live-mobile-nav` 0. `GET /`, `/live` y `/live/raw` devuelven el mismo SHA-256 (4f08c379…) |
| Navegador | Chromium 153.0.8010.12 (headless), Playwright 1.63.0, axe-core 4.13.0 con `@axe-core/playwright` 4.13.0, Node v25.6.0, macOS (Darwin 27.0.0, arm64), locale es-CO, zona America/Bogota |
| Viewports | 1440×900, 1280×800, 1024×768, 1023×768 y 390×844, escala 1 (agente de escritorio también a 390, sin emulación táctil, como en QA-REPORT y QA-NUNITO); C16: alto 768 |
| Usuarios | administrador `smoke-qa-an-1791304179` (grupo `admin`; ve los dos dispositivos del staging) y cuenta sin dispositivos `smoke-qa-an-nodev-1791304179` (grupo `visualizacion`); creados 2026-10-06 16:29Z y 16:30Z, eliminados al final (sección 12) |
| Dispositivos del staging | «Estación SmartNode 01» (`m3tric-scn-test-01`; «Callado», visto hace 19 h) y `ke-test-01` («Callado», hace 5 días). E2 usa el primero: sin series, secciones Resumen, Inclinometría, Calidad y Salud |
| Cuenta AWS | 147997127433, us-east-2; llamadas a `gh`: 0 |
| Corridas finales (UTC) | cuenta sin dispositivos 17:02:21 a 17:03:00; axe 17:03:51 a 17:04:22; rejilla 17:05:12; compilación anterior 17:06:20; principales 17:09:40 a 17:16:15 (1440, 1280, 1024, 1023, 390); sintéticas 17:16:21 a 17:22:56 |

**Qué es el «dispositivo callado»** (limita lo medible). Con el dispositivo real no hay series: las gráficas dibujan solo «°», la página mide 2199 px a 1440 (no se puede desplazar 1500 px: el máximo es 1299 px a 1440 y 1465 a 1280), y no existen las secciones Infiltración ni Posición. Para exponerlas hice una segunda pasada **sintética** sobre el mismo despliegue: el navegador intercepta `GET /api/live/series` y `/api/live/snapshot` y responde con la fixture saneada del equipo (`dev/platformLiveLocal.ts`) más un canal de posición `1c`; la página, el CSS y los componentes son los desplegados, y los datos son inventados. No publiqué tramas MQTT (habría escrito en el entorno compartido).

## 3. Método

Un solo Chromium a la vez; un contexto por ancho, cerrado antes del siguiente; sesión iniciada por la interfaz (`fill` y clic). Gestos reales: `locator.click()` sin `force`, rueda del ratón para desplazar (sobre el relleno derecho del contenido, un punto neutro), Tab y Mayús+Tab para el foco, y el estado bloqueado (el cajón abierto con un clic sobre la barra de secciones, la barra cubriendo un título). Medición: `getBoundingClientRect`, `elementFromPoint` en el centro del control o del título, `scrollWidth/clientWidth` del documento y de `.app-shell-main`, `ariaSnapshot` para los landmarks, cadena de rectángulos desde cada canvas hasta `main`.

- **Estados.** E1 lista (clic en «Análisis»); E2 detalle (clic en la tarjeta de «Estación SmartNode 01»); E3 raw (clic en «Vista de conectividad»); E4 cuenta sin dispositivos; E5 carga con `GET /api/live/devices` retrasado 9 s por `page.route` y recarga completa de `/live`; E6 con `/api/live/snapshot` forzado a 500, y «Reintentar» pulsado con la falla vigente y otra vez sin ella. **E4 se reproduce** con una cuenta `visualizacion`: el API de `platform-live` limita a quien no es `admin` a los sensores que posee (`owner = username`), y la cuenta nueva no posee ninguno; confirmado en vivo con el estado vacío y sin el enlace «Vista de conectividad» (C-1).
- **C5.** `top` de la barra a 300, 800 y 1500 px de desplazamiento (o el máximo, indicado) y barrido de ancho 1000, 1010, 1020, 1023, 1024, 1025, 1030, 1023, 1024 px con la página desplazada.
- **C6.** Cada enlace pulsado desde arriba y desde abajo del todo; se mide el desplazamiento final tras esperar a que cese (el `html` lleva `scroll-behavior: smooth`).
- **C9.** Orden de Tab desde el inicio real del documento (clic en un punto no focalizable arriba a la izquierda, para fijar el punto de partida) y cajón a 1023 y 390 con la página desplazada 800 px. **W1** (pedido por el Tech Lead): se desplaza para que un control quede a media ventana o parcialmente bajo la barra, se da foco al control anterior (o al siguiente) con `focus({preventScroll:true})` y se pulsa Tab (o Mayús+Tab) de verdad; se mide el control tras 1,3 s: `top` frente al `bottom` de la barra y `elementFromPoint`.
- **C8.** axe-core 4.13.0 con las etiquetas de la línea base (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`), a 1440 y 390, sobre E1, E2, E3 (más E6, el cajón abierto y E4).
- **Leyenda.** Instancia de ECharts por el fibra de React de `echarts-for-react`; rectángulos de cada elemento del *storage* de zrender (leyenda y etiquetas del eje Y) con su transformación; intersección entre ambos. Comparación con la compilación **anterior** (`an-impl/dist-base`, cuyo `index-DIokBpOc.js` es el que servía la release 66acab7) servida en local, con las mismas series sintéticas.
- **Clasificación de la red.** `ERR_ABORTED` (el cliente cancela una petición al desmontar la vista), 500 de E6 (forzados) y 404 de Inicio de la cuenta sin dispositivos (AN-08) se separan; 503 de `/api/live/*`: 0 (QA-02 no reapareció).

**Correcciones a mi propio arnés** (errores míos, no de la plataforma): (1) en una variable de zsh, `$VAR:admin` es un modificador de ruta y `admin-create-user` creó un usuario con nombre de ruta; la verificación del `Username` devuelto no lo detectó (coincidía con la variable mal formada) y lo vi al listar el pool; lo borré en el acto (16:30:06Z, `admin-get-user` → `UserNotFoundException`) y repetí la creación con `${…}`; (2) la primera medición del orden de Tab empezó en `main` porque había hecho clic arriba a la derecha; ahora se fija el punto de partida arriba a la izquierda; (3) `locator.focus({preventScroll:true})` de Playwright ignora la opción y desplaza la página: produjo un falso salto de 394 px al dar foco a un enlace de la barra y a la lógica del logotipo; lo sustituí por `element.focus({preventScroll:true})` y descarté esas lecturas (el salto de AN-01 se mide con clics reales y el `focus()` de la propia página); (4) los índices de los controles tabulables se desplazaban cuando «Actualizar ahora» estaba deshabilitado por el sondeo (los escenarios B de la primera pasada apuntaban a otro control): ahora se etiquetan una vez y se direccionan por etiqueta; (5) la primera lectura de `aria-current` en `/map` se hizo antes de que React actualizara el DOM; repetida con espera; (6) las visitas a `/map` caían en la cubeta de E1 y E3 (55 avisos de MapLibre): ahora tienen cubeta propia. Los números de las tablas son de las últimas corridas de cada fase.

## 4. Resultados por comprobación

### C1 Landmarks

Cada celda: `main` / «Navegación principal» / «Secciones de la vista en vivo» / cualquier landmark con «monitoreo» en el nombre. Bajo 1024 px la navegación vive en el diálogo: «0→1» es 0 con el cajón cerrado y 1 con el cajón abierto (leído con un clic real); en E5 y E6 no se abrió el cajón.

| Estado | 1440 | 1280 | 1024 | 1023 | 390 |
|---|---|---|---|---|---|
| E1 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 0→1 / 0 / 0 | 1 / 0→1 / 0 / 0 |
| E2 | 1 / 1 / 1 / 0 | 1 / 1 / 1 / 0 | 1 / 1 / 1 / 0 | 1 / 0→1 / 1 / 0 | 1 / 0→1 / 1 / 0 |
| E3 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 0→1 / 0 / 0 | 1 / 0→1 / 0 / 0 |
| E4 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 0→1 / 0 / 0 | 1 / 0→1 / 0 / 0 |
| E5 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |
| E6 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |

En E2 el árbol trae además `complementary` (≥1024; sin nombre, preexistente), `banner` (<1024) y las regiones «Resumen de estación», «Inclinometría» y «Alternativa textual de las gráficas de inclinometría». Ningún `h1` duplicado: un solo `h1` por estado.

### C2 Shell y estado activo

| Ancho | Barra lateral | Barra superior | `aria-current=page` en E1, E2, E3, E4 | complementary | banner | Selectores `.live-shell`, `.live-sidebar`, `.live-brand`, `.live-mobile-nav`, `.live-main`, `.live-footer` |
|---|---|---|---|---|---|---|
| 1440 | sí | no | Análisis, Análisis, Análisis, Análisis | 1 | 0 | 0 en los 4 estados |
| 1280 | sí | no | Análisis, Análisis, Análisis, Análisis | 1 | 0 | 0 en los 4 estados |
| 1024 | sí | no | Análisis, Análisis, Análisis, Análisis | 1 | 0 | 0 en los 4 estados |
| 1023 | no | sí | Análisis, Análisis, Análisis, Análisis | 0 | 1 | 0 en los 4 estados |
| 390 | no | sí | Análisis, Análisis, Análisis, Análisis | 0 | 1 | 0 en los 4 estados |

### C3 Salir sin Atrás

Con el gesto real (cajón a <1024 px): «Mapa» lleva a `/map` y «Análisis» vuelve a `/live` en **20 de 20** combinaciones (E1, E2, E3 y E4 × 5 anchos); desde E2 y E3 se llega a la lista (el dispositivo elegido es estado local). «Volver a Análisis» (E3) lleva a `/live` en los 5 anchos. El botón Atrás no se usó. `aria-current` por ruta, a 1440 y 390 (`aria-current.json` en `findings.json`): `/map` → Mapa, `/sensors` → Sensores, `/live` y `/live/raw` → Análisis; «Análisis» no lo tiene en `/map`.

### C4 Desbordes

| Ancho | Documento (E2) `scrollWidth/clientWidth` | `.app-shell-main` (E2) | Tarjetas de E1 (mín.) | Tarjetas de resumen de E2 | Tarjetas de resumen de E3 (`/live/raw`) | Elementos fuera de `main` (6 estados) |
|---|---|---|---|---|---|---|
| 1440 | 1440/1440 | 1152/1152 | 352 | 352 | 352 | 0 |
| 1280 | 1280/1280 | 992/992 | 298,7 | 298,7 | 298,7 | 0 |
| 1024 | 1024/1024 | 736/736 | 328 | 328 | 213,3 | 0 |
| 1023 | 1023/1023 | 1023/1023 | 309 | 309 | 309 | 0 |
| 390 | 390/390 | 390/390 | 358 | 358 | 358 | 0 |

Ningún elemento de la página cruza el borde derecho de `main` fuera de una región desplazable, en ningún estado. Las tarjetas de resumen de Análisis miden ≥ 240 px en todos los anchos; **las de `/live/raw` miden 213,3 px a 1024** (y 238,7 a 1100): AN-02. El detector marcó además dos casos de texto que sobrepasa su caja sin recortarse: `div.live-health-stat` a 1280 (4 y 10 px; AN-07, igual en la compilación anterior) y el rótulo «Objetos inspeccionados» de `/live/raw` a 1024 (16 px; AN-02).

### C5 Barra fija

| Ancho | `top` esperado | a 300 px | a 800 px | a 1500 px o el máximo | Con datos sintéticos (scrollY→top) | Barrido 1000→1030 px (top) |
|---|---|---|---|---|---|---|
| 1440 | 0 | 0 | 0 | 0 (a 1299 px de 1299) | 800→0, 1500→0, 2500→0 | 64 64 64 64 0 0 0 64 0 |
| 1280 | 0 | 0 | 0 | 0 (a 1465 px de 1465) | 800→0, 1500→0, 2500→0 | 64 64 64 64 0 0 0 64 0 |
| 1024 | 0 | 109,6 (aún sin pegar) | 0 | 0 (a 1500 px de 2384) | 800→0, 1500→0, 2500→0 | 64 64 64 64 0 0 0 64 0 |
| 1023 | 64 | 64 | 64 | 64 (a 1500 px de 2265) | 800→64, 1500→64, 2500→64 | 64 64 64 64 0 0 0 64 0 |
| 390 | 64 | 213,4 (aún sin pegar) | 64 | 64 (a 1500 px de 3239) | 800→64, 1500→64, 2500→64 | 64 64 64 64 0 0 0 64 0 |

La barra mide 61 px de alto en los cinco anchos, es opaca (`rgb(255, 255, 255)`; `elementFromPoint` en su borde derecho devuelve la barra), tiene `z-index` 30 frente a 40 de la barra superior. El `top` coincide con el esperado (±1 px) desde que se pega; a 300 px aún no se había pegado en los anchos donde la cabecera es alta. **El barrido 1000 → 1030 px no tiene estado intermedio**: `top` 64 hasta 1023 y 0 desde 1024, sin saltos de valor (el `scrollY` cambia por el reflujo del shell: 862 a 1023 px y 1055 a 1024 px en el barrido de 1440). **Límite**: con el dispositivo real la página no se desplaza 1500 px a 1440 ni a 1280 (máximos 1299 y 1465); se midió en el máximo y, con datos sintéticos, a 1500 y 2500 px en los cinco anchos (el `top` es el esperado en todos).

### C6 Anclajes

| Ancho | `scroll-padding-top` de `html` | Clics en el dispositivo real (4 enlaces ×2 orígenes) | Hueco mínimo título–barra (px) | Clics con datos sintéticos (6 enlaces ×2) | Hueco mínimo (px) | `elementFromPoint` que cae en la barra | «Resumen»: distancia del primer elemento al borde superior de la ventana, descontada la barra superior (px) |
|---|---|---|---|---|---|---|---|
| 1440 | 69px | 8 | 53,6 | 12 | 53,6 | 0 | 32 |
| 1280 | 69px | 8 | 53,6 | 12 | 53,6 | 0 | 32 |
| 1024 | 69px | 8 | 53,9 | 12 | 53,2 | 0 | 32 |
| 1023 | 133px | 8 | 53,1 | 12 | 53,1 | 0 | 32 |
| 390 | 133px | 8 | 53,9 | 12 | 53,3 | 0 | 24 |

Los cuatro enlaces del dispositivo real (Resumen, Inclinometría, Calidad, Salud) y los seis con datos sintéticos (más Infiltración y Posición) dejan el título a ≥ 53 px bajo la barra cuando la página puede desplazarse lo bastante; «Calidad» y «Salud» no llegan al borde superior en 1440 y 1280 con el dispositivo real porque la página termina antes (el hueco es mayor, nunca menor). **El caso bloqueado** (un título bajo la barra) se ejercita con los datos sintéticos: `#infiltracion`, `#posicion`, `#calidad` y `#salud` llegan hasta el borde de la barra y ninguno queda cubierto. `#salud` conserva su margen (61,4 px bajo la barra a 390). Con `prefers-reduced-motion: reduce` el desplazamiento es inmediato (`scrollY` a 0, 40, 80, 160 y 320 ms del clic: 1299, 1299, 1299, 1299, 1299); sin esa preferencia se anima (0, 2, 49, 528, 1145).

### C7 Objetivos

| Ancho | Enlaces de la barra (alto × ancho mín.) | Rótulos del selector (15 min / 1 h) | Cápsula (≤52) | «← Todos los dispositivos» | «Vista de conectividad» (E1, admin) | «Volver a Análisis» (E3) | «Actualizar ahora» | «Dar de alta un dispositivo» (E4) | «Reintentar» (E6) |
|---|---|---|---|---|---|---|---|---|---|
| 1440 | 44 × 72,1 | 44 / 44 | 50,8 | 44 | 44 | 44 | 44 | 44 | 44 |
| 1280 | 44 × 72,1 | 44 / 44 | 50,8 | 44 | 44 | 44 | 44 | 44 | 44 |
| 1024 | 44 × 72,1 | 44 / 44 | 50,8 | 44 | 44 | 44 | 44 | 44 | 44 |
| 1023 | 44 × 72,1 | 44 / 44 | 50,8 | 44 | 44 | 44 | 44 | 44 | 44 |
| 390 | 44 × 72,1 | 44 / 44 | 50,8 | 44 | 44 | 44 | 44 | 44 | 44 |

### C8 axe

| Estado-ancho | Reglas con violación | Violaciones | Revisión manual | Pasan | Línea base (despliegue anterior) |
|---|---|---|---|---|---|
| E1-1440 | 0 | — | — | 24 | 0 reglas (axe-live-1440.json) |
| E2-1440 | 1 | role-img-alt (serious) ×2 | th-has-data-cells (serious) ×1 | 28 | `role-img-alt` serious ×2; incompleta `th-has-data-cells` (axe-live-device-1440.json) |
| E3-1440 | 0 | — | — | 22 | sin línea base (la vista no tenía informe) |
| E6-1440 | 0 | — | — | 22 | sin línea base |
| E1-390 | 0 | — | — | 24 | sin línea base |
| E2-390 | 1 | role-img-alt (serious) ×2 | th-has-data-cells (serious) ×1 | 29 | sin línea base a 390 |
| E2-390-drawer | 0 | — | color-contrast (serious) ×1 | 22 | sin línea base |
| E3-390 | 0 | — | — | 22 | sin línea base |
| E4-1440 | 0 | — | — | 22 | sin línea base |
| E4-390 | 0 | — | — | 22 | sin línea base |

**Línea base.** `after/axe-live-1440.json` (lista, 0 violaciones, 2026-10-02) y `after/axe-live-device-1440.json` (detalle: `role-img-alt`, serious, 2 nodos; incompleta `th-has-data-cells`). **Resultado:** la lista (E1), `/live/raw` (E3), el error (E6), el vacío (E4) y el cajón abierto no tienen violaciones; el detalle (E2) tiene exactamente la misma: `role-img-alt` serious en los dos `div.echarts-for-react[role=img]` internos (QA-03, AN-04), sin reglas serious o critical nuevas. No hay línea base para `/live/raw` ni a 390 px; no aparecen violaciones, así que no hace falta atribuirlas. En el cajón abierto queda en revisión manual el contraste de «Rol: …» sobre el fondo semitransparente (incompleta; es del shell). Con datos sintéticos (E2 con posición) `role-img-alt` desaparece (las gráficas ya llevan nombre) y aparece `link-in-text-block` serious ×1 en el enlace «MapLibre» de la atribución (AN-09).

### C9 Foco y cajón

REQ-AN-11 a 1023 y 390 px, con el detalle desplazado 800 px:

| Ancho | Foco al abrir | `main`, barra de secciones y barra superior `inert` | Trampa de Tab | Foco tras Escape | Clic real en «Resumen» de la barra con el cajón abierto | «Navegación principal» / «de monitoreo» con el cajón abierto | `scrollY` antes → al abrir → tras Escape |
|---|---|---|---|---|---|---|---|
| 1023 | «Cerrar menú» | sí | 24 Tab y 10 Mayús+Tab, todos dentro | «Abrir menú» | bloqueado (tiempo agotado a 1,5 s) | 1 / 0 | 800 → 381 → 0 |
| 390 | «Cerrar menú» | sí | 24 Tab y 10 Mayús+Tab, todos dentro | «Abrir menú» | bloqueado (tiempo agotado a 1,5 s) | 1 / 0 | 800 → 343 → 0 |

El cajón hace lo especificado; lo que cambia es el desplazamiento (AN-01, sección 8). Orden de Tab desde el inicio del documento (4.6):

| Ancho | Resultado | Orden de Tab medido desde el inicio del documento (E2) |
|---|---|---|
| 1440 | coincide con 4.6 | M3TRIC, ir al inicio → Inicio → Mapa → Sensores → Análisis → Alertas → Reportes → Configuración → Cerrar sesión → Todos los dispositivos → 15 min → Actualizar ahora → Resumen → Inclinometría → Calidad → Salud → Alternativa textual |
| 1280 | coincide con 4.6 | M3TRIC, ir al inicio → Inicio → Mapa → Sensores → Análisis → Alertas → Reportes → Configuración → Cerrar sesión → Todos los dispositivos → 15 min → Actualizar ahora → Resumen → Inclinometría → Calidad → Salud → Alternativa textual |
| 1024 | coincide con 4.6 | M3TRIC, ir al inicio → Inicio → Mapa → Sensores → Análisis → Alertas → Reportes → Configuración → Cerrar sesión → Todos los dispositivos → 15 min → Actualizar ahora → Resumen → Inclinometría → Calidad → Salud → Alternativa textual |
| 1023 | coincide con 4.6 | M3TRIC, ir al inicio → Abrir menú → Todos los dispositivos → 15 min → Actualizar ahora → Resumen → Inclinometría → Calidad → Salud → Alternativa textual |
| 390 | coincide con 4.6 | M3TRIC, ir al inicio → Abrir menú → Todos los dispositivos → 15 min → Actualizar ahora → Resumen → Inclinometría → Calidad → Salud → Alternativa textual |

«Actualizar ahora» está deshabilitado mientras hay un sondeo en curso (AN-05) y no entra en la secuencia si se mide en ese instante; el orden se compara con y sin él.

**W1, teclado bajo la barra pegada:**

| Ancho | A. Mayús+Tab desde el primer enlace de la barra, desplazado al final | B. Tab/Mayús+Tab hacia la región «Alternativa textual…» colocada bajo la barra (dispositivo real) | B. Los 4 destinos (región, mapa, resumen de atribución, enlace MapLibre) ×2 teclas, datos sintéticos | Destino a media ventana |
|---|---|---|---|---|
| 1440 | «Actualizar ahora» a 148,1 px | no reproducible: la página no se desplaza lo bastante (máx. 1299 px) | 8: separación mín. 7,4 px, 0 cubiertos | 1: el control no se movió |
| 1280 | «Actualizar ahora» a 148,1 px | 1: separación 7,4 px | 8: separación mín. 7,4 px, 0 cubiertos | 1: el control no se movió |
| 1024 | «Actualizar ahora» a 271,8 px | 1: separación 6,7 px | 8: separación mín. 6,7 px, 0 cubiertos | 1: el control no se movió |
| 1023 | «Actualizar ahora» a 210,6 px | 1: separación 6,9 px | 8: separación mín. 6,9 px, 0 cubiertos | 1: el control no se movió |
| 390 | «Actualizar ahora» a 379 px | 1: separación 6,9 px | 8: separación mín. 7,4 px, 0 cubiertos | 1: el control no se movió |

Con `scroll-padding-top` de la hoja (69 px a ≥1024 y 133 px bajo 1024) el navegador sitúa el control enfocado ≥ 6,7 px bajo la barra en los 44 casos medidos de esa clase (por ejemplo 68,4 px frente a una barra que termina en 61 px; 131,9 frente a 125); no mueve los controles que ya estaban completamente a la vista. Es esa misma regla la que causa AN-01. `focus-w1-1280.webp` y `focus-w1-390.webp` muestran el caso.

### C10 Gráficas y mapa

| Ancho | Canvas de ECharts, dispositivo real (CSS px) | Eslabones de ancho o alto 0 en la cadena | Eslabones por cadena | Canvas con datos sintéticos (5 gráficas; ancho × 320) | Contenedor del mapa de posición (sintético) | Canvas del mapa (atributos) | Eslabones nulos (sintético) |
|---|---|---|---|---|---|---|---|
| 1440 | 484×320 / 484×320 | 0 | 9 | 484 / 484 / 299 / 299 / 299 × 320 | 1086×318 | 1086×318 | 0 |
| 1280 | 404×320 / 404×320 | 0 | 9 | 404 / 404 / 246 / 246 / 246 × 320 | 926×318 | 926×318 | 0 |
| 1024 | 622×320 / 622×320 | 0 | 9 | 622 / 622 / 622 / 622 / 622 × 320 | 670×318 | 670×318 | 0 |
| 1023 | 909×320 / 909×320 | 0 | 9 | 909 / 909 / 909 / 909 / 909 × 320 | 957×318 | 957×318 | 0 |
| 390 | 316×320 / 316×320 | 0 | 9 | 316 / 316 / 316 / 316 / 316 × 320 | 356×318 | 356×318 | 0 |

Todos los canvas de ECharts tienen tamaño no nulo y ninguna cadena hasta `main.app-shell-main` tiene un eslabón de 0 px (9 eslabones en la cadena de una gráfica). El mapa de posición solo existe con datos sintéticos (el dispositivo real no reporta `1c`): su contenedor mide 318 px de alto en los cinco anchos, **no los 320 literales del criterio**: es el `h-80` del `Panel` menos 1 px de borde por lado, igual que en la compilación anterior (1095,6×318, 364×318 a 1440 y 390 en local); el ancho es ≥ 356 px. No hay colapso a 0 px, que era el riesgo (HA-16). El criterio de 320 es una cota mal calibrada (AN-06).

### C11 Cabecera

| Ancho | Líneas del h1 «Monitoreo en vivo» | Ancho del h1 (px) | Acciones junto al texto | Acciones (x izquierda–derecha) frente al borde de `main` | Acciones recortadas | Insignia de ambiente |
|---|---|---|---|---|---|---|
| 1440 | 1 | 648 | sí | 992–1408 de 1440 | 0 | «Staging · datos reales» visible, en el viewport |
| 1280 | 1 | 488 | sí | 832–1248 de 1280 | 0 | «Staging · datos reales» visible, en el viewport |
| 1024 | 1 | 672 | no, bajo el texto | 320–736 de 1024 | 0 | «Staging · datos reales» visible, en el viewport |
| 1023 | 1 | 519 | sí | 575–991 de 1023 | 0 | «Staging · datos reales» visible, en el viewport |
| 390 | 1 | 358 | no, bajo el texto | 16–374 de 390 | 0 | «Staging · datos reales» visible, en el viewport |

La insignia «Staging · datos reales» está a la vista en los cinco anchos. A 1023 px las acciones caben junto al texto, contra lo calculado en 4.7 (AN-06).

### C12 Estados

| Ancho | E4 (cuenta sin dispositivos) | E5 (carga) | E6 (error) |
|---|---|---|---|
| 1440 | `status`, «Todavía no hay ningún dispositivo con datos en su cuenta», alto 238 px (30 % de la ventana), «Dar de alta» sin recarga: sí | h1 «Vista en vivo de M3TRIC», `aria-busy=true`, caja de 190 px (20 %), `min-height` 0px, resuelve a la lista: sí | h1 «No pudimos cargar la vista en vivo», `role=alert`, alto 250 px, «Reintentar» 44 px, con la falla vigente sigue en error: sí; sin la falla se recupera: sí |
| 1280 | `status`, «Todavía no hay ningún dispositivo con datos en su cuenta», alto 238 px (30 % de la ventana), «Dar de alta» sin recarga: sí | h1 «Vista en vivo de M3TRIC», `aria-busy=true`, caja de 190 px (20 %), `min-height` 0px, resuelve a la lista: sí | h1 «No pudimos cargar la vista en vivo», `role=alert`, alto 250 px, «Reintentar» 44 px, con la falla vigente sigue en error: sí; sin la falla se recupera: sí |
| 1024 | `status`, «Todavía no hay ningún dispositivo con datos en su cuenta», alto 238 px (30 % de la ventana), «Dar de alta» sin recarga: sí | h1 «Vista en vivo de M3TRIC», `aria-busy=true`, caja de 188 px (20 %), `min-height` 0px, resuelve a la lista: sí | h1 «No pudimos cargar la vista en vivo», `role=alert`, alto 248 px, «Reintentar» 44 px, con la falla vigente sigue en error: sí; sin la falla se recupera: sí |
| 1023 | `status`, «Todavía no hay ningún dispositivo con datos en su cuenta», alto 238 px (30 % de la ventana), «Dar de alta» sin recarga: sí | h1 «Vista en vivo de M3TRIC», `aria-busy=true`, caja de 188 px (20 %), `min-height` 0px, resuelve a la lista: sí | h1 «No pudimos cargar la vista en vivo», `role=alert`, alto 248 px, «Reintentar» 44 px, con la falla vigente sigue en error: sí; sin la falla se recupera: sí |
| 390 | `status`, «Todavía no hay ningún dispositivo con datos en su cuenta», alto 278 px (30 % de la ventana), «Dar de alta» sin recarga: sí | h1 «Vista en vivo de M3TRIC», `aria-busy=true`, caja de 220 px (30 %), `min-height` 0px, resuelve a la lista: sí | h1 «No pudimos cargar la vista en vivo», `role=alert`, alto 304 px, «Reintentar» 44 px, con la falla vigente sigue en error: sí; sin la falla se recupera: sí |

### C13 Consola y red

| Ancho | Errores de consola (admin / sin dispositivos) | `pageerror` | Peticiones fallidas (sin `ERR_ABORTED`) | HTTP ≥ 400 no forzados | 503 de `/api/live/*` | Cancelaciones `ERR_ABORTED` | Forzados por la QA | Atribuidos a Inicio |
|---|---|---|---|---|---|---|---|---|
| 1440 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 3 / 0 | 2 (500 de E6) | 0 (404 de Inicio) |
| 1280 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 3 / 0 | 2 (500 de E6) | 0 (404 de Inicio) |
| 1024 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 3 / 0 | 2 (500 de E6) | 0 (404 de Inicio) |
| 1023 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 6 / 2 | 2 (500 de E6) | 1 (404 de Inicio) |
| 390 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 5 / 1 | 2 (500 de E6) | 2 (404 de Inicio) |

Los avisos de MapLibre (`Expected value to be of type number, but found null instead`, `GPU stall due to ReadPixels`) pertenecen a las visitas a `/map` (cubeta aparte) y no a Análisis. Las cancelaciones aparecen al salir de una vista con peticiones en vuelo (`/api/live/overview` de las tarjetas, `/api/live/devices`, `/api/live/trend` de Inicio al entrar a Análisis).

### C14 Posición del scroll

| Ancho | `scrollY` antes de pulsar «Mapa» | `scrollY` a 0, 150, 600 y 1500 ms de la navegación | URL | Al volver con «Análisis» | `scrollY` al volver |
|---|---|---|---|---|---|
| 1440 | 1100 | 1100 → 0 → 0 → 0 | /map | /live (lista) | 0 |
| 1280 | 1100 | 1100 → 0 → 0 → 0 | /map | /live (lista) | 0 |
| 1024 | 1100 | 1100 → 0 → 0 → 0 | /map | /live (lista) | 0 |
| 1023 | 1100 | 681 → 0 → 0 → 0 | /map | /live (lista) | 0 |
| 390 | 1100 | 643 → 0 → 0 → 0 | /map | /live (lista) | 0 |

En la primera muestra (a 0 ms de la navegación) el desplazamiento aún no es 0 en 1440, 1024, 1023 y 390 (1100, 1100, 681 y 643 px); a los 150 ms ya es 0 en todos: el efecto de MainLayout actúa tras el primer pintado. Un cambio solo de hash no desplaza a 0 (los anclajes de C6 lo demuestran) y no se probó Atrás/Adelante.

### C15 Recarga

| Ancho | Recarga de `/live` | Recarga de `/live/raw` | `/analytics` termina en |
|---|---|---|---|
| 1440 | /live: 1 main, h1 «Sus dispositivos», barra lateral | /live/raw: 1 main, h1 «Telemetría recibida en AWS», barra lateral | /live |
| 1280 | /live: 1 main, h1 «Sus dispositivos», barra lateral | /live/raw: 1 main, h1 «Telemetría recibida en AWS», barra lateral | /live |
| 1024 | /live: 1 main, h1 «Sus dispositivos», barra lateral | /live/raw: 1 main, h1 «Telemetría recibida en AWS», barra lateral | /live |
| 1023 | /live: 1 main, h1 «Sus dispositivos», barra superior | /live/raw: 1 main, h1 «Telemetría recibida en AWS», barra superior | /live |
| 390 | /live: 1 main, h1 «Sus dispositivos», barra superior | /live/raw: 1 main, h1 «Telemetría recibida en AWS», barra superior | /live |

### C16 Rejilla de resumen

| Página | Ancho | Columnas | Tarjeta mínima | Clase de la rejilla |
|---|---|---|---|---|
| Inicio | 1024 | 3 col. | 213,3 px | live-metric-grid |
| Inicio | 1100 | 3 col. | 238,7 px | live-metric-grid |
| Inicio | 1179 | 3 col. | 265 px | live-metric-grid |
| Inicio | 1180 | 3 col. | 265,3 px | live-metric-grid |
| E1 | 1024 | 2 col. | 328 px | live-metric-grid live-metric-grid--analysis |
| E1 | 1100 | 2 col. | 366 px | live-metric-grid live-metric-grid--analysis |
| E1 | 1179 | 2 col. | 405,5 px | live-metric-grid live-metric-grid--analysis |
| E1 | 1180 | 3 col. | 265,3 px | live-metric-grid live-metric-grid--analysis |
| E2 | 1024 | 2 col. | 328 px | live-metric-grid live-metric-grid--analysis |
| E2 | 1100 | 2 col. | 366 px | live-metric-grid live-metric-grid--analysis |
| E2 | 1179 | 2 col. | 405,5 px | live-metric-grid live-metric-grid--analysis |
| E2 | 1180 | 3 col. | 265,3 px | live-metric-grid live-metric-grid--analysis |

Análisis (E1 y E2) usa el modificador `live-metric-grid--analysis` entre 1024 y 1179 px: 2 columnas de 328, 366 y 405,5 px, y 3 de 265,3 px desde 1180; todas ≥ 240. Inicio conserva sus 3 columnas en los cuatro anchos, con tarjetas de 213,3 y 238,7 px a 1024 y 1100 (la decisión C-7; S-18 sigue abierto).

## 5. Contraste de 4.7 (calculado) con lo medido

| 4.7: calculado → medido | 1440 | 1280 | 1024 | 1023 | 390 |
|---|---|---|---|---|---|
| Ancho de `main` (calc. → med.) | 1152 → 1152 | 992 → 992 | 736 → 736 | 1023 → 1023 | 390 → 390 |
| Ancho del contenido | 1088 → 1088 | 928 → 928 | 672 → 672 | 959 → 959 | 358 → 358 |
| Barra: `top` pegada | 0 → 0 | 0 → 0 | 0 → 0 | 64 → 64 | 64 → 64 |
| Tarjetas de resumen (columnas × ancho) | 3 de ≈352 → 3 × 352 | 3 de ≈299 → 3 × 298,7 | 2 de ≈328 (corregido) → 2 × 328 | 3 de ≈309 → 3 × 309 | 1 de 358 → 1 × 358 |
| Inclinometría (columnas × ancho de panel) | 2 de ≈534 → 2 × 534 | 2 de ≈454 → 2 × 454 | 1 de 672 → 1 × 672 | 1 de 959 → 1 × 959 | 1 de 358 → 1 × 358 |
| Infiltración (sintético) | 3 de ≈349 (útil ≈301) → 3 × 349,3, canvas 299 | 3 de ≈296 (útil ≈248) → 3 × 296, canvas 246 | 1 → 1 × 672, canvas 622 | 1 → 1 × 959, canvas 909 | 1 → 1 × 358, canvas 316 |
| Calidad y salud (sintético) | ≈641 y 427 → 2 col.: 427,2 de salud | ≈545 y 363 → 2 col.: 363,2 de salud | 1 → 1 col.: 672 de salud | 1 → 1 col.: 959 de salud | 1 → 1 col.: 358 de salud |
| Cabecera (acciones) | junto al texto → junto al texto | junto al texto → junto al texto | bajo el texto → bajo el texto | bajo el texto → junto al texto | apilado → bajo el texto |

Los anchos de `main` y del contenido coinciden al píxel; las tarjetas, la inclinometría, la infiltración y calidad/salud coinciden con el cálculo (la cifra de calidad es el ancho del bloque; «de salud» es el de su columna). Única diferencia: la cabecera a 1023 px (AN-06). Datos de infiltración y calidad/salud: pasada sintética.

## 6. Requisitos REQ-AN comprobados en vivo

| ID | Resultado | Cómo se vio |
|---|---|---|
| REQ-AN-01 | cumple | 1 `main`, «Navegación principal» una vez, barra lateral ≥1024 y superior <1024 en `/live` y `/live/raw`; `/analytics` termina en `/live` (5 anchos); `/live` y `/live/raw` recargados conservan el shell |
| REQ-AN-02 | cumple | `aria-current=page` solo en «Análisis» en `/live` y `/live/raw`; ninguno en `/map`, `/sensors` |
| REQ-AN-03 | cumple (DOM) | 0 selectores del cromo antiguo; sin logotipo en `main`; sin «requiere sesión» ni «Navegación de monitoreo» |
| REQ-AN-04 | cumple | `.page-header`, eyebrow «Análisis» como hermano anterior del único `h1`, descripción con el nombre del dispositivo; insignias dentro de `#resumen` |
| REQ-AN-05 | cumple | `nav` «Secciones de la vista en vivo» hijo directo de `.app-shell-content`, fuera de `#resumen`, sin `aria-current`, 4 enlaces (6 con datos sintéticos) con su `id` en el documento, ≥ 44 px |
| REQ-AN-06 | cumple (con el límite de 1500 px) | C5 y C6; desplazamiento inmediato con `prefers-reduced-motion` |
| REQ-AN-07 | cumple | selector, «Actualizar ahora», «Actualizado hace…» y la nota dentro de `.live-header-actions`; rótulos de 44 px; elegir «1 h» pidió `series?window=1h` |
| REQ-AN-08 | cumple | «← Todos los dispositivos» antes del `h1` y devuelve a la lista; «Vista de conectividad» solo para el administrador (la cuenta `visualizacion` no la ve y entra a `/live/raw` por URL); «Dar de alta un dispositivo» navega sin recargar; todos ≥ 44 px |
| REQ-AN-09 | cumple | E4, E5 y E6 dentro del shell, `.live-loading` sin `min-height: 100vh` (0 px), `aria-busy` y `role="alert"` |
| REQ-AN-10 | cumple salvo AN-02 | sin desbordes del documento ni de `main`; tarjetas ≥ 240 px; h1 en una línea ≥ 1280 px; falla en `/live/raw` a 1024 px |
| REQ-AN-11 | cumple (con AN-01) | C9 |
| REQ-AN-12 | no verificado en vivo | es una revisión de diff |
| REQ-AN-13 | cumple | «Vista informativa…» una vez, en `p.live-disclaimer`, sin `<footer>` |
| REQ-AN-14 | cumple | `scrollY` 0 tras «Mapa» en los 5 anchos |
| REQ-AN-15 | parcial | axe sin reglas nuevas (C8); marcas del paquete correctas; sin control negativo contra la línea base ni medida del tamaño del paquete |
| REQ-AN-16 | no aplica | documentación |

## 7. Observación de la leyenda a 390 px en E2

**Pregunta:** ¿la segunda fila de la leyenda se cruza con el primer tick del eje Y a 390 px? **Respuesta: sí, con datos de 5 sensores, y no lo introduce este cambio.**

Medida (CSS px dentro del canvas de «Cabeceo», 316×320 px; datos sintéticos):

| Elemento | Rectángulo |
|---|---|
| Fila 1 de la leyenda («Sensor 1A», «2A», «3A») | x 17 a 299, y 5 a 18,2 |
| Fila 2 de la leyenda («Sensor 4A», «5A») | x 17 a 201,7, y 28,2 a 41,4 |
| Símbolo de «Sensor 4A» | x 23,9 a 37,1, y 28,2 a 41,4 |
| Primer rótulo del eje Y («-2.2») | x 21,8 a 44, y 35,9 a 48,1 |
| Cruce | 13,2 px de ancho × 5,5 px de alto (el símbolo entero, 5,5 px del rótulo) |
| Opciones de ECharts | `legend: {top: 0, left: "center", orient: "horizontal"}`, `grid.top: 42`; con dos filas la leyenda mide 46,4 px de alto, más que `grid.top` |

**Mecanismo:** `LiveLineChart` (sin cambios en este cambio, REQ-AN-12) fija la leyenda en `top: 0` y la cuadrícula en `top: 42`; una leyenda de una fila mide 23,2 px y cabe, y una de dos filas (5 sensores en una gráfica estrecha) mide 46,4 px y pisa el rótulo superior del eje Y. Ocurre cada vez que la leyenda se parte y su segunda fila arranca a la izquierda de x ≈ 44 px.

**¿Preexistente?** La captura `after/live-device-390.webp` mide 390×844 (solo la ventana superior de la página, sin gráficas), de modo que no permite contrastar. Lo que sí permite es servir en local la **compilación anterior** (la que servía la release 66acab7) y alimentarla con los mismos datos sintéticos: da el mismo cruce a 390 px. Comparación (símbolo o texto de la leyenda contra el rótulo del tick; la cifra es el rectángulo de intersección):

| Ancho | Gráfica | Compilación anterior (local, mismos datos) | Release en vivo (4795cd2, mismos datos por interceptación) |
|---|---|---|---|
| 1440 | Cabeceo | 489 px, 1 fila(s), sin cruce | 484 px, 2 fila(s), sin cruce |
| 1440 | Alabeo | 489 px, 1 fila(s), sin cruce | 484 px, 2 fila(s), sin cruce |
| 1440 | Temperatura del suelo | 303 px, 2 fila(s), símbolo × rótulo 13,2×5,5 px | 299 px, 2 fila(s), símbolo × rótulo 13,2×5,5 px |
| 1280 | Cabeceo | 414 px, 2 fila(s), símbolo × rótulo 13,2×5,5 px | 404 px, 2 fila(s), símbolo × rótulo 10,6×5,5 px, texto × rótulo 0,7×5,1 px |
| 1280 | Alabeo | 414 px, 2 fila(s), símbolo × rótulo 10,5×5,5 px | 404 px, 2 fila(s), símbolo × rótulo 5,5×5,5 px, texto × rótulo 0,7×5,1 px |
| 1280 | Temperatura del suelo | 252 px, 2 fila(s), texto × rótulo 21×5,1 px | 246 px, 2 fila(s), texto × rótulo 24×5,1 px |
| 390 | Cabeceo | 324 px, 2 fila(s), símbolo × rótulo 13,2×5,5 px | 316 px, 2 fila(s), símbolo × rótulo 13,2×5,5 px |
| 390 | Alabeo | 324 px, 2 fila(s), símbolo × rótulo 13,2×5,5 px | 316 px, 2 fila(s), símbolo × rótulo 10,2×5,5 px |
| 390 | Temperatura del suelo | 324 px, 2 fila(s), símbolo × rótulo 9,1×5,5 px | 316 px, 2 fila(s), símbolo × rótulo 13,1×5,5 px |

Lectura: el cruce **existe antes y después** a 390 y 1280 px. El cambio mueve dónde ocurre porque las gráficas son algo más estrechas: a 1440 la leyenda de «Cabeceo» y «Alabeo» pasa de una fila (489 px) a dos (484 px) sin cruzarse con el rótulo; a 1280 «Temperatura del suelo» (246 px frente a 252) ya cruzaba texto con rótulo y ahora lo hace en 24×5,1 px en vez de 21×5,1 (su leyenda es más ancha que el canvas: la fila 2 empieza en x = -11); a 390 el canvas pasa de 324 a 316 px sin cambiar el cruce. Con el dispositivo real, que hoy no tiene series, la leyenda no se dibuja. `legend-live-390.webp` y `legend-base-390.webp` lo muestran.

## 8. Defectos y observaciones

Gravedad: media-baja, baja o informativa. «Introducido»: causado por este cambio.

| ID | Gravedad | Introducido | Hallazgo | Causa o evidencia |
|---|---|---|---|---|
| AN-01 | media-baja | sí | Con la página desplazada, abrir o cerrar el cajón mueve el desplazamiento (800 → 343 px a 390; 800 → 381 a 1023) y al cerrar vuelve a 0 | Causa inferida, con control: `html:has(.live-section-nav){scroll-padding-top: 69px}` (133 px bajo 1024) frente al `focus()` que el cajón da a «Cerrar menú» al abrir y a «Abrir menú» al cerrar (ambos fijos dentro de esos 69/133 px superiores). Con `scroll-padding-top` forzado a 0 en la misma página el salto desaparece (390 px: 800 → 800 → 800), y en Inicio, que no tiene esa regla, tampoco ocurre (400 → 400 → 400). |
| AN-02 | baja | sí | `/live/raw` a 1024 px: las tres tarjetas de resumen miden 213,3 px (antes 309,3), «recepciones» se parte a mitad de palabra y el rótulo «OBJETOS INSPECCIONADOS» desborda 16 px hasta tocar el icono; a 1100 px miden 238,7 px | La rejilla `md:grid-cols-3` de la vista decide por ancho de ventana (768 px) y el shell resta 288 px desde 1024 px: el mismo mecanismo que HA-15, no cubierto por el modificador C-7 (solo rejillas de Análisis). |
| AN-03 | baja | no | Leyenda de ECharts: la segunda fila cruza el rótulo del primer tick del eje Y cuando la leyenda se parte en dos filas | `LiveLineChart` (sin cambios, REQ-AN-12): leyenda `top: 0` que mide 46,4 px con dos filas y `grid.top: 42`. Preexistente; la nueva anchura de las gráficas cambia dónde ocurre (ver sección 7). |
| AN-04 | baja | no | axe `role-img-alt` (serious, 2 nodos) en el detalle con dispositivo sin series (QA-03): persiste idéntico a la línea base | Los dos `div.echarts-for-react[role=img]` internos no tienen nombre accesible cuando no hay series; con series (sintético) la regla pasa. |
| AN-05 | baja | no | «Actualizar ahora» se deshabilita mientras hay un sondeo en curso y el foco de teclado cae al `<body>` | Preexistente (el botón es el mismo antes del cambio). Con el foco en «Actualizar ahora» durante 16 s el elemento activo pasó a `body` y siguió allí unos 12,7 s (127 de 160 lecturas de 100 ms; 123 con datos sintéticos); el selector, un enlace de la barra y «← Todos los dispositivos» conservaron el foco las 160 lecturas. |
| AN-06 | informativa | sí | Desviaciones de lo especificado, sin efecto funcional: el margen de anclaje usa `html:has(.live-section-nav){scroll-padding-top}` (69/133 px) y `.live-section,#salud{scroll-margin-top:.5rem}` en vez de `scroll-margin-top: calc(var(--live-bar-top) + var(--live-bar-h) + 1rem)` (4.4 punto 3); el mapa de posición mide 318 px de alto, no 320; a 1023 px las acciones de la cabecera caben junto al texto (4.7 las daba debajo) | El criterio 320 de C10 ignora los 2 px del borde del Panel (`h-80`); 4.7 es cálculo (HA-15). La primera desviación es la causa de AN-01. |
| AN-07 | informativa | no | Detalle a 1280 px: el texto de dos tiles de salud (`.live-health-stat`) desborda su caja 4 a 10 px | Preexistente. |
| AN-08 | informativa | no | Inicio de una cuenta sin dispositivos pide `/api/live/overview` y `/api/live/trend` y recibe 404 (2 errores de consola); no es de Análisis | Preexistente: reproducido sin tocar Análisis (login y espera de 12 s en /dashboard). |
| AN-09 | informativa | no | Con posición (solo datos sintéticos): axe `link-in-text-block` (serious) en el enlace «MapLibre» de la atribución, contraste 2,02:1 | Control de terceros dentro de la sección «Posición»; no se ve con el dispositivo real (no reporta `1c`). |

**Sugerencias.** AN-01: pasar `{ preventScroll: true }` en los `focus()` de apertura y cierre del cajón de `MainLayout`, o acotar `scroll-padding-top` a lo enfocable dentro de `main` (`main :focus-visible { scroll-margin-top: … }`); lo que no conviene es quitar la regla sin más, porque es lo que impide que un control quede bajo la barra (W1). AN-02: llevar la rejilla de resumen de raw al modificador de dos columnas entre 1024 y 1179 px, como en C-7. AN-03: dar a la cuadrícula un `top` que dependa de la altura real de la leyenda, o forzar la leyenda a una fila con desplazamiento (cambia `LiveLineChart`, fuera del alcance de este cambio). AN-05: `aria-disabled` en lugar de `disabled` durante el sondeo.

## 9. Comparación con el «antes»

Valores del despliegue anterior: `QA-REPORT.md` (2026-10-02, release 1c8e17d), `nunito/QA-NUNITO.md` y su `findings.json` (2026-10-05, 57681b2 y 66acab7) y el diseño 2.3 de la spec.

| Medida | Antes | Ahora (4795cd2) |
|---|---|---|
| Landmarks del detalle | `complementary` «Navegación de monitoreo», `navigation` «Secciones», `main` propios | `main` único del shell, «Navegación principal» y «Secciones de la vista en vivo»; ninguno «de monitoreo» |
| Enlaces de salida de Análisis (QA-07) | 0 en la lista y en raw; solo anclas internas en el detalle | barra lateral/cajón global; Mapa y vuelta sin Atrás (20/20) |
| `h1` «Monitoreo en vivo» (QA-12) | 2 líneas a 1440 (también con Barlow emulada); en la compilación anterior servida en local, 2 líneas a 1440, 1280, 1024 y 1023 px y 1 a 390 | 1 línea a los 5 anchos |
| Rótulo del selector de ventana | 36 px (spec 2.6) | 44 px; cápsula 50,8 px |
| Navegación de secciones | barra móvil con logotipo (≤1024 px) y barra lateral propia de anclas (>1024 px) | barra única de 61 px, pegada a 0 px (≥1024) o 64 px (<1024), sin logotipo |
| Desborde horizontal (documento y contenido) | 0 de 6 estados de `/live` (nunito) | 0 en los 6 estados × 5 anchos (+ E4) |
| Altura de página del detalle | 2167 px a 1440; 4032 a 390 | 2199 px; 4083 |
| axe, detalle | `role-img-alt` serious ×2; incompleta `th-has-data-cells` | idéntico |
| axe, lista | 0 | 0 |
| Errores de consola, `pageerror`, 503 | 0, 0, 0 (nunito) | 0, 0, 0 (más cancelaciones `ERR_ABORTED` por navegar sin esperar a la red en reposo) |
| Tarjetas de resumen a 1024 px | 310,2 px (compilación anterior en local; `.live-metric-card`); raw: 309,3 px | 328 px (2 columnas); raw: 213,3 px (AN-02) |

## 10. Límites de esta verificación

- Solo Chromium 153.0.8010.12 (headless); sin Firefox ni WebKit; 390 px con agente de escritorio y sin emulación táctil; sin lector de pantalla.
- El dispositivo real está «Callado»: sin series, sin Infiltración ni Posición. Lo que depende de ellas (C6 de `#infiltracion`, `#posicion`, `#calidad`, `#salud` al borde, W1 bajo la barra con varios destinos, C10 del mapa, la leyenda, `role-img-alt` con datos) salió de la pasada sintética: datos inventados, interceptación de red en el navegador, página real. Las teselas de OpenStreetMap del mapa de posición se sustituyeron por unas teselas en blanco; no se probó la CSP con ellas.
- La compilación anterior se sirve en local (no es el despliegue anterior real) y su comparación con el vivo mezcla servidor distinto con los mismos datos y el mismo navegador.
- 1500 px de desplazamiento no se alcanzan a 1440 ni 1280 con el dispositivo real (C5); el segundo dispositivo (`ke-test-01`) no se abrió.
- No se probó Atrás/Adelante con la restauración de desplazamiento (REQ-AN-14), ni el control negativo del humo de paquete (8.3, paso 5), ni el tamaño de la entrada (REQ-AN-15).
- axe solo detecta lo automático; `th-has-data-cells` y el contraste del cajón quedan en revisión manual. Línea base inexistente para `/live/raw` y para 390 px.
- Los 503 de `/api/live/*` (QA-02) no aparecieron: no se puede afirmar nada sobre la concurrencia reservada bajo carga.
- El arnés (`main.mjs`, `synth.mjs`, `empty.mjs`, `axe.mjs`, `grid.mjs`, `base.mjs` y los auxiliares) vive en la carpeta temporal de la sesión y no se archiva en el repositorio.

## 11. Evidencia

Todo en `docs/evidence/platform-brand/analisis/`. Capturas en WebP, calidad ≈ 78 (≤ 120 KB cada una; viewport, sin página completa). Las 24 capturas suman 538,2 KB.

| Archivo | Tamaño | Contenido |
|---|---|---|
| `e1-list-1440.webp` | 30,4 KB | E1, lista de dispositivos, 1440×900 (administrador; enlace «Vista de conectividad» visible) |
| `e1-list-390.webp` | 17,6 KB | E1, 390×844 (barra superior, sin barra lateral) |
| `e2-detail-1440.webp` | 44,5 KB | E2, detalle del dispositivo «callado», 1440×900: cabecera con eyebrow, h1 de una línea, controles a la derecha y barra de secciones |
| `e2-detail-390.webp` | 18,9 KB | E2, 390×844: cabecera apilada, selector y botón a ancho completo |
| `e3-raw-1440.webp` | 39,4 KB | E3, `/live/raw`, 1440×900 (enlace «Volver a Análisis») |
| `e3-raw-390.webp` | 19,0 KB | E3, 390×844 |
| `e4-empty-1440.webp` | 27,2 KB | E4, cuenta sin dispositivos (grupo visualizacion), 1440×900 |
| `e4-empty-390.webp` | 14,1 KB | E4, 390×844 |
| `e5-loading-1440.webp` | 18,1 KB | E5, carga (`/api/live/devices` retrasado 9 s), 1440×900, dentro del shell |
| `e5-loading-390.webp` | 5,5 KB | E5, 390×844 |
| `e6-error-1440.webp` | 21,5 KB | E6, error (`/api/live/snapshot` forzado a 500), 1440×900: mensaje y «Reintentar» |
| `e6-error-390.webp` | 8,5 KB | E6, 390×844 |
| `e2-sticky-1440.webp` | 47,8 KB | C5, barra de secciones pegada tras desplazar con la rueda hasta el máximo (1299 px; la página real no llega a 1500), 1440×900 |
| `e2-sticky-390.webp` | 9,5 KB | C5, barra pegada bajo la barra superior (top 64 px) tras desplazar 1500 px, 390×844 |
| `e2s-anchor-390.webp` | 16,3 KB | C6, ancla «Infiltración» a 390 px con datos sintéticos: el título queda 53 px bajo la barra |
| `e2-drawer-390.webp` | 11,7 KB | C9, cajón abierto con la página desplazada (390×844): el contenido y la barra de secciones quedan detrás |
| `focus-w1-1280.webp` | 47,5 KB | W1, Tab hacia la región «Alternativa textual…» colocada bajo la barra: queda 7,4 px bajo ella (1280×800) |
| `focus-w1-390.webp` | 18,0 KB | W1, mismo gesto a 390 px: la región queda 6,9 px bajo la barra (top 125 px) |
| `legend-live-390.webp` | 8,9 KB | Leyenda (datos sintéticos), release en vivo, 390 px: «Sensor 4A» cruza el rótulo «-2.2» |
| `legend-base-390.webp` | 16,9 KB | Leyenda, compilación anterior servida en local con los mismos datos, 390 px: mismo cruce |
| `legend-live-1280.webp` | 10,4 KB | Leyenda, release en vivo, 1280 px (gráfica de 404 px) |
| `e2s-position-390.webp` | 14,8 KB | C10, mapa de posición con datos sintéticos (390 px): contenedor de 356×318 px |
| `e2-detail-1024.webp` | 34,4 KB | C16, resumen en dos columnas de 328 px a 1024 px (acciones bajo el texto) |
| `e3-raw-1024.webp` | 37,4 KB | AN-02, `/live/raw` a 1024 px: tiles de 213 px, «recepciones» partida y rótulo pegado al icono |

`findings.json`: `meta` (release, stack, distribución, artefactos, marcas del paquete, usuarios), `summaryTable` y `verdicts` (cada PASS o FAIL con su nota, por comprobación × estado × ancho), `c13` (red y consola clasificadas), `legend` (cruce de la leyenda, antes y después), `axe` (línea base y resultados, también los sintéticos), `grid`, `extras`, `rawTiles`, `ariaCurrentByRoute`, `focusShots`, `defects`, `cleanup`, `recheck` (re-verificación de c0be045) y `runs` (`main`: estados, comprobaciones y eventos por ancho; `synthetic`; `noDevices`; `preChangeLocal`).

## 12. Limpieza

- **Usuarios temporales** (grupo `admin` y grupo `visualizacion`): `smoke-qa-an-1791304179` (creado hacia las 16:30Z, justo después de borrar el usuario del incidente) y `smoke-qa-an-nodev-1791304179` (creado hacia las 16:29:40Z). Los dos se eliminaron con `admin-delete-user` el 2026-10-06 a las 17:41:14Z y 17:41:15Z (rc 0). Comprobación posterior (17:41:21Z): `admin-get-user` de cada uno devuelve `UserNotFoundException: User does not exist.`; `list-users` con el prefijo `smoke-qa-an` y con `smoke-` devuelve `[]`; el pool queda con `alejandro` y `metric_user`, como antes de empezar.
- **Incidente de creación (mío).** El primer intento de crear el usuario administrador usó en zsh `$SMOKE_USER:admin`, donde `:a` es un modificador de ruta absoluta: `admin-create-user` creó un usuario cuyo `Username` era `/Users/alejandropuerta/Documents/TRABAJO/EAFIT/WEB_LANDING/smoke-qa-an-1791304179dmin` (la comprobación del `Username` devuelto coincidía con la variable mal formada, así que no lo detectó); `admin-set-user-password` y `admin-add-user-to-group` fallaron sobre él (no existía el usuario esperado) y el usuario quedó en `FORCE_CHANGE_PASSWORD`, sin grupo y sin contraseña conocida. Lo vi con `list-users`, lo borré a las 16:30:06Z (rc 0; creado hacia las 16:29:40Z) y comprobé que `admin-get-user` devuelve `UserNotFoundException`; el administrador se creó de nuevo con `${…}`, y su `Username` coincide con el esperado. Nunca se inició sesión con él.
- **Creación:** `admin-create-user --message-action SUPPRESS`; contraseña permanente aleatoria de 21 caracteres con `admin-set-user-password --cli-input-json` desde un archivo de modo 600, nunca impresa; `admin-add-user-to-group`; variables de shell propias (`POOL_ID`, `SMOKE_EPOCH`, `SMOKE_USER`, `SMOKE_USER2`, `MISTAKE_USER`; ni `USERNAME` ni `path`).
- **Secretos.** Borrados los archivos con las contraseñas, los JSON de `admin-set-user-password` y los archivos con los nombres de usuario. Antes de borrarlos busqué el valor de cada contraseña, tokens con forma de JWT y claves de AWS Location (`v1.public.` o `key=`) en la carpeta de evidencia (26 archivos) y en toda la carpeta de trabajo (157 archivos) y en los archivos de texto del resto del espacio temporal de la sesión: 0 coincidencias. Las URL del arnés se guardan sin cadena de consulta.
- **Escrituras en AWS:** `admin-create-user` (3, una del incidente), `admin-set-user-password` (2 con éxito y 1 fallida), `admin-add-user-to-group` (2 con éxito y 1 fallida) y `admin-delete-user` (3). Lecturas: `sts get-caller-identity`, `cloudformation describe-stacks`, `cloudfront get-distribution`, `cognito-idp list-groups`, `list-users`, `admin-get-user` y `admin-list-groups-for-user`. Llamadas a `gh`: 0.
- **Resto de los repositorios.** Al terminar la primera pasada (≈17:41Z), en `m3tric-landing` solo existía la carpeta nueva `docs/evidence/platform-brand/analisis/` (`git status --short`: `?? docs/evidence/platform-brand/analisis/`) y en `M3TRIC_Platform` `git status --short` no mostraba nada; los cambios que aparecen después en ambos repositorios (CHANGELOG, TRACEABILITY y README de la evidencia, y el PR #197) no son míos (solo leí la spec, el código del API y `dev/platformLiveLocal.ts`, y ejecuté `git show` y `git log` de lectura). Un servidor estático local propio (puerto 5391, `node:http`) sirvió la compilación anterior durante las corridas `base.mjs` y se cerró al terminar cada una; no maté ningún proceso ajeno.

## 13. Confianza

- **Global: alta** en los números de C1 a C7, C9 a C15: salen de medidas directas (cajas, `elementFromPoint`, `scrollWidth`, árbol de accesibilidad, clics y teclas reales) repetidas por ancho. **Media-alta** en AN-01, que está medido de tres maneras (clics reales, el salto desaparece al anular la regla, Inicio no lo tiene) pero cuya causa en el motor (cómo interpreta Chromium `scroll-padding` para un elemento fijo) es una inferencia. **Media** en la leyenda: la medida estructural es de ECharts y la visual de la captura coincide, pero los datos son sintéticos.
- Lo que me deja menos seguro: el dispositivo real no tiene series ni posición; el cajón y el teclado en un móvil real; y la repetición del estado E4 con otra cuenta de otro grupo (usé `visualizacion`; con `operador` el resultado sería el mismo por la regla de propiedad, pero no lo medí).
- Convendría que lo revisara quien lleve el frontend de la plataforma (AN-01 y AN-02) y quien lleve `LiveLineChart` (AN-03).

## 14. Re-verificación 2026-10-06 (release c0be045)

Las secciones 1 a 13 describen la release 4795cd2 tal como se midió y no se tocan. Esta sección repite en vivo lo afectado por los arreglos de AN-01 y AN-02 (PR #197, `main` c0be045, change set `an-fix-c0be045` ejecutado 18:02:40Z, 0 eventos fallidos: datos del coordinador, que no pude comprobar porque la tarea prohibía `gh`).

### 14.1 Release y artefactos

| Elemento | Valor |
|---|---|
| Release | `platform-live-c0be0451ed54edb3a3352cacf21721cda4c805c9` (`ReleaseId` y `GitSha` del stack, `UPDATE_COMPLETE` 2026-10-06T18:02:40Z) |
| Distribución | E3LBUHUINTWS0F `Deployed`, modificada 18:03:29Z; `index.html` `Last-Modified` 18:04:43 GMT; `GET /`, `/live` y `/live/raw` devuelven el mismo SHA-256 (f65e88de…) |
| Entrada | `/assets/index-CeZJtZpl.js` (263.220 bytes): contiene `preventScroll:!0` (1 aparición, el ayudante que usan los dos `focus()` del cajón) |
| CSS | `/assets/index-BNRDTM6u.css`: la regla `html:has(.live-section-nav){scroll-padding-top:calc(var(--live-bar-top) + var(--live-bar-h) + .5rem)}` **sigue igual**; aparece `@media(min-width:1180px){.min-[1180px]:grid-cols-3{…repeat(3,…)}}` |
| *Chunk* de raw | `/assets/RawTelemetryPage-BsMVW1dP.js`: contiene `lg:grid-cols-2 min-[1180px]:grid-cols-3` |
| Navegador | Chromium 153.0.8010.12, Playwright 1.63.0, mismo arnés; corrida 18:09:05 a 18:11:44 UTC |
| Usuario | `smoke-qa-an2-1791310070` (grupo `admin`), eliminado al final (14.8) |

**Gestos.** El cajón se abre y se cierra solo con `page.mouse.click(x, y)` en el centro del control (cajas de `boundingBox`, que no desplaza) o con Tab + Enter; `locator.click()` aparece únicamente como control rotulado. Los datos de series y posición son sintéticos por interceptación, como en la primera pasada, para que la página sea larga.

### 14.2 AN-01: el cajón y el desplazamiento

Detalle de E2 desplazado a 800 px con la rueda, a 390×844 y 1023×768:

| Ancho | Apertura | Cierre | `scrollY` de partida | Tab hasta «Abrir menú» (elemento y `scrollY`) | `scrollY` al abrir (0 / 100 / 600 ms) | Foco al abrir | `scrollY` al cerrar (0 / 150 / 1500 ms) | Foco al cerrar |
|---|---|---|---|---|---|---|---|---|
| 390 | clic crudo | Escape | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 390 | clic crudo | botón (clic crudo) | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 390 | clic crudo | velo (clic crudo) | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 390 | Tab + Enter | Escape | 800 | M3TRIC, ir al  344 → Abrir menú 0 | 0 / 0 / 0 | Cerrar menú | 0 / 0 / 0 | Abrir menú |
| 390 | Tab + Enter | botón (clic crudo) | 800 | M3TRIC, ir al  344 → Abrir menú 0 | 0 / 0 / 0 | Cerrar menú | 0 / 0 / 0 | Abrir menú |
| 390 | Tab + Enter | velo (clic crudo) | 800 | M3TRIC, ir al  344 → Abrir menú 0 | 0 / 0 / 0 | Cerrar menú | 0 / 0 / 0 | Abrir menú |
| 390 | clic crudo | Escape | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 390 | `locator.click()` (control) | Escape | 800 | — | 343 / 343 / 343 | Cerrar menú | 343 / 343 / 343 | Abrir menú |
| 1023 | clic crudo | Escape | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 1023 | clic crudo | botón (clic crudo) | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 1023 | clic crudo | velo (clic crudo) | 800 | — | 800 / 800 / 800 | Cerrar menú | 800 / 800 / 800 | Abrir menú |
| 1023 | Tab + Enter | Escape | 800 | M3TRIC, ir al  381 → Abrir menú 0 | 0 / 0 / 0 | Cerrar menú | 0 / 0 / 0 | Abrir menú |
| 1023 | Tab + Enter | botón (clic crudo) | 800 | M3TRIC, ir al  381 → Abrir menú 0 | 0 / 0 / 0 | Cerrar menú | 0 / 0 / 0 | Abrir menú |
| 1023 | Tab + Enter | velo (clic crudo) | 800 | M3TRIC, ir al  381 → Abrir menú 0 | 0 / 0 / 0 | Cerrar menú | 0 / 0 / 0 | Abrir menú |
| 1023 | `locator.click()` (control) | Escape | 800 | — | 381 / 381 / 381 | Cerrar menú | 381 / 381 / 381 | Abrir menú |

**Control de la primera pasada (4795cd2, `locator.click()` + Escape):** 390 px, 800 → 343 → 0; 1023 px, 800 → 381 → 0.

- **Con gestos crudos de ratón, el arreglo funciona.** 7 secuencias (abrir con clic crudo; cerrar con Escape, con el botón y con el velo, a 390 y 1023 px, más una repetición para la captura): `scrollY` 800 antes, durante y después en todas las muestras; el foco queda en «Cerrar menú» al abrir y vuelve a «Abrir menú» al cerrar por los tres caminos; `main` y la barra de secciones `inert` mientras está abierto: cumple.
- **Lo medido el primer día era en parte un artefacto de mi arnés.** `locator.click()` llama a `scrollIntoViewIfNeeded` sobre el botón, que respeta `scroll-padding-top` y desplazaba la página antes de que la aplicación hiciera nada. La fila de control (`locator.click()` en c0be045) lo reproduce: 800 → 343 a 390 y 800 → 381 a 1023 **al abrir**, y ahora el cierre ya no mueve nada (343 → 343 y 381 → 381, antes 343 → 0). Lo que sí era del código y está arreglado es el **cierre**: el `focus()` de vuelta a «Abrir menú» sin `preventScroll` llevaba la página a 0. La atribución de AN-01 en la sección 8 («los `focus()` del propio MainLayout» para la apertura) debe leerse con esta corrección; con `preventScroll` en los dos `focus()` la causa de código desaparece.
- **Con teclado (Tab hasta «Abrir menú», Enter) queda un residuo, que no es del cajón.** Al pulsar Tab sobre el logotipo y sobre «Abrir menú» de la barra superior, que es fija y cae dentro de los 133 px de `scroll-padding-top`, **el navegador desplaza la página por sí solo antes del Enter**: 344 tras el logotipo y 0 tras «Abrir menú» a 390 px (381 y 0 a 1023). Enter, Escape y el cierre no mueven nada más (0 → 0 → 0). Por eso las seis filas de teclado parten de 800 y abren en 0: la expectativa de 800 no se cumple con Tab, y **no la cumpliría ninguna implementación del cajón mientras la regla siga como está**. Control: con `scroll-padding-top` forzado a 0 la secuencia entera se queda en 800.

| Ancho | Condición | `scrollY` de partida | Secuencia (tecla, elemento enfocado, `scrollY` ya asentado) |
|---|---|---|---|
| 390 | regla de la hoja (133 px) | 800 | Tab (M3TRIC, ir a) 343 → Tab (Abrir menú) 0 → Enter (Cerrar menú) 0 → Escape (Abrir menú) 0 |
| 390 | `scroll-padding-top` forzado a 0 | 800 | Tab (M3TRIC, ir a) 800 → Tab (Abrir menú) 800 → Enter (Cerrar menú) 800 → Escape (Abrir menú) 800 |
| 1023 | regla de la hoja (133 px) | 800 | Tab (M3TRIC, ir a) 381 → Tab (Abrir menú) 0 → Enter (Cerrar menú) 0 → Escape (Abrir menú) 0 |
| 1023 | `scroll-padding-top` forzado a 0 | 800 | Tab (M3TRIC, ir a) 800 → Tab (Abrir menú) 800 → Enter (Cerrar menú) 800 → Escape (Abrir menú) 800 |
| 1440 (Tab desde el último control, al final de la página) | regla de la hoja (69 px) | 3592 | focus (Referencia: ) 3592 → Tab (body) 3592 → Tab (M3TRIC, ir a) 3148 → Tab (Inicio) 3148 |
| 1440 (Tab desde el último control, al final de la página) | `scroll-padding-top` forzado a 0 | 3592 | focus (Referencia: ) 3592 → Tab (body) 3592 → Tab (M3TRIC, ir a) 3592 → Tab (Inicio) 3592 |

  En escritorio ocurre lo mismo con la barra lateral fija: al llegar con Tab desde el final de la página al logotipo, `scrollY` pasa de 3592 a 3148 (a 3592 con la regla anulada). Es la misma regla (AN-01b, baja: solo teclado, solo al entrar con Tab en un control fijo de la parte superior con la página desplazada; en el uso normal la página ya está arriba porque el recorrido hacia esos controles pasa antes por la cabecera).

### 14.3 W1: el teclado bajo la barra sigue bien

Barra pegada (`top` 0 px a 1440, 64 px a 390), 10 pasos hacia delante desde el último enlace de la barra y 10 hacia atrás desde el último control de la página, con las series sintéticas:

| Ancho | Pasos muestreados | Pasos sobre un control de `main` bajo la barra | Con `top` ≥ borde inferior de la barra | Separación mínima (px) | Cubiertos por la barra (`elementFromPoint`) | El resto de los pasos |
|---|---|---|---|---|---|---|
| 1440 | 20 (10 Tab + 10 Mayús+Tab) | 13 (7 hacia delante, 6 hacia atrás) | 13 de 13 | 7,5 | 0 | 4 enlaces de la barra, 1 `body` (fin del documento), 2 controles de la barra superior o lateral |
| 390 | 20 (10 Tab + 10 Mayús+Tab) | 13 (7 hacia delante, 6 hacia atrás) | 13 de 13 | 8 | 0 | 4 enlaces de la barra, 1 `body` (fin del documento), 2 controles de la barra superior o lateral |

Los 13 pasos que caen sobre un control de `main` dejan su `top` ≥ el borde inferior de la barra, y ninguno queda cubierto. Entre ellos están la región «Alternativa textual…», el mapa (canvas), «Mostrar u ocultar la atribución», el enlace MapLibre y la región de referencia; la separación mínima es la del mapa al subir (7,5 px a 1440 y 8 px a 390). Los demás pasos caen fuera de `main`.

### 14.4 AN-02: tarjetas de resumen de `/live/raw`

| Ancho | Antes (4795cd2) | Ahora (c0be045) | Palabras partidas | Desborde del rótulo (px) | Hueco mínimo texto–icono (px) | Documento y `main` `scrollWidth/clientWidth` |
|---|---|---|---|---|---|---|
| 1024 | 3 col. × 213,3 px, «recepciones» partida, rótulo desborda 16 px | 2 col. × 328 px | 0 | 0 | 50,4 | 1024/1024 y 736/736 |
| 1100 | 3 col. × 238,7 px | 2 col. × 366 px | 0 | 0 | 88,4 | 1100/1100 y 812/812 |
| 1179 | — | 2 col. × 405,5 px | 0 | 0 | 127,9 | 1179/1179 y 891/891 |
| 1180 | 3 col. × 265,3 px | 3 col. × 265,3 px | 0 | 0 | 30,1 | 1180/1180 y 892/892 |
| 1280 | 3 col. × 298,7 px | 3 col. × 298,7 px | 0 | 0 | 21,1 | 1280/1280 y 992/992 |

A 1024, 1100 y 1179 px la rejilla pasa a 2 columnas (328, 366 y 405,5 px; la tercera tarjeta baja a una segunda fila) y desde 1180 px vuelve a 3 (265,3 px a 1180 y 298,7 a 1280); ninguna mide menos de 265 px, ninguna palabra se parte, el rótulo no desborda y el texto queda a ≥ 21,1 px del icono; ni el documento ni `main` desbordan. Capturas: `recheck-raw-1024.webp` y `recheck-raw-1180.webp`.

### 14.5 Guardia de regresión

| Ancho | Estado | `main` | `aria-current=page` | Desborde / barra de secciones | Consola y red |
|---|---|---|---|---|---|
| 1440 | E1 | 1 | Análisis | 1440/1440 y 1152/1152 | 0 errores, 0 `pageerror`, 0 fallidas reales, 0 HTTP ≥ 400, 0 503 (0 cancelaciones) |
| 1440 | E2 (dispositivo real) | 1 | Análisis | 1440/1440 y 1152/1152 | 0 errores, 0 `pageerror`, 0 fallidas reales, 0 HTTP ≥ 400, 0 503 (0 cancelaciones) |
| 1440 | E2 (series sintéticas) | 1 | — | barra `top` 0 (esperado 0) tras desplazar a 1500 px de 3592 | — |
| 390 | E1 | 1 | Análisis | 390/390 y 390/390 | 0 errores, 0 `pageerror`, 0 fallidas reales, 0 HTTP ≥ 400, 0 503 (3 cancelaciones) |
| 390 | E2 (dispositivo real) | 1 | Análisis | 390/390 y 390/390 | 0 errores, 0 `pageerror`, 0 fallidas reales, 0 HTTP ≥ 400, 0 503 (0 cancelaciones) |
| 390 | E2 (series sintéticas) | 1 | — | barra `top` 64 (esperado 64) tras desplazar a 1500 px de 6761 | — |

### 14.6 Veredictos

| Defecto | Veredicto en c0be045 |
|---|---|
| AN-02 | **Corregido.** 2 columnas de ≥ 328 px entre 1024 y 1179 px y 3 desde 1180 px (≥ 265,3 px); sin palabras partidas, sin desborde del rótulo, sin desborde del documento ni de `main` |
| AN-01 (cajón) | **Corregido en lo que depende del código del cajón.** Con ratón (apertura y los tres cierres) `scrollY` = 800 y el foco va a «Cerrar menú» y vuelve a «Abrir menú»; el cierre ya no lleva la página a 0. Con la regla de `scroll-padding-top` intacta |
| AN-01 (apertura) | **Era un artefacto de `locator.click()`**, no del cajón (reproducido como control y ausente con clic crudo) |
| AN-01b (nuevo, baja) | **Abierto.** Tab hacia un control fijo de la parte superior (logotipo y «Abrir menú» a <1024 px; logotipo de la barra lateral a ≥1024 px) con la página desplazada hace que el navegador desplace la página (800 → 344 → 0 a 390; 3592 → 3148 a 1440); lo causa `scroll-padding-top` y desaparece al anularlo. Sugerencia: acotar la regla (por ejemplo, `scroll-margin-top` en lo enfocable de `main`) en lugar de `scroll-padding-top` en `html` |
| W1 | **Sigue cumpliendo** (13 de 13 pasos de `main`, separación mínima 7,5 px) |
| Regresión | Sin cambios: un `main`, «Análisis» activo, barra a 0 y 64 px tras 1500 px, 0 errores de consola |

### 14.7 Evidencia nueva

| Archivo | Tamaño | Contenido |
|---|---|---|
| `recheck-drawer-open-390.webp` | 10,4 KB | Cajón abierto con un clic crudo, página a 800 px (390×844): el contenido de detrás no se movió |
| `recheck-drawer-closed-390.webp` | 15,3 KB | Tras cerrar con Escape: página en 800 px, barra pegada y foco en «Abrir menú» |
| `recheck-raw-1024.webp` | 34,2 KB | `/live/raw` a 1024 px: 2 columnas de 328 px |
| `recheck-raw-1180.webp` | 38,6 KB | `/live/raw` a 1180 px: 3 columnas de 265 px |

Datos crudos: clave `recheck` de `findings.json` (`release`, `an01`, `w1`, `an02`, `guard`, `controlsKeyboardResidual`, `cleanup`). Con las cuatro capturas nuevas la carpeta sigue por debajo de 1,6 MB.

### 14.8 Limpieza

- Usuario temporal `smoke-qa-an2-1791310070` (grupo `admin`) creado hacia las 18:07:51Z, con el `Username` devuelto por `admin-create-user` verificado antes de seguir (variables entre llaves, sin modificadores de zsh), y eliminado con `admin-delete-user` a las 18:14:35Z (rc 0). Comprobación posterior (18:14:39Z): `admin-get-user` devuelve `UserNotFoundException: User does not exist.`; `list-users` con el prefijo `smoke-qa-an` y con `smoke-` devuelve `[]`; el pool queda con `alejandro` y `metric_user`.
- Contraseña aleatoria de 21 caracteres con `admin-set-user-password --cli-input-json` desde un archivo de modo 600, nunca impresa. Borrados el archivo de contraseña, su JSON y el del nombre de usuario. Antes de borrarlos busqué la contraseña, tokens con forma de JWT y claves de AWS Location en la carpeta de evidencia (26 archivos), en la carpeta de trabajo (164 archivos) y en los archivos de texto del espacio temporal: 0 coincidencias.
- Escrituras en AWS: `admin-create-user`, `admin-set-user-password`, `admin-add-user-to-group` y `admin-delete-user` (una vez cada una); lecturas: `cloudformation describe-stacks`, `cloudfront get-distribution`, `list-users`, `admin-get-user`, `admin-list-groups-for-user`. Llamadas a `gh`: 0. Ningún proceso del arnés quedó en ejecución.

### 14.9 Confianza

- **Global: alta** en AN-02, W1 y la guardia (medidas directas repetidas por ancho). **Alta** en que la apertura del cajón con ratón ya no mueve la página y en que el movimiento anterior venía de `locator.click()` (control reproducido). **Media-alta** en AN-01b: medido con y sin la regla en tres anchos, pero la causa exacta en el motor (cómo Chromium trata `scroll-padding` con elementos fijos) sigue siendo una inferencia.
- Lo que me deja menos seguro: el recorrido de teclado en un móvil real y en otros navegadores (solo Chromium); que el residuo AN-01b moleste en la práctica (depende de cómo llegue el foco a la barra superior); y la ausencia de una medición de la apertura con el dedo.
- Convendría que lo revisara quien lleve el frontend de la plataforma (AN-01b).
