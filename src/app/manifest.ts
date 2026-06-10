import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PitchFlow",
    short_name: "PitchFlow",
    description: "Discover startups in 60 seconds — watch pitches, earn early merit.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf7ea",
    theme_color: "#fdf7ea",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
