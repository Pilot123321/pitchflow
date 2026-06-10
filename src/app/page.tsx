import FeedView from "@/components/FeedView";
import { getPitches } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const pitches = getPitches();
  return <FeedView initialPitches={pitches} />;
}
