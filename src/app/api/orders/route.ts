import { NextRequest } from "next/server";
import { handleCreateOrder, tryBackendProxy, type CreateOrderBody } from "@/lib/server/create-order";
import { resolveOrderLandingPage } from "@/lib/server/resolve-order-landing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeOrderBody(body: CreateOrderBody): CreateOrderBody {
  const items = body.cart?.items ?? [];
  const productIds = items
    .filter((item) => item.source !== "upsell")
    .map((item) => item.product_id);
  const attribution = (body.attribution ?? {}) as Record<string, unknown>;
  const resolvedLanding = resolveOrderLandingPage(
    (attribution.landing_page as string | undefined) ??
      (attribution.landingPage as string | undefined),
    productIds,
  );

  return {
    ...body,
    attribution: {
      ...attribution,
      landing_page: resolvedLanding,
    },
  };
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  let body: CreateOrderBody;
  try {
    body = normalizeOrderBody(JSON.parse(bodyText) as CreateOrderBody);
  } catch {
    return Response.json({ detail: { code: "invalid_json", message: "طلب غير صالح." } }, { status: 400 });
  }

  const normalizedBodyText = JSON.stringify(body);

  const proxied = await tryBackendProxy("/orders", normalizedBodyText, req.headers);
  if (proxied) return proxied;

  return handleCreateOrder(body);
}
