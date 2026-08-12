import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateParticipationInput } from "@/lib/task-participation";
import { addParticipation, removeParticipation } from "@/lib/task-participation-store";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "write", "task-participation-post");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const body = (await request.json().catch(() => null)) as
    | ({ removeId?: string } & Record<string, unknown>)
    | null;

  // Removal is admin-only; submitting a new entry is public.
  if (typeof body?.removeId === "string") {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!isValidSessionToken(sessionToken)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const entries = await removeParticipation(body.removeId);
    return NextResponse.json({ entries });
  }

  const result = validateParticipationInput({
    name: body?.name,
    email: body?.email,
    teamOrHandle: body?.teamOrHandle,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await addParticipation(result.value);
  return NextResponse.json({ ok: true });
}
