import { getCloudflareEnv } from "@/lib/cloudflare-env";

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

type RateLimitPolicy = { limit: number; windowSeconds: number };

const POLICIES = {
  login: { limit: 5, windowSeconds: 60 },
  write: { limit: 20, windowSeconds: 60 },
  read: { limit: 60, windowSeconds: 60 },
} satisfies Record<string, RateLimitPolicy>;

/**
 * Durable Object-backed rate limiter — one strongly-consistent instance per
 * (route, IP) key, so it actually enforces the limit (unlike Workers KV,
 * which is only eventually consistent, or the native Rate Limiting binding,
 * which is a silent no-op on the Workers Free plan).
 */
export async function rateLimit(
  request: Request,
  policyName: keyof typeof POLICIES,
  routeKey: string,
): Promise<RateLimitResult> {
  const { RATE_LIMITER_DO } = getCloudflareEnv();
  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const policy = POLICIES[policyName];

  const id = RATE_LIMITER_DO.idFromName(key);
  const stub = RATE_LIMITER_DO.get(id);
  const res = await stub.fetch("https://rate-limiter/", {
    method: "POST",
    body: JSON.stringify(policy),
  });
  const result = (await res.json()) as { allowed: boolean; retryAfterSeconds: number };

  if (!result.allowed) {
    return { allowed: false, retryAfterSeconds: result.retryAfterSeconds };
  }
  return { allowed: true };
}

export function rateLimitedResponse(retryAfterSeconds: number) {
  return Response.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
