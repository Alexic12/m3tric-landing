# ADR-008 — Kit de marca compartido entre la landing y la plataforma

| Campo | Valor |
|---|---|
| Estado | Aceptada — implementada y verificada (2026-10-02); aceptación del owner de la apariencia de la plataforma pendiente (REQ-U01) |
| Fecha | 2026-10-02 |
| Alcance | `brand/`, `scripts/brand-build.mjs`, `scripts/brand-kit.test.mjs` y `.gitattributes` (esta landing); `scripts/brand-sync.mjs` y `src/brand/` en la plataforma (`m3tric-platform/frontend`, repositorio privado) |

## Contexto

El 2026-10-02 el owner pidió que la plataforma comparta el estilo de la landing y muestre el logo en lugar del texto «M3TRIC» (REQ-U01 y REQ-U02, `docs/SPEC-UNIFICACION.md` §0).

Los dos sitios tienen pilas distintas (landing: Next 16, React 19, Tailwind 4; plataforma: Vite 6, React 18, Tailwind 3.4), así que no pueden compartir componentes. Sí pueden compartir tokens, vectores e imágenes.

Hoy la plataforma define su propia paleta (`tailwind.config.js` y las variables `--app-*` de `src/index.css`), que no coincide con la del manual de marca (`docs/SPEC.md` §3.2), y no existe un lugar único del que ambos repositorios tomen los valores. Sin una fuente única, la deriva visual es silenciosa.

Restricciones: el repositorio de la landing es público (`docs/SPEC.md` §12) y el de la plataforma es privado; publicar un paquete npm exigiría un registro privado.

## Decisión

**DEC-53.** El **kit de marca vive en la landing** (`brand/`) y es la fuente de verdad. La plataforma lo **copia por commit con sha256**; cada versión de la plataforma declara qué commit del kit usa.

El kit tiene **dos fuentes editables** y todo lo demás se genera o se copia (`brand/README.md`, `docs/SPEC-UNIFICACION.md` §3):

| Archivo | Qué es | Origen |
|---|---|---|
| `tokens.json` | Paleta exacta del manual, niveles de alerta (con su nombre en español), tipografía (Nunito: pila, nombre, licencia y pesos; ADR-012), radios, foco, sombra, geometría de las tres barras y serie de colores para gráficos. Es la única lista de hex | Fuente |
| `logo/paths.json` | Vectores oficiales del wordmark (lámina 8): `viewBox`, `body` y `bars`. Es la única fuente del logo; no se redibuja | Fuente |
| `tokens.css` | Las mismas variables como `:root` (`--m3-*`) | Generado |
| `logo/m3tric-logo-{color,reverse,mono-dark,mono-light}.svg` | Variantes del wordmark | Generado desde `paths.json` |
| `motifs/triple-bar.svg` | Las tres barras del «3» (`currentColor`) | Generado |
| `logo/m3tric-mark.svg` | Tres barras sobre cuadrado `#004124` (favicon; pendiente de validación de marca) | Copia byte a byte de `src/app/icon.svg` |
| `images/aerial-wide-1280.webp`, `aerial-tall-747.webp`, `globe-1000.webp` | Fotografía del manual sin texto incrustado | Copia byte a byte de `public/images/` |
| `manifest.json` | `version`, `generatedAt` (solo fecha) y `files`: el sha256 de cada archivo del kit salvo él mismo. No lleva commit de origen | Generado |
| `README.md` | Contenido, uso, sincronización y actualización del kit | Escrito a mano |

`npm run brand:build` (`scripts/brand-build.mjs`) genera lo derivado y las copias a partir de las dos fuentes. Es determinista e idempotente: sin cambios no escribe nada y `generatedAt` solo se mueve cuando cambia el contenido. El kit es un **inventario explícito**: un archivo bajo `brand/` que no esté en el inventario del generador hace fallar el build y las pruebas, lo que mantiene los archivos de fuente fuera de un repositorio público (ADR-012). `.gitattributes` fija `brand/** text eol=lf`: el kit se guarda con fin de línea LF, que es lo que comprueban las pruebas y de lo que dependen los sha256.

El logo tiene una sola fuente: `src/components/brand/Logo.tsx` importa `brand/logo/paths.json` y ya no contiene trazados, y los cuatro SVG se generan del mismo archivo.

**Sincronización.** `scripts/brand-sync.mjs` (en la plataforma) copia `brand/**` desde un commit fijado de la landing y verifica el sha256 de cada archivo contra `brand/manifest.json`. El commit de origen (`sourceCommit`) lo registra la plataforma en su propio `src/brand/manifest.json` al sincronizar. Copiar es una acción deliberada y queda en un commit.

**Pruebas de deriva en ambos repositorios.**

- **Landing:** `scripts/brand-kit.test.mjs` (`node --test`, 60 pruebas; `test:unit` la incluye y por tanto `npm run release` la ejecuta). Fallan si:
  - la paleta de `src/app/globals.css` (`@theme`), la pila tipográfica o las constantes de `src/config/brand.ts` difieren de `tokens.json`;
  - un SVG del logo difiere de `paths.json` (trazados, colores u opacidad), `Logo.tsx` deja de importar `paths.json` o lleva trazados propios, sus colores no son los de las variantes o la geometría de `TripleBar.tsx` difiere de `tokens.json`;
  - `tokens.css` no es exactamente lo que genera el builder, o `manifest.json` no lista los archivos del kit o el sha256 de alguno no coincide;
  - el kit no contiene exactamente los archivos previstos, una copia difiere byte a byte de su origen, un archivo no termina en LF o aparece un archivo de fuente bajo `brand/`;
  - reconstruir el kit en otra carpeta no reproduce `brand/` exactamente. El builder, además, falla cerrado ante tokens, trazados o archivos inválidos.
