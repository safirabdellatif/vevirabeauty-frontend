"""Deploy AI-generated hair-loss-spray product page images to public + assets."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "products"
PUBLIC = ROOT / "public" / "images" / "products"
SRC = Path(r"C:\Users\pc\.cursor\projects\c-Users-pc-Projects\assets")

FEATURE_SIZE = (1200, 900)
LIFESTYLE_SIZE = (900, 1200)
MAIN_SIZE = (1200, 1600)
CARD_SIZE = (1200, 900)

MAPPING = {
    "hair-loss-spray-product-hero.png": ["hair-loss-spray-card.png", "hair-loss-spray.png"],
    "hair-loss-spray-feature-1.png": ["hair-loss-spray-feature-1.png"],
    "hair-loss-spray-feature-2.png": ["hair-loss-spray-feature-2.png"],
    "hair-loss-spray-feature-3.png": ["hair-loss-spray-feature-3.png"],
    "hair-loss-spray-feature-4.png": ["hair-loss-spray-feature-4.png"],
    "hair-loss-spray-lifestyle-1.png": ["hair-loss-spray-lifestyle-1.png"],
    "hair-loss-spray-lifestyle-2.png": ["hair-loss-spray-lifestyle-2.png"],
    "hair-loss-spray-lifestyle-3.png": ["hair-loss-spray-lifestyle-3.png"],
    "hair-loss-spray-lifestyle-4.png": ["hair-loss-spray-lifestyle-4.png"],
}


def cover_fill(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    w, h = size
    im = src.convert("RGB")
    scale = max(w / im.width, h / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    hero = Image.open(SRC / "hair-loss-spray-product-hero.png")

    card = cover_fill(hero, CARD_SIZE)
    main = cover_fill(hero, MAIN_SIZE)

    for folder in (ASSETS, PUBLIC):
        card.save(folder / "hair-loss-spray-card.jpg", "JPEG", quality=85, optimize=True, progressive=True)
        main.save(folder / "hair-loss-spray.jpg", "JPEG", quality=85, optimize=True, progressive=True)
        print(f"{folder.name}/hair-loss-spray-card.jpg + hair-loss-spray.jpg")

    for src_name, dest_names in MAPPING.items():
        if src_name == "hair-loss-spray-product-hero.png":
            continue
        path = SRC / src_name
        if not path.exists():
            raise SystemExit(f"Missing: {path}")
        im = Image.open(path)
        size = LIFESTYLE_SIZE if "lifestyle" in src_name else FEATURE_SIZE
        out = cover_fill(im, size)
        for dest_name in dest_names:
            jpg_name = dest_name.replace(".png", ".jpg")
            out.save(PUBLIC / jpg_name, "JPEG", quality=85, optimize=True, progressive=True)
            print(f"public/{jpg_name}")


if __name__ == "__main__":
    main()
