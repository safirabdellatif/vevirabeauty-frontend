import { NextRequest } from "next/server";
import { tryBackendRequest } from "@/lib/server/backend-fetch";
import {
  handleLocalRedirectAdmin,
  redirectAdminConfigured,
} from "@/lib/server/redirect-admin-handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(req: NextRequest, pathParts: string[]) {
  const search = req.nextUrl.search || "";
  const path = `/redirect-admin/${pathParts.join("/")}${search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  const bodyText =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  // Frontend credentials take priority — backend API is often unavailable.
  if (redirectAdminConfigured()) {
    return handleLocalRedirectAdmin(req, pathParts, bodyText);
  }

  const proxied = await tryBackendRequest(path, {
    method: req.method,
    headers,
    body: bodyText,
  });
  if (proxied) return proxied;

  return handleLocalRedirectAdmin(req, pathParts, bodyText);
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}
