# ADR-001 — Barlow como sustituto de DIN 2014 Rounded

| Campo | Valor |
|---|---|
| Estado | Sustituida por ADR-012 (2026-10-05) |
| Fecha | 2026-09-30 |
| Alcance | Tipografía del sitio (`src/app/layout.tsx`, `src/app/globals.css`) |

**Sustituida por ADR-012 (2026-10-05).** El owner eligió Nunito como tipografía única de la landing y la plataforma y dejó de licenciarse DIN 2014 Rounded. El texto que sigue se conserva como historia de la decisión del 2026-09-30 y ya no describe la implementación vigente.

Ver también: ADR-010 (licencia y servicio de DIN 2014 Rounded; retirada por ADR-012). ADR-010 reemplazaba el procedimiento con que cierra la sección «Decisión» de este ADR —agregar los `.woff2` con `next/font/local`—.

## Contexto

El manual de marca (lámina 10) define **DIN 2014 Rounded** como tipografía corporativa. Es una fuente de licencia comercial y la licencia web no ha sido entregada por el cliente (dependencia del cliente n.º 7, `docs/SPEC.md` §16). El repositorio es público (`docs/SPEC.md` §12), por lo que incluir archivos de la fuente sin licencia sería una infracción.

El patrón editorial del manual (lámina 12) mezcla **Bold** y *Light* en los titulares, de modo que la fuente sustituta debe ofrecer ese rango de pesos.

## Decisión

Se declara **Barlow** (SIL Open Font License 1.1) como sustituto, autohospedada en tiempo de build con `next/font/google` (sin petición a Google en tiempo de ejecución). Pesos cargados: 300, 400, 500, 700 y 800; subconjunto `latin`; `display: swap`.

La pila CSS conserva el nombre de la fuente oficial en primer lugar:

```css
--font-sans: "DIN 2014 Rounded", var(--font-barlow), system-ui, sans-serif;
```

Si el cliente entrega la licencia web, se agregan los `.woff2` con `next/font/local` y la pila no cambia (procedimiento en `docs/CONTENIDOS.md`).

## Alternativas consideradas

1. **Incluir DIN 2014 Rounded en el repositorio.** Descartada: sin licencia web y con repositorio público.
2. **Fuentes del sistema únicamente** (`system-ui`). Descartada: la identidad cambiaría según el dispositivo y no se podría fijar el patrón Bold + Light del manual.
3. **Cargar Barlow desde el CDN de Google en tiempo de ejecución.** Descartada: añade una dependencia externa de terceros en cada visita y contradice la CSP `font-src 'self'` (ver `docs/OPERACION.md`).

## Consecuencias

- La sustitución queda **declarada** (REQ-B03 la admite explícitamente) y es reversible sin tocar componentes.
- Cada archivo `woff2` adicional cuesta tiempo de carga: la medición de `docs/evidence/QA-REPORT.md` (D-1) estima ≈ 0,15 s de LCP por archivo (5 archivos woff2, 77 KB antes del LCP). Esto interviene en ADR-005.
- La CSP `font-src 'self'` se mantiene porque las fuentes se sirven desde el mismo origen.
- Barlow figura en el inventario de licencias de `docs/ASSETS.md`.

## Requisitos relacionados

REQ-B03 · REQ-O01 · REQ-C09 · REQ-A11 (CSP)

## Evidencia

- `src/app/layout.tsx` (declaración de `Barlow`) y `src/app/globals.css` (`--font-sans`).
- `docs/evidence/QA-REPORT.md` §7, D-1 (costo por peso tipográfico).
- Pendiente del cliente: licencia web de DIN 2014 Rounded (opcional), `docs/TRACEABILITY.md` → Brechas abiertas.
