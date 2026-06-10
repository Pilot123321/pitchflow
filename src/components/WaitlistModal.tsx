"use client";

import { useState } from "react";
import type { NeedType } from "@/lib/needs";
import { MERIT_TIERS, type MeritTier } from "@/lib/merit";

interface WaitlistModalProps {
  pitchId: string;
  startupName: string;
  founderName: string;
  needType?: NeedType;
  needLabel?: string;
  earlyPerk?: string;
  waitlistCount?: number;
  onClose: () => void;
}

interface MeritResult {
  tier: MeritTier;
  supporterNumber: number;
  perk: string | null;
}

export default function WaitlistModal({
  pitchId,
  startupName,
  founderName,
  needType,
  needLabel,
  earlyPerk,
  waitlistCount,
  onClose,
}: WaitlistModalProps) {
  const isCofounder = needType === "cofounder";
  const title = isCofounder ? "Apply as co-founder" : "Join the waitlist";
  const msgPlaceholder = isCofounder
    ? "Why you'd be a great founding partner, and what you'd own…"
    : "First impressions, feature wishes, doubts — feedback earns merit";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [committed, setCommitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [merit, setMerit] = useState<MeritResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pitchId, name, email, message, committed, needType }),
      });
      const data = await res.json();
      setPosition(typeof data?.waitlistCount === "number" ? data.waitlistCount : (waitlistCount ?? 0) + 1);
      if (data?.merit) setMerit(data.merit);
      setSent(true);
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const stamps = [
    { label: "Interest", icon: "👋", done: true },
    { label: "Feedback", icon: "✍️", done: message.trim().length > 0 },
    { label: "Commit", icon: "🛠️", done: committed },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative paper rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-slide-up">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-clay flex items-center justify-center text-3xl">
              {isCofounder ? "🤝" : merit ? MERIT_TIERS[merit.tier].icon : "🎉"}
            </div>
            <h3 className="font-display text-ink text-xl font-semibold mb-2">
              {isCofounder ? "Application sent!" : merit ? `You're a ${MERIT_TIERS[merit.tier].label}!` : "You're in!"}
            </h3>
            <p className="text-ink/60 text-sm mb-5">
              {isCofounder ? (
                <>{founderName} will review your application and reach out if it&apos;s a fit.</>
              ) : (
                <>
                  You&apos;re <span className="text-ink font-semibold">#{position?.toLocaleString()}</span> on the{" "}
                  <span className="text-ink font-semibold">{startupName}</span> waitlist. The founder sees the count climb in real time.
                </>
              )}
            </p>

            {/* Early Merit punch card */}
            {!isCofounder && merit && (
              <div className="border-2 border-dashed border-ink/15 rounded-xl p-4 mb-5 -rotate-1 text-left bg-ink/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-ink text-sm font-semibold">Early Merit · {startupName}</span>
                  <span className="text-ink/40 text-[10px] font-bold uppercase tracking-wider">No. {merit.supporterNumber.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {stamps.map((s) => (
                    <div
                      key={s.label}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-dashed ${
                        s.done ? "border-moss/60 bg-moss/10" : "border-ink/15"
                      }`}
                    >
                      <span className={`text-base ${s.done ? "" : "opacity-25 grayscale"}`}>{s.icon}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${s.done ? "text-moss" : "text-ink/30"}`}>
                        {s.done ? s.label : `${s.label} —`}
                      </span>
                    </div>
                  ))}
                </div>
                {merit.perk && (
                  <div className="ticket px-3.5 py-1.5 inline-flex items-center gap-1.5 text-clay text-[11px] font-bold uppercase tracking-wide mb-2">
                    🎟 {merit.tier === "founding" ? "Locked in" : "In reach"} · {merit.perk}
                  </div>
                )}
                <p className="text-ink/50 text-[11px] leading-relaxed">
                  {MERIT_TIERS[merit.tier].blurb} Your merit is on record with {founderName} — redeemable at launch.
                </p>
              </div>
            )}

            <button onClick={onClose} className="px-8 py-3 rounded-full bg-ink text-cream font-display font-semibold text-sm">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-ink text-lg font-semibold">{title}</h3>
                <p className="text-ink/50 text-sm">{needLabel || `for ${startupName}`} &middot; {founderName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* What early supporters earn */}
            {!isCofounder && earlyPerk && (
              <div className="ticket px-3.5 py-1.5 inline-flex items-center gap-1.5 text-clay text-[11px] font-bold uppercase tracking-wide mb-4">
                🎟 Early perk · {earlyPerk}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">
                  {isCofounder ? "Your pitch" : "Feedback (earns merit)"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors resize-none"
                  placeholder={msgPlaceholder}
                />
              </div>

              {/* Founding-tester commitment */}
              {!isCofounder && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    committed ? "border-moss/60 bg-moss/10" : "border-ink/15 hover:border-ink/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={committed}
                    onChange={(e) => setCommitted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#698019]"
                  />
                  <span className="text-ink/70 text-xs leading-relaxed">
                    <span className="font-bold text-ink">🛠️ Commit as a founding tester.</span> Use the beta regularly and
                    share what works and what doesn&apos;t. Locks in the full early perk
                    {earlyPerk ? `: ${earlyPerk.toLowerCase()}` : ""}.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : isCofounder ? "Send application" : committed ? "Join as founding tester" : "Join waitlist"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
