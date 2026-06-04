---
title: "Provider-Side Grading Areas"
description: "This chapter is the **normative source for the provider-side grading Areas** — the Areas that grade one **schema** inside one **namespace** without group context. It replaces the linear phase model..."
grading_version: "3.0.0"
spec_file: "04-phases-single.md"
order: 4
section: "Grading"
normative: true
source_commit: "62b50d4"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/62b50d4/grading/3.0.0/04-phases-single.md"
generated_at: "2026-06-04T13:49:20.413Z"
generated_from: "grading/3.0.0/04-phases-single.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/04-phases-single.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

## Introduction

This chapter is the **normative source for the provider-side grading Areas** — the Areas that grade one **schema** inside one **namespace** without group context. It replaces the linear phase model of earlier spec versions with an **Area model**: each Area is a self-contained grading rubric attached to the primitive it evaluates, written to a `_gradings/` folder next to that primitive (see [`19-folder-layout.md`](/grading/folder-layout/)).

The provider side produces the **base unit** of the FlowMCP corpus: **one namespace** with one or more schemas, namespace skills, and an About Resource. Higher-level grouping (selection side) is defined separately in [`05-phases-selection.md`](/grading/phases-selection/).

A schema graded only on the provider side has `gradingTier = autonomous`. Per [`06-determinism-and-tier.md`](/grading/determinism-and-tier/), the **maximum attainable grade** on this tier is **B**. Grade A requires a `group-bound` contribution from the selection side.

---

## The Provider-Side Areas

The grading system defines **eleven Areas** in total (see [`05-phases-selection.md`](/grading/phases-selection/) and [`19-folder-layout.md`](/grading/folder-layout/)). Of these, the following **six** are provider-side (everything except the selection Areas):

| # | Area | Evaluates | `_gradings/` location | Persona | Det/Non-Det |
|---|------|-----------|------------------------|---------|-------------|
| 1 | `single-test` | one tool | `providers/<ns>/<schema>/tools/<tool>/_gradings/` | no | deterministic gate + non-deterministic |
| 2 | `tools-aggregate-schema` | the tools collection of one schema | `providers/<ns>/<schema>/_gradings/` | no | both |
| 3 | `tools-aggregate-namespace` | tools across the namespace | `providers/<ns>/_gradings/` | no | both |
| 4 | `namespace-description` | namespace metadata | `providers/<ns>/_gradings/` | no | non-deterministic |
| 5 | `namespace-skills` | one namespace skill (per skill) | `providers/<ns>/<schema>/skills/<skill>/_gradings/` | yes | non-deterministic |
| 6 | `about-namespace` | the About Resource (declared in one schema) | `providers/<ns>/<schema>/resources/about/_gradings/` | yes | deterministic (route-exists) + non-deterministic |

The remaining five Areas (`about-selection`, `selection-skills-L1`, `selection-skills-L2`, `selection-skills-L3`, `selection-aggregate`) are selection-side and live in [`05-phases-selection.md`](/grading/phases-selection/).

