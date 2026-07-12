import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export interface WhatsAppRuntimeStatus {
  lastWebhookAt: string | null;
  lastInboundAt: string | null;
  lastInboundFrom: string | null;
  lastInboundPreview: string | null;
  lastSendOk: boolean | null;
  lastSendError: string | null;
  lastSignatureOk: boolean | null;
  lastError: string | null;
}

const EMPTY: WhatsAppRuntimeStatus = {
  lastWebhookAt: null,
  lastInboundAt: null,
  lastInboundFrom: null,
  lastInboundPreview: null,
  lastSendOk: null,
  lastSendError: null,
  lastSignatureOk: null,
  lastError: null,
};

function statusPath(): string {
  return (
    process.env.WHATSAPP_STATUS_FILE?.trim() ||
    path.join(process.cwd(), "data", "whatsapp-status.json")
  );
}

export function readWhatsAppStatus(): WhatsAppRuntimeStatus {
  try {
    const file = statusPath();
    if (!existsSync(file)) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(readFileSync(file, "utf8")) as WhatsAppRuntimeStatus) };
  } catch {
    return { ...EMPTY };
  }
}

export function patchWhatsAppStatus(patch: Partial<WhatsAppRuntimeStatus>): void {
  try {
    const next = { ...readWhatsAppStatus(), ...patch };
    const file = statusPath();
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(next, null, 2), "utf8");
  } catch (err) {
    console.error("[whatsapp] status write failed", err);
  }
}
