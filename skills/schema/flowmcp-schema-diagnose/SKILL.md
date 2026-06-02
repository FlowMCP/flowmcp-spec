---
name: flowmcp-schema-diagnose
description: >
  AI-enhanced diagnosis for FlowMCP v4 schemas. Extends the deterministic gate
  (flowmcp validate / flowmcp dev test single) with non-deterministic checks:
  complex Fake-Success detection, enum readability, description quality. The
  detector role in the diagnose → fix → inspect loop. Runs as its own sub-agent.
  Must be loaded when validating a schema beyond the structural gate.
---

# FlowMCP Schema Diagnose

AI-enhanced diagnosis for FlowMCP v4 schemas. Extends the deterministic gate
(`flowmcp validate` / `flowmcp dev test single`) with non-deterministic checks:
Fake Success detection (complex), enum readability, description quality
assessment. The **detector** role in the diagnose → fix → inspect loop. Runs as
its own sub-agent.

## Trigger

- "schema diagnose"
- "diagnose schema"
- "/flowmcp-schema-diagnose"

---

## Instructions

You are a schema quality diagnostician. Your job is to enhance the deterministic validation results with AI-powered checks that require contextual understanding.

This is the **detector** role in the Generate→Execute→Evaluate / anti-cheat triplet (diagnose → fix → inspect). You do NOT fix anything — you only diagnose.

### Canonical v4 form you reason about

Schemas are in the canonical v4 form (see `flowmcp-schema-create` for the full definition):

- `export const main` (static, JSON-serializable) + optional `export const handlers = ( { sharedLists, libraries } ) => ({…})` (factory, **no direct imports**).
- `main` required fields: `namespace` (`/^[a-z][a-z0-9-]*$/`), `name`, `description`, `version` (`4.X.Y`), `schemaVersion` (`x.y.z`, v4.1.1+), `schemaHash` (8-char sha256 prefix, auto-generated, v4.1.1+), `root`, `tools`, `meta` (mandatory v4.2.0).
- Parameters are an **array** `[ { position: { key, value, location }, z: { primitive, options } } ]`.
- Per-tool `output: { mimeType, schema }` — canonical for production.

### Prerequisites

A v4 validation/test result must already exist. Run the v4 gate first and use its output as the diagnosis input:

```bash
flowmcp validate schemas/v4.0.0/providers/<namespace>/<file>.mjs
flowmcp dev test single schemas/v4.0.0/providers/<namespace>/<file>.mjs
```

If a deterministic diagnosis artifact (`_diagnosis-{schemaFile}.json`) is consumed, state the v4 source explicitly — no silent fallback to a legacy `npm run test:diagnose` pipeline.

### Input

You receive either:
- A schema path: `schemas/v4.0.0/providers/<namespace>/<file>.mjs`
- Or a namespace: `brightsky`

From this, locate:
1. The validation/test output (or `_diagnosis-{schemaFile}.json` if persisted) for the namespace
2. The schema file itself
3. The captured responses for the tools

### Step 1: Read Existing Diagnosis

Read the deterministic validation/test result. Note all existing codes — you will NOT overwrite or remove any deterministic codes.

### Step 2: Complex Fake Success Detection (RES-001)

The deterministic gate catches simple cases (`"error"` in body). You catch complex cases:

```
For each response with success: true, read the data field:
- API returns {"code":"40001","msg":"invalid token"} → RES-001 (code != success code)
- API returns {"data":null,"error_code":123} → RES-001 (error_code present)
- API returns {"result":"fail","reason":"..."} → RES-001 (result != success)
- API returns {"status":"ok","data":[]} → NOT fake success (empty is valid)
- API returns {"code":"00000","msg":"success","data":...} → NOT fake success
```

**Be conservative. Only flag if you are confident the response indicates an error.** False positives are worse than false negatives.

### Step 3: Enum Readability (INP-005)

Enum values now live in the parameter `z.primitive` as `enum(A,B,C)` (array parameter form):

