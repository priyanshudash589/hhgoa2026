---
name: shadcn-component-generation
description: "Use for shadcn component generation, shadcn/ui components, adding shadcn components, creating UI components, using shadcn CLI. Generates components matching the project's shadcn/ui patterns."
---

# ShadCN Component Generation

Generate UI components consistent with the project's shadcn/ui setup.

## Adding New shadcn Components

Use the shadcn CLI:

```bash
npx shadcn add button card dialog table tabs sheet dropdown-menu badge progress separator skeleton input label textarea select checkbox radio-group switch tooltip popover command
```

## Project Conventions

- Components are in `components/`
- Uses `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- Components accept `className` prop to allow customization
- Components use `React.forwardRef` where DOM ref access is needed
- Variant props use cva (class-variance-authority) — already set up by shadcn
- Icons from `lucide-react`
- Animations via framer-motion (not CSS transitions)

## Creating a Custom Component Pattern

```tsx
import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

const customVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "default-classes",
      secondary: "secondary-classes",
    },
    size: {
      default: "size-default",
      sm: "size-sm",
      lg: "size-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

interface CustomProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customVariants> {
  // custom props
}

function Custom({ className, variant, size, ...props }: CustomProps) {
  return (
    <div className={cn(customVariants({ variant, size }), className)} {...props} />
  )
}
```

## Steps

1. Use `npx shadcn add` for standard components
2. Follow `components.json` configuration
3. Copy existing component patterns for custom components
4. Always accept and merge `className` via `cn()`
5. Export component and type from `components/` index
