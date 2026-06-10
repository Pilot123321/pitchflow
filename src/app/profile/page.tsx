"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [lookedUp, setLookedUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [merits, setMerits] = useState<MeritCard[]>([]);

  // Is the Google provider configured yet?
  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => setGoogleReady(!!p?.google))
      .catch(() => setGoogleReady(false));
  }, []);

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
    // A signed-in Google account wins; otherwise fall back to the last
    // email used on this device.
    const verified = session?.user?.email;
    const saved = verified ?? localStorage.getItem("pf-email");
    if (saved) {
      setEmail(saved);
      lookup(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

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

        {/* Account: Google sign-in, signed-in card, or setup steps */}
        {status !== "loading" && !session && googleReady && (
          <button
            onClick={() => signIn("google")}
            className="w-full mb-4 py-3 rounded-full bg-ink text-cream font-display font-semibold text-sm flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#FDF7EA" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#FDF7EA" opacity=".7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
              <path fill="#FDF7EA" opacity=".5" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"/>
              <path fill="#FDF7EA" opacity=".85" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>
        )}
        {status !== "loading" && !session && googleReady === false && (
          <div className="border-2 border-dashed border-ink/15 rounded-xl p-4 mb-5 bg-ink/[0.02]">
            <p className="font-display text-ink text-sm font-semibold mb-1.5">🔑 Google login is wired up — add your keys to switch it on</p>
            <ol className="text-ink/60 text-xs leading-relaxed list-decimal pl-4 space-y-0.5">
              <li>console.cloud.google.com → create project → OAuth consent screen (External)</li>
              <li>Credentials → Create OAuth client ID → Web application</li>
              <li>Redirect URI: <code className="bg-ink/10 rounded px-1">http://localhost:3000/api/auth/callback/google</code></li>
              <li>Put the client ID + secret into <code className="bg-ink/10 rounded px-1">.env.local</code> and restart</li>
            </ol>
          </div>
        )}
        {session?.user && (
          <div className="paper rounded-2xl p-4 mb-5 flex items-center gap-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-11 h-11 rounded-full border-2 border-ink/10" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-clay text-cream flex items-center justify-center font-bold">
                {(session.user.name ?? "?").slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display text-ink text-sm font-semibold truncate">{session.user.name}</p>
              <p className="text-ink/50 text-xs truncate">{session.user.email} · <span className="text-moss font-semibold">✓ verified</span></p>
            </div>
            <button onClick={() => signOut()} className="px-3.5 py-2 rounded-full bg-ink/10 text-ink text-xs font-bold hover:bg-ink/15 transition-colors">
              Sign out
            </button>
          </div>
        )}

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
            readOnly={!!session?.user?.email}
            placeholder="jane@example.com"
            className={`flex-1 px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors ${
              session?.user?.email ? "opacity-70" : ""
            }`}
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

        <div className="mb-5 text-right">
          <Link href="/dashboard" className="text-clay text-xs font-bold">Founder? Open your dashboard →</Link>
        </div>

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
