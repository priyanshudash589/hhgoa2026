import { randomUUID } from "node:crypto";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import type { ParticipationEntry } from "@/lib/task-participation";

const KV_KEY = "task-participation";

function isEntry(value: unknown): value is ParticipationEntry {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.name === "string" &&
    typeof n.email === "string" &&
    typeof n.createdAt === "string" &&
    (n.teamOrHandle === null || typeof n.teamOrHandle === "string")
  );
}

export async function readParticipation(): Promise<ParticipationEntry[]> {
  const { HHGOA_KV } = getCloudflareEnv();
  const raw = await HHGOA_KV.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

async function writeParticipation(entries: ParticipationEntry[]): Promise<void> {
  const { HHGOA_KV } = getCloudflareEnv();
  await HHGOA_KV.put(KV_KEY, JSON.stringify(entries));
}

export async function addParticipation(input: {
  name: string;
  email: string;
  teamOrHandle: string | null;
}): Promise<ParticipationEntry[]> {
  const current = await readParticipation();
  const entry: ParticipationEntry = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
  const next = [entry, ...current];
  await writeParticipation(next);
  return next;
}

export async function removeParticipation(id: string): Promise<ParticipationEntry[]> {
  const current = await readParticipation();
  const next = current.filter((e) => e.id !== id);
  await writeParticipation(next);
  return next;
}
