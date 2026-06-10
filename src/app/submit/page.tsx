"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NEED_CTA, NEED_TYPES, type NeedType } from "@/lib/needs";

const categories = ["AI/ML", "Fintech", "Healthcare", "Climate", "DevTools", "Consumer", "EdTech", "Logistics", "SaaS", "Other"];
const stages = ["Idea", "Pre-seed", "Seed", "Series A"];

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    founderName: "",
    founderTitle: "",
    startupName: "",
    tagline: "",
    description: "",
    videoUrl: "",
    demoImageUrl: "",
    category: "",
    stage: "",
    traction: "",
    location: "",
    askAmount: "",
    needType: "users",
    needLabel: "",
    earlyPerk: "",
    calendlyUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit pitch");
      }
    } catch {
      alert("Failed to submit pitch");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-28">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-ink text-2xl font-semibold mb-1">Submit Your Pitch</h1>
          <p className="text-ink/50 text-sm">Record a 30-60 second video and share your startup with the world.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Founder Section */}
          <div className="space-y-4">
            <h2 className="text-ink/70 text-xs font-bold uppercase tracking-wider">About You</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Full Name *</label>
                <input
                  required
                  value={form.founderName}
                  onChange={(e) => update("founderName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Title *</label>
                <input
                  required
                  value={form.founderTitle}
                  onChange={(e) => update("founderTitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="CEO & Co-founder"
                />
              </div>
            </div>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">Location *</label>
              <input
                required
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          {/* Startup Section */}
          <div className="space-y-4">
            <h2 className="text-ink/70 text-xs font-bold uppercase tracking-wider">Your Startup</h2>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">Startup Name *</label>
              <input
                required
                value={form.startupName}
                onChange={(e) => update("startupName", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                placeholder="DataWeave"
              />
            </div>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">One-line Pitch *</label>
              <input
                required
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                placeholder="AI-powered data pipelines that build themselves"
                maxLength={80}
              />
              <p className="text-ink/30 text-[10px] mt-1">{form.tagline.length}/80</p>
            </div>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">Description *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors resize-none"
                placeholder="What problem are you solving? What's your solution? What traction do you have?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm focus:outline-none focus:border-clay transition-colors"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Stage *</label>
                <select
                  required
                  value={form.stage}
                  onChange={(e) => update("stage", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm focus:outline-none focus:border-clay transition-colors"
                >
                  <option value="">Select</option>
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Traction</label>
                <input
                  value={form.traction}
                  onChange={(e) => update("traction", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="$5K MRR, 200 users"
                />
              </div>
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Raising</label>
                <input
                  value={form.askAmount}
                  onChange={(e) => update("askAmount", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="$500K"
                />
              </div>
            </div>
          </div>

          {/* What you need section */}
          <div className="space-y-4">
            <h2 className="text-ink/70 text-xs font-bold uppercase tracking-wider">What do you need right now?</h2>
            <div className="grid grid-cols-1 gap-2">
              {NEED_TYPES.map((t) => (
                <label
                  key={t}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    form.needType === t ? "border-clay bg-clay/10" : "border-ink/15 hover:border-ink/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="needType"
                    value={t}
                    checked={form.needType === t}
                    onChange={() => update("needType", t)}
                    className="mt-1 w-4 h-4 accent-[#bd580f]"
                  />
                  <span className="text-xs leading-relaxed text-ink/70">
                    <span className="font-bold text-ink">{NEED_CTA[t].icon} {NEED_CTA[t].pickerLabel}</span>
                    <span className="block text-ink/55 mt-0.5">{NEED_CTA[t].pickerDesc}</span>
                  </span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">Your ask, in your words (shown on the card)</label>
              <input
                value={form.needLabel}
                onChange={(e) => update("needLabel", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                placeholder={NEED_CTA[form.needType as NeedType].label}
              />
            </div>
            {(form.needType === "users" || form.needType === "marketing") && (
              <div>
                <label className="text-ink/50 text-xs font-semibold block mb-1.5">Early perk for supporters</label>
                <input
                  value={form.earlyPerk}
                  onChange={(e) => update("earlyPerk", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="e.g. 50% off for life, free Pro for a year"
                />
                <p className="text-ink/40 text-[10px] mt-1">Supporters who commit as founding testers lock this in as Early Merit</p>
              </div>
            )}
          </div>

          {/* Demo image */}
          <div className="space-y-4">
            <h2 className="text-ink/70 text-xs font-bold uppercase tracking-wider">Product Demo Image</h2>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">Demo image URL (screenshot of your product)</label>
              <input
                value={form.demoImageUrl}
                onChange={(e) => update("demoImageUrl", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                placeholder="https://yoursite.com/screenshot.png"
              />
              <p className="text-ink/40 text-[10px] mt-1">Shown on your pitch page in place of the video while videos are off</p>
            </div>
          </div>

          {/* Video Section */}
          <div className="space-y-4">
            <h2 className="text-ink/70 text-xs font-bold uppercase tracking-wider">Pitch Video</h2>
            <div>
              <label className="text-ink/50 text-xs font-semibold block mb-1.5">Video URL (YouTube, Loom, etc.)</label>
              <input
                value={form.videoUrl}
                onChange={(e) => update("videoUrl", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-ink/40 text-[10px] mt-1">Record a 30-60 second vertical video pitching your startup</p>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h2 className="text-ink/70 text-xs font-bold uppercase tracking-wider">Links</h2>
            <input
              value={form.websiteUrl}
              onChange={(e) => update("websiteUrl", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              placeholder="Website URL"
            />
            <input
              value={form.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              placeholder="LinkedIn Profile URL"
            />
            <input
              value={form.calendlyUrl}
              onChange={(e) => update("calendlyUrl", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
              placeholder="Calendly URL (for coffee chats)"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Pitch"}
          </button>
        </form>
      </div>
    </div>
  );
}
