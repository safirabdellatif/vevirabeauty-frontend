import type { ProductId } from "@/content/products";

/** Cartes : zoom normalisé dans les PNG `-card` (scripts/normalize-card-images.py) */
export const PRODUCT_CARD_IMAGE_CLASS =
  "h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]";

const BASE = "max-h-full max-w-full object-contain object-center";

/** Page produit : léger ajustement sur l’image pleine (non `-card`) */
export const PRODUCT_PAGE_IMAGE_CLASS: Record<ProductId, string> = {
  melasma_cream: `${BASE} scale-[1.06]`,
  hair_loss_spray: BASE,
  joint_pain_oil: `${BASE} scale-[0.88]`,
};
