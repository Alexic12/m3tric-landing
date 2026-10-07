# Marca en documentos M3TRIC

Reglas que debe cumplir un documento de marca de M3TRIC: reporte PDF, archivo XLSX o CSV e impreso. Forma parte del kit de marca (`brand/README.md`) y la plataforma lo sincroniza junto con el resto de `brand/`.

| Campo | Valor |
|---|---|
| Versión de este documento | 1.0 · 2026-10-07 |
| Kit | 1.2.0, el primero que lo incluye |
| Autoría | **Escrito para el kit, no transcrito del manual.** Autorizado por el owner el 2026-10-07 |
| Insumos | `tokens.json` (valores), `logo/*.svg`, `docs/SPEC.md` §3 (identidad), `docs/SPEC-UNIFICACION.md` §4.2 (escala, ejes y gráficas), `docs/adr/ADR-012-nunito-tipografia-unica.md` (Nunito) y la maqueta aprobada de reportes (pestañas «PDF» y «Marca en documentos») |

**Cómo leerlo.** «Debe» es obligatorio y se comprueba con la lista de la sección 12; «conviene» es una recomendación. Los colores, la tipografía y el logo vienen del kit y no se redefinen aquí. Las medidas en milímetros y puntos y los tamaños mínimos sí son decisiones de este documento.

## 0. Alcance y autoridad

**Qué gobierna**

- Reportes PDF, con portada o sin ella.
- Archivos XLSX.
- Archivos CSV: su nombre y su contenido.
- Documentos impresos de M3TRIC y su versión en PDF.

**Qué no gobierna.** La interfaz web (plataforma y landing) sigue `docs/SPEC-UNIFICACION.md` §4 y `docs/SPEC.md` §3. Presentaciones, correos y redes sociales quedan fuera (sección 13).

**Precedencia.** Ante un conflicto en un documento, manda en este orden: 1) las instrucciones del owner, 2) este archivo, 3) el Manual de identidad (abril 2026). Lo que este archivo no diga lo dice el manual y, en su silencio, `docs/SPEC.md` §3. Fuera de los documentos, el orden de precedencia de `docs/SPEC.md` no cambia.

**Valores.** Los hex, la serie de gráficas y los pesos viven en `tokens.json`. Este archivo los cita y no los redefine; si difieren, gana `tokens.json`. La desviación del manual en la tipografía (Nunito en lugar de DIN 2014 Rounded, ADR-012) rige también aquí.

**Por qué se escribió.** El manual no trae reglas para documentos. Solo menciona la legibilidad de los «informes técnicos impresos» en su página de tipografía (lámina 10, «Color y tipografía»). Estas reglas se redactaron a partir de la identidad ya definida y del aspecto aprobado en la maqueta de reportes.

**Historial.** 1.0 (2026-10-07): primera edición, publicada con el kit 1.2.0. Quien edite este archivo sube la versión del documento y anota el cambio aquí.

## 1. Página

**Formato.** Carta y A4. Un documento usa un solo formato de principio a fin. Carta es el valor por defecto (es la primera opción del selector «Tamaño» de la maqueta); A4 se ofrece a quien lo pida. Las reglas están en milímetros, así que valen para ambos.

| Formato | Página | Área de contenido (márgenes de 20 mm) | Columna (12, medianil de 6 mm) |
|---|---|---|---|
| Carta | 215,9 × 279,4 mm | 175,9 × 239,4 mm | 9,16 mm |
| A4 | 210 × 297 mm | 170 × 257 mm | 8,67 mm |

- **Márgenes:** 20 mm por los cuatro lados. Solo la portada puede llevar color hasta el borde.
- **Orientación:** vertical por defecto. Una sección con una tabla ancha puede ir en horizontal; no mezcle orientaciones dentro de una sección y la portada siempre es vertical.
- **Retícula:** 12 columnas con medianil de 6 mm. Reparto habitual: tres cifras destacadas de 4 columnas cada una; gráficas, tablas y mapas de 12; texto de lectura de 8 a 9 columnas (el límite real es de 70 caracteres por línea).
- **Cabecera y pie fijos.** Se dibujan dentro de los márgenes: ocupan una banda de 8 mm (de 10 a 18 mm desde el borde), con una regla fina en su lado interior; el contenido empieza a 20 mm. Aparecen en todas las páginas interiores y no en la portada. Su contenido está en la sección 8.
- **Numeración «Página n de N».** La portada cuenta como página 1 y no muestra número: la primera página interior dice «Página 2 de N». Sin portada, la numeración empieza en 1 en la primera página interior, que lleva la ficha (periodo, estaciones, generado, cuenta) bajo el título.
- **Zona de aviso.** Franja de 14 mm de alto al final del área de contenido de la última página, reservada al aviso informativo y a las notas de método (7,5 pt, `muted`, hasta tres líneas). El contenido no la invade: si no cabe, las notas y el aviso van solos en una página nueva. Sin portada, el aviso también va en la zona de aviso de la primera página. Las advertencias que afectan a una sola sección, como «Datos parciales», no van aquí sino en una caja al inicio de esa sección (sección 11).

