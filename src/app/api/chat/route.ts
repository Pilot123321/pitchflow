import { NextRequest, NextResponse } from "next/server";
import { incrementChatRequests } from "@/lib/data";

export async function POST(req: NextRequest) {
  const { id, name, email, message } = await req.json();
  if (!id || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pitch = incrementChatRequests(id);
  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }
  // In production: send email notification to founder, save to DB, etc.
  console.log(`Coffee chat request for ${pitch.startupName} from ${name} (${email}): ${message}`);
  return NextResponse.json({ success: true, pitch });
}
