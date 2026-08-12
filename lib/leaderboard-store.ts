import { randomUUID } from "node:crypto";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { computeEngagementScore, manualEntryFallbackScore } from "@/lib/leaderboard-score";
import { getPostMetricsFromInput, PostLookupError } from "@/lib/x-post-metrics";
import { detectSpike, detectSuspiciousRatio, type MetricsSnapshot } from "@/lib/bot-detection";

const KV_KEY = "leaderboard";

function isEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.name === "string" &&
    typeof n.socialLink === "string" &&
    typeof n.postLink === "string" &&
    typeof n.views === "number" &&
    typeof n.score === "number" &&
    typeof n.createdAt === "string"
  );
}

function sortByScoreDesc(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score);
}

export async function readLeaderboard(): Promise<LeaderboardEntry[]> {
  const { HHGOA_KV } = getCloudflareEnv();
  const raw = await HHGOA_KV.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid = parsed.filter(isEntry) as Array<LeaderboardEntry & { rawScore?: unknown }>;
    const hasStrayRawScore = valid.some((e) => "rawScore" in e);

    if (hasStrayRawScore) {
      // A short-lived rawScore-based formula briefly touched some entries.
      // That field (and whatever `score` was relative to that formula's
      // board) means nothing under this formula — strip it and recompute
      // score straight from views. The real per-post like/retweet/etc.
      // breakdown was never persisted past approval in any version of this
      // schema (LeaderboardEntry only ever stored a single derived number),
      // so this is the best available number, not a loss caused by rolling
      // back.
      const cleaned = valid.map((e): LeaderboardEntry => {
        const { rawScore: _rawScore, ...rest } = e;
        return { ...rest, score: manualEntryFallbackScore() };
      });
      const next = sortByScoreDesc(cleaned);
      await writeLeaderboard(next);
      return next;
    }

    return sortByScoreDesc(valid);
  } catch {
    return [];
  }
}

export async function readTopLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const all = await readLeaderboard();
  return all.slice(0, limit);
}

async function writeLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  const { HHGOA_KV } = getCloudflareEnv();
  await HHGOA_KV.put(KV_KEY, JSON.stringify(entries));
}

export async function addLeaderboardEntry(input: {
  name: string;
  socialLink: string;
  postLink: string;
  views: number;
  score: number;
}): Promise<LeaderboardEntry[]> {
  const current = await readLeaderboard();
  const entry: LeaderboardEntry = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
  const next = sortByScoreDesc([...current, entry]);
  await writeLeaderboard(next);
  return next;
}

/**
 * Updates only the displayed view count. Score no longer factors in views
 * at all (see lib/leaderboard-score.ts), so this must NOT touch `score` —
 * an entry could well have a real engagement-based score from a fetched
 * post, and correcting its view count here shouldn't wipe that out.
 */
export async function updateLeaderboardViews(id: string, views: number): Promise<LeaderboardEntry[]> {
  const current = await readLeaderboard();
  const next = sortByScoreDesc(current.map((e) => (e.id === id ? { ...e, views } : e)));
  await writeLeaderboard(next);
  return next;
}

export async function removeLeaderboardEntry(id: string): Promise<LeaderboardEntry[]> {
  const current = await readLeaderboard();
  const next = current.filter((e) => e.id !== id);
  await writeLeaderboard(next);
  return next;
}

/** Clears an entry's bot-boost flag once an admin has reviewed it — doesn't affect score/views, and a future spike/ratio check can re-flag it. */
export async function dismissLeaderboardBotFlag(id: string): Promise<LeaderboardEntry[]> {
  const current = await readLeaderboard();
  const next = current.map((e) => (e.id === id ? { ...e, botFlag: null } : e));
  await writeLeaderboard(next);
  return next;
}

export type RefetchAllResult = {
  entries: LeaderboardEntry[];
  refetched: number;
  failures: Array<{ id: string; name: string; reason: string }>;
};

/**
 * Re-fetches every already-approved leaderboard entry's post from X and
 * recomputes its score with the full engagement formula — likes/reposts/
 * views keep climbing after approval, so this is the same idea as the
 * pending-queue "Refetch Score" button, just applied to the whole public
 * board at once. Entries whose postLink isn't a fetchable X post (manual
 * LinkedIn entries, a since-deleted tweet, etc.) are left exactly as they
 * were — one bad link shouldn't block everyone else's refresh.
 *
 * This is also the bot/boost monitor: it's the thing already fetching
 * fresh metrics for every entry every hour, so it's the natural place to
 * compare against the last snapshot and flag a sudden spike — no separate
 * job needed. See lib/bot-detection.ts for what actually trips a flag.
 */
export async function refetchAllLeaderboardMetrics(): Promise<RefetchAllResult> {
  const current = await readLeaderboard();
  let refetched = 0;
  const failures: RefetchAllResult["failures"] = [];

  const updated = await Promise.all(
    current.map(async (entry) => {
      try {
        const metrics = await getPostMetricsFromInput(entry.postLink);
        const score = computeEngagementScore({
          likes: metrics.likes,
          retweets: metrics.retweets,
          replies: metrics.replies,
          quotes: metrics.quotes,
          bookmarks: metrics.bookmarks,
          views: metrics.views,
        });
        refetched += 1;

        const snapshot: MetricsSnapshot = {
          likes: metrics.likes,
          retweets: metrics.retweets,
          replies: metrics.replies,
          quotes: metrics.quotes,
          bookmarks: metrics.bookmarks,
          views: metrics.views,
        };
        // A spike needs a previous snapshot to compare against — an entry's
        // very first refetch after this feature shipped (or its first ever
        // refetch) just establishes the baseline, it can't trip this yet.
        const spikeReason = entry.lastMetrics ? detectSpike(entry.lastMetrics, snapshot) : null;
        const ratioReason = detectSuspiciousRatio(snapshot);
        const newReason = [spikeReason, ratioReason].filter(Boolean).join(" ");
        // Sticky: only ever *set* a flag here, never auto-clear one — a
        // one-time boost shouldn't quietly vanish next hour before an admin
        // sees it. Dismissing is a separate, explicit admin action.
        const botFlag = newReason ? { reason: newReason, flaggedAt: new Date().toISOString() } : entry.botFlag;

        return { ...entry, views: metrics.views ?? entry.views, score, lastMetrics: snapshot, botFlag };
      } catch (error) {
        // Left unchanged — most commonly a LinkedIn link (fxtwitter only
        // knows about X) or a manual entry with no real post at all.
        const reason = error instanceof PostLookupError ? error.message : "Could not fetch post metrics.";
        failures.push({ id: entry.id, name: entry.name, reason });
        return entry;
      }
    }),
  );

  const next = sortByScoreDesc(updated);
  await writeLeaderboard(next);
  return { entries: next, refetched, failures };
}
