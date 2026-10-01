# ADR-006 — Snapshots visuales solo locales; CI valida todo lo demás en tres motores

| Campo | Valor |
|---|---|
| Estado | Aceptada |
| Fecha | 2026-10-01 |
| Alcance | `playwright.config.ts`, `tests/e2e/visual.spec.ts`, `package.json` (`test:e2e:ci`), `.github/workflows/ci.yml` |

## Contexto

La regresión visual (`tests/e2e/visual.spec.ts`) compara capturas de página completa de Chromium con *baselines* guardadas en `tests/e2e/__snapshots__/`. Esas baselines se generaron en macOS. El render de fuentes y el antialiasing difieren en Linux, que es el sistema de los *runners* de GitHub (`ubuntu-latest`); la comparación fallaría en CI por razones que no son defectos del sitio (`docs/evidence/QA-REPORT.md` §9 ya lo advertía).

## Decisión

- La **comparación de snapshots visuales se ejecuta solo en local** (`npm run test:e2e`, que corre los cuatro proyectos y luego convierte las capturas con `evidence:screens`; `npm run test:e2e:update` regenera las baselines de Chromium).
- **CI ejecuta todo lo demás** en tres motores —`chromium`, `firefox` y `webkit`— con `--ignore-snapshots` (job `e2e` de `ci.yml`, un job por motor). Las capturas de página completa se siguen generando y el resto de las aserciones (contenido, enlaces, responsive, interacción, resiliencia, axe y 3D) se evalúan.
- El proyecto `chrome` (canal estable de Google Chrome) se usa solo en local: CI instala únicamente `chromium firefox webkit` (`npx playwright install --with-deps chromium firefox webkit`).

## Alternativas consideradas

1. **Generar las baselines en Linux dentro de CI.** Descartada: obliga a reescribir baselines desde el *runner* y a revisarlas a ojo en cada cambio de fuente o de versión de navegador.
2. **Subir el umbral de diferencia (`maxDiffPixelRatio`) hasta que pase en ambos SO.** Descartada: un umbral que tolera render de otro SO también tolera regresiones reales.
3. **Contenedor Docker fijo para correr los e2e en local y en CI.** Aplazada: aumenta el costo de mantenimiento para una landing de una página.

## Consecuencias

- Una regresión puramente visual (color, espaciado) **no la detecta CI**: la detecta quien corra `npm run test:e2e` antes de abrir el PR. Es un riesgo aceptado y documentado.
- Las baselines de Chromium están fijadas a macOS; deben regenerarse tras cambios de copy o de diseño (`npm run test:e2e:update`).
- La evidencia versionada de `docs/evidence/` (capturas WebP, axe, matriz de enlaces) se genera en local con `npm run test:e2e`; el job de CI no la publica.

## Requisitos relacionados

REQ-O02 · REQ-C10 · REQ-C11 · REQ-A02

## Evidencia

- `playwright.config.ts` (proyectos `chromium`, `firefox`, `webkit`, `chrome`; `snapshotPathTemplate`).
- `tests/e2e/visual.spec.ts` › «full-page screenshot at 360px», «… 768px», «… 1280px», «… 1920px».
- `.github/workflows/ci.yml`, job `e2e` (`npx playwright test --ignore-snapshots --project=…`).
- `package.json`: `test:e2e`, `test:e2e:ci`, `test:e2e:update`.
- Corrida de CI sobre el PR #1: Pendiente — se completa con el despliegue (enlace al run).
