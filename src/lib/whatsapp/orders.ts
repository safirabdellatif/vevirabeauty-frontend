import { PRODUCTS, type ProductId } from "@/content/products";
import { handleCreateOrder, type CreateOrderBody } from "@/lib/server/create-order";
import { normalizeCreateOrderResult } from "@/lib/normalize-order-response";
import { resolveProductId } from "@/lib/whatsapp/catalog";
import type { AgentOrderDraft, ReplyLang } from "@/lib/whatsapp/agent";
import { detectReplyLang } from "@/lib/whatsapp/agent";

export interface WhatsAppOrderResult {
  ok: boolean;
  message: string;
  orderNumber?: string;
}

export async function createOrderFromWhatsApp(
  draft: AgentOrderDraft,
  waId: string,
  langHint?: ReplyLang,
): Promise<WhatsAppOrderResult> {
  const productId = resolveProductId(String(draft.product_id));
  const lang = langHint ?? detectReplyLang(draft.name || "");
  if (!productId) {
    return {
      ok: false,
      message:
        lang === "fr"
          ? "Je n’ai pas pu identifier le produit. Dites : huile articulations, spray cheveux, ou crème mélasma."
          : "ماقدرتش نحدد المنتج. قولي: زيت المفاصل، رشاش الشعر، ولا كريم الكلف.",
    };
  }

  const quantity = draft.quantity === 1 || draft.quantity === 3 ? draft.quantity : 2;
  const product = PRODUCTS[productId as ProductId];
  const phone = draft.phone?.trim() || waId;

  const body: CreateOrderBody = {
    customer: {
      name: draft.name.trim(),
      phone,
    },
    cart: {
      items: [
        {
          product_id: productId,
          product_name: product.nameAr,
          quantity,
          offer_label: `${quantity} قطع`,
          source: "whatsapp",
        },
      ],
      currency: "MAD",
    },
    attribution: {
      landing_page: `https://vevirabeauty.com/products/${product.slug}`,
      referrer: "whatsapp",
      source: "whatsapp_bot",
      city: draft.city ?? "",
      wa_id: waId,
    },
    analytics: {
      event_id: `wa-${waId}-${Date.now()}`,
      session_id: `wa-${waId}`,
      user_agent: "whatsapp-cloud-api",
    },
  };

  try {
    const response = await handleCreateOrder(body);
    const json = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const detail = json.detail as { message?: string } | string | undefined;
      const msg =
        typeof detail === "string"
          ? detail
          : detail?.message ||
            (lang === "fr"
              ? "Impossible d’enregistrer la commande. Vérifiez le nom et un numéro 06/07."
              : "ماقدرتش نسجّل الطلب. تأكد من الاسم ورقم 06/07.");
      return { ok: false, message: msg };
    }

    const order = normalizeCreateOrderResult(json);
    return {
      ok: true,
      orderNumber: order.orderNumber,
      message:
        lang === "fr"
          ? `Commande ${order.orderNumber} enregistrée ✅ Total ${order.total} MAD. On vous appelle bientôt pour confirmer l’adresse. Merci 💚`
          : `تم تسجيل طلبك رقم ${order.orderNumber} ✅ المجموع ${order.total} درهم. غادي نتصلو بيك باش نأكدو العنوان. شكراً ليك 💚`,
    };
  } catch (err) {
    console.error("[whatsapp] create order failed", err);
    return {
      ok: false,
      message:
        lang === "fr"
          ? "Erreur temporaire lors de l’enregistrement. Réessayez plus tard ou commandez sur le site."
          : "صار خطأ مؤقت فتسجيل الطلب. عاود من بعد شوية ولا طلب من الموقع.",
    };
  }
}
