"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

interface MeritCard {
  pitchId: string;
  committed: boolean;
  gaveFeedback: boolean;
}

interface MyPitch {
  id: string;
  startupName: string;
  tagline: string;
  tier: string;
  founderName: string;
  updates?: { date: string }[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [merits, setMerits] = useState<MeritCard[]>([]);
  const [myPitches, setMyPitches] = useState<MyPitch[]>([]);

  // Is the Google provider configured yet?
  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => setGoogleReady(!!p?.google))
      .catch(() => setGoogleReady(false));
  }, []);

  // Identity: Google wins; otherwise whatever this device has used before.
  useEffect(() => {
    const verified = session?.user?.email;
    setEmail(verified ?? localStorage.getItem("pf-email"));
    setName(session?.user?.name ?? localStorage.getItem("pf-name") ?? "");
  }, [session?.user?.email, session?.user?.name]);

  // Backing stats come from the merit ledger for your email.
  useEffect(() => {
    if (!email) return;
    fetch(`/api/merits?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => setMerits(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [email]);

  // Your pitches: matched by the founder name you post under.
  useEffect(() => {
    if (!name.trim()) {
      setMyPitches([]);
      return;
    }
    fetch("/api/pitches")
      .then((r) => r.json())
      .then((all) => {
        if (!Array.isArray(all)) return;
        setMyPitches(
          all.filter((p: MyPitch) => p.founderName?.toLowerCase() === name.trim().toLowerCase())
        );
      })
      .catch(() => {});
  }, [name]);

  function saveName(v: string) {
    setName(v);
    localStorage.setItem("pf-name", v);
  }

  const feedbackCount = merits.filter((m) => m.gaveFeedback).length;
  const commitCount = merits.filter((m) => m.committed).length;

  return (
    <div className="min-h-screen px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-ink text-2xl font-semibold mb-1">Profile</h1>
          <p className="text-ink/50 text-sm">You, on PitchFlow — what you&apos;ve posted and backed.</p>
        </div>

        {/* Identity card */}
        {session?.user ? (
          <div className="paper rounded-2xl p-4 mb-4 flex items-center gap-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-12 h-12 rounded-full border-2 border-ink/10" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-lg">
                {(session.user.name ?? "?").slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display text-ink text-base font-semibold truncate">{session.user.name}</p>
              <p className="text-ink/50 text-xs truncate">
                {session.user.email} · <span className="text-moss font-semibold">✓ verified</span>
              </p>
            </div>
            <button onClick={() => signOut()} className="px-3.5 py-2 rounded-full bg-ink/10 text-ink text-xs font-bold hover:bg-ink/15 transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <div className="paper rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-ink/10 text-ink/60 flex items-center justify-center font-bold text-lg">
                {(name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  value={name}
                  onChange={(e) => saveName(e.target.value)}
                  placeholder="Your founder name"
                  className="w-full bg-transparent font-display text-ink text-base font-semibold placeholder:text-ink/30 focus:outline-none"
                />
                <p className="text-ink/50 text-xs truncate">
                  {email ? `${email} · unverified` : "no email on this device yet"}
                </p>
              </div>
            </div>
            {status !== "loading" && googleReady && (
              <button
                onClick={() => signIn("google")}
                className="w-full py-2.5 rounded-full bg-ink text-cream font-display font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#FDF7EA" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                  <path fill="#FDF7EA" opacity=".7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
                  <path fill="#FDF7EA" opacity=".5" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"/>
                  <path fill="#FDF7EA" opacity=".85" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Verify with Google
              </button>
            )}
            {status !== "loading" && googleReady === false && (
              <p className="text-ink/40 text-[11px]">Google login needs keys in .env.local — see the README.</p>
            )}
          </div>
        )}

        {/* Your numbers */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { n: myPitches.length, label: "Pitches" },
            { n: merits.length, label: "Backed" },
            { n: feedbackCount, label: "Feedback" },
            { n: commitCount, label: "Commits" },
          ].map((s) => (
            <div key={s.label} className="paper rounded-xl py-3 text-center">
              <p className="font-display text-ink text-lg font-bold leading-none mb-1">{s.n}</p>
              <p className="text-ink/40 text-[9px] font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Your pitches */}
        <p className="text-ink/40 text-[11px] font-bold uppercase tracking-wider mb-2">Your pitches</p>
        {myPitches.length === 0 ? (
          <div className="border-2 border-dashed border-ink/15 rounded-2xl p-4 mb-5">
            <p className="text-ink/50 text-xs">
              {name.trim()
                ? `Nothing posted as “${name.trim()}” yet.`
                : "Set your founder name above to see your pitches."}{" "}
              <Link href="/brainstorm" className="text-clay font-bold">Brainstorm one →</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mb-5">
            {myPitches.map((p) => (
              <Link key={p.id} href={`/pitch/${p.id}`} className="paper rounded-2xl p-3.5 flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="font-display text-ink text-sm font-semibold truncate">{p.startupName}</p>
                  <p className="text-ink/50 text-xs truncate">{p.tagline}</p>
                </div>
                <span
                  className={`ml-3 shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    p.tier === "idea" ? "bg-clay/15 text-clay" : "bg-brick/15 text-brick"
                  }`}
                >
                  {p.tier === "idea" ? "Idea" : "Launch"}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Where the rest of you lives */}
        <div className="space-y-3">
          <Link href="/merit" className="paper rounded-2xl p-4 flex items-center justify-between group">
            <div>
              <p className="font-display text-ink text-sm font-semibold mb-0.5">Merit Passport</p>
              <p className="text-ink/50 text-xs">Your stamps from every startup you&apos;ve backed.</p>
            </div>
            <span className="text-clay text-lg group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link href="/dashboard" className="paper rounded-2xl p-4 flex items-center justify-between group">
            <div>
              <p className="font-display text-ink text-sm font-semibold mb-0.5">Founder dashboard</p>
              <p className="text-ink/50 text-xs">Your pitches, supporters, and momentum.</p>
            </div>
            <span className="text-clay text-lg group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
