# Kit de marca M3TRIC

Fuente única de la identidad visual que comparten la landing pública (`Alexic12/m3tric-landing`) y la plataforma (`Alexic12/M3TRIC_Platform`). Origen: Manual de identidad M3TRIC (abril 2026), interpretado en `docs/SPEC.md` §3; las reglas para documentos (`documentos.md`) son de autoría propia, no del manual. Decisiones: `docs/SPEC-UNIFICACION.md` (DEC-53 y DEC-54). La versión del kit está en `manifest.json`.

Este README se copia a la plataforma junto con el resto de `brand/`, pero los scripts, las pruebas y los archivos de `src/`, `docs/` e `infra/` que cita **viven en el repositorio de la landing**, no en el de la plataforma. Los comandos `npm run …` se ejecutan allí.

Este directorio **no se publica en el sitio**: vive en la raíz del repositorio de la landing y no pasa por `public/` ni por `out/`.

## Contenido

| Archivo | Qué es | Origen |
|---|---|---|
| `tokens.json` | Paleta exacta del manual, niveles de alerta (con sus nombres en español en `levelLabel`), tipografía (pila, nombre, licencia y pesos de Nunito), radios, foco, sombra, geometría de las tres barras y serie de colores para gráficos | **Fuente**, se edita a mano |
| `tokens.css` | Las mismas variables como `:root`: `--m3-green-900`, `--m3-red`, `--m3-ink`, `--m3-font-sans`, `--m3-radius-card`… | Generado |
| `logo/paths.json` | Vectores oficiales del wordmark (lámina 8): `viewBox`, `body` (M, TR, I, C) y `bars` (las tres barras del «3») | **Fuente**, se edita a mano; no se redibuja |
| `logo/m3tric-logo-color.svg` | Cuerpo `#004124`, barras `#74C69D`; para fondos claros | Generado |
| `logo/m3tric-logo-reverse.svg` | Cuerpo `#B7E3C7`, barras `#74C69D`; para fondos `#004124` | Generado |
| `logo/m3tric-logo-mono-dark.svg` | Una tinta negra, barras al 50 % | Generado |
| `logo/m3tric-logo-mono-light.svg` | Una tinta blanca, barras al 50 % | Generado |
| `logo/m3tric-mark.svg` | Tres barras sobre cuadrado `#004124` (favicon; pendiente de validación de marca) | Copia de `src/app/icon.svg` (repo de la landing) |
| `motifs/triple-bar.svg` | Las tres barras del «3» (64.49 · 64.49 · 91.7 × 23.52, separación 14.26), `currentColor`, decorativo | Generado |
| `images/aerial-wide-1280.webp`, `images/aerial-tall-747.webp`, `images/globe-1000.webp` | Fotografía del manual sin texto incrustado | Copia de `public/images/` (repo de la landing) |
| `manifest.json` | `version`, `generatedAt` (solo fecha) y sha256 de cada archivo del kit, salvo él mismo (contrato más abajo) | Generado |
| `documentos.md` | Reglas de marca para documentos: reportes PDF, XLSX, CSV e impresos (página, logo, motivo de tres barras, paleta en papel, tipografía y números es-CO, tablas, gráficas, portada, cabecera y pie, nombres de archivo, tono y lista de verificación). Escrito para el kit con autorización del owner (2026-10-07); el manual no trae guía de documentos | Escrito a mano |
| `README.md` | Este documento | Escrito a mano |

## Reglas

1. **`tokens.json` y `logo/paths.json` son las únicas fuentes.** Todo lo demás se genera o se copia, salvo los dos textos escritos a mano (`README.md` y `documentos.md`): no edite a mano `tokens.css`, los SVG del logo, `motifs/triple-bar.svg` ni `manifest.json`.
2. El kit es un **inventario explícito**. Un archivo que no esté en el inventario del generador (`AUTHORED` y `MIRRORS` en `scripts/brand-build.mjs`, repo de la landing) hace fallar `npm run brand:build` antes de escribir nada, y también fallan las pruebas. Así se **detecta** un archivo de fuente que alguien deje en `brand/`; que no llegue a git lo garantizan `.gitignore` y `npm run hygiene`. El kit no lleva archivos de fuente: `--m3-font-sans` nombra a Nunito (SIL Open Font License 1.1, variable) y cada sitio la carga por su cuenta; la landing la descarga en el build con `next/font/google`.
3. La landing repite valores del kit en `src/app/globals.css` (`@theme`), `src/config/brand.ts`, `COLORS` de `src/components/brand/Logo.tsx` y la geometría de `src/components/brand/TripleBar.tsx`. `scripts/brand-kit.test.mjs` (repo de la landing) falla si dejan de coincidir con el kit. `Logo.tsx` ya no contiene vectores: importa `logo/paths.json`.
4. Colores (resumen de `docs/SPEC.md` §3.2): `yellow`, `orange` y `red` son **solo** para niveles de alerta (Atención, Alerta, Crítico); `#74C69D` no es color de texto sobre blanco ni sobre beige (sobre blanco 2.04:1; sobre beige aún menor) y se usa en las barras del «3» y como acento sobre fondos oscuros; el texto sobre fotografía lleva un velo `#004124` de al menos 70 %.
5. `documentos.md` **cita** valores del kit y no los define: si cambia un hex o la serie de gráficas en `tokens.json`, se actualiza el documento. `scripts/brand-kit.test.mjs` falla si el documento deja de nombrar un color del kit junto a su hex, si cita un hex que no es del kit, si altera el orden de `chartSeries` o si pierde el aviso informativo textual. Tiene su propia versión (en su encabezado), que sube quien lo edite.

