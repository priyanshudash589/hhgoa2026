"use client";

import { useEffect, useState } from "react";
import { formatViews, type LeaderboardEntry } from "@/lib/leaderboard";

function ViewsEditor({ entry, onSaved }: { entry: LeaderboardEntry; onSaved: (entries: LeaderboardEntry[]) => void }) {
  const [views, setViews] = useState(String(entry.views));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateViewsId: entry.id, views: Number(views) }),
      });
      if (!res.ok) throw new Error("Failed to update views");
      const data = (await res.json()) as { entries: LeaderboardEntry[] };
      onSaved(data.entries);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <input
        type="number"
        min={0}
        value={views}
        onChange={(e) => setViews(e.target.value)}
        className="font-body text-[13px] text-black bg-white border border-black/20 rounded-md px-2 py-1 w-24 outline-none focus:border-brand-pink transition-colors"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || Number(views) === entry.views}
        className="font-body text-[11px] uppercase tracking-wide text-brand-primary hover:text-brand-pink transition-colors disabled:opacity-30"
      >
        {saving ? "Saving…" : "Update"}
      </button>
    </div>
  );
}

export function LeaderboardPanel({ initialEntries }: { initialEntries: LeaderboardEntry[] }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  // useState's initial value only applies on mount — this keeps entries in
  // sync when a sibling panel (Pending Submissions) triggers router.refresh()
  // after approving something into the leaderboard.
  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);
  const [name, setName] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [postLink, setPostLink] = useState("");
  const [views, setViews] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refetchingAll, setRefetchingAll] = useState(false);
  const [refetchStatus, setRefetchStatus] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  async function handleDismissBotFlag(id: string) {
    setDismissingId(id);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissBotFlagId: id }),
      });
      if (!res.ok) throw new Error("Failed to dismiss");
      const data = (await res.json()) as { entries: LeaderboardEntry[] };
      setEntries(data.entries);
    } finally {
      setDismissingId(null);
    }
  }

  async function handleRefetchAll() {
    setRefetchingAll(true);
    setRefetchStatus(null);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refetchAll: true }),
      });
      if (!res.ok) throw new Error("Failed to refetch");
      const data = (await res.json()) as {
        entries: LeaderboardEntry[];
        refetched: number;
        failures: Array<{ id: string; name: string; reason: string }>;
      };
      setEntries(data.entries);
      const failedNote =
        data.failures.length > 0
          ? ` · ${data.failures.length} skipped (${data.failures.map((f) => f.name).join(", ")})`
          : "";
      setRefetchStatus(`Refetched ${data.refetched} entr${data.refetched === 1 ? "y" : "ies"}${failedNote}`);
    } catch {
      setRefetchStatus("Something went wrong refetching. Try again.");
    } finally {
      setRefetchingAll(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, socialLink, postLink, views: Number(views) }),
      });
      const data = (await res.json().catch(() => null)) as { entries?: LeaderboardEntry[]; error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Failed to add entry.");
        return;
      }
      setEntries(data?.entries ?? []);
      setName("");
      setSocialLink("");
      setPostLink("");
      setViews("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeId: id }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      const data = (await res.json()) as { entries: LeaderboardEntry[] };
      setEntries(data.entries);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="border border-black/10 rounded-lg bg-white/40 px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[13px] mb-1.5">
            The Ladder
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-primary text-[24px] leading-tight">
            Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefetchAll}
            disabled={refetchingAll || entries.length === 0}
            title="Re-check every approved entry's post on X for updated likes/reposts/views and recompute its score"
            className="font-heading font-bold uppercase text-[12px] border border-brand-primary text-brand-primary rounded-md px-3.5 py-1.5 disabled:opacity-40 hover:bg-brand-primary hover:text-white transition-colors"
          >
            {refetchingAll ? "Refetching…" : "Refetch All"}
          </button>
          <span className="font-body text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-brand-primary text-white shrink-0">
            {entries.length} on board
          </span>
        </div>
      </div>
      <p className="font-body text-[11.5px] text-black/50 mb-3">
        Also runs automatically every hour — this button is for an on-demand refresh in between.
      </p>
      {refetchStatus && <p className="font-body text-[12px] text-black/60 mb-3">{refetchStatus}</p>}

      <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[12.5px] uppercase tracking-wide text-black/70">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[12.5px] uppercase tracking-wide text-black/70">Views</span>
            <input
              type="number"
              min={0}
              value={views}
              onChange={(e) => setViews(e.target.value)}
              className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[12.5px] uppercase tracking-wide text-black/70">X / LinkedIn link</span>
            <input
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="x.com/handle"
              className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[12.5px] uppercase tracking-wide text-black/70">Post link</span>
            <input
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              placeholder="x.com/handle/status/…"
              className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            />
          </label>
        </div>
        {error && <p className="font-body text-[13px] text-red-600">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="font-heading font-bold uppercase text-[13.5px] bg-brand-primary text-white rounded-md px-5 py-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? "Adding…" : "Add to Leaderboard"}
          </button>
        </div>
      </form>

      {entries.length === 0 ? (
        <p className="font-body text-[13.5px] text-black/50">No entries yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry, index) => (
            <div key={entry.id} className="border border-black/10 rounded-md bg-white/60 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-heading font-bold text-brand-primary text-[13px] w-5 shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-brand-primary text-[14px] truncate">{entry.name}</p>
                    <p className="font-body text-black/50 text-[11px] truncate">
                      {entry.socialLink} · {entry.postLink}
                    </p>
                    <p className="font-body text-black/40 text-[11px] uppercase tracking-wide mt-0.5">
                      {formatViews(entry.views)} views · score {entry.score}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <ViewsEditor entry={entry} onSaved={setEntries} />
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.id)}
                    disabled={removingId === entry.id}
                    className="font-body text-[12px] uppercase tracking-wide text-black/50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    {removingId === entry.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>

              {entry.botFlag && (
                <div className="mt-2.5 rounded-md bg-red-50 border border-red-200 px-3 py-2 flex items-start justify-between gap-3">
                  <p
                    className="font-body text-[11.5px] text-red-700 leading-snug"
                    title="Heuristic flag, not proof — reasons are shown so you can judge for yourself. See lib/bot-detection.ts."
                  >
                    ⚠ Bot-Boosted post? {entry.botFlag.reason}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDismissBotFlag(entry.id)}
                    disabled={dismissingId === entry.id}
                    className="font-body text-[11px] uppercase tracking-wide text-red-700/70 hover:text-red-700 transition-colors disabled:opacity-40 shrink-0"
                  >
                    {dismissingId === entry.id ? "…" : "Dismiss"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
