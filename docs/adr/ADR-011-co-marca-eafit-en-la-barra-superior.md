# ADR-011 — Co-marca de la Universidad EAFIT en la barra superior

| Campo | Valor |
|---|---|
| Estado | Aceptada — implementada (2026-10-02); vector oficial y confirmación de la oficina de marca de EAFIT pendientes |
| Fecha | 2026-10-02 |
| Requisitos | REQ-O07 (instrucción del owner: logo de EAFIT a la derecha del logo M3TRIC, en el azul institucional), REQ-B01 (el logo M3TRIC conserva su área de protección) |

## Contexto
La landing es una iniciativa apoyada por la Universidad EAFIT. El owner pidió el 2026-10-02 que el logo de la universidad aparezca en la barra superior, a la derecha del logo de M3TRIC, en el color institucional de EAFIT, sin alterar el resto de la paleta. Hasta entonces, las menciones institucionales figuraban como dependencia del cliente (`docs/SPEC.md` §16).

## Decisión
- Wordmark «Universidad EAFIT» vectorizado a partir del PNG institucional entregado por el owner (`src/components/brand/eafit-paths.json`, trazado con potrace a 8×; fidelidad verificada contra el original). Se reemplazará por el vector oficial cuando la universidad lo entregue, sin cambiar la API del componente.
- Color: azul EAFIT según su manual de identidad, RGB 0/75/133 (`#004B85`, Pantone 294C), sobre la barra blanca. Sobre el hero verde oscuro el azul no es legible (≈1.3:1), así que allí el wordmark va en blanco, igual que el logo M3TRIC pasa a su variante *reverse*.
- Composición: separador hairline y tamaño menor que el logo M3TRIC (jerarquía: M3TRIC primario). Es una marca, no un enlace; nombre accesible «Universidad EAFIT»; el grupo lleva el rótulo «Iniciativa con el apoyo de la Universidad EAFIT».
- Alcance: solo la barra superior. El resto de la paleta de la landing no cambia.

## Alternativas descartadas
- Azul marino genérico: se prefiere el valor documentado por EAFIT.
- Mostrar el azul sobre el hero mediante una pastilla blanca: añade un elemento ajeno al sistema; la variante blanca sigue el patrón ya usado por el logo M3TRIC.
- Incluirlo en el kit `brand/`: el kit es la marca M3TRIC; la co-marca vive en la landing hasta que otra superficie la necesite.

## Consecuencias
- Prueba e2e en `tests/e2e/content.spec.ts` (presencia en ambos estados de la barra, sin enlace).
- Pendiente: vector oficial de EAFIT y confirmación de su oficina de marca sobre el uso en co-marca.

## Evidencia
- Release `deploy-11-cd7d8b9` (commit `cd7d8b9`, CHANGELOG 3.3.0), publicado por `Deploy staging` con smoke 10/10.
- Prueba e2e `content › «header carries the EAFIT co-brand next to the M3TRIC logo (owner decision 2026-10-02)»` (`tests/e2e/content.spec.ts`): el nombre accesible «Universidad EAFIT» es visible junto al logo M3TRIC arriba y tras desplazar 900 px, y ningún enlace lleva ese nombre. Subconjunto de e2e en chromium 59/59 y unitarias 208/208, en local (Tech Lead, 2026-10-02).
- Estado de REQ-O07: `docs/TRACEABILITY.md` §1 y §6.2 (Parcial). Está implementada, desplegada y probada; faltan el vector oficial de EAFIT y la confirmación de su oficina de marca (las dos condiciones pendientes de «Consecuencias»; dependencia n.º 8, §6.5).
- Inventario del componente y de sus trazados: `docs/ASSETS.md` («EafitLogo»).
