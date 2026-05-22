---
name: responsive-design-audit
description: "Use for responsive design audit, responsive fixes, mobile layout issues, breakpoint adjustments, responsive testing, viewport bugs, mobile responsiveness."
---

# Responsive Design Audit

Audit and fix responsive design issues.

## Checklist

### Breakpoints
This project uses Tailwind's default breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

### Common Issues to Check

1. **Overflow** — Check for horizontal scrollbars:
   - `overflow-hidden` on containers
   - `max-w-full` on wide elements
   - `truncate` or `break-words` on text

2. **Flex/Grid wrapping** — Ensure wraps correctly on small screens:
   - `flex-wrap` on flex containers
   - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for grids

3. **Touch targets** — Minimum 44x44px on mobile

4. **Text sizing** — Use `text-sm` on mobile, scale up with breakpoints:
   - `text-base sm:text-lg lg:text-xl`

5. **Images** — Ensure `next/image` has `sizes` attribute for responsive loading

6. **Horizontal overflow in tables** — Use `overflow-x-auto` wrapper

7. **Navigation** — Hamburger menu on mobile, full nav on desktop

## Steps

1. Open the page at 320px, 375px, 768px, 1024px, 1440px widths
2. Identify elements that break layout
3. Apply Tailwind responsive prefixes
4. Verify no horizontal scrollbar exists
5. Test interactive elements at mobile sizes
