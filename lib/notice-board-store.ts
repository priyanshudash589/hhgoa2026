import { randomUUID } from "node:crypto";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import type { Notice } from "@/lib/notice-board";

const KV_KEY = "notice-board";

function isNotice(value: unknown): value is Notice {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.text === "string" &&
    typeof n.createdAt === "string" &&
    (n.linkLabel === null || typeof n.linkLabel === "string") &&
    (n.linkUrl === null || typeof n.linkUrl === "string")
  );
}

export async function readNotices(): Promise<Notice[]> {
  const { HHGOA_KV } = getCloudflareEnv();
  const raw = await HHGOA_KV.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNotice);
  } catch {
    return [];
  }
}

async function writeNotices(notices: Notice[]): Promise<void> {
  const { HHGOA_KV } = getCloudflareEnv();
  await HHGOA_KV.put(KV_KEY, JSON.stringify(notices));
}

export async function addNotice(input: {
  text: string;
  linkLabel: string | null;
  linkUrl: string | null;
}): Promise<Notice[]> {
  const current = await readNotices();
  const notice: Notice = {
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  // Newest first.
  const next = [notice, ...current];
  await writeNotices(next);
  return next;
}

export async function removeNotice(id: string): Promise<Notice[]> {
  const current = await readNotices();
  const next = current.filter((n) => n.id !== id);
  await writeNotices(next);
  return next;
}

export async function clearNotices(): Promise<Notice[]> {
  await writeNotices([]);
  return [];
}
