---
title: "The `selection-aggregate` Area (11th area)"
description: "Grading is organised into **areas** — one rubric per primitive type. Ten areas already exist with output schemas under `prompts/output-schemas/`: `single-test`, `tools-aggregate-schema`,..."
grading_version: "2.0.0"
spec_file: "24-selection-aggregate.md"
order: 24
section: "Grading"
normative: true
source_commit: "2d44cb7"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2d44cb7/grading/2.0.0/24-selection-aggregate.md"
generated_at: "2026-05-31T17:29:02.778Z"
generated_from: "grading/2.0.0/24-selection-aggregate.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/24-selection-aggregate.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`05-phases-selection.md`](./05-phases-selection.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`10-domain-knowledge.md`](./10-domain-knowledge.md), [`11-about-convention.md`](./11-about-convention.md), [`12-personas-contract.md`](./12-personas-contract.md), [`13-skills.md`](./13-skills.md), [`23-index-json.md`](./23-index-json.md), [`25-harness-and-goal.md`](./25-harness-and-goal.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md).

---

## 1. Why this area exists

Grading is organised into **areas** — one rubric per primitive type. Ten areas already exist with output schemas under `prompts/output-schemas/`: `single-test`, `tools-aggregate-schema`, `tools-aggregate-namespace`, `namespace-description`, `namespace-skills`, `about-namespace`, `about-selection`, `selection-skills-L1`, `selection-skills-L2`, `selection-skills-L3`. The **eleventh** area, `selection-aggregate`, is the one missing piece: it grades **the selection as a whole**.

The selection-wide dimensions — thresholds, topic coherence, member-against-about conformance, persona use-case fit, the group-bound tier path — have no per-skill or per-about home. Without `selection-aggregate` there is no gate for Grade A. This area MUST exist; its output schema, template, and skill triad MUST be built (the other ten already exist).

The area's gradings are stored at `selections/<selection>/_gradings/` (the selection-level `_gradings/` folder).

---

## 2. Carried Dimensions

`selection-aggregate` carries the selection-wide dimensions:

| Dimension | Meaning |
|-----------|---------|
| **Thresholds** | soft `>= 5` member namespaces (a group; Grade A not regular), hard `>= 7` (Grade A regularly attainable). Fewer than 5 → no selection phases (`n/a`); 5–6 → no Grade A. |
| **Topic coherence** | The members form a coherent topic, not an arbitrary bag. |
| **`domainConformance`** | The members are checked **against** the About / Domain-Knowledge. This is distinct from `about-selection`, which checks the document's own quality. Document quality is not the same as member conformance — two checks, no circularity. |
| **`personaUseCaseFit`** | The selection fits the declared personas' use cases. |
| **Group-bound tier** | This is the area that opens the path to **Grade A** (`gradingTier = group-bound`). Provider-level grading alone caps at Grade B. |
| **Cascade-stop** | The aggregate stops the cascade when a hard precondition fails (e.g. members below threshold), rather than producing a misleading partial grade. |

---

## 3. Output Schema

The output of every area shares a common **envelope** (from `_master.schema.json` plus the area-specific part) and a list of `answers[]`. The `selection-aggregate` output conforms to that envelope.

### 3.1 Envelope (shared)

| Field | Value |
|-------|-------|
| `gradingId` | unique grading identifier |
| `schemaHash` | hash binding of the graded artifact |
| `area` | const `"selection-aggregate"` |
| `iteration` | 1–5 |
| `timestamp` | island timestamp grammar |
| `persona` | `{ basePersonaId ∈ [ai-engineer, decision-maker, hackathon-builder, schema-maintainer], lensId }` |
| `answers[]` | the area answers (see below) |
| `improvementHints[]` | actionable hints for the improve loop |
| `harness` | enum `["claude-code"]` |

Each `answer` has: `questionId` (`^Q-…`), `score` (1–5 **or** `pass`/`fail`/`stale`/`n/a`), `reasoning`, optional `evidence`, and `naReason` (required when `score` is `n/a`).

### 3.2 Area-specific answers

`selection-aggregate` carries one answer per carried dimension above (deterministic where decidable — e.g. the threshold count — non-deterministic where it requires judgment — e.g. topic coherence, persona fit). The deterministic threshold answer and the non-deterministic judgment answers are **merged** into the single area output; a deterministic-only result is not a valid area grading.

Validation uses draft 2020-12 (`Ajv2020` + `ajv-formats`); `_master` is added once via `addSchema`.

---

## 4. Template

The prompt template for `selection-aggregate` follows the same contract as the other ten areas' templates: it states the area, injects the resolved member-resolution manifest (from [`index.json`](./23-index-json.md)), the About / Domain-Knowledge, the declared personas, and the threshold counts, then asks one question per carried dimension. The template MUST include the Goal-Block and the surfacing convention (see [`25-harness-and-goal.md`](./25-harness-and-goal.md)).

---

## 5. Skill Triad

Like every area, `selection-aggregate` is backed by a skill triad — the three-skill contract (`start-grade` → `evaluate` → `apply-improvement`) that the harness runs as the inner micro-loop. The triad reads the frozen `lockSnapshot` and the member-resolution manifest, evaluates the carried dimensions, and emits `improvementHints[]` when the selection falls short. The triad MUST be built for this area (the other ten already have theirs).

---

## 6. Relationship to the index rollup

`selection-aggregate` is the node `selectionAggregate` in the selection's [`index.json`](./23-index-json.md). Its status follows the 5-status node enum; reaching `stable` here (with the hard threshold met and a group-bound evaluation present) is what allows the selection rollup to reach Grade A.

---

## Cross-References

- Selection phases and thresholds: [`05-phases-selection.md`](./05-phases-selection.md)
- Domain knowledge / About distinction: [`10-domain-knowledge.md`](./10-domain-knowledge.md), [`11-about-convention.md`](./11-about-convention.md)
- Member resolution manifest: [`23-index-json.md`](./23-index-json.md)
- Harness, Goal-Block, surfacing convention: [`25-harness-and-goal.md`](./25-harness-and-goal.md)
