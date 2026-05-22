---
name: extract-hooks
description: "REUSABLE WORKFLOW: Use for extracting custom React hooks, hook extraction, logic reuse, custom hooks, extracting state logic, creating use* functions."
---

# Extract Hooks

Extract component logic into reusable custom hooks.

## When to Extract

Extract when:
- Same state + effect logic appears in multiple components
- A component has complex state logic that obscures the UI
- Business logic needs to be tested independently
- You need to share data-fetching logic across components

## Extraction Steps

### 1. Identify the Logic

```tsx
// Before: logic mixed with UI
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Skeleton />
  if (error) return <ErrorFallback error={error} />
  return <div>{user?.name}</div>
}
```

### 2. Extract to a Hook

```tsx
// hooks/use-user.ts
import { useState, useEffect } from "react"

interface UseUserResult {
  user: User | null
  loading: boolean
  error: Error | null
}

export function useUser(userId: string): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}
```

### 3. Use the Hook

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId)

  if (loading) return <Skeleton />
  if (error) return <ErrorFallback error={error} />
  return <div>{user?.name}</div>
}
```

## Rules

- Name hooks with `use` prefix
- Return a typed object, not a tuple (for named access + stability)
- Accept dependencies as parameters
- Handle cleanup in `useEffect` return functions
- Place hooks in `hooks/` directory
- Use generics where appropriate
- Avoid `useMemo`/`useCallback` inside hooks unless profiling shows a need
