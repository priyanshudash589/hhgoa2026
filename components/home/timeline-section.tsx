"use client";

import { useEffect, useState } from "react";
import { TIMELINE_PHASES, type TimelinePhase, type TimelineStatus, type TimelineStatusMap } from "@/lib/timeline-phases";

const ROW_ONE = TIMELINE_PHASES.slice(0, 5);
const ROW_TWO = TIMELINE_PHASES.slice(5, 10);

const NOTCH = "28px";

const STATUS_BADGE_CLASS: Record<TimelineStatus, string> = {
  Completed: "bg-brand-primary text-white",
  Running: "bg-brand-accent text-black",
  "To Be Started": "bg-transparent text-black/70 border border-black/30",
  Evaluated: "bg-brand-pink text-white",
  "Results Out": "bg-black text-brand-accent",
};

// Kept long deliberately — see notice-board-section.tsx for why (Workers
// Free plan daily request quota).
const STATUS_POLL_INTERVAL_MS = 60000;

function useTimelineStatus(): TimelineStatusMap {
  const [statusMap, setStatusMap] = useState<TimelineStatusMap>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/timeline-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status?: TimelineStatusMap };
        if (!cancelled && data.status) setStatusMap(data.status);
      } catch {
        // Ignore — keep showing the last known status.
      }
    }

    load();
    const interval = setInterval(load, STATUS_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return statusMap;
}

function chevronClipPath(direction: "right" | "left"): string {
  if (direction === "right") {
    return `polygon(0 0, calc(100% - ${NOTCH}) 0, 100% 50%, calc(100% - ${NOTCH}) 100%, 0 100%, ${NOTCH} 50%)`;
  }
  return `polygon(100% 0, ${NOTCH} 0, 0 50%, ${NOTCH} 100%, 100% 100%, calc(100% - ${NOTCH}) 50%)`;
}

function Chevron({ phase, direction, tone }: { phase: TimelinePhase; direction: "right" | "left"; tone: "primary" | "pink" }) {
  return (
    <div
      className={`flex-1 h-[104px] flex items-center justify-center ${tone === "primary" ? "bg-brand-primary" : "bg-brand-pink"}`}
      style={{
        clipPath: chevronClipPath(direction),
        paddingLeft: direction === "right" ? "20px" : "36px",
        paddingRight: direction === "right" ? "36px" : "20px",
      }}
    >
      <span className="font-body font-bold text-brand-white text-center text-[14px] leading-tight uppercase tracking-wide">
        {phase.when}
      </span>
    </div>
  );
}

function Caption({ phase, status }: { phase: TimelinePhase; status?: TimelineStatus }) {
  return (
    <div className="flex-1 px-3 text-center flex flex-col items-center">
      <p className="font-heading font-bold text-brand-primary text-[16px] leading-snug mb-1.5">{phase.name}</p>
      <p className="font-body text-black/75 text-[12.5px] leading-snug mb-2">{phase.purpose}</p>
      {status && (
        <span
          className={`font-body font-bold uppercase tracking-wide text-[10.5px] leading-none px-2.5 py-1 rounded-full ${STATUS_BADGE_CLASS[status]}`}
        >
          {status}
        </span>
      )}
    </div>
  );
}

function FlowConnector({ align }: { align: "end" | "start" }) {
  return (
    <div className={`flex ${align === "end" ? "justify-end pr-10" : "justify-start pl-10"}`}>
      <div className="w-11 h-11 rounded-full bg-brand-accent flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

export function TimelineSection() {
  const statusMap = useTimelineStatus();

  return (
    <section
      id="timeline"
      aria-label="Timeline at a glance"
      className="w-full h-full flex flex-col justify-center bg-brand-offwhite"
    >
      <div className="px-20 py-10 flex flex-col gap-7 max-w-[1440px] mx-auto w-full">
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[15px] mb-2">
            The Roadmap
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-primary text-[42px] leading-[1.05]">
            The Timeline at a Glance
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2.5">
            {ROW_ONE.map((phase) => (
              <Chevron key={phase.id} phase={phase} direction="right" tone="primary" />
            ))}
          </div>
          <div className="flex gap-2.5">
            {ROW_ONE.map((phase) => (
              <Caption key={phase.id} phase={phase} status={statusMap[phase.id]} />
            ))}
          </div>
        </div>

        <FlowConnector align="end" />

        <div className="flex flex-col gap-3">
          <div className="flex flex-row-reverse gap-2.5">
            {ROW_TWO.map((phase) => (
              <Chevron key={phase.id} phase={phase} direction="left" tone="pink" />
            ))}
          </div>
          <div className="flex flex-row-reverse gap-2.5">
            {ROW_TWO.map((phase) => (
              <Caption key={phase.id} phase={phase} status={statusMap[phase.id]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
