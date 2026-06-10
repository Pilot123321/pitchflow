"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/",
      label: "Feed",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/explore",
      label: "Explore",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: "/submit",
      label: "Pitch",
      icon: () => (
        <div className="w-10 h-8 rounded-lg bg-brick shadow flex items-center justify-center">
          <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      ),
      special: true,
    },
    {
      href: "/explore?filter=trending",
      label: "Trending",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
    },
    {
      href: "#",
      label: "Profile",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 paper rounded-2xl border border-ink/15 shadow-[0_-6px_24px_rgba(46,26,5,0.18),0_14px_30px_rgba(46,26,5,0.4)]">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`dock-tab flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                tab.special ? "" : isActive ? "text-clay" : "text-ink/40 hover:text-ink"
              }`}
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-semibold ${tab.special ? "text-ink/60" : ""}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
