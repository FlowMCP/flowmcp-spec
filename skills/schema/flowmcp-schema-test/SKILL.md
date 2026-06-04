---
name: flowmcp-schema-test
description: >
  Live-test a FlowMCP schema before validation. Ensures every tool has at least
  three working in-schema test fixtures and that the schema passes static and
  live checks. Canonical commands are flowmcp dev validate <path> (static) and
  flowmcp dev test single <path> (live, per-route HTTP status from the in-schema
  tests[] fixtures). Stage 3 (Live-Test) of the schema lifecycle. Must be loaded
  when adding fixtures or testing a schema against the real API.
---

# FlowMCP Schema Test (live-test + fixtures)

Live-test a FlowMCP schema before it moves on to validation and grading. This is
stage 3 (Live-Test) of the lifecycle in `spec/v4.3.0/21-schema-lifecycle.md`. The
goal is simple: every tool carries **at least three working in-schema test
fixtures**, and the schema passes both the static check and a live run against
the real API.

## When to use

- After creating or migrating a schema, before diagnosis/grading
- When a tool has missing or thin `tests[]` fixtures
- When a previously passing schema needs a regression run against the live API

## Canonical commands

| Command | Kind | What it does |
|---------|------|--------------|
| `flowmcp dev validate <path>` | static | Structural + strict-key validation. Acceptance gate, must return 0 errors. No network. |
| `flowmcp dev test single <path>` | live | Runs each tool against the real API using the in-schema `tests[]` fixtures. Reports a per-route HTTP status. Env values are auto-loaded. |

Run the static check first, then the live run:

```bash
flowmcp dev validate <path>
flowmcp dev test single <path>
```

## Fixture requirements

Fixtures live inside each tool under `tests[]` in `export const main`. Each
fixture is a plain object of real input values plus a `_description`.

- **At least 3 fixtures per tool.** One happy path is not enough — cover
  distinct input shapes (e.g. different IDs, enum values, optional params set vs
  omitted).
- Every fixture has a `_description` and **real** values, never placeholders.
- No silent defaults: do not let a fixture rely on an unstated default to pass.
  If a parameter has a default, exercise both the default and an explicit value.

```javascript
tests: [
    { _description: 'USDC price in USD', address: '0xa0b8...eb48', currency: 'usd' },
    { _description: 'USDC price in EUR', address: '0xa0b8...eb48', currency: 'eur' },
    { _description: 'WETH price, default currency', address: '0xc02a...6cc2' }
]
```

## Pass criteria (HTTP 4xx is NEVER a pass)

A tool passes only when its live run returns a successful response.

- **PASS = HTTP 200** (or the API's documented success status) with a usable body.
- **HTTP 4xx is NEVER a pass** — not even with an "auth looks fine" heuristic. A
  401/403/404/422 is a FAIL or a DEFECT, never a green check.
- HTTP 5xx and timeouts are FAIL — retry once, then treat as a transient defect
  to record, not a pass.

If a fixture fails, fix the fixture or the schema; do not lower the bar.

## Procedure

1. **Static gate** — `flowmcp dev validate <path>`. Resolve all errors before
   testing live.
2. **Count fixtures** — confirm each tool has ≥3 `tests[]` entries with real
   values and `_description`. Add the missing ones.
3. **Live run** — `flowmcp dev test single <path>`. Read the per-route HTTP
   status for every tool.
4. **Classify** — 200 = pass; 4xx/5xx/timeout = fail. No exceptions.
5. **Repeat** until every tool is green across all its fixtures.

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../flowmcp-schema-create/SKILL.md`](../flowmcp-schema-create/SKILL.md) — the `tests[]` field in the v4 shape
- [`../flowmcp-schema-diagnose/SKILL.md`](../flowmcp-schema-diagnose/SKILL.md) — next stage (validation/diagnosis)
- `spec/v4.3.0/21-schema-lifecycle.md` — canonical lifecycle (§21)
