import { NextRequest, NextResponse } from "next/server";
import { resolveEnvSlug } from "@/lib/ad-redirect-slugs";

function redirectForSlug(request: NextRequest, slug: string): NextResponse | null {
  const target = resolveEnvSlug(slug);
  if (!target) return null;

  let destination: URL;
  if (target.startsWith("http://") || target.startsWith("https://")) {
    destination = new URL(target);
  } else {
    const path = target.startsWith("/") ? target : `/${target}`;
    destination = new URL(path, request.url);
  }

  request.nextUrl.searchParams.forEach((value, key) => {
    destination.searchParams.set(key, value);
  });

  return NextResponse.redirect(destination, 302);
}

export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/ads\/([a-z0-9-]+)\/?$/i);
  if (!match) return NextResponse.next();
  return redirectForSlug(request, match[1]) ?? NextResponse.next();
}

export const config = {
  matcher: ["/ads/:path*"],
};
