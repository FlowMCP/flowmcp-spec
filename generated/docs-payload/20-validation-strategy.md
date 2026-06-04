---
title: "Validation Strategy"
description: "FlowMCP v4.3.0 introduces a two-layer validation strategy: **deterministic** (structural) and **probabilistic** (LLM-based). Together they produce a **Grade Report** with a letter grade (A–F)."
spec_version: "4.3.0"
spec_file: "20-validation-strategy.md"
order: 20
section: "Specification"
normative: true
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/spec/v4.3.0/20-validation-strategy.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "spec/v4.3.0/20-validation-strategy.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/20-validation-strategy.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

---

## Overview

FlowMCP v4.3.0 introduces a two-layer validation strategy: **deterministic** (structural) and **probabilistic** (LLM-based). Together they produce a **Grade Report** with a letter grade (A–F).

---

## See also — Grading-Spec in `flowmcp-grading`

A separate **Grading-Spec** (`gradingSpec/3.0.0`) covers Single-Schema and Selection grading in the [flowmcp-grading](https://github.com/FlowMCP/flowmcp-grading) repo. The Validation Strategy in this file remains the deterministic baseline; the Grading System defined in the Grading-Spec extends (and partly replaces) the simple A–F Grade System described below. The Schemas-Spec v4.3.0 remains the highest instance.

Entry point: [flowmcp-grading/spec/1.0.0/00-overview.md](https://github.com/FlowMCP/flowmcp-grading/blob/main/spec/1.0.0/00-overview.md).

---

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

- **Development track** (this strategy, the Grade Report). A validation FAIL yields the terminal grade **F = "Not loadable"**. The development gate is unchanged: validate-clean is still required before `stage:production` (see [21-schema-lifecycle](/specification/schema-lifecycle/)). Grade F continues to represent a not-loadable schema in the dev/grade-report sense.
- **Monitoring / grading track.** The same FAIL produces a **`blocked` record with a repairable reason** (e.g. `validation-failed`), **not** the terminal grade F. This is the emit-on-failure behaviour of the Grading-Spec: the import gate emits a `blocked` node and continues rather than aborting. The pinned `blocked` reason set and the status-record semantics live in the Grading-Spec [`23-index-json.md`](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/3.0.0/23-index-json.md) (status + reason, no grade).

The two tracks are reconciled in `21-schema-lifecycle.md`: the dev gate (validate before production) stays; the monitoring record (emitted regardless) is the grading track's concern.

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

This avoids `validationVersion` fields in schema files (anti-pattern — the Grade Report is the record).

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

- **Depends on:** [00-overview.md](/specification/overview/), [09-validation-rules.md](/specification/validation-rules/)
- **Related:** [22-scoring-protocol.md](/specification/scoring-protocol/), [21-schema-lifecycle.md](/specification/schema-lifecycle/), [10-tests.md](/specification/tests/)

