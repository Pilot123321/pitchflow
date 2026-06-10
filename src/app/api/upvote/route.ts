import { NextRequest, NextResponse } from "next/server";
import { upvotePitch } from "@/lib/data";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing pitch id" }, { status: 400 });
  }
  const pitch = upvotePitch(id);
  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }
  return NextResponse.json(pitch);
}
