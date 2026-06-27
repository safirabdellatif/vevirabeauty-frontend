import type { CreateOrderResult } from "@/lib/api";

function readUpsell(raw: Record<string, unknown>): CreateOrderResult["upsell"] {
  const u = raw.upsell;
  if (!u || typeof u !== "object") return undefined;

  const row = u as Record<string, unknown>;
  const productId = row.productId ?? row.product_id;
  if (!productId) return undefined;

  const imageUrl = row.imageUrl ?? row.image_url;

  return {
    productId: String(productId),
    productNameAr: String(row.productNameAr ?? row.product_name_ar ?? ""),
    price: Number(row.price ?? 0),
    expiresInSeconds: Number(row.expiresInSeconds ?? row.expires_in_seconds ?? 15),
    imageUrl: imageUrl ? String(imageUrl) : undefined,
  };
}

/** Accepte camelCase (Next.js local) ou snake_case (FastAPI). */
export function normalizeCreateOrderResult(raw: Record<string, unknown>): CreateOrderResult {
  return {
    orderId: String(raw.orderId ?? raw.order_id ?? ""),
    orderNumber: String(raw.orderNumber ?? raw.order_number ?? ""),
    status: String(raw.status ?? "pending_confirmation"),
    total: Number(raw.total ?? 0),
    currency: String(raw.currency ?? "MAD"),
    upsell: readUpsell(raw),
  };
}
