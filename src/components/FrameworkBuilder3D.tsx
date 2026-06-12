"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ─── Constellation Frame — build the startup as a 3D flow chart ─────────────
//
// Instead of a wall of form fields, the framework is a small constellation
// you assemble: each block (hook, problem, solution…) is a star-card floating
// in 3D, wired to the next by flow beams. Drag the sky to orbit; drag a card
// to move it; tap a card to write its one line — filling it lights the star.
// "link" connects (or disconnects) any two stars; "branch" grows new ones;
// "reset" restores the default frame layout. The scene only moves when you
// move it.
//
// All hand-rolled CSS 3D: one perspective scene rotated by pointer drag,
// every card counter-rotated (billboard) so it always faces you, and each
// edge is a thin div aimed along the 3D vector between its two nodes
// (translate → rotateY(yaw) → rotateZ(pitch) of a unit X-axis bar). Card
// drags happen in the view plane: the screen delta is pushed through the
// inverse scene rotation so the card lands where your finger is.

export type FrameNode = {
  id: string;
  label: string;
  text: string;
  pos: [number, number, number];
  accent: string;
  fixed: boolean; // template blocks can't be removed
};

export type FrameEdge = [string, string];

// The default frame: a starting template, not a cage — every position and
// connection below is editable in the scene.
const TEMPLATE: Omit<FrameNode, "text">[] = [
  { id: "hook", label: "Hook", pos: [0, -115, 30], accent: "#c8ff4d", fixed: true },
  { id: "problem", label: "Problem", pos: [-145, -30, -60], accent: "#ff5c7a", fixed: true },
  { id: "solution", label: "Solution", pos: [125, -35, -30], accent: "#5be9ff", fixed: true },
  { id: "who", label: "Who it's for", pos: [-65, 65, -150], accent: "#7cf5a8", fixed: true },
  { id: "model", label: "Model", pos: [150, 80, -110], accent: "#c8ff4d", fixed: true },
  { id: "moat", label: "Moat", pos: [-10, 150, -40], accent: "#ff5c7a", fixed: true },
];

const TEMPLATE_EDGES: FrameEdge[] = [
  ["hook", "problem"],
  ["problem", "solution"],
  ["solution", "who"],
  ["solution", "model"],
  ["model", "moat"],
];

const HINTS: Record<string, string> = {
  hook: "Your one-line pitch — the sentence that stops the scroll.",
  problem: "The painful thing people do today.",
  solution: "The one magic interaction that fixes it.",
  who: "Who hits this problem hardest?",
  model: "How it makes money.",
  moat: "Why you, why is this hard to copy?",
};

const RAD = Math.PI / 180;

// Screen-plane delta → world delta at the current orbit (inverse rotation).
function screenToWorld(dx: number, dy: number, rx: number, ry: number): [number, number, number] {
  const cx = Math.cos(rx * RAD);
  const sx = Math.sin(rx * RAD);
  // undo rotateX
  const y1 = dy * cx;
  const z1 = -dy * sx;
  // undo rotateY
  const cy = Math.cos(ry * RAD);
  const sy = Math.sin(ry * RAD);
  return [dx * cy - z1 * sy, y1, dx * sy + z1 * cy];
}

const clampPos = (p: [number, number, number]): [number, number, number] => [
  Math.max(-200, Math.min(200, p[0])),
  Math.max(-170, Math.min(185, p[1])),
  Math.max(-220, Math.min(160, p[2])),
];

