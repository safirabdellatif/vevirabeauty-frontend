import { PRODUCTS, type ProductId } from "@/content/products";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "ttclid",
  "scclid",
] as const;

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vevirabeauty.com";
}

export function landingPath(landing: string): string {
  const trimmed = landing.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).pathname;
  } catch {
    const path = trimmed.split("?")[0]?.split("#")[0] ?? "";
    return path.startsWith("/") ? path : "";
  }
}

export function isWarmingLandingPath(path: string): boolean {
  return path === "/lp" || path === "/" || path.startsWith("/ads/");
}

function mergeTrackingParams(fromLanding: string, targetUrl: string): string {
  try {
    const from = fromLanding.includes("://")
      ? new URL(fromLanding)
      : new URL(fromLanding, siteOrigin());
    const target = new URL(targetUrl);
    for (const key of TRACKING_PARAMS) {
      const value = from.searchParams.get(key);
      if (value && !target.searchParams.has(key)) {
        target.searchParams.set(key, value);
      }
    }
    return target.href;
  } catch {
    return targetUrl;
  }
}

/** Map /lp and other warming landings to the ordered product page. */
export function resolveOrderLandingPage(
  landingPage: string | undefined | null,
  cartProductIds: string[],
): string {
  const landing = String(landingPage ?? "").trim();
  const path = landingPath(landing);
  if (!isWarmingLandingPath(path)) return landing;

  for (const productId of cartProductIds) {
    if (productId in PRODUCTS) {
      const slug = PRODUCTS[productId as ProductId].slug;
      const target = `${siteOrigin()}/products/${slug}`;
      return landing ? mergeTrackingParams(landing, target) : target;
    }
  }

  return landing;
}
