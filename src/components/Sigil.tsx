// Every startup gets a unique constellation, derived deterministically
// from its name: FNV-1a hash seeds an LCG, stars sit on a golden-angle
// spiral, neighbors are linked, and one "anchor" star burns brighter.
// Same name → same mark, everywhere it appears.

function fnv1a(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export default function Sigil({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  let s = fnv1a(name) || 1;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const n = 5 + (fnv1a(name) % 3); // 5–7 stars
  const c = 12;
  const pts: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = i * 2.399963 + rnd() * 0.9; // golden angle + jitter
    const radius = 3.2 + 7.2 * Math.sqrt((i + rnd()) / n);
    pts.push([
      c + radius * Math.cos(angle),
      c + radius * Math.sin(angle),
      0.9 + rnd() * 1.1, // star size
    ]);
  }
  const anchor = fnv1a(name + "*") % n;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <polyline
        points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.45"
      />
      {pts.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={(i === anchor ? r * 1.5 : r).toFixed(1)}
          fill="currentColor"
          opacity={i === anchor ? 1 : 0.75}
        />
      ))}
    </svg>
  );
}
