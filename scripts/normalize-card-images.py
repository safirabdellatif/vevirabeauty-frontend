"""Generate card PNGs in 4:3 with cover-fill — no empty borders."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "src" / "assets" / "products"
CARD_SIZE = (1200, 900)  # 4:3

CONTENT_ZOOM: dict[str, float] = {
    "joint-pain-oil": 0.84,
    "melasma-cream": 1.12,
    "hair-loss-spray": 1.06,
}


def cover_fill(src: Path | Image.Image, dst: Path, size: tuple[int, int], zoom: float) -> None:
    im = src.convert("RGB") if isinstance(src, Image.Image) else Image.open(src).convert("RGB")
    w, h = im.size
    cw, ch = size
    scale = max(cw / w, ch / h) * zoom
    nw, nh = max(cw, int(w * scale)), max(ch, int(h * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - cw) // 2
    top = (nh - ch) // 2
    cropped = resized.crop((left, top, left + cw, top + ch))
    cropped.save(dst, "PNG", optimize=True)
    print(f"{dst.name}: {size[0]}x{size[1]} zoom={zoom}")


def main() -> None:
    for slug, zoom in CONTENT_ZOOM.items():
        cover_fill(ROOT / f"{slug}.png", ROOT / f"{slug}-card.png", CARD_SIZE, zoom)


if __name__ == "__main__":
    main()
