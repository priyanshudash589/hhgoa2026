export type EngagementMetrics = {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  // Kept in the shape for compatibility with PostMetrics — deliberately
  // NOT weighted below. Views are a passive impression, not an action
  // someone took, and X's view counts are also the least reliable field
  // (frequently missing entirely) — scoring on them let a big-but-passive
  // audience outweigh real engagement, or a stale/missing count tank an
  // otherwise strong post. Score is now engagement-only.
  views: number | null;
};

// Reposts/quotes count for most since they spread the post to a new
// audience; bookmarks next since saving takes real intent; replies show
// engagement but no reach; likes are the lightest-weight signal.
const WEIGHTS = {
  like: 1,
  reply: 2,
  bookmark: 3,
  retweet: 4,
  quote: 4,
} as const;

// Weighted-points total that maps to a score of 100 — set deliberately
// high relative to typical early engagement, so a handful of likes/
// retweets can't fill the bar on its own. Reaching 100 should mean broad,
// real engagement, not "a few friends liked it." E.g. at these weights:
// ~200 retweets/quotes alone, or ~800 likes alone, or (more realistically)
// a mix like 300 likes + 50 retweets + 20 quotes + 60 replies + 30
// bookmarks (≈799 points). First guess, not calibrated against a full
// season of real submissions yet — raise it if scores cluster near 100,
// lower it if they cluster near 0.
const SCORE_CEILING_POINTS = 800;

export function computeEngagementScore(metrics: EngagementMetrics): number {
  const points =
    metrics.likes * WEIGHTS.like +
    metrics.retweets * WEIGHTS.retweet +
    metrics.quotes * WEIGHTS.quote +
    metrics.replies * WEIGHTS.reply +
    metrics.bookmarks * WEIGHTS.bookmark;

  return Math.max(0, Math.min(100, Math.round((points / SCORE_CEILING_POINTS) * 100)));
}

/**
 * No fetchable engagement breakdown exists for a manual entry (e.g. a
 * LinkedIn post, which can't be looked up) — with views no longer scored
 * either, there's no real signal left to score at all, so this is 0, not a
 * guess. The "Views" field on a manual entry is now display-only.
 */
export function manualEntryFallbackScore(): number {
  return 0;
}
