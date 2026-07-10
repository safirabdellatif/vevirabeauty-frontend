"""Deploy AI-generated joint-pain-oil product page images (JPEG for Easypanel)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "products"
PUBLIC = ROOT / "public" / "images" / "products"
SRC = Path(r"C:\Users\pc\.cursor\projects\c-Users-pc-Projects\assets")
JPEG_QUALITY = 85

FEATURE_SIZE = (1200, 900)
LIFESTYLE_SIZE = (900, 1200)
MAIN_SIZE = (1200, 1600)
CARD_SIZE = (1200, 900)

FILES = {
    "joint-pain-oil-product-hero.png": None,
    "joint-pain-oil-feature-1.png": FEATURE_SIZE,
    "joint-pain-oil-feature-2.png": FEATURE_SIZE,
    "joint-pain-oil-feature-3.png": FEATURE_SIZE,
    "joint-pain-oil-feature-4.png": FEATURE_SIZE,
    "joint-pain-oil-lifestyle-1.png": LIFESTYLE_SIZE,
    "joint-pain-oil-lifestyle-2.png": LIFESTYLE_SIZE,
    "joint-pain-oil-lifestyle-3.png": LIFESTYLE_SIZE,
    "joint-pain-oil-lifestyle-4.png": LIFESTYLE_SIZE,
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


def save_jpeg(img: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    print(f"{dest.relative_to(ROOT)} ({dest.stat().st_size // 1024}KB)")


def remove_old_png(stem: str) -> None:
    for folder in (PUBLIC, ASSETS):
        png = folder / f"{stem}.png"
        if png.exists():
            png.unlink()
            print(f"removed {png.relative_to(ROOT)}")


def main() -> None:
    hero = cover_fill(Image.open(SRC / "joint-pain-oil-product-hero.png"), CARD_SIZE)
    main_img = cover_fill(Image.open(SRC / "joint-pain-oil-product-hero.png"), MAIN_SIZE)

    save_jpeg(hero, PUBLIC / "joint-pain-oil-card.jpg")
    save_jpeg(main_img, PUBLIC / "joint-pain-oil.jpg")
    save_jpeg(hero, ASSETS / "joint-pain-oil-card.jpg")
    save_jpeg(main_img, ASSETS / "joint-pain-oil.jpg")
    remove_old_png("joint-pain-oil-card")
    remove_old_png("joint-pain-oil")

    for src_name, size in FILES.items():
        if size is None:
            continue
        stem = Path(src_name).stem
        img = cover_fill(Image.open(SRC / src_name), size)
        save_jpeg(img, PUBLIC / f"{stem}.jpg")
        remove_old_png(stem)

    for path in ASSETS.glob("joint-pain-oil-feature-*"):
        path.unlink(missing_ok=True)
    for path in ASSETS.glob("joint-pain-oil-lifestyle-*"):
        path.unlink(missing_ok=True)

    print("Done.")


if __name__ == "__main__":
    main()
