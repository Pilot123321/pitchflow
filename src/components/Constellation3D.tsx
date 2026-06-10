"use client";

import { useEffect, useRef } from "react";
import { sky } from "@/components/AuroraSky";

// The focal startup's constellation, in actual 3D: name hash → seeded
// star positions on a jittered sphere, rotated by a hand-rolled Y/X
// matrix, perspective-projected onto a 2D canvas. Changing reels
// crossfades one constellation into the next.

function fnv1a(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

type Star = [number, number, number, number]; // x, y, z, size

function starsFor(name: string): Star[] {
  let s = fnv1a(name) || 1;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0), s / 4294967296);
  const n = 7 + (fnv1a(name) % 4);
  const pts: Star[] = [];
  for (let i = 0; i < n; i++) {
    // golden-spiral distribution on a sphere, jittered radius
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963 + rnd() * 0.8;
    const rad = 0.75 + rnd() * 0.45;
    pts.push([Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad, 1 + rnd() * 1.8]);
  }
  return pts;
}

export default function Constellation3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    function resize() {
      canvas!.width = innerWidth * dpr;
      canvas!.height = innerHeight * dpr;
    }
    resize();
    addEventListener("resize", resize);

    const ptr = { x: 0, y: 0 };
    function onMove(e: PointerEvent) {
      ptr.x = (e.clientX / innerWidth - 0.5) * 0.8;
      ptr.y = (e.clientY / innerHeight - 0.5) * 0.5;
    }
    addEventListener("pointermove", onMove);

    let curName = "";
    let cur: Star[] = [];
    let prev: Star[] = [];
    let fade = 1; // 0→1 crossfade progress

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();

    function draw(now: number) {
      const t = (now - t0) / 1000;
      if (sky.name && sky.name !== curName) {
        prev = cur;
        cur = starsFor(sky.name);
        curName = sky.name;
        fade = 0;
      }
      fade = Math.min(1, fade + 0.035);

      const w = canvas!.width, h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const cx = w * 0.5, cy = h * 0.32;
      const R = Math.min(w, h) * 0.22;
      const f = 3.2; // focal length
      const ay = t * 0.22 + ptr.x; // yaw drifts + follows pointer
      const ax = -0.25 + ptr.y; // slight pitch
      const cyaw = Math.cos(ay), syaw = Math.sin(ay);
      const cpit = Math.cos(ax), spit = Math.sin(ax);
      const frac = sky.pos - Math.floor(sky.pos);
      const drift = frac * h * 0.06; // parallax while flicking

      function project([x, y, z]: Star): [number, number, number] {
        // rotate Y (yaw) then X (pitch)
        const x1 = x * cyaw + z * syaw;
        const z1 = -x * syaw + z * cyaw;
        const y2 = y * cpit - z1 * spit;
        const z2 = y * spit + z1 * cpit;
        const s = f / (f + z2);
        return [cx + x1 * R * s, cy + y2 * R * s + drift, s];
      }

      function render(stars: Star[], alpha: number) {
        if (!stars.length || alpha <= 0.01) return;
        const proj = stars.map(project);
        ctx!.strokeStyle = `rgba(238, 240, 255, ${0.22 * alpha})`;
        ctx!.lineWidth = dpr * 0.8;
        ctx!.beginPath();
        proj.forEach(([x, y], i) => (i ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y)));
        ctx!.stroke();
        proj.forEach(([x, y, s], i) => {
          const r = stars[i][3] * s * dpr;
          const anchor = i === 0;
          ctx!.fillStyle = anchor
            ? `rgba(200, 255, 77, ${0.95 * alpha * s})`
            : `rgba(238, 240, 255, ${0.8 * alpha * s})`;
          ctx!.beginPath();
          ctx!.arc(x, y, anchor ? r * 1.6 : r, 0, 6.2832);
          ctx!.fill();
        });
      }

      render(prev, (1 - fade) * 0.55);
      render(cur, fade * 0.55);
      if (!reduced) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none opacity-90" aria-hidden style={{ width: "100vw", height: "100vh" }} />;
}
