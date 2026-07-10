# Grading-Spec `gradingSpec/1.1.0`

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs 1.0.0:** see the "Extensions since 1.0.0" section below and [`CHANGELOG.md`](./CHANGELOG.md).

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in the FlowMCP Schemas Specification v4.1.0 [00-overview.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/00-overview.md) (Conformance Language). This Grading-Spec is a separate, independently versioned document; it does not re-define normative keywords.

---

## Conformance Language

This document uses the key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" as defined in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals.

The binding source for this conformance interpretation is the FlowMCP Schemas Specification v4.1.0 [00-overview.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/00-overview.md). Some chapters of this Grading-Spec are intentionally written in prose without normative keywords because they describe history, motivation, or conceptual background (this overview document). All other chapters use normative language and assume this conformance interpretation.

---

## Hierarchy — where this spec sits

The Grading-Spec is **not** the highest instance. The FlowMCP Schemas Specification v4.1.0 defines what a schema is, what a selection is, and which primitives exist. This Grading-Spec describes **how** schemas and selections are evaluated and graded.

| Level | Source | Role |
|-------|--------|------|
| Top | `repos/flowmcp-spec/spec/v4.1.0/` (Schemas-Spec, main body) | **Highest instance** — defines what a schema/selection is and which primitives exist |
| Middle | `repos/flowmcp-spec/spec/v4.1.0/22-scoring-protocol.md` (Scoring v1) | Existing `prompts.json` / `scores.json` contract (sub-consumed by this Grading-Spec) |
| Middle | Grading-Spec in `repos/flowmcp-grading/` (this document) | Independent — describes phases, Scoring System, Grading System, Veto, Tier, Skills, Domain Knowledge |
| Bottom | Scripts and modules in `repos/flowmcp-grading/src/` | Implementation derived from this spec |

Cross-reference: [Schemas-Spec v4.1.0 — Overview](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/00-overview.md).

---

## Main Focus — Interoperability

FlowMCP's main focus is **interoperability** — connecting schemas with as many other schemas as possible. Schemas SHOULD be compatible with as many others as possible.

> Guiding principle:
> *"Connecting to other tools is the foreground concern — that is the main reason."*

This main focus is the **deep cause** for the **maximalism principle** of the Grading-Spec: more tools in a schema mean more potential connections. A schema that omits endpoints which the underlying API documents is — by definition — less interoperable than the maximalist alternative. Grading penalises unjustified reduction proportionally (see chapters 02 and 05 once written).

---

## Living Document

> **Pragma principle:**
> *"Any grading > no grading."* *"We have to start somewhere — new now, migration later."*

This Grading-Spec is a **living document**. It begins minimally with the chapters needed to grade today's schema corpus and grows as the corpus, the validator, and the LLM grader capabilities evolve. New chapters MAY be added, existing chapters MAY be tightened — version bumps follow the rules below.

---

## Three Independently Versioned Namespaces

This repository tracks **three** independent versions. None of them is coupled to the others; bumping one does **not** imply bumping the others.

### `gradingSpec/1.1.0`

The specification documents under `spec/1.1.0/`. This is the document set you are reading. Version is bumped when the normative content (MUST/SHOULD/MAY rules, phases, chapters, data contracts) changes in a way that affects compliance. `1.1.0` is an additive minor bump from `1.0.0` (no breaking changes; existing `1.0.0` schemas and `1.0.0` gradings remain valid).

### `scoringSystem/1.0.0`

The scoring rules and dimensions — what is measured, on which scale, and how partial scores aggregate. Version is bumped when dimensions are added, removed, or rescaled in a way that changes existing score outputs.

### `gradingSystem/1.0.0`

The grading rules — how scores are mapped to grades, how the categorical veto operates, how tiers are assigned, and how skill family contracts work. Version is bumped when the mapping from scores to grades changes, when veto rules change, or when tier boundaries shift.

---

## Cross-References to the Schemas-Spec v4.1.0

This Grading-Spec relies on definitions from the Schemas-Spec. The following chapters of v4.1.0 are particularly relevant:

- [22-scoring-protocol.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/22-scoring-protocol.md) — the existing `prompts.json` / `scores.json` contract that this Grading-Spec sub-consumes.
- [20-validation-strategy.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/20-validation-strategy.md) — the deterministic baseline; the Grading System defined here extends (and partly replaces) the Grade System described there.
- [13-resources.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/13-resources.md) — Resource primitive (basis for the `about` convention to be reserved).
- [14-skills.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/14-skills.md) — Skill types `'namespace' | 'selection' | 'agent'` (already part of v4.1).
- [17-selections.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/17-selections.md) — Selection as the fifth primitive; carries `tools[]` / `skills[]` / `resources[]` / `prompts[]`.
- [11-preload.md](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/11-preload.md) — Preload pattern already in place.

