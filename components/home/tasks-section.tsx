"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const REQUIREMENTS = [
  "Instantly recognizable HH Goa 2026 identity",
  "1-click download + 1-click Share to X",
  "Works on any photo — no manual cropping",
  "Personalized: name, stack, a generated builder class",
  "Seconds from upload to shareable output",
  "Get to the top of the ladder and win the exclusive HH Goa ID",
  "Use #FrameInGoa to get featured in the Radar",
];

const SUBMISSION_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdayCHrUcqnBeFD9nYe2fOXgujV_BUvYQ0hsge8oRbeL2mj4w/viewform?pli=1";

const TASK_BRIEF_URL = "https://drive.google.com/file/d/11aAIBCdhngT0QWLPBNc2bJGLqXhghN3H/view?usp=sharing";

// Submissions close at 11:59 PM IST on 13 Aug 2026 — the button shuts off
// the moment the clock rolls into 14 Aug 00:00 IST. IST is fixed +05:30, so
// this is unambiguous regardless of the visitor's own timezone.
const TASK_DEADLINE = new Date("2026-08-13T23:59:59+05:30");

/**
 * Ticks down to `deadline`, re-rendering once a second. Starts as `null`
 * (not "still open") until the first effect runs on the client — computing
 * from Date.now() during server render would make the server's and the
 * browser's very first render disagree and trigger a hydration mismatch.
 */
function useCountdown(deadline: Date): number | null {
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMsLeft(deadline.getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return msLeft;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function FrameMockup() {
  return (
    <div className="relative w-[210px] h-[210px] shrink-0">
      <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-brand-pink" />
      <div className="absolute inset-3 rounded-full bg-brand-primary flex items-center justify-center overflow-hidden">
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#fffbe8" strokeWidth="1.4">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      </div>
      <span
        aria-hidden
        className="absolute -top-2 -right-1 w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
      >
        🌴
      </span>
      <span
        aria-hidden
        className="absolute -bottom-2 -left-6 rotate-[-9deg] bg-white rounded-md shadow-[4px_5px_0_rgba(0,0,0,0.2)] px-3 py-2.5 w-[132px]"
      >
        <span className="block h-1.5 w-9 bg-brand-primary rounded-full mb-1.5" />
        <span className="block h-1 w-[70px] bg-black/20 rounded-full mb-1" />
        <span className="block h-1 w-12 bg-black/20 rounded-full mb-1" />
        <span className="inline-block font-heading font-bold text-brand-pink text-[9px] uppercase tracking-wide">
          Builder ID
        </span>
      </span>
    </div>
  );
}

function ParticipationModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div
        className="bg-brand-offwhite rounded-lg p-7 w-full max-w-[400px] shadow-[0_12px_0_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-heading font-extrabold uppercase tracking-[0.08em] text-brand-pink text-[12px] mb-1.5">
              Task #1
            </p>
            <h3 className="font-heading font-bold text-brand-primary text-[22px] uppercase leading-tight">
              Confirm Participation
            </h3>
          </div>

          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-md px-4 py-3.5 flex flex-col gap-2.5">
            <a
              href={SUBMISSION_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading font-bold uppercase text-[12.5px] text-center bg-brand-primary text-white rounded-md px-4 py-2.5 hover:opacity-90 transition-opacity"
            >
              Open Official Submission Form ↗
            </a>
            <ul className="flex flex-col gap-1.5">
              <li className="font-body text-black/70 text-[11px] leading-snug flex gap-1.5">
                <span className="text-brand-pink shrink-0">⚠</span>
                Your submission will be flagged as an error if your X post doesn&rsquo;t actually
                contain the hashtag #FrameInGoa.
              </li>
              <li className="font-body text-black/70 text-[11px] leading-snug flex gap-1.5">
                <span className="text-brand-pink shrink-0">⚠</span>
                1 submission per team, please — once a team has registered, further submissions
                from that team will be rejected.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-start font-body text-[13px] text-black/50 hover:text-brand-pink transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function TasksSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const msLeft = useCountdown(TASK_DEADLINE);
  const closed = msLeft !== null && msLeft <= 0;

  return (
    <section
      id="tasks"
      aria-label="Tasks"
      className="w-full h-full flex flex-col items-center justify-center bg-brand-primary px-6"
    >
      <div className="flex flex-col items-center gap-8 max-w-[1440px] w-full">
        <div className="text-center">
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-accent text-[15px] mb-2">
            Build This
          </p>
          <h2 className="font-heading font-bold uppercase text-brand-white text-[42px] leading-[1.05]">
            Tasks
          </h2>
        </div>

        <div className="flex flex-row items-center gap-9 bg-brand-offwhite rounded-lg px-10 py-9 max-w-[820px] shadow-[8px_10px_0_rgba(0,0,0,0.25)]">
          <FrameMockup />

          <div className="flex flex-col gap-4 text-left">
            <div>
              <p className="font-heading font-extrabold uppercase tracking-[0.08em] text-brand-pink text-[12.5px] mb-1.5">
                Task #1
              </p>
              <h3 className="font-heading font-bold text-brand-primary text-[24px] leading-tight mb-2">
                HH Goa Frame / ID Card Generator
              </h3>
              <p className="font-body text-black/80 text-[14px] leading-snug max-w-[46ch]">
                Design your own HH Goa 2026 themed photo frame generator. Use that same generator
                to bring your teammates into one combined frame. Post it on X with a quick how-to
                on generating your own #FrameInGoa post using your generator — and you&rsquo;re done.
              </p>
            </div>

            <ul className="flex flex-col gap-1.5 items-start">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="font-body text-black/70 text-[12.5px] flex gap-2">
                  <span className="text-brand-pink shrink-0">✦</span>
                  {r}
                </li>
              ))}
            </ul>

            {msLeft !== null && (
              <div
                className={`font-body text-[12px] uppercase tracking-wide px-3 py-2 rounded-md border w-fit ${
                  closed
                    ? "border-red-500/40 text-red-600 bg-red-50"
                    : "border-brand-pink/40 text-brand-pink bg-brand-pink/5"
                }`}
              >
                {closed
                  ? "Submissions closed — the Aug 13, 11:59 PM IST deadline has passed"
                  : `Closes in ${formatCountdown(msLeft)} · Aug 13, 11:59 PM IST`}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setModalOpen(true)}
                disabled={closed}
                className={`font-heading font-bold uppercase text-[13.5px] rounded-full px-6 py-2.5 transition-opacity ${
                  closed
                    ? "bg-black/15 text-black/40 cursor-not-allowed"
                    : "bg-brand-pink text-white hover:opacity-90"
                }`}
              >
                {closed ? "Submissions Closed" : "Confirm Participation"}
              </button>
              <a
                href={TASK_BRIEF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading font-bold uppercase text-[13.5px] border border-brand-pink text-brand-pink rounded-full px-6 py-2.5 hover:bg-brand-pink hover:text-white transition-colors"
              >
                Task Details ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <ParticipationModal onClose={() => setModalOpen(false)} />}
    </section>
  );
}
