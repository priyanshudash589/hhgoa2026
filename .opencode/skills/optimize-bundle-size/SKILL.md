---
name: optimize-bundle-size
description: "Use for bundle size optimization, reducing JS bundle, webpack bundle analysis, dynamic imports, code splitting, tree shaking, reducing CSS/JS payload."
---

# Optimize Bundle Size

Reduce JavaScript and CSS bundle size.

## Diagnose

### Use Bundle Analyzer

Install and run `@next/bundle-analyzer`:

```bash
npm install -D @next/bundle-analyzer
```

Add to `next.config.ts`:

```ts
import withBundleAnalyzer from "@next/bundle-analyzer"

const config = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })({
  // existing config
})

export default config
```

Then run:
```bash
ANALYZE=true npm run build
```

### Check Output Size

```bash
npm run build
ls -lh .next/static/chunks/  # see chunk sizes
```

## Optimization Techniques

### 1. Dynamic Imports

Use `next/dynamic` for heavy components not needed on initial load:

```tsx
import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("@/components/heavy-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // if chart uses browser APIs
})
```

### 2. Lazy Load Below-the-Fold Content

Use React.lazy within Client Components for heavy sections:

```tsx
const LazySection = lazy(() => import("./heavy-section"))
```

### 3. Tree Shaking

- Use named imports from libraries that support tree-shaking (`lucide-react` does)
- Avoid `import * from "lodash"` — import specific functions
- Check that imports resolve to ES module builds

### 4. Optimize Images

- Use `next/image` with `sizes` attribute
- Serve WebP/AVIF formats
- Set explicit `width` and `height`
- Lazy load below-the-fold images (`loading="lazy"`)

### 5. Font Optimization

This project uses `next/font/google`. Verify:
- Font subsets are limited to `latin`
- Only used weights are loaded
- Font display is `swap` (default with next/font)

### 6. Remove Dead Code

```bash
npx knip  # find unused files and exports
```

### 7. CSS Optimization

Tailwind v4 automatically purges unused classes. Check:
- No large CSS libraries imported
- No `@import` of full framework CSS
- Custom CSS doesn't duplicate Tailwind utilities

## Monitoring

- Set budgets in `next.config.ts`:
```ts
experimental: {
  // Next.js 16 bundle budgets
}
```
- Compare before/after with bundle analyzer
- Track JS bytes per route
