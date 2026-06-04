---
title: "Overview"
description: "The Grading-Spec is **not** the highest instance. The FlowMCP Schemas Specification v4.3.0 defines what a schema is, what a selection is, and which primitives exist. This Grading-Spec describes..."
grading_version: "3.0.0"
spec_file: "00-overview.md"
order: 0
section: "Grading"
normative: false
source_commit: "2e9a898"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2e9a898/grading/3.0.0/00-overview.md"
generated_at: "2026-06-04T21:10:58.055Z"
generated_from: "grading/3.0.0/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/00-overview.md."
---

> **Spec:** `gradingSpec/3.0.0`
> **Status:** stable (v3 — emit-on-failure import + monitoring track; v2 was a clean break from the 1.0.0/1.1.0 line)

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in the FlowMCP Schemas Specification v4.3.0 [00-overview.md](/specification/overview/) (Conformance Language). This Grading-Spec is a separate, independently versioned document; it does not re-define normative keywords.

---

## Conformance Language

This document uses the key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" as defined in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals.

The binding source for this conformance interpretation is the FlowMCP Schemas Specification v4.3.0 [00-overview.md](/specification/overview/). Some chapters of this Grading-Spec are intentionally written in prose without normative keywords because they describe history, motivation, or conceptual background (this overview document). All other chapters use normative language and assume this conformance interpretation.

---

## Hierarchy — where this spec sits

The Grading-Spec is **not** the highest instance. The FlowMCP Schemas Specification v4.3.0 defines what a schema is, what a selection is, and which primitives exist. This Grading-Spec describes **how** schemas and selections are evaluated and graded.

| Level | Source | Role |
|-------|--------|------|
| Top | `repos/flowmcp-spec/spec/v4.3.0/` (Schemas-Spec, main body) | **Highest instance** — defines what a schema/selection is and which primitives exist |
| Middle | `repos/flowmcp-spec/spec/v4.3.0/22-scoring-protocol.md` (Scoring v1) | Existing `prompts.json` / `scores.json` contract (sub-consumed by this Grading-Spec) |
| Middle | Grading-Spec in `repos/flowmcp-grading/` (this document) | Independent — describes phases, Scoring System, Grading System, Veto, Tier, Skills, Domain Knowledge |
| Bottom | Scripts and modules in `repos/flowmcp-grading/src/` | Implementation derived from this spec |

Cross-reference: [Schemas-Spec v4.3.0 — Overview](/specification/overview/).

---

## Main Focus — Interoperability

FlowMCP's main focus is **interoperability** — connecting schemas with as many other schemas as possible. Schemas SHOULD be compatible with as many others as possible.

> Guiding principle:
> *"Connecting to other tools is the foreground concern — that is the main reason."*

This main focus is the **deep cause** for the **maximalism principle** of the Grading-Spec: more tools in a schema mean more potential connections. A schema that omits endpoints which the underlying API documents is — by definition — less interoperable than the maximalist alternative. Grading penalises unjustified reduction proportionally (see chapters 02 and 05 once written).

---

## Living Document

> **Pragmatic principle:**
> *"Any grading > no grading."* *"We have to start somewhere — new now, migration later."*

This Grading-Spec is a **living document**. It begins minimally with the chapters needed to grade today's schema corpus and grows as the corpus, the validator, and the LLM grader capabilities evolve. New chapters MAY be added, existing chapters MAY be tightened — version bumps follow the rules below.

---

## Three Independently Versioned Namespaces

This repository tracks **three** independent versions. None of them is coupled to the others; bumping one does **not** imply bumping the others.

### `gradingSpec/3.0.0`

The specification documents under `grading/3.0.0/`. This is the document set you are reading. Version is bumped when the normative content (MUST/SHOULD/MAY rules, areas, chapters, data contracts) changes in a way that affects compliance. The `2.0.0` v2 break replaced the 1.0.0/1.1.0 phase model with the eleven-area model, the five-status node enum, the workbench island, and the `index.json` rollup. `3.0.0` is the **v3 break**: the import contract flips from a **hard abort** (validate-fail / multiple namespaces) to an **emit-`blocked`-node-and-continue** behaviour, the grading-monitoring track + board contract come **into scope** (new [`26-monitoring-track.md`](/grading/monitoring-track/)), and `index.json` gains a pinned `validation-failed` reason plus `githubIssue` / `boardColumn` backrefs. A consumer relying on the old fail-closed import guarantee breaks — hence a MAJOR bump. The legacy `grading/2.0.0/` directory is retained unchanged. Existing 1.0.0/1.1.0 gradings remain legacy.

### `scoringSystem/1.0.0`

The scoring rules and dimensions — what is measured, on which scale, and how partial scores aggregate. Version is bumped when dimensions are added, removed, or rescaled in a way that changes existing score outputs.

### `gradingSystem/1.0.0`

The grading rules — how scores are mapped to grades, how the categorical veto operates, how tiers are assigned, and how skill family contracts work. Version is bumped when the mapping from scores to grades changes, when veto rules change, or when tier boundaries shift.

---

## Cross-References to the Schemas-Spec v4.3.0

This Grading-Spec relies on definitions from the Schemas-Spec. The following chapters of v4.3.0 are particularly relevant:

