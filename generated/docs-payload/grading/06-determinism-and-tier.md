---
title: "Determinism and Tier"
description: "The Grading-Spec separates **reproducibility** (Determinism) from **attainability** (Tier). The two axes are **orthogonal**: a dimension can be deterministic but group-bound, or non-deterministic but..."
grading_version: "3.0.0"
spec_file: "06-determinism-and-tier.md"
order: 6
section: "Grading"
normative: true
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/grading/3.0.0/06-determinism-and-tier.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "grading/3.0.0/06-determinism-and-tier.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/06-determinism-and-tier.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

## Introduction — Two Orthogonal Axes

The Grading-Spec separates **reproducibility** (Determinism) from **attainability** (Tier). The two axes are **orthogonal**: a dimension can be deterministic but group-bound, or non-deterministic but autonomous. Both axes are carried independently in the grading entry as the fields `determinism` and `gradingTier` (see [`08-grading-model.md`](/grading/grading-model/)).

| Axis | Values | Effect |
|------|--------|--------|
| Determinism | `deterministic` / `non-deterministic` | Reproducibility |
| Tier | `autonomous` / `group-bound` | Maximum attainable grade (Ch. 7) |

---

## Axis 1 — Determinism

### `deterministic`

A dimension is **deterministic** when the score is **reproducible** given:

- identical inputs, and
- identical `scoringSystem/X.Y.Z` version.

Examples: schema structure (v4.2 field-shape check), HTTP status, route-name match, imports scan, API-key-domain match, lint.

### `non-deterministic`

A dimension is **non-deterministic** when the output depends on:

- the LLM model used,
- the persona under which the evaluation runs, or
- the group context (selection composition).

For non-deterministic dimensions, the grading entry MUST record both `llmModel` and `selectionContext` (see [`08-grading-model.md`](/grading/grading-model/)).

### Mixed Forms

Some dimensions have **both deterministic and non-deterministic sub-parts**. The canonical example is the About Resource compliance: the route-exists check (is an About Resource declared and present?) is deterministic; the content judgement (is the About content meaningful?) is non-deterministic.

For mixed forms, implementers MAY:

- split the dimension into two sub-dimensions (one `deterministic`, one `non-deterministic`), or
- collapse it into a single dimension with `determinism = non-deterministic` (the strictly reproducible sub-part still runs, but the aggregate carries the weaker reproducibility claim).

---

## Deterministic Pretest — Test-Leiter (Working-Test Bar)

Before any non-deterministic (LLM) grading runs, a deterministic **data-pretest** executes every tool's declared tests live and counts the **working** ones. A working test is a downloadable primitive (`tool` / `resource`) that returns HTTP 200 **and** a non-empty payload; HTTP 4xx, `status:false`, or an empty payload is a FAIL — never a pass.

The working-test count per tool maps to a **Test-Leiter** rung. This is the deterministic readiness ladder that gates `deterministic-green`:

| Working tests / tool | Rung (`testDepth`) | Meaning |
|----------------------|--------------------|---------|
| 0 | `unavailable` | No working test — `blocked` (repairable). In practice does not occur (every tool declares ≥ 1 test). |
| 1 | `reachable` | Minimum, **INSUFFICIENT** for a parameterised tool — the deterministic test does NOT pass; its output schema cannot be validated against repeated evidence. **Exception:** a **parameterless** tool (no required parameter) reaches its pass bar already at rung 1 — see binding rule 5. |
| 2 | `schema-validatable` | **Pass bar — the deterministic test PASSES.** Two working responses make the output schema validatable; the schema is **deterministic-green**. |
| ≥ 3 | `data-analyzable` | Ideal gradient (a later wave). Not a second gate. |

**Binding rules:**

