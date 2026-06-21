---
title: "Overview"
description: "The Grading-Spec describes **how** FlowMCP schemas and selections are evaluated and graded — the phases, the Scoring System, the Grading System, the categorical veto, tiers, skills, and domain..."
grading_version: "3.0.0"
spec_file: "00-overview.md"
order: 0
section: "Grading"
normative: false
source_commit: "42b4603"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/42b4603/grading/3.0.0/00-overview.md"
generated_at: "2026-06-21T01:06:21.418Z"
generated_from: "grading/3.0.0/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/00-overview.md."
---

The Grading-Spec describes **how** FlowMCP schemas and selections are evaluated and graded — the phases, the Scoring System, the Grading System, the categorical veto, tiers, skills, and domain knowledge. It is a separate, independently versioned document layered on top of the FlowMCP Schemas Specification, which remains the highest authority for what a schema, a selection, and the primitives actually are. This overview sets the conformance language, the document hierarchy, the guiding interoperability focus, and the chapter map for the rest of the spec.

Normative language (MUST/SHOULD/MAY) follows the conventions defined in the FlowMCP Schemas Specification [/specification/00-overview/](/specification/00-overview/) (Conformance Language). This Grading-Spec does not re-define normative keywords.

---

## Conformance Language

This document uses the key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" as defined in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals.

The binding source for this conformance interpretation is the FlowMCP Schemas Specification [/specification/00-overview/](/specification/00-overview/). Some chapters of this Grading-Spec are intentionally written in prose without normative keywords because they describe history, motivation, or conceptual background (this overview document). All other chapters use normative language and assume this conformance interpretation.

---

## Hierarchy — where this spec sits

The Grading-Spec is **not** the highest instance. The FlowMCP Schemas Specification defines what a schema is, what a selection is, and which primitives exist. This Grading-Spec describes **how** schemas and selections are evaluated and graded.

| Level | Source | Role |
|-------|--------|------|
| Top | Schemas-Spec, main body | **Highest instance** — defines what a schema/selection is and which primitives exist |
| Middle | Scoring protocol (Schemas-Spec) | Existing `prompts.json` / `scores.json` contract (sub-consumed by this Grading-Spec) |
| Middle | Grading-Spec (this document) | Independent — describes phases, Scoring System, Grading System, Veto, Tier, Skills, Domain Knowledge |
| Bottom | Scripts and modules in the grading implementation | Implementation derived from this spec |

Cross-reference: [Schemas-Spec — Overview](/specification/00-overview/).

---

## Main Focus — Interoperability

FlowMCP's main focus is **interoperability** — connecting schemas with as many other schemas as possible. Schemas SHOULD be compatible with as many others as possible.

> Guiding principle:
> *"Connecting to other tools is the foreground concern — that is the main reason."*

This main focus is the **deep cause** for the **maximalism principle** of the Grading-Spec: more tools in a schema mean more potential connections. A schema that omits endpoints which the underlying API documents is — by definition — less interoperable than the maximalist alternative. Grading penalises unjustified reduction proportionally (see [`02-eligibility.md`](/grading/eligibility/) and [`05-phases-selection.md`](/grading/phases-selection/)).

---

## Living Document

> **Pragmatic principle:**
> *"Any grading > no grading."* *"We have to start somewhere — new now, migration later."*

This Grading-Spec is a **living document**. It begins minimally with the chapters needed to grade today's schema corpus and grows as the corpus, the validator, and the LLM grader capabilities evolve. New chapters MAY be added, existing chapters MAY be tightened — version bumps follow the rules below.

---

## Three Independently Versioned Namespaces

This repository tracks **three** independent versions. None of them is coupled to the others; bumping one does **not** imply bumping the others.

### Grading-Spec namespace

The specification documents you are reading. This namespace is bumped when the normative content (MUST/SHOULD/MAY rules, areas, chapters, data contracts) changes in a way that affects compliance — for example, the eleven-area model, the five-status node enum, the workbench island, the `index.json` rollup, the emit-`blocked`-node import behaviour, and the grading-monitoring track + board contract (see [`26-monitoring-track.md`](/grading/monitoring-track/)).

### Scoring-System namespace

The scoring rules and dimensions — what is measured, on which scale, and how partial scores aggregate. Bumped when dimensions are added, removed, or rescaled in a way that changes existing score outputs.

### Grading-System namespace

The grading rules — how scores are mapped to grades, how the categorical veto operates, how tiers are assigned, and how skill family contracts work. Bumped when the mapping from scores to grades changes, when veto rules change, or when tier boundaries shift.

---

## Dependencies on the Schemas-Spec

This Grading-Spec relies on definitions from the Schemas-Spec. The following chapters are particularly relevant:

- [Scoring protocol](/specification/22-scoring-protocol/) — the existing `prompts.json` / `scores.json` contract that this Grading-Spec sub-consumes.
- [Validation strategy](/specification/20-validation-strategy/) — the deterministic baseline; the Grading System defined here extends (and partly replaces) the Grade System described there.
- [Resources](/specification/13-resources/) — Resource primitive (basis for the `about` convention to be reserved).
- [Skills](/specification/14-skills/) — Skill types `'namespace' | 'selection' | 'agent'`.
- [Selections](/specification/17-selections/) — Selection as the fifth primitive; carries `tools[]` / `skills[]` / `resources[]` / `prompts[]`.
- [Preload](/specification/11-preload/) — Preload pattern.

