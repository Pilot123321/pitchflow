import { NextRequest, NextResponse } from "next/server";
import { joinWaitlist, recordMerit } from "@/lib/data";
import { meritTierFor } from "@/lib/merit";

export async function POST(req: NextRequest) {
  const { id, name, email, message, committed, needType } = await req.json();
  if (!id || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pitch = joinWaitlist(id);
  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }

  const feedback = typeof message === "string" ? message.trim() : "";
  const tier = meritTierFor({ feedback: feedback.length > 0, committed: !!committed });
  const merit = recordMerit({
    pitchId: id,
    name,
    email,
    tier,
    feedback: feedback || undefined,
    committed: !!committed,
    supporterNumber: pitch.waitlistCount ?? 1,
  });

  // In production: persist the signup, email the founder, dedupe by email, etc.
  console.log(
    `Waitlist (${needType ?? "users"}) for ${pitch.startupName} from ${name} (${email}) — now #${pitch.waitlistCount}, merit: ${tier}`
  );
  return NextResponse.json({
    success: true,
    waitlistCount: pitch.waitlistCount,
    merit: {
      tier,
      supporterNumber: merit.supporterNumber,
      perk: pitch.earlyPerk ?? null,
    },
  });
}
