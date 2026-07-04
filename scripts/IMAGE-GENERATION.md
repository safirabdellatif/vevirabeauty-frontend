# Product section images — use real Vevira product reference

When generating scene images (AI or stock), **always pass the real product PNG** as reference:

| Product | Reference file |
|---------|----------------|
| Joint oil | `src/assets/products/joint-pain-oil.png` |
| Minoxidil | `src/assets/products/hair-loss-spray.png` |
| Melasma cream | `src/assets/products/melasma-cream.png` |

## Workflow

1. Generate **scene only** (context, usage, pain angle) — no fake generic bottle.
2. Save to `scripts/scene-sources/{slug}-feature-{1-4}.png` and `{slug}-lifestyle-{1-4}.png` (local, gitignored).
3. Run composite (adds real product from hero PNG):

```bash
python scripts/composite-product-on-scenes.py
```

4. Commit `public/images/products/*-feature-*.png` and `*-lifestyle-*.png`.

## AI prompt suffix (all products)

Add to every prompt:

```
Use the exact product bottle/jar from the reference image, same label and shape.
Morocco audience, photorealistic, no extra text overlay, no watermark.
```

## Section prompts — joint-pain-oil

| File | Prompt focus |
|------|----------------|
| feature-1 | Natural essential oils flat lay + reference product bottle nearby |
| feature-2 | Light oil absorbed on knee, reference product visible |
| feature-3 | Woman massaging knee, reference product on table |
| feature-4 | Morning/evening routine split, reference product in both scenes |
| lifestyle-1 | Knee pain relief moment + reference product |
| lifestyle-2 | Wrist massage + reference product |
| lifestyle-3 | Back pain after work + reference product |
| lifestyle-4 | Elderly joint care + reference product |

## Section prompts — hair-loss-spray

| File | Prompt focus |
|------|----------------|
| feature-1 | Minoxidil 5% clinical + reference Vevira spray bottle |
| feature-2 | Spray/scalp application + reference product |
| feature-3 | Twice daily routine + reference product |
| feature-4 | Unscented clear solution + reference product |
| lifestyle-1 | Hair in shower drain + reference product on shelf |
| lifestyle-2 | Thinning scalp + reference product |
| lifestyle-3 | Receding hairline mirror + reference product |
| lifestyle-4 | Scalp root massage + reference product |

## Section prompts — melasma-cream

| File | Prompt focus |
|------|----------------|
| feature-1 | Natural brightening botanicals + reference cream jar |
| feature-2 | Gentle cream on cheek + reference jar |
| feature-3 | Morning/evening dark spot routine + reference jar |
| feature-4 | Sunscreen + reference melasma cream jar |
| lifestyle-1 | Sun melasma on face + reference product |
| lifestyle-2 | Sun spots on cheeks + reference product |
| lifestyle-3 | Uneven skin tone mirror + reference product |
| lifestyle-4 | Applying cream on spots + reference product |
