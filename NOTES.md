# Pulse — Notes

Short write-up per phase. My approach throughout: read the whole flow end-to-end
first (presence, polling, signaling, WebRTC, P2P data channel), fix root causes
over symptoms, and keep changes type-safe (`tsc --noEmit`) and lint-clean.

---

## Phase 1 — Make it run

Four bugs, found by tracing the data flow against the requirements:

- **Dots never disappeared** (`app/api/poll/route.ts`). The heartbeat ran
  `updateMany({ where: {} })`, refreshing **every** presence row's `lastSeen` on
  every poll, so the staleness reaper never removed anyone. This is the README's
  example bug. Fix: scope the heartbeat to the caller (`where: { id }`).
- **Chat messages never arrived** (`lib/webrtc.ts`). `sendChat` tagged the
  payload `t: "msg"` but the receiver only handled `t: "chat"`, so every message
  was silently dropped. Fix: send `t: "chat"`.
- **Peers stuck "busy" after a call** (`app/api/signal/route.ts`). The code only
  cleared `busy` on `decline`, never on `end` (despite the comment saying both).
  After hanging up, both dots stayed dimmed and couldn't reconnect. Fix: clear
  `busy` on `decline` or `end`.
- **Queued ICE candidates discarded** (`lib/webrtc.ts`). Candidates are queued
  while `remoteDescription` is null, but `flushPendingCandidates()` ran before
  `setRemoteDescription()`, so every queued candidate threw and was lost,
  causing flaky or failed connections. Fix: set the remote description first,
  then flush.

Setup fix: added `postinstall: "prisma generate"` so the Prisma client is always
built on fresh clones and on Vercel (`next dev` doesn't generate it, which caused
a 500 on `/api/poll`).

---

## Phase 2 — Make it good

Gave Pulse one cohesive design language: a calm, premium nocturnal globe. Deep
space-black canvas, an emerald-to-cyan signature glow, glassmorphic floating
panels, refined Geist typography, and restrained motion.

- **Design system** (`app/globals.css`): palette plus brand tokens, a `.glass`
  surface utility, a motion toolkit (fade, slide, pop, drop, aurora, breathe,
  vibrate), an animated `.pulse-dot` that breathes in the accent color, a
  `live-dot` indicator, a thin custom scrollbar, and `prefers-reduced-motion`
  support. Also fixed the body forcing `Arial` over the loaded Geist font.
- **EntryGate**: hero with an animated aurora backdrop, brand mark with a live
  ping, gradient headline, glowing CTA with a loading state. The "PULSE"
  wordmark does a periodic subtle vibrate.
- **WorldMap**: brand mark, top legibility fade, glass "people online" pill with
  a live pulse.
- **ChatPanel, VideoPanel, ConnectionPrompt, notices**: glass surfaces,
  spring/slide entrances, stranger avatar plus live status, gradient message
  bubbles, ambient video waiting state, floating PiP.

Kept it dependency-free (pure CSS/Tailwind motion) to keep the build lean, and
preserved every class and inline style the map's JS relies on.

---

## Phase 3 — Make it secure

Root cause behind the critical issues: the session `id` was client-generated,
sent in every request, and broadcast to all users in the poll response, yet it
was the only proof of identity. Anyone who saw a peer's id could act as them.

Issues, ranked:

1. **(Critical) No session authentication**: impersonate any user.
2. **(Critical) `poll` drains any id's mailbox**: steal or break a victim's
   signaling.
3. **(Critical) `leave` deletes any id**: force a victim offline.
4. **(High) `signal` trusts `fromId`**: spoof requests, offers, answers, ICE, or
   `end`.
5. **(Medium) spoofed `accept` marks peers busy**: griefing.
6. **(Medium) no rate limiting**: presence flooding, DB spam, DoS.
7. **(Low) inconsistent input validation.**
8. **(Low) no security headers.**

Fixed (1 to 4, 7, 8): made the server the source of identity (`lib/session.ts`).
Join now mints the session id server-side and returns it in an HMAC-signed,
HttpOnly, SameSite=Strict cookie; `poll`, `signal`, and `leave` derive identity
from that cookie, never from client-supplied ids. Because the id is
server-generated and the cookie is signed with a server-only key, an attacker can
never obtain a valid cookie for another id. Stays fully anonymous: the cookie
holds only an ephemeral random id. Also added `toId` bounds plus self-signal
rejection, and security headers (`X-Frame-Options: DENY` with
`frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, and a `Permissions-Policy`
scoped to the camera/mic/geo the app uses). `SESSION_SECRET` documented in
`.env.example` (required in production; the code throws if missing).

Deliberately deferred (documented, not fixed):

- **#5 forced-busy via `accept`**: needs a server-side connection-state model
  (the matching `request` is already drained by the time `accept` arrives).
- **#6 rate limiting**: naive in-memory limiting is ineffective on Vercel
  serverless; the right fix is edge middleware plus Upstash/Vercel KV. Top
  follow-up.
- **Mapbox token** is `NEXT_PUBLIC` (expected): recommend URL-restricting it in
  the Mapbox dashboard.

---

## Phase 4 — Make it better: "In-call magic"

Three peer-to-peer touches that make a connection feel human instead of an
awkward blank chat box. All ride the existing WebRTC data channel, so nothing
reaches the server, consistent with Pulse's privacy model.

- **Shared icebreakers**: both strangers see the same prompt when the chat opens
  (one side seeds it and broadcasts P2P); either can shuffle a new one.
- **Live typing indicator**: animated dots when the stranger is typing, debounced
  and auto-clearing.
- **Tappable reactions**: emoji palette on any message; reactions render as chips
  with counts and sync to both peers.

How it's built: extended the data-channel schema with `typing`, `reaction`, and
`prompt` message kinds (`lib/webrtc.ts`); chat messages now carry a shared `mid`
(minted by the sender) so a reaction maps to the same message on both sides.
Prompts live in `lib/icebreakers.ts`; UI in `app/components/ChatPanel.tsx` in the
Phase 2 glass/motion language.

What I'd do next with more time: reaction toggling (currently additive), an
icebreaker "answer together" mode, and a subtle sound or haptic on a new
reaction.
