import { randomUUID } from "node:crypto";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import type { PendingSubmission, ParsedFormPayload } from "@/lib/form-submission";
import { addLeaderboardEntry } from "@/lib/leaderboard-store";
import { addParticipation } from "@/lib/task-participation-store";
import { addRejectedSubmission } from "@/lib/rejected-submission-store";
import { normalizeXHandle, fetchSubmissionMetrics } from "@/lib/form-submission";

const KV_KEY = "pending-submissions";

function isPending(value: unknown): value is PendingSubmission {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return typeof n.id === "string" && typeof n.postLink === "string" && typeof n.createdAt === "string";
}

export async function readPendingSubmissions(): Promise<PendingSubmission[]> {
  const { HHGOA_KV } = getCloudflareEnv();
  const raw = await HHGOA_KV.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPending);
  } catch {
    return [];
  }
}

async function writePendingSubmissions(entries: PendingSubmission[]): Promise<void> {
  const { HHGOA_KV } = getCloudflareEnv();
  await HHGOA_KV.put(KV_KEY, JSON.stringify(entries));
}

async function addPendingSubmission(
  input: Omit<PendingSubmission, "id" | "createdAt">,
): Promise<PendingSubmission[]> {
  const current = await readPendingSubmissions();
  const entry: PendingSubmission = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
  // Newest first.
  const next = [entry, ...current];
  await writePendingSubmissions(next);
  return next;
}

/** Fetches and scores a freshly-parsed form payload, then adds it to the pending queue. */
export async function addPendingSubmissionFromPayload(payload: ParsedFormPayload): Promise<PendingSubmission[]> {
  const scored = await fetchSubmissionMetrics(payload.postLink);
  return addPendingSubmission({ ...payload, ...scored });
}

/**
 * Rejects a pending submission — archives its full details (exactly what
 * was on the form) into the rejected-submissions log before removing it
 * from the queue, so a rejection can be double-checked later instead of
 * just vanishing.
 */
export async function rejectPendingSubmission(id: string): Promise<PendingSubmission[]> {
  const current = await readPendingSubmissions();
  const submission = current.find((e) => e.id === id);
  if (submission) {
    await addRejectedSubmission(submission);
  }

  const next = current.filter((e) => e.id !== id);
  await writePendingSubmissions(next);
  return next;
}

/**
 * Re-fetches a pending submission's post from X and recomputes its score,
 * views, and hashtag check from the fresh data — likes/reposts/views keep
 * climbing after the form is submitted, so the numbers seen at submit time
 * are often stale by the time someone gets around to reviewing the queue.
 * Doesn't touch approval state; just refreshes what's shown.
 */
export async function refetchPendingSubmissionMetrics(id: string): Promise<PendingSubmission[]> {
  const current = await readPendingSubmissions();
  const submission = current.find((e) => e.id === id);
  if (!submission) return current;

  const fresh = await fetchSubmissionMetrics(submission.postLink);

  const next = current.map((e) => (e.id === id ? { ...e, ...fresh } : e));
  await writePendingSubmissions(next);
  return next;
}

/**
 * Approves a pending submission: adds it to the public leaderboard AND to
 * Confirmed Participants (actually completing Task #1, verified by a real
 * post, is a stronger signal than just clicking "Confirm Participation" on
 * the site — so an approval counts as both), then removes it from the queue.
 */
export async function approvePendingSubmission(id: string): Promise<PendingSubmission[]> {
  const current = await readPendingSubmissions();
  const submission = current.find((e) => e.id === id);
  if (!submission) return current;

  const primaryMember = submission.members.find((m) => m.xHandle);
  const primaryEmail = submission.members.find((m) => m.email)?.email ?? "";
  const name = submission.teamName || submission.submitterName || "Unnamed team";
  const socialLink = primaryMember ? normalizeXHandle(primaryMember.xHandle) : submission.postLink;

  await addLeaderboardEntry({
    name,
    socialLink,
    postLink: submission.postLink,
    views: submission.metrics?.views ?? 0,
    score: submission.score ?? 0,
  });

  await addParticipation({
    name,
    email: primaryEmail,
    teamOrHandle: primaryMember ? primaryMember.xHandle : null,
  });

  const next = current.filter((e) => e.id !== id);
  await writePendingSubmissions(next);
  return next;
}
