import ExploreGrid from "@/components/ExploreGrid";
import { getPitches } from "@/lib/data";

export default function ExplorePage() {
  const pitches = getPitches();
  return <ExploreGrid pitches={pitches} />;
}
