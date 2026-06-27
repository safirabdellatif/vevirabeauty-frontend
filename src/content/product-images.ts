import hero from "@/assets/products/hero.png";
import hairLossSpray from "@/assets/products/hair-loss-spray.png";
import hairLossSprayCard from "@/assets/products/hair-loss-spray-card.png";
import jointPainOil from "@/assets/products/joint-pain-oil.png";
import jointPainOilCard from "@/assets/products/joint-pain-oil-card.png";
import melasmaCream from "@/assets/products/melasma-cream.png";
import melasmaCreamCard from "@/assets/products/melasma-cream-card.png";

/** URLs bundlées par Next.js — disponibles après build sans dépendre de public/ */
export const PRODUCT_IMAGES = {
  hero: hero.src,
  joint_pain_oil: jointPainOil.src,
  joint_pain_oil_card: jointPainOilCard.src,
  hair_loss_spray: hairLossSpray.src,
  hair_loss_spray_card: hairLossSprayCard.src,
  melasma_cream: melasmaCream.src,
  melasma_cream_card: melasmaCreamCard.src,
} as const;