1. **The pass bar is `2` working tests per tool, applied per tool (not as a schema-file total).** A schema reaches `deterministic-green` only when **every** downloadable tool independently has ≥ 2 working tests. (MUST)
2. **The bar is binary at 2.** Reaching 3+ does not change the pass/fail decision; it only raises the `testDepth` rung from `schema-validatable` to `data-analyzable`. (MUST)
3. **A *parameterised* tool with exactly 1 working test is NOT `deterministic-green`, but is NOT `rejected`.** It is a repairable `blocked`/not-green state, resolved by adding a second working test — never a terminal rejection. (MUST) A *parameterless* tool with 1 working test **is** `deterministic-green` (rule 5).
4. **`testDepth` is its own deterministic dimension**, recorded on the tool node in the index rollup, and is **independent** of the LLM `outputSchemaMatch` dimension. The two are never conflated: `testDepth` measures *how many* working responses exist; `outputSchemaMatch` judges *whether* the declared output schema matches a response. (MUST)
5. **Parameterless tools reach the pass bar at `1`.** A tool that declares **no required parameter** has a single deterministic input shape; a second working test could only repeat the identical request and would add no schema-validation evidence. For such a tool the pass bar is **`1`** working test (MUST), not `2`. For every tool that declares at least one required parameter the pass bar remains `2` (MUST), and `3` is the SHOULD target for the `data-analyzable` rung. Whether a tool is parameterless is itself a deterministic property of the schema. (MUST)

> **Rationale.** A single working response cannot distinguish a correct output schema from a coincidentally-shaped one **when the parameter space has breadth** — so a parameterised tool needs two independent working responses as the minimum deterministic evidence that the declared output schema holds. A parameterless tool has no breadth to cover: one working response already exercises its only input shape. Raising coverage on a parameterised tool is **work** (add tests), not grounds for lowering the bar.

---

## Deterministic Response-Size Dimension

Beyond the working-test count, the data-pretest records the **size** of each working response. Size is a deterministic property of a recorded test response and contributes to grading via **threshold-booleans**, while the raw measurements are carried as metadata.

| Field | Kind | Definition |
|-------|------|------------|
| `responseBytes` | measurement metadatum | `Buffer.byteLength` of the serialised response payload (bytes, not characters). |
| `recordCount` | measurement metadatum | Number of top-level records in the response when array-shaped (else omitted). |
| `durationMs` | measurement metadatum | Wall-clock duration of the test request. |
| `large` | deterministic, grade-effective | `responseBytes > 1 MB` (`1 * 1024 * 1024`). |
| `extreme` | deterministic, grade-effective | `responseBytes > 10 MB` (`10 * 1024 * 1024`) — content-bloat signal. |

**Binding rules:**

1. `large` / `extreme` are **threshold-booleans** derived deterministically from `responseBytes`. `extreme` is **grade-effective**: an extreme response adds a deterministic fail on the `single-test` Area that downgrades the tool (content-bloat penalty). `large` is a **recorded warning flag** — surfaced, never silently dropped, but not an automatic fail (a within-threshold response adds no size grading, so it never dilutes the working-test bar). (MUST)
2. The raw measurements (`responseBytes`, `recordCount`, `durationMs`) are recorded as metadata and are **not** themselves a pass/fail gate. (MUST)
3. Thresholds are fixed at **1 MB** (`large`) and **10 MB** (`extreme`). A change is a `gradingSpec` bump. (MUST)

> **Rationale.** An extreme payload signals a tool that returns un-paginated bulk data — a deterministic, reproducible quality signal independent of any LLM judgement. The byte thresholds are stable across runs because they are computed from the recorded response, not re-fetched.

---

## Axis 2 — Tier

### `autonomous`

The dimension is graded by an **autonomous grader** on the provider side ([`04-phases-single.md`](/grading/phases-single/)) **without group context**. The maximum attainable grade for an aggregate composed exclusively of `autonomous` dimensions is **B**.

### `group-bound`

The dimension is graded by a **group- or persona-bound grader** on the selection side ([`05-phases-selection.md`](/grading/phases-selection/)). Grade **A** is reachable only when the aggregate contains at least one `group-bound` contribution.

