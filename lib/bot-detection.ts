/**
 * Heuristic bot/boost detection — flags a post for human review, it does
 * NOT prove manipulation. There's no reliable way to confirm actual bot
 * activity from public metrics alone, so this is deliberately built to be
 * loud only when something is genuinely unusual (real organic growth
 * shouldn't trip it), and every flag carries a plain-language reason so an
 * admin can judge for themselves rather than trust a black box.
 */
export type MetricsSnapshot = {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  views: number | null;
};

/**
 * Single-snapshot checks — no history needed, so this works even on a
 * submission's very first fetch (before it's even approved).
 */
export function detectSuspiciousRatio(m: MetricsSnapshot): string | null {
  // Impossible organically: you can't like a post you weren't counted as
  // having viewed. A real mismatch here usually means bought likes on a
  // post that never actually got the reach.
  if (m.views !== null && m.likes > m.views) {
    return `${m.likes.toLocaleString("en-US")} likes but only ${m.views.toLocaleString("en-US")} views — not possible organically.`;
  }
  // Retweet-bot farms auto-repost but don't comment; a real audience that
  // large almost always leaves at least a few replies.
  if (m.likes >= 200 && m.replies === 0 && m.retweets > m.likes * 0.5) {
    return `${m.retweets.toLocaleString("en-US")} retweets vs ${m.likes.toLocaleString("en-US")} likes with zero replies — a common bot-farm signature.`;
  }
  return null;
}

// Needs both a large absolute jump AND a big multiplier so normal organic
// growth (a post catching on, a retweet from someone with reach) doesn't
// trip it — only a jump that's both big in absolute terms and dispro-
// portionate to what was already there.
const SPIKE_ABSOLUTE_MIN = 250;
const SPIKE_MULTIPLIER = 4;

function isSpike(previous: number, current: number): boolean {
  const delta = current - previous;
  if (delta < SPIKE_ABSOLUTE_MIN) return false;
  if (previous <= 0) return true;
  return current >= previous * SPIKE_MULTIPLIER;
}

/**
 * Compares two snapshots (normally ~1 hour apart, from the hourly refetch)
 * for a sudden, oversized jump in likes or retweets — the two metrics most
 * commonly bought.
 */
export function detectSpike(previous: MetricsSnapshot, current: MetricsSnapshot): string | null {
  const reasons: string[] = [];
  if (isSpike(previous.likes, current.likes)) {
    reasons.push(
      `Likes jumped from ${previous.likes.toLocaleString("en-US")} to ${current.likes.toLocaleString("en-US")} in about an hour.`,
    );
  }
  if (isSpike(previous.retweets, current.retweets)) {
    reasons.push(
      `Retweets jumped from ${previous.retweets.toLocaleString("en-US")} to ${current.retweets.toLocaleString("en-US")} in about an hour.`,
    );
  }
  return reasons.length > 0 ? reasons.join(" ") : null;
}
