---
title: "Grading Model"
description: "This page defines the **grading entry** — the single durable artefact a grader emits and the one data model that both skill families (Single-Schema-Validator and Selection-Validator) write into. A..."
grading_version: "3.0.0"
spec_file: "08-grading-model.md"
order: 8
section: "Grading"
normative: true
source_commit: "42b4603"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/42b4603/grading/3.0.0/08-grading-model.md"
generated_at: "2026-06-21T01:06:21.418Z"
generated_from: "grading/3.0.0/08-grading-model.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/08-grading-model.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

This page defines the **grading entry** — the single durable artefact a grader emits and the one data model that both skill families (Single-Schema-Validator and Selection-Validator) write into. A grading is an array of per-question evaluations that carries veto power, a tier trim (autonomous max `B` / group max `A`), and can be re-triggered by the user; a present Categorical Veto overrides all aggregation and yields `aggregateGrade = REJECTED`. Every grading entry MUST validate against the JSON-Schema annex [`08-grading-model.schema.json`](./08-grading-model.schema.json).

---

## Status Record vs. Grading Entry (NEW in 3.0.0)

`3.0.0` introduces a second, **non-grading** artefact class: the **status record**. It is produced by the emit-on-failure import gate (see [`22-workbench-island.md`](/grading/workbench-island/)) and lives in `index.json` as a `blocked` node — it is **not** a grading entry.

1. **It is not a graded entry.** A `blocked`/`validation-failed` status record carries only `status` (always `blocked`) and `reason` (from the pinned reason set, see [`23-index-json.md`](/grading/index-json/)), plus the optional idempotency backrefs `githubIssue` / `boardColumn`. The grading-entry requirements — `gradings[]` with `minLength: 1` and a real `aggregateGrade` — **do NOT apply** to it. Concretely, the producing call (`createEntry` with `status: 'blocked'` + a closed-set `blockedReason`) yields an entry with top-level `blocked: true`, `blockedReason`, `gradings: []`, and `aggregateGrade: null` — it deliberately carries no scorable answers and no computed grade.

2. **It MUST NOT be consumed as a grade.** A status record MUST NOT be treated as a graded entry anywhere a grade is consumed (rollup aggregate, registry pages, selection member resolution, dashboards). A consumer that sees `status: blocked` reads the `reason`, not a grade.

3. **It never becomes `stable`.** A `blocked` node never advances to `stable` (consistent with [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) and the schema lifecycle gate in the Schemas-Spec §21). The selection pre-condition ([`21-pre-conditions.md`](/grading/pre-conditions/)) — "only `stable` members pass" — therefore remains correct without change: a member with a `validation-failed` status record fails the pre-condition.

The canonical `blockedReason` set — shared by the grading module and `index.json` — is:

```
"validation-failed" | "fewer-than-three-tests" | "fewer-than-two-tests" | "no-about" | "api-down" | "all-schemas-unparseable" | "not-imported"
```

This 7-value set is the **single source of truth** (also encoded in `index.schema.json` `$defs/blockedReason`). Earlier versions of this document listed only `"validation-failed"` as the grading-module subset (`Grading.VALID_BLOCKED_REASONS`) — that narrower list is superseded by this canonical set. A free-text `blockedReason` is rejected (`GRD-038` when `status != 'blocked'`, `GRD-039` when the reason is outside the closed set). The full pinned reason set including prose definitions is in [`23-index-json.md`](/grading/index-json/).

---

## Architecture Decision

> **One data model, two skill families.**
>
> There is **one shared data model** (see fields below) and **two skill families** (Single-Schema-Validator + Selection-Validator) that write different Areas into this one model. Advantage: anti-drift at the spec level, clear separation of applications at the implementation level.

This architecture decision is binding. Implementers MUST NOT split the data model into two distinct types per skill family — the `gradingTier` field is the consumer-visible switch, the family separation lives in the implementation.

---

## Data Model — Top-Level Fields

The grading entry is a JSON object with the following top-level fields. The column **Required** indicates MUST / SHOULD / OPTIONAL. The column **Conditional** captures the version-conditional rules.

