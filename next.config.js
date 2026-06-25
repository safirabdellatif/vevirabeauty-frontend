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
    return [
      { source: "/dashbord", destination: "/admin", permanent: true },
      { source: "/dashboard", destination: "/admin", permanent: true },
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
