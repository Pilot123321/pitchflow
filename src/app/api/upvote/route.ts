import { NextRequest, NextResponse } from "next/server";
import { upvotePitch, getPitchById, hasUpvotedBy, recordUpvoteBy } from "@/lib/data";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing pitch id" }, { status: 400 });
  }

  // Signed-in users get exactly one upvote per pitch, enforced here;
  // anonymous users are deduped client-side only (prototype).
  const session = await auth().catch(() => null);
  const email = session?.user?.email?.toLowerCase();
  if (email && hasUpvotedBy(id, email)) {
    const pitch = getPitchById(id);
    return NextResponse.json({ success: true, deduped: true, upvotes: pitch?.upvotes ?? 0 });
  }

  const pitch = upvotePitch(id);
  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }
  if (email) recordUpvoteBy(id, email);
  return NextResponse.json({ success: true, upvotes: pitch.upvotes });
}
