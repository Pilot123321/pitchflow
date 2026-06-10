import fs from "fs";
import path from "path";
import type { NeedType } from "./needs";

export type { NeedType } from "./needs";
export { NEED_CTA } from "./needs";

export type Tier = "launch" | "idea";

export interface TeamMember {
  initials: string;
  name: string;
  role: string;
}

export interface ProgressUpdate {
  date: string;
  text: string;
}

export interface Pitch {
  id: string;
  founderName: string;
  founderTitle: string;
  founderAvatar: string;
  startupName: string;
  tagline: string;
  description: string;
  videoUrl: string;
  category: string;
  stage: string;
  traction: string;
  location: string;
  askAmount: string;
  upvotes: number;
  comments: number;
  chatRequests: number;
  calendlyUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  createdAt: string;
  gradient: string;
  // --- PitchFlow framework fields ---
  tier?: Tier;
  needType?: NeedType;
  needLabel?: string;
  needText?: string;
  earlyPerk?: string;
  videoSeconds?: number;
  waitlistCount?: number;
  watchRate?: string;
  problem?: string;
  solution?: string;
  team?: TeamMember[];
  updates?: ProgressUpdate[];
}

const dataPath = path.join(process.cwd(), "src/data/pitches.json");

export function getPitches(): Pitch[] {
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

export function getPitchById(id: string): Pitch | undefined {
  return getPitches().find((p) => p.id === id);
}

export function getPitchesByTier(tier: Tier): Pitch[] {
  // Entries without an explicit tier are treated as launches (back-compat).
  return getPitches().filter((p) => (p.tier ?? "launch") === tier);
}

export function addPitch(
  pitch: Omit<Pitch, "id" | "upvotes" | "comments" | "chatRequests" | "createdAt" | "waitlistCount">
): Pitch {
  const pitches = getPitches();
  const newPitch: Pitch = {
    ...pitch,
    id: String(Date.now()),
    upvotes: 0,
    comments: 0,
    chatRequests: 0,
    waitlistCount: 0,
    createdAt: new Date().toISOString(),
  };
  pitches.unshift(newPitch);
  fs.writeFileSync(dataPath, JSON.stringify(pitches, null, 2));
  return newPitch;
}

export function joinWaitlist(id: string): Pitch | null {
  const pitches = getPitches();
  const pitch = pitches.find((p) => p.id === id);
  if (!pitch) return null;
  pitch.waitlistCount = (pitch.waitlistCount ?? 0) + 1;
  fs.writeFileSync(dataPath, JSON.stringify(pitches, null, 2));
  return pitch;
}

// --- Early Merit ledger ---
// Every supporter action is recorded so founders can honor perks
// (discounts, subscription exemptions) at launch.

export interface MeritEntry {
  pitchId: string;
  name: string;
  email: string;
  tier: string;
  feedback?: string;
  committed: boolean;
  supporterNumber: number;
  joinedAt: string;
}

const meritPath = path.join(process.cwd(), "src/data/merits.json");

export function getMerits(): MeritEntry[] {
  try {
    return JSON.parse(fs.readFileSync(meritPath, "utf-8"));
  } catch {
    return [];
  }
}

export function recordMerit(entry: Omit<MeritEntry, "joinedAt">): MeritEntry {
  const merits = getMerits();
  const full: MeritEntry = { ...entry, joinedAt: new Date().toISOString() };
  merits.push(full);
  fs.writeFileSync(meritPath, JSON.stringify(merits, null, 2));
  return full;
}

// --- Comments ---

export interface Comment {
  id: string;
  pitchId: string;
  name: string;
  text: string;
  createdAt: string;
}

const commentsPath = path.join(process.cwd(), "src/data/comments.json");

export function getComments(pitchId: string): Comment[] {
  try {
    const all: Comment[] = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));
    return all.filter((c) => c.pitchId === pitchId);
  } catch {
    return [];
  }
}

export function addComment(pitchId: string, name: string, text: string): Comment | null {
  const pitches = getPitches();
  const pitch = pitches.find((p) => p.id === pitchId);
  if (!pitch) return null;
  let all: Comment[] = [];
  try {
    all = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));
  } catch {}
  const comment: Comment = {
    id: String(Date.now()),
    pitchId,
    name,
    text,
    createdAt: new Date().toISOString(),
  };
  all.push(comment);
  fs.writeFileSync(commentsPath, JSON.stringify(all, null, 2));
  pitch.comments += 1;
  fs.writeFileSync(dataPath, JSON.stringify(pitches, null, 2));
  return comment;
}

export function upvotePitch(id: string): Pitch | null {
  const pitches = getPitches();
  const pitch = pitches.find((p) => p.id === id);
  if (!pitch) return null;
  pitch.upvotes += 1;
  fs.writeFileSync(dataPath, JSON.stringify(pitches, null, 2));
  return pitch;
}

export function incrementChatRequests(id: string): Pitch | null {
  const pitches = getPitches();
  const pitch = pitches.find((p) => p.id === id);
  if (!pitch) return null;
  pitch.chatRequests += 1;
  fs.writeFileSync(dataPath, JSON.stringify(pitches, null, 2));
  return pitch;
}
