# Minecraft Portfolio

A 3D portfolio site built as a walkable Minecraft-style voxel house. Scroll to move a camera along a fixed path through the garden and each room — About, Hall of Fame, Experience, Projects, Skills, and Contact — with a living scene around you: a farmer working the crops, a dog that circles the lawn and visits a couple chatting by the pond, day/night lighting, passing rain, and a hidden bug-hunt mini-game.

**Live:** [minecraft.arshadakl.in](https://minecraft.arshadakl.in)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **React Three Fiber** + **drei** + **Three.js** — the 3D scene, all procedurally generated voxel geometry (no external models)
- **Zustand** — scroll progress, achievements, audio/weather/day-night state
- **Tailwind CSS 4** — UI overlays (hotbar, terminal, toasts)
- Web Audio API — procedural sound effects and background music, no audio files
- Deployed on **Cloudflare** via `@opennextjs/cloudflare`

## Features

- Scroll-driven camera on a closed Catmull-Rom curve through the house, with drag-to-look freelook (Street View style, not raw mouse tracking)
- Procedurally generated house, garden, pond, and terrain — no imported assets
- Living NPCs with their own schedules: a farmer roaming/working/feeding the dog, a couple that chats, strolls the pond, and plays with the dog, all with collision-aware walked paths
- Day/night cycle (redstone lever) and a periodic rain system
- GitHub contribution wall rendered as glowing redstone lamps, fed by a cached API route
- Hidden bug-hunt achievement game and a fake terminal on the in-scene monitors

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying (Cloudflare Workers)

`git push` alone does **not** deploy — no CI is wired up. To ship:

```bash
npm run deploy
```

Notes:
- `/api/github` is edge-cached (12h). A redeploy ships new code immediately, but old cached API responses can still linger up to ~12h until the cache naturally revalidates — purge it in the Cloudflare dashboard for an instant refresh.
- `CONTACT_UPSTREAM_URL` / `CONTACT_SOURCE` secrets aren't in `wrangler.jsonc` (would get committed) — set per environment with `npx wrangler secret put <NAME>`.
