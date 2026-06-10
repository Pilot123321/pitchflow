"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CoffeeChatModal from "@/components/CoffeeChatModal";
import WaitlistModal from "@/components/WaitlistModal";
import { ctaFor, type NeedType } from "@/lib/needs";
import { sceneFor } from "@/lib/scenes";

interface TeamMember {
  initials: string;
  name: string;
  role: string;
}
interface ProgressUpdate {
  date: string;
  text: string;
}
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
  needText?: string;
  earlyPerk?: string;
  waitlistCount?: number;
  watchRate?: string;
  problem?: string;
  solution?: string;
  team?: TeamMember[];
  updates?: ProgressUpdate[];
}

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export default function PitchDetail({ pitch }: { pitch: Pitch }) {
  const [showModal, setShowModal] = useState(false);
  const [upvotes, setUpvotes] = useState(pitch.upvotes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(pitch.comments);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    try {
      if (JSON.parse(localStorage.getItem("pf-upvoted") ?? "[]").includes(pitch.id)) setHasUpvoted(true);
      setCommentName(localStorage.getItem("pf-name") ?? "");
    } catch {}
    fetch(`/api/comments?pitchId=${pitch.id}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setComments(data.reverse()))
      .catch(() => {});
  }, [pitch.id]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitchId: pitch.id, name: commentName, text: commentText }),
      });
      if (res.ok) {
        const saved = await res.json();
        setComments((c) => [saved, ...c]);
        setCommentCount((n) => n + 1);
        setCommentText("");
        try {
          localStorage.setItem("pf-name", commentName.trim());
        } catch {}
      }
    } catch {}
    setPosting(false);
  }

  const action = ctaFor(pitch.needType);
  const isInvestorAsk = pitch.needType === "investors";
  const showWaitlistStat = pitch.needType !== "investors" && (pitch.waitlistCount ?? 0) > 0;

  async function handleUpvote() {
    if (hasUpvoted) return;
    setHasUpvoted(true);
    setUpvotes((v) => v + 1);
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("pf-upvoted") ?? "[]");
      localStorage.setItem("pf-upvoted", JSON.stringify([...new Set([...ids, pitch.id])]));
    } catch {}
    await fetch("/api/upvote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pitch.id }),
    });
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Video / Hero */}
      <div className={`relative aspect-[9/12] max-h-[55vh] bg-gradient-to-br ${sceneFor(pitch.gradient)}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-cream/15 backdrop-blur-sm flex items-center justify-center border-2 border-cream/40">
            <svg className="w-8 h-8 text-cream ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <Link href="/" className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {pitch.tier === "idea" && (
            <span className="px-3 py-1 rounded-full bg-cream/90 text-ink text-xs font-bold">💡 Idea</span>
          )}
          <span className="px-3 py-1 rounded-full bg-cream/90 text-ink text-xs font-bold">{pitch.category}</span>
          <span className="px-3 py-1 rounded-full bg-cream/90 text-ink text-xs font-bold">{pitch.stage}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5">
        {/* Startup header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="font-display text-ink text-2xl font-semibold mb-1">{pitch.startupName}</h1>
            <p className="text-ink/70 text-sm">{pitch.tagline}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b-2 border-dashed border-ink/10">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 transition-colors ${hasUpvoted ? "text-brick" : "text-ink/60 hover:text-ink"}`}
          >
            <svg className="w-5 h-5" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{upvotes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-ink/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{commentCount}</span>
          </div>
          <span className="text-ink/40 text-xs ml-auto">{fmtDate(pitch.createdAt)}</span>
        </div>

        {/* Traction stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {showWaitlistStat && (
            <div className="p-4 rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 text-center">
              <p className="font-display text-ink text-lg font-semibold">{pitch.waitlistCount?.toLocaleString()}</p>
              <p className="text-ink/40 text-[10px] uppercase tracking-wider">on waitlist</p>
            </div>
          )}
          {pitch.watchRate && (
            <div className="p-4 rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 text-center">
              <p className="font-display text-ink text-lg font-semibold">{pitch.watchRate.includes("%") ? pitch.watchRate.split(" ")[0] : "—"}</p>
              <p className="text-ink/40 text-[10px] uppercase tracking-wider">{pitch.watchRate.includes("%") ? "watch to end" : "early stage"}</p>
            </div>
          )}
          {pitch.askAmount && (
            <div className="p-4 rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 text-center">
              <p className="font-display text-clay text-lg font-semibold">{pitch.askAmount}</p>
              <p className="text-ink/40 text-[10px] uppercase tracking-wider">raising</p>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 text-center">
            <p className="font-display text-ink text-lg font-semibold">{pitch.stage}</p>
            <p className="text-ink/40 text-[10px] uppercase tracking-wider">stage</p>
          </div>
        </div>

        {/* Problem */}
        {pitch.problem && (
          <div className="mb-5">
            <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-2">The problem</h3>
            <p className="text-ink/80 text-sm leading-relaxed">{pitch.problem}</p>
          </div>
        )}

        {/* Solution */}
        {pitch.solution && (
          <div className="mb-5">
            <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-2">The solution</h3>
            <p className="text-ink/80 text-sm leading-relaxed">{pitch.solution}</p>
          </div>
        )}

        {/* What they need */}
        {pitch.needText && (
          <div className="mb-6">
            <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-2">What they need</h3>
            <div className="rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.02] p-4">
              <p className="text-ink font-semibold text-sm mb-1">{pitch.needLabel}</p>
              <p className="text-ink/65 text-sm leading-relaxed">{pitch.needText}</p>
            </div>
          </div>
        )}

        {/* Team */}
        {pitch.team && pitch.team.length > 0 && (
          <div className="mb-6">
            <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-3">Team</h3>
            <div className="flex flex-wrap gap-4">
              {pitch.team.map((m) => (
                <div key={m.name} className="flex flex-col items-center text-center w-20">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${sceneFor(pitch.gradient)} flex items-center justify-center text-cream font-bold text-sm mb-1.5`}>
                    {m.initials}
                  </div>
                  <p className="text-ink text-xs font-semibold leading-tight">{m.name}</p>
                  <p className="text-ink/45 text-[10px] leading-tight">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress updates */}
        {pitch.updates && pitch.updates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-3">Progress updates</h3>
            <div className="space-y-0">
              {pitch.updates.map((u, i) => (
                <div key={i} className="relative pl-5 pb-4 border-l-2 border-clay/40 last:border-l-transparent">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-clay" />
                  <p className="text-ink/40 text-[10px]">{fmtDate(u.date)}</p>
                  <p className="text-ink/80 text-sm leading-relaxed mt-0.5">{u.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mb-6">
          <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-3">
            Comments ({commentCount})
          </h3>
          <form onSubmit={postComment} className="space-y-2 mb-4">
            <input
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
            />
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask the founder anything…"
                required
                maxLength={500}
                className="flex-1 px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              />
              <button
                type="submit"
                disabled={posting}
                className="px-5 py-2.5 rounded-full bg-brick text-cream font-display font-semibold text-sm disabled:opacity-50"
              >
                {posting ? "…" : "Post"}
              </button>
            </div>
          </form>
          {comments.length === 0 ? (
            <p className="text-ink/40 text-sm">No comments yet — start the conversation.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-dashed border-ink/15 bg-ink/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-cream border border-ink/15 flex items-center justify-center text-ink text-[9px] font-bold">
                      {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-ink text-xs font-semibold">{c.name}</span>
                    <span className="text-ink/35 text-[10px] ml-auto">{fmtDate(c.createdAt)}</span>
                  </div>
                  <p className="text-ink/75 text-sm leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-3 mb-6">
          {pitch.websiteUrl && (
            <a href={pitch.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink/60 text-xs hover:bg-ink/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          )}
          {pitch.linkedinUrl && (
            <a href={pitch.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink/60 text-xs hover:bg-ink/10 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Sticky contextual CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[5.25rem] pt-3 bg-gradient-to-t from-cream via-cream to-transparent pointer-events-none">
        <button
          onClick={() => setShowModal(true)}
          className={`pointer-events-auto w-full py-4 rounded-full font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
            action.style === "grad"
              ? "bg-clay text-cream hover:bg-[#a34d0d]"
              : "bg-brick text-cream hover:bg-[#8f1f1f]"
          }`}
        >
          <span>{action.icon}</span> {action.cta}
        </button>
      </div>

      {showModal && isInvestorAsk && (
        <CoffeeChatModal
          pitchId={pitch.id}
          startupName={pitch.startupName}
          founderName={pitch.founderName}
          calendlyUrl={pitch.calendlyUrl}
          onClose={() => setShowModal(false)}
        />
      )}
      {showModal && !isInvestorAsk && (
        <WaitlistModal
          pitchId={pitch.id}
          startupName={pitch.startupName}
          founderName={pitch.founderName}
          needType={pitch.needType}
          needLabel={pitch.needLabel}
          earlyPerk={pitch.earlyPerk}
          waitlistCount={pitch.waitlistCount}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
