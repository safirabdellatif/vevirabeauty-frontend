import { NextResponse } from "next/server";
import { getOpenAiConfig, getWhatsAppConfig, isWhatsAppConfigured } from "@/lib/whatsapp/config";
import { readWhatsAppStatus } from "@/lib/whatsapp/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnostic WhatsApp bot — no secrets exposed */
export async function GET() {
  const cfg = getWhatsAppConfig();
  const openai = getOpenAiConfig();
  const runtime = readWhatsAppStatus();

  let graph: { ok: boolean; detail: string } = { ok: false, detail: "not_tested" };

  if (cfg.token && cfg.phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/${cfg.apiVersion}/${cfg.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${cfg.token}` },
        cache: "no-store",
      });
      const body = await res.text();
      if (res.ok) {
        graph = { ok: true, detail: body.slice(0, 300) };
      } else {
        graph = { ok: false, detail: `HTTP ${res.status}: ${body.slice(0, 300)}` };
      }
    } catch (err) {
      graph = { ok: false, detail: err instanceof Error ? err.message : "fetch_failed" };
    }
  }

  return NextResponse.json({
    configured: isWhatsAppConfigured(),
    has: {
      token: Boolean(cfg.token),
      phoneNumberId: Boolean(cfg.phoneNumberId),
      verifyToken: Boolean(cfg.verifyToken),
      appSecret: Boolean(cfg.appSecret),
      openai: Boolean(openai.apiKey),
      ignoreSignature: process.env.WHATSAPP_IGNORE_SIGNATURE === "1",
    },
    webhookUrl: "https://vevirabeauty.com/api/whatsapp/webhook",
    graphApi: graph,
    runtime,
    checklist: [
      "Meta → WhatsApp → Configuration → Webhook URL = https://vevirabeauty.com/api/whatsapp/webhook",
      "Subscribe field: messages",
      "WHATSAPP_VERIFY_TOKEN must match Meta verify token exactly",
      "WHATSAPP_APP_SECRET = App Settings → Basic → App Secret (not the verify token)",
      "WHATSAPP_TOKEN must be a permanent token (temporary expires in ~24h)",
      "WHATSAPP_PHONE_NUMBER_ID = Phone number ID from Cloud API (not the phone digits)",
      "Number must be on Cloud API (not only WhatsApp Business phone app)",
      "Do not test by messaging yourself from the same business number",
    ],
  });
}
