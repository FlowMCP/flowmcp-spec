---
title: "21 — Universal Pre-Condition Obligation (§20)"
description: "This section is the **central anchoring point** for the pre-condition obligation. It was generalised from the Selection pre-condition to a **universal rule**: all aggregated checks..."
grading_version: "2.0.0"
spec_file: "21-pre-conditions.md"
order: 21
section: "Grading"
normative: true
source_commit: "4a4d7c2"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/4a4d7c2/grading/2.0.0/21-pre-conditions.md"
generated_at: "2026-05-31T16:52:18.836Z"
generated_from: "grading/2.0.0/21-pre-conditions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/21-pre-conditions.md."
---

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`06-determinism-and-tier.md`](./06-determinism-and-tier.md), [`08-grading-model.md`](./08-grading-model.md), [`16-selection-lockfile.md`](./16-selection-lockfile.md) |
| Related | [`11-about-convention.md`](./11-about-convention.md), [`15-versioning-axes.md`](./15-versioning-axes.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** entirely new section §20 (universal pre-condition obligation). Central anchoring point for a rule referenced in §11 and §19.

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## §20 Pre-Conditions

This section is the **central anchoring point** for the pre-condition obligation. It was generalised from the Selection pre-condition to a **universal rule**: all aggregated checks (Selection-Gradings, About verifications) are blocked until all member schemas carry `gradingStatus: stable`.

### §20.1 Universal Rule

> Aggregated checks (all checks that operate across multiple schemas — namely Selection-Gradings and About verifications) are blocked until ALL member schemas in the current `index.json.lockSnapshot` carry `gradingStatus: "stable"`.

The member status is read from the frozen `lockSnapshot` block of the selection's `index.json` (the point-in-time snapshot written once at grading start), not from a separate lockfile. Each member's `gradingStatus` is one of the five-status enum: `pending`, `blocked`, `graded`, `stable`, `rejected`. Only `stable` passes the gate; every other status (including the terminal `rejected`) blocks the aggregated check.

This rule is universal. It is made concrete in §11.3 (Selection workflow step 0) and §19.3 (About verification step 0), but anchored here.

### §20.2 Stable Definition

A schema has `gradingStatus: "stable"` when the last operation in its `_gradings/` folder was a `mode: "full"` grading with `aggregateGrade` in `{A, B}` (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8.2).

Schema bumps (`schemaHash` changes, see [`15-versioning-axes.md`](./15-versioning-axes.md) §10) invalidate `stable` — the status falls back to `"pending"`. Rationale: a new `schemaHash` means, by definition, that the schema object was changed — the previous evaluation no longer applies.

| Condition | Result |
|-----------|--------|
| Last grading `mode=full` AND `aggregateGrade in {A,B}` | `stable` |
| Last grading `mode=full` AND `aggregateGrade in {C,D,F}` | `graded` |
| Categorical Veto raised (`aggregateGrade: REJECTED`) | `rejected` (terminal, irreversible) |
| Cannot be graded yet (fewer than 3 tests, no About, API down) | `blocked` (with `reason`) |
| Last grading `mode=partial` (any grade) | stays at the last full status |
| `schemaHash` changed since the last full grading | `pending` (invalidated) |
| Never run a `mode=full` grading | `pending` |

Only `stable` passes the pre-condition gate. `pending`, `blocked`, `graded`, and the terminal `rejected` all block the aggregated check.

### §20.3 Scope of Application

The pre-condition applies to **aggregated checks**, not to tier-level checks:

| Check | Pre-condition active? |
|-------|----------------------|
| Single-Grading | No (tier level, no aggregation) |
| Selection-Grading | Yes (all members stable per `index.json.lockSnapshot`) |
| About verification (namespace) | Yes (all namespace members stable per `index.json.lockSnapshot`) |
| About verification (selection) | Yes (all selection members stable per `index.json.lockSnapshot`) |

Four check classes, three of them subject to the pre-condition.

### §20.4 Block Behaviour

When the pre-condition is not met:

- The check is **aborted** (BLOCK)
- The list of `pending` members is output (toolchain requirement)
- Recommended follow-up action: complete the missing Single-Gradings

Example output (toolchain):

```
PRE-CONDITION FAILED — selection-grading blocked
Selection: crypto-domain-full
Source: selections/crypto-domain-full/index.json (lockSnapshot)
Non-stable Members:
  - binance.ticker (schemaHash a1b2c3d4, gradingStatus: graded)
  - jupiter.swap (schemaHash c3d4e5f6, gradingStatus: pending)
Follow-up action: complete the Single-Gradings, then rebuild the index and refreeze the lockSnapshot.
```

### §20.5 Cross-Refs

- Tier trim — full vs. partial → [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8
- Selection workflow step 0 → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.3
- About verification step 0 → [`11-about-convention.md`](./11-about-convention.md) §19.3
- Version bump invalidates `stable` → [`15-versioning-axes.md`](./15-versioning-axes.md) §10.4
- Flywheel loop (pre-condition as a gate) → [`18-flywheel-loop.md`](./18-flywheel-loop.md) §16
- Pre-condition validator implementation (shared between the About and Selection paths) — a later-stage concern
