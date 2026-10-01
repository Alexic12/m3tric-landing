# Matriz de navegadores

Fecha: 2026-09-30 · Host: macOS 27.0 (Darwin 27.0.0), Node v25.6.0, Playwright 1.63.0.

| Navegador | Proyecto Playwright | Versión | Ejecutado | Resultado (suite completa) | Notas |
|---|---|---|---|---|---|
| Chromium | `chromium` | 153.0.8010.12 | Sí | 63 pass / 0 fail / 0 skip | Único proyecto con axe, 3D (WebGL / `--disable-3d-apis`) y snapshots de regresión |
| Google Chrome (canal estable) | `chrome` | 154.0.8037.58 | Sí | 56 pass / 0 fail / 7 skip | Skips: axe (3) y three (4), solo chromium |
| Microsoft Edge | (`msedge`) | n/d | **No** | no ejecutado | Edge no está instalado en `/Applications`; proyecto comentado en `playwright.config.ts`. Pendiente en una máquina con Edge (motor Chromium, riesgo bajo) |
| Firefox | `firefox` | 155.0 | Sí | 56 pass / 0 fail / 7 skip | Skips: axe (3) y three (4) |
| WebKit | `webkit` | 26.6 | Sí | 56 pass / 0 fail / 7 skip | Ver aviso abajo |
| Safari real (macOS / iOS) | — | — | **No** | smoke manual pendiente | Ver lista de verificación |

(Conteos por proyecto: 63 tests; 231 pass + 21 skip en total = 252. Corrida final ejecutada 2 veces, 0 flaky.)

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
