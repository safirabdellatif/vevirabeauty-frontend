"""Generate feature + lifestyle PNGs from existing product shots (4:3 features, 3:4 lifestyle)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / "src" / "assets" / "products"
PUBLIC = Path(__file__).resolve().parents[1] / "public" / "images" / "products"

FEATURE_SIZE = (1200, 900)  # 4:3
LIFESTYLE_SIZE = (900, 1200)  # 3:4

# (zoom, center_x_ratio, center_y_ratio) — focal point per feature slot
FEATURE_CROPS: dict[str, list[tuple[float, float, float]]] = {
    "joint-pain-oil": [
        (1.05, 0.5, 0.45),
        (1.35, 0.38, 0.42),
        (1.35, 0.62, 0.48),
        (1.15, 0.5, 0.55),
    ],
    "hair-loss-spray": [
        (1.08, 0.5, 0.42),
        (1.4, 0.35, 0.45),
        (1.4, 0.65, 0.5),
        (1.2, 0.5, 0.58),
    ],
    "melasma-cream": [
        (1.1, 0.5, 0.44),
        (1.38, 0.4, 0.46),
        (1.38, 0.6, 0.5),
        (1.18, 0.5, 0.56),
    ],
}

BG_TOP = (232, 245, 243)  # brand-mint-ish
BG_BOTTOM = (245, 240, 232)  # brand-sand-ish


def gradient_bg(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def cover_crop(
    src: Image.Image,
    size: tuple[int, int],
    zoom: float,
    cx: float,
    cy: float,
) -> Image.Image:
    w, h = src.size
    cw, ch = size
    scale = max(cw / w, ch / h) * zoom
    nw, nh = max(cw, int(w * scale)), max(ch, int(h * scale))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - cw) * cx)
    top = int((nh - ch) * cy)
    left = max(0, min(left, nw - cw))
    top = max(0, min(top, nh - ch))
    return resized.crop((left, top, left + cw, top + ch))


def paste_contain(canvas: Image.Image, src: Image.Image, scale: float = 0.88) -> None:
    cw, ch = canvas.size
    w, h = src.size
    fit = min(cw / w, ch / h) * scale
    nw, nh = int(w * fit), int(h * fit)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (cw - nw) // 2
    y = (ch - nh) // 2
    canvas.paste(resized, (x, y))


def generate(slug: str) -> None:
    main_path = ROOT / f"{slug}.png"
    card_path = ROOT / f"{slug}-card.png"
    if not main_path.exists():
        raise FileNotFoundError(main_path)

    main = Image.open(main_path).convert("RGB")
    card = Image.open(card_path).convert("RGB") if card_path.exists() else main
    crops = FEATURE_CROPS[slug]

    for i, (zoom, cx, cy) in enumerate(crops, start=1):
        src = card if i == 4 else main
        feature = cover_crop(src, FEATURE_SIZE, zoom, cx, cy)
        out = ROOT / f"{slug}-feature-{i}.png"
        feature.save(out, "PNG", optimize=True)
        print(f"  feature-{i}: {out.name}")

    lifestyle_sources = [main, card, main, card]
    lifestyle_scales = [0.82, 0.9, 0.78, 0.86]
    for i, (src, scale) in enumerate(zip(lifestyle_sources, lifestyle_scales, strict=True), start=1):
        canvas = gradient_bg(LIFESTYLE_SIZE)
        paste_contain(canvas, src, scale)
        out = ROOT / f"{slug}-lifestyle-{i}.png"
        canvas.save(out, "PNG", optimize=True)
        print(f"  lifestyle-{i}: {out.name}")


def sync_public() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for path in ROOT.glob("*.png"):
        dest = PUBLIC / path.name
        dest.write_bytes(path.read_bytes())
        if "-feature-" in path.name or "-lifestyle-" in path.name:
            print(f"  public: {dest.name}")


def main() -> None:
    for slug in FEATURE_CROPS:
        print(f"\n{slug}")
        generate(slug)
    print("\nSync public/")
    sync_public()
    print("\nDone.")


if __name__ == "__main__":
    main()
