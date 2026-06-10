// Client-safe definitions for "what the founder needs" → contextual conversion.
// Kept separate from data.ts so client components can import it without pulling in `fs`.

export type NeedType = "users" | "investors" | "cofounder";

export const NEED_CTA: Record<NeedType, { cta: string; icon: string; style: "primary" | "grad" }> = {
  users: { cta: "Join the waitlist", icon: "✦", style: "grad" },
  investors: { cta: "Request coffee chat", icon: "☕", style: "primary" },
  cofounder: { cta: "Apply as co-founder", icon: "🤝", style: "primary" },
};

export function ctaFor(needType?: NeedType) {
  return NEED_CTA[needType ?? "users"];
}
