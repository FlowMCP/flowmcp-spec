---
title: "Validation Strategy"
description: "Validation in FlowMCP works in two layers. A **deterministic** layer checks structural correctness — that the schema is well-formed and every primitive declares the fields it must. A..."
spec_version: "4.3.0"
spec_file: "20-validation-strategy.md"
order: 20
section: "Specification"
normative: true
source_commit: "659863f"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/659863f/spec/v4.3.0/20-validation-strategy.md"
generated_at: "2026-06-21T18:39:36.331Z"
generated_from: "spec/v4.3.0/20-validation-strategy.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/20-validation-strategy.md."
---

Validation in FlowMCP works in two layers. A **deterministic** layer checks structural correctness — that the schema is well-formed and every primitive declares the fields it must. A **probabilistic** layer adds an LLM-based quality judgement on top of a structurally clean schema. Together the two layers produce a **Grade Report** that assigns a single letter grade (A–F), which is the record this page defines.

A separate **Grading-Spec** in the `flowmcp-grading` repository covers Single-Schema and Selection grading in more depth. The strategy described here remains the deterministic baseline; the Grading System defined by the Grading-Spec extends, and in places replaces, the simple A–F Grade System below. The Schemas-Spec remains the highest instance.


## Grade System

| Grade | Condition | Meaning |
|-------|-----------|---------|
| A | PASS + Score ≥ 4.0 | Production-ready |
| B | PASS + Score ≥ 3.0 | Good, minor gaps |
| C | PASS + Score ≥ 2.0 | Acceptable |
| D | PASS + Score < 2.0 | Weak |
| F | FAIL | Not loadable |

**PASS** means the deterministic validator found no errors (warnings are allowed).

### Two tracks: dev-track grade F vs. monitoring-track `blocked` record

A validation FAIL is recorded differently depending on the track:

- **Development track** (this strategy, the Grade Report). A validation FAIL yields the terminal grade **F = "Not loadable"**. The development gate is unchanged: validate-clean is still required before `stage:production` (see [21-schema-lifecycle.md](/specification/schema-lifecycle/)). Grade F continues to represent a not-loadable schema in the dev/grade-report sense.
- **Monitoring / grading track.** The same FAIL produces a **`blocked` record with a repairable reason** (e.g. `validation-failed`), **not** the terminal grade F. This is the emit-on-failure behaviour of the Grading-Spec: the import gate emits a `blocked` node and continues rather than aborting. The pinned `blocked` reason set and the status-record semantics live in the Grading-Spec (status + reason, no grade).

## Grade Report Format

```json
{
    "schemaId": "etherscan-io/contracts",
    "validatorVersion": "validation/4.0",
    "timestamp": "2026-05-11T09:00:00Z",
    "deterministic": {
        "status": "PASS",
        "errors": [],
        "warnings": []
    },
    "probabilistic": {
        "score": 4.2
    },
    "primitives": [
        "etherscan-io/tool/getAbi",
        "etherscan-io/tool/getContractCreation"
    ],
    "grade": "A"
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `schemaId` | string | Schema-File-ID (`namespace/schema-name`, 1 slash) — references the physical `.mjs` file |
| `validatorVersion` | string | Validator version used (internal, not stored in schemas) |
| `timestamp` | string | ISO 8601 when the report was generated |
| `deterministic.status` | string | `PASS` or `FAIL` |
| `deterministic.errors` | array | Validation errors (VAL codes) |
| `deterministic.warnings` | array | Validation warnings |
| `probabilistic.score` | number | LLM evaluation score (0.0–5.0) |
| `primitives` | string[] | All Primitive-IDs active in this schema at validation time |
| `grade` | string | Final grade: A, B, C, D, or F |

## schemaId is Schema-File-ID

`schemaId` MUST be the Schema-File-ID (`namespace/schema-name`, 1 slash) — not a Primitive-ID (2 slashes).

**Correct:** `"schemaId": "etherscan-io/contracts"`  
**Wrong:** `"schemaId": "etherscan-io/tool/getAbi"` ← This is a Primitive-ID

The Schema-File-ID connects the report to the physical file on disk.

## Validator Versioning

Validator versions are internal and are NOT stored in schema files. They appear only in the Grade Report:

- `validation/4.0` — initial v4 validator
- `validation/4.1` — incremental update (backward compatible)

This avoids `validationVersion` fields in schema files (an anti-pattern — the Grade Report is the record).

## Deterministic Validation

Validates structural correctness:
- Schema structure (`main`, `tools`, `resources`, etc.)
- Required fields per primitive type
- Validation rules VAL001–VAL107
- SEL, AGT, RES rule sets

## Probabilistic Validation

LLM-based quality evaluation:
- Description quality (clear, accurate, useful)
- Parameter documentation completeness
- Test case coverage
- One-Shot completeness for Skills

Score range: 0.0 (unusable) to 5.0 (excellent).

## Partial Schema Policy

Before Production deploy, all failing Primitives MUST be removed from the schema file.

A Language Model calling tools from `etherscan-io/contracts` receives the tool list and assumes all tools work. A failing tool in Production causes unpredictable errors.

**Rule:** 1 failing primitive gets removed — regardless of how many others pass.

## Related

- [00-overview.md](/specification/overview/) — mission, the two-channel catalog, and the knowledge framing.
- [09-validation-rules.md](/specification/validation-rules/) — the wayfinder mapping each rule family to its home page.
- [22-scoring-protocol.md](/specification/scoring-protocol/) — the JSON formats exchanged between the CLI and an external grader.
- [21-schema-lifecycle.md](/specification/schema-lifecycle/) — the six stages a schema travels from idea to production.
- [10-tests.md](/specification/tests/) — executable examples that document tools and capture real responses.