---

## Spec Structure — chapters to be filled

The following chapters are placeholders for content delivered in later revisions of this spec. Order and naming MAY be adjusted as the spec matures.

| Chapter | Topic | Status |
|---------|-------|--------|
| `01-default-journey.md` | Default journey & maximalism principle | delivered |
| `02-completeness.md` | Completeness validation rules | delivered |
| `03-phases-single-schema.md` | Single-Schema phases P1–P7 | delivered |
| `04-phases-selection.md` | Selection phases S1–S4 | delivered |
| `05-scoring-system.md` | Scoring System (dimensions, scales) | delivered |
| `06-grading-system.md` | Grading System (mapping scores → grades) | delivered |
| `07-veto.md` | Categorical Veto rules | delivered |
| `08-tier.md` | Tier assignment | delivered |
| `09-aging-and-retention.md` | Aging (14 d API, 30 d ToS), 180 d retention | delivered |
| `10-skills.md` | Two skill families (Single-Schema, Selection) | delivered |
| `11-personas.md` | Personas contract & Lens concept | delivered |
| `12-domain-knowledge.md` | Domain knowledge sources | delivered |
| `13-error-codes.md` | Error codes (GRD-*, SCO-*, VET-*) | delivered |
| `14-kanban-data-contract.md` | Kanban data contract | delivered |

Each chapter is delivered as a standalone document. Implementers MUST NOT rely on the chapter naming above until the corresponding chapter is merged.

---

## Extensions since 1.0.0

The following table lists the chapters that `gradingSpec/1.1.0` adds or updates over `gradingSpec/1.0.0`. The extension is **additive** — there are no breaking changes.

| Chapter | Status | Content |
|---------|--------|---------|
| `02-eligibility.md` | Update | §3 extended with the empty-context convention (§3.5) |
| `06-determinism-and-tier.md` | Update | §8 tier trim extended with a partial-grading clarification (§8.2) |
| `08-grading-model.md` | Update | §5 extended with 5 new required fields (`schemaHash`, `schemaVersion`, `gradingId`, `gradingMode`, `aboutHash`); §5.1 separates Single (P1-P7, 17 total) from Selection dimensions (S1-S4) |
| `08-grading-model.schema.json` | Update | New required fields + Selection-dimension `$defs` |
| `11-about-convention.md` | Update | §19 NEW — about-pages schema for Namespace and Selection with a hash convention |
| `14-kanban-data-contract.md` | Update | §14 extended with a lane separation of Single vs Selection |
| `14-kanban-data-contract.schema.json` | Update | `laneType` enum + pattern constraints |
| `15-versioning-axes.md` | **NEW** | §10 two versioning axes + bump tables (`schemaVersion`, `selectionVersion`) + consistency check + canonical representation |
| `16-selection-lockfile.md` | **NEW** | §11 `selection.json` + `selection.lock.json` + `namespace.json` + workflow with pre-condition |
| `selection.schema.json` | **NEW** | JSON schema for §11.1 |
| `selection.lock.schema.json` | **NEW** | JSON schema for §11.2 with `gradingStatus` enum |
| `namespace.schema.json` | **NEW** | JSON schema for §11.4 (no `namespaceVersion` field) |
| `17-scope-whitelist.md` | **NEW** | §12 scope whitelist (Tools + Shared Lists) + public-only principle |
| `18-flywheel-loop.md` | **NEW** | §16 flywheel loop with a Mermaid diagram (`flowchart TD`) |
| `19-folder-layout.md` | **NEW** | §17 binding folder layout + source-of-truth rule + naming conventions |
| `20-entry-point-prompt.md` | **NEW** | §18 entry-point prompt template + mandatory personas (spec vs convention) |
| `21-pre-conditions.md` | **NEW** | §20 universal pre-condition requirement (aggregated checks require all members to be stable) |
| `CHANGELOG.md` | NEW | Version history |

Seven new chapters (`15`-`21`), three new JSON schemas (`selection.*`, `namespace.*`), and four update chapters (`02`, `06`, `08`, `11`, `14`).

---

## Out of Scope for `gradingSpec/1.1.0`

- GitHub Kanban v2 wiring — deferred to a follow-up effort.
- Migration of the legacy error codes (Grade A/B/C/F) onto the new model — deferred to a follow-up effort.
- Reorganisation of v4.1 sections beyond the small cross-reference blocks introduced by this spec.
- Deep consolidation of earlier, superseded grading drafts — deferred to a follow-up effort.
