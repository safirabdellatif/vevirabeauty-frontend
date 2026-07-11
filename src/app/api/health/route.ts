import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sheetUrl = process.env.SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL || "";
  const backendUrl = process.env.BACKEND_API_URL || process.env.API_BASE_URL || "";
  return NextResponse.json({
    ok: true,
    service: "vevirabeauty-frontend",
    orders: {
      mode:
        process.env.USE_BACKEND_ORDERS === "false"
          ? "local"
          : process.env.BACKEND_API_URL || process.env.API_BASE_URL
            ? "backend_with_local_fallback"
            : "local",
    },
    google_sheet: {
      configured: Boolean(sheetUrl),
      webhook_url_suffix: sheetUrl ? sheetUrl.replace(/\/$/, "").split("/").pop()?.slice(0, 12) : null,
    },
    backend_api: backendUrl || null,
  });
}
