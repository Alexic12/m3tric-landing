# ADR-004 — `noindex` en staging (dominio `cloudfront.net` provisional)

| Campo | Valor |
|---|---|
| Estado | Aceptada |
| Fecha | 2026-10-01 |
| Alcance | `src/app/layout.tsx`, `src/app/robots.ts`, `src/config/site.ts`, `infra/lib/landing-site-stack.ts`, `infra/config/staging.json`, `scripts/lib/artifact-rules.mjs` |

## Contexto

La primera URL pública de la landing es el dominio de la distribución (`*.cloudfront.net`), provisional y con contenido sujeto a aprobación del cliente. Si un buscador la indexa, el dominio provisional compite con el definitivo y expone copy no aprobado (REQ-C12, REQ-B07).

## Decisión

En el perfil `staging` (cualquier perfil distinto de `production`) el sitio se declara **no indexable en tres capas independientes**, que deben coincidir:

1. **Meta robots** `noindex, nofollow` en el HTML (`robots: { index: false, follow: false }` en `layout.tsx`).
2. **`robots.txt`** con `User-Agent: *` y `Disallow: /`, **sin** línea `Sitemap` (`robots.ts`).
3. **Cabecera `X-Robots-Tag: noindex, nofollow`** en CloudFront, con `override`, activada por `robotsNoindex: true` en `infra/config/staging.json`.

En el perfil `production` ninguna de las tres está presente y `robots.txt` anuncia el sitemap.

Además, se mantiene un meta `m3tric:release` con el identificador del despliegue, que el smoke compara con el esperado.

## Alternativas consideradas

1. **Solo meta robots.** Descartada: no protege recursos que no son HTML (imágenes, PDF futuros) ni a rastreadores que ignoran el HTML.
2. **Solo `robots.txt`.** Descartada: `Disallow` impide rastrear pero una URL enlazada desde fuera puede seguir apareciendo en resultados.
3. **Autenticación básica o lista de IP en staging.** Descartada: el cliente y su equipo deben poder abrir la URL sin credenciales; cuesta una función de borde adicional.
4. **Publicar indexable y confiar en que no habrá enlaces externos.** Descartada: sin garantía.

## Consecuencias

- Es **esperado** que en staging `curl -I` muestre `X-Robots-Tag: noindex, nofollow`; no es un error.
- Pasar a producción exige poner `robotsNoindex` en `false` (nuevo `infra/config/production.json`) y `RELEASE_PROFILE=production`; el gate y el smoke fallan si las tres capas no son coherentes con el perfil.
- La coherencia se comprueba en tres momentos: en el artefacto (`check:artifact`), en infraestructura (pruebas de plantilla) y en vivo (smoke).
- Los e2e se construyen con perfil `production` (`build:e2e`), por lo que no cubren el estado `noindex`; esa cobertura la dan `check:artifact`, las pruebas unitarias de `artifact-rules` y el smoke.

## Requisitos relacionados

REQ-C07 · REQ-A05 · REQ-B07 · REQ-C13

## Evidencia

- `scripts/lib/artifact-rules.mjs` (`profileProblems`) y `scripts/lib/artifact-rules.test.mjs` › «coherent staging passes, including the release id», «staging without noindex fails», «staging with an open robots.txt fails», «production carrying noindex or Disallow: / fails».
- `scripts/check-artifact.mjs` (se ejecuta en `npm run release`).
- `infra/test/landing-site-stack.test.ts` › «sends the exact SPEC §10.2 security headers, overriding the origin, plus X-Robots-Tag in staging», «omits X-Robots-Tag (and only it) when robotsNoindex is false».
- `scripts/deploy/smoke.mjs`, checks «Release profile and release id (meta + robots.txt)» y «Security headers on /».
- Resultado en vivo (2026-10-01, `https://d21guxd9tjai7a.cloudfront.net`): el smoke de los runs `36869421270`, `36871068392` y `36920298884` pasó 10/10, incluidos «Release profile and release id (meta + robots.txt)» y «Security headers on /» (`deploy-manifest.json`, campo `smoke`). La suite en vivo (`tests/live`, `docs/evidence/live/`, `QA-REPORT.md` §4) comprueba en chromium, firefox y webkit el meta robots `noindex, nofollow` y, en chromium, la cabecera `X-Robots-Tag` con `noindex` y `nofollow` en `/`, en una respuesta 404 y en un asset de `_next/static`. Lighthouse en vivo da SEO 69 solo por `is-crawlable` (efecto esperado de esta decisión; `QA-REPORT.md` §5).
