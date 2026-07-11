/** Built-in slugs shipped with the app (work even if data/ad-redirects.json is empty). */
export const DEFAULT_AD_REDIRECTS: Record<string, string> = {
  "joint-escalier": "/products/joint-pain-oil",
  "joint-dos": "/products/joint-pain-oil",
  "joint-maman": "/products/joint-pain-oil",
};

export function getEnvSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  const raw = process.env.AD_REDIRECTS_JSON?.trim();
  if (!raw) return map;

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    for (const [slug, target] of Object.entries(parsed)) {
      const key = slug.trim().toLowerCase();
      const path = String(target).trim();
      if (key && path) map[key] = path;
    }
  } catch {
    /* ignore invalid JSON */
  }

  return map;
}

export function resolveEnvSlug(slug: string): string | null {
  const key = slug.trim().toLowerCase();
  return getEnvSlugMap()[key] ?? DEFAULT_AD_REDIRECTS[key] ?? null;
}
