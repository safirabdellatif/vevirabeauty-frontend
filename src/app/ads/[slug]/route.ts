import { NextRequest, NextResponse } from "next/server";
import { resolveEnvSlug } from "@/lib/ad-redirect-slugs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { slug: string };

async function readSlug(params: Promise<RouteParams> | RouteParams): Promise<string> {
  const resolved = await Promise.resolve(params);
  return (resolved.slug ?? "").trim().toLowerCase();
}

function publicOrigin(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
}

function redirectToPath(
  request: NextRequest,
  targetPath: string,
): NextResponse {
  const trimmed = targetPath.trim();
  let destination: URL;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    destination = new URL(trimmed);
  } else {
    const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    destination = new URL(path, publicOrigin(request));
  }

  request.nextUrl.searchParams.forEach((value, key) => {
    destination.searchParams.set(key, value);
  });

  return NextResponse.redirect(destination, 302);
}

function notFoundResponse(slug: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>رابط غير موجود</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #071615; color: #fff; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { max-width: 520px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 24px; padding: 32px; }
    h1 { margin: 0 0 12px; font-size: 1.5rem; }
    p { margin: 0 0 10px; color: rgba(255,255,255,.75); line-height: 1.6; }
    code { background: rgba(0,0,0,.25); padding: 2px 8px; border-radius: 8px; }
    a { color: #7dd3c0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>رابط الإعلان غير موجود</h1>
    <p>الـ slug <code>${slug}</code> غير مسجّل.</p>
    <p>أنشئه من <a href="/redirectvevira">/redirectvevira</a></p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function resolveTargetPath(slug: string): Promise<string | null> {
  const envTarget = resolveEnvSlug(slug);
  if (envTarget) return envTarget;

  try {
    const { resolvePublicAdRedirect } = await import("@/lib/server/ad-redirects");
    return await resolvePublicAdRedirect(slug);
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> | RouteParams },
) {
  try {
    const slug = await readSlug(context.params);
    if (!slug) return notFoundResponse("");

    const targetPath = await resolveTargetPath(slug);
    if (!targetPath) return notFoundResponse(slug);

    return redirectToPath(request, targetPath);
  } catch {
    return NextResponse.json({ detail: "redirect_failed" }, { status: 500 });
  }
}
