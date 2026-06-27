"""Generate card PNGs in 4:3 with cover-fill — no empty borders."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "src" / "assets" / "products"
CARD_SIZE = (1200, 900)  # 4:3

CONTENT_ZOOM: dict[str, float] = {
    "melasma-cream": 1.12,
    "hair-loss-spray": 1.06,
}

# Réduit uniquement la zone bouteille (gauche), pas le before/after.
JOINT_BOTTLE_SCALE = 0.56
JOINT_BOTTLE_SPLIT = 0.43  # fraction largeur = zone bouteille


def shrink_joint_bottle(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    split = int(w * JOINT_BOTTLE_SPLIT)

    canvas = im.copy()

    # Recouvre l’ancienne bouteille avec le fond adjacent (sans déformer le before/after)
    fill_w = split + 24
    fill = im.crop((split, 0, min(split + 96, w), h)).resize((fill_w, h), Image.Resampling.LANCZOS)
    canvas.paste(fill, (0, 0))

    bottle_zone = im.crop((0, 0, split, h))
    bw = max(1, int(bottle_zone.width * JOINT_BOTTLE_SCALE))
    bh = max(1, int(bottle_zone.height * JOINT_BOTTLE_SCALE))
    bottle = bottle_zone.resize((bw, bh), Image.Resampling.LANCZOS)

    x = int(w * 0.025)
    y = h - bh - int(h * 0.02)
    canvas.paste(bottle, (x, y))
    return canvas


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
    joint_src = ROOT / "joint-pain-oil.png"
    joint_dst = ROOT / "joint-pain-oil-card.png"
    adjusted = shrink_joint_bottle(joint_src)
    cover_fill(adjusted, joint_dst, CARD_SIZE, 1.0)
    print(f"{joint_dst.name}: bottle_scale={JOINT_BOTTLE_SCALE}")

    for slug, zoom in CONTENT_ZOOM.items():
        cover_fill(ROOT / f"{slug}.png", ROOT / f"{slug}-card.png", CARD_SIZE, zoom)


if __name__ == "__main__":
    main()
