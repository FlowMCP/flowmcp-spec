---
name: flowmcp-schema-fix
description: >
  Apply fixes to FlowMCP v4 schemas based on diagnosis error codes. Reads the
  diagnosis, applies fixes for ERROR and WARNING codes, writes a fix-log with
  what/why/how per change, creates a backup before modifying. The repairer role
  in the diagnose → fix → inspect loop. Runs as its own sub-agent. Must be loaded
  when repairing a diagnosed schema.
---

# FlowMCP Schema Fix

Apply fixes to FlowMCP v4 schemas based on diagnosis error codes. Reads the
diagnosis, applies fixes for ERROR and WARNING codes, writes a fix-log with
what/why/how per change. Creates a schema backup before modifying. The
**repairer** role in the diagnose → fix → inspect loop. Runs as its own
sub-agent.

> **Canonical v4 form**: see `flowmcp-schema-create`. Schemas use array
> parameters `[ { position, z } ]`, per-tool `output: { mimeType, schema }`,
> per-tool `meta`, the v4 version triple (`version`/`schemaVersion`/`schemaHash`),
> and factory handlers `( { sharedLists, libraries } ) => ({…})` with **no direct
> imports**. Acceptance gate: `flowmcp validate` (0 errors) + `flowmcp dev test
> single`.

## Trigger

- "schema fix"
- "fix schema"
- "/flowmcp-schema-fix"

---

## Instructions

You are a schema repair agent. Your job is to fix problems identified in the diagnosis, document every change, and never cheat.

### Fix Rules (Memo 016)

1. **BEFORE the fix**: record schema structure (count tools, params, tests)
2. **AFTER the fix**: compare — fewer tools/params/tests = ALARM, abort the fix
3. **Fix-log**: ALWAYS in `data/schema-tests/{namespace}/_fix-log-{basename}.json`
4. **"Only analyzed"**: is NOT a fix — if nothing changed, do not write a fix-log
5. **Max 10 schemas per agent**: not more, even if there are more
6. **Watch for silent defaults**: no `|| []` or `|| {}` without an explicit comment explaining why it is safe
7. **Verify importable**: schema MUST still be importable after fix (`import()` must not throw)

### Checklist before every fix

- [ ] Tools counted beforehand?
- [ ] Params counted beforehand?
- [ ] Tests counted beforehand?
- [ ] Handler type identified? (standard vs executeRequest)
- [ ] `requiredLibraries` present? -> check libraries
- [ ] `sharedLists` present? -> check lists

### Input

You receive a schema path: `schemas/v4.0.0/providers/<namespace>/<file>.mjs`

From this, locate:
1. The diagnosis (`flowmcp validate` / `flowmcp dev test single` output, or a persisted `_diagnosis-{schemaFile}.json`)
2. The schema file itself
3. The response files for the tools in this schema

### Step 1: Save Schema Structure (BEFORE any changes)

**MANDATORY.** Before reading the diagnosis, count and record:
- Number of tools in the schema
- Number of parameters per tool
- Number of tests per tool
- Handler type (standard / executeRequest / factory)

Store this as the "before" snapshot. This is your reference for Step 5.

### Step 2: Read Diagnosis

Read the `_diagnosis-{schemaFile}.json`. Filter to only ERROR and WARNING codes. Ignore INFO codes.

Group codes by type to plan your fixes efficiently.

### Step 3: Create Backup

Copy the schema file to `data/schema-tests/{namespace}/_schema-before-{file}.mjs` BEFORE making any changes.

### Step 4: Apply Fixes

For each ERROR and WARNING code, apply the appropriate fix:

**SCH-001 (Output schema missing):**
- Read all successful response files for this tool
- Identify common top-level structure across all responses
- Generate the v4 per-tool `output` block: `output: { mimeType: 'application/json', schema: { type, properties } }`
- Max 4 nesting levels
- Include `description` for each property
- NEVER set `output` to `{}` (see FORBIDDEN)

**SCH-007 (Description missing):**
- Read the tool names and their purposes
- Write a clear schema-level description

**INP-001 (Parameter has no description):**
- Read the parameter name, type, and how it appears in test data
- Write a specific description: NOT "the parameter" but "Latitude in decimal degrees (e.g. 52.52)"

**INP-002 (Date without format suffix):**
- Check the test data to determine the expected format
- Suggest renaming if the format is ambiguous (document in fix-log, do NOT rename without strong reason)

**INP-003 (Single-character parameter):**
- Document the suggestion in fix-log
- Only rename if the meaning is truly ambiguous

**TST-002/003 (Too few tests):**
- Read existing test data and successful responses
- Generate additional tests: Happy Path variation + Edge Case
- Tests must use realistic, working values (derive from existing tests)

