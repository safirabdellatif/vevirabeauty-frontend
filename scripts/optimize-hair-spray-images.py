"""Compress hair-loss-spray product page images for Easypanel deploy (disk quota)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "images" / "products"
ASSETS = ROOT / "src" / "assets" / "products"
JPEG_QUALITY = 85


def to_jpeg(src: Path, dest: Path, size: tuple[int, int] | None = None) -> int:
    im = Image.open(src).convert("RGB")
    if size:
        w, h = size
        scale = max(w / im.width, h / im.height)
        nw, nh = int(im.width * scale), int(im.height * scale)
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        left = (nw - w) // 2
        top = (nh - h) // 2
        im = im.crop((left, top, left + w, top + h))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    if dest != src and src.exists() and src.suffix.lower() == ".png":
        src.unlink()
    return dest.stat().st_size


def main() -> None:
    patterns = [
        "hair-loss-spray-feature-*.png",
        "hair-loss-spray-lifestyle-*.png",
        "hair-loss-spray-card.png",
        "hair-loss-spray.png",
    ]
    total_before = 0
    total_after = 0

    for pattern in patterns:
        for png in PUBLIC.glob(pattern):
            before = png.stat().st_size
            jpg = png.with_suffix(".jpg")
            after = to_jpeg(png, jpg)
            total_before += before
            total_after += after
            print(f"public {jpg.name}: {before // 1024}KB -> {after // 1024}KB")

    # Only main + card needed in assets (bundled by Next.js)
    for name in ("hair-loss-spray.png", "hair-loss-spray-card.png"):
        src = PUBLIC / name.replace(".png", ".jpg")
        if not src.exists():
            continue
        dest = ASSETS / src.name
        before = dest.stat().st_size if dest.exists() else 0
        after = to_jpeg(src, dest)
        total_before += before
        total_after += after
        print(f"assets {dest.name}: {after // 1024}KB")

    # Remove redundant feature/lifestyle from assets (served from public/)
    for path in ASSETS.glob("hair-loss-spray-feature-*"):
        path.unlink(missing_ok=True)
        print(f"removed assets/{path.name}")
    for path in ASSETS.glob("hair-loss-spray-lifestyle-*"):
        path.unlink(missing_ok=True)
        print(f"removed assets/{path.name}")
    for old in (ASSETS / "hair-loss-spray.png", ASSETS / "hair-loss-spray-card.png"):
        if old.exists() and old.suffix == ".png":
            old.unlink()
            print(f"removed assets/{old.name}")

    print(f"\nTotal: {total_before // 1024}KB -> {total_after // 1024}KB")


if __name__ == "__main__":
    main()