### Consumer Visibility

The grading model ([`08-grading-model.md`](/grading/grading-model/)) exposes a `maxAttainableGrade` field. This field makes it visible to a consumer that — for a schema graded only on the provider side — a **higher grade is reachable** by adding the schema's namespace to a selection and running the selection-side Areas.

---

## Dimension–Area Matrix

The following table is the **non-exhaustive but canonical** mapping of grading dimensions to the two axes. Each row carries the dimension name, its determinism value, its tier, and the **Area** that writes it.

| Dimension | Determinism | Tier | Source (Area) |
|-----------|-------------|------|----------------|
| Schema structure (v4.2) | deterministic | autonomous | `tools-aggregate-schema` |
| HTTP status (200 = pass) | deterministic | autonomous | `single-test` |
| Response size `large` (> 1 MB) / `extreme` (> 10 MB) | deterministic (threshold-boolean) | autonomous | `single-test` |
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

## Binding Rules

The following four rules are **binding** for every grader, scorer, and aggregator that conforms to this spec.

1. **HTTP 4xx MUST NOT be treated as "auth-pass".** HTTP 4xx — including 401 and 403 — MUST NOT be scored as pass. **200 is pass; everything else is fail or defect.** (See [`04-phases-single.md`](/grading/phases-single/).)
2. **A schema MUST run all applicable deterministic tests.** Selective skipping is forbidden. If a deterministic test is applicable to a schema, the grader MUST execute it; the result MAY be `n/a` only when the test is provably non-applicable (e.g. a jq-pipe check on a schema without output).
3. **`aggregateGrade ≥ B` SHOULD contain at least one LLM-based (non-deterministic) evaluation.** A schema graded exclusively on deterministic dimensions can reach grade B, but the Grading-Spec recommends that at least one LLM verification be present at grade B and above.
4. **`aggregateGrade ≥ A` MUST contain at least one `group-bound` evaluation.** Grade A is **not autonomously reachable**. A schema graded only on the provider side (`tier = autonomous` throughout) cannot be assigned grade A.

---

## Interaction with Veto

The categorical Veto (see [`09-security-and-development.md`](/grading/security-and-development/)) can be raised on **either tier**. Veto-driven gates halt dependent Areas regardless of tier — see the cascade-stop rule in [`04-phases-single.md`](/grading/phases-single/) and the analogous rule in [`05-phases-selection.md`](/grading/phases-selection/).

A Veto is an outcome of its own; it does not reduce a numerical score, it replaces the aggregate grade with `REJECTED`. The index derivation maps `REJECTED` to the terminal node status `rejected` (see [`19-folder-layout.md`](/grading/folder-layout/)).

---

## Interaction with Scoring- / Grading-System Version

Determinism applies **at a fixed Scoring-System version**. A bump of the `scoringSystem/X.Y.Z` namespace can change how a deterministic test is scored — the test remains deterministic at the new version, but old scores cannot be compared one-to-one to new scores.

When `scoringSystem` is bumped, schemas MUST be re-scored. Cached scores from older versions MUST NOT be silently aggregated with new scores. The version contract is described in detail in [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/).

The same applies to `gradingSystem/X.Y.Z` bumps: thresholds, weights, tier trims, and the Veto list MAY change; the mapping from scores to grades is therefore version-bound.

---

## Tier Trim and Partial Grading

### Tier Trim (Recap)

