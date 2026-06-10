"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CoffeeChatModalProps {
  pitchId: string;
  startupName: string;
  founderName: string;
  calendlyUrl?: string;
  onClose: () => void;
}

export default function CoffeeChatModal({ pitchId, startupName, founderName, calendlyUrl, onClose }: CoffeeChatModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session?.user) {
      setName((n) => n || session.user?.name || "");
      setEmail((e) => e || session.user?.email || "");
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pitchId, name, email, message }),
      });
      setSent(true);
    } catch {
      alert("Failed to send request. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative paper rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-slide-up">
        {sent ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">&#9749;</div>
            <h3 className="font-display text-ink text-xl font-semibold mb-2">Request Sent!</h3>
            <p className="text-ink/60 text-sm mb-6">
              {founderName} will receive your coffee chat request. You&apos;ll hear back via email if they&apos;re interested.
            </p>
            <div className="flex items-center justify-center gap-3">
              {calendlyUrl && (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-clay text-cream font-display font-semibold text-sm hover:bg-[#daff85] transition-colors"
                >
                  ☕ Book a time now
                </a>
              )}
              <button onClick={onClose} className="px-6 py-3 rounded-full bg-ink text-cream font-display font-semibold text-sm">
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-ink text-lg font-semibold">Request Coffee Chat</h3>
                <p className="text-ink/50 text-sm">with {founderName} at {startupName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!session?.user?.email}
                  className={`w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors ${
                    session?.user?.email ? "opacity-70" : ""
                  }`}
                  placeholder="jane@example.com"
                />
                {session?.user?.email && (
                  <p className="text-moss text-[10px] font-semibold mt-1">✓ verified via Google</p>
                )}
              </div>
              <div>
                <label className="text-ink/60 text-xs font-semibold block mb-1.5">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 border border-ink/15 text-ink text-sm placeholder:text-ink/35 focus:outline-none focus:border-clay transition-colors resize-none"
                  placeholder="I'm an investor interested in your space..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brick text-cream font-display font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
