import type { ProductId } from "@/content/products";

/** Cartes 4:3 pré-remplies (scripts/normalize-card-images.py) */
export const PRODUCT_CARD_IMAGE_CLASS =
  "h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]";

/** Page produit : remplit le cadre sans bordures vides */
export const PRODUCT_PAGE_IMAGE_CLASS: Record<ProductId, string> = {
  melasma_cream: "h-full w-full object-cover object-center",
  hair_loss_spray: "h-full w-full object-cover object-center",
  joint_pain_oil: "h-full w-full object-cover object-center",
};
