"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTeamKey, type PendingSubmission } from "@/lib/form-submission";
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

export function PendingSubmissionsPanel({
  initialPending,
  approvedTeamNames,
  rejectedCountByTeamKey,
}: {
  initialPending: PendingSubmission[];
  // Names already on the leaderboard/confirmed participants — a pending
  // submission whose team name matches one of these is very likely a
  // second submission from a team that's already registered.
  approvedTeamNames: string[];
  // How many times each team (keyed by team ID, falling back to team name —
  // same as getTeamKey) has already been rejected. Plain submission-count
  // context, not a warning — a team resubmitting after a rejection is
  // normal, expected workflow.
  rejectedCountByTeamKey: Record<string, number>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingSubmission[]>(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);

  const approvedNameSet = useMemo(
    () => new Set(approvedTeamNames.map((n) => n.toLowerCase())),
    [approvedTeamNames],
  );

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/form-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approveId: id }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      const data = (await res.json()) as { pending: PendingSubmission[] };
      setPending(data.pending);
      // The Leaderboard panel reads its own initial props server-side —
      // refresh so it picks up the entry we just approved into it.
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefetch(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/form-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refetchId: id }),
      });
      if (!res.ok) throw new Error("Failed to refetch");
      const data = (await res.json()) as { pending: PendingSubmission[] };
      setPending(data.pending);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/form-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectId: id }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      const data = (await res.json()) as { pending: PendingSubmission[] };
      setPending(data.pending);
      // The Rejected Submissions panel reads its own initial props
      // server-side — refresh so it picks up the entry we just archived.
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="border border-black/10 rounded-lg bg-white/40 px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[13px] mb-1.5">
            From the Form
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-primary text-[24px] leading-tight">
            Pending Submissions
          </h2>
        </div>
        <span
          className={`font-body text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
            pending.length > 0 ? "bg-brand-pink text-white" : "bg-black/10 text-black/60"
          }`}
        >
          {pending.length} waiting
        </span>
      </div>

      {pending.length === 0 ? (
        <p className="font-body text-[13.5px] text-black/50">No submissions waiting for review.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((entry) => {
            const displayName = (entry.teamName || entry.submitterName).trim().toLowerCase();
            // Only flags a team that's already *approved* — a plain
            // resubmission after a rejection (fixed the hashtag, fixed the
            // link, etc.) is normal workflow and shouldn't get flagged as
            // if something's wrong; rejected entries never end up in
            // approvedTeamNames, so this doesn't fire for them.
            const alreadyApproved = displayName !== "" && approvedNameSet.has(displayName);

            // Plain submission-count context — every prior submission from
            // this team, rejected or accepted, so an admin can see "this is
            // their 3rd try" without it reading as an accusation.
            const teamKey = getTeamKey(entry);
            const rejectedCount = teamKey ? (rejectedCountByTeamKey[teamKey] ?? 0) : 0;
            const priorCount = rejectedCount + (alreadyApproved ? 1 : 0);

            return (
              <div key={entry.id} className="border border-black/10 rounded-md bg-white/60 px-4 py-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-brand-primary text-[15px]">
                      {entry.teamName || entry.submitterName || "Unnamed team"}
                    </p>
                    <p className="font-body text-black/50 text-[11.5px]">
                      {entry.submitterName} · Team ID: {entry.teamId || "—"}
                    </p>
                    <p className="font-body text-black/40 text-[11px] uppercase tracking-wide mt-0.5">
                      {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>
                  <span
                    title="Checked against the post's actual text, not anything typed on the form"
                    className={`font-body text-[10.5px] uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${
                      entry.hashtagConfirmed ? "bg-brand-primary text-white" : "bg-red-600 text-white"
                    }`}
                  >
                    {entry.hashtagConfirmed ? "#FrameInGoa ✓" : "No #FrameInGoa"}
                  </span>
                </div>

                {(alreadyApproved || entry.botFlagReason || priorCount > 0) && (
                  <div className="mb-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 flex flex-col gap-1">
                    {priorCount > 0 && (
                      <p className="font-body text-[11.5px] text-red-700 leading-snug">
                        ⚠ Submission #{priorCount + 1} from this team — {rejectedCount} rejected
                        {alreadyApproved ? ", 1 already accepted" : ""} before.
                      </p>
                    )}
                    {alreadyApproved && (
                      <p className="font-body text-[11.5px] text-red-700 leading-snug">
                        ⚠ A team named &ldquo;{entry.teamName || entry.submitterName}&rdquo; is already
                        confirmed — this looks like a second submission from a registered team.
                      </p>
                    )}
                    {entry.botFlagReason && (
                      <p
                        className="font-body text-[11.5px] text-red-700 leading-snug"
                        title="Heuristic flag, not proof — judge for yourself. See lib/bot-detection.ts."
                      >
                        ⚠ Bot-Boosted post? {entry.botFlagReason}
                      </p>
                    )}
                  </div>
                )}

                <a
                  href={entry.postLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[12.5px] text-brand-pink underline underline-offset-2 hover:opacity-80 break-all"
                >
                  {entry.postLink}
                </a>

                {entry.members.length > 0 && (
                  <p className="font-body text-black/60 text-[11.5px] mt-2">
                    {entry.members.map((m) => m.xHandle || m.email).filter(Boolean).join(" · ")}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4 flex-wrap">
                  {entry.metrics ? (
                    <div className="font-body text-[12px] text-black/70 flex gap-3 flex-wrap">
                      <span>{formatViews(entry.metrics.likes)} likes</span>
                      <span>{formatViews(entry.metrics.retweets)} reposts</span>
                      <span>{formatViews(entry.metrics.replies)} replies</span>
                      <span>{formatViews(entry.metrics.quotes)} quotes</span>
                      <span>{formatViews(entry.metrics.bookmarks)} bookmarks</span>
                      <span>{entry.metrics.views !== null ? formatViews(entry.metrics.views) : "—"} views</span>
                    </div>
                  ) : (
                    <p className="font-body text-[12px] text-red-600">
                      {entry.metricsError ?? "Couldn't fetch metrics for this post."}
                    </p>
                  )}
                  {entry.score !== null && (
                    <span className="font-heading font-bold text-brand-primary text-[13px]">
                      Score: {entry.score}/100
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleApprove(entry.id)}
                    disabled={busyId === entry.id}
                    className="font-heading font-bold uppercase text-[12.5px] bg-brand-primary text-white rounded-md px-4 py-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {busyId === entry.id ? "Working…" : "Approve → Leaderboard"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRefetch(entry.id)}
                    disabled={busyId === entry.id}
                    title="Re-check this post on X for updated likes/reposts/views and recompute its score"
                    className="font-heading font-bold uppercase text-[12.5px] border border-brand-primary text-brand-primary rounded-md px-4 py-2 disabled:opacity-50 hover:bg-brand-primary hover:text-white transition-colors"
                  >
                    {busyId === entry.id ? "Working…" : "Refetch Score"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(entry.id)}
                    disabled={busyId === entry.id}
                    className="font-body text-[12.5px] uppercase tracking-wide text-black/50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
