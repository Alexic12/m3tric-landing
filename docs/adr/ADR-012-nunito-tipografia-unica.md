# ADR-012 — Nunito como tipografía única de la landing y la plataforma

| Campo | Valor |
|---|---|
| Estado | Aceptada — implementada en la landing (2026-10-05); plataforma pendiente |
| Fecha | 2026-10-05 |
| Decisor | Owner (instrucción del 2026-10-05, tras revisar la comparación tipográfica) |
| Alcance | Tipografía de la landing (`src/app/layout.tsx`, `src/app/globals.css`) y del kit de marca (`brand/tokens.json`, `brand/tokens.css`); en la plataforma (repositorio privado `m3tric-platform/frontend`), `package.json`, `tailwind.config.js` y el kit sincronizado |
| Requisitos | REQ-U04 · REQ-B03 · REQ-O01 · REQ-C09 · REQ-A11 (CSP) |

Sustituye a ADR-001 (Barlow como sustituto de DIN 2014 Rounded) y retira ADR-010 (DIN 2014 Rounded: licencia y servicio de los archivos). Ambas se conservan como historia.

## Contexto

El manual de marca (lámina 10, «Color y tipografía») define **DIN 2014 Rounded** como tipografía corporativa. ADR-001 (2026-09-30) declaró **Barlow** como sustituto porque no había licencia web y el repositorio es público. ADR-010 (2026-10-02, DEC-54) diseñó cómo servir DIN desde un bucket privado cuando existiera licencia. Hasta el 2026-10-05 los dos sitios usaban Barlow y la pila nombraba «DIN 2014 Rounded» en primer lugar.

Hechos de licenciamiento de DIN 2014 Rounded (los precios son indicativos y deben confirmarse al comprar):

- Es una familia comercial de **ParaType**. En MyFonts cuesta desde USD 36 por estilo y USD 149 el paquete de siete estilos, y la licencia web se cotiza aparte según el tráfico anual.
- No existe una versión libre ni abierta. Los sitios de «descarga gratuita» distribuyen copias sin licencia, que no pueden usarse: las EULA prohíben redistribuir la fuente y la landing es un repositorio público.
- Las demás opciones de licencia que se consideraron el 2026-10-02 (Fontspring, Adobe Fonts) están en ADR-010.

El 2026-10-05 el owner vio una comparación lado a lado —la muestra del manual frente a Barlow, Nunito, Nunito Sans y Rubik, compuestas con textos reales de M3TRIC (artefacto «Tipografía M3TRIC»)— y eligió **Nunito** por sus terminales redondeadas. Aceptó que es más ancha y más suave que DIN y que esto es una desviación consciente del manual.

## Decisión

**Decisión del owner, 2026-10-05.** La tipografía de la landing y de la plataforma es **Nunito** (SIL Open Font License 1.1, Google Fonts). No se licencia DIN 2014 Rounded.

1. **Fuente.** Nunito es una fuente variable (eje de peso 200–1000). El diseño usa los pesos 300, 400, 500, 700 y 800 (`font.weights` en `brand/tokens.json`), los mismos que con Barlow; la mezcla **Bold** + *Light* de los titulares (lámina 12) se conserva. Pila: `Nunito, system-ui, sans-serif`.
2. **Landing (release 3.4.0).** `next/font/google` descarga Nunito en el build y la autohospeda como una sola fuente variable (subconjunto `latin`, `display: swap`, variable CSS `--font-nunito`); no hay petición a Google al visitar el sitio. El bloque `font` del kit queda `{ family: "Nunito, system-ui, sans-serif", name: "Nunito", license: "SIL Open Font License 1.1", variable: true, weights: [300, 400, 500, 700, 800] }` y `brand/tokens.css` define `--m3-font-sans: Nunito, system-ui, sans-serif`. Se elimina el espacio que el kit reservaba para DIN 2014 Rounded: `brand/fonts/` y el sub-bloque `font.din` de `tokens.json`.
3. **Plataforma (su propio repositorio y su propio release; pendiente).** `@fontsource-variable/nunito` 5.3.0 (OFL-1.1; archivos `nunito-latin-wght-normal.woff2` y su variante cursiva, CSS `index.css`/`wght.css`) reemplaza a `@fontsource/barlow` 5.3.0; `fontFamily.sans` de Tailwind pasa a `Nunito, system-ui, sans-serif`; el kit se vuelve a sincronizar desde el commit fusionado de la landing (ADR-008).
4. **Se retira el diseño de servicio de ADR-010 (DEC-54).** Nunca se implementó, ni en el código ni en la infraestructura: no hay bandera `NEXT_PUBLIC_BRAND_FONT` ni `VITE_BRAND_FONT`, ni bucket de fuentes, ni comportamiento `/fonts/*`, así que no hay nada que retirar de `infra/`. La CSP no cambia: `font-src 'self'`. Los archivos de fuente siguen prohibidos en el repositorio público (`.gitignore` y `scripts/hygiene.sh`): Nunito no los necesita porque se descarga en el build. `scripts/brand-kit.test.mjs` comprueba la pila tipográfica y la ausencia de archivos de fuente bajo `brand/`.

