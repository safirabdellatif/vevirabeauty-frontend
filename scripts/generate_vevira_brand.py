"""Generate Vevira Beauty brand assets from public/logo-source.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
APP = ROOT / "src" / "app"
SOURCE = PUBLIC / "logo-source.png"


def load_rgba() -> Image.Image:
    img = Image.open(SOURCE).convert("RGBA")
    data = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = data[x, y]
            if r > 240 and g > 240 and b > 240:
                data[x, y] = (255, 255, 255, 0)
    return img


def fit_square(img: Image.Image, size: int) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    cropped = img.crop((left, top, left + side, top + side))
    return cropped.resize((size, size), Image.Resampling.LANCZOS)


def to_white_mark(img: Image.Image) -> Image.Image:
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    src = img.load()
    dst = out.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            _, _, _, a = src[x, y]
            if a > 20:
                dst[x, y] = (255, 255, 255, min(255, a + 40))
    return out


def save_png(img: Image.Image, path: Path, size: int | None = None) -> None:
    out = fit_square(img, size) if size else img
    if out.mode != "RGBA":
        out = out.convert("RGBA")
    out.save(path, format="PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}")


def save_ico(sizes: list[int]) -> None:
    images = [fit_square(load_rgba(), s) for s in sizes]
    images[0].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )
    print(f"  {PUBLIC.relative_to(ROOT) / 'favicon.ico'}")


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source logo: {SOURCE}")

    base = load_rgba()
    print("Generating Vevira brand assets…")

    save_png(base, PUBLIC / "logo.png", 512)
    save_png(base, PUBLIC / "brand-mark-teal.png", 256)
    save_png(to_white_mark(base), PUBLIC / "brand-mark-light.png", 256)
    save_png(base, PUBLIC / "og-image.png", 1200)

    for size in (16, 32, 48, 96):
        save_png(base, PUBLIC / f"favicon-{size}x{size}.png", size)

    for size, name in (
        (192, "android-chrome-192x192.png"),
        (512, "android-chrome-512x512.png"),
        (180, "apple-touch-icon.png"),
        (512, "icon-512.png"),
    ):
        save_png(base, PUBLIC / name, size)

    save_ico([16, 32, 48])
    save_png(base, APP / "icon.png", 32)
    save_png(base, APP / "apple-icon.png", 180)

    print("Done.")


if __name__ == "__main__":
    main()
