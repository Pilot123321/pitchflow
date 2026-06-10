"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MERIT_TIERS, type MeritTier } from "@/lib/merit";

interface MeritCard {
  pitchId: string;
  startupName: string;
  founderName: string;
  perk: string | null;
  tier: MeritTier;
  committed: boolean;
  gaveFeedback: boolean;
  supporterNumber: number;
  joinedAt: string;
}

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [lookedUp, setLookedUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [merits, setMerits] = useState<MeritCard[]>([]);

  async function lookup(addr: string) {
    if (!addr.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/merits?email=${encodeURIComponent(addr.trim())}`);
      const data = await res.json();
      setMerits(Array.isArray(data) ? data : []);
      setLookedUp(true);
      localStorage.setItem("pf-email", addr.trim());
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    const saved = localStorage.getItem("pf-email");
    if (saved) {
      setEmail(saved);
      lookup(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-ink text-2xl font-semibold mb-1">Merit Passport</h1>
          <p className="text-ink/50 text-sm">
            Every waitlist you join, every piece of feedback, every beta commitment earns merit
            founders honor at launch. Look yours up by the email you supported with.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(email);
          }}
          className="flex gap-2 mb-7"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="flex-1 px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-full bg-brick text-cream font-display font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "…" : "Look up"}
          </button>
        </form>

        {lookedUp && merits.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-ink/15 rounded-2xl">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-ink/60 text-sm mb-4">No merit on record for this email yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-full bg-clay text-cream font-display font-semibold text-sm"
            >
              Back startups in the feed
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {merits.map((m) => {
            const tier = MERIT_TIERS[m.tier] ?? MERIT_TIERS.believer;
            const stamps = [
              { label: "Interest", icon: "👋", done: true },
              { label: "Feedback", icon: "✍️", done: m.gaveFeedback },
              { label: "Commit", icon: "🛠️", done: m.committed },
            ];
            return (
              <div key={`${m.pitchId}-${m.joinedAt}`} className="paper rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <Link href={`/pitch/${m.pitchId}`} className="font-display text-ink font-semibold">
                    {tier.icon} {m.startupName}
                  </Link>
                  <span className="text-ink/40 text-[10px] font-bold uppercase tracking-wider">
                    No. {m.supporterNumber.toLocaleString()}
                  </span>
                </div>
                <p className="text-ink/50 text-xs mb-3">
                  {tier.label} · since{" "}
                  {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  {stamps.map((st) => (
                    <div
                      key={st.label}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-dashed ${
                        st.done ? "border-moss/60 bg-moss/10" : "border-ink/15"
                      }`}
                    >
                      <span className={`text-base ${st.done ? "" : "opacity-25 grayscale"}`}>{st.icon}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          st.done ? "text-moss" : "text-ink/30"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
                {m.perk && (
                  <div className="ticket px-3.5 py-1.5 inline-flex items-center gap-1.5 text-clay text-[11px] font-bold uppercase tracking-wide">
                    🎟 {m.tier === "founding" ? "Locked in" : "In reach"} · {m.perk}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