export function FrameworkBuilder3D({
  seed,
  onChange,
}: {
  seed?: Partial<Record<string, string>>;
  onChange: (nodes: FrameNode[]) => void;
}) {
  const [nodes, setNodes] = useState<FrameNode[]>(() =>
    TEMPLATE.map((n) => ({ ...n, pos: [...n.pos] as [number, number, number], text: seed?.[n.id] ?? "" }))
  );
  const [edges, setEdges] = useState<FrameEdge[]>(TEMPLATE_EDGES);
  const [selected, setSelected] = useState<string | null>("hook");
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [rot, setRot] = useState({ rx: -8, ry: 14 });
  // Deep dive: the camera flies into the pressed star; `glide` turns the CSS
  // transition on just for that flight so orbit drags stay instant.
  const [dived, setDived] = useState(false);
  const [glide, setGlide] = useState(false);
  const glideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function triggerGlide() {
    setGlide(true);
    if (glideTimer.current) clearTimeout(glideTimer.current);
    glideTimer.current = setTimeout(() => setGlide(false), 750);
  }

  const orbit = useRef({ on: false, x: 0, y: 0, moved: 0 });
  const nodeDrag = useRef<{ id: string; x: number; y: number } | null>(null);
  const lastNodeMove = useRef(0);
  // Hold a star ~0.6s to dive into it; a quick tap just selects it for editing.
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired = useRef(false);

  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }
  const rotRef = useRef(rot);
  rotRef.current = rot;

  useEffect(() => onChange(nodes), [nodes, onChange]);

  // ── orbiting the sky (background drag) ──
  function onSkyDown(e: React.PointerEvent) {
    orbit.current = { on: true, x: e.clientX, y: e.clientY, moved: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onSkyMove(e: React.PointerEvent) {
    if (!orbit.current.on) return;
    const dx = e.clientX - orbit.current.x;
    const dy = e.clientY - orbit.current.y;
    orbit.current.x = e.clientX;
    orbit.current.y = e.clientY;
    orbit.current.moved += Math.abs(dx) + Math.abs(dy);
    if (dived) return; // no orbiting inside a dive — the sky is just an exit
    setRot((r) => ({
      rx: Math.max(-38, Math.min(38, r.rx - dy * 0.35)),
      ry: r.ry + dx * 0.45,
    }));
  }
  function onSkyUp() {
    if (orbit.current.on && orbit.current.moved < 6) {
      if (linkFrom) setLinkFrom(null); // tap empty sky cancels linking
      else if (dived) surface(); // tap the sky to swim back out
    }
    orbit.current.on = false;
  }

  function surface() {
    setDived(false);
    triggerGlide();
  }

  // ── moving a star (card drag) ──
  function onNodeDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    holdFired.current = false;
    cancelHold();
    if (dived) {
      lastNodeMove.current = 0;
      return; // stars don't move inside a dive — taps only
    }
    nodeDrag.current = { id, x: e.clientX, y: e.clientY };
    lastNodeMove.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    // Keep holding (without dragging) and you sink into the star.
    holdTimer.current = setTimeout(() => {
      if (lastNodeMove.current > 6 || linkFrom) return;
      holdFired.current = true;
      nodeDrag.current = null;
      setSelected(id);
      setDived(true);
      triggerGlide();
    }, 600);
  }
  function onNodeMove(e: React.PointerEvent) {
    const d = nodeDrag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    lastNodeMove.current += Math.abs(dx) + Math.abs(dy);
    if (lastNodeMove.current > 6) cancelHold(); // a drag is not a hold
    const [wx, wy, wz] = screenToWorld(dx, dy, rotRef.current.rx, rotRef.current.ry);
    setNodes((ns) =>
      ns.map((n) => (n.id === d.id ? { ...n, pos: clampPos([n.pos[0] + wx, n.pos[1] + wy, n.pos[2] + wz]) } : n))
    );
  }
  function onNodeUp() {
    nodeDrag.current = null;
    cancelHold();
  }

  function tapNode(id: string) {
    if (holdFired.current) return; // the hold already dove in
    if (lastNodeMove.current > 6) return; // it was a drag, not a tap
    if (linkFrom && linkFrom !== id) {
      toggleEdge(linkFrom, id);
      setLinkFrom(null);
      return;
    }
    if (linkFrom === id) {
      setLinkFrom(null);
      return;
    }
    if (dived) {
      if (selected !== id) {
        setSelected(id); // glide over to a neighbouring star
        triggerGlide();
      }
      return;
    }
    setSelected(id); // quick tap: select + edit below, no dive
  }

  function toggleEdge(a: string, b: string) {
    setEdges((es) => {
      const i = es.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
      return i >= 0 ? es.filter((_, j) => j !== i) : [...es, [a, b] as FrameEdge];
    });
  }

  function update(id: string, patch: Partial<FrameNode>) {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function branchOff(parentId: string) {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;
    const id = `note-${Date.now().toString(36)}`;
    const a = Math.random() * Math.PI * 2;
    const pos = clampPos([
      parent.pos[0] + Math.cos(a) * 95,
      parent.pos[1] + 55 + Math.random() * 30,
      parent.pos[2] + Math.sin(a) * 95,
    ]);
    setNodes((ns) => [...ns, { id, label: "Note", text: "", pos, accent: "#eef0ff", fixed: false }]);
    setEdges((es) => [...es, [parentId, id]]);
    setSelected(id);
    if (dived) triggerGlide(); // glide over to the new star
  }

  function removeNode(id: string) {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter(([a, b]) => a !== id && b !== id));
    setSelected(null);
    setLinkFrom(null);
    if (dived) surface();
  }

  // Back to the default frame: template positions + connections, your words kept.
  function resetFrame() {
    setNodes((ns) =>
      TEMPLATE.map((t) => ({
        ...t,
        pos: [...t.pos] as [number, number, number],
        text: ns.find((n) => n.id === t.id)?.text ?? "",
      }))
    );
    setEdges(TEMPLATE_EDGES);
    setLinkFrom(null);
    setDived(false);
    setRot({ rx: -8, ry: 14 });
    triggerGlide();
  }

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const sel = selected ? byId.get(selected) : null;
  const lit = nodes.filter((n) => n.text.trim()).length;
  const linking = linkFrom ? byId.get(linkFrom) : null;

  return (
    <div>
      {/* the sky you build in */}
      <div
        className="relative h-[400px] rounded-2xl bg-ink/[0.03] border border-ink/10 overflow-hidden touch-none cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: "1100px" }}
        onPointerDown={onSkyDown}
        onPointerMove={onSkyMove}
        onPointerUp={onSkyUp}
        onPointerCancel={onSkyUp}
      >
        <div
          className={`absolute left-1/2 top-1/2 ${glide ? "transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]" : ""}`}
          style={{
            transformStyle: "preserve-3d",
            // Diving: bring the chosen star to the origin, then dolly the
            // whole sky toward the viewer.
            transform:
              dived && sel
                ? `translate3d(0, 0, 230px) rotateX(${rot.rx}deg) rotateY(${rot.ry}deg) translate3d(${-sel.pos[0]}px, ${-sel.pos[1]}px, ${-sel.pos[2]}px)`
                : `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)`,
          }}
        >
          {/* flow beams */}
          {edges.map(([a, b]) => {
            const na = byId.get(a);
            const nb = byId.get(b);
            if (!na || !nb) return null;
            const dx = nb.pos[0] - na.pos[0];
            const dy = nb.pos[1] - na.pos[1];
            const dz = nb.pos[2] - na.pos[2];
            const len = Math.hypot(dx, dy, dz);
            const yaw = Math.atan2(-dz, dx);
            const pitch = Math.asin(dy / len);
            const on = !!(na.text.trim() && nb.text.trim());
            return (
              <div
                key={`${a}-${b}`}
                className="absolute"
                style={{
                  width: len,
                  height: 1.5,
                  left: -len / 2,
                  top: 0,
                  background: on
                    ? `linear-gradient(90deg, ${na.accent}, ${nb.accent})`
                    : "rgba(238,240,255,0.22)",
                  opacity: on ? 0.85 : 1,
                  transform: `translate3d(${(na.pos[0] + nb.pos[0]) / 2}px, ${(na.pos[1] + nb.pos[1]) / 2}px, ${(na.pos[2] + nb.pos[2]) / 2}px) rotateY(${yaw}rad) rotateZ(${pitch}rad)`,
                }}
              />
            );
          })}

          {/* star-cards, billboarded to face you */}
          {nodes.map((n) => {
            const isLit = !!n.text.trim();
            const isSel = selected === n.id;
            const isLinkSource = linkFrom === n.id;
            const isDeep = dived && isSel; // the star we're inside
            return (
              <button
                key={n.id}
                onClick={() => tapNode(n.id)}
                onPointerDown={(e) => onNodeDown(e, n.id)}
                onPointerMove={onNodeMove}
                onPointerUp={onNodeUp}
                onPointerCancel={onNodeUp}
                className={`absolute rounded-xl text-left transition-[box-shadow,border-color,background-color,width,margin,opacity,padding] duration-500 ${
                  isDeep
                    ? "w-[15.5rem] -ml-[7.75rem] -mt-20 px-4 py-3.5 cursor-default"
                    : "w-[7.5rem] -ml-[3.75rem] -mt-7 px-2.5 py-2 cursor-grab active:cursor-grabbing"
                } ${isLit || isDeep ? "bg-cream/90" : "bg-cream/40"} ${
                  dived && !isSel ? "opacity-30" : ""
                } ${isSel || isLinkSource ? "ring-1" : ""} ${isLinkSource ? "animate-pulse" : ""}`}
                style={{
                  transform: `translate3d(${n.pos[0]}px, ${n.pos[1]}px, ${n.pos[2]}px) rotateY(${-rot.ry}deg) rotateX(${-rot.rx}deg)`,
                  border: `1px ${isLit || isDeep ? "solid" : "dashed"} ${isLit || isSel || isLinkSource ? n.accent : "rgba(238,240,255,0.25)"}`,
                  boxShadow: isLit || isDeep ? `0 0 ${isDeep ? 34 : isSel ? 26 : 14}px ${n.accent}55` : "none",
                  ...(isSel || isLinkSource ? ({ "--tw-ring-color": n.accent } as React.CSSProperties) : {}),
                }}
              >
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 10 10" width={isDeep ? 11 : 9} height={isDeep ? 11 : 9} aria-hidden>
                    <circle cx="5" cy="5" r={isLit ? 3 : 2} fill={isLit ? n.accent : "none"} stroke={n.accent} strokeWidth="1" opacity={isLit ? 1 : 0.5} />
                  </svg>
                  <span
                    className={`font-bold uppercase tracking-wider ${isDeep ? "text-[11px]" : "text-[10px]"}`}
                    style={{ color: isLit || isDeep ? n.accent : "rgba(238,240,255,0.55)" }}
                  >
                    {n.label}
                  </span>
                </span>
                <span
                  className={`block mt-1 leading-relaxed ${
                    isDeep
                      ? `text-[13px] ${isLit ? "text-ink" : "text-ink/40 italic"}`
                      : `text-[11px] leading-snug line-clamp-2 ${isLit ? "text-ink/90" : "text-ink/35 italic"}`
                  }`}
                >
                  {n.text.trim() || (isDeep ? HINTS[n.id] ?? "Nothing written yet — use the panel below." : "tap to write")}
                </span>
              </button>
            );
          })}
        </div>

        {dived && (
          <button
            onClick={surface}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-3 top-2.5 text-[11px] font-bold tracking-wider text-ink/50 hover:text-ink transition-colors"
          >
            ✕ SURFACE
          </button>
        )}
        <span className="absolute left-3 bottom-2.5 text-[10px] text-ink/35 pointer-events-none">
          {linking
            ? `tap a star to connect ⟷ ${linking.label} · tap the sky to cancel`
            : dived
              ? "inside the star — tap the sky to surface"
              : "drag sky to orbit · drag a star to move · hold to dive in"}
        </span>
        <div className="absolute right-3 top-2.5 flex items-center gap-3">
          <button
            onClick={resetFrame}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-[10px] font-bold tracking-wider text-ink/40 hover:text-ink/80 transition-colors"
          >
            RESET
          </button>
          <span className="text-[10px] font-bold tracking-wider text-ink/45 pointer-events-none">
            {lit}/{nodes.length} LIT
          </span>
        </div>
      </div>

      {/* grounded editor for the selected star */}
      {sel && (
        <div className="mt-3 rounded-2xl bg-ink/[0.04] border border-ink/10 p-3.5">
          <div className="flex items-center justify-between mb-2">
            {sel.fixed ? (
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: sel.accent }}>
                {sel.label}
              </span>
            ) : (
              <input
                value={sel.label}
                onChange={(e) => update(sel.id, { label: e.target.value })}
                className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-ink/80 focus:outline-none w-32"
                placeholder="Label"
              />
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLinkFrom(linkFrom === sel.id ? null : sel.id)}
                className={`text-[11px] font-semibold transition-colors ${linkFrom === sel.id ? "text-clay" : "text-ink/50 hover:text-ink"}`}
              >
                ⟷ link
              </button>
              <button onClick={() => branchOff(sel.id)} className="text-[11px] font-semibold text-ink/50 hover:text-ink transition-colors">
                ＋ branch
              </button>
              {!sel.fixed && (
                <button onClick={() => removeNode(sel.id)} className="text-[11px] font-semibold text-brick/80 hover:text-brick transition-colors">
                  remove
                </button>
              )}
            </div>
          </div>
          <textarea
            value={sel.text}
            onChange={(e) => update(sel.id, { text: e.target.value })}
            rows={2}
            autoFocus
            placeholder={HINTS[sel.id] ?? "One short line."}
            className="w-full px-3 py-2.5 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none transition-colors resize-none"
            style={{ borderColor: sel.text.trim() ? `${sel.accent}66` : undefined }}
          />
        </div>
      )}
    </div>
  );
}
