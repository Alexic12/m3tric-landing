# Tipografía: espacio reservado para DIN 2014 Rounded

Esta carpeta **no contiene archivos de fuente y no debe contenerlos nunca**. Existe para dejar escrito dónde y cómo se integra la tipografía del manual en cuanto exista la licencia. Las rutas de `scripts/`, `docs/` e `infra/` que cita este documento son del repositorio de la landing, aunque este README se copie a la plataforma.

## Estado

| Campo | Valor |
|---|---|
| Fuente del manual | DIN 2014 Rounded (manual de identidad, lámina 10) |
| Estado | Pendiente de licencia: `font.din.status` es `pending-license` en `../tokens.json` |
| Fuente en uso | Barlow (SIL Open Font License 1.1). La landing la autohospeda hoy, sin Google Fonts; la plataforma la autohospedará al adoptar el kit |
| Pila CSS | `"DIN 2014 Rounded", Barlow, system-ui, sans-serif` (`--m3-font-sans` en `../tokens.css`) |

La pila del kit ya nombra a DIN 2014 Rounded en primer lugar (la landing ya la usa; la plataforma la tomará del kit): mientras la fuente no esté disponible el navegador cae en Barlow, y cuando llegue la licencia **no hace falta cambiar código** (DEC-54).

## Licencia

Hechos tomados de `docs/SPEC-UNIFICACION.md` §6, sin verificación independiente. Verifique precios, fechas y condiciones vigentes antes de comprar.

- DIN 2014 Rounded es una familia comercial de **Paratype**: seis pesos y una versión variable (verificar).
- Licencia web autohospedable: **Fontspring** (perpetua) o **MyFonts** (familia desde USD 149; estilos sueltos desde USD 36).
- Adobe Fonts la ofrece con un embed por `<script>` o por `<link>` de CSS; ambos son alojamiento de terceros (no autohospedable), así que DEC-54 los descartó: obligarían a abrir peticiones a terceros y la CSP es `font-src 'self'`.
- Las licencias de fuentes comerciales (EULA) prohíben redistribuir los archivos. **Antes de comprar, confirme por escrito que la licencia cubre servir la fuente desde los dos sitios, la landing y la plataforma, cada uno desde su propio origen.**

## Archivos esperados

Nombres que espera el sistema (`font.din.expectedFiles` en `../tokens.json`), relativos a `/fonts/`:

- `din-2014-rounded/DIN2014Rounded-Variable.woff2` (versión variable)

Si la licencia se adquiere por estilos sueltos, se sube un archivo por peso en la misma carpeta `din-2014-rounded/` y se actualiza `expectedFiles`. El sistema usa los pesos 300, 400, 500, 700 y 800 (`font.weights`); confirme con el proveedor cuáles incluye la licencia, porque si falta alguno el navegador usa el más cercano.

## Lo que no se hace

- **No agregue archivos de fuente a este repositorio** (`.woff`, `.woff2`, `.ttf`, `.otf`, `.eot`): es público y las licencias prohíben redistribuirlos. Tres capas lo cubren, todas en el repositorio de la landing: `.gitignore` ignora esas extensiones, `npm run hygiene` falla si alguna está versionada, y bajo `brand/` tanto `npm run brand:build` como `scripts/brand-kit.test.mjs` detectan cualquier archivo ajeno al kit.
- No cargue la fuente desde servicios de terceros (Adobe Fonts, Google Fonts).

## Procedimiento cuando exista la licencia

Diseño de `docs/SPEC-UNIFICACION.md` §6 (DEC-54). **Todavía no está implementado** y no se despliega antes de tener la licencia.

1. El bucket de fuentes del stack del sitio (nombre generado por CloudFormation, prefijo `m3tric-staging-landingsitestack-*`) es privado (bloqueo de acceso público, cifrado SSE-S3, acceso solo por OAC) y lo crea el stack de la landing. Su política admite únicamente las distribuciones de CloudFront de la landing y de la plataforma.
2. Comportamiento `/fonts/*` en ambas distribuciones hacia ese bucket (landing: `infra/`; plataforma: su stack, con su ceremonia de despliegue).
3. Una persona con la licencia sube los `.woff2` a `s3://<bucket>/din-2014-rounded/`, donde `<bucket>` es el bucket del paso 1.
4. `@font-face "DIN 2014 Rounded"` con `src: url(/fonts/din-2014-rounded/…)` y `font-display: swap`, emitido **solo** cuando `NEXT_PUBLIC_BRAND_FONT=din` (landing) o `VITE_BRAND_FONT=din` (plataforma). Así ningún build cita un archivo que todavía no existe.
5. Verificación en vivo: `/fonts/din-2014-rounded/*.woff2` responde 200 con `content-type: font/woff2`, y la fuente computada del `h1` es «DIN 2014 Rounded».
6. Actualice `font.din.status` en `../tokens.json` y ejecute `npm run brand:build`.
