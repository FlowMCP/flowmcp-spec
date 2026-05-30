# Grading-Spec `gradingSpec/1.0.0`

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
| Middle | Grading-Spec (this document) | Independent — describes phases, Scoring System, Grading System, Veto, Tier, Skills, Domain Knowledge |
| Bottom | Grading implementation scripts and modules | Implementation derived from this spec |

Cross-reference: [Schemas-Spec v4.1.0 — Overview](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.1.0/00-overview.md).

---

## Main Focus — Interoperability

FlowMCP's main focus is **interoperability** — connecting schemas with as many other schemas as possible. Schemas SHOULD be compatible with as many others as possible.

> *"Connecting to other tools is the foreground concern — that is the main reason."*

This main focus is the **deep cause** for the **maximalism principle** of the Grading-Spec: more tools in a schema mean more potential connections. A schema that omits endpoints which the underlying API documents is — by definition — less interoperable than the maximalist alternative. Grading penalises unjustified reduction proportionally (see chapters 02 and 05).

---

## Living Document

> **Pragma principle:**
> *"Any grading > no grading."* *"We have to start somewhere — new now, migration later."*

This Grading-Spec is a **living document**. It begins minimally with the chapters needed to grade today's schema corpus and grows as the corpus, the validator, and the LLM grader capabilities evolve. New chapters MAY be added, existing chapters MAY be tightened — version bumps follow the rules below.

---

## Three Independently Versioned Namespaces

This repository tracks **three** independent versions. None of them is coupled to the others; bumping one does **not** imply bumping the others.

### `gradingSpec/1.0.0`

The specification documents under `spec/1.0.0/`. This is the document set you are reading. Version is bumped when the normative content (MUST/SHOULD/MAY rules, phases, chapters, data contracts) changes in a way that affects compliance.

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

## Spec Structure — chapter map

The document set is organised into the following chapters. Order and naming MAY be adjusted as the spec matures.

| Chapter | Topic |
|---------|-------|
| `01-default-journey.md` | Default journey & maximalism principle |
| `02-eligibility.md` | Eligibility and completeness validation rules |
| `03-tos.md` | Terms-of-Service handling |
| `04-phases-single.md` | Single-Schema phases P1–P7 |
| `05-phases-selection.md` | Selection phases S1–S4 |
| `06-determinism-and-tier.md` | Determinism and Tier axes |
| `07-scoring-vs-grading.md` | Scoring System vs. Grading System |
| `08-grading-model.md` | Grading model, dimensions, Categorical Veto, aging (14 d API, 30 d ToS, 180 d retention) |
| `09-security-and-development.md` | Security and development discipline |
| `10-domain-knowledge.md` | Domain knowledge sources & group definition |
| `11-about-convention.md` | About-Convention on the Resource-Route level |
| `12-personas-contract.md` | Personas contract & Lens concept |
| `13-skills.md` | Two skill families (Single-Schema, Selection) |
| `14-kanban-data-contract.md` | Kanban data contract |

---

## Out of Scope for `gradingSpec/1.0.0`

- GitHub Kanban v2 wiring — deferred to a dedicated follow-up specification.
- Migration of the legacy error codes (Grade A/B/C/F) onto the new model — deferred to a dedicated follow-up.
- Reorganisation of the Schemas-Spec v4.1.0 sections beyond the small cross-reference blocks introduced for this Grading-Spec.
