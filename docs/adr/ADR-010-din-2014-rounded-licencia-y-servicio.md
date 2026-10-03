# ADR-010 — DIN 2014 Rounded: licencia y servicio de los archivos

| Campo | Valor |
|---|---|
| Estado | Aceptada — en implementación (2026-10-02); la ejecución del diseño de servicio queda condicionada a la licencia |
| Fecha | 2026-10-02 |
| Alcance | Tipografía de la landing y de la plataforma: pila CSS, carga de Barlow, espacio de DIN 2014 Rounded (`brand/fonts/`) y, cuando exista licencia, un bucket privado compartido servido bajo `/fonts/*` por las dos distribuciones de CloudFront |

## Contexto

El manual de marca (lámina 10) define **DIN 2014 Rounded** como tipografía corporativa. ADR-001 declaró **Barlow** (SIL OFL 1.1) como sustituto porque no había licencia web y el repositorio es público.

El 2026-10-02 el owner preguntó: «La fuente de la landing y de la plataforma no es la que se recomienda en el manual… ¿podemos usar la que se recomienda?» (REQ-U04, `docs/SPEC-UNIFICACION.md` §0). Además, la plataforma cargaba Inter y JetBrains Mono desde Google Fonts: peticiones a terceros, y una tipografía que no coincide con el manual.

Hechos de licenciamiento (recogidos en `docs/SPEC-UNIFICACION.md` §6 el 2026-10-02; los precios son indicativos y deben confirmarse al comprar):

- DIN 2014 Rounded es una familia comercial de **Paratype (2021)**, con seis pesos y una versión variable.
- Existe licencia web en **Fontspring** (perpetua y autohospedable) y en **MyFonts** (familia desde USD 149; estilos sueltos desde USD 36).
- **Adobe Fonts** la ofrece solo mediante un script de Adobe: no se puede autohospedar. Descartada.
- **No existe una copia licenciada** en los equipos del owner (a 2026-10-02) ni en los repositorios.
- La landing es un repositorio público y las EULA de estas fuentes prohíben redistribuirlas (`docs/SPEC-UNIFICACION.md` §2).

## Decisión

**DEC-54.**

1. **Hoy, Barlow en los dos sitios y sin Google Fonts.** Landing: `next/font/google` en build, pesos 300/400/500/700/800 (ADR-001). Plataforma: `@fontsource/barlow`, pesos 300/400/500/700/800 y subconjunto `latin`, importado en `src/main.tsx` después de `maplibre-gl/dist/maplibre-gl.css` y antes de `index.css`; se eliminan de `index.html` los `preconnect` y la hoja de Google Fonts. Ambos sitios usan la pila `"DIN 2014 Rounded", Barlow, system-ui, sans-serif`: sin la fuente, cae en Barlow.
2. **DIN 2014 Rounded se integra cuando exista licencia web y sus archivos nunca entran a git.** Se sirven bajo `/fonts/*` desde un bucket privado compartido por las dos distribuciones, con el `@font-face` activado por configuración. Así se cumple el manual sin violar la licencia y sin abrir peticiones a terceros (CSP `font-src 'self'`).

### Diseño de servicio (listo para ejecutar con la licencia; no se despliega antes)

1. **Bucket privado de fuentes**, creado por `m3tric-staging-LandingSiteStack` con nombre generado por CloudFormation (prefijo `m3tric-staging-landingsitestack-*`) (Block Public Access, SSE-S3, OAC) con una política de bucket que autoriza por `AWS:SourceArn` a **ambas** distribuciones (identificadores en `docs/SPEC-UNIFICACION.md` §6).
2. **Comportamiento `/fonts/*`** en las dos distribuciones hacia ese bucket: en la landing, por `infra/`; en la plataforma, por `PlatformPreviewStack` y su ceremonia de despliegue.
3. Una persona con la licencia sube `DIN2014Rounded-Variable.woff2` (el archivo que espera el kit, `font.din.expectedFiles` en `brand/tokens.json`) a `s3://<bucket-de-fuentes>/din-2014-rounded/`. Si la licencia es por estilos sueltos, se sube un archivo por peso y se actualiza `expectedFiles`. El sistema usa los pesos 300, 400, 500, 700 y 800 (`font.weights`): conviene confirmar con el proveedor cuáles incluye la licencia, porque si falta alguno el navegador usa el más cercano.
4. **`@font-face "DIN 2014 Rounded"`** con `src: url(/fonts/din-2014-rounded/…)` y `font-display: swap`, **emitido solo** cuando `NEXT_PUBLIC_BRAND_FONT=din` (landing) o `VITE_BRAND_FONT=din` (plataforma). Así ningún build cita un archivo inexistente: el capturador de rollback de la plataforma exige que todo recurso citado responda 200.
5. **Prueba de humo:** `/fonts/din-2014-rounded/*.woff2` responde 200 con `font/woff2`, y la fuente computada del `h1` es «DIN 2014 Rounded».
6. Se actualiza `font.din.status` (hoy `pending-license`) en `brand/tokens.json` y se ejecuta `npm run brand:build` (`brand/fonts/README.md`).