- **Plataforma:** `src/brand/brand.test.ts`: los hashes de lo copiado coinciden con su manifiesto y los colores de `tailwind.config.js` coinciden con `tokens.json`.

DEC-57 (shell de la plataforma) y DEC-58 (niveles de alerta) aplican el kit en la plataforma; se registran en `docs/SPEC-UNIFICACION.md` §2 y en el registro de decisiones de la plataforma.

## Alternativas consideradas

1. **Paquete npm.** Descartada: exigiría un registro privado.
2. **Submódulo de git.** Descartada: fricción en el flujo diario, y el repositorio de la plataforma excluye rutas anidadas sensibles (`docs/SPEC-UNIFICACION.md` §2).
3. **Cada repositorio con su propia paleta y su propio logo (estado previo).** Descartada: es la situación que el owner señaló y no tiene un mecanismo que detecte la deriva.

## Consecuencias

- Hay dos archivos editables (`tokens.json` y `logo/paths.json`); lo demás se genera o se copia, y una deriva en cualquiera de los dos repositorios hace fallar una prueba.
- La landing no importa los tokens: repite sus valores en `src/app/globals.css` (`@theme`), `src/config/brand.ts`, los colores de `Logo.tsx` y la geometría de `TripleBar.tsx`. Cambiar un color o la geometría exige editar esos espejos a mano; las pruebas fallan si dejan de coincidir con el kit. Los trazados del logo sí vienen del kit.
- `brand/` no se publica en el sitio: vive en la raíz del repositorio y no pasa por `public/` ni por `out/`.
- Sincronizar es manual: la plataforma no recibe cambios del kit hasta que alguien ejecuta `brand-sync` y los commitea. El diseño (`docs/SPEC-UNIFICACION.md` §8) compara los archivos copiados con su propio manifiesto y los colores con `tokens.json`; no incluye una comprobación contra la versión más reciente del kit en la landing. `sourceCommit` es el registro de qué versión usa la plataforma.
- El kit se publica en un repositorio público: contiene activos de marca que el sitio ya sirve (la marca y las tres fotografías son copias byte a byte de `src/app/icon.svg` y `public/images/`, y una prueba falla si difieren) y **ningún archivo de fuente**: `.gitignore` y `scripts/hygiene.sh` los rechazan en todo el repositorio, y `npm run brand:build` y `scripts/brand-kit.test.mjs` los rechazan bajo `brand/`.
- `tokens.json` transcribe la paleta del manual y las pruebas comprueban que el código coincide con esa transcripción, no con el manual. No sustituyen la validación de marca de REQ-B02 ni de REQ-B01.
- El favicon derivado (`m3tric-mark.svg`) sigue pendiente de validación de marca (dependencia del cliente n.º 5, `docs/TRACEABILITY.md` §6.5).

## Requisitos relacionados

REQ-U01 · REQ-U02 · REQ-U05 · REQ-B01 · REQ-B02

## Evidencia

Implementada, desplegada y verificada (2026-10-02).

- **Landing:** `brand/`, `scripts/brand-build.mjs`, `scripts/brand-kit.test.mjs` (60 pruebas dentro de la suite unitaria, 208/208), `.gitattributes` y `src/components/brand/Logo.tsx` (importa `brand/logo/paths.json`). El kit se incorporó en `deploy-8-605dacb` y su serie de colores de gráficos se reordenó en `deploy-9-79d4f45` (CHANGELOG 3.2.1); smoke 10/10 en ambos. El sitio no cambia: `brand/` no se publica.
- **Plataforma:** la copia del kit con sha256 (`src/brand/manifest.json`, `scripts/brand-sync.mjs`) y `src/brand/brand.test.ts` se desplegaron con el PR #190 (`1c8e17d`; vitest 1180/1180 en 72 archivos), verificado por el Tech Lead el 2026-10-02.
- **En vivo:** los valores del kit se midieron en la plataforma desplegada: anillos de foco `#004124` y `#74C69D` y niveles de alerta `#FFD166`, `#F77F00` y `#D62828` sobre la hoja de estilos real (`docs/evidence/platform-brand/QA-REPORT.md` §4.3 y §4.7).
- Decisión registrada en `docs/SPEC-UNIFICACION.md` §2 (DEC-53) y, para la plataforma, en `docs/platform-live-dashboard/07-decisiones-owner.md` (entrada del 2026-10-02, repositorio privado).
- Estado de REQ-U01 y REQ-U02: `docs/TRACEABILITY.md` §6.2 y §7 (ambos Parcial). El kit y su despliegue están verificados; faltan la aceptación explícita del owner de la apariencia de la plataforma desplegada (REQ-U01) y la validación de marca del favicon derivado `m3tric-mark.svg` (REQ-U02, cliente n.º 5).
- **Actualización del 2026-10-05:** el bloque `font` del kit nombra Nunito y se eliminó `brand/fonts/` (ADR-012, que sustituye a ADR-010). El resto de este ADR no cambia.
