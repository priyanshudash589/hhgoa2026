"use client";

import { useEffect, useState } from "react";
import type { Notice } from "@/lib/notice-board";

// Kept long deliberately — this app ran into the Workers Free plan's daily
// request quota (100k/day) once real traffic arrived, because every open tab
// was polling two endpoints every 5s. 60s keeps updates feeling live without
// burning through the quota on a handful of long-open tabs.
const POLL_INTERVAL_MS = 60000;

function useNotices(): { notices: Notice[]; loaded: boolean } {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/notice-board", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { notices?: Notice[] };
        if (!cancelled && data.notices) {
          setNotices(data.notices);
          setLoaded(true);
        }
      } catch {
        // Keep showing the last known notices.
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { notices, loaded };
}

function noticeTextSizeClass(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words <= 12) return "text-[17px] leading-snug";
  if (words <= 25) return "text-[14.5px] leading-snug";
  if (words <= 38) return "text-[13px] leading-snug";
  return "text-[11.5px] leading-snug";
}

const ROTATIONS = [-2.5, 1.5, -1, 2, -1.5, 1, -2, 2.5];
const PIN_TONES = ["bg-brand-pink", "bg-brand-accent", "bg-brand-primary"];

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function NoticeCard({ notice, index }: { notice: Notice; index: number }) {
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const pinTone = PIN_TONES[index % PIN_TONES.length];

  return (
    <div
      className="relative bg-brand-offwhite rounded-sm px-6 py-7 w-[250px] shrink-0 shadow-[6px_8px_0_rgba(0,0,0,0.25)]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <span
        aria-hidden
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full ${pinTone} border-2 border-brand-offwhite shadow-[0_2px_3px_rgba(0,0,0,0.35)]`}
      />
      <p className={`font-body text-black/85 text-center ${noticeTextSizeClass(notice.text)}`}>{notice.text}</p>
      {notice.linkLabel && notice.linkUrl && (
        <div className="mt-4 text-center">
          <a
            href={notice.linkUrl}
            target={notice.linkUrl.startsWith("http") ? "_blank" : undefined}
            rel={notice.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-block font-heading font-bold uppercase text-[11px] tracking-wide text-white bg-brand-pink px-3.5 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            {notice.linkLabel}
          </a>
        </div>
      )}
      <p className="mt-3 font-body text-black/40 text-[10px] uppercase tracking-wide text-center">
        {formatTimestamp(notice.createdAt)}
      </p>
    </div>
  );
}

export function NoticeBoardSection() {
  const { notices, loaded } = useNotices();
  const hasNotices = loaded && notices.length > 0;

  return (
    <section
      id="notice-board"
      aria-label="Notice board"
      className="w-full h-full flex flex-col items-center justify-center bg-brand-primary px-6"
    >
      <div className="flex flex-col items-center gap-8 max-w-[1440px] w-full">
        <div className="text-center">
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-accent text-[15px] mb-2">
            Pinned Up
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-white text-[42px] leading-[1.05]">
            Notice Board
          </h2>
        </div>

        {hasNotices ? (
          <div className="w-full max-h-[560px] overflow-y-auto px-4 py-2">
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10">
              {notices.map((notice, index) => (
                <NoticeCard key={notice.id} notice={notice} index={index} />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-[380px] h-[220px] rounded-md border-2 border-dashed border-brand-offwhite/25 flex items-center justify-center">
            <p className="font-body text-brand-offwhite/50 text-[13px] uppercase tracking-wide text-center px-6">
              Nothing pinned yet
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
