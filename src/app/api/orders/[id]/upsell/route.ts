import { NextRequest } from "next/server";
import { handleUpsell, tryBackendProxy } from "@/lib/server/create-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const bodyText = await req.text();

  const proxied = await tryBackendProxy(`/orders/${params.id}/upsell`, bodyText, req.headers);
  if (proxied) return proxied;

  let body: { accepted?: boolean; product_id?: string; event_id?: string };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return Response.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  return handleUpsell(params.id, body);
}
