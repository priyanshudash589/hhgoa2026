# HH GOA 2026

**A Figma-to-React landing page for Hacker House Goa.**

---

## What is HH GOA?

A single-page website for Hacker House Goa 2026 — a 4-day experimental hackathon in Goa, India. The entire UI is rendered from a Figma design tree using an auto-generated token-to-CSS pipeline.

---

## Branches

| Branch | Description |
|---|---|
| `main` | Production base |
| `dhanush` | Active — animation tweaks, cleanup |
| `pd/ui-updates` | Stalled — earlier UI experiments |

---

## Structure

```
app/                        Next.js App Router
  layout.tsx                Root layout + fonts (Imbue, Victor Mono)
  page.tsx                  Entry → <FigmaHomeRenderer />
  globals.css               Tailwind v4 + brand tokens + keyframes

components/home/
  figma-home-renderer.tsx   The entire page — recursive Figma node renderer

lib/
  figma-tokens.ts           20,838-line auto-generated design token map
  figma-home-tree.ts        5,099-line auto-generated Figma node tree
  figma-mappers.ts          Runtime converters: Figma tokens → CSS
  figma-assets.ts           Node ID → asset path map (181 SVGs + 12 PNGs)

scripts/
  extract-figma-home.mjs    Pipeline: Figma YAML → TypeScript

public/assets/              193 assets (~28 MB)
```

---

## Architecture

```
Figma Design (1440×16024)
  ↓ Framelink MCP → YAML
extract-figma-home.mjs
  ↓ generates
figma-tokens.ts + figma-home-tree.ts
  ↓ parsed at runtime by
figma-mappers.ts
  ↓ consumed by
figma-home-renderer.tsx
  ↓ renders
<motion.div> / <img> / <p> / <button>  + framer-motion animations
```

The Figma canvas is rendered at fixed size (1440×16024px), then CSS-scaled via `transform: scale(viewport / 1440)` for responsive fidelity.

---

## Tech Stack

| Layer | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | framer-motion 12 |
| Fonts | Imbue (headings), Victor Mono (body) |
| Pipeline | Figma → Framelink MCP → custom extraction script |

No backend, no database, no API.

---

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build + type check |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

---

## Key Details

- **Auto-generated tokens** — 73% of the codebase is generated data (20,838-line token file)
- **Animated counters** — Stat numbers use `requestAnimationFrame` with cubic ease-out
- **Agenda tabs** — framer-motion `layoutId` for animated pill transitions
- **Accessibility** — Respects `prefers-reduced-motion`, uses `aria-*` attributes

---

Built by [2:47 PM Studio](https://247pm.studio)
