# PitchFlow 🎬

A short-form video platform for startup pitches — TikTok for founders. Watch 60-second
reels, upvote, and convert into whatever the founder actually needs: beta testing,
a coffee chat, a co-founder, an early hire, or amplification.

**The core idea — Early Merit:** supporters who show up before launch earn verifiable
standing with each startup. Joining a waitlist makes you an 🌱 *Early Believer*, leaving
feedback makes you an ✍️ *Contributor*, and committing to hands-on beta testing makes you
a 🛠️ *Founding Tester* — locking in the perk the founder promised (e.g. *50% off for
life*). Every action is recorded in a merit ledger the founder honors at launch.

## Running it

```bash
npm install
npm run preview   # one-shot production build + serve at http://localhost:3000
```

> ⚠️ There is intentionally no `dev` script — `next dev`'s file watcher froze the
> development machine. After edits: Ctrl+C and `npm run preview` again.

### Optional: Google sign-in

Auth is fully wired (Auth.js v5) and switches on when keys exist. Create an OAuth
client at console.cloud.google.com (redirect URI
`http://localhost:3000/api/auth/callback/google`), then fill in `.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Signed-in users get their email locked/verified across merits, waitlists, and chats.

## What's inside

**The feed** (`/`) — snap-scroll reels with scroll-linked dynamics: semantic zoom
(focus+context), staggered disclosure, an overview dot-rail minimap, parallax,
pointer spotlight, and a film-strip header whose sprockets advance as you scroll.
Each reel is wrapped by a **progress border** that fills clockwise over the video's
runtime. The profile card is **swipeable** — flick it away in 3D to watch
unobstructed, tap the paper tab to bring it back.

**Asks** — founders pick what they need on `/submit` (✦ early merit / ☕ coffee chat /
🤝 co-founder / 💼 recruiting / 📣 marketing); the card CTA and conversion modal adapt.

**Merit Passport** (`/profile`) — look up every merit you've earned by email
(auto-verified when signed in with Google).

Plus: Explore with real search + trending/newest sorts, comments on every pitch,
Calendly hand-off for investor chats, Web Share, persistent upvotes, and an
LLM-ready brainstorm coach (`/brainstorm`) that structures raw ideas into pitches.

Video playback (with the border synced to true playback time) is built but parked
behind `VIDEOS_ENABLED` in `PitchCard.tsx` until real founder videos replace the
Big Buck Bunny placeholders.

## Design language

Hack the North-inspired scrapbook: warm cream paper (`#FDF7EA`), ink/clay/brick/
lagoon/moss palette, Fredoka display type, dashed stamp chips, punched ticket stubs,
and a 3D motion layer (card swing-ins, coin-flip play button, sticker pops) that
keeps resting layouts flat and ordered. Everything honors `prefers-reduced-motion`.

## Architecture

```
src/lib/data.ts        ← THE seam: every read/write goes through here (JSON files)
src/lib/needs.ts       ← ask-type taxonomy (CTA/copy per need)
src/lib/merit.ts       ← merit tiers
src/lib/scenes.ts      ← palette mapping for card scenes
src/app/api/*          ← pitches, waitlist(+merit), upvote, comments, merits, chat, auth
src/components/*       ← FeedView (scroll engine), PitchCard, modals, Navbar
src/data/*.json        ← pitches, merits, comments (prototype storage)
```

Storage is deliberately JSON-on-disk for the prototype. To deploy for real, port
`data.ts` to Supabase (Postgres + the same Google/magic-link auth) — nothing above
that seam changes. Then: Vercel for hosting, Mux/Cloudflare Stream for video.
