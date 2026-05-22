---
name: convert-jsx-to-components
description: "REUSABLE WORKFLOW: Use for refactoring JSX into reusable components, extracting JSX, component extraction, breaking down large files, DRY refactoring, component decomposition."
---

# Convert JSX → Reusable Components

Extract repeated JSX patterns into reusable components.

## When to Extract

Extract when you see:
- Same JSX structure repeated 2+ times with different props
- A section of JSX that represents a self-contained UI concept
- A block longer than ~30 lines that does one thing
- JSX that would benefit from its own loading/error boundary

## Extraction Steps

### 1. Identify the Pattern

```tsx
// Before: repeated JSX
{items.map(item => (
  <div className="flex items-center gap-3 rounded-lg border p-4">
    <item.icon className="size-5 text-muted-foreground" />
    <div>
      <p className="font-medium">{item.title}</p>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </div>
  </div>
))}
```

### 2. Create the Component

Create a new file in `components/` matching the project conventions:

```tsx
// components/info-card.tsx
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface InfoCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function InfoCard({ icon: Icon, title, description, className }: InfoCardProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4", className)}>
      <Icon className="size-5 text-muted-foreground" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
```

### 3. Use the Component

```tsx
// After
{items.map(item => (
  <InfoCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
))}
```

## Rules

- Props should be explicitly typed (never `any`)
- Forward refs when the component wraps a DOM element
- Accept and merge `className` via `cn()`
- Use `displayName` for better debugging
- Keep components in their own files, one per file
- Use `@/` path aliases for imports
