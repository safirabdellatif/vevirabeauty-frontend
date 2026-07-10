"""Deploy AI-generated melasma-cream product page images (JPEG for Easypanel)."""

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
    "melasma-cream-product-hero.png": None,
    "melasma-cream-feature-1.png": FEATURE_SIZE,
    "melasma-cream-feature-2.png": FEATURE_SIZE,
    "melasma-cream-feature-3.png": FEATURE_SIZE,
    "melasma-cream-feature-4.png": FEATURE_SIZE,
    "melasma-cream-lifestyle-1.png": LIFESTYLE_SIZE,
    "melasma-cream-lifestyle-2.png": LIFESTYLE_SIZE,
    "melasma-cream-lifestyle-3.png": LIFESTYLE_SIZE,
    "melasma-cream-lifestyle-4.png": LIFESTYLE_SIZE,
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
    hero = cover_fill(Image.open(SRC / "melasma-cream-product-hero.png"), CARD_SIZE)
    main_img = cover_fill(Image.open(SRC / "melasma-cream-product-hero.png"), MAIN_SIZE)

    save_jpeg(hero, PUBLIC / "melasma-cream-card.jpg")
    save_jpeg(main_img, PUBLIC / "melasma-cream.jpg")
    save_jpeg(hero, ASSETS / "melasma-cream-card.jpg")
    save_jpeg(main_img, ASSETS / "melasma-cream.jpg")
    remove_old_png("melasma-cream-card")
    remove_old_png("melasma-cream")

    for src_name, size in FILES.items():
        if size is None:
            continue
        out_stem = src_name.replace("melasma-cream-", "melasma-cream-").replace(".png", "")
        # melasma-cream-feature-1.png -> melasma-cream-feature-1
        stem = Path(src_name).stem
        img = cover_fill(Image.open(SRC / src_name), size)
        save_jpeg(img, PUBLIC / f"{stem}.jpg")
        remove_old_png(stem)

    # Remove redundant assets copies (served from public/)
    for path in ASSETS.glob("melasma-cream-feature-*"):
        path.unlink(missing_ok=True)
    for path in ASSETS.glob("melasma-cream-lifestyle-*"):
        path.unlink(missing_ok=True)

    print("Done.")


if __name__ == "__main__":
    main()
