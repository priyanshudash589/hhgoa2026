import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readRejectedSubmissions } from "@/lib/rejected-submission-store";
import { buildRejectedSubmissionsPdf } from "@/lib/rejected-submissions-pdf";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Admin-only: downloads the full rejected-submissions archive as a PDF (not just the 5 most recent shown in the dashboard panel). */
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "read", "rejected-submissions-get");
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await readRejectedSubmissions();
  const pdfBytes = await buildRejectedSubmissionsPdf(entries);
  const filename = `hhgoa-rejected-submissions-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
