# ADR-005 — LCP medido en CloudFront, no en local

| Campo | Valor |
|---|---|
| Estado | Aceptada; el presupuesto de LCP se **cumple en vivo** (1,52 s en CloudFront, 2026-10-01; ver Evidencia) |
| Fecha | 2026-10-01 |
| Alcance | Presupuestos de rendimiento (`docs/SPEC.md` §8), `docs/evidence/QA-REPORT.md` D-1, `tests/helpers/lighthouse.mjs`, `tests/helpers/serve-gzip.mjs` |

## Contexto

El presupuesto de rendimiento (móvil) exige LCP ≤ 2,5 s. La medición local no lo cumple, y el informe de QA (`docs/evidence/QA-REPORT.md`, defecto **D-1**) lo documenta con números:

| Corrida (Lighthouse móvil, servidor gzip local) | Perf | LCP |
|---|---|---|
| Antes del lote de correcciones | 92–93 | 3,2–3,3 s |
| Después del lote | **95** | **2,9 s** |
| Escritorio, gzip | 100 | 0,8 s |
| Móvil, `serve-out` sin compresión (no guardado) | 77 | 5,8 s |

Hallazgos de D-1:

- El elemento LCP es texto (`h1#inicio-title > span.text-light`). En el *trace* real el LCP ocurre a los **79 ms**; los 2,9 s son la **estimación de Lantern**, que promedia un grafo optimista y uno pesimista con todo lo cargado antes de ese pintado. En localhost equivale a «cargar todo el camino crítico por HTTP/1.1 a 1,6 Mbps».
- Transferido antes del LCP (gzip): documento 33 KB · 5 fuentes woff2 77 KB · CSS 9 KB · 7 scripts 135 KB · imagen hero móvil 25 KB.
- Mejoras ya aplicadas y medidas por separado: imagen móvil de 747 a 480 px q55 (−0,15 s) y capa SVG de respaldo fuera del HTML inicial (−0,22 s).
- **Suelo medido: 2,8 s** para una página con solo Hero + Header y los mismos 5 pesos tipográficos. Bajar de 2,5 s exige quitar 3 o más pesos (incluido el Light 300 del titular editorial) o recortar contenido, lo que altera el diseño aprobado. No se aplicó.
- El entorno local no representa a CloudFront: HTTP/1.1 con 6 conexiones y sin brotli. No se pudo montar HTTP/2 con certificado autofirmado bajo Lighthouse.
- Opciones restantes, ninguna aplicada: (a) subsetear Barlow a los glifos del español con `next/font/local` (≈ −35 KB, ≈ −0,2 s); (b) reducir a 4 pesos (−0,08 s); (c) diferir el globo con `IntersectionObserver` (−0,08 s). Con (a)+(b)+(c) el modelo apunta a ≈ 2,55–2,6 s, que tampoco llega a 2,5 s.

## Decisión

1. **El LCP de aceptación se mide contra la URL de CloudFront** (HTTP/2 o HTTP/3, brotli, caché de borde), con Lighthouse móvil, y se archiva en `docs/evidence/live/`.
2. La cifra local (2,9 s) se conserva como **referencia comparativa**, no como criterio de aceptación ni como motivo de rediseño.
3. Los demás presupuestos se evalúan igual en local y en vivo: Perf ≥ 90 y A11y/BP/SEO ≥ 95 (cumplen en local: 95 / 100 / 100 / 100), CLS ≤ 0,05 (0), TBT ≤ 200 ms (10 ms), JS inicial ≤ 180 KB gz (135 KB), chunk 3D ≤ 250 KB gz (≈ 226 KB).
4. Si el LCP en vivo supera 2,5 s, se evalúan las opciones (a), (b) y (c) en ese orden antes de tocar el diseño, y se registra el resultado como nuevo defecto.

## Alternativas consideradas

1. **Recortar pesos tipográficos o contenido hasta pasar en local.** Descartada: cambia el diseño aprobado para optimizar una simulación que no es el entorno de producción.
2. **Relajar el presupuesto a 3,0 s.** Descartada: el presupuesto proviene del alcance técnico; solo se revisa con datos del entorno real.
3. **Aplicar (a)+(b)+(c) ahora.** Descartada por ahora: el modelo estima que no basta y exige generar y versionar archivos `woff2` sin evidencia de que se necesite.

## Consecuencias

- REQ-A07 y REQ-C09 quedan **Parciales** hasta tener la medición en vivo.
- El resultado puede ser negativo: la medición en CloudFront puede confirmar el incumplimiento. En ese caso se aplica la decisión 4.
- `docs/OPERACION.md` y `docs/SPEC.md` §8 remiten a esta decisión para interpretar la cifra local.

## Requisitos relacionados

REQ-A07 · REQ-C09 · REQ-C10 · REQ-B03 (costo tipográfico, ADR-001)

## Evidencia

- `docs/evidence/QA-REPORT.md` §4 (D-1) y §7 (desglose); `docs/evidence/lighthouse-{mobile,desktop}-gzip.report.{html,json}`. Estos archivos corresponden a la versión v2 del sitio y deben regenerarse con v3.
- **Medición contra CloudFront (2026-10-01, release `deploy-2-19f4f15`, Lighthouse 12.8.2, 3 corridas por factor):** `docs/evidence/live/lighthouse-live-summary.json` y `lighthouse-{mobile,desktop}-run{1,2,3}.report.json`. Móvil, corrida mediana: Perf 100 / A11y 100 / BP 100, **LCP 1,52 s** (1,520 / 1,522 / 1,523 s en las tres corridas), CLS 0, TBT 5 ms; el presupuesto de 2,5 s se cumple con ~1 s de margen. Escritorio: LCP 0,35 s. D-1 queda **cerrado** (`QA-REPORT.md` §5 y §9); la decisión 4 no se activa y no se aplicó ningún recorte de fuentes ni de contenido. SEO 69 en staging es el efecto de `noindex` (ADR-004). No se repitió sobre `deploy-3-7c618b7`.
