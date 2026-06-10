"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PitchCard from "./PitchCard";
import CoffeeChatModal from "./CoffeeChatModal";
import WaitlistModal from "./WaitlistModal";
import type { NeedType } from "@/lib/needs";

interface Pitch {
  id: string;
  founderName: string;
  founderTitle: string;
  founderAvatar: string;
  startupName: string;
  tagline: string;
  description: string;
  videoUrl: string;
  category: string;
  stage: string;
  traction: string;
  location: string;
  askAmount: string;
  upvotes: number;
  comments: number;
  chatRequests: number;
  calendlyUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  createdAt: string;
  gradient: string;
  tier?: "launch" | "idea";
  needType?: NeedType;
  needLabel?: string;
  earlyPerk?: string;
  waitlistCount?: number;
  videoSeconds?: number;
}

type TierKey = "launch" | "idea";

const TABS: { key: TierKey; label: string }[] = [
  { key: "launch", label: "🚀 Launches" },
  { key: "idea", label: "💡 Ideas" },
];

export default function FeedView({ initialPitches }: { initialPitches: Pitch[] }) {
  const [tier, setTier] = useState<TierKey>("launch");
  const [actionPitch, setActionPitch] = useState<Pitch | null>(null);
  const [focalIndex, setFocalIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);

  const pitches = useMemo(
    () => initialPitches.filter((p) => (p.tier ?? "launch") === tier),
    [initialPitches, tier]
  );

  // Writes --focus/--offset straight onto card DOM nodes so the
  // per-frame scroll loop never touches React state; only the
  // discrete focal index (rail, disclosure) goes through setState.
  function syncScroll() {
    const el = containerRef.current;
    if (!el || el.clientHeight === 0) return;
    const pos = el.scrollTop / el.clientHeight;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const d = i - pos;
      card.style.setProperty("--offset", String(Math.max(-1, Math.min(1, d))));
      card.style.setProperty("--focus", String(Math.max(0, 1 - Math.abs(d))));
    });
    // Header flap: flat when snapped on a reel, fully bent mid-flick
    const frac = pos - Math.floor(pos);
    const bend = Math.sin(Math.PI * Math.min(1, Math.max(0, frac)));
    headerRef.current?.style.setProperty("--bend", bend.toFixed(3));
    const focal = Math.min(pitches.length - 1, Math.max(0, Math.round(pos)));
    setFocalIndex((f) => (f === focal ? f : focal));
  }

  function handleScroll() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(syncScroll);
  }

  function scrollToIndex(i: number) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" });
  }

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, pitches.length);
    containerRef.current?.scrollTo({ top: 0 });
    setFocalIndex(0);
    syncScroll();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitches]);

  const isInvestorAsk = actionPitch?.needType === "investors";

  return (
    <>
      {/* Header: cream paper bar, Hack the North style */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-40 pt-[env(safe-area-inset-top)] paper">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-ink text-xl font-semibold tracking-tight">
              Pitch<span className="text-clay">Flow</span>
            </h1>
            <Link
              href="/rfs"
              className="px-2 py-0.5 rounded-md border border-dashed border-ink/30 text-[10px] font-bold uppercase tracking-wider text-ink/60 hover:text-ink hover:border-ink/50 transition-colors"
            >
              RFS
            </Link>
          </div>
          <Link
            href="/brainstorm"
            className="px-3.5 py-1.5 rounded-full bg-brick text-cream text-xs font-display font-semibold shadow hover:bg-[#8f1f1f] transition-colors"
          >
            ✦ Brainstorm
          </Link>
        </div>
        {/* Tier tabs */}
        <div className="flex items-center justify-center gap-6 pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTier(t.key)}
              className={`relative font-display text-sm font-semibold pb-1.5 transition-colors ${
                tier === t.key ? "text-ink" : "text-ink/40 hover:text-ink/70"
              }`}
            >
              {t.label}
              {tier === t.key && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-6 h-[3px] rounded-full bg-clay" />
              )}
            </button>
          ))}
        </div>
        <div className="absolute left-0 right-0 top-full h-2.5 paper-torn" aria-hidden />
      </div>

      {/* Overview+detail rail: a minimap of the feed. The focal dot
          stretches and labels itself; any dot jumps to its pitch. */}
      {pitches.length > 1 && (
        <nav
          aria-label="Pitch overview"
          className="fixed left-4 top-[36%] -translate-y-1/2 z-40 flex flex-col items-start gap-2.5"
        >
          {pitches.map((p, i) => {
            const isFocal = i === focalIndex;
            return (
              <button
                key={p.id}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to ${p.startupName}`}
                aria-current={isFocal}
                className="group relative flex items-center py-0.5"
              >
                <span
                  className={`block w-1.5 rounded-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    isFocal ? "h-6 bg-cream shadow" : "h-1.5 bg-cream/40 group-hover:bg-cream/70"
                  }`}
                />
                <span
                  className={`absolute left-4 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-cream text-ink shadow text-[10px] font-bold transition-all duration-300 ${
                    isFocal ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1 pointer-events-none"
                  }`}
                >
                  {p.startupName}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {pitches.length === 0 ? (
          <div className="h-screen flex items-center justify-center text-white/40 text-sm">
            No {tier === "idea" ? "ideas" : "launches"} yet.
          </div>
        ) : (
          pitches.map((pitch, i) => (
            <div
              key={pitch.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-focal={i === focalIndex}
              className="h-screen w-full snap-start relative"
            >
              <PitchCard {...pitch} onAction={() => setActionPitch(pitch)} />
            </div>
          ))
        )}
      </div>

      {/* Contextual conversion modal */}
      {actionPitch && isInvestorAsk && (
        <CoffeeChatModal
          pitchId={actionPitch.id}
          startupName={actionPitch.startupName}
          founderName={actionPitch.founderName}
          calendlyUrl={actionPitch.calendlyUrl}
          onClose={() => setActionPitch(null)}
        />
      )}
      {actionPitch && !isInvestorAsk && (
        <WaitlistModal
          pitchId={actionPitch.id}
          startupName={actionPitch.startupName}
          founderName={actionPitch.founderName}
          needType={actionPitch.needType}
          needLabel={actionPitch.needLabel}
          earlyPerk={actionPitch.earlyPerk}
          waitlistCount={actionPitch.waitlistCount}
          onClose={() => setActionPitch(null)}
        />
      )}
    </>
  );
}
