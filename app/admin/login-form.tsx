"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Incorrect password.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/50 border border-black/10 rounded-lg p-8 flex flex-col gap-5"
      >
        <div>
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[13px] mb-2">
            HH GOA
          </p>
          <h1 className="font-heading font-bold uppercase text-brand-primary text-[28px] leading-tight">
            Timeline Dashboard
          </h1>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-body text-[13px] uppercase tracking-wide text-black/70">Password</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-body text-[15px] text-black bg-white border border-black/20 rounded-md px-3 py-2 outline-none focus:border-brand-pink transition-colors"
            placeholder="••••••••"
          />
        </label>

        {error && <p className="font-body text-[13px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="font-heading font-bold uppercase text-[14px] bg-brand-primary text-white rounded-md py-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {submitting ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
