#!/usr/bin/env python3
"""Converts the raw PNGs written by tests/live/screenshots.spec.ts into WebP evidence.

test-results/live-screens/*.png  ->  docs/evidence/live/screenshots/*.webp (quality 80)
Same approach as to-webp.py (stale files removed, oversized Retina captures halved to fit WebP's 16383 px cap).
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "test-results" / "live-screens"
DST = ROOT / "docs" / "evidence" / "live" / "screenshots"
QUALITY = 80
WEBP_MAX_SIDE = 16383


def main() -> int:
    pngs = sorted(SRC.glob("*.png"))
    if not pngs:
        print(f"no PNGs in {SRC}: run the live screenshots spec first (npm run test:live)", file=sys.stderr)
        return 1
    DST.mkdir(parents=True, exist_ok=True)
    total = 0
    written = set()
    for png in pngs:
        image = Image.open(png).convert("RGB")
        while max(image.size) > WEBP_MAX_SIDE:
            image = image.resize((image.width // 2, image.height // 2), Image.LANCZOS)
        target = DST / f"{png.stem}.webp"
        image.save(target, "WEBP", quality=QUALITY, method=6)
        written.add(target)
        total += target.stat().st_size
        print(f"{target.name}: {image.width}x{image.height} {target.stat().st_size // 1024} KB")
    for stale in [*DST.glob("*.png"), *DST.glob("*.webp")]:
        if stale not in written:
            stale.unlink()
    print(f"total {total // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
