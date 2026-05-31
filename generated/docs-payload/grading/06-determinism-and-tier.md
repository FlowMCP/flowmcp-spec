---
title: "Determinism and Tier"
description: "The Grading-Spec separates **reproducibility** (Determinism) from **attainability** (Tier). The two axes are **orthogonal**: a dimension can be deterministic but group-bound, or non-deterministic but..."
grading_version: "2.0.0"
spec_file: "06-determinism-and-tier.md"
order: 6
section: "Grading"
normative: true
source_commit: "2d44cb7"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2d44cb7/grading/2.0.0/06-determinism-and-tier.md"
generated_at: "2026-05-31T17:29:02.778Z"
generated_from: "grading/2.0.0/06-determinism-and-tier.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/06-determinism-and-tier.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md) |
| Related | [`04-phases-single.md`](./04-phases-single.md), [`05-phases-selection.md`](./05-phases-selection.md), [`07-scoring-vs-grading.md`](./07-scoring-vs-grading.md), [`08-grading-model.md`](./08-grading-model.md), [`09-security-and-development.md`](./09-security-and-development.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md), [`21-pre-conditions.md`](./21-pre-conditions.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## 1. Introduction — Two Orthogonal Axes

The Grading-Spec separates **reproducibility** (Determinism) from **attainability** (Tier). The two axes are **orthogonal**: a dimension can be deterministic but group-bound, or non-deterministic but autonomous. Both axes are carried independently in the grading entry as the fields `determinism` and `gradingTier` (see [`08-grading-model.md`](./08-grading-model.md)).

| Axis | Values | Effect |
|------|--------|--------|
| Determinism | `deterministic` / `non-deterministic` | Reproducibility |
| Tier | `autonomous` / `group-bound` | Maximum attainable grade (Ch. 7) |

---

## 2. Axis 1 — Determinism

### 2.1 `deterministic`

A dimension is **deterministic** when the score is **reproducible** given:

- identical inputs, and
- identical `scoringSystem/X.Y.Z` version.

Examples: schema structure (v4.2 field-shape check), HTTP status, route-name match, imports scan, API-key-domain match, lint.

### 2.2 `non-deterministic`

A dimension is **non-deterministic** when the output depends on:

- the LLM model used,
- the persona under which the evaluation runs, or
- the group context (selection composition).

For non-deterministic dimensions, the grading entry MUST record both `llmModel` and `selectionContext` (see [`08-grading-model.md`](./08-grading-model.md)).

### 2.3 Mixed Forms

Some dimensions have **both deterministic and non-deterministic sub-parts**. The canonical example is the About Resource compliance: the route-exists check (is an About Resource declared and present?) is deterministic; the content judgement (is the About content meaningful?) is non-deterministic.

For mixed forms, implementers MAY:

- split the dimension into two sub-dimensions (one `deterministic`, one `non-deterministic`), or
- collapse it into a single dimension with `determinism = non-deterministic` (the strictly reproducible sub-part still runs, but the aggregate carries the weaker reproducibility claim).

---

## 3. Axis 2 — Tier

### 3.1 `autonomous`

The dimension is graded by an **autonomous grader** on the provider side ([`04-phases-single.md`](./04-phases-single.md)) **without group context**. The maximum attainable grade for an aggregate composed exclusively of `autonomous` dimensions is **B**.

### 3.2 `group-bound`

The dimension is graded by a **group- or persona-bound grader** on the selection side ([`05-phases-selection.md`](./05-phases-selection.md)). Grade **A** is reachable only when the aggregate contains at least one `group-bound` contribution.

### 3.3 Consumer Visibility

The grading model ([`08-grading-model.md`](./08-grading-model.md)) exposes a `maxAttainableGrade` field. This field makes it visible to a consumer that — for a schema graded only on the provider side — a **higher grade is reachable** by adding the schema's namespace to a selection and running the selection-side Areas.

---

## 4. Dimension–Area Matrix

The following table is the **non-exhaustive but canonical** mapping of grading dimensions to the two axes. Each row carries the dimension name, its determinism value, its tier, and the **Area** that writes it.

| Dimension | Determinism | Tier | Source (Area) |
|-----------|-------------|------|----------------|
| Schema structure (v4.2) | deterministic | autonomous | `tools-aggregate-schema` |
| HTTP status (200 = pass) | deterministic | autonomous | `single-test` |
| Tool description neutrality | deterministic (heuristic) | autonomous | `single-test` / `tools-aggregate-schema` |
| `whenToUse` clarity | non-deterministic | autonomous | `single-test` / `tools-aggregate-schema` |
| `parameters` understandability | non-deterministic | autonomous | `single-test` |
| About Resource compliance | deterministic (route-exists) + non-deterministic (content) | autonomous | `about-namespace` |
| `namespaceSkillValidity` | deterministic + non-deterministic | autonomous | `namespace-skills` |
| `domainConformance` | deterministic (against the About / Domain-Knowledge document) | group-bound | `selection-aggregate` |
| `selectionSkillL1` / `L2` / `L3` | non-deterministic | group-bound | `selection-skills-L1` / `-L2` / `-L3` |
| `personaUseCaseFit` | non-deterministic | group-bound | `selection-aggregate` |
| External-module audit | deterministic (imports) + non-deterministic (purpose) | autonomous | Security (Ch. 9) |
| API-key-domain match | deterministic | autonomous | Security (Ch. 9) |

A dimension that does not appear in this matrix MUST be added (and its axes declared) before it can be used in a grading entry.

---

## 5. Binding Rules

The following four rules are **binding** for every grader, scorer, and aggregator that conforms to this spec.

1. **HTTP 4xx MUST NOT be treated as "auth-pass".** HTTP 4xx — including 401 and 403 — MUST NOT be scored as pass. **200 is pass; everything else is fail or defect.** (See [`04-phases-single.md`](./04-phases-single.md) §3.3.)
2. **A schema MUST run all applicable deterministic tests.** Selective skipping is forbidden. If a deterministic test is applicable to a schema, the grader MUST execute it; the result MAY be `n/a` only when the test is provably non-applicable (e.g. a jq-pipe check on a schema without output).
3. **`aggregateGrade ≥ B` SHOULD contain at least one LLM-based (non-deterministic) evaluation.** A schema graded exclusively on deterministic dimensions can reach grade B, but the Grading-Spec recommends that at least one LLM verification be present at grade B and above.
4. **`aggregateGrade ≥ A` MUST contain at least one `group-bound` evaluation.** Grade A is **not autonomously reachable**. A schema graded only on the provider side (`tier = autonomous` throughout) cannot be assigned grade A.

---

## 6. Interaction with Veto

The categorical Veto (see [`09-security-and-development.md`](./09-security-and-development.md)) can be raised on **either tier**. Veto-driven gates halt dependent Areas regardless of tier — see the cascade-stop rule in [`04-phases-single.md`](./04-phases-single.md) §3.3 and the analogous rule in [`05-phases-selection.md`](./05-phases-selection.md) §5.

A Veto is an outcome of its own; it does not reduce a numerical score, it replaces the aggregate grade with `REJECTED`. The index derivation maps `REJECTED` to the terminal node status `rejected` (see [`19-folder-layout.md`](./19-folder-layout.md)).

---

## 7. Interaction with Scoring- / Grading-System Version

Determinism applies **at a fixed Scoring-System version**. A bump of the `scoringSystem/X.Y.Z` namespace can change how a deterministic test is scored — the test remains deterministic at the new version, but old scores cannot be compared one-to-one to new scores.

When `scoringSystem` is bumped, schemas MUST be re-scored. Cached scores from older versions MUST NOT be silently aggregated with new scores. The version contract is described in detail in [`07-scoring-vs-grading.md`](./07-scoring-vs-grading.md).

The same applies to `gradingSystem/X.Y.Z` bumps: thresholds, weights, tier trims, and the Veto list MAY change; the mapping from scores to grades is therefore version-bound.

---

## 8. Tier Trim and Partial Grading

### 8.1 Tier Trim (Recap)

`maxAttainableGrade` is a fixed mapping from `gradingTier` (see §3.3). An autonomous grading can reach grade `B` at most; a group-bound grading can reach grade `A`. Tier trim is the deterministic final stage of the aggregate computation (see [`08-grading-model.md`](./08-grading-model.md) §14 point 3).

### 8.2 Partial vs. Full Grading and the `stable` Status

A grading with `gradingMode: "partial"` updates only the explicitly checked Areas / dimensions in the grading set. The `aggregateGrade` **remains** at the value computed by the most recent `mode: "full"` operation. Promotion to the node status `stable` is possible only through a `mode: "full"` grading.

Rationale: partial gradings serve iteration steps (re-testing a single dimension on purpose). If they changed the aggregate, a single improvement step could distort the overall evaluation without the remaining dimensions having been re-checked.

| Mode | Allowed grading subset | Effect on `aggregateGrade` | Effect on node status |
|------|------------------------|----------------------------|------------------------|
| `full` | All applicable Areas / dimensions | Recomputed | May switch to `stable` |
| `partial` | A subset | **Unchanged** (stays at the last full value) | Stays at the last full status |

**`aggregateGrade` remains** is the binding statement: a partial grading MUST NOT overwrite the previous aggregate. A pure collection of partials without a concluding full grading never reaches the status `stable`.

### 8.3 The Five Node Statuses

The node status of a graded primitive is one of **five** values, derived by the index rollup (see [`19-folder-layout.md`](./19-folder-layout.md)):

| Status | Meaning |
|--------|---------|
| `pending` | Not yet graded. |
| `blocked` | Cannot be graded right now, with a `reason` (fewer than 3 working tests, no About Resource, API unreachable) — repairable. |
| `graded` | A grade exists. |
| `stable` | Fully graded via a `mode: "full"` operation and above threshold — ready for use; only this status passes the selection pre-condition. |
| `rejected` | Veto raised — **terminal and irreversible**. |

The `partial`/`full` distinction (§8.2) interacts directly with this status set: `partial` keeps the node at its last full status, only `full` can move a node to `stable`.

Cross-Refs:

- `gradingMode` as a top-level field → see [`08-grading-model.md`](./08-grading-model.md).
- Node status in the index rollup and the frozen member snapshot → see [`19-folder-layout.md`](./19-folder-layout.md).
- Iteration pattern → see [`18-flywheel-loop.md`](./18-flywheel-loop.md).
- Pre-condition effect (only `stable` members pass) → see [`21-pre-conditions.md`](./21-pre-conditions.md).

---

## 9. Cross-References

- [`04-phases-single.md`](./04-phases-single.md) — provider-side Areas (the cascade-stop and HTTP-4xx rule live here as well).
- [`05-phases-selection.md`](./05-phases-selection.md) — selection-side Areas (the `group-bound` contributions enter here).
- [`07-scoring-vs-grading.md`](./07-scoring-vs-grading.md) — versioning contract for `scoringSystem` and `gradingSystem`.
- [`08-grading-model.md`](./08-grading-model.md) — defines `determinism`, `gradingTier`, and `maxAttainableGrade` as grading-entry fields.
- [`09-security-and-development.md`](./09-security-and-development.md) — security dimensions (external-module audit, API-key-domain match) listed in §4.
