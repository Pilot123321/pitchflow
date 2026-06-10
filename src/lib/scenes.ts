// Remap the neon gradients in pitches.json onto Hack the North's
// scenery palette (lagoon teals, moss greens, clay/brick sunsets).
const HTN_SCENES: Record<string, string> = {
  "from-amber-600 to-orange-800": "from-[#d97a26] to-[#8a3d06]",
  "from-amber-600 to-rose-700": "from-[#d97a26] to-[#a32222]",
  "from-cyan-600 to-blue-800": "from-[#0090b3] to-[#005066]",
  "from-emerald-600 to-teal-800": "from-[#0a8f80] to-[#004c4c]",
  "from-fuchsia-600 to-purple-800": "from-[#aa2248] to-[#5e1530]",
  "from-lime-600 to-green-800": "from-[#8aa31f] to-[#4c6212]",
  "from-rose-600 to-fuchsia-800": "from-[#c23b2e] to-[#7a1c3a]",
  "from-rose-600 to-pink-800": "from-[#c23b2e] to-[#8f1f1f]",
  "from-sky-600 to-indigo-800": "from-[#1a9bbf] to-[#1b4965]",
  "from-sky-600 to-violet-800": "from-[#1a9bbf] to-[#006566]",
  "from-violet-600 to-indigo-800": "from-[#007899] to-[#143c52]",
};

export function sceneFor(gradient: string): string {
  return HTN_SCENES[gradient] ?? gradient;
}
