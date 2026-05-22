---
name: saas-dashboard-generation
description: "Use for SaaS dashboard generation, admin panels, dashboard UI, data tables, charts, statistics pages. Generates dashboard layouts matching shadcn/ui conventions."
---

# SaaS Dashboard Generation

Generate dashboard UIs consistent with shadcn/ui dashboard patterns.

## Conventions

- **shadcn/ui** components: `Card`, `DataTable`, `Dialog`, `Sheet`, `Tabs`, `DropdownMenu`, `Badge`, `Progress`
- **lucide-react** for all icons
- **Tailwind CSS v4** for styling
- **`cn()`** from `lib/utils.ts`

## Dashboard Layout Pattern

```
app/dashboard/
├── layout.tsx       # Sidebar + top nav shell (client component)
├── page.tsx         # Overview / stats
├── analytics/
├── settings/
└── users/
```

- Use `<Sheet>` or a fixed sidebar for navigation
- Use `next/dynamic` for heavy chart components
- Make dashboard layout a Client Component only if it needs state (sidebar toggle, etc.)

## Steps

1. Create `app/dashboard/layout.tsx` with sidebar layout
2. Add route groups if needed: `app/(dashboard)/` with separate marketing routes outside
3. Use `Card` for stat cards, `DataTable` for lists, `Tabs` for segmented views
4. Use `Suspense` boundaries around async data-fetching sections
5. Add `loading.tsx` and `error.tsx` for each dashboard segment
6. Follow shadcn CLI: prefer `npx shadcn add [component]` to add new UI components
