---
title: "Default Journey & Maximalism"
description: "This chapter anchors the **default journey** by which a schema enters the FlowMCP corpus, the **maximalism principle** that governs its endpoint coverage, the link to the **interoperability** main..."
grading_version: "2.0.0"
spec_file: "01-default-journey.md"
order: 1
section: "Grading"
normative: true
source_commit: "7094662"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/7094662/grading/2.0.0/01-default-journey.md"
generated_at: "2026-05-31T23:03:59.972Z"
generated_from: "grading/2.0.0/01-default-journey.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/01-default-journey.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## Purpose

This chapter anchors the **default journey** by which a schema enters the FlowMCP corpus, the **maximalism principle** that governs its endpoint coverage, the link to the **interoperability** main focus, and the **completeness validation** as a contribution to the `single-test` and `tools-aggregate-schema` Areas (see [`04-phases-single.md`](/grading/phases-single/)).

The default position is unambiguous: **more tools = better interoperability**. Reduction below the documented endpoint set MUST be justified, or it MUST cost points.

---

## Default Journey (binding)

The **default entry point** for a gradable schema is the **documentation URL** of a publicly documented API. From that documentation, **1..n FlowMCP schemas** are derived which cover — as completely as possible — all endpoints admitted by the eligibility rules of [`02-eligibility.md`](/grading/eligibility/).

A documentation URL is **NOT** a mandatory entry point. Other entry paths — inference from network inspection, manual schema authoring — are permitted. The spec documents them as **exceptions**, not as the default.

- A documentation URL SHOULD be the entry point for every new schema.
- Non-documentation entry paths MAY be used, but they MUST be marked as exceptions in the schema metadata and MUST not weaken the maximalism rule below.

---

## Maximalism Principle (MUST)

When the entry path is a documentation URL, the resulting schema (or schema set) **MUST be maximalist**: it MUST cover **all endpoints admitted by [`02-eligibility.md`](/grading/eligibility/)** (Chapter 3, eligibility rules).

**Reduction rule (MUST):** A schema that implements **fewer tools than the documentation supports** MUST either

1. carry an explicit, machine-readable justification per omitted endpoint, recorded in the grading JSON of the affected schema (e.g. "endpoint excluded under [`02-eligibility.md`](/grading/eligibility/) Exclusion Criteria"), **or**
2. accept a proportional point deduction in the **completeness validation** of the `single-test` / `tools-aggregate-schema` Areas (see [`04-phases-single.md`](/grading/phases-single/)).

No silent reduction. An omission without a justification recorded in the grading JSON is a finding.

---

## Default-Reversal (MUST be stated in the spec)

The **default is reversed**: when in doubt, take **more tools**.

The burden of justification rests on the party **reducing** the schema — not on the party including all documented endpoints. This rule was learned over months of practice: predictive trimming ("we probably won't need this endpoint") consistently produced gaps that later had to be closed. The user-level lesson is therefore normative here:

> **When in doubt — more tools.**

Implementers MUST treat this as the operational default. Reviewers and graders MUST hold reducers — not includers — to the burden of justification.

---

## Connection to Interoperability

Maximalism follows directly from the **main focus interoperability** stated in [`00-overview.md`](/grading/overview/). Every omitted tool is one fewer potential connection between schemas. Predictive reduction — i.e. anticipating which endpoints "won't be useful" — is explicitly **discouraged**. Connect first, optimise later.

This is the **deep cause** for the maximalism principle: a schema that omits endpoints which the underlying API documents is, by definition, less interoperable than the maximalist alternative.

---

## Completeness Validation (Area contribution)

The **completeness validation** is a deterministic contribution graded in the `single-test` and `tools-aggregate-schema` Areas of [`04-phases-single.md`](/grading/phases-single/).

- The **original documentation** — or the endpoint list extracted while authoring the schema — is the **validation baseline**.
- The grader MUST report any gap between the baseline and the implemented schema. Example: if a schema implements only 70% of the baseline-admitted endpoints, the grader MUST log the gap.
- The **point deduction MUST be proportional to the gap**, except where a per-endpoint justification under [`02-eligibility.md`](/grading/eligibility/) is recorded in the grading JSON.

Gap reporting is mandatory; gap penalisation is conditional on the absence of an eligibility-based justification recorded in the grading JSON.

---

## Cross-References

- [`00-overview.md`](/grading/overview/) — Conformance language, interoperability as the main focus.
- [`02-eligibility.md`](/grading/eligibility/) — Which endpoints are admitted (the maximalism boundary).
- [`04-phases-single.md`](/grading/phases-single/) — the `single-test` / `tools-aggregate-schema` Areas carry the completeness-validation grading.

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/)
- **Related:** [`02-eligibility.md`](/grading/eligibility/), [`04-phases-single.md`](/grading/phases-single/)

