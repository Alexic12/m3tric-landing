#!/usr/bin/env python3
"""Converts brand source images into public/images/*.webp (quality 78).

Usage: python3 scripts/optimize-images.py <sources_dir>
<sources_dir> must contain aerial-wide.png, aerial-tall.png and globe.png.
Sources: aerial-tall = manual image12.png crop (2150,660)-(2897,1656) (the photo
has a faint baked-in headline ghost at y 440-650, so the crop starts below it);
globe = manual image1.png.
"""
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

QUALITY = 78
# Per-width quality overrides. The 480 px tall crop is only used by the mobile hero, behind a >= 70 % brand
# veil, where detail is invisible: a lower quality keeps the LCP-critical image small.
WIDTH_QUALITY = {("aerial-tall", 480): 55}
OUT = Path(__file__).resolve().parent.parent / "public" / "images"
JOBS = {
    "aerial-wide": [640, 1280, 1920, 2560],
    "aerial-tall": [480, 640, 747],
    "globe": [640, 1000],
}
# Sources baked to monochrome (brand palette is green + neutrals; the globe source is multicolour).
MONOCHROME = {"globe"}
MONOCHROME_CONTRAST = 1.15


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    OUT.mkdir(parents=True, exist_ok=True)
    for name, widths in JOBS.items():
        image = Image.open(src / f"{name}.png").convert("RGB")
        if name in MONOCHROME:
            mono = ImageOps.autocontrast(ImageOps.grayscale(image), cutoff=1)
            image = ImageEnhance.Contrast(mono).enhance(MONOCHROME_CONTRAST).convert("RGB")
        for w in widths:
            if w > image.width:
                continue
            h = round(image.height * w / image.width)
            target = OUT / f"{name}-{w}.webp"
            image.resize((w, h), Image.LANCZOS).save(target, "WEBP", quality=WIDTH_QUALITY.get((name, w), QUALITY), method=6)
            print(f"{target.name}: {w}x{h} {target.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
