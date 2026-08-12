import { getCloudflareEnv } from "@/lib/cloudflare-env";
import type { PendingSubmission } from "@/lib/form-submission";

export type RejectedSubmission = PendingSubmission & { rejectedAt: string };

const KV_KEY = "rejected-submissions";

function isRejected(value: unknown): value is RejectedSubmission {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.postLink === "string" &&
    typeof n.createdAt === "string" &&
    typeof n.rejectedAt === "string"
  );
}

/** Every rejected submission ever, newest first — kept permanently so a rejection can be double-checked later against exactly what was on the form. */
export async function readRejectedSubmissions(): Promise<RejectedSubmission[]> {
  const { HHGOA_KV } = getCloudflareEnv();
  const raw = await HHGOA_KV.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRejected);
  } catch {
    return [];
  }
}

async function writeRejectedSubmissions(entries: RejectedSubmission[]): Promise<void> {
  const { HHGOA_KV } = getCloudflareEnv();
  await HHGOA_KV.put(KV_KEY, JSON.stringify(entries));
}

/** Archives a pending submission's full details at the moment it's rejected — called from rejectPendingSubmission, not directly. */
export async function addRejectedSubmission(submission: PendingSubmission): Promise<RejectedSubmission[]> {
  const current = await readRejectedSubmissions();
  const entry: RejectedSubmission = { ...submission, rejectedAt: new Date().toISOString() };
  const next = [entry, ...current];
  await writeRejectedSubmissions(next);
  return next;
}
