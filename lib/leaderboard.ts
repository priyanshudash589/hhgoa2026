import { normalizeNoticeUrl } from "@/lib/notice-board";
import { manualEntryFallbackScore } from "@/lib/leaderboard-score";
import type { MetricsSnapshot } from "@/lib/bot-detection";

export type LeaderboardEntry = {
  id: string;
  name: string;
  socialLink: string;
  postLink: string;
  views: number;
  score: number;
  createdAt: string;
  // The engagement snapshot from the last refetch — kept so the *next*
  // hourly refetch has something to diff against for spike detection.
  // Optional/absent on entries that predate this feature or have no
  // fetchable post (manual LinkedIn entries).
  lastMetrics?: MetricsSnapshot;
  // Sticky until an admin dismisses it — set the moment a spike/ratio check
  // trips, not auto-cleared on a clean cycle, so a one-time boost doesn't
  // just quietly disappear an hour later before anyone sees it.
  botFlag?: { reason: string; flaggedAt: string } | null;
};

export function validateLeaderboardInput(input: {
  name: unknown;
  socialLink: unknown;
  postLink: unknown;
  views: unknown;
}):
  | { ok: true; value: { name: string; socialLink: string; postLink: string; views: number; score: number } }
  | { ok: false; error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const socialLinkRaw = typeof input.socialLink === "string" ? input.socialLink.trim() : "";
  const postLinkRaw = typeof input.postLink === "string" ? input.postLink.trim() : "";
  const views = typeof input.views === "number" ? input.views : Number(input.views);

  if (!name) return { ok: false, error: "Name is required." };
  if (!socialLinkRaw) return { ok: false, error: "An X/LinkedIn link is required." };
  if (!postLinkRaw) return { ok: false, error: "A post link is required." };
  if (!Number.isFinite(views) || views < 0) return { ok: false, error: "Views must be a positive number." };

  const roundedViews = Math.round(views);

  return {
    ok: true,
    value: {
      name,
      socialLink: normalizeNoticeUrl(socialLinkRaw),
      postLink: normalizeNoticeUrl(postLinkRaw),
      views: roundedViews,
      // Manual entries have no fetchable engagement breakdown, and score
      // no longer factors in views at all — see lib/leaderboard-score.ts.
      score: manualEntryFallbackScore(),
    },
  };
}

export function validateViewsInput(input: unknown): { ok: true; value: number } | { ok: false; error: string } {
  const views = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(views) || views < 0) return { ok: false, error: "Views must be a positive number." };
  return { ok: true, value: Math.round(views) };
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(views);
}
