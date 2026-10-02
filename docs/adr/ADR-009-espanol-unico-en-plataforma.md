# ADR-009 — Español único en la plataforma

| Campo | Valor |
|---|---|
| Estado | Aceptada — en implementación (2026-10-02); DEC-56 pendiente de confirmación del owner (aplicada por defecto) |
| Fecha | 2026-10-02 |
| Alcance | Idioma de la interfaz de la plataforma (`m3tric-platform/frontend`, repositorio privado): textos, enumeraciones visibles, fechas y números, título de pestaña y atributo `lang` |

## Contexto

El 2026-10-02 el owner indicó: «El idioma de la plataforma debería estar en español también» (REQ-U03, `docs/SPEC-UNIFICACION.md` §0).

La plataforma mezcla los dos idiomas. La exploración del 2026-10-02 (`docs/SPEC-UNIFICACION.md` §1) encontró texto en inglés en nueve archivos (entre ellos el inicio de sesión, la ruta protegida, el límite de errores y las páginas de alertas, reportes, ajustes y mapa), `lang="en"` y fechas formateadas con el idioma del navegador en tres páginas y con `es-CO` en otras tres. El título de pestaña era «M3TRIC | Geospatial Analytics Platform».

El patrón «M3TRIC | <nombre del producto>» lo fijó el owner el 2026-10-01 para que las dos pestañas compartan patrón e icono (comentario de `m3tric-platform/frontend/index.html`). La landing usa «M3TRIC | Lectura multiescala del territorio».

## Decisión

**DEC-55 — Español único, textos en el código.** La interfaz de la plataforma está solo en español (es-CO), sin librería de internacionalización:

- Los textos viven en el código, junto a cada componente.
- Las enumeraciones visibles al usuario (estado de alerta, estado de sensor, conectividad y niveles) viven en `src/lib/labels.ts`.
- Fechas y números se formatean en `src/lib/format.ts` con `es-CO` y zona `America/Bogota`.
- Una prueba guardián (`src/test/spanish-ui.test.ts`) recorre `src/**/*.tsx` (sin pruebas) y falla si el texto JSX o los atributos `placeholder`, `title`, `aria-label` o `alt` contienen palabras de interfaz en inglés de una lista cerrada, con una lista blanca de términos técnicos (GeoTIFF, MQTT, CSV, GNSS, NDVI).
- Tono: claro, directo y formal («usted»), como el manual.

**DEC-56 — Título de pestaña «M3TRIC | Plataforma» y `lang="es-CO"`.** Con la interfaz en español, el nombre en inglés era la única pieza fuera del idioma; el nuevo título conserva el patrón «M3TRIC |» que fijó el owner. **Pendiente de confirmación del owner; se aplica por defecto** y es revertible en una línea (`docs/SPEC-UNIFICACION.md` §2).

## Alternativas consideradas

1. **Diccionario `t()` con una librería de internacionalización.** Descartada: suma entre 3 y 5 KB y obligaría a tocar unos 90 archivos sin beneficio hoy, porque el producto es contractualmente en español y un segundo idioma sería hipotético.
2. **Mantener «Geospatial Analytics Platform» como título.** Descartada: es inconsistente con REQ-U03. Es la parte que espera confirmación del owner.

## Consecuencias

- No hay capa de internacionalización: agregar un segundo idioma exigiría extraer los textos de unos 90 archivos, es decir, reabrir esta decisión.
- La prueba guardián tiene **alcance acotado**: usa una lista cerrada de palabras y revisa texto JSX y cuatro atributos. No demuestra la ausencia de inglés. Los literales de cadena fuera de JSX (por ejemplo, los mensajes que arman funciones auxiliares) y los archivos `.ts` quedan fuera de lo declarado y se verifican por revisión. Los criterios en vivo (`docs/SPEC-UNIFICACION.md` §9) miden la navegación y las páginas principales.
- El glosario mínimo de `docs/SPEC-UNIFICACION.md` §5 fija la terminología; los nombres técnicos (GeoTIFF, MQTT, CSV, GNSS, NDVI) se conservan.
- Las pruebas existentes que afirman texto en inglés (≈7 archivos, sobre todo `App.test.tsx`) se actualizan al texto nuevo; las ≈32 que ya afirman español no cambian.
- Si el owner no confirma «M3TRIC | Plataforma», el título cambia en una línea y las pruebas que lo citen se actualizan.

## Requisitos relacionados

REQ-U03 · REQ-U05

## Evidencia

Pendiente — se completa con el despliegue.

- Decisión registrada en `docs/SPEC-UNIFICACION.md` §2 (DEC-55 y DEC-56) y, para la plataforma, en `docs/platform-live-dashboard/07-decisiones-owner.md` (entrada del 2026-10-02, repositorio privado).
- Estado de REQ-U03 y su brecha (confirmación de DEC-56): `docs/TRACEABILITY.md` §6.2 y §7.
