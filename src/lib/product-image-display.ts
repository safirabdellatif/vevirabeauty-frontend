import type { ProductId } from "@/content/products";

const BASE = "max-h-full max-w-full object-contain object-center";

/** Compense les proportions différentes dans les visuels IA */
export const PRODUCT_CARD_IMAGE_CLASS: Record<ProductId, string> = {
  melasma_cream: `${BASE} scale-[1.08] transition-transform duration-300 group-hover:scale-[1.1]`,
  hair_loss_spray: `${BASE} scale-[1.02] transition-transform duration-300 group-hover:scale-[1.04]`,
  joint_pain_oil: `${BASE} scale-[0.74] transition-transform duration-300 group-hover:scale-[0.77]`,
};

export const PRODUCT_PAGE_IMAGE_CLASS: Record<ProductId, string> = {
  melasma_cream: `${BASE} scale-[1.08]`,
  hair_loss_spray: `${BASE} scale-[1.02]`,
  joint_pain_oil: `${BASE} scale-[0.74]`,
};
