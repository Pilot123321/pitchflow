"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

// Copy per ask type. `investors` routes to CoffeeChatModal instead,
// but is included so the record stays total over NeedType.
const COPY: Record<NeedType, {
  title: string;
  msgLabel: string;
  placeholder: string;
  submit: string;
  sentIcon: string;
  sentTitle: string;
  sentBody: string;
}> = {
  users: {
    title: "Join the waitlist",
    msgLabel: "Feedback (earns merit)",
    placeholder: "First impressions, feature wishes, doubts — feedback earns merit",
    submit: "Join waitlist",
    sentIcon: "🎉",
    sentTitle: "You're in!",
    sentBody: "",
  },
  investors: {
    title: "Request coffee chat",
    msgLabel: "Message (optional)",
    placeholder: "I'm an investor interested in your space...",
    submit: "Send request",
    sentIcon: "☕",
    sentTitle: "Request sent!",
    sentBody: "will receive your coffee chat request and reply by email.",
  },
  cofounder: {
    title: "Apply as co-founder",
    msgLabel: "Your pitch",
    placeholder: "Why you'd be a great founding partner, and what you'd own…",
    submit: "Send application",
    sentIcon: "🤝",
    sentTitle: "Application sent!",
    sentBody: "will review your application and reach out if it's a fit.",
  },
  recruiting: {
    title: "Apply to join the team",
    msgLabel: "Why you?",
    placeholder: "Your background, what you'd want to own, links to your work…",
    submit: "Send application",
    sentIcon: "💼",
    sentTitle: "Application sent!",
    sentBody: "will review your application and reach out if it's a fit.",
  },
  marketing: {
    title: "Help spread the word",
    msgLabel: "Where will you share it?",
    placeholder: "X, LinkedIn, newsletter, campus group chat — your channels…",
    submit: "Count me in",
    sentIcon: "📣",
    sentTitle: "You're on the street team!",
    sentBody: "will send you the launch kit and share links.",
  },
};

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
  const variant: NeedType = needType ?? "users";
  const isUsers = variant === "users";
  const copy = COPY[variant];

  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [committed, setCommitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [merit, setMerit] = useState<MeritResult | null>(null);


  useEffect(() => {
    if (session?.user) {
      setName((n) => n || session.user?.name || "");
      setEmail((e) => e || session.user?.email || "");
    }
  }, [session]);

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
              {isUsers && merit ? MERIT_TIERS[merit.tier].icon : copy.sentIcon}
            </div>
            <h3 className="font-display text-ink text-xl font-semibold mb-2">
              {isUsers && merit ? `You're a ${MERIT_TIERS[merit.tier].label}!` : copy.sentTitle}
            </h3>
            <p className="text-ink/60 text-sm mb-5">
              {isUsers ? (
                <>
                  You&apos;re <span className="text-ink font-semibold">#{position?.toLocaleString()}</span> on the{" "}
                  <span className="text-ink font-semibold">{startupName}</span> waitlist. The founder sees the count climb in real time.
                </>
              ) : (
                <>{founderName} {copy.sentBody}</>
              )}
            </p>

            {/* Early Merit punch card */}
            {isUsers && merit && (
              <div className="border-2 border-dashed border-ink/15 rounded-xl p-4 mb-5 text-left bg-ink/[0.02]">
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
                <h3 className="font-display text-ink text-lg font-semibold">{copy.title}</h3>
                <p className="text-ink/50 text-sm">{needLabel || `for ${startupName}`} &middot; {founderName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* What early supporters earn */}
            {earlyPerk && (
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
                  readOnly={!!session?.user?.email}
                  className={`w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors ${
                    session?.user?.email ? "opacity-70" : ""
                  }`}
                  placeholder="jane@example.com"
                />
                {session?.user?.email && (
                  <p className="text-moss text-[10px] font-semibold mt-1">✓ verified via Google</p>
                )}
              </div>
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">{copy.msgLabel}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors resize-none"
                  placeholder={copy.placeholder}
                />
              </div>

              {/* Founding-tester commitment (early merit asks only) */}
              {isUsers && (
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
                {loading ? "Sending..." : isUsers && committed ? "Join as founding tester" : copy.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
