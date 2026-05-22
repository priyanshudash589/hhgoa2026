---
name: tailwind-optimization
description: "Use for Tailwind optimization, CSS cleanup, utility deduplication, Tailwind v4 migrations, Tailwind refactoring, extracting repeated patterns."
---

# Tailwind Optimization

Optimize Tailwind CSS usage for maintainability and performance.

## This project uses Tailwind CSS v4

Key differences from v3:
- No `@tailwind base/components/utilities` directives — use `@import "tailwindcss"`
- `@apply` still works but prefer inline utilities
- CSS-only dark mode via `@media (prefers-color-scheme: dark)` or class-based with `@variant dark {}`
- New `@theme` directive in CSS for design tokens

## Optimization Techniques

### 1. Deduplicate Repeated Utility Patterns

When the same 5+ utility classes repeat across elements, extract to a reusable component or use `cn()`:

```tsx
// Instead of repeating:
<div className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">

// Create a component:
function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      {children}
    </div>
  )
}
```

### 2. Use Tailwind v4 `@theme` for Custom Tokens

In `app/globals.css`, the project's custom theme is already defined. Add new tokens there rather than using arbitrary values.

### 3. Remove Unused Classes

Run `npx tailwindcss --help` to check for v4 analysis tools. Manually grep for unused custom class names.

### 4. Avoid `@apply` for Single Properties

```css
/* ❌ Bad */
.btn { @apply flex; }

/* ✅ Good — just write flex in the template */
```

Use `@apply` only for 3+ properties that always appear together.

### 5. Prefer Tailwind's Built-in Utilities

- Use `gap-*` instead of `space-x-*` / `space-y-*`
- Use `inset-0` instead of `top-0 right-0 bottom-0 left-0`
- Use `size-*` (v4) instead of `w-* h-*` for equal dimensions

## Steps

1. Scan components for repeated utility class patterns
2. Extract duplicates into named components or `cn()` helpers
3. Replace arbitrary values with theme tokens
4. Remove unused custom CSS
5. Verify no visual changes
