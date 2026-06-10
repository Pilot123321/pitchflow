"use client";

import { useState } from "react";
import Link from "next/link";
import { sceneFor } from "@/lib/scenes";

interface Pitch {
  id: string;
  founderName: string;
  founderAvatar: string;
  startupName: string;
  tagline: string;
  category: string;
  stage: string;
  traction: string;
  upvotes: number;
  chatRequests: number;
  createdAt: string;
  gradient: string;
  waitlistCount?: number;
}

// Trending = engagement across every conversion surface, not just hearts
function trendingScore(p: Pitch) {
  return p.upvotes + 3 * (p.chatRequests ?? 0) + 0.15 * (p.waitlistCount ?? 0);
}

const categories = ["All", "AI/ML", "Fintech", "Healthcare", "Climate", "DevTools", "Consumer", "EdTech", "Logistics", "SaaS"];
const stages = ["All Stages", "Idea", "Pre-seed", "Seed", "Series A"];

export default function ExploreGrid({ pitches }: { pitches: Pitch[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "most-upvoted">("trending");

  const q = search.trim().toLowerCase();
  const filtered = pitches
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter((p) => selectedStage === "All Stages" || p.stage === selectedStage)
    .filter(
      (p) =>
        !q ||
        [p.startupName, p.tagline, p.founderName, p.category].some((f) =>
          f.toLowerCase().includes(q)
        )
    )
    .sort((a, b) => {
      if (sortBy === "most-upvoted") return b.upvotes - a.upvotes;
      if (sortBy === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return trendingScore(b) - trendingScore(a);
    });

  return (
    <div className="min-h-screen pt-4 pb-24 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-ink text-2xl font-semibold mb-1">Explore</h1>
        <p className="text-ink/50 text-sm">Discover the next big thing</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search startups, founders, categories..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-ink text-cream"
                : "bg-ink/5 text-ink/60 border border-dashed border-ink/20 hover:border-ink/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stage + Sort row */}
      <div className="flex gap-2 mb-5">
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-ink/5 border border-dashed border-ink/20 text-ink/60 text-xs focus:outline-none"
        >
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1.5 rounded-lg bg-ink/5 border border-dashed border-ink/20 text-ink/60 text-xs focus:outline-none"
        >
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
          <option value="most-upvoted">Most Upvoted</option>
        </select>
      </div>

      {/* Grid: postcards from the feed */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((pitch) => (
          <Link
            key={pitch.id}
            href={`/pitch/${pitch.id}`}
            className="group rounded-2xl overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,0.4)]"
          >
            <div className={`relative aspect-[3/4] bg-gradient-to-br ${sceneFor(pitch.gradient)} p-4 flex flex-col justify-between`}>
              <div className="absolute inset-0 bg-black/10" />
              {/* Top badges */}
              <div className="relative flex justify-between items-start">
                <span className="px-2 py-0.5 rounded-md bg-cream/90 text-ink text-[10px] font-bold uppercase tracking-wide">
                  {pitch.stage}
                </span>
                <span className="flex items-center gap-1 text-ink/90 text-[10px] font-bold drop-shadow">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {pitch.upvotes}
                </span>
              </div>
              {/* Center play icon */}
              <div className="relative flex-1 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-ink/10 backdrop-blur-sm border border-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-ink ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Bottom info */}
              <div className="relative">
                <p className="font-display text-ink font-semibold text-sm mb-0.5 leading-tight drop-shadow">{pitch.startupName}</p>
                <p className="text-ink/80 text-[11px] leading-tight line-clamp-2">{pitch.tagline}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-5 h-5 rounded-full bg-cream text-ink flex items-center justify-center text-[8px] font-bold">
                    {pitch.founderAvatar}
                  </div>
                  <span className="text-ink/80 text-[10px]">{pitch.founderName}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink/40 text-sm">No pitches found for this filter.</p>
        </div>
      )}
    </div>
  );
}
