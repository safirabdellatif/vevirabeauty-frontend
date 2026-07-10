"""
Composite real Vevira product photos onto section scene images.

Scene sources (context, no branded product): scripts/scene-sources/
Real product shots: src/assets/products/{slug}.png
Output: public/images/products/{slug}-feature-*.png + lifestyle-*.png

Run after updating scene-sources/ or regenerating scenes via AI (with prompts below).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "products"
AD_SOURCES = ROOT / "scripts" / "ad-sources"
SCENES = ROOT / "scripts" / "scene-sources"
PUBLIC = ROOT / "public" / "images" / "products"

FEATURE_SIZE = (1200, 900)
LIFESTYLE_SIZE = (900, 1200)

SLUGS = ("joint-pain-oil", "hair-loss-spray", "melasma-cream")

# Relative crop on real product PNG (bottle/jar on left side of hero image)
PRODUCT_CROP: dict[str, tuple[float, float, float, float]] = {
    "joint-pain-oil": (0.0, 0.02, 0.43, 0.98),
    "hair-loss-spray": (0.0, 0.0, 0.47, 1.0),
    "melasma-cream": (0.0, 0.05, 0.41, 0.95),
}

# Product placement on scene (width ratio, x anchor 0-1, y anchor 0-1 from bottom)
FEATURE_PLACEMENT = (0.34, 0.92, 0.88)  # width ratio, x center, y bottom
LIFESTYLE_PLACEMENT = (0.52, 0.5, 0.92)


def crop_product(slug: str) -> Image.Image:
    if slug == "hair-loss-spray":
        path = AD_SOURCES / "spray-real.png"
        if path.exists():
            im = Image.open(path).convert("RGBA")
            alpha = im.split()[3]
            bbox = alpha.point(lambda p: 255 if p > 30 else 0).getbbox()
            return im.crop(bbox) if bbox else im
    path = ASSETS / f"{slug}.png"
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    x0, y0, x1, y1 = PRODUCT_CROP[slug]
    box = (int(w * x0), int(h * y0), int(w * x1), int(h * y1))
    return im.crop(box)


def drop_shadow(size: tuple[int, int], blur: int = 12, opacity: int = 70) -> Image.Image:
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((8, size[1] // 2, size[0] - 8, size[1] - 4), fill=(0, 0, 0, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(blur))


def paste_product(
    scene: Image.Image,
    product: Image.Image,
    width_ratio: float,
    x_center: float,
    y_bottom: float,
) -> Image.Image:
    canvas = scene.convert("RGBA")
    cw, ch = canvas.size
    target_w = int(cw * width_ratio)
    scale = target_w / product.width
    target_h = int(product.height * scale)
    prod = product.resize((target_w, target_h), Image.Resampling.LANCZOS)

    shadow = drop_shadow((target_w + 40, max(24, target_h // 6)))
    x = int(cw * x_center - target_w / 2)
    y = int(ch * y_bottom - target_h)

    canvas.alpha_composite(shadow, (x - 20, y + target_h - shadow.height // 2))
    canvas.alpha_composite(prod, (x, y))
    return canvas.convert("RGB")


def fit_scene(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    w, h = size
    im = src.convert("RGB")
    scale = max(w / im.width, h / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))


def composite_slug(slug: str) -> None:
    product = crop_product(slug)
    fw, fx, fy = FEATURE_PLACEMENT
    lw, lx, ly = LIFESTYLE_PLACEMENT

    for i in range(1, 5):
        scene_path = SCENES / f"{slug}-feature-{i}.png"
        if not scene_path.exists():
            print(f"  skip missing {scene_path.name}")
            continue
        scene = fit_scene(Image.open(scene_path), FEATURE_SIZE)
        out = paste_product(scene, product, fw, fx, fy)
        dest = PUBLIC / f"{slug}-feature-{i}.png"
        out.save(dest, "PNG", optimize=True)
        print(f"  feature-{i} -> {dest.name}")

    for i in range(1, 5):
        scene_path = SCENES / f"{slug}-lifestyle-{i}.png"
        if not scene_path.exists():
            print(f"  skip missing {scene_path.name}")
            continue
        scene = fit_scene(Image.open(scene_path), LIFESTYLE_SIZE)
        out = paste_product(scene, product, lw, lx, ly)
        dest = PUBLIC / f"{slug}-lifestyle-{i}.png"
        out.save(dest, "PNG", optimize=True)
        print(f"  lifestyle-{i} -> {dest.name}")


def main() -> None:
    if not SCENES.is_dir():
        raise SystemExit(f"Missing scene-sources folder: {SCENES}")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for slug in SLUGS:
        print(f"\n{slug}")
        composite_slug(slug)
    print("\nDone.")


if __name__ == "__main__":
    main()
