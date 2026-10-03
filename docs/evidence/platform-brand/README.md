# Evidencia de la plataforma — unificación de marca (2026-10-02)

Evidencia de los requisitos REQ-U01 a REQ-U05 (`docs/SPEC-UNIFICACION.md`), medida sobre la plataforma de staging (`https://d3pz2gipvkcx1b.cloudfront.net`, distribución `E3LBUHUINTWS0F`). La matriz que la cita es `docs/TRACEABILITY.md` §7; los hallazgos, con su dueño, están en §6.6.

| Ruta | Qué contiene | Cómo se produjo |
|---|---|---|
| `QA-REPORT.md` | Informe de la QA en vivo tras el despliegue del PR #190 (`1c8e17d`): 36 verificaciones (V01 a V36), comparación antes/después, hallazgos QA-01 a QA-12 y límites | Escrito a partir de `after/findings.json`. Método en §3, límites en §7, limpieza en §9 |
| `after/` | 53 archivos (2,0 MB): `findings.json` (datos crudos y 72 comprobaciones con veredicto), seis informes axe (`axe-*.json`) y capturas WebP a 1440 y 390 px | Un solo Chromium 153.0.8010.12 (Playwright 1.63.0, axe-core 4.13.0), rutas en secuencia, con un usuario temporal de Cognito ya eliminado. Las URL se guardan sin cadena de consulta |
| `before/` | 36 archivos: `findings.json` y 35 capturas WebP de la plataforma anterior a la unificación (Inter, degradados, `lang="en"`) | Mismo navegador y mismas ventanas (1440×900 y 390×844) que `after/`; `findings.json` registra `startedAt` 2026-10-02T03:34Z, antes del despliegue de las 14:34Z |
| `lighthouse/` | `login-antes-en-vivo.report.json` y `login-despues-local.report.json` | Lighthouse 12.8.2 con `npx`, móvil simulado, sobre `/login`: el sitio en vivo antes del cambio (13:44Z) y el código nuevo servido en local en `http://127.0.0.1:4173/login` (13:43Z). Referencia: DEC-61 de la plataforma. `npm run perf:budget` de la plataforma usa Lighthouse 13.4.1, así que sus cifras no se mezclan con estas (`docs/SPEC-UNIFICACION.md` §14.4) |

## Cómo leerla

- `after/findings.json` agrupa `meta` (release, infraestructura y corridas), `views` (por ancho y ruta), `network`, `hosts`, `axe`, `checks`, `englishScan`, `incidents.liveApi503`, `staticScan` y `shots`.
- Las cifras del despliegue (PR #190, plan, change set, stack y humo HTTP) las verificó el Tech Lead contra GitHub y AWS; no hay salida cruda de ellas en esta carpeta. El resumen está en `docs/SPEC-UNIFICACION.md` §14.1.

## Límites

- **No hay un script que regenere `after/`.** La QA usó un script temporal que se eliminó al terminar (`QA-REPORT.md` §9). Se archivan los datos crudos y el método, así que repetirla exige reescribir el arnés.
- Un solo navegador (Chromium), sin lector de pantalla ni emulación táctil; el viewport de 390 px usa un agente de escritorio, igual que `before/`.
- El detalle de `/live` (barra lateral, foco y axe) viene de la corrida de las 15:03Z; después `/api/live/*` respondió 503 (QA-02) y no pudo repetirse.
- `lighthouse/` compara una medición en vivo con una local: no es una comparación entre iguales y no hay una medición en vivo del código nuevo.
