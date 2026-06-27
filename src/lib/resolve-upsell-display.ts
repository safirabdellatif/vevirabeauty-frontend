import { OFFERS, PRODUCTS, type ProductId } from "@/content/products";

export interface UpsellInput {
  productId: string;
  productNameAr?: string;
  price: number;
  expiresInSeconds?: number;
  imageUrl?: string;
}

export interface UpsellDisplay {
  productId: ProductId;
  nameAr: string;
  shortNameAr: string;
  copy: string;
  subheading: string;
  imageSrc: string;
  price: number;
  expiresInSeconds: number;
  regularPrice: number;
}

export function isProductId(id: string): id is ProductId {
  return id in PRODUCTS;
}

/** Nom, image et texte depuis le catalogue — ne dépend pas uniquement de l’API. */
export function resolveUpsellDisplay(upsell: UpsellInput): UpsellDisplay {
  const productId = isProductId(upsell.productId) ? upsell.productId : null;
  const product = productId ? PRODUCTS[productId] : null;

  const nameAr =
    upsell.productNameAr?.trim() ||
    product?.nameAr ||
    upsell.productId ||
    "منتج فيرا بيوتي";

  const imageSrc =
    upsell.imageUrl?.trim() ||
    product?.cardImage ||
    product?.mainImage ||
    "";

  return {
    productId: (productId ?? upsell.productId) as ProductId,
    nameAr,
    shortNameAr: product?.shortNameAr ?? nameAr,
    copy: product?.upsellCopy ?? "",
    subheading: product?.heroSubheading?.slice(0, 140) ?? "",
    imageSrc,
    price: upsell.price,
    expiresInSeconds: upsell.expiresInSeconds ?? 15,
    regularPrice: OFFERS[0]?.price ?? 199,
  };
}
