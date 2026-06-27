function backendBaseUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    process.env.API_BASE_URL ||
    ""
  ).replace(/\/$/, "");
}

export async function tryBackendRequest(
  path: string,
  init: RequestInit,
): Promise<Response | null> {
  const base = backendBaseUrl();
  if (!base) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.status >= 500) return null;

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        ...(res.headers.get("www-authenticate")
          ? { "WWW-Authenticate": res.headers.get("www-authenticate")! }
          : {}),
      },
    });
  } catch {
    /* fall through to local handler */
  }

  return null;
}
