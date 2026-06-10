"use client";

import { useEffect, useRef } from "react";
import type { SkyPalette } from "@/lib/palette";

// Mutable bus written by FeedView's per-frame scroll loop and read by
// the render loop here — no React state, no re-renders, no listeners.
export const sky = {
  pos: 0, // fractional reel index
  vel: 0, // |d(pos)/frame|, decays in the render loop
  name: "", // focal startup name (drives the 3D constellation)
  palettes: [] as SkyPalette[],
};

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

// fbm aurora: domain-warped value noise. Palette is a lerp between the
// current reel's pair and the next reel's pair, mixed by scroll
// fraction, so dragging between pitches literally drags the sky.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_a1; uniform vec3 u_b1;
uniform vec3 u_a2; uniform vec3 u_b2;
uniform float u_mix;
uniform float u_vel;
uniform vec2 u_ptr;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.04 + vec2(13.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 1.6;
  float t = u_time * 0.05;

  // flick velocity stretches the field vertically, like pulled film
  p.y *= 1.0 + min(u_vel * 8.0, 0.9);

  vec2 q = vec2(fbm(p + t), fbm(p - t * 1.3));
  float f = fbm(p * 1.4 + q * 1.5 + (u_ptr - 0.5) * 0.35);

  vec3 cA = mix(u_a1, u_a2, u_mix);
  vec3 cB = mix(u_b1, u_b2, u_mix);
  vec3 col = mix(cB * 0.55, cA, smoothstep(0.25, 0.9, f));
  col += pow(f, 3.0) * 0.30;                       // ridges glow
  col *= 0.30 + 0.70 * smoothstep(0.05, 0.95, f);  // depth falloff

  float vg = smoothstep(1.35, 0.45, length(uv - vec2(0.5, 0.55)));
  col *= vg;
  col = mix(vec3(0.043, 0.047, 0.094), col, 0.85); // settle into the void

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function AuroraSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return; // no WebGL: the void background stands alone

    function compile(type: number, src: string) {
      const sh = gl!.createShader(type)!;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      return sh;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("u_res"), uTime = U("u_time"), uMix = U("u_mix"), uVel = U("u_vel"), uPtr = U("u_ptr");
    const uA1 = U("u_a1"), uB1 = U("u_b1"), uA2 = U("u_a2"), uB2 = U("u_b2");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      canvas!.width = Math.floor(innerWidth * dpr);
      canvas!.height = Math.floor(innerHeight * dpr);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    addEventListener("resize", resize);

    const ptr = { x: 0.5, y: 0.5 };
    function onMove(e: PointerEvent) {
      ptr.x = e.clientX / innerWidth;
      ptr.y = 1 - e.clientY / innerHeight;
    }
    addEventListener("pointermove", onMove);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    let lastPos = sky.pos;

    function frame(now: number) {
      const i = Math.max(0, Math.floor(sky.pos));
      const pals = sky.palettes;
      const cur = pals[Math.min(i, pals.length - 1)] ?? [[0.1, 0.6, 0.75], [0.08, 0.24, 0.32]];
      const nxt = pals[Math.min(i + 1, pals.length - 1)] ?? cur;
      const frac = Math.min(1, Math.max(0, sky.pos - i));

      // velocity from the scroll bus, with decay so it breathes out
      sky.vel = Math.max(Math.abs(sky.pos - lastPos), sky.vel * 0.92);
      lastPos = sky.pos;

      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, (now - start) / 1000);
      gl!.uniform3f(uA1, cur[0][0], cur[0][1], cur[0][2]);
      gl!.uniform3f(uB1, cur[1][0], cur[1][1], cur[1][2]);
      gl!.uniform3f(uA2, nxt[0][0], nxt[0][1], nxt[0][2]);
      gl!.uniform3f(uB2, nxt[1][0], nxt[1][1], nxt[1][2]);
      gl!.uniform1f(uMix, frac);
      gl!.uniform1f(uVel, sky.vel);
      gl!.uniform2f(uPtr, ptr.x, ptr.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function onVis() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />;
}
