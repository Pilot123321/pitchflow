"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ctaFor, type NeedType } from "@/lib/needs";
import { sceneFor } from "@/lib/scenes";

interface PitchCardProps {
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
  gradient: string;
  tier?: "launch" | "idea";
  needType?: NeedType;
  needLabel?: string;
  earlyPerk?: string;
  waitlistCount?: number;
  videoSeconds?: number;
  isFocal?: boolean;
  onAction: (id: string) => void;
}

const BURST_PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * 2 * Math.PI;
  const dist = 44 + (i % 3) * 16;
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist - 26,
    rot: ((i * 47) % 90) - 45,
  };
});

export default function PitchCard({
  id,
  founderName,
  founderTitle,
  startupName,
  tagline,
  videoUrl,
  category,
  stage,
  traction,
  location,
  askAmount,
  upvotes: initialUpvotes,
  comments,
  gradient,
  tier,
  needType,
  needLabel,
  earlyPerk,
  videoSeconds,
  isFocal,
  onAction,
}: PitchCardProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [shared, setShared] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = !videoFailed && /\.(mp4|webm|mov)(\?|#|$)/i.test(videoUrl ?? "");

  // The reel plays while focal, rewinds when scrolled away — matching
  // how the progress border resets for gradient-only cards.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isFocal) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
      rootRef.current?.style.setProperty("--played", "0");
    }
  }, [isFocal, isVideo]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    rootRef.current?.style.setProperty("--played", (v.currentTime / v.duration).toFixed(4));
  }

  // Upvotes survive refresh: hydrate from the local ledger
  useEffect(() => {
    try {
      if (JSON.parse(localStorage.getItem("pf-upvoted") ?? "[]").includes(id)) setHasUpvoted(true);
    } catch {}
  }, [id]);

  const action = ctaFor(needType);
  const isIdea = tier === "idea";
  const scene = sceneFor(gradient);

  // Pointer position drives the background spotlight, so the card
  // answers every move of the cursor instead of sitting inert under it.
  function handlePointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  async function handleUpvote() {
    if (hasUpvoted) return;
    setIsAnimating(true);
    setHasUpvoted(true);
    setUpvotes((v) => v + 1);
    setBurstKey(Date.now());
    rememberUpvote(true);
    try {
      await fetch("/api/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      setUpvotes((v) => v - 1);
      setHasUpvoted(false);
      rememberUpvote(false);
    }
    setTimeout(() => setIsAnimating(false), 600);
  }

  function rememberUpvote(add: boolean) {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("pf-upvoted") ?? "[]");
      const next = add ? [...new Set([...ids, id])] : ids.filter((x) => x !== id);
      localStorage.setItem("pf-upvoted", JSON.stringify(next));
    } catch {}
  }

  async function handleShare() {
    const url = `${window.location.origin}/pitch/${id}`;
    const payload = { title: `${startupName} on PitchFlow`, text: tagline, url };
    if (navigator.share) {
      try { await navigator.share(payload); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setShared(true);
    setTimeout(() => setShared(false), 1600);
  }

  return (
    <div
      ref={rootRef}
      onPointerMove={handlePointerMove}
      className={`h-full w-full relative flex flex-col overflow-hidden ${isVideo ? "reel-live" : ""}`}
      style={{ "--reel-duration": `${videoSeconds ?? 45}s` } as CSSProperties}
    >
      {/* Background scenery (simulates video), parallax-linked to scroll */}
      <div className={`absolute inset-0 feed-card-bg bg-gradient-to-br ${scene}`}>
        {isVideo && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload={isFocal ? "auto" : "none"}
            onTimeUpdate={handleTimeUpdate}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute inset-0 feed-spotlight" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/25 to-transparent" />
      </div>

      {/* Reel progress frame: spans the whole visible screen (below the
          header, above the dock); the card and action stickers live
          inside it. Fills clockwise as the reel plays. */}
      <div className="absolute left-1.5 right-1.5 top-[7rem] bottom-[5.25rem] z-20 pointer-events-none" aria-hidden>
        <svg className="reel-frame w-full h-full">
          <rect className="reel-track" x="2" y="2" rx="18" pathLength={100}
            style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
            stroke="rgba(253, 247, 234, 0.2)" strokeWidth="3.5" />
          <rect className="reel-progress" x="2" y="2" rx="18" pathLength={100}
            style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
            stroke="rgba(253, 247, 234, 0.95)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Scene zone: everything above the paper card lives here, so the
          play button and action rail can never collide with the card. */}
      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center pt-24">
        {/* Idea tag: hand-placed sticker */}
        {isIdea && (
          <div className="absolute top-28 left-4 px-2.5 py-1 -rotate-2 rounded-md bg-cream text-ink border border-dashed border-ink/30 text-[10px] font-bold uppercase tracking-wider shadow reveal">
            💡 Idea · validating
          </div>
        )}

        {/* Play button: dead-center of the scene zone; a real control
            when the pitch has a video */}
        <button
          onClick={isVideo ? togglePlay : undefined}
          aria-label={playing ? "Pause pitch video" : "Play pitch video"}
          className={`breathe w-20 h-20 rounded-full bg-cream/15 backdrop-blur-sm flex items-center justify-center border-2 border-cream/40 transition-opacity duration-500 ${
            playing ? "opacity-25 hover:opacity-90" : "opacity-100"
          }`}
        >
          {playing ? (
            <svg className="w-8 h-8 text-cream" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-cream ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Action stickers: vertically centered on the scene zone's right
            edge, mirroring the overview rail on the left */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 mt-12 sticker-rail flex flex-col items-center gap-5 feed-card-content">
        <Link href={`/pitch/${id}`} className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-ink font-bold text-sm border-2 border-ink/10 shadow-md">
            {founderName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="w-5 h-5 -mt-2.5 rounded-full bg-brick flex items-center justify-center shadow">
            <svg className="w-3 h-3 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>

        <button onClick={handleUpvote} className="relative flex flex-col items-center gap-1 group">
          {burstKey > 0 && (
            <span key={burstKey} className="absolute inset-0 z-10" aria-hidden>
              {BURST_PARTICLES.map((p, i) => (
                <span
                  key={i}
                  className="burst-particle text-sm"
                  style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg` } as CSSProperties}
                >
                  ❤️
                </span>
              ))}
            </span>
          )}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
            hasUpvoted ? "bg-brick text-cream" : "bg-cream/90 text-ink group-hover:bg-cream"
          } ${isAnimating ? "animate-upvote-spring" : ""}`}>
            <svg className="w-6 h-6" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span key={upvotes} className="count-pop text-cream text-xs font-bold drop-shadow">{upvotes}</span>
        </button>

        <Link href={`/pitch/${id}`} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-cream/90 text-ink shadow-md flex items-center justify-center group-hover:bg-cream transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-cream text-xs font-bold drop-shadow">{comments}</span>
        </Link>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center transition-all ${
            shared ? "bg-moss text-cream" : "bg-cream/90 text-ink group-hover:bg-cream"
          }`}>
            {shared ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </div>
          <span className="text-cream text-xs font-bold drop-shadow">{shared ? "Copied!" : "Share"}</span>
        </button>
        </div>
      </div>

      {/* Bottom paper card. Name + tagline are always legible (the
          "label" zoom level); details cascade in when focal. */}
      <div className="relative z-10 w-full px-5 pb-24 swing-in-wrap feed-card-content">
        <div className="paper swing-in rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2 reveal reveal-1">
            <span className="px-2 py-0.5 rounded-md border border-dashed border-lagoon text-lagoon text-[11px] font-bold uppercase tracking-wide">{category}</span>
            <span className="px-2 py-0.5 rounded-md border border-dashed border-moss text-moss text-[11px] font-bold uppercase tracking-wide">{stage}</span>
            {askAmount && (
              <span className="ticket px-3 py-0.5 text-clay text-[11px] font-bold uppercase tracking-wide">Raising {askAmount}</span>
            )}
          </div>

          <Link href={`/pitch/${id}`}>
            <h2 className="font-display text-ink text-2xl font-semibold mb-0.5">{startupName}</h2>
          </Link>
          <p className="text-ink/80 text-sm mb-2">{tagline}</p>

          <div className="flex items-center gap-2 mb-2 reveal reveal-2">
            <span className="text-ink/60 text-xs">@{founderName.toLowerCase().replace(/\s/g, "")} &middot; {founderTitle}</span>
          </div>

          {traction && (
            <div className="flex items-center gap-1.5 mb-2 reveal reveal-3">
              <svg className="w-3.5 h-3.5 text-moss" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-moss text-xs font-semibold">{traction}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 reveal reveal-3">
            <svg className="w-3.5 h-3.5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-ink/50 text-xs">{location}</span>
          </div>

          {/* Early merit perk: what beta testers earn for committing now */}
          {earlyPerk && (
            <div className="mt-2.5 reveal reveal-4">
              <span className="ticket inline-flex items-center gap-1.5 px-3.5 py-1 text-clay text-[11px] font-bold uppercase tracking-wide">
                🎟 Early perk · {earlyPerk}
              </span>
            </div>
          )}

          {/* Stated need + contextual CTA */}
          {needLabel && (
            <p className={`${earlyPerk ? "mt-2" : "mt-3.5"} mb-1.5 text-ink/50 text-[11px] font-bold uppercase tracking-wider reveal reveal-4`}>{needLabel}</p>
          )}
          <div className="reveal reveal-5">
            <button
              onClick={() => onAction(id)}
              className={`mt-1 w-full py-2.5 rounded-full font-display font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all ${
                action.style === "grad"
                  ? "bg-clay text-cream hover:bg-[#a34d0d]"
                  : "bg-brick text-cream hover:bg-[#8f1f1f]"
              }`}
            >
              <span>{action.icon}</span>
              {action.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