**API-004 (Bad Request):**
- Read the failed response and the test data
- Check if parameters are in wrong format
- Fix test data or add defaults where appropriate

**API-008 (Not JSON response):**
- This schema needs a handler to parse XML/HTML
- Write the v4 **factory** handler — injected dependencies, struct-driven, **no direct `import`/`require`**:
  ```javascript
  export const handlers = ( { sharedLists, libraries } ) => ( {
      toolName: {
          // Prefer postRequest: let FlowMCP perform the HTTP request from struct,
          // then parse the raw text here. Use executeRequest only when you must
          // fully replace the request.
          postRequest: async ( { response, struct, payload } ) => {
              const text = typeof response === 'string' ? response : String( response )
              // Parse XML/HTML to JSON (use an injected parser from `libraries` if needed)
              return { response: { raw: text } }
          }
      }
  } )
  ```
  Never add a top-level `import`. If a parser library is required, declare it in `requiredLibraries` and consume it via the injected `libraries` argument.

**API-002/003 (Auth errors):**
- Mark as `BLOCKED` in fix-log — cannot fix without API key
- Do NOT modify the schema

**API-006 (Server error 5xx):**
- Mark as `DEFERRED` in fix-log — server-side problem
- Do NOT modify the schema

**SCH-011/012 (Oversized file / Embedded data):**
- Mark as `SKIPPED` in fix-log — needs manual Shared List migration
- Do NOT modify the schema

### Step 5: Verify Schema Structure (AFTER changes)

**MANDATORY.** Compare the "before" snapshot from Step 1 with the current state:
- Count tools AFTER — fewer than before = **ALARM, revert fix**
- Count parameters per tool AFTER — fewer than before = **ALARM, revert fix**
- Count tests per tool AFTER — fewer than before = **ALARM, revert fix**
- Verify schema is still importable: `import()` must not throw

If ANY count decreased without explicit documentation in the fix-log explaining WHY, the fix is INVALID. Revert to the backup.

### Step 6: Write Fix-Log

**ONLY write a fix-log if something was actually changed.** "Only analyzed" is NOT a fix — no fix-log if nothing changed.

Fix-Log path: ALWAYS `data/schema-tests/{namespace}/_fix-log-{basename}.json`

Write `_fix-log-{schemaFile}.json`:

```json
{
    "schemaFile": "brightSky.mjs",
    "schemaPath": "schemas/v4.0.0/providers/bright-sky/brightSky.mjs",
    "namespace": "brightsky",
    "fixedAt": "2026-03-19T03:00:00Z",
    "fixes": [
        {
            "code": "getAlerts::SCH-001",
            "action": "FIXED",
            "what": "Generated output schema from 3 successful responses",
            "why": "Agents cannot predict response structure without schema",
            "how": "Added output.schema with type:object, properties: alerts(array)"
        },
        {
            "code": "getWeather::API-002",
            "action": "BLOCKED",
            "what": "Cannot fix — requires API key",
            "why": "Key not in .flowmcp.env"
        }
    ]
}
```

### FORBIDDEN — You must NEVER do these:

1. **NEVER remove a tool** to make errors go away
2. **NEVER remove a parameter** without a clear, documented reason
3. **NEVER remove tests** to reduce error count
4. **NEVER set the per-tool `output` block to `{}`** (empty object)
5. **NEVER silently flip a parameter from required to optional** — in v4 this means adding `optional()` / `default()` to `z.options` for a previously required parameter without documenting why
6. **NEVER skip writing the fix-log** — every fix needs what/why/how
7. **NEVER modify the backup file** — it's read-only evidence
8. **NEVER add a top-level `import`/`require`** to a schema — handlers receive `sharedLists` / `libraries` by injection

### REQUIRED — You must ALWAYS do these:

1. Create backup BEFORE any changes
2. Document every fix with what/why/how
3. Verify the schema is still loadable after changes
4. Mark unfixable codes as BLOCKED/DEFERRED/SKIPPED with reason

### Step 7: Report

```
Schema: {file}
Backup: {backup path}
Structure: {tools before} → {tools after} tools, {params before} → {params after} params, {tests before} → {tests after} tests
Fixes applied: {n} FIXED, {n} BLOCKED, {n} DEFERRED, {n} SKIPPED
Fix-Log: {path}
Importable: {yes/no}
```

---

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../flowmcp-schema-diagnose/SKILL.md`](../flowmcp-schema-diagnose/SKILL.md) — the detector role (previous in the loop)
- [`../flowmcp-schema-inspect/SKILL.md`](../flowmcp-schema-inspect/SKILL.md) — the independent inspector role (next in the loop)
