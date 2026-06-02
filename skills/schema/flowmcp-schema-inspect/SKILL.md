---
name: flowmcp-schema-inspect
description: >
  Inspect fixes applied to FlowMCP v4 schemas. Runs in a FRESH sub-agent context
  (no shared knowledge with the fix skill). Verifies each fix is legitimate, flags
  suspicious changes, and catches tricks (tool/test removal). Outputs
  LEGITIMATE/SUSPICIOUS/INVALID verdicts. The independent inspector role in the
  diagnose → fix → inspect loop. Must be loaded when auditing applied schema fixes.
---

# FlowMCP Schema Inspect

Inspect fixes applied to FlowMCP v4 schemas. Runs in a FRESH sub-agent context
(no shared knowledge with the fix skill). Verifies each fix is legitimate, flags
suspicious changes, and catches tricks (tool/test removal). Outputs
LEGITIMATE/SUSPICIOUS/INVALID verdicts. The independent **inspector** role in the
diagnose → fix → inspect loop.

> **Canonical v4 form**: see `flowmcp-schema-create`. Schemas use array
> parameters `[ { position, z } ]`, per-tool `output: { mimeType, schema }`,
> per-tool `meta`, the v4 version triple (`version` `4.X.Y` + `schemaVersion` +
> auto-generated 8-char `schemaHash`), and factory handlers
> `( { sharedLists, libraries } ) => ({…})` with no direct imports. A hand-edited
> `schemaHash` (it must be auto-generated) or a `version` outside `4.X.Y` is
> itself a red flag.

## Trigger

- "schema inspect"
- "inspect schema fixes"
- "/flowmcp-schema-inspect"

---

## Instructions

You are an independent schema fix inspector. You have NO knowledge of why fixes were made — you only see the evidence. Your job is to verify that fixes are genuine improvements, not tricks to hide errors.

### CRITICAL: Fresh Context

You must run in a fresh context. You must NOT have prior knowledge of the fix decisions. You evaluate purely based on:
1. The diagnosis (what was wrong)
2. The fix-log (what was changed and why)
3. The schema before fix (backup)
4. The schema after fix (current)
5. The response files (what the API actually returns)

### Input

You receive a schema path: `schemas/v4.0.0/providers/<namespace>/<file>.mjs`

From this, locate in `data/schema-tests/{namespace}/`:
1. `_diagnosis-{schemaFile}.json` — what was wrong
2. `_fix-log-{schemaFile}.json` — what was changed
3. `_schema-before-{file}.mjs` — original schema
4. The current schema file — modified schema
5. Response files — actual API data

### Step 1: Load Evidence

Read all 5 sources. If any are missing, report which and stop.

### Step 2: Compare Before/After

```
For the schema file (v4 form):
1. Count tools BEFORE and AFTER — any removed?
2. Count parameters per tool BEFORE and AFTER (array length of `parameters`) — any removed?
3. Count tests per tool BEFORE and AFTER — any removed?
4. Count required parameters BEFORE and AFTER — a parameter that gained `optional()` / `default()` in `z.options` (previously required) changed to optional?
5. Compare per-tool `output` blocks — any set to {} (empty)?
6. Confirm `meta` blocks remain present for every tool (v4.2.0 mandatory) — any removed?
```

### Step 3: Evaluate Each Fix

For each entry in the fix-log:

**Check for INVALID (tricks):**
- A tool was removed → INVALID
- A test was removed → INVALID
- A per-tool `output` block set to `{}` → INVALID
- A per-tool `meta` block removed → INVALID (v4.2.0 mandatory)
- Description set to "not used", "n/a", "deprecated", or similar → INVALID

**Check for SUSPICIOUS (needs justification):**
- A parameter was removed from the `parameters` array → check fix-log reason. If convincing → LEGITIMATE. If weak → SUSPICIOUS
- A previously required parameter gained `optional()` / `default()` in `z.options` → check fix-log reason
- Description is too generic ("the parameter", "a value", "input data") → SUSPICIOUS
- The `output.schema` has fewer properties than what responses actually return → SUSPICIOUS
- New tests use obviously fake/placeholder data → SUSPICIOUS
- A top-level `import`/`require` was added to the schema → SUSPICIOUS (v4 forbids direct imports)

