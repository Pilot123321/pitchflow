"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FrameworkBuilder3D, FrameNode } from "@/components/FrameworkBuilder3D";

const categories = ["AI/ML", "Fintech", "Healthcare", "Climate", "DevTools", "Consumer", "EdTech", "Logistics", "SaaS", "Other"];

// Seed the constellation from one messy sentence — the coach drafts the first
// three stars (hook/problem/solution); the founder shapes the rest in 3D.
function seedFrame(idea: string): Record<string, string> {
  const i = idea.trim().replace(/\.$/, "");
  const cap = i.charAt(0).toUpperCase() + i.slice(1);
  return {
    hook: cap,
    problem: `Today, people handle "${i}" through clunky, manual workarounds that don't scale and waste their time.`,
    solution: `${cap} — designed to make this effortless, fast, and genuinely delightful from the very first use.`,
  };
}

export default function BrainstormPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "build">("input");
  const [idea, setIdea] = useState("");
  const [seed, setSeed] = useState<Record<string, string>>({});
  const [nodes, setNodes] = useState<FrameNode[]>([]);
  const [startupName, setStartupName] = useState("");
  const [category, setCategory] = useState("Consumer");
  const [founderName, setFounderName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const onFrameChange = useCallback((ns: FrameNode[]) => setNodes(ns), []);

  const text = (id: string) => nodes.find((n) => n.id === id)?.text.trim() ?? "";
  const ready = !!(startupName.trim() && text("problem") && text("solution"));

  async function postToIdeas() {
    if (!ready) return;
    if (!founderName.trim() || !location.trim()) {
      alert("Add your name and location, then post.");
      return;
    }
    setLoading(true);
    const who = text("who");
    const model = text("model");
    const moat = text("moat");
    const solution = [text("solution"), model && `Model: ${model}`, moat && `Moat: ${moat}`]
      .filter(Boolean)
      .join(" ");
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderName,
          founderTitle: "Builder",
          startupName,
          tagline: text("hook") || text("solution"),
          description: text("solution"),
          category,
          stage: "Idea",
          location,
          traction: "Just posted",
          tier: "idea",
          needType: "users",
          needLabel: "Validating the idea",
          needText: who
            ? `Looking for 30 early users — especially ${who.replace(/\.$/, "")}. Join the waitlist to be one of them.`
            : "Looking for 30 early users to try this for a week and tell me if it actually helps. Join the waitlist to be one of them.",
          problem: text("problem"),
          solution,
          watchRate: "idea-stage",
          updates: [{ date: new Date().toISOString(), text: "Framed the idea in 3D and posted to Ideas today." }],
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
          <p className="text-ink/50 text-sm">
            {step === "input"
              ? "Type a raw idea — then build it into a constellation instead of filling out a form."
              : "Your startup as a 3D frame. Light the stars that matter, branch your own, then post."}
          </p>
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
              onClick={() => {
                if (!idea.trim()) return;
                setSeed(seedFrame(idea));
                setStep("build");
              }}
              disabled={!idea.trim()}
              className="w-full py-3.5 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Frame it ✦
            </button>
            <button
              onClick={() => {
                setSeed({});
                setStep("build");
              }}
              className="w-full py-3 rounded-full bg-ink/10 text-ink font-semibold text-sm hover:bg-ink/15 transition-colors"
            >
              Start from empty sky
            </button>
          </div>
        )}

        {step === "build" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="Name your startup *"
                className="flex-1 px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm focus:outline-none focus:border-clay transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <FrameworkBuilder3D seed={seed} onChange={onFrameChange} />

            <div className="grid grid-cols-2 gap-3">
              <input
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="Your name *"
                className="px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location *"
                className="px-4 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              />
            </div>

            <button
              onClick={postToIdeas}
              disabled={loading || !ready}
              className="w-full py-4 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? "Posting..." : ready ? "Post to Ideas ✦" : "Light Problem + Solution to post"}
            </button>
            <button
              onClick={() => setStep("input")}
              className="w-full py-3 rounded-full bg-ink/10 text-ink font-semibold text-sm hover:bg-ink/15 transition-colors"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
