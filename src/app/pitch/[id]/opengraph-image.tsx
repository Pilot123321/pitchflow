import { ImageResponse } from "next/og";
import { getPitchById } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Startup pitch on PitchFlow";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pitch = getPitchById(id);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "#fdf7ea",
          color: "#43290f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, background: "#43290f" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "#43290f" }} />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, marginBottom: 20 }}>
          <span>Pitch</span>
          <span style={{ color: "#bd580f" }}>Flow</span>
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
          {pitch?.startupName ?? "Startup pitch"}
        </div>
        <div style={{ display: "flex", fontSize: 38, color: "rgba(67,41,15,0.7)", marginTop: 16, maxWidth: 1000 }}>
          {pitch?.tagline ?? "Watch the 60-second pitch"}
        </div>
        {pitch?.earlyPerk && (
          <div
            style={{
              display: "flex",
              marginTop: 38,
              padding: "12px 28px",
              background: "#f5e9cf",
              color: "#bd580f",
              fontSize: 30,
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            🎟 EARLY PERK · {pitch.earlyPerk.toUpperCase()}
          </div>
        )}
      </div>
    ),
    size
  );
}
