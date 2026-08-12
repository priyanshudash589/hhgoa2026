"use client";

import { useEffect, useState } from "react";
import type { ParticipationEntry } from "@/lib/task-participation";

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function TaskParticipationPanel({ initialEntries }: { initialEntries: ParticipationEntry[] }) {
  const [entries, setEntries] = useState<ParticipationEntry[]>(initialEntries);
  // Same fix as LeaderboardPanel: useState's initial value only applies on
  // mount, so this keeps entries in sync when the Pending Submissions panel
  // triggers router.refresh() after an approval adds a confirmed participant.
  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch("/api/task-participation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeId: id }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      const data = (await res.json()) as { entries: ParticipationEntry[] };
      setEntries(data.entries);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="border border-black/10 rounded-lg bg-white/40 px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[13px] mb-1.5">
            Task #1
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-primary text-[24px] leading-tight">
            Confirmed Participants
          </h2>
        </div>
        <span className="font-body text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-brand-primary text-white shrink-0">
          {entries.length} confirmed
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="font-body text-[13.5px] text-black/50">No confirmations yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-4 border border-black/10 rounded-md bg-white/60 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-heading font-bold text-brand-primary text-[14px]">{entry.name}</p>
                <p className="font-body text-black/70 text-[12.5px]">{entry.email}</p>
                {entry.teamOrHandle && (
                  <p className="font-body text-brand-pink text-[12px] mt-0.5">{entry.teamOrHandle}</p>
                )}
                <p className="font-body text-black/40 text-[11px] uppercase tracking-wide mt-1">
                  {formatTimestamp(entry.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(entry.id)}
                disabled={removingId === entry.id}
                className="font-body text-[12px] uppercase tracking-wide text-black/50 hover:text-red-600 transition-colors shrink-0 disabled:opacity-40"
              >
                {removingId === entry.id ? "Removing…" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
