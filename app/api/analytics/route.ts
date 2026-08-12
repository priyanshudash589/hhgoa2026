import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPostMetricsFromInput, PostLookupError } from "@/lib/x-post-metrics";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Admin-only: this proxies a third-party service (fxtwitter) on the
// leaderboard's behalf — it's an internal tool for looking up a submitted
// post's metrics, not something to leave open to arbitrary public callers.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(request, "write", "analytics-post");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const input = body?.url;
  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "Provide a post URL or ID in the 'url' field." }, { status: 400 });
  }

  try {
    const metrics = await getPostMetricsFromInput(input);
    return NextResponse.json(metrics, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PostLookupError) {
      const status = error.code === "invalid_url" ? 400 : error.code === "not_found" ? 404 : 502;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Something went wrong looking up that post." }, { status: 500 });
  }
}