## Alternativas consideradas

1. **Licenciar DIN 2014 Rounded** (ADR-010). Descartada por el owner. Cumpliría el manual al pie de la letra, pero exige comprar la licencia (cifras del contexto, con la licencia web cotizada por tráfico anual) y construir el servicio de ADR-010 en dos repositorios.
2. **Mantener Barlow** (ADR-001), la familia abierta más cercana a DIN. Descartada por el owner.
3. **Nunito Sans y Rubik.** Estaban en la comparación; el owner no las eligió.
4. **Copias «gratuitas» de DIN 2014 Rounded.** Descartada: son copias sin licencia, y la landing es un repositorio público.

## Consecuencias

- **Desviación del manual, registrada como decisión del owner.** El manual (lámina 10) prescribe DIN 2014 Rounded; la landing y la plataforma usan Nunito, más ancha y más suave. Según la precedencia de `docs/SPEC.md` (encabezado), las instrucciones del owner prevalecen sobre el manual de marca. Pendiente (Owner): informar a la oficina de marca y valorar si la lámina 10 del manual requiere una actualización.
- **ADR-001 y ADR-010 quedan sustituidas.** ADR-001 pasa a «Sustituida por ADR-012» y ADR-010 a «Retirada — sustituida por ADR-012». Su texto se conserva como historia y ya no describe el estado vigente.
- **Sin costo de licencia** (la OFL 1.1 permite el uso comercial y la redistribución con su licencia) **ni infraestructura de fuentes:** no hay bucket, comportamiento `/fonts/*` ni bandera de configuración.
- **Sin peticiones a terceros.** La landing sirve la fuente desde su propio origen (la descarga ocurre en el build, no en cada visita) y la CSP conserva `font-src 'self'`. La plataforma hará lo mismo con `@fontsource-variable/nunito` cuando se despliegue; su verificación queda pendiente.
- **Nunito es más ancha que Barlow:** el mismo texto ocupa más espacio. El efecto sobre el diseño de la landing se midió (`CHANGELOG.md` 3.4.0) y las líneas de base visuales se regeneraron.
- **Pesos.** Se usan 300, 400, 500, 700 y 800. Al ser variable (200–1000), el navegador puede interpolar cualquier otro peso, pero el sistema no los usa.
- **Rendimiento sin medir.** Barlow se cargaba como cinco archivos `woff2` (ADR-001); Nunito se carga como una sola fuente variable. Las mediciones de LCP de `docs/TRACEABILITY.md` (REQ-C09 y REQ-A07) se hicieron con Barlow y no se repitieron.
- **La plataforma sigue en su propio release.** Hasta que se despliegue, la landing usa Nunito y la plataforma desplegada usa Barlow, y la copia del kit que tiene la plataforma conserva el bloque anterior hasta que se vuelva a sincronizar (ADR-008). Por eso REQ-U04 sigue Parcial. La revisión de DEC-54 queda por registrar en el registro de decisiones de la plataforma (`docs/platform-live-dashboard/07-decisiones-owner.md`, repositorio privado).
- **La evidencia de la decisión está fuera de este repositorio:** el artefacto de comparación «Tipografía M3TRIC», con copia local en `docs/tipografia-comparacion/` de la raíz del workspace. Este ADR resume qué comparó el owner y qué eligió; no archiva el artefacto.

## Evidencia

- Decisión del owner del 2026-10-05, tras la comparación «Tipografía M3TRIC» (muestra del manual, Barlow, Nunito, Nunito Sans y Rubik sobre textos reales de M3TRIC). Copia local en `docs/tipografia-comparacion/` de la raíz del workspace, fuera de este repositorio.
- Implementación en la landing (release 3.4.0; su identificador consta en `CHANGELOG.md` y en el manifiesto de despliegue): `src/app/layout.tsx` (declaración de `Nunito`), `src/app/globals.css` (`--font-sans`), `brand/tokens.json` (bloque `font`), `brand/tokens.css` (`--m3-font-sans`) y `scripts/brand-kit.test.mjs` (pila y ausencia de archivos de fuente).
- Pendiente — se completa tras el despliegue: al redactar este ADR no hay un run de CI ni un release en vivo de esta decisión. La verificación en vivo comprobará, en la landing y luego en la plataforma, que la fuente computada del `h1` sea Nunito y que no haya peticiones a terceros.
- Estado de REQ-B03 y REQ-U04: `docs/TRACEABILITY.md` §4, §6.2 y §7 (ambos Parcial).