| Field | Type | Required | Conditional | Description |
|-------|------|---------|-------------|-------------|
| `schemaId` | `string` | MUST | — | Identifier of the schema under grading. |
| `selectionId` | `string` | MUST when `gradingTier=group-bound` | If `group-bound`, REQUIRED; if `autonomous`, OPTIONAL | Identifier of the Selection under grading (when group-bound). |
| `gradingTier` | enum `autonomous` \| `group-bound` | MUST | — | Tier classification (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)). |
| `scoringSystem` | `string` matching `^scoringSystem/\d+\.\d+\.\d+$` | MUST | — | Scoring System version (see [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/)). |
| `gradingSystem` | `string` matching `^gradingSystem/\d+\.\d+\.\d+$` | MUST | — | Grading System version (see [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/)). |
| `area` | enum (see [Areas and Score Values](#areas-and-score-values)) | MUST | — | The Area this entry grades (`const` per entry). |
| `gradings` | `array` of answer entries | MUST | Minimum length 1 | The per-question answers for this Area (see [`gradings[]` Element](#data-model--gradings-element-per-question-answer)). |
| `harness` | enum `["claude-code"]` | MUST | — | The harness that drove the non-deterministic evaluation (see [Envelope Fields](#envelope-fields-new-in-200)). |
| `persona` | `object` `{ basePersonaId, lensId }` | MUST for persona-bound areas | Required for persona-bound Areas (see [Areas and Score Values](#areas-and-score-values)) | The persona lens (see [Envelope Fields](#envelope-fields-new-in-200), [`12-personas-contract.md`](/grading/personas-contract/)). |
| `skillId` | `string` | MUST for per-skill areas | Required for `namespace-skills` and `selection-skills-L1/L2/L3` | The graded skill instance (see [Envelope Fields](#envelope-fields-new-in-200)). |
| `categoricalVeto` | `object` \| `null` | MUST (default `null`) | When non-null, forces `aggregateGrade=REJECTED` | The Categorical Veto record (see [Categorical Veto](#categorical-veto)). |
| `regradingTrigger` | `object` | OPTIONAL | Present iff this entry is a re-grading | The re-grading trigger that produced this entry (see [Re-Grading Trigger](#re-grading-trigger)). |
| `aggregateGrade` | enum `A` \| `B` \| `C` \| `D` \| `F` \| `REJECTED` | MUST | `REJECTED` iff `categoricalVeto != null` | The aggregate grade after weighted aggregation and tier trim. |
| `maxAttainableGrade` | enum `A` \| `B` | MUST | Derived from `gradingTier` | The highest grade attainable at this tier (see [Tier Computation](#tier-computation--maxattainablegrade)). |

A grading entry MUST contain all MUST fields, conditional fields when their condition holds, and MAY contain OPTIONAL fields. `additionalProperties` is `false` (see [`08-grading-model.schema.json`](./08-grading-model.schema.json)).

### Mandatory Fields + Hash Placement (restructured in 2.0.0)

The grading entry binds a grading to the *concrete tested schema variant* and makes the partial vs. full mode explicit. The fields below live on the grading entry.

| Field | Format | Example | Definition |
|-------|--------|---------|------------|
| `schemaId` | `<namespace>.<tool>` | `etherscan.getContractEthereum` | identifier of the schema under grading |
| `version` | `flowmcp/4.\d+.\d+` | `flowmcp/4.0.0` | Spec version (FlowMCP), frozen on major 4 |
| `schemaHash` | sha256, 8 chars (hex) | `a1b2c3d4` | deterministic from canonical JSON (recorded here, derived) |
| `gradingId` | `<schemaHash>--<timestamp>` | `a1b2c3d4--2026-05-29T15-34Z` | unique grading instance |
| `gradingMode` | `"partial" \| "full"` | `"full"` | determines the `aggregateGrade` effect |
| `aboutHash` | sha256, 8 chars | `ef56gh78` | hash of the about page (recorded here, derived) |

**Hash placement (binding in 2.0.0).** `schemaHash` and `aboutHash` are **not** part of the source schema contract. The source schema is **neutral** — it carries only logical names and the FlowMCP `version` field. The hashes are derived from the canonical content and recorded in **two** derived places: the grading entry (above) and the namespace/selection `index.json`. They never live inside the source `.mjs`. Rationale: an in-source hash drifts on every edit, so the recorded value stops matching the content (see [`15-versioning-axes.md`](/grading/versioning-axes/)).

**Example source schema header (neutral — no hashes, no snapshot version):**

```javascript
export const schema = {
    version: 'flowmcp/4.0.0',
    namespace: 'etherscan',
    name: 'getContractEthereum'
}
```

**Example grading entry (excerpt):**

```json
{
  "gradingId": "a1b2c3d4--2026-05-29T15-34Z",
  "schemaId": "etherscan.getContractEthereum",
  "area": "single-test",
  "version": "flowmcp/4.0.0",
  "schemaHash": "a1b2c3d4",
  "gradingMode": "full",
  "aboutHash": "ef56gh78",
  "harness": "claude-code",
  "aggregateGrade": "B",
  "gradings": [ /* per-question answers */ ]
}
```

**Cross-Refs:**

- `schemaHash` / `aboutHash` → canonical representation + placement in [`15-versioning-axes.md`](/grading/versioning-axes/), and the binding `index.json.lockSnapshot` in [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- `gradingMode` → see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) (tier trim) + [`18-flywheel-loop.md`](/grading/flywheel-loop/) (flywheel)
- `gradingId` → see [`19-folder-layout.md`](/grading/folder-layout/) (naming convention)

### Envelope Fields (NEW in 2.0.0)

The grading envelope carries three additional fields that describe *how* and *under which lens* a grading was produced.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `harness` | enum `["claude-code"]` | MUST | The harness that drove the non-deterministic evaluation. Currently the only allowed value is `claude-code` (sub-agent with a fresh, empty context, read-only tools, single pass, strict JSON). |
| `persona` | `object` `{ basePersonaId, lensId }` | MUST for persona-bound areas | The persona under which a non-deterministic area was scored. `basePersonaId` ∈ `ai-engineer` \| `decision-maker` \| `hackathon-builder` \| `schema-maintainer`; `lensId` is the domain lens. See [`12-personas-contract.md`](/grading/personas-contract/). |
| `skillId` | `string` | MUST for per-skill areas | Identifier of the graded skill instance (per-skill areas grade one skill at a time, not a level cohort — see [`13-skills.md`](/grading/skills/)). |

`harness` makes the grading reproducible across drivers; `persona` records the lens; `skillId` distinguishes per-skill area instances. The deterministic answers come from code and are merged with the harness sub-agent answers into one grading entry.

---

## Data Model — `gradings[]` Element (per-question answer)

Each element of the `gradings[]` array is a JSON object describing **one answer** to **one question** of the Area, scored by **one grader** at **one timestamp**. The element fields are:

| Field | Type | Required | Conditional | Description |
|-------|------|---------|-------------|-------------|
| `questionId` | `string` matching `^Q-.+` | MUST | — | Identifier of the Area question being answered. |
| `score` | `number` `1.0`–`5.0` OR enum `pass` \| `fail` \| `stale` \| `n/a` | MUST | See [Score Values](#score-values) | The score value. |
| `weight` | `number` | MUST | — | Weight contributed to the weighted aggregation. |
| `determinism` | enum `deterministic` \| `non-deterministic` | MUST | — | Whether the answer is reproducible at the same `scoringSystem` version. |
| `graderIdentity` | `object` (`kind`, `name`, `version`) | MUST | — | Identity of the grader; `kind` ∈ `llm` \| `human` \| `script`. |
| `llmModel` | `string` | MUST when `graderIdentity.kind=llm` | — | Identifier of the LLM model used (e.g. `claude-opus-4-7`). |
| `selectionContext` | `object` (`groupId`, `personaIds[]`, `domainDocId`) | MUST when `determinism=non-deterministic` | When the answer is non-deterministic, at least one persona is REQUIRED (see [Personas Obligation](#personas-obligation)) | The group / persona / domain context under which the answer was produced. |
| `timestamp` | `string` (ISO-8601) | MUST | — | Time of scoring. |
| `evidence` | `object` or `url` | SHOULD | — | Pointer to the underlying test evidence (HTTP response, LLM transcript, lint output, etc.). |
| `reasoning` | `string` | SHOULD | — | Human-readable rationale (especially for non-deterministic answers). |
| `naReason` | enum (see [n/a Convention with Standard Reasons](#na-convention-with-standard-reasons-new-in-110)) | MUST when `score = n/a` | — | Closed-set reason for a non-applicable answer. |

`previousGradingId` is NOT a field on the `gradings[]` element; it lives on the top-level `regradingTrigger` object (see [Re-Grading Trigger](#re-grading-trigger)).

---

## Areas and Score Values

### The 11 Grading Areas

As of `gradingSpec/3.0.0`, a grading targets exactly one **Area**. The `area` field is a `const` per grading entry. There are **11 Areas**, split between provider (namespace) grading and selection grading. Each Area carries its own question set; the per-question answers live in the `gradings[]` array (see [`gradings[]` Element](#data-model--gradings-element-per-question-answer)). The detailed question definitions and output schemas are specified in the per-Area chapters and the Area output schemas.

| # | Area | Grades | Persona-bound | Det / Non-det |
|---|------|--------|---------------|---------------|
| 1 | `single-test` | one tool | no | deterministic gate + non-det |
| 2 | `tools-aggregate-schema` | tools collection (schema-wide) | no | both |
| 3 | `tools-aggregate-namespace` | tools across the namespace | no | both |
| 4 | `namespace-description` | namespace metadata | no | non-det |
| 5 | `namespace-skills` | one namespace skill | yes | non-det |
| 6 | `about-namespace` | About resource (in one schema) | yes | deterministic (route-exists) + non-det |
| 7 | `about-selection` | About of the selection (= domain knowledge) | yes | deterministic + non-det |
| 8 | `selection-skills-L1` | one L1 skill (per skill) | yes | non-det |
| 9 | `selection-skills-L2` | one L2 skill (per skill) | yes | non-det |
| 10 | `selection-skills-L3` | one L3 skill (per skill) | yes | non-det |
| 11 | `selection-aggregate` | the selection as a whole | yes | deterministic + non-det |

A grading entry that uses an `area` value not listed here is INVALID. Adding a new Area is a `gradingSystem` bump (see [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/)).

Areas 1–6 are **provider** areas (tier `autonomous`, max Grade B, rollup in `providers/<ns>/index.json`). Areas 7–11 are **selection** areas (tier `group-bound`, Grade A attainable, rollup in `selections/<sel>/index.json`). The two blocks are disjoint — a provider schema is not evaluated over the selection areas, and a selection is not evaluated over the provider areas. See [`19-folder-layout.md`](/grading/folder-layout/) for the `_gradings/` location per Area.

#### The selection-aggregate Area (Area 11)

`selection-aggregate` carries the selection-wide checks: thresholds (soft ≥ 5 / hard ≥ 7 members), topic coherence, `domainConformance` (members checked against the About / domain knowledge), `personaUseCaseFit`, the group-bound tier path to Grade A, and the cascade stop. Per-skill areas (8/9/10) grade one skill at a time and carry `skillId` in the envelope; there is no level-cohort grade.

#### Answers per Area

Each Area defines how many answers its grading entry must carry, split into a deterministic block (computed by code) and a non-deterministic block (produced by the harness sub-agent). A deterministic block alone is not a valid Area grading — the two blocks are merged into one entry. The per-Area answer counts and question sets are normative in the Area output schemas.

#### The single-test deterministic gate — testDepth (Test-Leiter)

The `single-test` Area (Area 1) opens with a **deterministic gate**: the data-pretest counts the working tests per tool and assigns the Test-Leiter rung (see [`06-determinism-and-tier.md` — Deterministic Pretest](/grading/determinism-and-tier/#deterministic-pretest--test-leiter-working-test-bar)). The gate's pass bar is **2 working tests per tool**; a schema is `deterministic-green` only when every downloadable tool clears it.

The rung is surfaced as the deterministic dimension **`testDepth`** (`unavailable` / `reachable` / `schema-validatable` / `data-analyzable`), recorded on the tool node in `index.json`. `testDepth` is **independent** of the non-deterministic `outputSchemaMatch` dimension and MUST NOT be folded into it: `testDepth` measures *how many* working responses exist (deterministic count), while `outputSchemaMatch` judges *whether* the declared output schema matches a response (LLM judgement). A tool at `reachable` (1 working test) is not green but is repairable — never `rejected`.

### Score Values

The `score` field is one of:

- a `number` in `[1.0, 5.0]` (numeric score), OR
- the enum string `pass` / `fail` / `stale` / `n/a`.

Mixing the two domains (e.g. `score = "3.0"`) is INVALID. The `pass` / `fail` enum is reserved for deterministic answers with a binary outcome (HTTP `200` is `pass`, anything else is `fail` — see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) rule 1). The `stale` enum is reserved for aged-out time-dependent answers (see [Timeline Rule + Aging](#timeline-rule--aging)). The `n/a` enum is reserved for non-applicable answers (see [`n/a` Pragma](#na-pragma)).

### n/a Convention with Standard Reasons (NEW in 1.1.0)

An answer entry with `gradings[i].score === "n/a"` is only permitted when `gradings[i].naReason` carries a value from the following **closed set**:

| naReason | Meaning |
|----------|---------|
| `not-applicable-to-tool-type` | Dimension structurally does not apply to this tool type |
| `requires-private-data` | The check would require a private / non-public data source |
| `blocked-by-precondition` | Pre-condition not met (e.g. member schema not stable) |
| `out-of-scope-resource` | Relates to Resources (out-of-scope, on-hold per [`n/a` Pragma](#na-pragma)) |
| `out-of-scope-prompt` | Relates to Prompts (out-of-scope, on-hold per [`n/a` Pragma](#na-pragma)) |
| `out-of-scope-procedure` | Relates to Procedures (out-of-scope, on-hold per [`n/a` Pragma](#na-pragma)) |

Free-text reasons are rejected by the schema validator (`NA-001 ERROR`). Additional reason values can only be added through a spec bump.

Reference implementation: [`src/NaReason.mjs`](../../src/NaReason.mjs) (closed-set static validator, `NA-001` error code in [`ErrorCodes.mjs`](../../src/ErrorCodes.mjs)). Pre-existing gradings without `naReason` are migrated by setting `naReason = "not-applicable-to-tool-type"`.

JSON-Schema fragment for `gradings[i]`:

```json
{
  "score": { "oneOf": [ { "type": "number", "minimum": 1.0, "maximum": 5.0 }, { "enum": [ "pass", "fail", "stale", "n/a" ] } ] },
  "naReason": {
    "type": "string",
    "enum": [
      "not-applicable-to-tool-type",
      "requires-private-data",
      "blocked-by-precondition",
      "out-of-scope-resource",
      "out-of-scope-prompt",
      "out-of-scope-procedure"
    ]
  }
}
```

---

## Categorical Veto

The `categoricalVeto` field is either `null` (no veto) or an object describing a veto that was raised by a grader. The Veto is a **closed list** at this spec version; the four allowed triggers are enumerated below.

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `triggeredBy` | enum (see below) | MUST | The veto trigger name. |
| `graderIdentity` | `object` (`kind`, `name`, `version`) | MUST | Identity of the grader who raised the veto. |
| `evidence` | `string` or `url` | MUST | Pointer to the evidence behind the veto. |
| `timestamp` | `string` (ISO-8601) | MUST | Time of veto. |

The `triggeredBy` enum is **closed**. The four allowed values are:

1. `malicious-module` — an imported module exhibits behaviour outside the tool's stated purpose (tracker, telemetry without user knowledge, malware). Deterministic part: imports scan. Non-deterministic part: behaviour judgement. See [`09-security-and-development.md`](/grading/security-and-development/).
2. `api-key-domain-mismatch` — a `requiredServerParams` entry declares a key name that belongs to a different domain or company than the API itself (e.g. `FACEBOOK_API_KEY` for `example.xyz`). Deterministic. See [`09-security-and-development.md`](/grading/security-and-development/).
3. `illegal-content` — the schema, its output, or its purpose involves illegal content. Non-deterministic. See [`09-security-and-development.md`](/grading/security-and-development/).
4. `ai-security-veto` — the grader sees a security finding that is not on the closed deterministic list but is well-evidenced and well-reasoned. Non-deterministic; REQUIRES `evidence` AND `reasoning`. See [`09-security-and-development.md`](/grading/security-and-development/).

Implementers MUST NOT extend the `triggeredBy` enum at runtime. Adding a new trigger is a `gradingSystem` bump.

When `categoricalVeto != null`, `aggregateGrade = REJECTED` (no aggregation is performed over `gradings[]`).

---

## Skill Families (Binding)

The implementation separates the writers of `gradings[]` entries into **two skill families** — both write into the same data model but cover different tiers:

| Family | Repository | Writes | Yields |
|--------|-----------|--------|--------|
| Single-Schema-Validator | `flowmcp-grading` | Provider Areas 1–6 (see [`04-phases-single.md`](/grading/phases-single/)) | `gradingTier = autonomous` |
| Selection-Validator | `flowmcp-grading` | Consumes provider grading entries plus selection Areas 7–11 (see [`05-phases-selection.md`](/grading/phases-selection/)); writes the `group-bound` Areas | `gradingTier = group-bound` |

A grading entry MUST be written by **exactly one** of the two families. A Selection-Validator entry MAY reference the Single-Schema-Validator entries it consumed via `selectionContext.domainDocId` and the surrounding aggregator's bookkeeping; the spec does NOT require an explicit cross-link.

---

## Tier Computation + `maxAttainableGrade`

`maxAttainableGrade` is derived from `gradingTier` by a fixed mapping:

| `gradingTier` | `maxAttainableGrade` |
|---------------|----------------------|
| `autonomous` | `B` |
| `group-bound` | `A` |

The mapping is binding. Implementers MUST emit `maxAttainableGrade` even though it is mechanically derived from `gradingTier`; consumers of grading entries (UIs, dashboards, registry pages) rely on the field being present so that they can communicate to the consumer that **a higher grade is attainable** by attaching the schema's namespace to a Selection and running the Selection phases. See [`06-determinism-and-tier.md`](/grading/determinism-and-tier/).

---

## Timeline Rule + Aging

Dimensions fall into two classes by their relationship to time:

| Class | Examples | Aging |
|-------|----------|-------|
| Time-**independent** | `descriptionNeutrality`, `formattingCompliance`, `outputSchemaConformance`, schema-structure validation | No aging. `timestamp` is required for audit purposes only. |
| Time-**dependent** | `apiAvailability`, `tosMatch`, `legalAssessment` | An aging threshold MUST be tracked; once the threshold is exceeded, the dimension's score MUST become `stale`. |

Aging defaults — referenced throughout the codebase as the constant `#AGING_DEFAULTS` — are:

| Aging key | Default | Applies to |
|-----------|---------|------------|
| `API_DAYS` | **14 days** | `apiAvailability` |
| `TOS_DAYS` | **30 days** | `tosMatch`, `legalAssessment` |
| `RETENTION_DAYS` | **180 days** | Total grading-entry retention before archival |

**Binding rule.** Aging produces `score = stale`, **not** `score = fail`. The two outcomes are semantically distinct: `fail` is an active negative judgement; `stale` is an absence of a recent positive judgement. Aggregation logic MUST treat `stale` differently from `fail` (see [Multi-Grader Rule](#multi-grader-rule)).

The defaults are explicit per the no-hidden-defaults rule — implementers MUST NOT silently substitute alternative aging windows. Overrides MAY be configured per group but MUST be recorded in the Domain-Knowledge document (see [`10-domain-knowledge.md`](/grading/domain-knowledge/)).

---

## Multi-Grader Rule

Multiple graders MAY independently answer the same question. The data model **does NOT automatically consolidate** these multi-grader entries. Each entry stands on its own under its own `graderIdentity` and `timestamp`. Aggregation logic at the level of `aggregateGrade` SHOULD pick the most recent valid entry per question; tie-breaking and disagreement-handling rules are out of scope for `gradingSystem/1.0.0` and are tracked as a follow-up.

---

## Re-Grading Trigger

A user, an aging job, or a version bump CAN trigger a re-grading. The `regradingTrigger` field records the trigger; the **old grading entry is NOT deleted** — the new entry references the old via `previousGradingId`.

The `regradingTrigger` object has these fields:

| Field | Type | Required | Conditional | Description |
|-------|------|---------|-------------|-------------|
| `triggeredBy` | enum (see below) | MUST | — | The re-grading trigger name. |
| `reportedIssue` | `string` | MUST when `triggeredBy=user-report` | — | The free-text issue description supplied by the user. |
| `requestedBy` | `string` | MUST when `triggeredBy=user-report` | — | Identifier of the user who requested the re-grading. |
| `previousGradingId` | `string` | MUST | — | Identifier of the grading entry being superseded. |
| `timestamp` | `string` (ISO-8601) | MUST | — | Time of re-grading. |

The `triggeredBy` enum has four values:

1. `user-report` — a user reported a tool as "no longer working" via the CLI or issue template.
2. `scheduled` — a scheduled re-grading run (e.g. monthly).
3. `scoring-system-bump` — the `scoringSystem` version was bumped (see [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/)); affected dimensions are re-scored.
4. `grading-system-bump` — the `gradingSystem` version was bumped; affected dimensions are re-aggregated.

The grader reads `reportedIssue` (when present) and prioritises the re-evaluation of the Area questions implicated by the report. Implementers MUST NOT delete or overwrite the superseded grading entry. The lineage is preserved through `previousGradingId`.

---

## `n/a` Pragma

> *"Any grading > no grading."*

The spec does NOT require an answer to every Area question with a numeric score. It requires an **honest** `gradings[]` array: questions that were not actually tested MUST be recorded with `score = n/a`. The Anti-Pattern — and it is explicitly forbidden — is to **invent entries** instead of writing `n/a`. A grader that does not have evidence for a question MUST emit `n/a` rather than fabricate a score.

Aggregation logic at the level of `aggregateGrade` MUST treat `n/a` as **excluded from the weighted sum**: the entry contributes neither to the numerator nor to the denominator. Implementers MUST NOT silently substitute `n/a` with `0`, `1.0`, or any other numeric value. No-silent-defaults is the binding interpretation of this rule.

---

## Personas Obligation

Non-deterministic entries (`determinism = non-deterministic`) MUST carry at least one `personaId` in `selectionContext.personaIds[]`. A non-deterministic entry without persona context is INVALID; the JSON-Schema annex enforces this via a conditional `if/then` (see [`08-grading-model.schema.json`](./08-grading-model.schema.json)).

The Personas contract — including the Lens concept and the source of the four generalised personas — is defined in [`12-personas-contract.md`](/grading/personas-contract/).

Error-code names for the personas obligation are:

- `GRD-005` — non-deterministic entry missing `personaIds[]`.
- `VET-003` — Categorical Veto entry missing required `evidence` or `reasoning` when `triggeredBy = ai-security-veto`.

The full error-code catalogue is delivered in a later stage.

---

## Aggregate-Grade Computation

The `aggregateGrade` is computed by the following rules.

1. **Veto short-circuit.** If `categoricalVeto != null`, then `aggregateGrade = REJECTED`. No aggregation runs.
2. **Weighted sum.** Otherwise, the grader computes a weighted average over all `gradings[]` entries whose `score` is a number, ignoring entries with `score ∈ { n/a }`. Entries with `score ∈ { pass, fail, stale }` are mapped to numbers by the Grading System version (`pass → 5.0`, `fail → 1.0`, `stale → omitted from numerator and denominator unless the Grading System version specifies otherwise`).
3. **Tier trim.** The weighted average is mapped to a grade letter `A`/`B`/`C`/`D`/`F` by thresholds defined at the `gradingSystem` version. The result is then **trimmed** by `maxAttainableGrade`: an `autonomous` entry capped at `B` cannot emit `A`.
4. **Minimum LLM rule.** For `aggregateGrade >= B`, at least one non-deterministic (LLM) entry SHOULD be present (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) rule 3).
5. **Group-bound rule for `A`.** For `aggregateGrade >= A`, at least one `group-bound` entry MUST be present (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) rule 4). A purely autonomous grading cannot yield `A`.

The concrete threshold values, weights per question, and `stale`-handling policy are NOT part of this spec chapter — they live in the `gradingSystem/1.0.0` implementation. The above five rules are the binding contract.

---

## Examples

### Autonomous Grading (`single-test`, three answers)

```json
{
    "gradingId": "a1b2c3d4--2026-05-29T15-34Z",
    "schemaId": "etherscan.getBalance",
    "area": "single-test",
    "version": "flowmcp/4.0.0",
    "schemaHash": "a1b2c3d4",
    "gradingMode": "full",
    "gradingTier": "autonomous",
    "harness": "claude-code",
    "persona": { "basePersonaId": "decision-maker", "lensId": "crypto" },
    "scoringSystem": "scoringSystem/1.0.0",
    "gradingSystem": "gradingSystem/1.0.0",
    "gradings": [
        {
            "questionId": "Q-api-availability",
            "score": "pass",
            "weight": 1.0,
            "determinism": "deterministic",
            "graderIdentity": { "kind": "script", "name": "single-schema-validator", "version": "0.1.0" },
            "timestamp": "2026-05-29T10:00:00Z",
            "evidence": "https://example.org/proofs/etherscan-getBalance/2026-05-29.txt"
        },
        {
            "questionId": "Q-description-neutrality",
            "score": 4.5,
            "weight": 1.0,
            "determinism": "deterministic",
            "graderIdentity": { "kind": "script", "name": "single-schema-validator", "version": "0.1.0" },
            "timestamp": "2026-05-29T10:00:00Z"
        },
        {
            "questionId": "Q-when-to-use",
            "score": 4.0,
            "weight": 1.0,
            "determinism": "non-deterministic",
            "graderIdentity": { "kind": "llm", "name": "claude-opus-4-7", "version": "1m" },
            "llmModel": "claude-opus-4-7",
            "selectionContext": {
                "groupId": "crypto",
                "personaIds": ["decision-maker"],
                "domainDocId": "crypto-1.0.0"
            },
            "timestamp": "2026-05-29T10:00:00Z",
            "reasoning": "Clear, unambiguous trigger sentence; covers the canonical balance-lookup use case."
        }
    ],
    "categoricalVeto": null,
    "aggregateGrade": "B",
    "maxAttainableGrade": "B"
}
```

### Rejected (Categorical Veto)

```json
{
    "gradingId": "deadbeef--2026-05-29T10-00-00Z",
    "schemaId": "example.maliciousAdapter",
    "area": "single-test",
    "version": "flowmcp/4.0.0",
    "schemaHash": "deadbeef",
    "gradingMode": "full",
    "gradingTier": "autonomous",
    "harness": "claude-code",
    "scoringSystem": "scoringSystem/1.0.0",
    "gradingSystem": "gradingSystem/1.0.0",
    "gradings": [
        {
            "questionId": "Q-security",
            "score": "fail",
            "weight": 1.0,
            "determinism": "deterministic",
            "graderIdentity": { "kind": "script", "name": "imports-scanner", "version": "0.1.0" },
            "timestamp": "2026-05-29T10:00:00Z",
            "evidence": "https://example.org/proofs/imports-scan.txt"
        }
    ],
    "categoricalVeto": {
        "triggeredBy": "api-key-domain-mismatch",
        "graderIdentity": { "kind": "script", "name": "api-key-domain-checker", "version": "0.1.0" },
        "evidence": "schema declares FACEBOOK_API_KEY for example.xyz",
        "timestamp": "2026-05-29T10:00:00Z"
    },
    "aggregateGrade": "REJECTED",
    "maxAttainableGrade": "B"
}
```

Both example documents validate against [`08-grading-model.schema.json`](./08-grading-model.schema.json).

---

## Annex — JSON-Schema

The normative JSON-Schema for the grading entry is [`08-grading-model.schema.json`](./08-grading-model.schema.json) (JSON-Schema 2020-12). Every grading entry emitted by a grader MUST validate against this schema. The schema mirrors the conditional rules (e.g. `selectionId` required when `gradingTier=group-bound`, `llmModel` required when `graderIdentity.kind=llm`, `personaIds[]` required when `determinism=non-deterministic`, `harness` constrained to `claude-code`) via JSON-Schema `if/then` blocks. Validation uses `Ajv2020` plus `ajv-formats` (the draft-2020-12 build), not the default Ajv build.

### Smoke-Test (Pseudo-code)

```javascript
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const schema = JSON.parse( readFileSync( 'grading/3.0.0/08-grading-model.schema.json', 'utf8' ) )
const valid = JSON.parse( readFileSync( 'grading/3.0.0/examples/grading-autonomous.json', 'utf8' ) )
const rejected = JSON.parse( readFileSync( 'grading/3.0.0/examples/grading-rejected.json', 'utf8' ) )

const ajv = new Ajv2020( { strict: true, allErrors: true } )
addFormats( ajv )
const validate = ajv.compile( schema )

const okValid = validate( valid )
const okRejected = validate( rejected )

if( !okValid ) { throw new Error( 'autonomous example invalid: ' + JSON.stringify( validate.errors ) ) }
if( !okRejected ) { throw new Error( 'rejected example invalid: ' + JSON.stringify( validate.errors ) ) }
if( rejected.aggregateGrade !== 'REJECTED' ) { throw new Error( 'rejected example must aggregate to REJECTED' ) }
```

## Related

- [`00-overview.md`](/grading/overview/)
- [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)
- [`07-scoring-vs-grading.md`](/grading/scoring-vs-grading/)
- [`09-security-and-development.md`](/grading/security-and-development/)
- [`10-domain-knowledge.md`](/grading/domain-knowledge/)
- [`12-personas-contract.md`](/grading/personas-contract/)
- [`13-skills.md`](/grading/skills/)
- [`15-versioning-axes.md`](/grading/versioning-axes/)
- [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- [`19-folder-layout.md`](/grading/folder-layout/)
- [`22-workbench-island.md`](/grading/workbench-island/)
- [`23-index-json.md`](/grading/index-json/)
- [`08-grading-model.schema.json`](./08-grading-model.schema.json)