## Alternativas consideradas

1. **Adobe Fonts.** Descartada: solo se sirve con un script de terceros, no es autohospedable y es incompatible con `font-src 'self'` y con la regla de cero peticiones a terceros.
2. **Versionar los `.woff2` en el repositorio.** Descartada: la landing es pública y las EULA prohíben redistribuir. Los archivos nunca entran a git.
3. **Seguir solo con Barlow.** Es el estado de hoy y el respaldo permanente de la pila; no cumple el manual en tipografía (ADR-001). Es la opción vigente si el owner decide no comprar la licencia.

## Consecuencias

- **No se despliega nada de DIN antes de tener la licencia.** Hoy la tipografía efectiva es Barlow en ambos sitios y ADR-001 sigue vigente en lo que declara (Barlow como sustituto; pila con «DIN 2014 Rounded» primero). ADR-010 reemplaza solo el procedimiento que ADR-001 y `docs/CONTENIDOS.md` (sección «Fuente») indican para cuando llegue la licencia —agregar los `.woff2` con `next/font/local`—, porque contradice DEC-54.
- **El kit ya reserva el espacio y rechaza archivos de fuente.** `brand/fonts/README.md` documenta el procedimiento y `font.din.status` es `pending-license` en `brand/tokens.json`. `npm run brand:build` falla ante cualquier archivo fuera del inventario del kit y `scripts/brand-kit.test.mjs` falla si aparece un archivo de fuente bajo `brand/`. La protección cubre `brand/`, no el resto del repositorio.
- **Activar DIN no es solo subir archivos.** Requiere los pasos del diseño (infraestructura en dos repositorios y la variable de configuración en cada build), además de la compra. Al activarla, `NEXT_PUBLIC_BRAND_FONT` se documenta en `.env.example` y en la tabla de variables del `README.md`.
- **Costo:** la estimación de infraestructura de `docs/SPEC-UNIFICACION.md` §6 es inferior a USD 1 al mes (no medida), más la licencia. Decisión del owner: comprarla (recomendada: Fontspring, familia o variable) o quedarse con Barlow.
- **Antes de comprar,** confirmar en la EULA elegida que cubre los dos sitios (landing y plataforma) y que permite servir los archivos desde el propio origen.
- **Permisos de despliegue:** según `infra/README.md` («Qué crea cada stack»), el rol de ejecución de CloudFormation del stack del sitio (`m3tric-staging-landing-cfn-exec`) gestiona S3 solo sobre `arn:aws:s3:::m3tric-staging-landingsitestack-*`. Por eso el bucket de fuentes lo crea ese mismo stack con nombre generado (que lleva ese prefijo): no hace falta ampliar permisos ni fijar un nombre global en un repositorio público.
- El comportamiento `/fonts/*` de la plataforma se aplica por la ceremonia de esa plataforma (plan → change set → smoke), no por GitHub Actions de la landing.
- La CSP de la landing no cambia: `font-src 'self'`, porque los archivos se sirven desde su propio origen.

## Requisitos relacionados

REQ-U04 · REQ-B03 · REQ-C09 · REQ-A11 (CSP)

## Evidencia

Pendiente — se completa con el despliegue. La ejecución del diseño de servicio depende de la licencia (dependencia del cliente n.º 7, `docs/TRACEABILITY.md` §6.5) y no forma parte de este despliegue.

- Decisión registrada en `docs/SPEC-UNIFICACION.md` §2 (DEC-54) y §6 y, para la plataforma, en `docs/platform-live-dashboard/07-decisiones-owner.md` (entrada del 2026-10-02, repositorio privado).
- Barlow vigente en la landing: `src/app/layout.tsx` y `src/app/globals.css` (`--font-sans`), ADR-001.
- Espacio reservado en el kit: `brand/fonts/README.md` y `font.din` (`status: pending-license`) en `brand/tokens.json`; pruebas «no font file anywhere under brand/» y «brand/fonts holds only its README» en `scripts/brand-kit.test.mjs`. Todavía no hay un run de CI archivado.
