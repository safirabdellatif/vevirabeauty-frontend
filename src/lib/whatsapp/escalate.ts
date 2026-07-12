import { supportEmail } from "@/lib/whatsapp/config";
import { markEscalated } from "@/lib/whatsapp/memory";

export async function escalateToHuman(
  waId: string,
  reason: string,
  lastUserMessage: string,
): Promise<string> {
  markEscalated(waId);

  const payload = {
    type: "whatsapp_escalation",
    waId,
    reason,
    lastUserMessage,
    email: supportEmail(),
    at: new Date().toISOString(),
  };

  console.warn("[whatsapp] ESCALATION", JSON.stringify(payload));

  const notifyUrl = process.env.WHATSAPP_ESCALATE_WEBHOOK_URL?.trim();
  if (notifyUrl) {
    try {
      await fetch(notifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("[whatsapp] escalate webhook failed", err);
    }
  }

  return `فهمت، غادي نخليك مع الفريق ديالنا 💚 غادي يردو عليك هنا ف واتساب قريب. إلا بغيتي ترجع للبوت قول: «رجع البوت».`;
}
