import { buildCatalogPromptBlock } from "@/lib/whatsapp/catalog";
import { getOpenAiConfig, siteUrl, supportEmail } from "@/lib/whatsapp/config";
import type { ChatMessage } from "@/lib/whatsapp/memory";
import type { ProductId } from "@/content/products";

export type AgentAction = "none" | "create_order" | "escalate";
export type ReplyLang = "fr" | "darija";

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
  lang: ReplyLang;
}

const FALLBACK_FR =
  "Désolé, je n’ai pas pu répondre maintenant. Écrivez-nous sur https://vevirabeauty.com ou renvoyez votre message dans un instant. Merci 💚";
const FALLBACK_DAR =
  "وعلاش ماقدرتش نجاوب دابا. كتبي لينا ف الموقع https://vevirabeauty.com ولا عاودي الرسالة من بعد شوية. شكراً 💚";

/** Heuristic: French if Latin letters dominate; else Darija/Arabic */
export function detectReplyLang(text: string, history: ChatMessage[] = []): ReplyLang {
  const sample = `${history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ")}\n${text}`;
  const latin = (sample.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const arabic = (sample.match(/[\u0600-\u06FF]/g) || []).length;
  if (latin > arabic && latin >= 3) return "fr";
  return "darija";
}

function fallbackReply(lang: ReplyLang): string {
  return lang === "fr" ? FALLBACK_FR : FALLBACK_DAR;
}

function systemPrompt(): string {
  const catalog = buildCatalogPromptBlock();
  return `Tu es l’agent commercial WhatsApp de Vevira Beauty (فيرا بيوتي) au Maroc.
Tu vends avec un ton chaleureux, court et clair.

LANGUE (OBLIGATOIRE):
- Réponds dans la MÊME langue que le client.
- S’il écrit en français → réponds en français.
- S’il écrit en darija / arabe (حروف عربية) → réponds en darija marocaine.
- S’il mélange → suis la langue dominante du dernier message.
- Ne force JAMAIS la darija si le client parle français (et inversement).

${catalog}

Règles de vente:
1. Push fort sur l’offre 2 pièces à 289 MAD (la plus demandée).
2. Si on demande un produit: donne le lien du catalogue + prix.
3. Paiement à la livraison (COD), livraison toutes villes du Maroc, garantie 30 jours.
4. Pas de promesses médicales. Dis que les résultats varient.
5. Si commande dans le chat, collecte: nom complet, tel 06/07, ville, product_id, quantité 1|2|3.
6. action=create_order seulement si nom + téléphone valide + product_id + quantité, ET confirmation client (oui / ok / أكد / صافي / je confirme).
7. Si demande un humain / réclamation complexe → action=escalate.
8. Si "رجع البوت" / "reprends le bot" / "retour bot" → répondre normalement, action=none.
9. "reply" = texte WhatsApp court (sans JSON dedans).
10. Site: ${siteUrl()} — email: ${supportEmail()}

Réponds TOUJOURS en JSON uniquement:
{
  "reply": "texte client (FR ou darija selon le client)",
  "lang": "fr" | "darija",
  "action": "none" | "create_order" | "escalate",
  "order": null ou {
    "name": "...",
    "phone": "06...",
    "city": "...",
    "product_id": "joint_pain_oil" | "hair_loss_spray" | "melasma_cream",
    "quantity": 1 | 2 | 3
  },
  "escalate_reason": null ou "raison courte"
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

function normalizeResult(raw: unknown, fallbackLang: ReplyLang): AgentResult {
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

  const langRaw = String(row.lang ?? fallbackLang);
  const lang: ReplyLang = langRaw === "fr" ? "fr" : "darija";
  const reply = String(row.reply ?? "").trim() || fallbackReply(lang);

  return {
    reply,
    action,
    order,
    escalate_reason: row.escalate_reason ? String(row.escalate_reason) : null,
    lang,
  };
}

export async function runSalesAgent(
  history: ChatMessage[],
  userText: string,
): Promise<AgentResult> {
  const lang = detectReplyLang(userText, history);
  const { apiKey, model } = getOpenAiConfig();
  if (!apiKey) {
    return {
      reply:
        lang === "fr"
          ? "Bienvenue chez Vevira Beauty 💚 Voir produits et prix: https://vevirabeauty.com/products — paiement à la livraison."
          : "مرحبا بيك ف فيرا بيوتي 💚 شوف المنتجات والأسعار هنا: https://vevirabeauty.com/products — الدفع عند الاستلام.",
      action: "none",
      order: null,
      escalate_reason: null,
      lang,
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
      return {
        reply: fallbackReply(lang),
        action: "none",
        order: null,
        escalate_reason: null,
        lang,
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return normalizeResult(extractJson(content), lang);
  } catch (err) {
    console.error("[whatsapp] agent failed", err);
    return {
      reply: fallbackReply(lang),
      action: "none",
      order: null,
      escalate_reason: null,
      lang,
    };
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
    "parler à quelqu",
    "conseiller",
    "réclamation",
    "reclamation",
  ];
  return keys.some((k) => t.includes(k));
}

export function looksLikeResumeBot(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("رجع البوت") ||
    t.includes("رد تلقائي") ||
    t.includes("رجع الرد") ||
    t.includes("reprends le bot") ||
    t.includes("retour bot") ||
    t.includes("reactive le bot") ||
    t.includes("réactive le bot")
  );
}