---

## The Workbench Island

The **workbench island** is a first-class spec category. The grading data directory (`grading-data/`) is an internal working area, separate from the shipped repositories. Inside the island, names are deliberately **verbose** — a logical name plus a timestamp plus a content hash — which buys predictability, linkability, and version tracking. On the way **out** to the real repositories, names are **stripped to clean spec names**: the outside world sees a namespace (or a selection) under its plain logical name, not the internal snapshots.

The island is connected by a two-way, non-destructive **IN/OUT round-trip**:

- **IN — `grading import`:** source → workbench. Validate, assert a single namespace, snapshot any changed source alongside the old one (never overwrite), normalise into the island structure, rebuild `index.json`.
- **OUT — `grading export`:** workbench → source. The primary hand-off is the `index.json` (the complete graded state); clean stripped `.mjs` files MAY accompany it. The export never overwrites the source.

The full category is defined in [`22-workbench-island.md`](/grading/workbench-island/); the derived rollup it produces is defined in [`23-index-json.md`](/grading/index-json/).

---

## Spec Structure — chapter map

The spec is organised as a set of standalone chapters. Each is delivered as a standalone unit.

| Chapter | Topic |
|---------|-------|
| `00-overview.md` | This overview (history, interoperability, namespaces) |
| `01-default-journey.md` | Default journey & maximalism principle |
| `02-eligibility.md` | Eligibility, exclusions, access classes |
| `03-tos.md` | Terms-of-service due diligence |
| `04-phases-single.md` | Single-schema grading areas |
| `05-phases-selection.md` | Selection grading areas |
| `06-determinism-and-tier.md` | Determinism axis + tier (autonomous / group-bound) |
| `07-scoring-vs-grading.md` | Scoring vs. grading separation |
| `08-grading-model.md` | Grading data model (envelope, veto, tier, aging) |
| `09-security-and-development.md` | Security, veto triggers, key hygiene |
| `10-domain-knowledge.md` | Domain knowledge (= the About) |
| `11-about-convention.md` | About as a schema resource |
| `12-personas-contract.md` | Personas contract & Lens concept |
| `13-skills.md` | Skill types, levels, per-skill grading |
| `14-kanban-data-contract.md` | Superseded by `23-index-json.md` (salvaged rules only) |
| `15-versioning-axes.md` | Naming grammar (date-before-hash), `resolveLatest` |
| `16-selection-lockfile.md` | Lock snapshot fields (folded into `index.json`) |
| `17-scope-whitelist.md` | Scope allow list (public-only) |
| `18-flywheel-loop.md` | Flywheel = the IN/OUT round-trip |
| `19-folder-layout.md` | Binding folder layout (`providers/`, `selections/`, `shared-lists/`) |
| `20-entry-point-prompt.md` | Entry-point prompt + personas obligation |
| `21-pre-conditions.md` | Pre-condition gate (all members stable) |
| `22-workbench-island.md` | Workbench island category + IN/OUT round-trip |
| `23-index-json.md` | `index.json` rollup (5-status, two natures, member resolution) |
| `24-selection-aggregate.md` | The 11th area `selection-aggregate` |
| `25-harness-and-goal.md` | Harness + `/goal` + surfacing convention |
| `26-monitoring-track.md` | Grading-monitoring track + board contract + island↔repo↔proof |

---

## Headline Concepts

The following are the spec's headline structural concepts, each defined in its own chapter:

| Item | Content |
|------|---------|
| Workbench island category | [`22-workbench-island.md`](/grading/workbench-island/) — internal verbose names, stripped on mirror-out, IN/OUT round-trip |
| `index.json` rollup | [`23-index-json.md`](/grading/index-json/) — one per namespace/selection; five-status node enum + operational rollup vocabulary; live-rollup + frozen `lockSnapshot`; member-resolution manifest |
| `index.schema.json` | JSON-Schema for the rollup |
| Eleven grading areas | grading is organised around eleven areas; the 11th, `selection-aggregate` ([`24-selection-aggregate.md`](/grading/selection-aggregate/)), is the selection-level rollup |
| `/goal` harness | [`25-harness-and-goal.md`](/grading/harness-and-goal/) — transcript-only evaluator + mandatory `[GRADING]` surfacing convention + idempotent turns |
| Grading-monitoring track | [`26-monitoring-track.md`](/grading/monitoring-track/) — one grading-issue per namespace, driven deterministically by the per-namespace provider-proof; the board is separate from the schema-development track |
| Kanban data contract | superseded by `index.json`; only the audit-trail and irreversible-veto rules are salvaged ([`14-kanban-data-contract.md`](/grading/kanban-data-contract/)) |

---

## Out of Scope

- The actual grading-module and CLI implementation — derived from this spec, delivered in the grading and CLI repositories.
- Selection (which providers to bundle) — a separate concern, defined outside this spec.
