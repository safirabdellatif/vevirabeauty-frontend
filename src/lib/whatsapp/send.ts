import { createHmac, timingSafeEqual } from "crypto";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const { appSecret } = getWhatsAppConfig();
  if (!appSecret) {
    // Allow local/dev without secret; production should set WHATSAPP_APP_SECRET
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function sendWhatsAppText(toE164Digits: string, body: string): Promise<boolean> {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();
  if (!token || !phoneNumberId) {
    console.error("[whatsapp] missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return false;
  }

  const to = toE164Digits.replace(/\D/g, "");
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: true, body: body.slice(0, 4000) },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[whatsapp] send failed", res.status, errText);
    return false;
  }
  return true;
}

export async function markWhatsAppRead(messageId: string): Promise<void> {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();
  if (!token || !phoneNumberId || !messageId) return;

  await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  }).catch(() => undefined);
}
