---
name: find-unused-files
description: "Use for finding unused files, dead code elimination, cleanup unused exports, orphaned components, unused imports, dead CSS classes, unused assets."
---

# Find Unused Files

Detect and clean up unused code.

## Methods

### 1. Use TypeScript — `noUnusedLocals`

This project has `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json`. Run:

```bash
npm run build
```

Any unused local variables or parameters will show as errors.

### 2. Check for Unused Exports

Search for exported functions/components that aren't imported anywhere:

```bash
# Find all exports
rg "^export (function|const|class|interface|type)" --type ts --type tsx

# Check if a specific export is imported somewhere
rg "import.*from.*'@/lib/something'"
```

### 3. Find Unused Assets

Check `public/` assets against references in code:

```bash
# List all assets in public/
ls public/assets/

# Check which are referenced in code
for f in public/assets/*; do
  name=$(basename "$f")
  if ! rg -q "$name" app/ components/ lib/ --type ts --type tsx; then
    echo "Possibly unused: $f"
  fi
done
```

### 4. Check Unused CSS

Tailwind v4 purges unused classes automatically. But custom CSS in `globals.css` or `.css` files might accumulate. Search for custom class names defined but never used in JSX.

### 5. Check for Orphaned Route Files

```bash
# List all page.tsx and layout.tsx files
find app -name "page.tsx" -o -name "layout.tsx"

# Verify each corresponds to an intended route
```

## Cleanup Process

1. Confirm the file/export is truly unused (check git log — it might be WIP)
2. Remove the file or export
3. Remove any imports referencing it
4. Run `npm run build` to verify no breakage
5. Commit deletions separately for clean history

## Tools

- `npx ts-prune` — find unused exports (install: `npm install -D ts-prune`)
- `npx knip` — comprehensive dead file detection (install: `npm install -D knip`)
