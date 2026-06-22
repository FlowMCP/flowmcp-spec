---
title: "The `selection-aggregate` Area"
description: "`selection-aggregate` is the eleventh grading area, and the one that grades a selection as a whole rather than any single primitive within it. It carries the selection-wide dimensions — thresholds,..."
grading_version: "3.0.0"
spec_file: "24-selection-aggregate.md"
order: 24
section: "Grading"
normative: true
source_commit: "95ebb83"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/95ebb83/grading/3.0.0/24-selection-aggregate.md"
generated_at: "2026-06-22T15:23:11.485Z"
generated_from: "grading/3.0.0/24-selection-aggregate.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/24-selection-aggregate.md."
---

`selection-aggregate` is the eleventh grading area, and the one that grades a selection as a whole rather than any single primitive within it. It carries the selection-wide dimensions — thresholds, topic coherence, member-against-About conformance, persona fit, and the group-bound tier — that have no per-skill or per-About home. Without it there is no gate for Grade A, which is why this area, its output schema, template, and skill triad MUST exist alongside the ten areas already in place.


## Why this area exists

Grading is organised into **areas** — one rubric per primitive type. Ten areas already exist with output schemas under `prompts/output-schemas/`: `single-test`, `tools-aggregate-schema`, `tools-aggregate-namespace`, `namespace-description`, `namespace-skills`, `about-namespace`, `about-selection`, `selection-skills-L1`, `selection-skills-L2`, `selection-skills-L3`. The **eleventh** area, `selection-aggregate`, is the one missing piece: it grades **the selection as a whole**.

The selection-wide dimensions — thresholds, topic coherence, member-against-about conformance, persona use-case fit, the group-bound tier path — have no per-skill or per-about home. Without `selection-aggregate` there is no gate for Grade A. This area MUST exist; its output schema, template, and skill triad MUST be built (the other ten already exist).

The area's gradings are stored at `selections/<selection>/_gradings/` (the selection-level `_gradings/` folder).

## Carried Dimensions

`selection-aggregate` carries the selection-wide dimensions:

| Dimension | Meaning |
|-----------|---------|
| **Thresholds** | soft `>= 5` member namespaces (a group; Grade A not regular), hard `>= 7` (Grade A regularly attainable). Fewer than 5 → no selection phases (`n/a`); 5–6 → no Grade A. |
| **Topic coherence** | The members form a coherent topic, not an arbitrary bag. |
| **`domainConformance`** | The members are checked **against** the About / Domain-Knowledge. This is distinct from `about-selection`, which checks the document's own quality. Document quality is not the same as member conformance — two checks, no circularity. |
| **`personaUseCaseFit`** | The selection fits the declared personas' use cases. |
| **Group-bound tier** | This is the area that opens the path to **Grade A** (`gradingTier = group-bound`). Provider-level grading alone caps at Grade B. |
| **Cascade-stop** | The aggregate stops the cascade when a hard precondition fails (e.g. members below threshold), rather than producing a misleading partial grade. |

## Output Schema

The output of every area shares a common **envelope** (from `_master.schema.json` plus the area-specific part) and a list of `answers[]`. The `selection-aggregate` output conforms to that envelope.

### Shared envelope

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

### Area-specific answers

`selection-aggregate` carries one answer per carried dimension above (deterministic where decidable — e.g. the threshold count — non-deterministic where it requires judgment — e.g. topic coherence, persona fit). The deterministic threshold answer and the non-deterministic judgment answers are **merged** into the single area output; a deterministic-only result is not a valid area grading.

Validation uses draft 2020-12 (`Ajv2020` + `ajv-formats`); `_master` is added once via `addSchema`.

## Template

The prompt template for `selection-aggregate` follows the same contract as the other ten areas' templates: it states the area, injects the resolved member-resolution manifest (from [`index.json`](/grading/index-json/)), the About / Domain-Knowledge, the declared personas, and the threshold counts, then asks one question per carried dimension. The template MUST include the Goal-Block and the surfacing convention (see [`25-harness-and-goal.md`](/grading/harness-and-goal/)).

## Skill Triad

Like every area, `selection-aggregate` is backed by a skill triad — the three-skill contract (`start-grade` → `evaluate` → `apply-improvement`) that the harness runs as the inner micro-loop. The triad reads the frozen `lockSnapshot` and the member-resolution manifest, evaluates the carried dimensions, and emits `improvementHints[]` when the selection falls short. The triad MUST be built for this area (the other ten already have theirs).

## Relationship to the index rollup

`selection-aggregate` is the node `selectionAggregate` in the selection's [`index.json`](/grading/index-json/). Its status follows the 5-status node enum; reaching `stable` here (with the hard threshold met and a group-bound evaluation present) is what allows the selection rollup to reach Grade A.

## Related

- [`00-overview.md`](/grading/overview/) — how FlowMCP schemas and selections are evaluated and graded.
- [`05-phases-selection.md`](/grading/phases-selection/) — the five selection-side areas that grade a curated group of namespaces.
- [`08-grading-model.md`](/grading/grading-model/) — the grading entry data model, its veto power, and tier trim.
- [`10-domain-knowledge.md`](/grading/domain-knowledge/) — how a selection's About Resource carries the group's domain knowledge.
- [`11-about-convention.md`](/grading/about-convention/) — the reserved About markdown Resource that describes what a namespace does.
- [`12-personas-contract.md`](/grading/personas-contract/) — how a grading entry references one of the four base personas and a lens.
- [`13-skills.md`](/grading/skills/) — how namespace skills and leveled selection skills are graded differently.
- [`23-index-json.md`](/grading/index-json/) — the one rollup file per namespace and selection carrying status and grade.
- [`25-harness-and-goal.md`](/grading/harness-and-goal/) — the completion-condition harness that drives non-deterministic grading turn by turn.

