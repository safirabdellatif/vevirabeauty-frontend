/** Slugs pub intégrés au build (backup si middleware absent). */
const DEFAULT_AD_REDIRECTS = {
  lp: "/lp",
  vevira: "/lp",
  joint: "/products/joint-pain-oil",
  hair: "/products/hair-loss-spray",
  melasma: "/products/melasma-cream",
};

function getAdSlugMap() {
  const map = { ...DEFAULT_AD_REDIRECTS };
  try {
    if (process.env.AD_REDIRECTS_JSON) {
      Object.assign(map, JSON.parse(process.env.AD_REDIRECTS_JSON));
    }
  } catch {
    /* ignore */
  }
  return map;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force same-origin API even if Easypanel overrides the Dockerfile build arg.
  env: {
    NEXT_PUBLIC_API_BASE_URL: "/api",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://vevirabeauty.com",
    NEXT_PUBLIC_ENABLE_PIXELS: "true",
    NEXT_PUBLIC_SNAP_PIXEL_ID: process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || "",
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
  },
  output: "standalone",
  images: {
    domains: ["vevirabeauty.com"],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    const adRules = Object.entries(getAdSlugMap()).map(([slug, destination]) => ({
      source: `/ads/${slug}`,
      destination,
      permanent: false,
    }));

    return [
      { source: "/dashbord", destination: "/admin", permanent: true },
      { source: "/dashboard", destination: "/admin", permanent: true },
      { source: "/redirecmysanad", destination: "/redirectvevira", permanent: true },
      { source: "/redirecmysanad/:path*", destination: "/redirectvevira/:path*", permanent: true },
      ...adRules,
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
