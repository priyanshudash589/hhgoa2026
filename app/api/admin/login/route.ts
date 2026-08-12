import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, checkAdminPassword, getExpectedSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "login", "admin-login");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = body?.password;

  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getExpectedSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
