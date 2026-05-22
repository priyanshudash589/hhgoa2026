---
name: fix-typescript-issues
description: "Use for fixing TypeScript errors, TypeScript type issues, tsc compilation errors, type errors, strict mode fixes, tsconfig issues, type safety fixes."
---

# Fix TypeScript Issues

Resolve TypeScript compiler errors following the project's strict configuration.

## This Project Uses TypeScript Strict Mode

Check `tsconfig.json` for exact settings. Common strict checks:
- `strict: true` (enables all strict checks)
- `noUncheckedIndexedAccess`: must check for `undefined` on indexed access
- `exactOptionalPropertyTypes`: optional properties can be `undefined`
- `noUnusedLocals` / `noUnusedParameters`: no dead code

## Common Error Patterns

### 1. `'X' is possibly 'undefined'`

```tsx
// ❌ Error
user.name

// ✅ Fix: optional chaining
user?.name

// Or: early return / guard
if (!user) return null
user.name

// Or: default value
user.name ?? "Unknown"
```

### 2. `Type 'X' is not assignable to type 'Y'`

- Check if the types are compatible
- Use a type guard or type assertion (sparingly)
- Add a discriminant
- Use `satisfies` instead of `as` for validation:

```tsx
const theme = {
  primary: "#000",
  secondary: "#fff",
} satisfies Record<string, string>
```

### 3. `'X' is declared but its value is never read`

Remove unused declarations. If it's an intentional export, check import sites.

### 4. Generic constraints

```tsx
// ✅ Use constraints to narrow
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

### 5. Union type narrowing

```tsx
// Use discriminated unions
type Result<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

function handle(result: Result<string>) {
  if (result.status === "success") {
    result.data // string
  }
}
```

## Steps

1. Run `npm run build` to see all TypeScript errors
2. Fix errors from top to bottom (early errors can cascade)
3. Prefer type-safe solutions over `as any` or `@ts-ignore`
4. Use `// @ts-expect-error` only with a comment explaining why
5. Rerun to verify fixes

## Never

- Use `any` unless absolutely necessary (and add a comment)
- Use `@ts-ignore` — use `@ts-expect-error` with a reason instead
- Suppress errors without understanding the root cause
