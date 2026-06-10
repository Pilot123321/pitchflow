import { NextRequest, NextResponse } from "next/server";
import { getPitchById, getMerits, getComments, setMeritHonored } from "@/lib/data";

export async function GET(req: NextRequest) {
  const pitchId = req.nextUrl.searchParams.get("pitchId");
  if (!pitchId) {
    return NextResponse.json({ error: "Missing pitchId" }, { status: 400 });
  }
  const pitch = getPitchById(pitchId);
  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }
  const merits = getMerits().filter((m) => m.pitchId === pitchId).reverse();
  return NextResponse.json({
    stats: {
      waitlist: pitch.waitlistCount ?? 0,
      upvotes: pitch.upvotes,
      chatRequests: pitch.chatRequests,
      comments: pitch.comments,
    },
    earlyPerk: pitch.earlyPerk ?? null,
    merits,
    comments: getComments(pitchId).reverse(),
    updates: pitch.updates ?? [],
  });
}

export async function PATCH(req: NextRequest) {
  const { pitchId, supporterNumber, honored } = await req.json();
  if (!pitchId || typeof supporterNumber !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const ok = setMeritHonored(pitchId, supporterNumber, !!honored);
  if (!ok) {
    return NextResponse.json({ error: "Merit entry not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
