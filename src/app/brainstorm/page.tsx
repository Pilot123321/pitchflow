"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = ["AI/ML", "Fintech", "Healthcare", "Climate", "DevTools", "Consumer", "EdTech", "Logistics", "SaaS", "Other"];

interface Draft {
  startupName: string;
  tagline: string;
  category: string;
  problem: string;
  solution: string;
  needText: string;
  reelScript: string[];
  founderName: string;
  location: string;
}

// Scripted "coach": turns a raw idea into a structured, editable draft.
// (Swap this for a real LLM call later — the shape is what matters.)
function structureIdea(idea: string): Draft {
  const i = idea.trim().replace(/\.$/, "");
  const cap = i.charAt(0).toUpperCase() + i.slice(1);
  return {
    startupName: "",
    tagline: cap,
    category: "Consumer",
    problem: `Today, people handle "${i}" through clunky, manual workarounds that don't scale and waste their time.`,
    solution: `${cap} — designed to make this effortless, fast, and genuinely delightful from the very first use.`,
    needText: "Looking for 30 early users to try this for a week and tell me if it actually helps. Join the waitlist to be one of them.",
    reelScript: [
      "Hook (0–5s): the painful moment your user keeps hitting.",
      "Demo (5–40s): show the one magic interaction that fixes it.",
      "Ask (40–60s): \"Join the waitlist — I want your feedback.\"",
    ],
    founderName: "",
    location: "",
  };
}

export default function BrainstormPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "draft">("input");
  const [idea, setIdea] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);

  function runCoach() {
    if (!idea.trim()) return;
    setDraft(structureIdea(idea));
    setStep("draft");
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function postToIdeas() {
    if (!draft) return;
    if (!draft.startupName || !draft.founderName || !draft.location) {
      alert("Please fill in your startup name, your name, and location.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderName: draft.founderName,
          founderTitle: "Builder",
          startupName: draft.startupName,
          tagline: draft.tagline,
          description: draft.solution,
          category: draft.category,
          stage: "Idea",
          location: draft.location,
          traction: "Just posted",
          tier: "idea",
          needType: "users",
          needLabel: "Validating the idea",
          needText: draft.needText,
          problem: draft.problem,
          solution: draft.solution,
          watchRate: "idea-stage",
          updates: [{ date: new Date().toISOString(), text: "Brainstormed and posted to Ideas today." }],
        }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to post idea");
        setLoading(false);
      }
    } catch {
      alert("Failed to post idea");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-ink/50 hover:text-ink text-sm transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        <div className="mb-7">
          <h1 className="font-display text-ink text-2xl font-semibold mb-1">✦ Brainstorm</h1>
          <p className="text-ink/50 text-sm">Type a raw idea — the coach shapes it into a postable pitch. Edit anything, then post to the Ideas tier to test demand.</p>
        </div>

        {step === "input" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 p-4">
              <p className="text-ink/70 text-sm">What are you thinking of building? One messy sentence is fine.</p>
            </div>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors resize-none"
              placeholder="e.g. an AI that plans my week from my goals"
            />
            <button
              onClick={runCoach}
              disabled={!idea.trim()}
              className="w-full py-3.5 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Brainstorm it ✦
            </button>
          </div>
        )}

        {step === "draft" && draft && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 p-4">
              <p className="text-ink/80 text-sm">Here&apos;s a structured pitch from your idea. Tweak it, fill the blanks, then post.</p>
            </div>

            <Field label="Startup name *">
              <input value={draft.startupName} onChange={(e) => update("startupName", e.target.value)} placeholder="Name your startup" className={inputCls} />
            </Field>
            <Field label="One-line pitch">
              <input value={draft.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="The problem">
              <textarea value={draft.problem} onChange={(e) => update("problem", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="The solution">
              <textarea value={draft.solution} onChange={(e) => update("solution", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="What you need">
              <textarea value={draft.needText} onChange={(e) => update("needText", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
            </Field>

            <div className="rounded-2xl bg-ink/[0.03] border-2 border-dashed border-ink/15 p-4">
              <p className="text-ink/50 text-[11px] font-bold uppercase tracking-wider mb-2">Suggested 45–60s reel</p>
              {draft.reelScript.map((line, i) => (
                <p key={i} className="text-ink/70 text-sm leading-relaxed mb-1">• {line}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Your name *">
                <input value={draft.founderName} onChange={(e) => update("founderName", e.target.value)} placeholder="Jane Smith" className={inputCls} />
              </Field>
              <Field label="Location *">
                <input value={draft.location} onChange={(e) => update("location", e.target.value)} placeholder="Remote" className={inputCls} />
              </Field>
            </div>

            <button
              onClick={postToIdeas}
              disabled={loading}
              className="w-full py-4 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post to Ideas 💡"}
            </button>
            <button onClick={() => setStep("input")} className="w-full py-3 rounded-full bg-ink/10 text-ink font-semibold text-sm hover:bg-ink/15 transition-colors">
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-ink/50 text-xs font-semibold block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
