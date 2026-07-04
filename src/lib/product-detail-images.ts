/** Detail images served from public/images/products (Docker copies public/). */

export function featureImagePath(slug: string, index: number): string {
  return `/images/products/${slug}-feature-${index + 1}.png`;
}

export function lifestyleImagePath(slug: string, index: number): string {
  return `/images/products/${slug}-lifestyle-${index + 1}.png`;
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