## 2. Logo en documentos

El logo se inserta desde `logo/*.svg` o desde `logo/paths.json`, siempre como vector. No se redibuja ni se rasteriza.

| Fondo | Variante | Archivo del kit |
|---|---|---|
| Blanco o beige (páginas interiores) | `color` | `logo/m3tric-logo-color.svg` |
| Verde oscuro `#004124` (portada) | `reverse` | `logo/m3tric-logo-reverse.svg` |
| Negro, o fotografía con velo | `mono-light` | `logo/m3tric-logo-mono-light.svg` |
| Impresión en blanco y negro o a una tinta | `mono-dark` | `logo/m3tric-logo-mono-dark.svg` |

- **Tamaño mínimo:** 24 mm de ancho en papel y 96 px en pantalla. Tamaños de referencia: 30 mm en la cabecera y 60 mm en la portada.
- **Espacio libre:** como mínimo, la altura de una barra del «3». Equivale al 23,7 % del alto del logo (23,52 de 99,09 unidades del dibujo): 1,4 mm con el logo de 30 mm y 1,1 mm con el de 24 mm.
- **Fotografía:** nunca sin el velo `#004124` de al menos 70 % entre la imagen y el logo. Con el velo, use `mono-light`.
- **Nunca:** deformar (la proporción es 503,1 : 99,09 y está bloqueada), girar, recolorear fuera de las cuatro variantes, agregar sombra o contorno, separar las barras del cuerpo, recortar o poner sobre un fondo con textura.
- **La marca sola** (`logo/m3tric-mark.svg`, tres barras sobre un cuadrado) es solo para favicon y avatar. No va en una portada, una cabecera ni como marca de agua.
- En el PDF etiquetado el logo lleva el texto alternativo «M3TRIC».

## 3. Motivo de tres barras

Las tres barras del «3» con la geometría de `tokens.tripleBar`: anchos 64,49 · 64,49 · 91,7, alto 23,52 y separación 14,26, con extremos redondeados (radio igual a la mitad del alto). En documentos se usan **en fila**, de izquierda a derecha (249,2 × 23,52 unidades), que es la composición aprobada de la portada. La versión apilada del kit (`motifs/triple-bar.svg`) es la de pantalla y no se usa en documentos, para no confundirla con el «3» del logo.

- **Color:** `green-400` (`#74C69D`), siempre. Es decorativo: en el PDF etiquetado se marca como artefacto y no lleva texto alternativo.
- **Dónde:** en la portada y sobre el título de cada parte mayor del documento (separadores de sección).
- **Nunca:** en cada página, en la cabecera o el pie, como viñeta, como línea entre párrafos, ni más de una vez por página.
- **Espacio libre:** una altura de barra alrededor.

| Uso | Alto de barra | Anchos de las barras | Separación | Ancho total |
|---|---|---|---|---|
| Portada | 5 mm | 13,7 · 13,7 · 19,5 mm | 3,0 mm | 53,0 mm |
| Separador de sección | 2,5 mm | 6,9 · 6,9 · 9,7 mm | 1,5 mm | 26,5 mm |

## 4. Paleta en papel

El PDF se genera en RGB, con el perfil sRGB incrustado. El kit entrega los colores en hex y no trae equivalentes CMYK ni Pantone: una impresión de imprenta necesita que la oficina de marca los publique (sección 13). Las impresoras de oficina se rigen por su propia gestión de color.

