/** Slugs pub → page cible. Utilisé par middleware + route /ads/[slug]. */
export const DEFAULT_AD_REDIRECTS: Record<string, string> = {
  lp: "/lp",
  vevira: "/lp",
  joint: "/products/joint-pain-oil",
  hair: "/products/hair-loss-spray",
  melasma: "/products/melasma-cream",
};

export function getEnvSlugMap(): Record<string, string> {
  const map = { ...DEFAULT_AD_REDIRECTS };
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
  return getEnvSlugMap()[key] ?? null;
}
