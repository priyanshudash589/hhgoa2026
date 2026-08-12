import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isTimelinePhaseId, isTimelineStatus } from "@/lib/timeline-phases";
import { readTimelineStatusMap, setTimelinePhaseStatus } from "@/lib/timeline-status-store";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "read", "timeline-status-get");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const statusMap = await readTimelineStatusMap();
  return NextResponse.json(
    { status: statusMap },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "write", "timeline-status-post");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { phaseId?: unknown; status?: unknown } | null;
  const phaseId = body?.phaseId;
  const status = body?.status;

  if (!isTimelinePhaseId(phaseId)) {
    return NextResponse.json({ error: "Invalid phaseId" }, { status: 400 });
  }
  if (status !== null && !isTimelineStatus(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const statusMap = await setTimelinePhaseStatus(phaseId, status);
  return NextResponse.json({ status: statusMap });
}
