import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/data";

export async function GET(req: NextRequest) {
  const pitchId = req.nextUrl.searchParams.get("pitchId");
  if (!pitchId) {
    return NextResponse.json({ error: "Missing pitchId" }, { status: 400 });
  }
  return NextResponse.json(getComments(pitchId));
}

export async function POST(req: NextRequest) {
  const { pitchId, name, text } = await req.json();
  if (!pitchId || !name?.trim() || !text?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const comment = addComment(pitchId, name.trim(), text.trim().slice(0, 500));
  if (!comment) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }
  return NextResponse.json(comment, { status: 201 });
}
