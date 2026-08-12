"use client";

import { useEffect, useState } from "react";
import type { RejectedSubmission } from "@/lib/rejected-submission-store";
import { formatViews } from "@/lib/leaderboard";

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const VISIBLE_LIMIT = 5;

export function RejectedSubmissionsPanel({ initialRejected }: { initialRejected: RejectedSubmission[] }) {
  const [rejected, setRejected] = useState<RejectedSubmission[]>(initialRejected);
  // Same fix as the other panels: useState's initial value only applies on
  // mount, so this keeps the list in sync after a sibling panel's reject
  // action triggers router.refresh().
  useEffect(() => {
    setRejected(initialRejected);
  }, [initialRejected]);

  const visible = rejected.slice(0, VISIBLE_LIMIT);
  const hiddenCount = rejected.length - visible.length;

  return (
    <section className="border border-black/10 rounded-lg bg-white/40 px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[13px] mb-1.5">
            From the Form
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-primary text-[24px] leading-tight">
            Rejected Submissions
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/rejected-submissions"
            title="Downloads every rejected submission ever, not just the ones shown below"
            className="font-heading font-bold uppercase text-[12px] border border-brand-primary text-brand-primary rounded-md px-3.5 py-1.5 hover:bg-brand-primary hover:text-white transition-colors"
          >
            Download PDF
          </a>
          <span className="font-body text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-black/10 text-black/60 shrink-0">
            {rejected.length} total
          </span>
        </div>
      </div>
      <p className="font-body text-black/50 text-[12px] mb-4">
        Kept permanently so a rejection can be checked later against exactly what was on the form.
        Showing the {visible.length} most recent — download the PDF for the full archive.
      </p>

      {rejected.length === 0 ? (
        <p className="font-body text-[13.5px] text-black/50">No rejections yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((entry) => (
            <div key={entry.id} className="border border-black/10 rounded-md bg-white/60 px-4 py-4">
              <div className="flex items-start justify-between gap-4 mb-1.5">
                <div className="min-w-0">
                  <p className="font-heading font-bold text-brand-primary text-[15px]">
                    {entry.teamName || entry.submitterName || "Unnamed team"}
                  </p>
                  <p className="font-body text-black/50 text-[11.5px]">
                    {entry.submitterName} · Team ID: {entry.teamId || "—"}
                  </p>
                </div>
                <span className="font-body text-black/40 text-[11px] uppercase tracking-wide shrink-0">
                  Rejected {formatTimestamp(entry.rejectedAt)}
                </span>
              </div>

              {entry.postLink && (
                <a
                  href={entry.postLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[12.5px] text-brand-pink underline underline-offset-2 hover:opacity-80 break-all"
                >
                  {entry.postLink}
                </a>
              )}

              {entry.members.length > 0 && (
                <p className="font-body text-black/60 text-[11.5px] mt-2">
                  {entry.members.map((m) => m.xHandle || m.email).filter(Boolean).join(" · ")}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <span
                  className={`font-body text-[10.5px] uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${
                    entry.hashtagConfirmed ? "bg-brand-primary text-white" : "bg-red-600 text-white"
                  }`}
                >
                  {entry.hashtagConfirmed ? "#FrameInGoa ✓" : "No #FrameInGoa"}
                </span>
                {entry.score !== null && (
                  <span className="font-body text-[11px] text-black/60">Score was {entry.score}/100</span>
                )}
                {entry.metrics?.views != null && (
                  <span className="font-body text-[11px] text-black/60">
                    {formatViews(entry.metrics.views)} views
                  </span>
                )}
              </div>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p className="font-body text-[12px] text-black/50 text-center">
              +{hiddenCount} more — download the PDF for the full list.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
