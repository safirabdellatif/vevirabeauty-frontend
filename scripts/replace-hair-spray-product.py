"""Replace hair-loss-spray product bottle in all site images — keep scene content."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "products"
PUBLIC = ROOT / "public" / "images" / "products"
SCENES = ROOT / "scripts" / "scene-sources"
AD_SOURCES = ROOT / "scripts" / "ad-sources"

DEFAULT_CUTOUT = Path(
    r"C:\Users\pc\.cursor\projects\c-Users-pc-Projects\assets"
    r"\c__Users_pc_AppData_Roaming_Cursor_User_workspaceStorage_2e851052e3358b3f4c915ecacc2cef71"
    r"_images_Generated_image.png9-removebg-preview-d46c021a-e5c4-4319-a63e-5cb232ee211f.png"
)

FEATURE_SIZE = (1200, 900)
LIFESTYLE_SIZE = (900, 1200)
CARD_SIZE = (1200, 900)
MAIN_SIZE = (1200, 1600)
CARD_ZOOM = 1.06

FEATURE_PLACEMENT = (0.34, 0.92, 0.88)
LIFESTYLE_PLACEMENT = (0.52, 0.5, 0.92)

# feature-1 scene has generic amber bottle in center — erase then replace
FEATURE1_ERASE = (430, 120, 770, 820)
FEATURE1_SAMPLE = (80, 80, 280, 280)
FEATURE1_PLACEMENT = (0.38, 0.52, 0.88)


def solidify_alpha(img: Image.Image, threshold: int = 40) -> Image.Image:
    rgba = img.convert("RGBA")
    r, g, b, a = rgba.split()
    a = a.point(lambda p: 255 if p > threshold else 0)
    return Image.merge("RGBA", (r, g, b, a))


def load_cutout(src: Path) -> Image.Image:
    if not src.exists():
        raise SystemExit(f"Missing cutout: {src}")
    img = Image.open(src).convert("RGBA")
    alpha = img.split()[3]
    bbox = alpha.point(lambda p: 255 if p > 30 else 0).getbbox()
    if not bbox:
        raise SystemExit("No opaque pixels in cutout")
    return solidify_alpha(img.crop(bbox))


def drop_shadow(size: tuple[int, int], blur: int = 12, opacity: int = 70) -> Image.Image:
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((8, size[1] // 2, size[0] - 8, size[1] - 4), fill=(0, 0, 0, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(blur))


def fit_scene(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    w, h = size
    im = src.convert("RGB")
    scale = max(w / im.width, h / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))


def erase_region(
    scene: Image.Image,
    erase: tuple[int, int, int, int],
    sample: tuple[int, int, int, int],
) -> Image.Image:
    x0, y0, x1, y1 = erase
    sx0, sy0, sx1, sy1 = sample
    out = scene.convert("RGB").copy()
    tex = out.crop((sx0, sy0, sx1, sy1)).resize((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    tex = tex.filter(ImageFilter.GaussianBlur(2))
    out.paste(tex, (x0, y0))
    return out


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


def gradient_bg(size: tuple[int, int]) -> Image.Image:
    top, bottom = (232, 245, 243), (245, 240, 232)
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        draw.line([(0, y), (w, y)], fill=color)
    return img


def paste_contain(canvas: Image.Image, product: Image.Image, scale: float = 0.88) -> None:
    cw, ch = canvas.size
    w, h = product.size
    fit = min(cw / w, ch / h) * scale
    nw, nh = int(w * fit), int(h * fit)
    resized = product.resize((nw, nh), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    x = (cw - nw) // 2
    y = (ch - nh) // 2
    layer.alpha_composite(resized, (x, y))
    base = canvas.convert("RGBA")
    base.alpha_composite(layer)
    canvas.paste(base.convert("RGB"))


def make_main_product(cutout: Image.Image) -> Image.Image:
    canvas = gradient_bg(MAIN_SIZE)
    paste_contain(canvas, cutout, 0.9)
    return canvas


def make_card(main: Image.Image) -> Image.Image:
    w, h = main.size
    cw, ch = CARD_SIZE
    scale = max(cw / w, ch / h) * CARD_ZOOM
    nw, nh = max(cw, int(w * scale)), max(ch, int(h * scale))
    resized = main.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - cw) // 2
    top = (nh - ch) // 2
    return resized.crop((left, top, left + cw, top + ch))


def composite_features(cutout: Image.Image) -> None:
    fw, fx, fy = FEATURE_PLACEMENT
    for i in range(1, 5):
        scene_path = SCENES / f"hair-loss-spray-feature-{i}.png"
        if not scene_path.exists():
            print(f"  skip missing {scene_path.name}")
            continue
        scene = fit_scene(Image.open(scene_path), FEATURE_SIZE)
        if i == 1:
            scene = erase_region(scene, FEATURE1_ERASE, FEATURE1_SAMPLE)
            wr, xc, yb = FEATURE1_PLACEMENT
            out = paste_product(scene, cutout, wr, xc, yb)
        else:
            out = paste_product(scene, cutout, fw, fx, fy)
        dest = PUBLIC / f"hair-loss-spray-feature-{i}.png"
        out.save(dest, "PNG", optimize=True)
        shutil.copy2(dest, ASSETS / dest.name)
        print(f"  feature-{i}")


def composite_lifestyle(cutout: Image.Image) -> None:
    lw, lx, ly = LIFESTYLE_PLACEMENT
    for i in range(1, 5):
        scene_path = SCENES / f"hair-loss-spray-lifestyle-{i}.png"
        if not scene_path.exists():
            print(f"  skip missing {scene_path.name}")
            continue
        scene = fit_scene(Image.open(scene_path), LIFESTYLE_SIZE)
        out = paste_product(scene, cutout, lw, lx, ly)
        dest = PUBLIC / f"hair-loss-spray-lifestyle-{i}.png"
        out.save(dest, "PNG", optimize=True)
        shutil.copy2(dest, ASSETS / dest.name)
        print(f"  lifestyle-{i}")


def save_core_images(cutout: Image.Image) -> None:
    cutout.save(AD_SOURCES / "spray-real.png", "PNG", optimize=True)
    print(f"spray-real.png: {cutout.size[0]}x{cutout.size[1]}")

    main = make_main_product(cutout)
    card = make_card(main)
    main.save(ASSETS / "hair-loss-spray.png", "PNG", optimize=True)
    card.save(ASSETS / "hair-loss-spray-card.png", "PNG", optimize=True)
    shutil.copy2(ASSETS / "hair-loss-spray.png", PUBLIC / "hair-loss-spray.png")
    shutil.copy2(ASSETS / "hair-loss-spray-card.png", PUBLIC / "hair-loss-spray-card.png")
    print("hair-loss-spray.png + card")


def rebuild_ads() -> None:
    import subprocess

    script = ROOT / "scripts" / "build-meta-ads-from-scratch.py"
    subprocess.run([sys.executable, str(script), "hair-loss-spray"], check=True)


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CUTOUT
    PUBLIC.mkdir(parents=True, exist_ok=True)
    AD_SOURCES.mkdir(parents=True, exist_ok=True)

    print("Loading cutout...")
    cutout = load_cutout(src)

    print("\nCore product images")
    save_core_images(cutout)

    print("\nFeature scenes (content kept, bottle replaced)")
    composite_features(cutout)

    print("\nLifestyle scenes (content kept, bottle added)")
    composite_lifestyle(cutout)

    print("\nMeta ads")
    rebuild_ads()

    print("\nDone.")


if __name__ == "__main__":
    main()
