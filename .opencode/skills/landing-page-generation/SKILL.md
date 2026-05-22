---
name: landing-page-generation
description: "Use for landing page generation, hero sections, marketing pages, landing page creation, converting Figma designs to landing pages. Generates landing pages that match the existing project conventions."
---

# Landing Page Generation

Generate landing pages consistent with the project's existing patterns.

## Conventions

This project uses:
- **Next.js 16 App Router** with file-based routing under `app/`
- **React 19** Server Components by default, Client Components only when interactivity is needed
- **Tailwind CSS v4** with `@tailwindcss/postcss` (v4 syntax — no `@tailwind base/components/utilities`)
- **framer-motion** for animations (`motion.div`, `motion.p`, etc.)
- **shadcn/ui** components via `components.json`
- **lucide-react** for icons
- **`cn()`** utility from `lib/utils.ts` for class merging

## Structure

Pages live in `app/<route>/page.tsx`. Use `app/<route>/layout.tsx` for shared layouts. Place reusable UI in `components/`.

For marketing/landing sections, follow the pattern in `components/home/figma-home-renderer.tsx`:
- Use Tailwind utility classes extensively
- Add framer-motion `initial`/`animate`/`whileInView` for scroll animations
- Keep sections as separate components in `components/`

## Steps

1. Create route in `app/` (e.g. `app/landing/page.tsx`)
2. Use existing components from `components/` where possible
3. Follow the responsive design: mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
4. Add metadata with `export const metadata` or `generateMetadata`
5. Use `next/image` for images (not `<img>`), placing assets in `public/`
