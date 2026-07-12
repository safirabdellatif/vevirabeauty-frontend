import { OFFERS, PRODUCTS, type ProductId } from "@/content/products";
import { siteUrl } from "@/lib/whatsapp/config";

export const PRODUCT_IDS = Object.keys(PRODUCTS) as ProductId[];

export function buildCatalogPromptBlock(): string {
  const base = siteUrl();
  const lines: string[] = [
    "كاتالوغ فيرا بيوتي (المغرب — درهم MAD):",
    "",
  ];

  for (const id of PRODUCT_IDS) {
    const p = PRODUCTS[id];
    lines.push(`- id: ${id}`);
    lines.push(`  الاسم: ${p.nameAr}`);
    lines.push(`  مختصر: ${p.shortNameAr}`);
    lines.push(`  الرابط: ${base}/products/${p.slug}`);
    lines.push(`  فوائد مختصرة: ${p.benefits.slice(0, 3).join(" | ")}`);
    lines.push("");
  }

  lines.push("الأسعار (نفسها لكل المنتجات):");
  for (const o of OFFERS) {
    lines.push(`- ${o.quantity} قطعة = ${o.price} درهم (${o.label} — ${o.badge})`);
  }
  lines.push("- العرض الموصى به للبيع: 2 قطع بـ 289 درهم");
  lines.push("- الدفع عند الاستلام | توصيل لجميع مدن المغرب | ضمان 30 يوم");
  lines.push("- منتجات عناية خارجية — ماشي دواء، النتائج كتختلف من شخص لآخر");

  return lines.join("\n");
}

export function resolveProductId(raw: string): ProductId | null {
  const key = raw.trim().toLowerCase().replace(/-/g, "_");
  if (key in PRODUCTS) return key as ProductId;
  for (const id of PRODUCT_IDS) {
    const p = PRODUCTS[id];
    if (key === p.slug || key.includes(id) || key.includes(p.slug)) return id;
  }
  return null;
}
