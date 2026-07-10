/** Detail images served from public/images/products (Docker copies public/). */

function detailExt(slug: string): string {
  return slug === "hair-loss-spray" || slug === "melasma-cream" || slug === "joint-pain-oil"
    ? "jpg"
    : "png";
}

export function featureImagePath(slug: string, index: number): string {
  return `/images/products/${slug}-feature-${index + 1}.${detailExt(slug)}`;
}

export function lifestyleImagePath(slug: string, index: number): string {
  return `/images/products/${slug}-lifestyle-${index + 1}.${detailExt(slug)}`;
}

export function featureImagePaths(slug: string, count = 4): string[] {
  return Array.from({ length: count }, (_, i) => featureImagePath(slug, i));
}

export function lifestyleImageEntries(slug: string, alts: string[]): { src: string; alt: string }[] {
  return alts.map((alt, i) => ({
    src: lifestyleImagePath(slug, i),
    alt,
  }));
}
