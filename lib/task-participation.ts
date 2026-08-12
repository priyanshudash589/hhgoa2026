export type ParticipationEntry = {
  id: string;
  name: string;
  email: string;
  teamOrHandle: string | null;
  createdAt: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateParticipationInput(input: {
  name: unknown;
  email: unknown;
  teamOrHandle: unknown;
}): { ok: true; value: { name: string; email: string; teamOrHandle: string | null } } | { ok: false; error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const teamOrHandleRaw = typeof input.teamOrHandle === "string" ? input.teamOrHandle.trim() : "";

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "A valid email is required." };

  return {
    ok: true,
    value: { name, email, teamOrHandle: teamOrHandleRaw || null },
  };
}
