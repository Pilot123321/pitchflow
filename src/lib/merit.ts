// Client-safe definitions for Early Merit — the standing a supporter
// earns with a startup before launch. Kept separate from data.ts so
// client components can import it without pulling in `fs`.

export type MeritTier = "believer" | "contributor" | "founding";

export const MERIT_TIERS: Record<MeritTier, { label: string; icon: string; blurb: string }> = {
  believer: {
    label: "Early Believer",
    icon: "🌱",
    blurb: "You showed up before the crowd. Add feedback or commit to beta testing to grow your merit.",
  },
  contributor: {
    label: "Contributor",
    icon: "✍️",
    blurb: "Your feedback shapes the product. Commit to beta testing to lock in the full perk.",
  },
  founding: {
    label: "Founding Tester",
    icon: "🛠️",
    blurb: "You committed to building this with the founder. Full early perk locked in.",
  },
};

export function meritTierFor(opts: { feedback?: boolean; committed?: boolean }): MeritTier {
  if (opts.committed) return "founding";
  if (opts.feedback) return "contributor";
  return "believer";
}
