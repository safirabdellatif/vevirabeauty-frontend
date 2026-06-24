import { NextRequest, NextResponse } from "next/server";
import { getOrder, saveOrder, postToSheet, UPSELL_PRICE } from "@/lib/server/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { accepted, product_id } = await req.json();

    if (!accepted) {
      return NextResponse.json({ ok: true });
    }

    const order = getOrder(params.id);
    if (!order) {
      return NextResponse.json({ ok: true, total: undefined });
    }

    const newTotal = order.total + UPSELL_PRICE;
    saveOrder({
      ...order,
      upsellAccepted: true,
      upsellProductId: product_id ?? order.upsellProductId,
      total: newTotal,
    });

    // Post upsell update to sheet
    postToSheet({
      orderid: order.orderNumber,
      upsell: product_id ?? "",
      totalprice: newTotal,
      currency: "MAD",
      upsell_accepted: true,
    }).catch((err) => console.error("[upsell/MA] sheet post failed:", err));

    return NextResponse.json({ ok: true, total: newTotal });
  } catch (err) {
    console.error("[upsell/MA] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
