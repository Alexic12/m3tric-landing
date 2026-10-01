# Matriz de navegadores

Fecha: 2026-10-01 · Host: macOS 27.0 (Darwin 27.0.0), Node v25.6.0, Playwright 1.63.0 · Local: `npm run test:e2e` · En vivo: `npm run test:live` contra `https://d21guxd9tjai7a.cloudfront.net` (release `deploy-2-19f4f15`, staging).

| Navegador | Proyecto Playwright | Versión | Local (suite completa) | En vivo (CloudFront) | Notas |
|---|---|---|---|---|---|
| Chromium | `chromium` | 153.0.8010.12 | 86 pass / 0 fail / 0 skip | 19 pass / 0 fail / 0 skip | Único proyecto con axe, 3D verificado (canvas `3d`) y snapshots de regresión |
| Google Chrome (canal estable) | `chrome` | 154.0.8037.58 | 79 pass / 0 fail / 7 skip | no ejecutado (no es proyecto de la suite en vivo; mismo motor que chromium) | Skips: axe (3) y three (4) |
| Microsoft Edge | (`msedge`) | n/d | **No** | **No** | No instalado en `/Applications`; proyecto comentado en `playwright.config.ts`. **Pendiente** en una máquina con Edge (motor Chromium, riesgo bajo) |
| Firefox | `firefox` | 155.0 | 79 pass / 0 fail / 7 skip | 11 pass / 0 fail / 8 skip; sin errores de consola/CSP/red; 3D montado (`data-visual="3d"`) | Aviso propio del navegador `WebGL context was lost.` por el sondeo `hasWebGL2()` (benigno, ver QA-REPORT §4) |
| WebKit | `webkit` | 26.6 | 79 pass / 0 fail / 7 skip | 11 pass / 0 fail / 8 skip; sin errores de consola/CSP/red; 3D montado | Ver aviso abajo |
| Safari real (macOS / iOS) | — | — | — | **No** | Smoke manual **pendiente**; ver lista de verificación |

Local: 344 tests por corrida completa = 323 pass + 21 skip, 0 fail, 0 flaky (2 corridas consecutivas idénticas). En vivo: 57 tests = 41 pass + 16 skip por corrida (chromium 19 ejecutados, firefox 11, webkit 11; los 16 skips son axe y HTTP, solo-chromium), 2 corridas consecutivas idénticas, 0 flaky. La suite en vivo cubre en los tres motores: respuestas 200/304 del mismo origen, 0 terceros, 0 errores de consola, 0 violaciones CSP, orden de secciones, perfil staging, CTAs, sin desbordamiento (5 anchos), menú modal con trampa de foco y capturas a 360/1280; chromium añade axe y los chequeos HTTP.

## Aviso: Playwright WebKit no es Safari

Playwright WebKit es un build de WebKit con parches de Playwright; **no es** Safari. No comparte el chrome del navegador, la UI de Tab/foco, el comportamiento de la barra de direcciones en iOS (viewport dinámico `svh`/`dvh`), las extensiones, el bloqueo de contenido, ni la pila de medios/GPU de Safari. En macOS, un `Tab` desnudo no enfoca enlaces (igual que Safari con la opción por defecto); la suite usa `Alt+Tab` para WebKit/darwin (`tests/helpers/page.ts#tabChord`). **Sigue siendo obligatorio un smoke manual en Safari real** (macOS e iOS).

## Smoke manual en Safari (macOS y iOS) — resultado por completar

| # | Comprobación | Safari macOS | Safari iOS |
|---|---|---|---|
| 1 | La página carga sin errores visibles; fuente Barlow aplicada | | |
| 2 | Hero: imagen, titular y botón "Abrir plataforma" visibles y sin solapes | | |
| 3 | "Abrir plataforma" (header, hero, contacto) abre la URL de plataforma configurada | | |
| 4 | Menú móvil: abre, enlaces navegan, cierra con el botón y al elegir enlace; sin scroll del fondo | | |
| 5 | Tras pulsar un enlace del menú/nav, el titular de la sección no queda tapado por el header | | |
| 6 | Sección Escalas: pestañas M1/M2/M3 cambian panel; escena 3D carga o se ve el SVG de respaldo | | |
| 7 | Sin scroll horizontal en portrait y landscape (iPhone) | | |
| 8 | Barra de direcciones colapsa/expande sin saltos del hero | | |
| 9 | Enlace `mailto:` abre Mail con asunto prellenado; `tel:` marca (iOS) | | |
| 10 | Movimiento reducido activado en Ajustes: contenido visible sin animaciones | | |
| 11 | Zoom de texto al 200 % sin pérdida de contenido | | |
| 12 | `/no-existe` muestra "Esta página no existe" (según hosting) | | |
| 13 | Favicon / icono de pantalla de inicio correctos | | |