**Check for LEGITIMATE (good fixes):**
- Output schema added and matches response structure → LEGITIMATE
- Description is specific and helpful → LEGITIMATE
- Test data is realistic (matches patterns in existing tests) → LEGITIMATE
- Handler code is syntactically plausible → LEGITIMATE
- Parameter rename has clear improvement ("q" → "search_query") → LEGITIMATE

### Step 4: Validate Schema

```
1. Can the schema file still be parsed? (valid JavaScript/JSON)
2. Does it still have all the tools it had before?
3. Are the changes consistent with the fix-log?
   (no undocumented changes — everything changed must be in the log)
```

### Step 5: Check for Undocumented Changes

Compare before/after diff. If there are changes NOT mentioned in the fix-log → SUSPICIOUS.

Every change must be accounted for. Silent changes are a red flag.

### Step 6: Write Inspection Report

Write `_inspection-{schemaFile}.json`:

```json
{
    "schemaFile": "brightSky.mjs",
    "namespace": "brightsky",
    "inspectedAt": "2026-03-19T03:00:00Z",
    "totalFixes": 8,
    "legitimate": 7,
    "suspicious": 1,
    "invalid": 0,
    "undocumentedChanges": 0,
    "results": [
        {
            "code": "getAlerts::SCH-001",
            "verdict": "LEGITIMATE",
            "reason": "Output schema has 2 properties matching all 3 test responses"
        },
        {
            "code": "getWeather::INP-001",
            "param": "tz",
            "verdict": "SUSPICIOUS",
            "reason": "Description 'timezone parameter' too generic — should specify format"
        }
    ],
    "schemaIntegrity": {
        "toolsBefore": 4,
        "toolsAfter": 4,
        "testsRemoved": false,
        "parametersRemoved": false,
        "parseable": true
    }
}
```

### Step 7: Report

```
Schema: {file}
Inspection: {legitimate} LEGITIMATE, {suspicious} SUSPICIOUS, {invalid} INVALID
Undocumented changes: {count}
Schema integrity: {OK/BROKEN}

{If any INVALID or >1 SUSPICIOUS: "FIX REJECTED — needs rework"}
{If all LEGITIMATE or <=1 SUSPICIOUS: "FIX ACCEPTED"}
```

### Automatic Structure Comparison (Memo 016)

At every inspection, perform an automatic structure comparison:

1. Import the schema, count tools/params/tests (current state)
2. Load the last known structure from the fix-log or snapshot (before state)
3. Compare:
   - New tools = OK
   - Removed tools = SUSPICIOUS
   - Fewer params = SUSPICIOUS
   - Fewer tests = SUSPICIOUS
4. Undocumented changes (not mentioned in the last commit message or fix-log) = report as SUSPICIOUS

**If the fix-log says "only analyzed" but the schema was changed = INVALID.** This is a clear contradiction — the agent claims no changes were made but the file differs from the backup.

### Recognizing Handler Types

All v4 handlers are **factory** handlers — `( { sharedLists, libraries } ) => ({...})` with injected dependencies and **no direct imports**. Within the factory, recognize the phase used:

- **preRequest**: mutates `struct` / `payload` before the request — inspect URL/param construction
- **executeRequest**: fully replaces the HTTP request — inspect parsing logic and error handling
- **postRequest**: transforms `response` after the request — inspect the transform and error checks
- **Dependency check**: any library used must be declared in `requiredLibraries` and consumed via the injected `libraries` argument — a top-level `import`/`require` is INVALID for v4

### Silent Default Violations

Check for silent default violations in any new code added by the fix:
- `|| []` or `|| {}` without an explicit comment explaining why it is safe = SUSPICIOUS
- New default values that change the behavior of existing parameters = SUSPICIOUS
- A previously required parameter now carrying `optional()` / `default()` in `z.options` = SUSPICIOUS

### Important Rules

- You are the LAST line of defense against bad fixes
- Be skeptical but fair — not every parameter removal is a trick
- Read the fix-log reasons carefully before judging
- Undocumented changes are always SUSPICIOUS
- If the schema can't be parsed after fix → the entire fix is INVALID
- If fix-log says "only analyzed" but git diff shows changes → INVALID

---

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../flowmcp-schema-diagnose/SKILL.md`](../flowmcp-schema-diagnose/SKILL.md) — the detector role
- [`../flowmcp-schema-fix/SKILL.md`](../flowmcp-schema-fix/SKILL.md) — the repairer role (previous in the loop)
