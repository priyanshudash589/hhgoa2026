// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";
// @ts-ignore `.open-next/cloudflare/init.js` is generated at build time
import { runWithCloudflareRequestContext } from "./.open-next/cloudflare/init.js";
import { refetchAllLeaderboardMetrics } from "./lib/leaderboard-store";

// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

export { RateLimiterDO } from "./lib/rate-limiter-do";

/**
 * Hourly cron (see wrangler.jsonc `triggers.crons`) — re-fetches every
 * approved leaderboard entry's post from X and recomputes its score, the
 * same work the admin's "Refetch All" button does, just automatic. /radar
 * and the homepage both read straight from the same KV-backed leaderboard,
 * so they pick this up on their next request with no extra wiring.
 *
 * getCloudflareEnv() (used throughout lib/*-store.ts) reads its env from a
 * request-scoped context that OpenNext's `fetch` handler normally sets up
 * per-request — a `scheduled` event never goes through that handler, so
 * without this it would throw. Reusing OpenNext's own
 * `runWithCloudflareRequestContext` (the exact function `fetch` uses)
 * establishes that same context here, with a synthetic request standing in
 * since only its URL is used to seed a couple of env vars.
 */
async function refetchLeaderboardOnSchedule(env: Env, ctx: ExecutionContext) {
  const syntheticRequest = new Request("https://hhgoa.com/__scheduled/leaderboard-refetch");
  await runWithCloudflareRequestContext(syntheticRequest, env, ctx, async () => {
    const result = await refetchAllLeaderboardMetrics();
    console.log(
      `[scheduled] leaderboard refetch: ${result.refetched} refetched, ${result.failures.length} failed`,
    );
  });
}

export default {
  fetch: handler.fetch,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refetchLeaderboardOnSchedule(env, ctx));
  },
} satisfies ExportedHandler<Env>;
