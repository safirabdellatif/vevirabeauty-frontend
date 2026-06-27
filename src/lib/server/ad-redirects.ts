import fs from "fs/promises";
import path from "path";
import { getEnvSlugMap } from "@/lib/ad-redirect-slugs";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export type AdRedirect = {
  slug: string;
  target_path: string;
  label: string;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
};

function dataFilePath(): string {
  if (process.env.AD_REDIRECTS_FILE) {
    return process.env.AD_REDIRECTS_FILE;
  }
  return path.join(process.cwd(), "data", "ad-redirects.json");
}

async function ensureStore(): Promise<void> {
  const file = dataFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]", "utf8");
  }
}

async function readFileRows(): Promise<AdRedirect[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFilePath(), "utf8");
  const parsed = JSON.parse(raw) as AdRedirect[];
  return Array.isArray(parsed) ? parsed : [];
}

function readEnvRows(): AdRedirect[] {
  const stamp = nowIso();
  return Object.entries(getEnvSlugMap()).flatMap(([slugInput, targetInput]) => {
    const slug = normalizeSlug(slugInput);
    const target_path = normalizeTargetPath(String(targetInput));
    if (!slug || !target_path) return [];
    return [
      {
        slug,
        target_path,
        label: "env",
        is_active: true,
        click_count: 0,
        created_at: stamp,
        updated_at: stamp,
      },
    ];
  });
}

async function readAll(): Promise<AdRedirect[]> {
  const merged = new Map<string, AdRedirect>();
  for (const row of readEnvRows()) merged.set(row.slug, row);
  for (const row of await readFileRows()) merged.set(row.slug, row);
  return [...merged.values()];
}

async function writeAll(rows: AdRedirect[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(dataFilePath(), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeSlug(value: string): string | null {
  const slug = value.trim().toLowerCase();
  return SLUG_RE.test(slug) ? slug : null;
}

export function normalizeTargetPath(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//") || trimmed.includes("://")) return null;
  return trimmed;
}

export async function listAdRedirects(): Promise<AdRedirect[]> {
  const rows = await readAll();
  return rows.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getAdRedirect(slug: string): Promise<AdRedirect | null> {
  const rows = await readAll();
  return rows.find((row) => row.slug === slug) ?? null;
}

export async function createAdRedirect(
  slugInput: string,
  targetPathInput: string,
  label = "",
): Promise<AdRedirect> {
  const slug = normalizeSlug(slugInput);
  const target_path = normalizeTargetPath(targetPathInput);
  if (!slug) throw new Error("invalid_slug");
  if (!target_path) throw new Error("invalid_target_path");

  const rows = await readFileRows();
  if (rows.some((row) => row.slug === slug)) {
    throw new Error("duplicate_slug");
  }
  if (readEnvRows().some((row) => row.slug === slug)) {
    throw new Error("duplicate_slug");
  }

  const stamp = nowIso();
  const row: AdRedirect = {
    slug,
    target_path,
    label: label.trim(),
    is_active: true,
    click_count: 0,
    created_at: stamp,
    updated_at: stamp,
  };
  rows.push(row);
  await writeAll(rows);
  return row;
}

export async function updateAdRedirect(
  slugInput: string,
  input: { target_path: string; label?: string; is_active?: boolean },
): Promise<AdRedirect | null> {
  const slug = normalizeSlug(slugInput);
  const target_path = normalizeTargetPath(input.target_path);
  if (!slug || !target_path) throw new Error("invalid_input");

  const rows = await readFileRows();
  const index = rows.findIndex((row) => row.slug === slug);
  if (index === -1) return null;

  rows[index] = {
    ...rows[index],
    target_path,
    label: (input.label ?? rows[index].label).trim(),
    is_active: input.is_active ?? rows[index].is_active,
    updated_at: nowIso(),
  };
  await writeAll(rows);
  return rows[index];
}

export async function deleteAdRedirect(slugInput: string): Promise<boolean> {
  const slug = normalizeSlug(slugInput);
  if (!slug) return false;

  const rows = await readFileRows();
  const next = rows.filter((row) => row.slug !== slug);
  if (next.length === rows.length) return false;
  await writeAll(next);
  return true;
}

export async function resolvePublicAdRedirect(slugInput: string): Promise<string | null> {
  const slug = normalizeSlug(slugInput);
  if (!slug) return null;

  const envHit = readEnvRows().find((row) => row.slug === slug && row.is_active);
  if (envHit) return envHit.target_path;

  const rows = await readFileRows();
  const index = rows.findIndex((row) => row.slug === slug && row.is_active);
  if (index === -1) return null;

  rows[index] = {
    ...rows[index],
    click_count: rows[index].click_count + 1,
    updated_at: nowIso(),
  };
  await writeAll(rows);
  return rows[index].target_path;
}