| Token | Hex | Rol en documentos |
|---|---|---|
| `green-950` | `#002A17` | Sin rol en documentos: es un derivado de la landing (pie y franja técnica). No sustituye a `green-900`. |
| `green-900` | `#004124` | Fondo de la portada, títulos, encabezados de tabla, texto de marca y velo sobre fotografía. |
| `green-700` | `#2C694F` | Texto secundario sobre claro, ejes y leyenda de gráficas, contorno de áreas pálidas y borde de la caja «Datos parciales». |
| `green-400` | `#74C69D` | Barras del logo, motivo de tres barras, rótulo de tipo en la portada y series secundarias. Nunca texto sobre blanco o beige. |
| `green-200` | `#B7E3C7` | Cuerpo del logo `reverse`, texto secundario sobre la portada, chip «Normal», rellenos suaves y serie pálida. |
| `beige` | `#F6F2EA` | Filas alternas de las tablas y fondo de cajas de aviso. |
| `yellow` | `#FFD166` | **Solo** el nivel Atención. |
| `orange` | `#F77F00` | **Solo** el nivel Alerta. |
| `red` | `#D62828` | **Solo** el nivel Crítico. |
| `ink` | `#0B0F0D` | Texto de cuerpo y de tablas, y texto sobre amarillo y naranja. |
| `muted` | `#4B5563` | Texto secundario, cabecera, pie, notas y guías de gráficas. |
| `white` | `#FFFFFF` | Fondo de la página (papel), texto sobre `green-900` y texto sobre rojo. |

**Colores cálidos.** Amarillo, naranja y rojo existen solo para los niveles: chip de nivel, borde izquierdo de la caja de estado (1,5 mm) y marcador de nivel en una gráfica. Nunca son texto, título, fondo, serie de gráfica, enlace ni adorno. No hay degradados ni sombras.

**Pares de texto** (contraste calculado, WCAG 2.x; mínimo exigido 4,5:1)

| Texto sobre fondo | Contraste |
|---|---|
| `ink` sobre blanco / beige | 19,29 / 17,28 |
| `green-900` sobre blanco / beige | 11,79 / 10,56 |
| `muted` sobre blanco / beige | 7,56 / 6,77 |
| `green-700` sobre blanco / beige | 6,48 / 5,80 |
| blanco sobre `green-900` | 11,79 |
| `green-200` sobre `green-900` | 8,32 |
| `green-400` sobre `green-900` | 5,79 |
| `green-900` sobre `green-200` | 8,32 |
| `ink` sobre `yellow` / `orange` | 13,38 / 7,34 |
| blanco sobre `red` | 5,01 |

**Prohibidos como texto:** `green-400` sobre blanco (2,04) o beige (1,82), `green-200` sobre blanco (1,42), blanco sobre amarillo (1,44) o naranja (2,63), y `ink` sobre rojo (3,85).

**Niveles.** Cada nivel es un chip con la **palabra** y una **forma**, nunca solo color. Los nombres son los de `tokens.levelLabel`.

| Nivel | Color | Texto | Forma | Una tinta (blanco y negro) |
|---|---|---|---|---|
| Atención | `yellow` | `ink` | círculo | contorno fino, trama punteada en la forma |
| Alerta | `orange` | `ink` | cuadrado | contorno grueso (1,5 pt), trama de rayas diagonales en la forma |
| Crítico | `red` | blanco | rombo | relleno negro, texto blanco |

- Las formas son las de la landing (`src/components/sections/ProductMock.tsx`). El estado «Normal» no es un nivel: va en un chip `green-200` con texto `green-900` y la palabra.
- **Respaldo en blanco y negro.** El nivel conserva la palabra, la forma y la trama (punteado, rayas, sólido). La palabra va siempre sobre un fondo liso, nunca sobre la trama. La portada se imprime sin relleno verde: fondo blanco, logo `mono-dark` y título negro. Si la portada se genera a color para pantalla, esta versión se ofrece para imprimir.

## 5. Tipografía

**Fuente.** Nunito (SIL Open Font License 1.1), incrustada en el PDF; la licencia permite incrustarla y subconjuntarla. Pesos: 300, 400, 500, 700 y 800 (`tokens.font.weights`). El kit no lleva archivos de fuente (`brand/README.md`, regla 2): quien genera el documento obtiene Nunito de su propia dependencia. Si el generador no puede incrustarla, **debe fallar con un error claro** y no sustituirla en silencio por otra fuente. Si no admite fuentes variables, use instancias estáticas de esos pesos.

**Escala** (puntos; el interlineado es un múltiplo del cuerpo)

| Elemento | Cuerpo | Peso | Interlineado | Nota |
|---|---|---|---|---|
| Título de portada | 28–32 pt | 800 | 1,1 | Blanco sobre `green-900`; máximo tres líneas |
| Título de página | 16 pt | 700 | 1,2 | `green-900` |
| Sección | 12 pt | 700 | 1,25 | `green-900` |
| Cuerpo | 10 pt | 400 | 1,45 | `ink`; máximo 70 caracteres por línea |
| Dato / tabla | 9 pt | 400 (encabezados 700) | 1,3 | Cifras tabulares |
| Cifra destacada | 15 pt | 800 | 1,1 | Cifras tabulares; su etiqueta es un eyebrow |
| Nota, cabecera y pie | 7,5 pt | 400 | 1,35 | `muted` |
| Eyebrow | 7,5 pt | 700 | 1,2 | Mayúsculas, espaciado +0,08 em, `green-900` |

