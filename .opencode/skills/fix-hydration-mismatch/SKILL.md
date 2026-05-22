---
name: fix-hydration-mismatch
description: "REUSABLE WORKFLOW: Use for React hydration mismatch, hydration errors, server-client mismatch, text content mismatch, hydration warnings, Next.js hydration fixes."
---

# Fix Hydration Mismatches

Fix React hydration errors in Next.js.

## Common Causes

### 1. Browser-Only APIs

```tsx
// ❌ Causes mismatch: window/document not available on server
const width = window.innerWidth

// ✅ Fix: access in useEffect or conditional
const [width, setWidth] = useState(0)
useEffect(() => { setWidth(window.innerWidth) }, [])
```

### 2. `useEffect` Cleanup vs Server Render

Ensure server output matches client's initial render. The first render on client must exactly match server HTML.

### 3. Timestamps / Random Values

```tsx
// ❌ Different on each render
<div>{Date.now()}</div>
<div>{Math.random()}</div>

// ✅ Fix: generate on client only
const [time] = useState(() => Date.now())
```

### 4. Browser Extensions Injecting DOM

If the error mentions `<style>` or extra attributes, a browser extension is the cause. Add `suppressHydrationWarning` as last resort:

```tsx
<html suppressHydrationWarning>
```

### 5. Third-Party Scripts

Scripts that modify the DOM before hydration can cause mismatches. Defer them with `strategy="afterInteractive"` or `strategy="lazyOnload"` in `next/script`.

### 6. CSS-in-JS Without Extraction

If using CSS-in-JS libraries, ensure they extract styles at build time. With Tailwind v4 (this project), styling is static — this shouldn't be an issue.

## Debugging Steps

1. Read the full error in console — it shows the exact HTML diff
2. Check which HTML element and attribute/text differs
3. Identify if the difference comes from a browser API, random value, or injected content
4. Apply the appropriate fix from above
5. If unsure, add `suppressHydrationWarning` to the mismatched element temporarily to find the root cause

## Preventative Patterns

- Wrap browser-only code in `useEffect` or custom `useIsClient` hook
- Use `typeof window === "undefined"` for conditional code
- Initialize state with a server-safe default
