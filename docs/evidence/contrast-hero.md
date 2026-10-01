# Contraste de texto sobre fondos complejos (D5)

Método: `tests/helpers/contrast.mjs` captura cada sección (Chromium, `prefers-reduced-motion`), una vez normal y otra con todo el texto transparente (fondo puro: fotografía + velo + red de nodos). `tests/helpers/contrast.py` toma cada caja de línea de texto, compone el color del texto (con su alfa) sobre **cada píxel** del fondo bajo esa caja y calcula la razón WCAG 2.x. Se reporta el **peor caso** (el píxel que menos contrasta) y el mejor.

Umbral: 4.5:1 texto normal; 3:1 texto grande (≥ 24 px, o ≥ 18.66 px en negrita ≥ 700).

## Hero (sobre fotografía + velo) · 1280 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| h1 línea 1 (Bold, blanco) — «Entender el territorio» | 118 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 4.83 | 13.43 | ✔ |
| h1 línea 2 (Light, verde pastel) — «para anticipar el riesgo.» | 118 px / 300 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 4.25 | 9.72 | ✔ |
| Meta (kicker) — «Lectura multiescala del territorio» | 13 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 7.97 | 8.55 | ✔ |
| Lead — «M3TRIC está diseñado para integrar sensores en c» | 21 px / 400 | `rgba(255, 255, 255, 0.902)` | 4.5 (normal) | 8.85 | 10.25 | ✔ |
| Botón secundario — «Hablar con el equipo» | 16 px / 700 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.12 | 12.11 | ✔ |
| Leyenda de capas #1 — «Sensores en campo» | 18 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.62 | 11.95 | ✔ |
| Leyenda de capas #2 — «Drones» | 18 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.28 | 12.10 | ✔ |
| Leyenda de capas #3 — «Información satelital» | 18 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 8.51 | 12.43 | ✔ |
| Enlaces del header (solo ≥1280) #1 — «Propuesta» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.29 | 11.95 | ✔ |
| Enlaces del header (solo ≥1280) #2 — «Plataforma» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.12 | 12.11 | ✔ |
| Enlaces del header (solo ≥1280) #3 — «Escalas» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.81 | 11.95 | ✔ |
| Enlaces del header (solo ≥1280) #4 — «Productos» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.65 | 12.11 | ✔ |
| Enlaces del header (solo ≥1280) #5 — «Capacidades» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.49 | 11.79 | ✔ |
| Enlaces del header (solo ≥1280) #6 — «Tecnología» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 8.64 | 11.77 | ✔ |
| Enlaces del header (solo ≥1280) #7 — «Casos de uso» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 8.14 | 11.76 | ✔ |
| Enlaces del header (solo ≥1280) #8 — «Contacto» | 15 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 8.13 | 11.92 | ✔ |

## Hero (sobre fotografía + velo) · 390 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| h1 línea 1 (Bold, blanco) — «Entender el territorio» | 61 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 5.32 | 13.43 | ✔ |
| h1 línea 2 (Light, verde pastel) — «para anticipar el riesgo.» | 61 px / 300 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 4.22 | 9.59 | ✔ |
| Meta (kicker) — «Lectura multiescala del territorio» | 12 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.72 | 9.48 | ✔ |
| Lead — «M3TRIC está diseñado para integrar sensores en c» | 18 px / 400 | `rgba(255, 255, 255, 0.902)` | 4.5 (normal) | 4.84 | 11.43 | ✔ |
| Botón secundario — «Hablar con el equipo» | 16 px / 700 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 9.28 | 13.59 | ✔ |
| Leyenda de capas #1 — «Sensores en campo» | 16 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 9.44 | 12.91 | ✔ |
| Leyenda de capas #2 — «Drones» | 16 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 9.90 | 12.27 | ✔ |
| Leyenda de capas #3 — «Información satelital» | 16 px / 500 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.80 | 12.27 | ✔ |

## Contacto (fondo oscuro + red de nodos) · 1280 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Kicker — «08 — Contacto» | 13 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 8.32 | 8.32 | ✔ |
| H2 (palabras) #1 — «Entender» | 118 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #2 — «mejor» | 118 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 8.32 | 8.32 | ✔ |
| H2 (palabras) #3 — «para» | 118 px / 300 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 10.34 | 11.79 | ✔ |
| H2 (palabras) #4 — «decidir» | 118 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.03 | 11.79 | ✔ |
| H2 (palabras) #5 — «mejor» | 118 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.03 | 11.79 | ✔ |
| Texto — «Cuéntenos qué territorio necesita entender. Le m» | 21 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 7.30 | 8.32 | ✔ |
| Enlaces de contacto #1 — «Correo: contacto@m3tric-test.co» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 8.53 | 11.79 | ✔ |
| Enlaces de contacto #2 — «Teléfono: +573000000000» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 10.34 | 11.79 | ✔ |

## Contacto (fondo oscuro + red de nodos) · 390 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Kicker — «08 — Contacto» | 12 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #1 — «Entender» | 61 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #2 — «mejor» | 61 px / 800 | `rgba(183, 227, 199, 1.000)` | 3.0 (grande) | 7.30 | 8.32 | ✔ |
| H2 (palabras) #3 — «para» | 61 px / 300 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 9.46 | 11.79 | ✔ |
| H2 (palabras) #4 — «decidir» | 61 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 8.02 | 11.79 | ✔ |
| H2 (palabras) #5 — «mejor» | 61 px / 800 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 11.79 | 11.79 | ✔ |
| Texto — «Cuéntenos qué territorio necesita entender. Le m» | 18 px / 400 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 8.32 | 8.32 | ✔ |
| Enlaces de contacto #1 — «Correo: contacto@m3tric-test.co» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.79 | 11.79 | ✔ |
| Enlaces de contacto #2 — «Teléfono: +573000000000» | 18 px / 400 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 11.79 | 11.79 | ✔ |

## Casos de uso: tarjeta con fotografía · 1280 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Título (h3) — «Gestión del riesgo» | 28 px / 700 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 7.43 | 13.75 | ✔ |
| Alcance (meta) — «Deslizamientos y movimientos en masa» | 13 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.09 | 9.71 | ✔ |
| Texto — «El comportamiento del terreno empieza mucho ante» | 21 px / 300 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 6.79 | 13.59 | ✔ |

## Casos de uso: tarjeta con fotografía · 390 px

| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |
|---|---|---|---|---|---|---|
| Título (h3) — «Gestión del riesgo» | 23 px / 700 | `rgba(255, 255, 255, 1.000)` | 3.0 (grande) | 7.42 | 13.75 | ✔ |
| Alcance (meta) — «Deslizamientos y movimientos en masa» | 12 px / 500 | `rgba(183, 227, 199, 1.000)` | 4.5 (normal) | 5.15 | 9.59 | ✔ |
| Texto — «El comportamiento del terreno empieza mucho ante» | 18 px / 300 | `rgba(255, 255, 255, 1.000)` | 4.5 (normal) | 7.31 | 13.75 | ✔ |

**Incumplimientos: 0.**
