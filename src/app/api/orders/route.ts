import { NextRequest } from "next/server";
import { handleCreateOrder, tryBackendProxy, type CreateOrderBody } from "@/lib/server/create-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  const proxied = await tryBackendProxy("/orders", bodyText, req.headers);
  if (proxied) return proxied;

  let body: CreateOrderBody;
  try {
    body = JSON.parse(bodyText) as CreateOrderBody;
  } catch {
    return Response.json({ detail: { code: "invalid_json", message: "طلب غير صالح." } }, { status: 400 });
  }

  return handleCreateOrder(body);
}
