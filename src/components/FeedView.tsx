"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PitchCard from "./PitchCard";
import CoffeeChatModal from "./CoffeeChatModal";
import WaitlistModal from "./WaitlistModal";
import type { NeedType } from "@/lib/needs";
import { sceneFor } from "@/lib/scenes";
import { paletteFor } from "@/lib/palette";
import { sky } from "@/components/AuroraSky";
import Constellation3D from "@/components/Constellation3D";

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
  const router = useRouter();
  const [tier, setTier] = useState<TierKey>("launch");
  const [actionPitch, setActionPitch] = useState<Pitch | null>(null);
  const [focalIndex, setFocalIndex] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const actionPitchRef = useRef<Pitch | null>(null);
  actionPitchRef.current = actionPitch;

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
    // Film advance: one reel of scroll pulls four sprocket holes past;
    // the header reel spins with it and the aurora sky reads the same bus
    headerRef.current?.style.setProperty("--film", `${(pos * 64).toFixed(1)}px`);
    headerRef.current?.style.setProperty("--reel-rot", `${(pos * 180).toFixed(1)}deg`);
    sky.pos = pos;
    const focal = Math.min(pitches.length - 1, Math.max(0, Math.round(pos)));
    sky.name = pitches[focal]?.startupName ?? "";
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
    sky.palettes = pitches.map((p) => paletteFor(p.gradient));
    cardRefs.current = cardRefs.current.slice(0, pitches.length);
    containerRef.current?.scrollTo({ top: 0 });
    setFocalIndex(0);
    syncScroll();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitches]);

  // House lights: settle into a reel for a few seconds and the chrome
  // dims like a theater going dark; any input raises the lights.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function lightsUp() {
      document.body.removeAttribute("data-lights");
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!actionPitchRef.current) document.body.setAttribute("data-lights", "down");
      }, 4000);
    }
    const opts = { capture: true } as AddEventListenerOptions;
    ["pointermove", "pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, lightsUp));
    window.addEventListener("scroll", lightsUp, opts);
    lightsUp();
    return () => {
      ["pointermove", "pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, lightsUp));
      window.removeEventListener("scroll", lightsUp, opts);
      clearTimeout(timer);
      document.body.removeAttribute("data-lights");
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("pf-tips-seen")) setShowTips(true);
    setSoundOn(localStorage.getItem("pf-sound") === "1");
  }, []);

  function toggleSound() {
    const v = !soundOn;
    setSoundOn(v);
    try {
      localStorage.setItem("pf-sound", v ? "1" : "0");
    } catch {}
  }

  function dismissTips() {
    setShowTips(false);
    try {
      localStorage.setItem("pf-tips-seen", "1");
    } catch {}
  }

  // Keyboard: ↑/↓ or j/k move between reels, L likes, C opens the pitch
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (actionPitch || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(Math.min(pitches.length - 1, focalIndex + 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(Math.max(0, focalIndex - 1));
      } else if (e.key === "l") {
        document.querySelector<HTMLElement>('[data-focal="true"] [data-action="upvote"]')?.click();
      } else if (e.key === "c") {
        const p = pitches[focalIndex];
        if (p) router.push(`/pitch/${p.id}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focalIndex, pitches, actionPitch]);

  const isInvestorAsk = actionPitch?.needType === "investors";

  return (
    <>
      {/* Header: cream paper bar, Hack the North style */}
      <div ref={headerRef} className="chrome-dim fixed top-0 left-0 right-0 z-40 pt-[env(safe-area-inset-top)] paper">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-ink text-xl font-semibold tracking-tight flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-clay"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: "rotate(var(--reel-rot, 0deg))" }}
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <circle cx="12" cy="6.8" r="1.7" />
                <circle cx="16.9" cy="10.4" r="1.7" />
                <circle cx="15.1" cy="16.3" r="1.7" />
                <circle cx="8.9" cy="16.3" r="1.7" />
                <circle cx="7.1" cy="10.4" r="1.7" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
              <span>Pitch<span className="text-clay">Flow</span></span>
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
            className="px-3.5 py-1.5 rounded-full bg-brick text-cream text-xs font-display font-semibold shadow hover:bg-[#ff7a93] transition-colors"
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
        <div className="absolute left-0 right-0 top-full h-3.5 film-edge" aria-hidden />
      </div>

      {/* Overview+detail rail: a minimap of the feed. The focal dot
          stretches and labels itself; any dot jumps to its pitch. */}
      {pitches.length > 1 && (
        <nav
          aria-label="Pitch overview"
          className="chrome-dim fixed left-6 top-[36%] -translate-y-1/2 z-40 flex flex-col items-start gap-2"
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
                  className={`block rounded-[3px] bg-gradient-to-br ${sceneFor(p.gradient)} transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    isFocal
                      ? "w-4 h-6 ring-2 ring-ink/70 shadow-md"
                      : "w-3 h-2 opacity-60 ring-1 ring-ink/25 group-hover:opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-3 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-cream text-ink shadow text-[9px] font-bold transition-all duration-300 ${
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

      {/* 3D constellation of the focal startup, floating in the sky */}
      <Constellation3D />

      {/* Feed (the aurora sky behind it is mounted once in the layout) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-10 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ perspective: "1300px" }}
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
              className="reel-3d h-screen w-full snap-start relative"
            >
              <PitchCard {...pitch} isFocal={i === focalIndex} soundOn={soundOn} onToggleSound={toggleSound} onAction={() => setActionPitch(pitch)} />
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
      {/* First-visit ticket: teaches the hidden gestures */}
      {showTips && (
        <div className="tip-ticket fixed left-3 top-[7.9rem] z-40 paper rounded-xl px-3.5 py-3 max-w-[238px]">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-display text-ink text-xs font-semibold">🎬 How it works</p>
            <button onClick={dismissTips} aria-label="Dismiss tips" className="text-ink/40 hover:text-ink text-sm leading-none">
              ✕
            </button>
          </div>
          <ul className="text-ink/65 text-[11px] leading-relaxed space-y-1">
            <li>👆 tap reel = sound · hold 1s = pause</li>
            <li>⇆ swipe the card away to watch clean</li>
            <li>⌨️ j / k or ↑↓ flip reels · L likes</li>
            <li>🛠️ commit to a beta → lock the perk</li>
          </ul>
        </div>
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
