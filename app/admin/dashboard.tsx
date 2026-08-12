"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  TIMELINE_PHASES,
  TIMELINE_STATUSES,
  type TimelineStatus,
  type TimelineStatusMap,
} from "@/lib/timeline-phases";
import type { Notice } from "@/lib/notice-board";
import type { ParticipationEntry } from "@/lib/task-participation";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { getTeamKey, type PendingSubmission } from "@/lib/form-submission";
import type { RejectedSubmission } from "@/lib/rejected-submission-store";
import { NoticeEditor } from "@/app/admin/notice-editor";
import { TaskParticipationPanel } from "@/app/admin/task-participation-panel";
import { LeaderboardPanel } from "@/app/admin/leaderboard-panel";
import { PendingSubmissionsPanel } from "@/app/admin/pending-submissions-panel";
import { RejectedSubmissionsPanel } from "@/app/admin/rejected-submissions-panel";

const STATUS_DOT: Record<TimelineStatus, string> = {
  Completed: "bg-brand-primary",
  Running: "bg-brand-accent",
  "To Be Started": "bg-black/30",
  Evaluated: "bg-brand-pink",
  "Results Out": "bg-black",
};

export function AdminDashboard({
  initialStatus,
  initialNotices,
  initialParticipation,
  initialLeaderboard,
  initialPending,
  initialRejected,
}: {
  initialStatus: TimelineStatusMap;
  initialNotices: Notice[];
  initialParticipation: ParticipationEntry[];
  initialLeaderboard: LeaderboardEntry[];
  initialPending: PendingSubmission[];
  initialRejected: RejectedSubmission[];
}) {
  const router = useRouter();
  const [statusMap, setStatusMap] = useState<TimelineStatusMap>(initialStatus);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Names already on the board (leaderboard) or confirmed (task
  // participation) — used by the Pending Submissions panel to flag a new
  // submission that looks like a second one from an already-registered team.
  const approvedTeamNames = Array.from(
    new Set(
      [...initialParticipation.map((p) => p.name), ...initialLeaderboard.map((l) => l.name)]
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  // How many times each team has already been rejected — keyed the same
  // way as pending submissions (team ID, falling back to team name) so a
  // new submission can show "this team's submitted before" as plain
  // context, not a red flag.
  const rejectedCountByTeamKey: Record<string, number> = {};
  for (const r of initialRejected) {
    const key = getTeamKey(r);
    if (!key) continue;
    rejectedCountByTeamKey[key] = (rejectedCountByTeamKey[key] ?? 0) + 1;
  }

  async function handleChange(phaseId: string, value: string) {
    const previous = statusMap[phaseId] ?? null;
    const nextStatus = value === "" ? null : (value as TimelineStatus);

    setStatusMap((current) => {
      const next = { ...current };
      if (nextStatus === null) delete next[phaseId];
      else next[phaseId] = nextStatus;
      return next;
    });
    setSavingId(phaseId);

    try {
      const res = await fetch("/api/timeline-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseId, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      setStatusMap((current) => {
        const next = { ...current };
        if (previous === null) delete next[phaseId];
        else next[phaseId] = previous;
        return next;
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <header className="sticky top-0 z-10 bg-brand-primary text-brand-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <span className="font-heading font-bold uppercase tracking-wide text-[15px]">
            HH GOA <span className="text-brand-accent">·</span> Timeline Dashboard
          </span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="font-body text-[13px] uppercase tracking-wide text-brand-offwhite/90 hover:text-brand-accent transition-colors disabled:opacity-50"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <div className="mb-10">
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[14px] mb-3">
            Live control
          </p>
          <h1 className="font-heading font-bold uppercase text-brand-primary text-[36px] sm:text-[42px] leading-[1.05] mb-3">
            Timeline Status
          </h1>
          <p className="font-body text-black/70 text-[14.5px] leading-relaxed max-w-[60ch]">
            Changes here update the &ldquo;Timeline at a Glance&rdquo; section on the live site within
            about a minute.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {TIMELINE_PHASES.map((phase) => {
            const current = statusMap[phase.id] ?? "";
            const isSaving = savingId === phase.id;
            return (
              <div
                key={phase.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 border border-black/10 rounded-lg bg-white/40 px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-brand-primary text-[16px] leading-snug">
                    {phase.name}
                  </p>
                  <p className="font-body text-black/60 text-[12.5px]">{phase.when}</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {current !== "" && (
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[current as TimelineStatus]}`} />
                  )}
                  <select
                    value={current}
                    onChange={(e) => handleChange(phase.id, e.target.value)}
                    className="font-body text-[13.5px] text-black bg-white border border-black/20 rounded-md px-2.5 py-1.5 min-w-[160px] outline-none focus:border-brand-pink transition-colors"
                  >
                    <option value="" className="text-black bg-white">— No status —</option>
                    {TIMELINE_STATUSES.map((status) => (
                      <option key={status} value={status} className="text-black bg-white">
                        {status}
                      </option>
                    ))}
                  </select>
                  <span className="font-body text-[11px] uppercase tracking-wide text-black/40 w-12 shrink-0">
                    {isSaving ? "Saving…" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <NoticeEditor initialNotices={initialNotices} />
        </div>

        <div className="mt-10">
          <TaskParticipationPanel initialEntries={initialParticipation} />
        </div>

        <div className="mt-10">
          <PendingSubmissionsPanel
            initialPending={initialPending}
            approvedTeamNames={approvedTeamNames}
            rejectedCountByTeamKey={rejectedCountByTeamKey}
          />
        </div>

        <div className="mt-10">
          <RejectedSubmissionsPanel initialRejected={initialRejected} />
        </div>

        <div className="mt-10">
          <LeaderboardPanel initialEntries={initialLeaderboard} />
        </div>
      </main>
    </div>
  );
}