- El peso 500 es para los valores de la ficha de la portada. El 300 solo se usa desde 12 pt (la parte ligera del lema, «para anticipar el riesgo»); en cuerpos menores es demasiado fino al imprimir.
- Texto alineado a la izquierda, sin justificar. El énfasis va en 700. No se subraya, salvo los enlaces.
- Los números en tablas y cifras destacadas usan cifras tabulares y alineadas (`tnum`, `lnum`).
- El idioma del documento es `es-CO`.

**Números y fechas (es-CO) en los documentos**

| Qué | Regla | Ejemplo |
|---|---|---|
| Decimales | Coma | `31,2` |
| Miles | Espacio fino sin salto (U+202F) desde cuatro cifras | `9 860` · `1 048 576` |
| Años, códigos e identificadores | Sin separador de miles | `2026` |
| Unidades | Espacio sin salto (U+00A0) entre número y unidad | `28 kPa` · `31,2 %` |
| Ángulos | Grado pegado; la temperatura lleva espacio | `1,4°` · `25 °C` |
| Signo menos | El signo matemático (U+2212), no el guion | `−62 dBm` |
| Fecha y hora | Día sin cero inicial, mes abreviado en minúscula y sin punto, año, coma y hora de 24 h | `6 oct 2026, 10:30` |
| Meses | ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic | |
| Rangos | Raya corta con espacios | `29 sep – 6 oct 2026` |
| Zona horaria | Siempre visible: en la portada, en las notas y en el encabezado de cada columna de hora | `America/Bogota (UTC−05)` · `Hora (UTC−05)` |

- Muchas bibliotecas formatean `es-CO` con punto de miles. Configure el separador de forma explícita; si el generador no admite U+202F, use U+00A0 y nunca un espacio normal ni el punto.
- En una tabla cuyo periodo ya consta en la portada puede omitirse el año: `2 oct, 06:00`.
- **Archivos de datos:** ISO-8601, punto decimal, sin separador de miles (secciones 9 y 10).

## 6. Tablas

- **Encabezado:** fondo `green-900`, texto blanco en 700, 9 pt. Cada encabezado se alinea como su columna.
- **Filas alternas:** las filas pares del cuerpo (la segunda, la cuarta…) en `beige`; las impares, en blanco.
- **Reglas:** líneas finas de 0,5 pt entre filas, `green-900` al 18 % de opacidad. Sin bordes verticales ni sombras.
- **Relleno de celda:** 1,5 mm arriba y abajo, 2 mm a los lados.
- **Números:** a la derecha, con cifras tabulares y el mismo número de decimales en toda la columna.
- **Unidades:** en el encabezado, `Tensión (kPa)`, no en cada celda. Si una columna mezcla unidades, agregue una columna «Unidad».
- **Niveles:** chip con palabra y forma (sección 4).
- **Vacío:** «Sin datos» en `muted`. No use `0`, `-`, `NaN`, `null` ni una celda en blanco: un cero es una lectura y la ausencia no lo es. Las lecturas inválidas se excluyen de los promedios y se muestran como «Sin datos».
- **Texto largo:** se ajusta en la celda hasta tres líneas; nunca se corta en silencio.
- **Filas por página:** máximo 40 en tablas de datos (a 9 pt ocupan unos 6 mm cada una). Una fila nunca se parte entre dos páginas y no se deja un encabezado solo al pie: junto a él deben caber al menos dos filas.
- **Continuación:** el encabezado se repite en cada página y el título lleva «(continuación)».
- **Tablas largas:** conviene que una tabla no pase de 120 filas en el PDF. Si hay más, el PDF muestra el resumen, una nota «Serie completa en el archivo de datos» y el detalle va en XLSX o CSV.
- **Título y notas:** el título es una sección (12 pt, 700) sobre la tabla; la leyenda y las notas van debajo, en 7,5 pt.

## 7. Gráficas

