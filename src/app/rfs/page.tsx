import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startups That Want to Sell to Huge Companies — PitchFlow RFS",
  description:
    "A Request for Startups: AI has opened the door for tiny teams to land Fortune 100 customers. We want to back founders going after the most important customers in the world.",
};

const shifts = [
  {
    title: "The buyers are awake",
    body: "Leaders at the biggest companies in the world aren't hiding behind their computers — they're out looking for teams that can bend AI to solve key problems. In the last 3 years, YC companies have landed pilots and multimillion-dollar deals within their first year, sometimes during the batch itself.",
  },
  {
    title: "Small teams can ship deep products fast",
    body: "AI lets a 2–3 person team ship something thoughtful and nuanced enough for a Fortune 10 to find useful in months, not years. The 3-years-in-stealth-until-feature-parity meme is dead.",
  },
  {
    title: "Leaders know they have to adapt",
    body: "These companies are run by really smart people. They understand where to create value internally, what to outsource, and what happens if they don't move. They want to talk.",
  },
];

export default function RfsPage() {
  return (
    <div className="h-screen overflow-y-auto scrollbar-hide px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-ink/50 hover:text-ink text-sm transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-clay mb-3">
            Request for Startups
          </span>
          <h1 className="font-display text-ink text-3xl font-semibold leading-tight tracking-tight mb-3">
            Startups That Want to Sell to Huge Companies
          </h1>
          <p className="text-ink/50 text-sm">By Harshita Arora and Brad Flora</p>
        </header>

        {/* Body */}
        <article className="space-y-5 text-ink/80 text-[15px] leading-relaxed">
          <p>
            One of PG&apos;s wisest pieces of advice has always been that startups should sell to other
            startups. It&apos;s always been a hack to quickly get really smart, forward-thinking users that
            can help you shape your product into something awesome and important.
          </p>
          <p>
            It turns out there&apos;s another type of company that has really smart, forward-thinking buyers,
            but it&apos;s one that&apos;s been out of reach to startup founders until AI came along:{" "}
            <span className="text-ink font-semibold">Massive Enterprises.</span> We&apos;re not talking
            about just &ldquo;big&rdquo; companies — we&apos;re talking about the biggest companies in the
            world, which, it turns out, are run by incredibly smart, forward-thinking people. It&apos;s just
            always been too hard to get a hold of the right people there, too hard to build a product with
            the right depth and mix of features for a big company to use quickly, and too low ROI for these
            companies to take on the risk of working with an early-stage company.
          </p>
          <p>AI has changed the score on all three of these fronts:</p>

          {/* Three shifts */}
          <ol className="space-y-4 not-prose">
            {shifts.map((s, i) => (
              <li
                key={s.title}
                className="rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.02] p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-clay text-cream text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="font-display text-ink font-semibold mb-1.5">{s.title}</h2>
                    <p className="text-ink/65 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <p>
            We think this is a terrific environment for founders to sell into, and we want to back more teams
            that want to go after deals with the most famous, important customers in the world.
          </p>
        </article>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.02] p-6 text-center">
          <h3 className="font-display text-ink text-lg font-semibold mb-1.5">Building for the Fortune 100?</h3>
          <p className="text-ink/55 text-sm mb-5">
            Pitch your startup and tell us which giant you&apos;re going after.
          </p>
          <Link
            href="/submit"
            className="inline-block w-full py-3.5 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Submit Your Pitch
          </Link>
        </div>
      </div>
    </div>
  );
}
