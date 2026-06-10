// API smoke tests. Run against a live server:
//   npm run preview   (in another terminal)
//   npm run test:api
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const j = (r) => r.json();

test("GET /api/pitches returns the feed", async () => {
  const pitches = await fetch(`${BASE}/api/pitches`).then(j);
  assert.ok(Array.isArray(pitches) && pitches.length > 0);
  assert.ok(pitches[0].startupName);
});

test("POST /api/upvote increments", async () => {
  const before = (await fetch(`${BASE}/api/pitches`).then(j)).find((p) => p.id === "1").upvotes;
  const res = await fetch(`${BASE}/api/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "1" }),
  }).then(j);
  assert.equal(res.success, true);
  assert.equal(res.upvotes, before + 1);
});

test("POST /api/waitlist records merit with correct tier", async () => {
  const res = await fetch(`${BASE}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "1",
      name: "Smoke Test",
      email: "smoke@test.dev",
      message: "feedback text",
      committed: true,
    }),
  }).then(j);
  assert.equal(res.success, true);
  assert.equal(res.merit.tier, "founding");
  assert.ok(res.merit.supporterNumber > 0);
  assert.ok(res.merit.perk);
});

test("GET /api/merits finds the recorded merit", async () => {
  const entries = await fetch(`${BASE}/api/merits?email=smoke@test.dev`).then(j);
  assert.ok(entries.length >= 1);
  assert.equal(entries[0].tier, "founding");
  assert.equal(entries[0].committed, true);
});

test("comments round-trip and validate", async () => {
  const posted = await fetch(`${BASE}/api/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pitchId: "1", name: "Smoke Test", text: "smoke comment" }),
  });
  assert.equal(posted.status, 201);
  const list = await fetch(`${BASE}/api/comments?pitchId=1`).then(j);
  assert.ok(list.some((c) => c.text === "smoke comment"));
  const bad = await fetch(`${BASE}/api/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pitchId: "1", name: "", text: "" }),
  });
  assert.equal(bad.status, 400);
});

test("missing fields are rejected", async () => {
  const res = await fetch(`${BASE}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "1" }),
  });
  assert.equal(res.status, 400);
});
