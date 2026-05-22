---
name: improve-lighthouse-score
description: "Use for improving Lighthouse score, Core Web Vitals, LCP optimization, CLS fixes, INP optimization, performance audits, Lighthouse audits, Google PageSpeed."
---

# Improve Lighthouse Score

Fix Lighthouse audit issues and improve Core Web Vitals.

## Core Web Vitals

### LCP (Largest Contentful Paint) — Target: < 2.5s

Common causes and fixes:

| Cause | Fix |
|---|---|
| Slow hero image loading | Use `next/image` with `priority` on above-fold images, serve WebP, use `sizes` attribute |
| Render-blocking resources | Defer non-critical CSS/JS, inline critical CSS |
| Slow server response | Use incremental static generation (ISR) or static generation |
| Client-side rendering | Move to Server Components, use streaming with `loading.tsx` |

```tsx
// ✅ Prioritize LCP image
import Image from "next/image"

export default function Hero() {
  return (
    <Image
      src="/hero.webp"
      alt="Hero"
      width={1200}
      height={600}
      priority  // <-- critical for LCP
      sizes="100vw"
    />
  )
}
```

### CLS (Cumulative Layout Shift) — Target: < 0.1

| Cause | Fix |
|---|---|
| Images without dimensions | Always set `width` and `height` on `next/image` |
| Dynamic content injected above existing content | Reserve space with min-height or skeleton |
| Web fonts causing layout shift | Use `next/font` with `display: "swap"` and `size-adjust` |
| Ads or embeds without dimensions | Wrap in container with fixed dimensions |
| Late-loading third-party widgets | Reserve space with placeholder dimensions |

### INP (Interaction to Next Paint) — Target: < 200ms

| Cause | Fix |
|---|---|
| Long tasks (>50ms) on main thread | Break up with `setTimeout` or `scheduler.yield()` |
| Heavy event handlers | Debounce scroll/resize, throttle input handlers |
| Large component re-renders | Use `React.memo`, `useMemo`, virtualization for lists |
| Third-party scripts | Load with `strategy="lazyOnload"` or defer |

## Lighthouse Audits

### Performance
- **Enable text compression**: Ensure server sends `Content-Encoding: gzip` or `br`
- **Serve images in next-gen formats**: WebP/AVIF via `next/image`
- **Remove unused JavaScript**: Use dynamic imports
- **Minimize main-thread work**: Break up long tasks, optimize JS

### Accessibility
- See accessibility-audit skill
- Common fixes: add `lang` attribute, `alt` text, ARIA labels, correct heading hierarchy

### SEO
- Add `metadata` export to every page
- Use descriptive `title` and `description`
- Add `viewport` meta tag (Next.js includes it by default)
- Add Open Graph tags for social sharing

### Best Practices
- Use HTTPS
- Avoid `console.log` in production
- Set proper `Content-Security-Policy` headers
- Use `next/script` with appropriate `strategy`

## Steps

1. Run Lighthouse in Chrome DevTools (Incognito to avoid extension interference)
2. Note scores for Performance, Accessibility, SEO, Best Practices
3. Focus on Performance first (Core Web Vitals)
4. Fix the highest-impact items first (red → orange → yellow)
5. Re-test after each fix
6. Aim for 90+ in all categories
