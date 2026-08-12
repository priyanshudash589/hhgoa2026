import { getPostMetricsFromInput, PostLookupError, type PostMetrics } from "@/lib/x-post-metrics";
import { computeEngagementScore } from "@/lib/leaderboard-score";
import { detectSuspiciousRatio } from "@/lib/bot-detection";

export type TeamMember = {
  xHandle: string;
  email: string;
};

export type PendingSubmission = {
  id: string;
  submitterName: string;
  teamName: string;
  teamId: string;
  postLink: string;
  members: TeamMember[];
  metrics: PostMetrics | null;
  score: number | null;
  metricsError: string | null;
  // Whether the actual post's text contains #FrameInGoa — checked against
  // the real fetched post content, not anything self-reported on the form.
  // False (not just "unknown") when metrics couldn't be fetched at all,
  // since an unconfirmable post shouldn't read as confirmed.
  hashtagConfirmed: boolean;
  // Heuristic flag for a review — an implausible engagement ratio (likes
  // over views, retweet-farm signature, etc.) on this single fetch. Null
  // means nothing looked off, not "confirmed clean" — see lib/bot-detection.ts.
  botFlagReason: string | null;
  createdAt: string;
};

const REQUIRED_HASHTAG = "#frameingoa";

/** Checks a post's actual text for the required hashtag (case-insensitive). */
export function textContainsRequiredHashtag(text: string): boolean {
  return text.toLowerCase().replace(/\s+/g, "").includes(REQUIRED_HASHTAG);
}

export type FetchedSubmissionMetrics = {
  metrics: PostMetrics | null;
  score: number | null;
  metricsError: string | null;
  hashtagConfirmed: boolean;
  botFlagReason: string | null;
};

/**
 * Fetches a post's live metrics, scores them, checks the hashtag, and
 * screens for an implausible engagement ratio — the single source of truth
 * for both a fresh form submission and an admin re-fetch later on, so the
 * two paths can never drift out of sync.
 */
export async function fetchSubmissionMetrics(postLink: string): Promise<FetchedSubmissionMetrics> {
  try {
    const metrics = await getPostMetricsFromInput(postLink);
    const score = computeEngagementScore({
      likes: metrics.likes,
      retweets: metrics.retweets,
      replies: metrics.replies,
      quotes: metrics.quotes,
      bookmarks: metrics.bookmarks,
      views: metrics.views,
    });
    // Verified against the post's actual text — not anything self-reported
    // on the form — so it can't be faked by just typing the hashtag in a
    // form field without it actually being in the post.
    const hashtagConfirmed = textContainsRequiredHashtag(metrics.text);
    const botFlagReason = detectSuspiciousRatio(metrics);
    return { metrics, score, metricsError: null, hashtagConfirmed, botFlagReason };
  } catch (error) {
    return {
      metrics: null,
      score: null,
      metricsError: error instanceof PostLookupError ? error.message : "Could not fetch post metrics.",
      hashtagConfirmed: false,
      botFlagReason: null,
    };
  }
}

/**
 * A stable, comparable key identifying "the same team" across submissions —
 * prefers the Devfolio Team ID (least likely to be typed inconsistently),
 * falling back to the team name. Returns null when neither is present, since
 * there's nothing reliable to match on (shouldn't happen once the form
 * requires one of these, but guards against blank/garbage submissions).
 */
export function getTeamKey(entry: { teamId: string; teamName: string }): string | null {
  const idKey = entry.teamId.trim().toLowerCase();
  if (idKey) return `id:${idKey}`;
  const nameKey = entry.teamName.trim().toLowerCase();
  return nameKey ? `name:${nameKey}` : null;
}

/** Turns a bare "@handle" / "handle" / full URL into a proper X profile URL. */
export function normalizeXHandle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://x.com/${handle}`;
}

export type ParsedFormPayload = {
  submitterName: string;
  teamName: string;
  teamId: string;
  postLink: string;
  members: TeamMember[];
};

export function parseFormSubmissionPayload(
  body: unknown,
): { ok: true; value: ParsedFormPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid submission body." };
  const b = body as Record<string, unknown>;

  const postLink = typeof b.postLink === "string" ? b.postLink.trim() : "";
  if (!postLink) return { ok: false, error: "Post Link is required." };

  const rawMembers = Array.isArray(b.members) ? b.members : [];
  const members: TeamMember[] = rawMembers
    .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === "object")
    .map((m) => ({
      xHandle: typeof m.xHandle === "string" ? m.xHandle.trim() : "",
      email: typeof m.email === "string" ? m.email.trim() : "",
    }))
    .filter((m) => m.xHandle || m.email);

  return {
    ok: true,
    value: {
      submitterName: typeof b.submitterName === "string" ? b.submitterName.trim() : "",
      teamName: typeof b.teamName === "string" ? b.teamName.trim() : "",
      teamId: typeof b.teamId === "string" ? b.teamId.trim() : "",
      postLink,
      members,
    },
  };
}
