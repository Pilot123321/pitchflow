import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PitchFlow — discover startups in 60 seconds";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0c18",
          color: "#eef0ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, background: "#eef0ff" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "#eef0ff" }} />
        <div style={{ display: "flex", fontSize: 110, fontWeight: 700, letterSpacing: -3 }}>
          <span>Pitch</span>
          <span style={{ color: "#c8ff4d" }}>Flow</span>
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "rgba(238,240,255,0.6)", marginTop: 12 }}>
          Discover startups in 60 seconds · earn early merit
        </div>
      </div>
    ),
    size
  );
}