## Contrato del manifiesto

`manifest.json` es `{ "version", "generatedAt", "files" }`. Quien lo consuma, por ejemplo `scripts/brand-sync.mjs` de la plataforma, puede apoyarse en esto:

- `files` lista todos los archivos de `brand/` salvo `manifest.json`, que no se incluye a sí mismo. Las claves son rutas POSIX relativas a `brand/` (separador `/`, sin `./`), ordenadas por código de carácter.
- Cada valor es el sha256 en hexadecimal minúscula (64 caracteres) de los **bytes crudos** del archivo, sin normalizar saltos de línea ni codificación. Por eso el `.gitattributes` de la landing fija LF en los textos del kit y marca los `.webp` como binarios; `scripts/brand-kit.test.mjs` lo comprueba con `git check-attr`.
- `version` repite la de `tokens.json`.
- `generatedAt` es una **fecha UTC** (`AAAA-MM-DD`, sin hora) y solo cambia cuando cambia el contenido del kit: no registra cuándo se ejecutó el build.

## Cómo se usa

- **CSS:** importe o copie `tokens.css` y use las variables, por ejemplo `color: var(--m3-green-900)`. Los niveles de alerta son `--m3-level-attention`, `--m3-level-alert` y `--m3-level-critical` (alias de `--m3-yellow`, `--m3-orange` y `--m3-red`).
- **JS/TS:** importe `tokens.json` (por ejemplo, desde `tailwind.config.js`). `level` indica qué color usa cada nivel y `levelLabel` su nombre en español.
- **Logo:** elija la variante que contraste con el fondo (`color` sobre claro, `reverse` sobre `#004124`, `mono-*` para una sola tinta). Ancho mínimo 96 px y área de protección igual al alto de una barra (`docs/SPEC.md` §3.4). Los SVG llevan `role="img"`, `aria-label="M3TRIC"` y `<title>`. Si el logo se inserta en línea, use los `path` de `logo/paths.json`; no los redibuje.
- **Documentos:** quien genere un PDF, un XLSX o un CSV de marca sigue `documentos.md`; su sección 12 es la lista que corre QA. Los reportes de la plataforma deben regirse por él desde el kit 1.2.0.
- **`motifs/triple-bar.svg`:** usa `currentColor`, así que se colorea en línea o como máscara CSS (dentro de un `<img>` se vería negro).

## Cómo se sincroniza con la plataforma

La plataforma **copia** el kit, no lo instala como dependencia (DEC-53). `scripts/brand-sync.mjs`, en el repositorio de la plataforma, copia `brand/**` desde un commit fijado de este repositorio y verifica el sha256 de cada archivo contra `brand/manifest.json` (contrato arriba). Así cada versión de la plataforma declara qué commit del kit usa.

## Cómo actualizar el kit

Estos pasos se ejecutan en el repositorio de la landing.

1. Edite **solo** `tokens.json` o `logo/paths.json` (o los textos `README.md` y `documentos.md`). Si cambia `src/app/icon.svg` o una imagen espejada de `public/images/`, el kit se actualiza con el mismo comando.
2. Suba `version` en `tokens.json`. Es informativa: la plataforma fija un commit, no una versión. Si editó `documentos.md`, suba también la versión de su encabezado y anótela en su historial.
3. Ejecute `npm run brand:build`. Regenera `tokens.css`, los SVG, `motifs/triple-bar.svg`, las copias y `manifest.json`. Es idempotente: sin cambios no escribe nada. `node scripts/brand-build.mjs --out DIR` construye una copia completa en `DIR` sin tocar `brand/`; `DIR` debe no existir o estar vacío, y si no, el comando se niega a escribir (es lo que usan las pruebas).
4. Si cambió un color o la geometría de las barras, actualice a mano sus espejos en la landing (punto 3 de las reglas) y las cifras que `documentos.md` cita (punto 5).
5. Ejecute `npm run test:unit`, que incluye `scripts/brand-kit.test.mjs`. Falla ante cualquier deriva: un hex distinto entre `globals.css` y `tokens.json`, un SVG que no coincide con `paths.json`, un hash que no coincide con el manifiesto, una copia desactualizada o una regeneración que produciría cambios.
6. Haga commit del kit completo, `manifest.json` incluido, y abra el PR.