- **Colores de las series**, en este orden y sin saltarse ninguno (`tokens.chartSeries`): `#004124, #2C694F, #4B5563, #74C69D, #0B0F0D, #B7E3C7`. Una gráfica de dos series usa la primera y la segunda. La misma variable conserva su color en todas las gráficas del documento.
- **Tonos oscuros primero.** `#74C69D` (2,04:1 sobre blanco) y `#B7E3C7` (1,42:1) solo sirven como series secundarias, con trazo grueso. Un área pálida lleva siempre un contorno `green-700`. Los colores cálidos no son series.
- **Trazos:** serie oscura 1,5 pt; serie pálida 2,5 pt; ejes y retícula 0,5 pt; guías 0,75 pt.
- **Máximo de series:** seis. Desde la quinta, cada serie lleva además un marcador propio (triángulo, cruz o estrella), porque la primera (`#004124`) y la quinta (`#0B0F0D`) casi no se distinguen (1,64:1). Los círculos, cuadrados y rombos son de los niveles.
- **Ejes y leyenda.** Marcas y valores de los ejes en `muted`; títulos de ejes y texto de la leyenda en `green-700`; líneas de eje y retícula en el trazo fino de las tablas (`green-900` al 18 %).
- **Guías.** Las guías de rangos de referencia van discontinuas (3 pt de raya, 2 pt de espacio) en `muted` y con el rótulo en `green-700`. Son referencias, no alertas: nunca llevan color cálido.
- **Niveles.** Un evento de nivel se marca en la gráfica con su forma (círculo, cuadrado o rombo) en el color del nivel, de al menos 2,5 mm. La leyenda lista forma y palabra.
- **Tipografía.** Nunito en todos los textos de la gráfica, de 7 pt como mínimo en el tamaño final. En un lienzo (canvas) la fuente no se hereda de la página: declárela y espere a que cargue antes de exportar (ADR-012, NU-02).
- **Vectorial siempre que se pueda** (por ejemplo, el renderizador SVG de ECharts). Los textos siguen siendo texto seleccionable. Si hay que rasterizar, use PNG de al menos 300 ppp en el tamaño final; no use JPEG para líneas.
- **Tamaño:** mínimo de 6 columnas de ancho (82 mm en A4, 85 mm en Carta) y 45 mm de alto. Ancho habitual: 12 columnas.
- **Mapas.** Zona rellena en `green-200` al 55 % con contorno `green-700`; estaciones en `green-900` con su nombre en `ink`; niveles con forma.
- **Lectura en lenguaje llano.** En los documentos de lente ejecutiva, cada gráfica lleva debajo una lectura de una a tres frases de máximo 20 palabras: qué pasó, cuándo y si salió del rango normal. No atribuye causas que el dato no demuestra. En la lente técnica es opcional.
- **Texto alternativo.** Cada gráfica y mapa lleva el suyo en el PDF etiquetado. Si usa datos de demostración, lo dice: «datos de ejemplo».

## 8. Portada, cabecera y pie

**Portada** (opcional; fondo `green-900` hasta el borde, contenido dentro de los márgenes)

1. **Fila superior:** logo `reverse` de 60 mm a la izquierda y el motivo de tres barras de 53 mm a la derecha.
2. **Tipo:** eyebrow `Reporte · <nombre del reporte>` en mayúsculas, 9 pt, 700, +0,08 em, `green-400`.
3. **Título:** el sujeto del reporte (lote, zona o cuenta), 28–32 pt, 800, blanco.
4. **Ficha** (rótulos en `green-200`, 9 pt; valores en blanco, 10 pt, peso 500):
   - Periodo: `29 sep – 6 oct 2026 (7 días)`
   - Estaciones: hasta tres nombres; con más, la cantidad y la lista en «Metodología y notas»
   - Generado: `7 oct 2026, 10:30 · America/Bogota`
   - Cuenta: `finca-norte`
5. **Pie de la portada:** regla fina de `beige` al 30 %; a la izquierda el lema «Entender el territorio» en 700 y «para anticipar el riesgo» en 300; a la derecha el aviso informativo. Texto de 7,5 pt en `green-200`.

**Cabecera** (páginas interiores): logo `color` de 30 mm a la izquierda; el nombre del documento a continuación (`Resumen del campo · Lote Medellín · 7 días`, 7,5 pt, `muted`); a la derecha, solo el número de página.

**Pie** (páginas interiores): a la izquierda `Generado el 7 oct 2026 · finca-norte · catálogo de alertas v2` (fecha de generación, cuenta y versión del catálogo de alertas); a la derecha `Página 2 de 3`. 7,5 pt, `muted`, con una regla fina encima.

**Aviso informativo.** Va literal, en la portada y en la última página (sin portada: en la primera y en la última). En la última página va en la zona de aviso, sobre el pie, que no cambia.

> Vista informativa. No diagnostica estabilidad del terreno ni sustituye análisis geotécnico.

## 9. XLSX

