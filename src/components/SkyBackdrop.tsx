"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AuroraSky, { sky } from "@/components/AuroraSky";

// The aurora lives behind every page. The feed drives its palette per
// reel; everywhere else it idles on the brand pair (or whatever reel
// you left the feed on), dimmed so dense pages stay readable.
export default function SkyBackdrop() {
  const pathname = usePathname();
  const onFeed = pathname === "/";

  useEffect(() => {
    if (sky.palettes.length === 0) {
      sky.palettes = [
        [
          [0.11, 0.55, 0.7], // ion teal
          [0.12, 0.1, 0.28], // deep indigo
        ],
      ];
    }
  }, []);

  return (
    <>
      <AuroraSky />
      <div
        aria-hidden
        className={`fixed inset-0 -z-10 pointer-events-none bg-[#0b0c18] transition-opacity duration-700 ${
          onFeed ? "opacity-0" : "opacity-60"
        }`}
      />
    </>
  );
}
