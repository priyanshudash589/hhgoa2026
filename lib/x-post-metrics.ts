/**
 * Fetches engagement metrics (likes, views, retweets, replies, quotes,
 * bookmarks) for a public X (formerly Twitter) post.
 *
 * Data source: the FixTweet/fxtwitter public mirror API
 * (https://github.com/FixTweet/FxTwitter). It requires no API key or
 * developer account, unlike X's own API v2 — which (since the 2023 access
 * tier changes) needs a paid "Basic" tier or higher just to look up a post
 * by ID. FixTweet is a well-known open-source project built specifically to
 * serve this kind of public post data (originally for fixing link
 * previews/embeds on Discord, Slack, Telegram, etc).
 *
 * Trade-off: this is an unofficial third-party service, not X itself. It can
 * change, rate-limit, or go down without notice. For a production app with
 * an SLA, migrate to the official X API (see README).
 */

const FXTWITTER_BASE = "https://api.fxtwitter.com";

export interface PostMetrics {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  author: {
    name: string;
    handle: string;
    url: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  likes: number;
  views: number | null;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
}

export class PostLookupError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_url" | "not_found" | "upstream_error",
  ) {
    super(message);
    this.name = "PostLookupError";
  }
}

/**
 * Extracts a numeric post ID from an X/Twitter post URL, or passes through
 * a bare numeric ID if one is given directly.
 *
 * Accepts: x.com, twitter.com, mobile.twitter.com, with or without
 * protocol, with any username segment, and with trailing query params or
 * slashes (e.g. "?s=20", "/photo/1").
 */
export function parsePostId(input: string): string {
  const trimmed = input.trim();

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(
    /(?:x\.com|twitter\.com)\/[^/]+\/status(?:es)?\/(\d+)/i,
  );

  if (!match) {
    throw new PostLookupError(
      "That doesn't look like an X/Twitter post URL or ID. Expected something like https://x.com/user/status/1234567890.",
      "invalid_url",
    );
  }

  return match[1];
}

interface FxTweetResponse {
  code: number;
  message: string;
  tweet?: {
    id: string;
    url: string;
    text: string;
    created_at: string;
    author: {
      name: string;
      screen_name: string;
      url: string;
      avatar_url?: string | null;
      verification?: { verified?: boolean } | null;
    };
    likes: number;
    views?: { count?: number | null; state?: string } | number | null;
    retweets: number;
    replies: number;
    quotes: number;
    bookmarks: number;
  };
}

/**
 * Fetches metrics for a single X post given its numeric ID.
 */
export async function fetchPostMetrics(id: string): Promise<PostMetrics> {
  let response: Response;
  try {
    response = await fetch(`${FXTWITTER_BASE}/status/${id}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; x-post-metrics-agent/1.0)",
      },
      // Post metrics change constantly; never serve a stale cached response.
      cache: "no-store",
    });
  } catch {
    throw new PostLookupError(
      "Couldn't reach the post-metrics service. Check your network connection and try again.",
      "upstream_error",
    );
  }

  if (response.status === 404) {
    throw new PostLookupError(
      "No post found with that ID. It may have been deleted, or the account may be private/suspended.",
      "not_found",
    );
  }

  if (!response.ok) {
    throw new PostLookupError(
      `The post-metrics service returned an unexpected error (HTTP ${response.status}).`,
      "upstream_error",
    );
  }

  const data = (await response.json()) as FxTweetResponse;

  if (!data.tweet) {
    throw new PostLookupError(
      data.message || "No post found with that ID.",
      "not_found",
    );
  }

  const t = data.tweet;
  const views =
    typeof t.views === "number"
      ? t.views
      : (t.views?.count ?? null);

  return {
    id: t.id,
    url: t.url,
    text: t.text,
    createdAt: t.created_at,
    author: {
      name: t.author.name,
      handle: t.author.screen_name,
      url: t.author.url,
      avatarUrl: t.author.avatar_url ?? null,
      verified: Boolean(t.author.verification?.verified),
    },
    likes: t.likes,
    views,
    retweets: t.retweets,
    replies: t.replies,
    quotes: t.quotes,
    bookmarks: t.bookmarks,
  };
}

/** Convenience: parse + fetch in one call. */
export async function getPostMetricsFromInput(
  input: string,
): Promise<PostMetrics> {
  const id = parsePostId(input);
  return fetchPostMetrics(id);
}
