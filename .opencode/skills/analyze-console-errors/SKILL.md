---
name: analyze-console-errors
description: "Use for analyzing console errors, debugging runtime errors, reading stack traces, JavaScript errors, uncaught exceptions, React error boundaries, error diagnostics."
---

# Analyze Console Errors

Diagnose and fix runtime console errors.

## Approach

### 1. Read the Full Error

- Expand the full error in console (click the arrow)
- Copy the stack trace — the top of the stack is the source
- Note the error type: `TypeError`, `ReferenceError`, `SyntaxError`, `React Error`, etc.

### 2. Match to Source Code

For production builds, source maps may not be available. In development:
- The stack trace contains file paths and line numbers
- Use those to navigate to the exact location

### 3. Common Error Categories

| Error Pattern | Likely Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading '...')` | Null/undefined value when accessing nested property | Add optional chaining (`?.`) or default value |
| `... is not a function` | Wrong type passed as callback | Check the expected function signature |
| `Objects are not valid as a React child` | Rendering an object instead of a string/component | Check what's being rendered in JSX |
| `Each child in a list should have a unique "key" prop` | Missing or duplicate keys in `.map()` | Add unique `key` prop |
| `Maximum update depth exceeded` | Infinite loop in `useEffect` or `useState` in render | Check effect dependencies, don't set state during render |
| `Hydration failed because the initial UI...` | Server/client HTML mismatch | See fix-hydration-mismatch skill |
| `Failed to load resource: the server responded with...` | API/asset fetch error | Check URL, method, headers, server status |
| `Uncaught (in promise)` | Unhandled promise rejection | Add `.catch()` or try/catch |

### 4. Network Errors

- Check the Network tab for failed requests
- Verify API endpoints exist and are reachable
- Check request/response payloads

### 5. React DevTools

- Use Components tab to inspect props and state
- Use Profiler to find render performance issues

## Steps

1. Identify the error message and type
2. Locate the source file and line from the stack trace
3. Read the surrounding code context
4. Determine the root cause (not just the symptom)
5. Apply the fix
6. Verify the error no longer appears