- [22-scoring-protocol.md](/specification/scoring-protocol/) — the existing `prompts.json` / `scores.json` contract that this Grading-Spec sub-consumes.
- [20-validation-strategy.md](/specification/validation-strategy/) — the deterministic baseline; the Grading System defined here extends (and partly replaces) the Grade System described there.
- [13-resources.md](/specification/resources/) — Resource primitive (basis for the `about` convention to be reserved).
- [14-skills.md](/specification/skills/) — Skill types `'namespace' | 'selection' | 'agent'` (already part of v4.2).
- [17-selections.md](/specification/selections/) — Selection as the fifth primitive; carries `tools[]` / `skills[]` / `resources[]` / `prompts[]`.
- [11-preload.md](/specification/preload/) — Preload pattern already in place.

---

## The Workbench Island (v2 category)

v2 introduces the **workbench island** as a first-class spec category. The grading data directory (`grading-data/`) is an internal working area, separate from the shipped repositories. Inside the island, names are deliberately **verbose** — a logical name plus a timestamp plus a content hash — which buys predictability, linkability, and version tracking. On the way **out** to the real repositories, names are **stripped to clean spec names**: the outside world sees a namespace (or a selection) under its plain logical name, not the internal snapshots.

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
| `14-kanban-data-contract.md` | **Superseded** by `23-index-json.md` (salvaged rules only) |
| `15-versioning-axes.md` | Naming grammar (date-before-hash), `resolveLatest` |
| `16-selection-lockfile.md` | Lock snapshot fields (folded into `index.json`) |
| `17-scope-whitelist.md` | Scope whitelist (public-only) |
| `18-flywheel-loop.md` | Flywheel = the IN/OUT round-trip |
| `19-folder-layout.md` | Binding folder layout (`providers/`, `selections/`, `shared-lists/`) |
| `20-entry-point-prompt.md` | Entry-point prompt + personas obligation |
| `21-pre-conditions.md` | Pre-condition gate (all members stable) |
| `22-workbench-island.md` | **NEW** — Workbench island category + IN/OUT round-trip |
| `23-index-json.md` | **NEW** — `index.json` rollup (5-status, two natures, member resolution) |
| `24-selection-aggregate.md` | **NEW** — the 11th area `selection-aggregate` |
| `25-harness-and-goal.md` | **NEW** — harness + `/goal` + surfacing convention |
| `26-monitoring-track.md` | **NEW in 3.0.0** — Grading-monitoring track + board contract + island↔repo↔proof |

---

## New in v2

The following are the headline additions of the v2 break over the 1.0.0/1.1.0 line:

| Item | Content |
|------|---------|
| Workbench island category | [`22-workbench-island.md`](/grading/workbench-island/) — internal verbose names, stripped on mirror-out, IN/OUT round-trip |
| `index.json` rollup | [`23-index-json.md`](/grading/index-json/) — one per namespace/selection; five-status node enum + operational rollup vocabulary; live-rollup + frozen `lockSnapshot`; member-resolution manifest |
| `index.schema.json` | JSON-Schema for the rollup |
| Eleven grading areas | the per-phase `P*`/`S*` model is replaced by eleven areas; the 11th, `selection-aggregate` ([`24-selection-aggregate.md`](/grading/selection-aggregate/)), is new |
| `/goal` harness | [`25-harness-and-goal.md`](/grading/harness-and-goal/) — transcript-only evaluator + mandatory `[GRADING]` surfacing convention + idempotent turns |
| Kanban data contract | superseded by `index.json`; only the audit-trail and irreversible-veto rules are salvaged ([`14-kanban-data-contract.md`](/grading/kanban-data-contract/)) |

---

## What Changed

### 3.0.0

`3.0.0` is the **v3 break**. The import contract changes from "MUST abort on a `flowmcp validate` failure or a multi-namespace folder" to "emit a `blocked` node with `reason: validation-failed` and continue" (emit-on-failure, see [`22-workbench-island.md`](/grading/workbench-island/)). The grading-monitoring track — one grading-issue per namespace, driven deterministically by the per-namespace provider-proof — comes **into scope** in the new [`26-monitoring-track.md`](/grading/monitoring-track/), reversing the old "Kanban out of scope" stance. `index.json` gains a pinned `blocked` reason set and the `githubIssue` / `boardColumn` idempotency backrefs; a `blocked`/`validation-failed` node is recognised as a non-grading **status record** (see [`08-grading-model.md`](/grading/grading-model/)). The folder↔namespace invariant is now binding with an unparseable-folder fallback and a rename-on-parse lifecycle (see [`19-folder-layout.md`](/grading/folder-layout/)). Because the fail-closed import guarantee is removed, this is a MAJOR bump; the legacy `grading/2.0.0/` directory is retained unchanged. See [`CHANGELOG.md`](./CHANGELOG.md).

### 2.0.0

`2.0.0` is the **v2 break**. The earlier 1.0.0/1.1.0 line was a short-lived experiment; v2 reorganises grading around eleven areas, a five-status model, the workbench island, the derived `index.json` rollup, and a `/goal`-driven harness. Breaking changes are permitted; there is no backwards-compatibility promise toward the 1.0.0/1.1.0 phase model (`P1`–`P7` / `S1`–`S4`). See [`CHANGELOG.md`](./CHANGELOG.md) for the version history.

---

## Out of Scope for `gradingSpec/3.0.0`

- The actual grading-module and CLI implementation — derived from this spec, delivered in the grading and CLI repositories.
- Migration tooling for legacy 1.0.0/1.1.0 gradings — those are treated as legacy.

> **Now IN scope as of `3.0.0`:** the grading-monitoring track and its board contract — previously declared out of scope and "superseded by `index.json`" — are defined in the new [`26-monitoring-track.md`](/grading/monitoring-track/). The board is the GitHub-Kanban surface driven **deterministically** by the per-namespace provider-proof; it is **separate** from the schema-development track. Selection (which providers to bundle) remains out of scope (separate memo).
