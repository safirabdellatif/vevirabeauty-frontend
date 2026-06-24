import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";
import { buildSheetPayloadFromApi, postToSheet } from "@/lib/server/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const response = await proxyToBackend("/orders", req, "POST", bodyText);

  if (response.status >= 200 && response.status < 300) {
    try {
      const requestBody = JSON.parse(bodyText);
      const responseText = await response.clone().text();
      const orderResult = JSON.parse(responseText);
      const sheetPayload = buildSheetPayloadFromApi(requestBody, orderResult);
      postToSheet(sheetPayload).catch((err) =>
        console.error("[orders] sheet post failed:", err)
      );
    } catch (err) {
      console.error("[orders] sheet payload build failed:", err);
    }
  }

  return response;
}
