"use client";

import { useState } from "react";
import { NOTICE_MAX_WORDS, countWords, type Notice } from "@/lib/notice-board";

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

export function NoticeEditor({ initialNotices }: { initialNotices: Notice[] }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [text, setText] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(text);
  const overLimit = wordCount > NOTICE_MAX_WORDS;

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notice-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, linkLabel, linkUrl }),
      });
      const data = (await res.json().catch(() => null)) as { notices?: Notice[]; error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Failed to publish notice.");
        return;
      }
      setNotices(data?.notices ?? []);
      setText("");
      setLinkLabel("");
      setLinkUrl("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    setError(null);
    try {
      const res = await fetch("/api/notice-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeId: id }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      const data = (await res.json()) as { notices: Notice[] };
      setNotices(data.notices);
    } catch {
      setError("Couldn't remove that notice. Try again.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleClearAll() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notice-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      if (!res.ok) throw new Error("Failed to clear");
      setNotices([]);
    } catch {
      setError("Couldn't clear the board. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-black/10 rounded-lg bg-white/40 px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[13px] mb-1.5">
            Pinned Up
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-primary text-[24px] leading-tight">
            Notice Board
          </h2>
        </div>
        <span
          className={`font-body text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
            notices.length > 0 ? "bg-brand-primary text-white" : "bg-black/10 text-black/60"
          }`}
        >
          {notices.length > 0 ? `${notices.length} live on site` : "Board empty"}
        </span>
      </div>

      <form onSubmit={handlePublish} className="flex flex-col gap-4 mb-7">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-wide text-black/70">
            New notice text
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="What's the notice? (up to 50 words)"
            className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors resize-none"
          />
          <span className={`font-body text-[12px] self-end ${overLimit ? "text-red-600" : "text-black/50"}`}>
            {wordCount} / {NOTICE_MAX_WORDS} words
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[13px] uppercase tracking-wide text-black/70">
              Link name (optional)
            </span>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="e.g. RSVP now"
              className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[13px] uppercase tracking-wide text-black/70">
              Link URL (optional)
            </span>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
              className="font-body text-[14px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            />
          </label>
        </div>

        {error && <p className="font-body text-[13px] text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={saving || overLimit || text.trim().length === 0}
            className="font-heading font-bold uppercase text-[13.5px] bg-brand-primary text-white rounded-md px-5 py-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? "Publishing…" : "Pin new notice"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-[13px] uppercase tracking-wide text-black/70">
          Currently pinned ({notices.length})
        </p>
        {notices.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={saving}
            className="font-body text-[12px] uppercase tracking-wide text-black/50 hover:text-brand-pink transition-colors disabled:opacity-40"
          >
            Clear all
          </button>
        )}
      </div>

      {notices.length === 0 ? (
        <p className="font-body text-[13.5px] text-black/50">No notices pinned. Add one above.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-start justify-between gap-4 border border-black/10 rounded-md bg-white/60 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-body text-black/85 text-[13.5px] leading-snug">{notice.text}</p>
                {notice.linkLabel && notice.linkUrl && (
                  <p className="font-body text-brand-pink text-[12px] mt-1 truncate">
                    {notice.linkLabel} → {notice.linkUrl}
                  </p>
                )}
                <p className="font-body text-black/40 text-[11px] uppercase tracking-wide mt-1">
                  {formatTimestamp(notice.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(notice.id)}
                disabled={removingId === notice.id}
                className="font-body text-[12px] uppercase tracking-wide text-black/50 hover:text-red-600 transition-colors shrink-0 disabled:opacity-40"
              >
                {removingId === notice.id ? "Removing…" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
