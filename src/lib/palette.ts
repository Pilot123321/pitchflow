// Per-pitch color pairs for the aurora shader, derived from the same
// gradient keys the rest of the app uses. Values are 0..1 RGB.

const HEX: Record<string, [string, string]> = {
  "from-amber-600 to-orange-800": ["#d97a26", "#8a3d06"],
  "from-amber-600 to-rose-700": ["#d97a26", "#a32222"],
  "from-cyan-600 to-blue-800": ["#0090b3", "#005066"],
  "from-emerald-600 to-teal-800": ["#0a8f80", "#004c4c"],
  "from-fuchsia-600 to-purple-800": ["#aa2248", "#5e1530"],
  "from-lime-600 to-green-800": ["#8aa31f", "#4c6212"],
  "from-rose-600 to-fuchsia-800": ["#c23b2e", "#7a1c3a"],
  "from-rose-600 to-pink-800": ["#c23b2e", "#8f1f1f"],
  "from-sky-600 to-indigo-800": ["#1a9bbf", "#1b4965"],
  "from-sky-600 to-violet-800": ["#1a9bbf", "#006566"],
  "from-violet-600 to-indigo-800": ["#007899", "#143c52"],
};

function toRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export type SkyPalette = [[number, number, number], [number, number, number]];

export function paletteFor(gradient: string): SkyPalette {
  const [a, b] = HEX[gradient] ?? ["#1a9bbf", "#143c52"];
  return [toRgb(a), toRgb(b)];
}
