import { NextRequest, NextResponse } from "next/server";
import { resolveEnvSlug } from "@/lib/ad-redirect-slugs";

export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/ads\/([a-z0-9-]+)\/?$/i);
  if (!match) return NextResponse.next();

  const target = resolveEnvSlug(match[1]);
  if (!target) return NextResponse.next();

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

export const config = {
  matcher: ["/ads/:slug*"],
};