`maxAttainableGrade` is a fixed mapping from `gradingTier` (see [Consumer Visibility](#consumer-visibility)). An autonomous grading can reach grade `B` at most; a group-bound grading can reach grade `A`. Tier trim is the deterministic final stage of the aggregate computation (see [`08-grading-model.md`](/grading/grading-model/)).

### Partial vs. Full Grading and the `stable` Status

A grading with `gradingMode: "partial"` updates only the explicitly checked Areas / dimensions in the grading set. The `aggregateGrade` **remains** at the value computed by the most recent `mode: "full"` operation. Promotion to the node status `stable` is possible only through a `mode: "full"` grading.

Rationale: partial gradings serve iteration steps (re-testing a single dimension on purpose). If they changed the aggregate, a single improvement step could distort the overall evaluation without the remaining dimensions having been re-checked.

| Mode | Allowed grading subset | Effect on `aggregateGrade` | Effect on node status |
|------|------------------------|----------------------------|------------------------|
| `full` | All applicable Areas / dimensions | Recomputed | May switch to `stable` |
| `partial` | A subset | **Unchanged** (stays at the last full value) | Stays at the last full status |

**`aggregateGrade` remains** is the binding statement: a partial grading MUST NOT overwrite the previous aggregate. A pure collection of partials without a concluding full grading never reaches the status `stable`.

### The Five Node Statuses

The node status of a graded primitive is one of **five** values, derived by the index rollup (see [`19-folder-layout.md`](/grading/folder-layout/)):

| Status | Meaning |
|--------|---------|
| `pending` | Not yet graded. |
| `blocked` | Cannot be graded right now, with a `reason` (`validation-failed`, fewer than 2 working tests, no About Resource, API unreachable) — repairable. |
| `graded` | A grade exists. |
| `stable` | Fully graded via a `mode: "full"` operation and above threshold — ready for use; only this status passes the selection pre-condition. |
| `rejected` | Veto raised — **terminal and irreversible**. |

The five status **values** are unchanged in `3.0.0`; only the `blocked` **reason** vocabulary is extended. `validation-failed` is a documented, repairable `blocked` reason: emit-on-failure (the `grading import` gate, see [`22-workbench-island.md`](/grading/workbench-island/)) produces a `blocked` node — **not** a `pending` node — when a folder's schemas cannot be parsed or validated. The full pinned reason set lives in [`23-index-json.md`](/grading/index-json/). A `blocked`/`validation-failed` node is a **status record**, not a grading entry (see [`08-grading-model.md`](/grading/grading-model/)).

The `partial`/`full` distinction (see [Partial vs. Full Grading and the `stable` Status](#partial-vs-full-grading-and-the-stable-status)) interacts directly with this status set: `partial` keeps the node at its last full status, only `full` can move a node to `stable`.

Cross-Refs:

- `gradingMode` as a top-level field → see [`08-grading-model.md`](/grading/grading-model/).
- Node status in the index rollup and the frozen member snapshot → see [`19-folder-layout.md`](/grading/folder-layout/).
- Iteration pattern → see [`18-flywheel-loop.md`](/grading/flywheel-loop/).
- Pre-condition effect (only `stable` members pass) → see [`21-pre-conditions.md`](/grading/pre-conditions/).

---

## Cross-References

- [`04-phases-single.md`](/grading/phases-single/) — provider-side Areas (the cascade-stop and HTTP-4xx rule live here as well).
- [`05-phases-selection.md`](/grading/phases-selection/) — selection-side Areas (the `group-bound` contributions enter here).
- [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/) — versioning contract for `scoringSystem` and `gradingSystem`.
- [`08-grading-model.md`](/grading/grading-model/) — defines `determinism`, `gradingTier`, and `maxAttainableGrade` as grading-entry fields.
- [`09-security-and-development.md`](/grading/security-and-development/) — security dimensions (external-module audit, API-key-domain match) listed in [Dimension–Area Matrix](#dimensionarea-matrix).

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/)
- **Related:** [`04-phases-single.md`](/grading/phases-single/), [`05-phases-selection.md`](/grading/phases-selection/), [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/), [`08-grading-model.md`](/grading/grading-model/), [`09-security-and-development.md`](/grading/security-and-development/), [`18-flywheel-loop.md`](/grading/flywheel-loop/), [`21-pre-conditions.md`](/grading/pre-conditions/)

