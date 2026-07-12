import { buildCatalogPromptBlock } from "@/lib/whatsapp/catalog";
import { getOpenAiConfig, siteUrl, supportEmail } from "@/lib/whatsapp/config";
import type { ChatMessage } from "@/lib/whatsapp/memory";
import type { ProductId } from "@/content/products";

export type AgentAction = "none" | "create_order" | "escalate";

export interface AgentOrderDraft {
  name: string;
  phone: string;
  city?: string;
  product_id: ProductId | string;
  quantity: 1 | 2 | 3;
}

export interface AgentResult {
  reply: string;
  action: AgentAction;
  order: AgentOrderDraft | null;
  escalate_reason: string | null;
}

const FALLBACK_REPLY =
  "وعلاش ماقدرتش نجاوب دابا. كتبي لينا ف الموقع https://vevirabeauty.com ولا عاودي الرسالة من بعد شوية. شكراً 💚";

function systemPrompt(): string {
  const catalog = buildCatalogPromptBlock();
  return `نتا وكيل مبيعات فيرا بيوتي (Vevira Beauty) فالمغرب. كتهضر بالدارجة المغربية (حروف عربية)، أسلوب ودّي، قصير، وكتبيع.

${catalog}

قواعد البيع:
1. دير push قوي على عرض 2 قطع بـ 289 درهم (الأكثر طلباً).
2. إذا سولو على منتج، عطي الرابط ديالو من الكاتالوغ + السعر.
3. الدفع عند الاستلام، توصيل لجميع المدن، ضمان 30 يوم.
4. ما تعدّش بوعود طبية. قول نتائج كتختلف.
5. إلا بغا يطلب من الشات، جمع: الاسم الكامل، رقم 06/07، المدينة، المنتج (product_id)، والكمية 1 أو 2 أو 3.
6. ما تديرش create_order حتى يكون عندك الاسم + رقم صحيح + product_id + كمية، والزبون أكد (مثلاً: نعم / أكد / صافي).
7. إلا قال بغا يهضر مع شي حد، أو شكاية/إرجاع معقدة، action=escalate.
8. إلا قال "رجع البوت" أو "رجع الرد التلقائي" بعد escalation، جاوب عادي وخلّي action=none.
9. الرد في reply يكون نص واتساب قصير (بدون JSON جواهه).
10. الموقع: ${siteUrl()} — الإيميل: ${supportEmail()}

جاوب دائماً بـ JSON فقط بهالشكل:
{
  "reply": "النص للزبون بالدارجة",
  "action": "none" | "create_order" | "escalate",
  "order": null أو {
    "name": "...",
    "phone": "06...",
    "city": "...",
    "product_id": "joint_pain_oil" | "hair_loss_spray" | "melasma_cream",
    "quantity": 1 | 2 | 3
  },
  "escalate_reason": null أو "سبب قصير"
}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("no_json");
  }
}

function normalizeResult(raw: unknown): AgentResult {
  const row = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const actionRaw = String(row.action ?? "none");
  const action: AgentAction =
    actionRaw === "create_order" || actionRaw === "escalate" ? actionRaw : "none";

  let order: AgentOrderDraft | null = null;
  if (row.order && typeof row.order === "object") {
    const o = row.order as Record<string, unknown>;
    const qty = Number(o.quantity);
    order = {
      name: String(o.name ?? "").trim(),
      phone: String(o.phone ?? "").trim(),
      city: o.city ? String(o.city).trim() : undefined,
      product_id: String(o.product_id ?? "").trim(),
      quantity: qty === 1 || qty === 3 ? qty : 2,
    };
  }

  const reply = String(row.reply ?? "").trim() || FALLBACK_REPLY;
  return {
    reply,
    action,
    order,
    escalate_reason: row.escalate_reason ? String(row.escalate_reason) : null,
  };
}

export async function runSalesAgent(
  history: ChatMessage[],
  userText: string,
): Promise<AgentResult> {
  const { apiKey, model } = getOpenAiConfig();
  if (!apiKey) {
    return {
      reply:
        "مرحبا بيك ف فيرا بيوتي 💚 شوف المنتجات والأسعار هنا: https://vevirabeauty.com/products — الدفع عند الاستلام.",
      action: "none",
      order: null,
      escalate_reason: null,
    };
  }

  const messages = [
    { role: "system" as const, content: systemPrompt() },
    ...history.slice(-20).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userText },
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[whatsapp] openai error", res.status, err);
      return { reply: FALLBACK_REPLY, action: "none", order: null, escalate_reason: null };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return normalizeResult(extractJson(content));
  } catch (err) {
    console.error("[whatsapp] agent failed", err);
    return { reply: FALLBACK_REPLY, action: "none", order: null, escalate_reason: null };
  }
}

/** Local keyword fallback if model misses escalation */
export function looksLikeHumanRequest(text: string): boolean {
  const t = text.toLowerCase();
  const keys = [
    "بغيت نهضر",
    "نهضر مع شي حد",
    "خدمة الزبناء",
    "مسؤول",
    "humain",
    "human",
    "agent",
    "موظف",
    "شكاية",
    "مشكلة ف الطلب",
  ];
  return keys.some((k) => t.includes(k));
}

export function looksLikeResumeBot(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes("رجع البوت") || t.includes("رد تلقائي") || t.includes("رجع الرد");
}
