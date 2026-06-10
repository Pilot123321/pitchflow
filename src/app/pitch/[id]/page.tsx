import { getPitchById, getMerits } from "@/lib/data";
import { notFound } from "next/navigation";
import PitchDetail, { type TopBeliever } from "./PitchDetail";

export const dynamic = "force-dynamic";

const TIER_WEIGHT: Record<string, number> = { founding: 3, contributor: 2, believer: 1 };

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pitch = getPitchById(id);
  if (!pitch) notFound();

  // Top believers: highest tier first, earliest supporter wins ties.
  const topBelievers: TopBeliever[] = getMerits()
    .filter((m) => m.pitchId === id)
    .sort(
      (a, b) =>
        (TIER_WEIGHT[b.tier] ?? 0) - (TIER_WEIGHT[a.tier] ?? 0) ||
        Date.parse(a.joinedAt) - Date.parse(b.joinedAt)
    )
    .slice(0, 6)
    .map((m) => ({ name: m.name, tier: m.tier, supporterNumber: m.supporterNumber }));

  return <PitchDetail pitch={pitch} topBelievers={topBelievers} />;
}
