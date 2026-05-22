---
name: optimize-renders
description: "REUSABLE WORKFLOW: Use for React render optimization, preventing re-renders, useMemo, useCallback, React.memo, performance profiling, unnecessary re-renders."
---

# Optimize Renders

Diagnose and fix unnecessary React re-renders.

## Diagnosing Re-Renders

1. Use React DevTools Profiler to record interactions
2. Look for components that re-render without prop changes
3. Add `console.log('render:', componentName)` temporarily if DevTools isn't available

## Fixes

### 1. `React.memo` — Expensive Pure Components

Wrap components that receive the same props but re-render due to parent re-renders:

```tsx
import { memo } from "react"

export const ExpensiveList = memo(function ExpensiveList({ items }: { items: Item[] }) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />)
})
```

### 2. `useMemo` — Expensive Computations

```tsx
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

### 3. `useCallback` — Stable Callback References

```tsx
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, []) // stable reference, no dependencies
```

### 4. Move State Down

```tsx
// ❌ Bad: entire tree re-renders on input change
function Page() {
  const [search, setSearch] = useState("")
  return (
    <div>
      <SearchInput value={search} onChange={setSearch} />
      <ExpensiveList />
    </div>
  )
}

// ✅ Good: only SearchInput re-renders
function Page() {
  return (
    <div>
      <SearchInput />
      <ExpensiveList />
    </div>
  )
}
```

### 5. Lift Content Up

Pass JSX as `children` instead of letting parent re-renders propagate:

```tsx
// ✅ Stable children don't re-render when parent state changes
function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div>
      <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />
      {children}
    </div>
  )
}
```

## Anti-Patterns to Avoid

- Inline object/array props in JSX (`style={{}}`, `items={[1,2,3]}`)
- `useMemo`/`useCallback` on cheap operations
- New component definitions inside render (creates new type each render)
- Spreading props unnecessarily
