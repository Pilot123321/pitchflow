import { getPitchById } from "@/lib/data";
import { notFound } from "next/navigation";
import PitchDetail from "./PitchDetail";

export const dynamic = "force-dynamic";

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pitch = getPitchById(id);
  if (!pitch) notFound();
  return <PitchDetail pitch={pitch} />;
}
