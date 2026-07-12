import { NextRequest } from "next/server";
import {
  looksLikeHumanRequest,
  looksLikeResumeBot,
  runSalesAgent,
} from "@/lib/whatsapp/agent";
import { getWhatsAppConfig, isWhatsAppConfigured } from "@/lib/whatsapp/config";
import { escalateToHuman } from "@/lib/whatsapp/escalate";
import {
  appendMessage,
  clearEscalation,
  getSession,
  isEscalated,
  saveSession,
} from "@/lib/whatsapp/memory";
import { createOrderFromWhatsApp } from "@/lib/whatsapp/orders";
import { markWhatsAppRead, sendWhatsAppText, verifyMetaSignature } from "@/lib/whatsapp/send";
import { patchWhatsAppStatus } from "@/lib/whatsapp/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Meta webhook verification */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const { verifyToken } = getWhatsAppConfig();

  if (mode === "subscribe" && token && challenge && token === verifyToken) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  console.warn("[whatsapp] verify failed", {
    mode,
    tokenMatch: Boolean(token && verifyToken && token === verifyToken),
    hasChallenge: Boolean(challenge),
  });
  return Response.json({ error: "verification_failed" }, { status: 403 });
}

interface InboundText {
  waId: string;
  messageId: string;
  text: string;
}

function extractInboundTexts(body: unknown): InboundText[] {
  const out: InboundText[] = [];
  const root = body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            from?: string;
            id?: string;
            type?: string;
            text?: { body?: string };
            button?: { text?: string };
            interactive?: {
              button_reply?: { title?: string };
              list_reply?: { title?: string };
            };
          }>;
        };
      }>;
    }>;
  };

  for (const entry of root.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        if (!msg.from) continue;
        let text = "";
        if (msg.type === "text" && msg.text?.body) text = msg.text.body.trim();
        else if (msg.type === "button" && msg.button?.text) text = msg.button.text.trim();
        else if (msg.type === "interactive") {
          text = (
            msg.interactive?.button_reply?.title ||
            msg.interactive?.list_reply?.title ||
            ""
          ).trim();
        }
        if (!text) continue;
        out.push({
          waId: msg.from,
          messageId: msg.id ?? "",
          text,
        });
      }
    }
  }
  return out;
}

async function handleOneMessage(inbound: InboundText): Promise<void> {
  const { waId, messageId, text } = inbound;
  if (!text) return;

  patchWhatsAppStatus({
    lastInboundAt: new Date().toISOString(),
    lastInboundFrom: waId,
    lastInboundPreview: text.slice(0, 120),
  });

  void markWhatsAppRead(messageId);

  if (looksLikeResumeBot(text)) {
    clearEscalation(waId);
  }

  const session = getSession(waId);
  if (isEscalated(session) && !looksLikeResumeBot(text)) {
    appendMessage(waId, "user", text);
    return;
  }

  appendMessage(waId, "user", text);
  const history = getSession(waId).messages.slice(0, -1);

  let agent = await runSalesAgent(history, text);

  if (looksLikeHumanRequest(text) && agent.action !== "escalate") {
    agent = { ...agent, action: "escalate", escalate_reason: agent.escalate_reason || "طلب بشري" };
  }

  let reply = agent.reply;

  if (agent.action === "escalate") {
    reply = await escalateToHuman(
      waId,
      agent.escalate_reason || "escalation",
      text,
      agent.lang,
    );
  } else if (agent.action === "create_order" && agent.order) {
    const orderResult = await createOrderFromWhatsApp(agent.order, waId, agent.lang);
    if (orderResult.ok) {
      reply = `${agent.reply}\n\n${orderResult.message}`.trim();
      const s = getSession(waId);
      s.lastOrderNumber = orderResult.orderNumber ?? null;
      saveSession(s);
    } else {
      reply = `${agent.reply}\n\n${orderResult.message}`.trim();
    }
  }

  appendMessage(waId, "assistant", reply);
  const sent = await sendWhatsAppText(waId, reply);
  if (!sent) {
    patchWhatsAppStatus({
      lastError: "send_failed_after_ai_reply — check WHATSAPP_TOKEN / PHONE_NUMBER_ID",
    });
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  patchWhatsAppStatus({ lastWebhookAt: new Date().toISOString() });

  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] webhook hit but WhatsApp env not configured");
    patchWhatsAppStatus({ lastError: "not_configured" });
    return Response.json({ ok: true, skipped: "not_configured" });
  }

  const signature = req.headers.get("x-hub-signature-256");
  const sigOk = verifyMetaSignature(rawBody, signature);
  patchWhatsAppStatus({ lastSignatureOk: sigOk });

  if (!sigOk) {
    console.warn("[whatsapp] invalid signature — check WHATSAPP_APP_SECRET");
    patchWhatsAppStatus({
      lastError: "invalid_signature — WHATSAPP_APP_SECRET must be Meta App Secret",
    });
    // Return 200 so Meta does not disable the webhook while you fix the secret.
    return Response.json({ ok: true, skipped: "invalid_signature" });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = extractInboundTexts(body);
  if (messages.length === 0) {
    return Response.json({ ok: true, empty: true });
  }

  await Promise.all(
    messages.map((m) =>
      handleOneMessage(m).catch((err) => {
        console.error("[whatsapp] handle message failed", err);
        patchWhatsAppStatus({
          lastError: err instanceof Error ? err.message : "handle_failed",
        });
      }),
    ),
  );

  return Response.json({ ok: true, handled: messages.length });
}
