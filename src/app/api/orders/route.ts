import { NextRequest, NextResponse } from "next/server";
import { buildSheetPayloadFromApi, postToSheet, generateOrderId, selectUpsell, saveOrder, UPSELL_PRICE, UPSELL_EXPIRES_SECONDS } from "@/lib/server/orders";
import { normalizeMoroccanPhone } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const requestBody = JSON.parse(bodyText);

    const customer = requestBody.customer ?? {};
    const cart = requestBody.cart ?? {};
    const phone: string = customer.phone ?? "";

    // Validate Moroccan phone
    const normalized = normalizeMoroccanPhone(phone);
    if (!normalized) {
      return NextResponse.json(
        { detail: { message: "فضلاً أدخلي رقم هاتف مغربي صحيح (06 أو 07)" } },
        { status: 422 }
      );
    }

    const orderId = generateOrderId();
    const orderNumber = orderId;
    const total: number = cart.total ?? 0;

    const cartItemIds: string[] = (cart.items ?? []).map((i: { product_id?: string }) => i.product_id ?? "");
    const upsell = selectUpsell(cartItemIds);

    const orderResult = {
      orderId,
      orderNumber,
      order_number: orderNumber,
      status: "confirmed",
      total,
      currency: "MAD",
      upsell: upsell
        ? {
            productId: upsell.productId,
            productNameAr: upsell.productNameAr,
            price: UPSELL_PRICE,
            expiresInSeconds: UPSELL_EXPIRES_SECONDS,
          }
        : null,
    };

    // Save order in memory store (for upsell correlation)
    saveOrder({
      orderId,
      orderNumber,
      name: customer.name ?? "",
      phone: normalized.e164,
      items: (cart.items ?? []).map((i: { product_id?: string; product_name?: string; quantity?: number; offer_price?: number }) => ({
        product_id: i.product_id ?? "",
        product_name: i.product_name ?? "",
        quantity: i.quantity ?? 1,
        offer_price: i.offer_price ?? 0,
        offer_label: "",
        source: "vevirabeauty",
      })),
      total,
      upsellProductId: upsell?.productId ?? null,
      upsellAccepted: false,
      createdAt: new Date().toISOString(),
    });

    // Post to Google Sheet (Morocco)
    try {
      const sheetPayload = {
        ...buildSheetPayloadFromApi(
          { ...requestBody, customer: { ...customer, phone: normalized.e164 } },
          { ...orderResult, orderNumber, order_number: orderNumber }
        ),
        country: "MA",
        currency: "MAD",
      };
      postToSheet(sheetPayload).catch((err) =>
        console.error("[orders/MA] sheet post failed:", err)
      );
    } catch (err) {
      console.error("[orders/MA] sheet payload build failed:", err);
    }

    return NextResponse.json(orderResult, { status: 200 });
  } catch (err) {
    console.error("[orders/MA] unexpected error:", err);
    return NextResponse.json(
      { detail: { message: "صار خطأ مؤقت. حاولي مرة ثانية بعد لحظات." } },
      { status: 500 }
    );
  }
}

