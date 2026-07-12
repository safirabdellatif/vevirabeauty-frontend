/** WhatsApp Cloud API + OpenAI env helpers */

export function getWhatsAppConfig() {
  return {
    token: process.env.WHATSAPP_TOKEN?.trim() || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN?.trim() || "",
    appSecret: process.env.WHATSAPP_APP_SECRET?.trim() || "",
    apiVersion: process.env.WHATSAPP_API_VERSION?.trim() || "v21.0",
  };
}

export function getOpenAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY?.trim() || "",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  };
}

export function isWhatsAppConfigured(): boolean {
  const c = getWhatsAppConfig();
  return Boolean(c.token && c.phoneNumberId && c.verifyToken);
}

export function supportEmail(): string {
  return process.env.WHATSAPP_ESCALATE_EMAIL?.trim() || "contact@vevirabeauty.com";
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://vevirabeauty.com").replace(/\/$/, "");
}
