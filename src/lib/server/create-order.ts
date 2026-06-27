import { randomUUID } from "crypto";
import { OFFERS, PRODUCTS, type ProductId } from "@/content/products";
import { normalizeMoroccanPhone } from "@/lib/phone";
import {
  UPSELL_PRICE,
  buildSheetPayloadFromApi,
  generateOrderNumber,
  getOrder,
  postToSheet,
  saveOrder,
  selectUpsell,
  type SheetItem,
  type StoredOrder,
} from "@/lib/server/orders";

const OFFER_PRICES = Object.fromEntries(OFFERS.map((o) => [o.quantity, o.price])) as Record<
  number,
  number
>;

export interface CreateOrderBody {
  customer: { name: string; phone: string };
  cart: {
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_bundle_price?: number;
      offer_price?: number;
      offer_label?: string;
      source?: string;
    }>;
    total?: number;
    currency?: string;
  };
  attribution?: Record<string, unknown>;
  analytics?: Record<string, unknown>;
}

function validateName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (/^\d+$/.test(trimmed)) return false;
  if (/http/i.test(trimmed)) return false;
  return true;
}

function lineTotal(productId: string, quantity: number, source: string): number | null {
  if (source === "upsell") return UPSELL_PRICE;
  if (!(productId in PRODUCTS)) return null;
  if (!(quantity in OFFER_PRICES)) return null;
  return OFFER_PRICES[quantity];
}

function errorResponse(code: string, message: string, status = 422) {
  return Response.json({ detail: { code, message } }, { status });
}

export async function handleCreateOrder(body: CreateOrderBody): Promise<Response> {
  if (!validateName(body.customer?.name ?? "")) {
    return errorResponse("invalid_name", "فضلاً أدخلي اسمًا صحيحًا.");
  }

  const phone = normalizeMoroccanPhone(body.customer.phone ?? "");
  if (!phone) {
    return errorResponse("invalid_phone", "فضلاً أدخلي رقم جوال مغربي صحيح (06 أو 07).");
  }

  const items = body.cart?.items ?? [];
  if (items.length === 0) {
    return errorResponse("empty_cart", "السلة فارغة.");
  }

  let subtotal = 0;
  const sheetItems: SheetItem[] = [];

  for (const item of items) {
    const source = item.source ?? "product_page";
    const total = lineTotal(item.product_id, item.quantity, source);
    if (total === null) {
      return errorResponse("invalid_product", "منتج أو عرض غير صحيح.");
    }
    subtotal += total;
    const product = PRODUCTS[item.product_id as ProductId];
    sheetItems.push({
      product_id: item.product_id,
      product_name: item.product_name || product?.nameAr || item.product_id,
      sku: product?.sku,
      quantity: item.quantity,
      offer_price: total,
      offer_label: item.offer_label ?? "",
      source,
    });
  }

  const orderId = randomUUID();
  const orderNumber = generateOrderNumber();
  const productIds = sheetItems.filter((i) => i.source !== "upsell").map((i) => i.product_id);
  const upsell = selectUpsell(productIds);

  const stored: StoredOrder = {
    orderId,
    orderNumber,
    name: body.customer.name.trim(),
    phone: phone.digitsWithCountryCode,
    items: sheetItems,
    total: subtotal,
    upsellProductId: upsell?.productId ?? null,
    upsellAccepted: false,
    createdAt: new Date().toISOString(),
  };

  saveOrder(stored);

  const orderResult = {
    orderId,
    orderNumber,
    status: "pending_confirmation",
    total: subtotal,
    currency: "MAD",
  };

  const sheetPayload = buildSheetPayloadFromApi(
    body as unknown as Record<string, unknown>,
    orderResult as Record<string, unknown>,
  );
  sheetPayload.phone = phone.digitsWithCountryCode;
  sheetPayload.name = stored.name;

  void postToSheet(sheetPayload);

  return Response.json({
    orderId,
    orderNumber,
    status: "pending_confirmation",
    total: subtotal,
    currency: "MAD",
    upsell: upsell
      ? {
          productId: upsell.productId,
          productNameAr: upsell.productNameAr,
          price: upsell.price,
          expiresInSeconds: upsell.expiresInSeconds,
        }
      : null,
  });
}

export async function handleUpsell(
  orderId: string,
  body: { accepted?: boolean; product_id?: string; event_id?: string },
): Promise<Response> {
  const order = getOrder(orderId);
  if (!order) {
    return Response.json({ detail: "Order not found" }, { status: 404 });
  }

  if (!body.accepted) {
    return Response.json({ ok: true, total: order.total, upsellTotal: 0 });
  }

  const upsellId = body.product_id as ProductId | undefined;
  if (!upsellId || !(upsellId in PRODUCTS)) {
    return Response.json({ detail: "Order not eligible for upsell" }, { status: 422 });
  }

  if (order.items.some((i) => i.product_id === upsellId)) {
    return Response.json({ detail: "Order not eligible for upsell" }, { status: 422 });
  }

  const product = PRODUCTS[upsellId];
  order.items.push({
    product_id: upsellId,
    product_name: product.nameAr,
    sku: product.sku,
    quantity: 1,
    offer_price: UPSELL_PRICE,
    offer_label: "upsell",
    source: "upsell",
  });
  order.total += UPSELL_PRICE;
  order.upsellAccepted = true;
  saveOrder(order);

  const sheetPayload = {
    date: new Date().toLocaleDateString("fr-FR"),
    orderid: `${order.orderNumber}-UPSELL`,
    country: "MAR",
    name: order.name,
    phone: order.phone,
    product: product.nameAr,
    sku: product.sku,
    quantity: "1",
    totalprice: UPSELL_PRICE,
    currency: "MAD",
    status: "upsell_accepted",
  };
  void postToSheet(sheetPayload);

  return Response.json({ ok: true, total: order.total, upsellTotal: UPSELL_PRICE });
}

/** Optional: forward to Python backend when configured and reachable. */
export async function tryBackendProxy(
  path: string,
  body: string,
  headers: Headers,
): Promise<Response | null> {
  if (process.env.USE_BACKEND_ORDERS === "true") {
    const base = (
      process.env.BACKEND_API_URL ||
      process.env.API_BASE_URL ||
      ""
    ).replace(/\/$/, "");
    if (!base) return null;

    const outHeaders = new Headers({ "Content-Type": "application/json" });
    for (const name of ["cf-connecting-ip", "x-forwarded-for", "x-real-ip", "user-agent"]) {
      const v = headers.get(name);
      if (v) outHeaders.set(name, v);
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: outHeaders,
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (res.status === 422) {
        const text = await res.text();
        let useLocal = false;
        try {
          const parsed = JSON.parse(text) as { detail?: { code?: string } };
          if (parsed.detail?.code === "invalid_product") useLocal = true;
        } catch {
          /* keep backend 422 */
        }
        if (!useLocal) {
          return new Response(text, {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    } catch {
      /* fall through to local handler */
    }
  }
  return null;
}
