// A Durable Object gives one strongly-consistent instance per rate-limit key —
// unlike Workers KV (eventually consistent) or the native Rate Limiting binding
// (silently a no-op on the Workers Free plan), this actually enforces the limit.
export class RateLimiterDO implements DurableObject {
  constructor(private ctx: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const { limit, windowSeconds } = (await request.json()) as { limit: number; windowSeconds: number };
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const stored = await this.ctx.storage.get<{ count: number; windowStart: number }>("bucket");
    let count = 0;
    let windowStart = now;
    if (stored && now - stored.windowStart < windowMs) {
      count = stored.count;
      windowStart = stored.windowStart;
    }

    const allowed = count < limit;
    if (allowed) {
      await this.ctx.storage.put("bucket", { count: count + 1, windowStart });
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));
    return Response.json({ allowed, retryAfterSeconds });
  }
}
