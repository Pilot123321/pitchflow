"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MERIT_TIERS, type MeritTier } from "@/lib/merit";

interface PitchOption { id: string; startupName: string; founderName: string }
interface MeritRow {
  name: string; email: string; tier: MeritTier; feedback?: string;
  committed: boolean; supporterNumber: number; joinedAt: string; honored?: boolean;
}
interface CommentRow { id: string; name: string; text: string; createdAt: string }
interface Dash {
  stats: { waitlist: number; upvotes: number; chatRequests: number; comments: number };
  earlyPerk: string | null;
  merits: MeritRow[];
  comments: CommentRow[];
  updates: { date: string; text: string }[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [pitches, setPitches] = useState<PitchOption[]>([]);
  const [pitchId, setPitchId] = useState("");
  const [dash, setDash] = useState<Dash | null>(null);
  const [update, setUpdate] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/pitches").then((r) => r.json()).then((all) => {
      setPitches(all.map((p: PitchOption & Record<string, unknown>) => ({ id: p.id, startupName: p.startupName, founderName: p.founderName })));
      if (all[0]) setPitchId(all[0].id);
    });
  }, []);

  useEffect(() => {
    if (!pitchId) return;
    fetch(`/api/dashboard?pitchId=${pitchId}`).then((r) => r.json()).then(setDash);
  }, [pitchId]);

  async function honor(supporterNumber: number, honored: boolean) {
    await fetch("/api/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitchId, supporterNumber, honored }),
    });
    setDash((d) => d && { ...d, merits: d.merits.map((m) => (m.supporterNumber === supporterNumber ? { ...m, honored } : m)) });
  }

  async function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!update.trim() || posting) return;
    setPosting(true);
    const res = await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitchId, text: update }),
    }).then((r) => r.json()).catch(() => null);
    if (res?.updates) {
      setDash((d) => d && { ...d, updates: res.updates });
      setUpdate("");
    }
    setPosting(false);
  }

  const stats = dash?.stats;
  const tierCount = (t: MeritTier) => dash?.merits.filter((m) => m.tier === t).length ?? 0;

  return (
    <div className="min-h-screen px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <div className="max-w-lg mx-auto">
        <div className="mb-5">
          <h1 className="font-display text-ink text-2xl font-semibold mb-1">Founder dashboard</h1>
          <p className="text-ink/50 text-sm">Everything your supporters are telling you, and the merit you owe them at launch.</p>
        </div>

        {/* Pitch selector (auth ownership comes with the Supabase step) */}
        <select
          value={pitchId}
          onChange={(e) => setPitchId(e.target.value)}
          className="w-full mb-5 px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm focus:outline-none focus:border-clay"
        >
          {pitches.map((p) => (
            <option key={p.id} value={p.id}>{p.startupName} · {p.founderName}</option>
          ))}
        </select>

        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { v: stats.waitlist.toLocaleString(), l: "waitlist" },
              { v: stats.upvotes.toLocaleString(), l: "upvotes" },
              { v: stats.chatRequests.toLocaleString(), l: "chats" },
              { v: stats.comments.toLocaleString(), l: "comments" },
            ].map((x) => (
              <div key={x.l} className="p-3 rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 text-center">
                <p className="font-display text-ink text-lg font-semibold">{x.v}</p>
                <p className="text-ink/40 text-[9px] uppercase tracking-wider">{x.l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Merit ledger */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider">Merit ledger</h3>
            <span className="text-ink/40 text-[10px] font-semibold">
              🛠️ {tierCount("founding")} · ✍️ {tierCount("contributor")} · 🌱 {tierCount("believer")}
            </span>
          </div>
          {dash?.earlyPerk && (
            <div className="ticket px-3.5 py-1.5 inline-flex items-center gap-1.5 text-clay text-[11px] font-bold uppercase tracking-wide mb-3">
              🎟 Promised perk · {dash.earlyPerk}
            </div>
          )}
          {dash && dash.merits.length === 0 && (
            <p className="text-ink/40 text-sm">No supporters yet — share your pitch.</p>
          )}
          <div className="space-y-2">
            {dash?.merits.map((m) => (
              <div key={m.supporterNumber} className="rounded-xl border border-dashed border-ink/15 bg-ink/[0.02] px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span>{MERIT_TIERS[m.tier]?.icon ?? "🌱"}</span>
                  <span className="text-ink text-xs font-semibold">{m.name}</span>
                  <span className="text-ink/40 text-[10px]">{m.email}</span>
                  <span className="text-ink/35 text-[10px] ml-auto">No. {m.supporterNumber.toLocaleString()} · {fmt(m.joinedAt)}</span>
                </div>
                {m.feedback && <p className="text-ink/70 text-xs leading-relaxed mt-1.5 pl-6">&ldquo;{m.feedback}&rdquo;</p>}
                {m.committed && (
                  <div className="pl-6 mt-1.5">
                    <button
                      onClick={() => honor(m.supporterNumber, !m.honored)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        m.honored ? "bg-moss text-cream" : "bg-ink/10 text-ink/60 hover:bg-ink/15"
                      }`}
                    >
                      {m.honored ? "✓ Perk honored" : "Mark perk honored"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Post a progress update */}
        <div className="mb-6">
          <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-2">Post a progress update</h3>
          <form onSubmit={postUpdate} className="flex gap-2 mb-3">
            <input
              value={update}
              onChange={(e) => setUpdate(e.target.value)}
              placeholder="Shipped onboarding v2, 40 new testers this week…"
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay"
            />
            <button type="submit" disabled={posting} className="px-5 py-2.5 rounded-full bg-brick text-cream font-display font-semibold text-sm disabled:opacity-50">
              {posting ? "…" : "Post"}
            </button>
          </form>
          <div className="space-y-1.5">
            {dash?.updates.slice().reverse().slice(0, 4).map((u, i) => (
              <p key={i} className="text-ink/60 text-xs"><span className="text-ink/35">{fmt(u.date)}</span> · {u.text}</p>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <h3 className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-2">Comments</h3>
          {dash && dash.comments.length === 0 && <p className="text-ink/40 text-sm">None yet.</p>}
          <div className="space-y-2">
            {dash?.comments.slice(0, 6).map((c) => (
              <div key={c.id} className="rounded-xl border border-dashed border-ink/15 bg-ink/[0.02] px-3.5 py-2">
                <p className="text-ink text-xs font-semibold">{c.name} <span className="text-ink/35 font-normal">· {fmt(c.createdAt)}</span></p>
                <p className="text-ink/70 text-xs mt-0.5">{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href={`/pitch/${pitchId}`} className="text-clay text-xs font-bold">View public pitch page →</Link>
      </div>
    </div>
  );
}
