export type TimelinePhase = {
  id: string;
  name: string;
  when: string;
  purpose: string;
};

export const TIMELINE_PHASES: readonly TimelinePhase[] = [
  { id: "registration-begins", name: "Registration Begins", when: "7 May 2026", purpose: "Applications open — start your HH GOA journey." },
  { id: "open-trials", name: "Open Trials", when: "August 2026", purpose: "Skill-based challenges open to everyone." },
  { id: "alpha-selections", name: "Alpha Selections", when: "Early Sept 2026", purpose: "First shortlist from Open Trials performance." },
  { id: "beta-selections", name: "Beta Selections", when: "Early Sept 2026", purpose: "Deeper technical & portfolio review." },
  { id: "charlie-selections", name: "Charlie Selections", when: "Mid Sept 2026", purpose: "Interviews and team-fit assessment." },
  { id: "delta-selections", name: "Delta Selections", when: "Mid Sept 2026", purpose: "Final shortlist confirmed before partner matching." },
  { id: "partner-trials", name: "Partner Trials", when: "September 2026", purpose: "Selection based on each partner's requirements and interests." },
  { id: "rsvp-stake", name: "RSVP & Stake", when: "Late September", purpose: "Final confirmation of your team's participation." },
  { id: "registration-ends", name: "Registration Ends", when: "1 October 2026", purpose: "Last day to register — no new entries accepted after this date." },
  { id: "residency", name: "Residency", when: "28–31 October 2026", purpose: "247 builders come together to build, ship, and launch projects in Goa." },
] as const;

export const TIMELINE_STATUSES = [
  "Completed",
  "Running",
  "To Be Started",
  "Evaluated",
  "Results Out",
] as const;

export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];

export type TimelineStatusMap = Partial<Record<string, TimelineStatus>>;

export function isTimelineStatus(value: unknown): value is TimelineStatus {
  return typeof value === "string" && (TIMELINE_STATUSES as readonly string[]).includes(value);
}

export function isTimelinePhaseId(value: unknown): value is string {
  return typeof value === "string" && TIMELINE_PHASES.some((phase) => phase.id === value);
}
