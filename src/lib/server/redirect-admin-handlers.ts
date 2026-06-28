import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { getEnvSlugMap } from "@/lib/ad-redirect-slugs";
import {
  clearAllAdRedirects,
  createAdRedirect,
  deleteAdRedirect,
  listAdRedirects,
  updateAdRedirect,
} from "@/lib/server/ad-redirects";

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function redirectAdminConfigured(): boolean {
  return Boolean(
    process.env.REDIRECT_ADMIN_USERNAME?.trim() &&
      process.env.REDIRECT_ADMIN_PASSWORD?.trim(),
  );
}

export function verifyRedirectAdmin(req: NextRequest): boolean {
  const expectedUser = (process.env.REDIRECT_ADMIN_USERNAME ?? "").trim();
  const expectedPass = (process.env.REDIRECT_ADMIN_PASSWORD ?? "").trim();
  if (!expectedUser || !expectedPass) return false;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}

function unauthorized(): Response {
  return Response.json(
    {
      detail:
        "Invalid redirect admin credentials. Check REDIRECT_ADMIN_USERNAME/PASSWORD in Easypanel Environment, then logout and sign in again.",
    },
    { status: 401, headers: { "WWW-Authenticate": "Basic" } },
  );
}

function notConfigured(): Response {
  return Response.json(
    { detail: "Redirect admin credentials are not configured" },
    { status: 503 },
  );
}

function badRequest(message: string): Response {
  return Response.json({ detail: message }, { status: 400 });
}

export async function handleLocalRedirectAdmin(
  req: NextRequest,
  pathParts: string[],
  bodyText?: string,
): Promise<Response> {
  if (!redirectAdminConfigured()) return notConfigured();
  if (!verifyRedirectAdmin(req)) return unauthorized();

  const resource = pathParts[0];
  const slug = pathParts[1];

  if (resource !== "redirects") {
    return Response.json({ detail: "Not found" }, { status: 404 });
  }

  if (req.method === "GET" && pathParts.length === 1) {
    const rows = await listAdRedirects();
    return Response.json(rows);
  }

  if (req.method === "POST" && pathParts.length === 1) {
    let body: { slug?: string; target_path?: string; label?: string };
    try {
      body = JSON.parse(bodyText ?? "{}") as typeof body;
    } catch {
      return badRequest("Invalid JSON body.");
    }

    try {
      const row = await createAdRedirect(body.slug ?? "", body.target_path ?? "", body.label ?? "");
      return Response.json(row, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === "duplicate_slug") {
        return Response.json({ detail: "Slug already exists." }, { status: 409 });
      }
      if (error instanceof Error && error.message === "builtin_slug") {
        return Response.json(
          { detail: "Ce slug existe déjà dans AD_REDIRECTS_JSON (Easypanel)." },
          { status: 409 },
        );
      }
      return badRequest("Invalid slug or target path.");
    }
  }

  if (req.method === "PUT" && pathParts.length === 2) {
    let body: { target_path?: string; label?: string; is_active?: boolean };
    try {
      body = JSON.parse(bodyText ?? "{}") as typeof body;
    } catch {
      return badRequest("Invalid JSON body.");
    }

    try {
      const row = await updateAdRedirect(slug, {
        target_path: body.target_path ?? "",
        label: body.label,
        is_active: body.is_active,
      });
      if (!row) return Response.json({ detail: "Redirect not found." }, { status: 404 });
      return Response.json(row);
    } catch {
      return badRequest("Invalid target path.");
    }
  }

  if (req.method === "DELETE" && pathParts.length === 2 && slug === "_clear") {
    const count = await clearAllAdRedirects();
    return Response.json({ ok: true, deleted: count });
  }

  if (req.method === "DELETE" && pathParts.length === 2) {
    const normalized = slug?.trim().toLowerCase() ?? "";
    if (normalized && normalized in getEnvSlugMap()) {
      return Response.json(
        { detail: "Slug défini dans AD_REDIRECTS_JSON (Easypanel) — supprimez-le dans Environment." },
        { status: 403 },
      );
    }
    const deleted = await deleteAdRedirect(slug);
    if (!deleted) return Response.json({ detail: "Redirect not found." }, { status: 404 });
    return Response.json({ ok: true });
  }

  return Response.json({ detail: "Not found" }, { status: 404 });
}
