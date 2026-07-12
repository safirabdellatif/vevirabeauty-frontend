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
          }>;
        };
      }>;
    }>;
  };

  for (const entry of root.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        if (msg.type !== "text" || !msg.from || !msg.text?.body) continue;
        out.push({
          waId: msg.from,
          messageId: msg.id ?? "",
          text: msg.text.body.trim(),
        });
      }
    }
  }
  return out;
}

async function handleOneMessage(inbound: InboundText): Promise<void> {
  const { waId, messageId, text } = inbound;
  if (!text) return;

  void markWhatsAppRead(messageId);

  if (looksLikeResumeBot(text)) {
    clearEscalation(waId);
  }

  const session = getSession(waId);
  if (isEscalated(session) && !looksLikeResumeBot(text)) {
    // Human mode — do not auto-reply
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
  await sendWhatsAppText(waId, reply);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] webhook hit but WhatsApp env not configured");
    return Response.json({ ok: true, skipped: "not_configured" });
  }

  const signature = req.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(rawBody, signature)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = extractInboundTexts(body);

  // Acknowledge Meta quickly; process async-ish in same request (Next.js)
  await Promise.all(messages.map((m) => handleOneMessage(m).catch((err) => {
    console.error("[whatsapp] handle message failed", err);
  })));

  return Response.json({ ok: true });
}
