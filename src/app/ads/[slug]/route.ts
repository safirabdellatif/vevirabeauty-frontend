import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function backendBaseUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

function publicSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/$/, "");
}

function redirectToPath(targetPath: string, searchParams: URLSearchParams): NextResponse {
  const path = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  const destination = new URL(path, publicSiteOrigin());
  searchParams.forEach((value, key) => destination.searchParams.set(key, value));
  return NextResponse.redirect(destination, 302);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug.trim().toLowerCase();
  const lookup = await fetch(`${backendBaseUrl()}/redirects/public/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (!lookup.ok) {
    return redirectToPath("/", request.nextUrl.searchParams);
  }

  const data = (await lookup.json()) as { target_path: string };
  return redirectToPath(data.target_path, request.nextUrl.searchParams);
}