- **Hojas.** Una por sección del reporte, en su orden, y «Metadatos» al final. Nombres en español, con la primera letra en mayúscula (`Resumen`, `Tendencias`, `Alertas`, `Salud`, `Series`, `Metadatos`), de hasta 31 caracteres, sin `[ ] : * ? / \` y sin repetirse (Excel no distingue mayúsculas).
- **Encabezado.** Fila 1 con fondo `green-900`, texto blanco en negrita, ajuste de texto y alineación como la columna.
- **Filas alternas.** `beige` en las filas pares, por formato condicional (`=MOD(ROW(),2)=0`) para que sobreviva al ordenar y filtrar; sin bordes. Si la biblioteca no admite formato condicional, use relleno fijo.
- **Fuente.** Nunito de 10 pt. Excel no incrusta fuentes: si el equipo no la tiene, la sustituye, y el contenido no cambia.
- **Números.** Son números, nunca texto, con código de formato: `0`, `0.0`, `#,##0`, `#,##0.0`. La coma decimal y el separador de miles los pone la configuración regional (es-CO) del equipo que abre el archivo. La unidad va en el encabezado y no se usa el formato `%` de Excel (multiplica por 100). Los decimales son los de la variable; no muestre más de los que mide el sensor.
- **Fechas.** Son fechas, no texto. Hora local con formato `yyyy-mm-dd hh:mm` bajo el encabezado «Hora local (UTC−05)» y hora UTC con formato `yyyy-mm-dd"T"hh:mm:ss"Z"` bajo «Hora UTC».
- **Primera fila congelada y filtros activados** sobre el encabezado de cada hoja de datos. Ancho de columna ajustado al contenido, con un máximo de 40 caracteres.
- **Impresión.** Horizontal, ajustada a una página de ancho y con la fila 1 repetida.
- **Sin fórmulas, macros, vínculos externos ni conexiones de datos.** El archivo lleva valores ya calculados, iguales a los del PDF.
- **Neutralización contra inyección de fórmulas.** Todo texto que venga de personas o de dispositivos (nombres de lote y de estación, mensajes) se escribe como celda de texto y, si empieza por `=`, `+`, `-`, `@`, tabulación o retorno de carro, se le antepone una comilla simple (`'`). La comilla queda visible, a propósito. Los números negativos son números y no se tocan.
- **Hoja «Metadatos».** Dos columnas, «Campo» y «Valor», con el encabezado de las demás hojas:

  | Campo | Contenido |
  |---|---|
  | Cuenta | El mismo texto de la portada |
  | Reporte | Tipo y nombre, y la lente (Ejecutivo o Técnico) |
  | Periodo | Desde y hasta, en hora local |
  | Zona horaria | `America/Bogota (UTC−05)` |
  | Resolución | Puntos, horaria o diaria |
  | Estaciones incluidas | Todas, una por línea |
  | Variables incluidas | Todas, una por línea |
  | Versión de fórmula | Por ejemplo `teros-mvp-v1` |
  | Catálogo de alertas | Su versión |
  | Generado | Hora local y hora UTC |
  | Versión del kit de marca | La del kit con que se generó |
  | Aviso | El aviso informativo (sección 8), literal |

- **Límite de filas.** Una hoja admite 1 048 576 filas, el encabezado incluido, es decir 1 048 575 de datos. El generador cuenta las filas antes de escribir; si no caben, **rechaza la solicitud** con un mensaje que propone la resolución horaria o el CSV, y nunca trunca en silencio. «Metadatos» declara la resolución usada.

## 10. CSV y nombres de archivo

**Nombre.** `m3tric-<cuenta>-<desde>-<hasta>.<ext>`, con `<ext>` igual a `pdf`, `xlsx` o `csv`.

- `<cuenta>`: el nombre de la cuenta en minúsculas, sin tildes ni ñ, con espacios y signos convertidos en un guion, sin guiones repetidos ni en los extremos, de hasta 40 caracteres.
- `<desde>` y `<hasta>`: fechas locales `AAAA-MM-DD` del periodo, ambas incluidas. Un solo día repite la fecha.
- Ejemplo: `m3tric-finca-norte-2026-09-29-2026-10-06.csv`.
- Nunca incluye identificadores internos, correos ni credenciales.

**Contenido del CSV**

