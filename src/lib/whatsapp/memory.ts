import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  at: string;
}

export interface WhatsAppSession {
  waId: string;
  messages: ChatMessage[];
  /** When set, bot stops auto-replies until this ISO timestamp */
  escalateUntil?: string | null;
  lastOrderNumber?: string | null;
  updatedAt: string;
}

const MAX_MESSAGES = 24;
const DEFAULT_ESCALATE_HOURS = 12;

function storePath(): string {
  return (
    process.env.WHATSAPP_SESSIONS_FILE?.trim() ||
    path.join(process.cwd(), "data", "whatsapp-sessions.json")
  );
}

type StoreFile = { sessions: Record<string, WhatsAppSession> };

function readStore(): StoreFile {
  const file = storePath();
  try {
    if (!existsSync(file)) return { sessions: {} };
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!parsed?.sessions || typeof parsed.sessions !== "object") return { sessions: {} };
    return parsed;
  } catch {
    return { sessions: {} };
  }
}

function writeStore(store: StoreFile): void {
  const file = storePath();
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("[whatsapp] failed to persist sessions", err);
  }
}

export function getSession(waId: string): WhatsAppSession {
  const id = waId.replace(/\D/g, "");
  const store = readStore();
  const existing = store.sessions[id];
  if (existing) return existing;
  return {
    waId: id,
    messages: [],
    escalateUntil: null,
    lastOrderNumber: null,
    updatedAt: new Date().toISOString(),
  };
}

export function saveSession(session: WhatsAppSession): void {
  const store = readStore();
  store.sessions[session.waId] = {
    ...session,
    messages: session.messages.slice(-MAX_MESSAGES),
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
}

export function appendMessage(waId: string, role: ChatRole, content: string): WhatsAppSession {
  const session = getSession(waId);
  session.messages.push({
    role,
    content,
    at: new Date().toISOString(),
  });
  saveSession(session);
  return session;
}

export function isEscalated(session: WhatsAppSession): boolean {
  if (!session.escalateUntil) return false;
  return new Date(session.escalateUntil).getTime() > Date.now();
}

export function markEscalated(waId: string, hours = DEFAULT_ESCALATE_HOURS): WhatsAppSession {
  const session = getSession(waId);
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  session.escalateUntil = until;
  saveSession(session);
  return session;
}

export function clearEscalation(waId: string): WhatsAppSession {
  const session = getSession(waId);
  session.escalateUntil = null;
  saveSession(session);
  return session;
}
