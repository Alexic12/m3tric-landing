# Contraste de texto sobre fondos complejos (D5)

Método: `tests/helpers/contrast.mjs` captura cada sección (Chromium, `prefers-reduced-motion`), una vez normal y otra con todo el texto transparente (fondo puro: fotografía + velo + red de nodos). `tests/helpers/contrast.py` toma cada caja de línea de texto, compone el color del texto (con su alfa) sobre **cada píxel** del fondo bajo esa caja y calcula la razón WCAG 2.x. Se reporta el **peor caso** (el píxel que menos contrasta) y el mejor.

Umbral: 4.5:1 texto normal; 3:1 texto grande (≥ 24 px, o ≥ 18.66 px en negrita ≥ 700).

## Hero (sobre fotografía + velo) · 1280 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| h1 línea 1 (Bold, blanco) — «Entender el territorio» | 118 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 4.88 | 13.43 | ✔ |
| h1 línea 2 (Light, verde pastel) — «para anticipar el riesgo.» | 118 px / 300 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 3.95 | 9.73 | ✔ |
| Meta (kicker) — «Monitoreo del territorio» | 13 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 7.97 | 8.44 | ✔ |
| Lead — «M3TRIC reúne en un solo lugar la información de » | 21 px / 400 | `rgba(255, 255, 255, 0.902)` | 4.5 (normal) | 8.85 | 10.25 | ✔ |
| Botón secundario — «Hablar con el equipo» | 16 px / 700 | `rgba(0, 65, 36, 1.000)` | 4.5 (normal) | 8.32 | 8.32 | ✔ |
| Leyenda de capas #1 — «» | 17 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.50 | 5.50 | ✔ |
| Leyenda de capas #2 — «» | 17 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.50 | 5.50 | ✔ |
| Leyenda de capas #3 — «» | 17 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.49 | 5.50 | ✔ |
| Enlaces del header (solo ≥1280) #1 — «Beneficios» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.29 | 11.95 | ✔ |
| Enlaces del header (solo ≥1280) #2 — «Casos de uso» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.12 | 12.11 | ✔ |
| Enlaces del header (solo ≥1280) #3 — «Cómo funciona» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.82 | 12.11 | ✔ |
| Enlaces del header (solo ≥1280) #4 — «Escalas» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.80 | 11.95 | ✔ |
| Enlaces del header (solo ≥1280) #5 — «Preguntas» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.49 | 11.94 | ✔ |
| Enlaces del header (solo ≥1280) #6 — «Técnico» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 9.75 | 11.77 | ✔ |
| Enlaces del header (solo ≥1280) #7 — «Contacto» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 7.89 | 11.76 | ✔ |

## Hero (sobre fotografía + velo) · 390 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| h1 línea 1 (Bold, blanco) — «Entender el territorio» | 61 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 4.56 | 13.59 | ✔ |
| h1 línea 2 (Light, verde pastel) — «para anticipar el riesgo.» | 61 px / 300 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 3.83 | 9.59 | ✔ |
| Meta (kicker) — «Monitoreo del territorio» | 12 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.17 | 9.24 | ✔ |
| Lead — «M3TRIC reúne en un solo lugar la información de » | 18 px / 400 | `rgba(255, 255, 255, 0.902)` | 4.5 (normal) | 4.53 | 11.55 | ✔ |
| Botón secundario — «Hablar con el equipo» | 16 px / 700 | `rgba(0, 65, 36, 1.000)` | 4.5 (normal) | 8.32 | 8.32 | ✔ |
| Leyenda de capas #1 — «» | 17 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.50 | 5.50 | ✔ |
| Leyenda de capas #2 — «» | 17 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.49 | 5.50 | ✔ |
| Leyenda de capas #3 — «» | 17 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.50 | 5.50 | ✔ |

## Contacto (fondo oscuro + red de nodos) · 1280 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Kicker — «08 — Hablemos» | 13 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 8.32 | 8.32 | ✔ |
| H2 (palabras) #1 — «Entender» | 118 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #2 — «mejor» | 118 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 8.32 | 8.32 | ✔ |
| H2 (palabras) #3 — «para» | 118 px / 300 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 10.34 | 11.79 | ✔ |
| H2 (palabras) #4 — «decidir» | 118 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.03 | 11.79 | ✔ |
| H2 (palabras) #5 — «mejor» | 118 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.03 | 11.79 | ✔ |
| Texto — «Cuéntenos qué terreno necesita entender. Le most» | 21 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 7.30 | 8.32 | ✔ |
| Enlaces de contacto #1 — «Correo: contacto@m3tric-test.co» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 8.53 | 11.79 | ✔ |
| Enlaces de contacto #2 — «Teléfono: +57 300 000 0000» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.34 | 11.79 | ✔ |

## Contacto (fondo oscuro + red de nodos) · 390 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Kicker — «08 — Hablemos» | 12 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #1 — «Entender» | 61 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #2 — «mejor» | 61 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #3 — «para» | 61 px / 300 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 9.46 | 11.79 | ✔ |
| H2 (palabras) #4 — «decidir» | 61 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.03 | 11.79 | ✔ |
| H2 (palabras) #5 — «mejor» | 61 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 11.79 | 11.79 | ✔ |
| Texto — «Cuéntenos qué terreno necesita entender. Le most» | 18 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 8.32 | 8.32 | ✔ |
| Enlaces de contacto #1 — «Correo: contacto@m3tric-test.co» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.79 | 11.79 | ✔ |
| Enlaces de contacto #2 — «Teléfono: +57 300 000 0000» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.79 | 11.79 | ✔ |

## Casos de uso: tarjeta con fotografía · 1280 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Título (h3) — «Gestión del riesgo» | 28 px / 700 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.37 | 13.25 | ✔ |
| Alcance (meta) — «Deslizamientos y movimientos en masa» | 13 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.74 | 9.12 | ✔ |

## Casos de uso: tarjeta con fotografía · 390 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Título (h3) — «Gestión del riesgo» | 23 px / 700 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 7.89 | 13.08 | ✔ |
| Alcance (meta) — «Deslizamientos y movimientos en masa» | 12 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.91 | 9.24 | ✔ |

**Incumplimientos: 0.**
