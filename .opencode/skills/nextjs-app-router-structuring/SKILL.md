---
name: nextjs-app-router-structuring
description: "REUSABLE WORKFLOW: Use for Next.js App Router structuring, route organization, route groups, layouts, parallel routes, intercepting routes, loading states, error boundaries, metadata."
---

# Next.js App Router Structuring

Structure Next.js App Router applications following best practices.

## Route Groups

Use `(group)` to organize routes without affecting URL path:

```
app/
├── (marketing)/
│   ├── page.tsx         → /
│   └── about/page.tsx   → /about
├── (dashboard)/
│   ├── layout.tsx       → sidebar layout (no URL impact)
│   └── settings/page.tsx → /settings
└── (auth)/
    ├── login/page.tsx   → /login
    └── layout.tsx       → centered layout
```

## Layouts

- `layout.tsx` persists across child route changes (no unmount)
- Wrap adjacent routes that need the same shell in a route group
- Use `root.layout.tsx` for app-wide shell (nav, footer)
- Layouts can fetch data — they won't re-render on navigation

## Loading & Error Boundaries

Every route segment can have:
- `loading.tsx` — shown during page load (wraps in Suspense)
- `error.tsx` — shown on error (wraps in ErrorBoundary, must be a Client Component)
- `not-found.tsx` — shown for `notFound()` calls or unmatched routes

```tsx
// loading.tsx
export default function Loading() {
  return <div className="flex items-center justify-center p-8"><Spinner /></div>
}

// error.tsx (MUST be Client Component)
"use client"
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return <ErrorFallback error={error} onRetry={reset} />
}
```

## Server vs Client Components

- **Server Components by default** — components don't need `"use client"` unless they use:
  - Hooks (`useState`, `useEffect`, etc.)
  - Browser APIs
  - Event handlers
  - Custom hooks
- Keep `"use client"` at the leaf level, not the layout level
- Colocate data fetching in Server Components

## Parallel Routes

Use slots to render multiple independent sections on the same route:

```
app/@sidebar/page.tsx
app/@feed/page.tsx
app/layout.tsx  → renders @sidebar + @feed side by side
```

## Metadata

```tsx
// Static metadata
export const metadata = { title: "Page Title", description: "..." }

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetch(...)
  return { title: data.title }
}
```

## Route Handlers

Use `route.ts` for API endpoints:
```tsx
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "hello" })
}
```
