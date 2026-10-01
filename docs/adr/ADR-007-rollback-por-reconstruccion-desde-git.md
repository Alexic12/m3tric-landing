# ADR-007 — Rollback por reconstrucción desde git

| Campo | Valor |
|---|---|
| Estado | Aceptada; rollback probado el 2026-10-01 (run `36870809775`; ver Evidencia) |
| Fecha | 2026-10-01 |
| Alcance | `.github/workflows/rollback.yml`, `.github/workflows/publish.yml`, `scripts/deploy/*` |

## Contexto

Hay que poder volver a una versión anterior del sitio (REQ-A12). El bucket tiene versionado (las versiones no actuales expiran a los 90 días), así que existen dos caminos: restaurar objetos desde S3 o reconstruir el sitio desde git.

El sitio es un artefacto **reproducible**: `npm run release` genera `out/` a partir de un commit y de las variables del perfil.

## Decisión

El rollback **reconstruye y vuelve a publicar un commit anterior de `main`**; no restaura objetos de S3 ni toca la infraestructura.

`rollback.yml` (manual, `workflow_dispatch`, entradas `ref` y `reason`):

1. **Valida la referencia** (`resolve`): solo caracteres `^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$` (para que no pueda interpretarse como opción de `git`); que resuelva a un commit; que ese commit esté en el historial de `origin/main`; y que contenga `scripts/deploy/publish.sh` (los commits anteriores a este pipeline no se pueden republicar).
2. **Lee las salidas del stack** (`stack`): bucket, distribución y URL, con el rol OIDC en el environment `landing-staging`.
3. **Llama a `publish.yml`** con ese commit y el identificador `rollback-<run_id>-<sha7>`: `npm run release` con perfil staging, `publish.sh`, invalidación, smoke, manifiesto y `_deploy/manifest.json`.

Corre en el mismo grupo de concurrencia que el deploy (`landing-staging`, sin cancelar en curso).

## Alternativas consideradas

1. **Restaurar versiones de S3** (`copy-object` por `versionId`, como describía el manual anterior). Descartada: es manual y no atómica (HTML y activos pueden quedar de versiones distintas), no corrige cabeceras de caché, no deja manifiesto ni smoke, y depende de que las versiones no hayan expirado (90 días).
2. **Conservar el `out/` de cada release como artefacto y volver a subirlo.** Descartada: duplica almacenamiento y el artefacto de un perfil/URL no se reutiliza limpiamente si cambia la distribución.
3. **Desplegar dos entornos (azul/verde).** Descartada: costo y complejidad desproporcionados para un sitio estático de una página.

## Consecuencias

- El rollback queda **trazado igual que un deploy**: tiene manifiesto, smoke y huella SHA-256 de cada archivo.
- Es **más lento** que restaurar un objeto (un build completo más la invalidación, que espera `Completed`).
- Solo se puede volver a commits de `main` que ya contengan el pipeline de publicación.
- El resultado depende de que `npm ci` y las variables del environment (`PLATFORM_URL`, etc.) sigan disponibles; las variables vigentes se aplican al commit antiguo.
- REQ-A12 pide «rollback probado»: **la prueba se hace una vez tras el primer deploy** y se archiva su run en `docs/evidence/live/`.

## Requisitos relacionados

REQ-A12 · REQ-C13 · REQ-O06

## Evidencia

- `.github/workflows/rollback.yml`, `.github/workflows/publish.yml`.
- `scripts/deploy/manifest.mjs` y `scripts/deploy/manifest.test.mjs` › «assembles every documented field».
- **Rollback probado (2026-10-01)**, ciclo completo desplegar → revertir → restaurar, con smoke 10/10 en cada paso (`docs/evidence/QA-REPORT.md` §8):

  | Paso | Run | Release publicada |
  |---|---|---|
  | Deploy inicial | `36869421270` (Deploy staging) | `deploy-1-19f4f15` |
  | Rollback | `36870809775` (Rollback staging) | `rollback-36870809775-f4bdc1c` |
  | Restauración | `36871068392` (Deploy staging) | `deploy-2-19f4f15` |

  Con la release restaurada `deploy-2-19f4f15`, el `releaseId` del manifiesto en vivo coincidió con el meta `m3tric:release` de la página (la suite en vivo lo comprueba). El sha completo de `f4bdc1c` se tomó del identificador de release del run y no se re-verificó. Tras la migración de seguridad, `rollback.yml` conserva el mismo contrato (`stack` lee las salidas con el rol de GitHub, `publish.yml` construye sin token); el flujo completo con la cadena acotada se ejercitó con el deploy `36920298884`, no con un nuevo rollback.
