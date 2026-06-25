/** On-site paths available in the redirect manager dropdown. */
export const REDIRECT_TARGETS = [
  { path: "/", label: "الصفحة الرئيسية" },
  { path: "/products", label: "جميع المنتجات" },
  { path: "/products/joint-pain-oil", label: "زيت آلام المفاصل" },
  { path: "/products/hair-loss-spray", label: "رشاش تساقط الشعر" },
  { path: "/products/melasma-cream", label: "كريم الكلف" },
  { path: "/about", label: "عن فيرا بيوتي" },
  { path: "/contact", label: "تواصل معنا" },
  { path: "/lp", label: "Landing page (/lp)" },
];

export function buildAdRedirectUrl(slug: string, siteOrigin = "https://vevirabeauty.com"): string {
  const base = siteOrigin.replace(/\/$/, "");
  return `${base}/ads/${encodeURIComponent(slug)}`;
}