- UTF-8 **sin** marca de orden de bytes (BOM): el CSV es para herramientas de análisis y la BOM rompe lectores estrictos; quien necesite Excel usa el XLSX. Separador coma, fin de línea LF y comillas dobles según RFC 4180 (DEC-65, C-7).
- Una fila por lectura (o por hora, según la resolución), ordenada por `timestamp_utc`, `station` y `variable`. Con resolución horaria, las columnas de mínimo, promedio, máximo y cantidad reemplazan a `value` y siguen la misma convención de nombres (por ejemplo `value_min`, `value_avg`, `value_max`, `samples`).
- Punto decimal y sin separador de miles: es un archivo para máquinas.
- `timestamp_utc` en ISO-8601 con `Z` y `timestamp_local` en ISO-8601 con su desfase. Ambos van siempre.
- Encabezados en minúsculas con guion bajo (`snake_case`), sin tildes ni espacios. Son un contrato para quien automatiza: no cambian sin subir la versión del kit.
- Un valor ausente es un campo vacío, no `Sin datos`, `—`, `N/A` ni `null`. En `formula_version` también: vacío cuando no aplica.
- Sin filas de comentario: los metadatos van en el nombre del archivo y en las columnas.
- Los textos se neutralizan contra fórmulas como en la sección 9.
- **Nunca** incluye tópicos, certificados, identificadores internos (UUID, ARN, nombres de dispositivo), enlaces firmados ni tokens.

```csv
timestamp_utc,timestamp_local,station,variable,channel,unit,value,quality,formula_version
2026-10-07T03:00:00Z,2026-10-06T22:00:00-05:00,SmartNode 01,water_content,ch0,%,31.1,valid,teros-mvp-v1
2026-10-07T03:00:00Z,2026-10-06T22:00:00-05:00,SmartNode 01,pitch,1A,deg,1.2,valid,
```

## 11. Tono y redacción

- **Usted**, verbos en presente y sin signos de exclamación ni emojis.
- **Frases de 20 palabras o menos.** Una idea por frase.
- **Sin siglas sin explicar en las secciones ejecutivas.** En las técnicas se permiten si se explican la primera vez: `kPa (kilopascales)`, `dBm (intensidad de la señal)`, `UTC−05 (hora de Colombia)`.
- **Resultados, no componentes.** Diga qué pasó con el terreno, no qué hizo el sistema.
- **Tríadas.** Cuando enumere resultados, valores o escalas, agrupe de tres en tres si el contenido lo permite: tres cifras destacadas, tres niveles. No fuerce una tercera.
- **Lo que no se afirma.** El documento describe lo medido. No concluye que un terreno es estable o seguro, no predice y no atribuye causas que el dato no demuestra. No presenta drones, satélite ni escalas meso y macro como disponibles (`docs/SPEC.md` §2).
- **Datos de demostración.** Un documento con datos de ejemplo lo dice en la portada: «Datos de ejemplo».

| En lugar de | Escriba |
|---|---|
| El sensor ch0 reportó un valor subumbral durante 48 h. | La humedad del suelo estuvo por debajo del 20 % durante 2 días. |
| El motor de umbralización generó una alerta. | M3TRIC generó una alerta de nivel Atención porque la humedad bajó del límite que usted definió. |
| Todo normal. | Ninguna medición salió del rango normal en el periodo. |

**Caja «Datos parciales».** Va al inicio de la sección afectada, bajo su título. Fondo `beige`, borde izquierdo de 1,5 mm en `green-700`, texto `ink` y la expresión «Datos parciales» en 700. No usa colores cálidos, porque se confundiría con un nivel. Redacción:

> **Datos parciales.** Faltan lecturas de la Estación SmartNode 01 entre el 3 y el 4 de octubre. Los valores se calcularon con el 92 % de las lecturas esperadas.

Fórmula: «Faltan lecturas de [estación] entre [fecha] y [fecha]. Los valores se calcularon con el [n] % de las lecturas esperadas.»

**Expresiones fijas:** «Sin datos» (celda vacía), «Normal» (dentro del rango), «Atención», «Alerta» y «Crítico» (los niveles, tal cual están en `tokens.levelLabel`) y el aviso informativo de la sección 8.

## 12. Lista de verificación

Un «no» en cualquier punto bloquea la entrega del documento. Los puntos 1 a 13 aplican al PDF; el 14, al XLSX; el 15, al CSV y a los nombres de archivo.