Each Area is graded **independently**. There is no fixed linear order between Areas; the only ordering obligations are the **cascade and veto procedures** (see [Area Procedures](#area-procedures)) and the deterministic-first rule of [`06-determinism-and-tier.md`](/grading/determinism-and-tier/).

---

## Area Procedures

The Area model retains four procedures that previously lived inside the phase model. They are now expressed as **rules that apply across the provider-side Areas**.

### Description Cascade (within `single-test` and `tools-aggregate-*`)

The description cascade is a **mandatory ordered procedure** for validating tool descriptions. It MUST be executed in the following order; skipping or reordering steps is a finding.

1. **Run tests against the endpoint.** MUST: at least **3 working tests per tool** (status true and non-empty data), covering the breadth of the parameter space. Fewer than 3 working tests blocks the tool from full grading and is recorded with a status reason (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)).
2. **Check the responses** and validate the tool description against the actual responses.
3. **Normalise / update the tool description** to match the validated responses.
4. **All tools, resources, and prompts MUST have descriptions** — and each description MUST be individually checked.
5. **Descriptions MUST be neutral** — see [Description Neutrality](#description-neutrality-cross-cutting).

The cascade is a contract: outputs of step *n* are inputs of step *n+1*. A failure in any step halts the cascade for the affected tool and is recorded as a finding. `single-test` carries the per-tool cascade result; `tools-aggregate-schema` and `tools-aggregate-namespace` aggregate the per-tool cascade outcomes.

### Description Neutrality (cross-cutting)

The neutrality rule (cascade step 5) is normative and worth restating:

- A tool description states **what** the tool does (capabilities, parameters, return shape).
- A tool description MUST NOT state **what for** it should be used (application scenarios, persona use cases, "good for X").
- Application scenarios and persona use cases belong in the **About Resource** ([`11-about-convention.md`](/grading/about-convention/)) — not in the tool description.

This separation is essential for LLM-grader reproducibility: neutral descriptions can be deterministically compared to the observed API behaviour; mixed descriptions cannot.

### Cascade Stop / Veto (cross-cutting)

A failed gate **MUST halt the dependent grading** for the affected schema. A categorical veto raised in any Area **MUST stop** further grading for that schema. Examples:

- **`api-key-domain-mismatch` veto** — when the API key declared in the schema metadata does not match the API root domain, the veto is raised and the `single-test` live tests for the affected tools MUST NOT be treated as pass.
- **HTTP 4xx** — when a tool returns HTTP 4xx (including 401/403), the response MUST NOT be treated as "auth-pass" (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)). The description cascade for that tool **cannot be completed** and is recorded as a finding.
- **Eligibility violation** — when an endpoint fails an exclusion criterion under [`02-eligibility.md`](/grading/eligibility/) and the schema author insists on including it, the schema is rejected and dependent Areas do not run for it.

Cascade-stop events are recorded in the grading entry. They do not lower the grade silently — a categorical veto replaces the aggregate grade with `REJECTED`, which the index derivation maps to the terminal status `rejected` (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) and [`19-folder-layout.md`](/grading/folder-layout/)).

### Base Unit (cross-cutting)

When the provider-side Areas are complete, the artefact set is the **base unit** of the corpus:

- one **namespace**,
- one or more **schemas** under that namespace,
- one or more **namespace skills**, and
- an **About Resource** declared in one schema.

The provider-side grade is **closed** at this point. Selection-side grading (see [`05-phases-selection.md`](/grading/phases-selection/)) operates on aggregations of base units and never re-grades a base unit's schemas.

---

## About as a Schema Resource

The About Resource is graded by the `about-namespace` Area. It is a **markdown Resource declared in one schema** of the namespace (`main.resources`), stored under `providers/<ns>/<schema>/resources/about/`, **not** a namespace route. The full content contract and the deterministic / non-deterministic split are defined in [`11-about-convention.md`](/grading/about-convention/).

A Resource technically never lives at namespace level — there is no namespace object to attach it to, only schemas. About is therefore inserted into **one** schema, and the detector searches for it **namespace-wide**.

---

## Tier

The provider-side Areas produce `gradingTier = autonomous`. Per [`06-determinism-and-tier.md`](/grading/determinism-and-tier/), the maximum attainable grade on `autonomous` is **B**. A schema that should be eligible for grade **A** must additionally be graded on the selection side (`group-bound`, see [`05-phases-selection.md`](/grading/phases-selection/)).

---

## Cross-References

- [`01-default-journey.md`](/grading/default-journey/) — maximalism and the completeness contribution to `single-test` / `tools-aggregate-schema`.
- [`02-eligibility.md`](/grading/eligibility/) — endpoint eligibility (input to schema authoring).
- [`03-tos.md`](/grading/tos/) — ToS check.
- [`05-phases-selection.md`](/grading/phases-selection/) — selection-side Areas (consume provider-side base units).
- [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) — tier and determinism rules (max-grade-B on `autonomous`).
- [`11-about-convention.md`](/grading/about-convention/) — About Resource content contract.
- [`12-personas-contract.md`](/grading/personas-contract/) — personas referenced by persona-bearing Areas.
- [`13-skills.md`](/grading/skills/) — namespace skills and selection skills.
- [`19-folder-layout.md`](/grading/folder-layout/) — `_gradings/` placement and the `index.json` rollup.

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/)
- **Related:** [`01-default-journey.md`](/grading/default-journey/), [`02-eligibility.md`](/grading/eligibility/), [`03-tos.md`](/grading/tos/), [`05-phases-selection.md`](/grading/phases-selection/), [`06-determinism-and-tier.md`](/grading/determinism-and-tier/), [`11-about-convention.md`](/grading/about-convention/)

