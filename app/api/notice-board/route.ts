import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateNoticeInput } from "@/lib/notice-board";
import { addNotice, clearNotices, readNotices, removeNotice } from "@/lib/notice-board-store";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "read", "notice-board-get");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const notices = await readNotices();
  return NextResponse.json(
    { notices },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "write", "notice-board-post");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | ({ clear?: boolean; removeId?: string } & Record<string, unknown>)
    | null;

  if (body?.clear) {
    const notices = await clearNotices();
    return NextResponse.json({ notices });
  }

  if (typeof body?.removeId === "string") {
    const notices = await removeNotice(body.removeId);
    return NextResponse.json({ notices });
  }

  const result = validateNoticeInput({
    text: body?.text,
    linkLabel: body?.linkLabel,
    linkUrl: body?.linkUrl,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const notices = await addNotice(result.value);
  return NextResponse.json({ notices });
}
