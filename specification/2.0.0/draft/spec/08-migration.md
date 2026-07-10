# FlowMCP Specification v2.0.0 — Migration Guide

This guide covers migrating schemas from v1.2.0 to v2.0.0 format. The FlowMCP core v2.0.0 supports **both formats** during a transition period. Legacy v1.2.0 format will be deprecated in v3.0.0.

---

## Schema Categories

Existing schemas fall into three categories:

| Category | % of Schemas | Migration Effort | Description |
|----------|-------------|-----------------|-------------|
| **Pure declarative** | ~60% | Automatic | No handlers, no imports. Only URL construction and parameters. |
| **With handlers** | ~30% | Semi-automatic | Has `preRequest`/`postRequest` handlers but no imports. |
| **With imports** | ~10% | Manual review | Imports shared data (chain lists, etc.) that must become shared list references. |

---

## Migration Steps

### Step 1: Wrap Existing Fields in `main` Block

**Before (v1.2.0):**

```javascript
export const schema = {
    namespace: 'etherscan',
    name: 'SmartContractExplorer',
    flowMCP: '1.2.0',
    root: 'https://api.etherscan.io/v2/api',
    requiredServerParams: [ 'ETHERSCAN_API_KEY' ],
    routes: { /* ... */ },
    handlers: { /* ... */ }
}
```

**After (v2.0.0):**

```javascript
// Static, hashable — no imports
export const main = {
    namespace: 'etherscan',
    name: 'SmartContractExplorer',
    version: '2.0.0',
    root: 'https://api.etherscan.io/v2/api',
    requiredServerParams: [ 'ETHERSCAN_API_KEY' ],
    requiredLibraries: [],
    routes: { /* ... */ }
}

// Factory function — receives injected dependencies
export const handlers = ( { sharedLists, libraries } ) => ({
    /* ... */
})
```

Key changes:

- Two separate named exports: `main` (static) and `handlers` (factory function)
- `flowMCP: '1.2.0'` becomes `version: '2.0.0'` inside `main`
- `handlers` is now a factory function receiving `{ sharedLists, libraries }`
- New field `requiredLibraries` declares needed npm packages
- Zero import statements — all dependencies are injected

---

### Step 2: Update Version Field

| Before | After |
|--------|-------|
| `flowMCP: '1.2.0'` | `version: '2.0.0'` |

The `version` field moves inside `main` and follows semver starting with `2.`.

---

### Step 3: Convert Imports to Shared List References

**Before (v1.2.0):**

```javascript
import { evmChains } from '../_shared/evm-chains.mjs'

export const schema = {
    namespace: 'etherscan',
    // ...
    handlers: {
        getContractAbi: {
            preRequest: async ( { struct, payload } ) => {
                const chain = evmChains
                    .find( ( c ) => c.alias === payload.chainName )
                // ...
            }
        }
    }
}
```

**After (v2.0.0):**

```javascript
export const main = {
    namespace: 'etherscan',
    // ...
    sharedLists: [
        { ref: 'evmChains', version: '1.0.0' }
    ],
    routes: { /* ... */ }
}

export const handlers = ( { sharedLists, libraries } ) => ({
    getContractAbi: {
        preRequest: async ( { struct, payload } ) => {
            const chain = sharedLists.evmChains
                .find( ( c ) => c.alias === payload.chainName )
            // ...
            return { struct, payload }
        }
    }
})
```

Key changes:

- Remove `import` statement entirely (zero imports policy)
- Add `sharedLists` reference in `main`
- Access list via `sharedLists.evmChains` (injected by factory function)
- The list data is the same — only the access mechanism changes

---

### Step 4: Add Output Schemas (Optional but Recommended)

New in v2.0.0 — add `output` to routes for predictable responses:

```javascript
routes: {
    getContractAbi: {
        // ... existing fields ...
        output: {
            mimeType: 'application/json',
            schema: {
                type: 'object',
                properties: {
                    abi: {
                        type: 'string',
                        description: 'Contract ABI as JSON string'
                    }
                }
            }
        }
    }
}
```

This step is optional in v2.0.0 but will become recommended in v2.1.0.

---

### Step 5: Run Security Scan

After migration, run the security scan:

```bash
flowmcp validate --security <schema-path>
```

This verifies:

- No forbidden patterns in the file
- `main` block is JSON-serializable
- Handler constraints are met
- Shared list references are valid

---

### Step 6: Run Validation

```bash
flowmcp validate <schema-path>
```

Full validation checks:

- Required fields present
- Namespace format valid
- Version format valid
- Route count within limits (max 8)
- Parameter definitions complete
- Output schema valid (if present)
- Async fields valid (if present)

---

## Automatic Migration Tool

A CLI command assists with migration:

```bash
flowmcp migrate <schema-path>
```

The tool:

1. Reads the v1.2.0 schema
2. Wraps fields in `main` block
3. Updates version field
4. Detects imports and suggests shared list conversions
5. Writes the v2.0.0 schema to a new file (`<name>.v2.mjs`)
6. Runs validation on the new file

**Important**: The migration tool does NOT auto-convert imports. It flags them and creates TODO comments:

```javascript
// TODO: Convert import to shared list reference
// Original: import { evmChains } from '../_shared/evm-chains.mjs'
// Suggested: main.sharedLists: [{ ref: 'evmChains', version: '1.0.0' }]
```

---

## Backward Compatibility

| Feature | v1.2.0 Schema | v2.0.0 Schema |
|---------|--------------|--------------|
| Core v1.x runtime | Supported | Not supported |
| Core v2.0 runtime | Supported (legacy mode) | Supported |
| Core v3.0 runtime (future) | Deprecated | Supported |

**Legacy mode** in Core v2.0:

- Detects v1.2.0 format (no `main` wrapper, has `flowMCP` field)
- Internally wraps in `main` block at load-time
- Emits deprecation warning: `WARN: Schema uses v1.2.0 format. Run "flowmcp migrate <path>" to upgrade.`
- All features work except: shared list references, output schema, groups, async

---

## Common Migration Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `SEC001: Forbidden pattern "import"` | Import statement still present | Convert to `sharedLists` reference |
| `VAL003: "flowMCP" is not a valid field` | Old version field | Change to `version` inside `main` |
| `VAL007: Route count exceeds 8` | v1.2.0 allowed 10 routes | Split schema into two files |
| `VAL012: Handler references undefined route` | Route name mismatch after refactor | Align handler keys with route keys |

---

## Migration Checklist

Per schema:

- [ ] Fields wrapped in `main` block
- [ ] `flowMCP: '1.2.0'` changed to `version: '2.0.0'` inside `main`
- [ ] `handlers` at top level (sibling of `main`)
- [ ] All `import` statements removed
- [ ] Imported data converted to `sharedLists` references
- [ ] Handler code uses `sharedLists` via factory injection instead of imported variables
- [ ] Security scan passes
- [ ] Full validation passes
- [ ] All routes still functional (manual or automated test)
