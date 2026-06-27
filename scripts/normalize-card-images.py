"""Bake per-product zoom into card PNGs so bottles look similar in 4:3 cards."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "src" / "assets" / "products"
CANVAS = 1024

# Zoom baked into source: <1 shrinks artwork (smaller bottle in frame), >1 enlarges.
CONTENT_ZOOM: dict[str, float] = {
    "joint-pain-oil": 0.45,
    "melasma-cream": 1.16,
    "hair-loss-spray": 1.08,
}


def normalize_card(slug: str, zoom: float) -> None:
    src = ROOT / f"{slug}.png"
    dst = ROOT / f"{slug}-card.png"
    im = Image.open(src).convert("RGBA")
    w, h = im.size

    nw, nh = max(1, int(w * zoom)), max(1, int(h * zoom))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (255, 255, 255, 255))
    x = (CANVAS - nw) // 2
    y = (CANVAS - nh) // 2
    canvas.paste(resized, (x, y), resized)

    canvas.convert("RGB").save(dst, "PNG", optimize=True)
    print(f"{dst.name}: zoom={zoom}")


def main() -> None:
    for slug, zoom in CONTENT_ZOOM.items():
        normalize_card(slug, zoom)


if __name__ == "__main__":
    main()
