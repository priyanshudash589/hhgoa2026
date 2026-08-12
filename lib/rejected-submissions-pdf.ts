import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { RejectedSubmission } from "@/lib/rejected-submission-store";

const PAGE_WIDTH = 595.28; // A4, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const FONT_SIZE = 10;
const MAX_LINE_CHARS = 100; // pdf-lib doesn't wrap text — keep lines from running off the page

function truncate(text: string, max: number = MAX_LINE_CHARS): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Renders every rejected submission's full form details as a simple, printable PDF — the full archive, not just what's shown in the dashboard panel. */
export async function buildRejectedSubmissionsPdf(entries: RejectedSubmission[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(lines: number) {
    if (y - lines * LINE_HEIGHT < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawLine(text: string, opts: { bold?: boolean; size?: number } = {}) {
    ensureSpace(1);
    page.drawText(truncate(text), {
      x: MARGIN,
      y,
      size: opts.size ?? FONT_SIZE,
      font: opts.bold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  }

  drawLine(`HH Goa — Rejected Submissions (${entries.length})`, { bold: true, size: 16 });
  drawLine(`Generated ${new Date().toISOString()}`, { size: 9 });
  y -= LINE_HEIGHT;

  if (entries.length === 0) {
    drawLine("No rejected submissions.");
  }

  entries.forEach((entry, index) => {
    ensureSpace(9);
    drawLine(`${index + 1}. ${entry.teamName || entry.submitterName || "Unnamed team"}`, { bold: true, size: 12 });
    drawLine(`   Submitter: ${entry.submitterName || "—"}   Team ID: ${entry.teamId || "—"}`);
    drawLine(`   Post Link: ${entry.postLink || "—"}`);
    const members = entry.members.map((m) => `${m.xHandle || "—"} (${m.email || "—"})`).join(", ");
    drawLine(`   Members: ${members || "—"}`);
    drawLine(`   Hashtag confirmed: ${entry.hashtagConfirmed ? "Yes" : "No"}   Score: ${entry.score ?? "—"}`);
    if (entry.metricsError) drawLine(`   Metrics error: ${entry.metricsError}`);
    drawLine(`   Submitted: ${entry.createdAt}   Rejected: ${entry.rejectedAt}`);
    y -= LINE_HEIGHT / 2;
  });

  return doc.save();
}
