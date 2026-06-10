// Client-safe definitions for "what the founder needs" → contextual conversion.
// Kept separate from data.ts so client components can import it without pulling in `fs`.

export type NeedType = "users" | "investors" | "cofounder" | "recruiting" | "marketing";

export interface NeedDef {
  cta: string;
  icon: string;
  style: "primary" | "grad";
  // Default needLabel shown on the card when the founder doesn't write one
  label: string;
  // Copy for the founder-facing picker on /submit
  pickerLabel: string;
  pickerDesc: string;
}

export const NEED_CTA: Record<NeedType, NeedDef> = {
  users: {
    cta: "Join the waitlist",
    icon: "✦",
    style: "grad",
    label: "Looking for beta testers",
    pickerLabel: "Early merit",
    pickerDesc: "Recruit beta testers — they earn merit toward your early perk",
  },
  investors: {
    cta: "Request coffee chat",
    icon: "☕",
    style: "primary",
    label: "Open to investors",
    pickerLabel: "Coffee chat",
    pickerDesc: "Investors request a coffee chat with you",
  },
  cofounder: {
    cta: "Apply as co-founder",
    icon: "🤝",
    style: "primary",
    label: "Searching for a co-founder",
    pickerLabel: "Co-founder",
    pickerDesc: "Collect co-founder applications",
  },
  recruiting: {
    cta: "Apply to join",
    icon: "💼",
    style: "primary",
    label: "Hiring the early team",
    pickerLabel: "Recruiting",
    pickerDesc: "Collect applications for early roles",
  },
  marketing: {
    cta: "Help spread the word",
    icon: "📣",
    style: "grad",
    label: "Amplify the launch",
    pickerLabel: "Marketing",
    pickerDesc: "Rally supporters to share your launch",
  },
};

export const NEED_TYPES = Object.keys(NEED_CTA) as NeedType[];

export function ctaFor(needType?: NeedType) {
  return NEED_CTA[needType ?? "users"];
}
