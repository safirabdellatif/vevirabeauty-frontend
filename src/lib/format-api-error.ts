/** Parse API error bodies into a human-readable string. */
export function formatApiDetail(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;

  const record = body as { detail?: unknown; message?: unknown };
  const detail = record.detail ?? record.message;

  if (typeof detail === "string" && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg?: unknown }).msg ?? "");
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }

  if (detail && typeof detail === "object") {
    const obj = detail as { message?: unknown; code?: unknown };
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    if (typeof obj.code === "string" && obj.code.trim()) return obj.code;
  }

  return fallback;
}
