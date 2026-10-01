#!/usr/bin/env python3
"""Turns the output of contrast.mjs into docs/evidence/contrast-hero.md.

For every measured text line box it samples the text-free background screenshot and reports the
WCAG 2.x contrast of the text colour (alpha-composited over the sampled pixel) against the darkest
and the lightest background pixel, i.e. the best and worst case under that text.
Usage: python3 tests/helpers/contrast.py [contrast_dir] [out_md]
"""
import json
import re
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "test-results" / "contrast"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "docs" / "evidence" / "contrast-hero.md"
TITLES = {"hero": "Hero (sobre fotografía + velo)", "contact": "Contacto (fondo oscuro + red de nodos)", "usecases": "Casos de uso: tarjeta con fotografía"}
MAX_SAMPLES = 40000


def lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(rgb) -> float:
    r, g, b = rgb
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(a: float, b: float) -> float:
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def parse_color(css: str):
    nums = [float(x) for x in re.findall(r"[\d.]+", css)]
    return (nums[0], nums[1], nums[2], nums[3] if len(nums) > 3 else 1.0)


def over(fg, alpha, bg):
    return tuple(fg[i] * alpha + bg[i] * (1 - alpha) for i in range(3))


def is_large(size: float, weight: int) -> bool:
    return size >= 24 or (size >= 18.66 and weight >= 700)


def measure(item, image: Image.Image, scale: float):
    fg = parse_color(item["color"])
    worst = (99.0, None)
    best = (0.0, None)
    for r in item["rects"]:
        box = (
            max(0, int(r["x"] * scale)),
            max(0, int(r["y"] * scale)),
            min(image.width, int((r["x"] + r["w"]) * scale) + 1),
            min(image.height, int((r["y"] + r["h"]) * scale) + 1),
        )
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        crop = image.crop(box).convert("RGB")
        px = list(crop.getdata())
        step = max(1, len(px) // MAX_SAMPLES)
        for p in px[::step]:
            eff = over(fg[:3], fg[3], p)
            c = ratio(lum(eff), lum(p))
            if c < worst[0]:
                worst = (c, p)
            if c > best[0]:
                best = (c, p)
    return worst, best


def main() -> None:
    lines = [
        "# Contraste de texto sobre fondos complejos (D5)",
        "",
        "Método: `tests/helpers/contrast.mjs` captura cada sección (Chromium, `prefers-reduced-motion`), una vez normal y otra con todo el texto transparente (fondo puro: fotografía + velo + red de nodos). `tests/helpers/contrast.py` toma cada caja de línea de texto, compone el color del texto (con su alfa) sobre **cada píxel** del fondo bajo esa caja y calcula la razón WCAG 2.x. Se reporta el **peor caso** (el píxel que menos contrasta) y el mejor.",
        "",
        "Umbral: 4.5:1 texto normal; 3:1 texto grande (≥ 24 px, o ≥ 18.66 px en negrita ≥ 700).",
        "",
    ]
    failures = 0
    for key in ("hero", "contact", "usecases"):
        for vp in ("1280", "390"):
            meta_file = SRC / f"{key}-{vp}.json"
            if not meta_file.exists():
                continue
            meta = json.loads(meta_file.read_text())
            image = Image.open(SRC / f"{key}-{vp}-bg.png")
            scale = image.width / meta["box"]["w"]
            lines += [f"## {TITLES[key]} · {vp} px", "", "| Texto | Tamaño / peso | Color | Umbral | Peor caso | Mejor caso | Resultado |", "|---|---|---|---|---|---|---|"]
            for item in meta["items"]:
                worst, best = measure(item, image, scale)
                if worst[1] is None:
                    continue
                large = is_large(item["fontSize"], item["fontWeight"])
                need = 3.0 if large else 4.5
                ok = worst[0] >= need
                failures += 0 if ok else 1
                lines.append(
                    f"| {item['label']} — «{item['text']}» | {item['fontSize']:.0f} px / {item['fontWeight']} | `{item['color']}` | {need} ({'grande' if large else 'normal'}) | {worst[0]:.2f} | {best[0]:.2f} | {'✔' if ok else '✘'} |"
                )
            lines.append("")
    lines += [f"**Incumplimientos: {failures}.**", ""]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines))
    print(f"{OUT}: {failures} failing rows")


if __name__ == "__main__":
    main()
