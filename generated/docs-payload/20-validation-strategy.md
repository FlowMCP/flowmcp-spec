---
title: "Validation Strategy"
description: "**Version:** FlowMCP 4.0.0"
spec_version: "4.1.0"
spec_file: "20-validation-strategy.md"
order: 20
section: "Specification"
normative: true
source_commit: "0223c78"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/0223c78/spec/v4.1.0/20-validation-strategy.md"
generated_at: "2026-05-24T02:54:06.611Z"
generated_from: "spec/v4.1.0/20-validation-strategy.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.1.0/20-validation-strategy.md."
---

# FlowMCP Specification v4.0.0 — Validation Strategy

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance Language).

**Version:** FlowMCP 4.0.0  
**Status:** Active

---

## Overview

FlowMCP v4.0.0 introduces a two-layer validation strategy: **deterministic** (structural) and **probabilistic** (LLM-based). Together they produce a **Grade Report** with a letter grade (A–F).

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

A Language Model calling `flowmcp add etherscan-io/contracts` receives the tool list and assumes all tools work. A failing tool in Production causes unpredictable errors.

**Rule:** 1 failing primitive gets removed — regardless of how many others pass.
