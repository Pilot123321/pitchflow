import { NextRequest, NextResponse } from "next/server";
import { getPitches, addPitch } from "@/lib/data";
import { NEED_CTA, type NeedType } from "@/lib/needs";

export async function GET() {
  const pitches = getPitches();
  return NextResponse.json(pitches);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = ["founderName", "founderTitle", "startupName", "tagline", "description", "category", "stage", "location"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const gradients = [
    "from-violet-600 to-indigo-800",
    "from-emerald-600 to-teal-800",
    "from-rose-600 to-pink-800",
    "from-amber-600 to-orange-800",
    "from-cyan-600 to-blue-800",
    "from-fuchsia-600 to-purple-800",
    "from-sky-600 to-indigo-800",
    "from-lime-600 to-green-800",
  ];

  const founderName: string = body.founderName;
  const needType: NeedType = body.needType in NEED_CTA ? body.needType : "users";
  const pitch = addPitch({
    founderName,
    founderTitle: body.founderTitle,
    founderAvatar: founderName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
    startupName: body.startupName,
    tagline: body.tagline,
    description: body.description,
    videoUrl: body.videoUrl || "",
    category: body.category,
    stage: body.stage,
    traction: body.traction || "",
    location: body.location,
    askAmount: body.askAmount || "",
    calendlyUrl: body.calendlyUrl || "https://calendly.com",
    linkedinUrl: body.linkedinUrl || "",
    websiteUrl: body.websiteUrl || "",
    gradient: gradients[Math.floor(Math.random() * gradients.length)],
    // --- framework fields (optional) ---
    tier: body.tier === "idea" ? "idea" : "launch",
    needType,
    needLabel: body.needLabel || NEED_CTA[needType].label,
    needText: body.needText || "",
    earlyPerk: body.earlyPerk || undefined,
    watchRate: body.watchRate || "",
    problem: body.problem || "",
    solution: body.solution || "",
    team: Array.isArray(body.team) ? body.team : [],
    updates: Array.isArray(body.updates) ? body.updates : [],
  });

  return NextResponse.json(pitch, { status: 201 });
}
