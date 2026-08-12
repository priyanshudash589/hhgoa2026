import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateLeaderboardInput, validateViewsInput } from "@/lib/leaderboard";
import {
  addLeaderboardEntry,
  dismissLeaderboardBotFlag,
  readTopLeaderboard,
  refetchAllLeaderboardMetrics,
  removeLeaderboardEntry,
  updateLeaderboardViews,
} from "@/lib/leaderboard-store";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const TOP_N = 5;

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "read", "leaderboard-get");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const entries = await readTopLeaderboard(TOP_N);
  return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "write", "leaderboard-post");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  // Every write on this route is admin-only — the leaderboard is curated,
  // not user-submitted.
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | ({
        removeId?: string;
        updateViewsId?: string;
        views?: unknown;
        refetchAll?: unknown;
        dismissBotFlagId?: string;
      } & Record<string, unknown>)
    | null;

  if (body?.refetchAll === true) {
    const result = await refetchAllLeaderboardMetrics();
    return NextResponse.json(result);
  }

  if (typeof body?.dismissBotFlagId === "string") {
    const entries = await dismissLeaderboardBotFlag(body.dismissBotFlagId);
    return NextResponse.json({ entries });
  }

  if (typeof body?.removeId === "string") {
    const entries = await removeLeaderboardEntry(body.removeId);
    return NextResponse.json({ entries });
  }

  if (typeof body?.updateViewsId === "string") {
    const result = validateViewsInput(body?.views);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    const entries = await updateLeaderboardViews(body.updateViewsId, result.value);
    return NextResponse.json({ entries });
  }

  const result = validateLeaderboardInput({
    name: body?.name,
    socialLink: body?.socialLink,
    postLink: body?.postLink,
    views: body?.views,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const entries = await addLeaderboardEntry(result.value);
  return NextResponse.json({ entries });
}
