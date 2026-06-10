import { NextRequest, NextResponse } from "next/server";
import { appendUpdate } from "@/lib/data";

export async function POST(req: NextRequest) {
  const { pitchId, text } = await req.json();
  if (!pitchId || !text?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pitch = appendUpdate(pitchId, text.trim().slice(0, 500));
  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, updates: pitch.updates });
}