| # | Compruebe | Cómo |
|---|---|---|
| 1 | Nunito incrustada y ninguna fuente sustituta | Lista de fuentes del PDF (por ejemplo `pdffonts`): solo caras de Nunito, todas incrustadas |
| 2 | Formato único (Carta o A4), márgenes de 20 mm y portada vertical | Dimensiones de cada página y caja del contenido |
| 3 | Logo: variante correcta para su fondo, vector, no menos de 24 mm y espacio libre | Revisión de la portada y de una página interior; sin imágenes de mapa de bits en el logo |
| 4 | Todos los colores son de la paleta y los cálidos solo marcan niveles | Extraer los colores del PDF y compararlos con la sección 4 |
| 5 | Contraste de cada par de texto de al menos 4,5:1; ningún `#74C69D` como texto sobre blanco o beige | Tabla de pares de la sección 4 |
| 6 | Cada nivel tiene palabra, forma y trama; se distingue en escala de grises | Renderizar el PDF en grises y revisar chips y gráficas |
| 7 | Tablas: encabezado `green-900` con texto blanco, filas alternas `beige`, números a la derecha, unidades en el encabezado, «Sin datos» en los vacíos | Revisión de cada tabla |
| 8 | Tablas largas: encabezado repetido, sin filas partidas y hasta 40 filas por página | Revisar la segunda página de la tabla más larga |
| 9 | Gráficas: series en el orden de `chartSeries`, pálidas con trazo grueso, guías discontinuas, textos de 7 pt o más en Nunito | Revisión visual contra la sección 7 |
| 10 | Lente ejecutiva: una lectura de máximo tres frases bajo cada gráfica, sin siglas sin explicar | Leer cada lectura y contar las palabras de cada frase |
| 11 | Números y fechas con la forma es-CO y zona horaria visible | Revisar la portada, una tabla y las notas: coma decimal, espacio fino, unidades con espacio, `6 oct 2026, 10:30` |
| 12 | Cabecera solo en páginas interiores, pie completo y «Página n de N» con N correcto | Revisar la primera, una intermedia y la última página |
| 13 | Aviso informativo literal en la portada (o la primera página) y en la última; metadatos del PDF con título, autor M3TRIC e idioma `es-CO` | Buscar la frase y revisar las propiedades del documento |
| 14 | XLSX: encabezado `green-900`, primera fila congelada, filtros, números y fechas como valores, sin fórmulas, textos neutralizados, hoja «Metadatos» completa, dentro del límite de filas | Abrir el archivo y revisar cada hoja; buscar celdas de texto que empiecen por `=`, `+`, `-` o `@` |
| 15 | Nombre `m3tric-<cuenta>-<desde>-<hasta>.<ext>`, CSV en UTF-8 con ISO-8601 UTC y local, columna de versión de fórmula y ningún secreto ni identificador | Revisar el nombre y el encabezado; buscar `arn:aws`, `eyJ` y patrones de UUID en todos los archivos |

Las pruebas del kit (`scripts/brand-kit.test.mjs`, repositorio de la landing) vigilan tres cosas de este archivo: que nombre cada color de `tokens.json` junto a su hex, que no cite un hex que no sea del kit y que conserve el orden de `chartSeries` y el aviso informativo literal. El resto de la lista se verifica a mano o con la herramienta de QA del equipo.

## 13. Qué no cubre y pendientes

**No cubre:** la interfaz web, presentaciones, correos, redes sociales, rotulación y piezas de merchandising, documentos en otros idiomas, firma digital, marcas de agua («Borrador») y producción de imprenta (sangrado y marcas de corte). Tampoco exige el cumplimiento de PDF/UA, aunque pide el PDF etiquetado y con texto alternativo.

**Pendientes**

1. **Co-marca de EAFIT en documentos.** Los documentos no la llevan. Falta el vector oficial (`src/components/brand/EafitLogo.tsx` es un trazado del PNG institucional) y una regla de posición, tamaño y color aprobada por el owner (ADR-011).
2. **DIN 2014 Rounded no se usa.** Se usa Nunito por decisión del owner (ADR-012). Si la oficina de marca adopta DIN, cambian la sección 5 y los gráficos de la sección 7.
3. **Lámina del manual sobre documentos.** Se propondrá a la oficina de marca incorporar la guía de documentos al manual. Hasta entonces este archivo es la referencia.
4. **Equivalentes CMYK o Pantone.** El kit no los tiene; se piden a la oficina de marca antes de una impresión de imprenta.
5. **Mínimo de 24 mm del logo.** Es una propuesta de este documento; el manual solo fija 96 px en pantalla (`docs/SPEC.md` §3.4).
6. **Motivo de tres barras en fila.** El kit solo trae la versión apilada (`motifs/triple-bar.svg`); la fila sale de `tokens.tripleBar`. Si la plataforma la necesita como archivo, se agrega al kit en una versión posterior.
7. **Formas de los niveles en la plataforma.** Aquí siguen a la landing (círculo, cuadrado, rombo); falta confirmar que la plataforma use las mismas.
8. **Cobertura de glifos.** Verifique con el primer PDF generado que la Nunito incrustada tenga el espacio fino (U+202F), el signo menos (U+2212) y el grado (°), sin recuadros ni sustitución.
9. **Formato por defecto.** Carta se tomó de la maqueta; el producto debe confirmarlo.
