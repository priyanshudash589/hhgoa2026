import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseFormSubmissionPayload } from "@/lib/form-submission";
import {
  addPendingSubmissionFromPayload,
  approvePendingSubmission,
  rejectPendingSubmission,
  refetchPendingSubmissionMetrics,
} from "@/lib/form-submission-store";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { getCloudflareEnv } from "@/lib/cloudflare-env";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function handleAdminAction(body: { approveId?: unknown; rejectId?: unknown; refetchId?: unknown }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (typeof body.approveId === "string") {
    const entries = await approvePendingSubmission(body.approveId);
    return NextResponse.json({ pending: entries });
  }
  if (typeof body.rejectId === "string") {
    const entries = await rejectPendingSubmission(body.rejectId);
    return NextResponse.json({ pending: entries });
  }
  if (typeof body.refetchId === "string") {
    const entries = await refetchPendingSubmissionMetrics(body.refetchId);
    return NextResponse.json({ pending: entries });
  }
  return NextResponse.json({ error: "Nothing to do." }, { status: 400 });
}

async function handleWebhookSubmission(request: NextRequest, body: unknown) {
  const { FORM_WEBHOOK_SECRET } = getCloudflareEnv();
  const providedSecret = request.headers.get("x-webhook-secret");
  if (!FORM_WEBHOOK_SECRET || providedSecret !== FORM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseFormSubmissionPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const pending = await addPendingSubmissionFromPayload(parsed.value);

  return NextResponse.json({ ok: true, pending: pending[0] });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "write", "form-submission-post");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const body = (await request.json().catch(() => null)) as
    | ({ approveId?: unknown; rejectId?: unknown; refetchId?: unknown } & Record<string, unknown>)
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body.approveId === "string" ||
    typeof body.rejectId === "string" ||
    typeof body.refetchId === "string"
  ) {
    return handleAdminAction(body);
  }

  return handleWebhookSubmission(request, body);
}
