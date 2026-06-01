---
title: "Selection-Side Grading Areas"
description: "A **selection** is a topic-oriented, curated collection of tools and skills assembled over several member namespaces. It is the **fifth primitive** introduced in the FlowMCP Schemas Specification..."
grading_version: "2.0.0"
spec_file: "05-phases-selection.md"
order: 5
section: "Grading"
normative: true
source_commit: "b25ff5d"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/b25ff5d/grading/2.0.0/05-phases-selection.md"
generated_at: "2026-06-01T01:39:52.471Z"
generated_from: "grading/2.0.0/05-phases-selection.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/05-phases-selection.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## Introduction

A **selection** is a topic-oriented, curated collection of tools and skills assembled over several member namespaces. It is the **fifth primitive** introduced in the FlowMCP Schemas Specification v4.2 (see [`17-selections.md`](/specification/selections/)).

This chapter is the **normative source for the selection-side grading Areas**. These Areas run **on top of** the provider-side Areas of [`04-phases-single.md`](/grading/phases-single/): they presuppose that every member schema has already been graded on the provider side and reached the status `stable` (see the pre-condition in [Pre-Condition and the `selection.json` Reference Layer](#pre-condition-and-the-selectionjson-reference-layer)).

The selection-side Areas produce `gradingTier = group-bound` — and under this tier, grade **A** is reachable (per [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)).

---

## Prerequisite: Soft and Hard Thresholds (MUST)

The selection-side Areas have a **minimum-size precondition**, expressed as two thresholds. The thresholds are normative; the rationale is corpus diversity (see [`10-domain-knowledge.md`](/grading/domain-knowledge/)).

| Threshold | Namespaces | Consequence |
|-----------|------------|-------------|
| **Soft** | **≥ 5** | A selection becomes a "group" in the usable sense. Selection skills MAY be created; selection Areas run with reduced expectations. |
| **Hard** | **≥ 7** | Full group optimisation applies; `personaUseCaseFit` is fully scaled; **`aggregateGrade = A` is regularly reachable**. |

- A selection with **fewer than 5 namespaces** MUST NOT run the selection-side Areas. Only provider-side grading applies; the selection-level grade is recorded as `n/a`.
- A selection with **5–6 namespaces** MAY run the structural and skill Areas with reduced scope but MUST NOT claim grade A.
- A selection with **≥ 7 namespaces** MAY claim grade A via the full set of selection Areas including `selection-aggregate`.

The **group-bound contribution that unlocks grade A** is carried by the `selection-aggregate` Area (see [`selection-aggregate` (the group-bound Area)](#selection-aggregate-the-group-bound-area)). A selection cannot reach grade A without at least one `group-bound` Area contributing to its aggregate.

---

## The Selection-Side Areas

The grading system defines **eleven Areas** in total (see [`04-phases-single.md`](/grading/phases-single/)). The following **five** are selection-side:

| # | Area | Evaluates | `_gradings/` location | Persona | Det/Non-Det |
|---|------|-----------|------------------------|---------|-------------|
| 7 | `about-selection` | the About Resource of the selection (= the Domain-Knowledge document) | `selections/<sel>/resources/about/_gradings/` | yes | deterministic + non-deterministic |
| 8 | `selection-skills-L1` | one L1 skill (per skill) | `selections/<sel>/skills/<skill>/_gradings/` | yes | non-deterministic |
| 9 | `selection-skills-L2` | one L2 skill (per skill) | `selections/<sel>/skills/<skill>/_gradings/` | yes | non-deterministic |
| 10 | `selection-skills-L3` | one L3 skill (per skill) | `selections/<sel>/skills/<skill>/_gradings/` | yes | non-deterministic |
| 11 | `selection-aggregate` | **the selection as a whole** | `selections/<sel>/_gradings/` | yes | deterministic + non-deterministic |

### `about-selection`

The selection-level About Resource is graded here. The About Resource doubles as the **Domain-Knowledge document** of the group (see [`10-domain-knowledge.md`](/grading/domain-knowledge/) and [`11-about-convention.md`](/grading/about-convention/)): it carries the seven mandatory domain-knowledge sections. This Area scores the **document quality** (are the sections present and coherent?). Member conformance against the document is a separate check carried by `selection-aggregate` (see [`selection-aggregate` (the group-bound Area)](#selection-aggregate-the-group-bound-area)) — two distinct evaluations, no circularity.

### `selection-skills-L1` / `-L2` / `-L3`

Selection skills are graded **per skill**, not per cohort. Each skill has its own `_gradings/` folder. The L-semantics (Signpost / Topic / Usecase) and the per-skill predecessor chain are defined in [`13-skills.md`](/grading/skills/). The Area name records which level the graded skill declares via its `level` extension field; the grading **reads** that field, it does not assign the level.

---

## `selection-aggregate` (the group-bound Area)

`selection-aggregate` grades the selection **as a whole**. It carries the selection-wide dimensions that have no per-skill or About home:

- **Thresholds** — soft ≥ 5 / hard ≥ 7 members (see [Prerequisite: Soft and Hard Thresholds](#prerequisite-soft-and-hard-thresholds-must)).
- **Topic coherence** — does the member set form one coherent topic?
- **`domainConformance`** — are the members consistent with the About / Domain-Knowledge document?
- **`personaUseCaseFit`** — does the selection serve its declared persona use cases?
- **Group-bound tier** — this is the Area that opens the path to grade A.
- **Cascade stop** — selection-wide veto handling (see [Cascade Stop](#cascade-stop)).

> The full output schema, prompt template, and skill triad for `selection-aggregate` are defined in the grading module's Area catalogue. This Area is the eleventh Area; its detailed contract is specified alongside the grading-data layout, not in this chapter.

---

## Cascade Stop

A failure on the selection side halts the dependent selection Areas. Examples:

- **Soft threshold not met** (< 5 namespaces) → no selection Areas run; the selection-level grade is `n/a`. Only provider-side grades remain.
- **`about-selection` document invalid** (a mandatory domain-knowledge section missing) → `selection-aggregate.domainConformance` cannot be scored above `stale` / `n/a`.
- **A member is not `stable`** → the pre-condition (see [Pre-Condition and the `selection.json` Reference Layer](#pre-condition-and-the-selectionjson-reference-layer)) blocks the selection run before any Area runs.

Cascade-stop events are recorded as findings in the grading entry, analogous to the provider-side cascade stops in [`04-phases-single.md`](/grading/phases-single/).

---

## Pre-Condition and the `selection.json` Reference Layer

The selection-side Areas start only when **every member schema is `stable`**. The gate reads the frozen member snapshot from the selection's `index.json` (see [`19-folder-layout.md`](/grading/folder-layout/) and [`21-pre-conditions.md`](/grading/pre-conditions/)).

The `selection.json` (the selection definition) is a **reference / import layer**, not a copy of its members:

- `members[]` references member schemas by logical id; their tools, resources, and skills remain in `providers/` and are **never copied** into the selection.
- The selection stores its own files only for **unique** primitives (a tool or prompt defined solely inside the selection).
- A member schema is graded **once**, on the provider side. The selection never re-grades a member's schema; it grades only the selection-side Areas on top of the already-stable members.

This is why grade A requires the provider side to be complete first: the selection-side Areas add the `group-bound` perspective, they do not duplicate provider-side work.

---

## Tier

The selection-side Areas produce `gradingTier = group-bound`:

```
gradingTier = group-bound
```

This tier is the **only** path to grade **A**. The provider-side Areas (`autonomous`) cannot, by construction, deliver grade A.

---

## Cross-References

- [`04-phases-single.md`](/grading/phases-single/) — provider-side Areas; the selection side consumes their stable base units.
- [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) — tier rules (max grade B autonomous vs. grade A possible group-bound).
- [`10-domain-knowledge.md`](/grading/domain-knowledge/) — the seven mandatory domain-knowledge sections carried by the About Resource.
- [`11-about-convention.md`](/grading/about-convention/) — About as a schema Resource.
- [`12-personas-contract.md`](/grading/personas-contract/) — persona references for the persona-bearing Areas.
- [`13-skills.md`](/grading/skills/) — selection-skill levels and per-skill grading.
- [`19-folder-layout.md`](/grading/folder-layout/) — `_gradings/` placement, `index.json`, member resolution.
- [`21-pre-conditions.md`](/grading/pre-conditions/) — the "all members stable" gate.
- FlowMCP Schemas Specification v4.2.0 — [`17-selections.md`](/specification/selections/).

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/), [`04-phases-single.md`](/grading/phases-single/)
- **Related:** [`06-determinism-and-tier.md`](/grading/determinism-and-tier/), [`10-domain-knowledge.md`](/grading/domain-knowledge/), [`13-skills.md`](/grading/skills/)

