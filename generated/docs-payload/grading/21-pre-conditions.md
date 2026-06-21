---
title: "Universal Pre-Condition Obligation"
description: "An aggregate grade is only trustworthy if its members are themselves settled. This chapter states the one rule that guarantees that: any check spanning multiple schemas — a Selection-Grading or an..."
grading_version: "3.0.0"
spec_file: "21-pre-conditions.md"
order: 21
section: "Grading"
normative: true
source_commit: "42b4603"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/42b4603/grading/3.0.0/21-pre-conditions.md"
generated_at: "2026-06-21T01:06:21.418Z"
generated_from: "grading/3.0.0/21-pre-conditions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/21-pre-conditions.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

An aggregate grade is only trustworthy if its members are themselves settled. This chapter states the one rule that guarantees that: any check spanning multiple schemas — a Selection-Grading or an About verification — is blocked until every member schema reads `gradingStatus: stable` in the frozen `lockSnapshot`. It is the single place where that universal pre-condition is defined; the Selection and About chapters point back here rather than restating it, and the chapter also pins the readiness ladder and per-Area dependency gates that decide when each Area becomes eligible to run.

---

## Pre-Conditions

The pre-condition obligation was generalised from the original Selection-only rule to a **universal rule**: all aggregated checks (Selection-Gradings, About verifications) are blocked until all member schemas carry `gradingStatus: stable`. This is its central anchoring point.

### Universal Rule

> Aggregated checks (all checks that operate across multiple schemas — namely Selection-Gradings and About verifications) are blocked until ALL member schemas in the current `index.json.lockSnapshot` carry `gradingStatus: "stable"`.

The member status is read from the frozen `lockSnapshot` block of the selection's `index.json` (the point-in-time snapshot written once at grading start), not from a separate lockfile. Each member's `gradingStatus` is one of the five-status enum: `pending`, `blocked`, `graded`, `stable`, `rejected`. Only `stable` passes the gate; every other status (including the terminal `rejected`) blocks the aggregated check.

This rule is universal. It is made concrete in [`16-selection-lockfile.md`](/grading/selection-lockfile/) (Selection workflow step 0) and [`11-about-convention.md`](/grading/about-convention/) (About verification step 0), but anchored here.

### Stable Definition

A schema has `gradingStatus: "stable"` when the last operation in its `_gradings/` folder was a `mode: "full"` grading with `aggregateGrade` in `{A, B}` (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)).

Schema bumps (`schemaHash` changes, see [`15-versioning-axes.md`](/grading/versioning-axes/)) invalidate `stable` — the status falls back to `"pending"`. Rationale: a new `schemaHash` means, by definition, that the schema object was changed — the previous evaluation no longer applies.

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

### Scope of Application

The pre-condition applies to **aggregated checks**, not to tier-level checks:

| Check | Pre-condition active? |
|-------|----------------------|
| Single-Grading | No (tier level, no aggregation) |
| Selection-Grading | Yes (all members stable per `index.json.lockSnapshot`) |
| About verification (namespace) | Yes (all namespace members stable per `index.json.lockSnapshot`) |
| About verification (selection) | Yes (all selection members stable per `index.json.lockSnapshot`) |

Four check classes, three of them subject to the pre-condition.

### Block Behaviour

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

### Area Dependency Model (normative)

The 11 Areas are graded against a **readiness ladder** and a per-Area **dependency
gate**. The ladder is monotonic:

```
imported → structural-valid → deterministic-green → stable
```

- `structural-valid` — passes `flowmcp schema-check` (structure).
- `deterministic-green` — structural-valid AND the deterministic data-pretest is ok
  (HTTP 200 **and** non-empty data) per [`06-determinism-and-tier.md`](/grading/determinism-and-tier/).
- `stable` — full grading promoted to stable.

Each Area declares a `dependsOn` and a `requiredLevel` gate. The reference engine
keeps this as DATA (`area-dependency-graph.json`); this table is its normative source:

| Area | dependsOn | requiredLevel | dimension |
|------|-----------|---------------|-----------|
| `single-test` | none | `structural-valid` | both (det gate + non-det) |
| `tools-aggregate-schema` | none | `structural-valid` | both |
| `tools-aggregate-namespace` | all-namespace-schemas | **`deterministic-green`** | both |
| `namespace-description` | all-namespace-schemas | **`deterministic-green`** | non-det |
| `namespace-skills` | all-namespace-schemas | **`deterministic-green`** | non-det |
| `about-namespace` | about-resource-present | **`stable`** | both |
| `about-selection` | all-member-schemas | `stable` | non-det |
| `selection-skills-L1/L2/L3` | all-member-schemas | `stable` | non-det |
| `selection-aggregate` | all-member-schemas | `stable` | non-det |

Two gates are binding:

1. **Provider-Namespace-Gate** — the namespace Areas
   (`tools-aggregate-namespace`, `namespace-description`, `namespace-skills`) are
   held until **every** schema of the namespace is `deterministic-green`. The
   namespace level folds onto the **weakest** schema. This is the cost guard: no
   namespace-wide LLM round runs while any schema still fails its data-pretest.
2. **About-Namespace-Gate** — `about-namespace` is an aggregate check and follows
   the universal pre-condition above (`stable`), not `structural-valid`.

`dimension` is the work split: `deterministic` = the CLI finishes it for free;
`non-det` = it needs an LLM scoring round; `both` = a free deterministic gate AND
an LLM round for the descriptive questions (`single-test` / `tools-aggregate-schema`
carry a deterministic pretest gate plus non-deterministic description scoring).

### Emit-Skill Format (normative)

The non-deterministic emit (`grading non-deterministic <ns> --emit-prompts`)
returns ONE **self-contained Emit-Skill** — a single instruction text handed to a
sub-agent, that MUST carry, inline in the text:

1. a self-describing header (this is a grading skill, work the bundled areas in one pass);
2. the **currently-ready stage's** non-deterministic Area prompts, with the real
   schema path, tool/namespace names and the output schema **inline** (no unresolved
   placeholder may survive);
3. a **Task-ID** (the emit↔consume join key);
4. the explicit `--consume-scores` return command and the expected answer count.

Hard-gated stage-2 Areas (`namespace-*`) are NOT emitted in the same skill; they are
emitted in a **follow-up** skill once the Provider-Namespace-Gate opens. The
transport envelope is owned by [`spec/v4.3.0/22-scoring-protocol.md`]; this section
owns the Area composition + bundling rules.

The pre-condition validator itself is shared between the About and Selection paths;
its concrete implementation is a later-stage concern and is not pinned by this spec.

## Related

- [`00-overview.md`](/grading/overview/)
- [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)
- [`08-grading-model.md`](/grading/grading-model/)
- [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- [`11-about-convention.md`](/grading/about-convention/)
- [`15-versioning-axes.md`](/grading/versioning-axes/)
- [`18-flywheel-loop.md`](/grading/flywheel-loop/)