```
For each parameter whose z.primitive is enum(...):
- Enum values are codes like "1", "2", "3" → INP-005 INFO
- Enum values are abbreviations like "BER", "MUC" → INP-005 INFO
- Enum values are readable like "ethereum", "polygon" → OK, no code
- Enum values are mixed → evaluate case by case
```

### Step 4: Description Quality

```
For each parameter that HAS a description (missing descriptions are caught deterministically):
- Description just repeats the key: "lat" → "lat" → flag as low quality
- Description is too generic: "the parameter", "a value", "input" → flag
- Description is helpful: "Latitude in decimal degrees (e.g. 52.52)" → OK
```

Do NOT add new error codes for this. Annotate the existing code with a `"quality"` field: `low` / `acceptable` / `good`.

### Step 5: Update Diagnosis

Add your new codes to the existing `codes` array. Mark all AI codes with `"source": "ai"` (deterministic ones have `"source": "deterministic"`).

Recalculate grade:
- 0 Errors = A (if also 0 Warnings) or B (if Warnings)
- >0 Errors = C

### Step 6: Report

```
Schema: {file}
Grade: {grade} (was {previous grade})
Added {n} AI codes: {list}
Total: {errorCount}E / {warningCount}W / {infoCount}I
```

### Error Codes (Memo 016)

| Code | Severity | Description | Trigger |
|------|----------|-------------|---------|
| LIB-001 | ERROR | Required library declared but not loadable | requiredLibraries present, library not in allowlist or not installed |
| LST-001 | ERROR | Shared list referenced but file not found | sharedLists declared, listsDir missing or file not present |
| HDL-001 | ERROR | Handler factory returns undefined | factory is called but yields no handler for the tool |
| RES-010 | INFO | Schema uses resources instead of tools | 0 tools but resources present — no HTTP test possible |
| SKL-001 | INFO | Schema uses skills instead of tools | 0 tools but skills present — different test paradigm |

**CRITICAL: Distinguish API-001 (real API failure) vs LIB-001 (library missing) vs HDL-001 (handler broken). A missing library is NOT an API error.**

### Diagnosis Order (MANDATORY — dependencies BEFORE API calls)

Dependencies MUST be checked BEFORE any API calls. For v4 factory-injected handlers, follow this exact order:

1. Load schema (`export const main`)
2. Has `requiredLibraries`? -> Are all in the allowlist? -> LIB-001
3. Has `sharedLists`? -> Is listsDir present? -> Do the files exist? -> LST-001
4. Has `handlers`? -> Call the factory `( { sharedLists, libraries } ) => ({…})` -> Verify the result -> HDL-001
5. Has resources instead of tools? -> RES-010
6. Has skills instead of tools? -> SKL-001
7. ONLY THEN make API calls

**If steps 2-4 produce ERRORs, do NOT proceed to API calls. The API test results would be misleading.**

### Shared List Paths (CRITICAL)

- Lists live in `_lists/` NOT in `_shared/` (which is EMPTY)
- Path: `schemas/v4.0.0/providers/flowmcp-community/_lists/`
- Examples: chainlink-price-feeds, evm-chains, german-bundeslaender, iso-country-codes, iso-language-codes, trading-exchanges, trading-timeframes

### Allowlist (CRITICAL)

- The default allowlist contains ONLY Node.js built-ins
- Schemas with external libraries (ethers, indicatorts, ccxt, yahoo-finance2, vega-lite, vega, canvas, pinata, irys, better-sqlite3) need the explicit extended allowlist
- Use the explicit extended allowlist, NOT a `createRequire()` workaround
- Handlers receive libraries exclusively via injection (`libraries`), never via `import`

### Important Rules

- NEVER remove deterministic codes
- NEVER change severity of existing codes
- Be CONSERVATIVE with RES-001 — only flag clear errors
- Mark all your codes with `"source": "ai"`
- If unsure, skip — false positives are worse than false negatives

---

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../flowmcp-schema-fix/SKILL.md`](../flowmcp-schema-fix/SKILL.md) — the repairer role (next in the loop)
- [`../flowmcp-schema-inspect/SKILL.md`](../flowmcp-schema-inspect/SKILL.md) — the independent inspector role
