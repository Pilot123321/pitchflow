import { NextRequest, NextResponse } from "next/server";
import { getMerits, getPitchById } from "@/lib/data";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  const entries = getMerits()
    .filter((m) => m.email.trim().toLowerCase() === email)
    .map((m) => {
      const pitch = getPitchById(m.pitchId);
      return {
        pitchId: m.pitchId,
        startupName: pitch?.startupName ?? "Unknown startup",
        founderName: pitch?.founderName ?? "",
        perk: pitch?.earlyPerk ?? null,
        tier: m.tier,
        committed: m.committed,
        gaveFeedback: !!m.feedback,
        supporterNumber: m.supporterNumber,
        joinedAt: m.joinedAt,
      };
    })
    .reverse();
  return NextResponse.json(entries);
}
