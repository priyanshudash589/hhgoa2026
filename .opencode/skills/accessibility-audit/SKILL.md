---
name: accessibility-audit
description: "Use for accessibility audit, a11y, WCAG compliance, screen reader issues, keyboard navigation, ARIA labels, focus management, color contrast checks."
---

# Accessibility Audit

Audit and fix accessibility issues.

## Checklist

### Semantic HTML
- Use semantic elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`
- Use heading levels (`h1`-`h6`) in correct order without skipping
- Use `<button>` for actions, `<a>` for navigation — not `<div>` with onClick

### ARIA
- `aria-label` on icon-only buttons and interactive controls
- `aria-expanded` on toggle buttons
- `aria-current="page"` on active nav links
- `role="status"` for live regions, `role="alert"` for errors
- `aria-describedby` for form field descriptions

### Focus Management
- All interactive elements must be keyboard-focusable
- Visible focus indicators (Tailwind: `focus-visible:ring-2 focus-visible:ring-ring`)
- Trap focus in modals/sheets (shadcn Dialog handles this)
- Skip-to-content link for pages with nav

### Color & Contrast
- Text must have 4.5:1 contrast ratio (3:1 for large text)
- Don't rely solely on color to convey information
- Use Tailwind's `ring` utilities for focus states

### Forms
- Every `<input>` needs an associated `<label>` or `aria-label`
- Error messages linked via `aria-describedby`
- Required fields marked with `required` attribute and `aria-required="true"`

### Images
- Meaningful images need `alt` text
- Decorative images need `alt=""` (empty)
- SVG icons in buttons need `aria-hidden="true"` + visible label

## Steps

1. Run a quick scan with axe DevTools or WAVE browser extension
2. Test keyboard navigation (Tab through the entire page)
3. Check focus indicators are visible
4. Verify screen reader announcements
5. Check color contrast ratios
6. Fix issues by adding ARIA attributes and semantic HTML
