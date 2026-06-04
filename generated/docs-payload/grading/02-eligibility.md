---
title: "Eligibility"
description: "This chapter defines **what is allowed to be part of a gradable schema**. Eligibility is the upstream gate: an endpoint that is not eligible MUST NOT appear in a schema. The maximalism principle in..."
grading_version: "3.0.0"
spec_file: "02-eligibility.md"
order: 2
section: "Grading"
normative: true
source_commit: "2e9a898"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2e9a898/grading/3.0.0/02-eligibility.md"
generated_at: "2026-06-04T21:10:58.055Z"
generated_from: "grading/3.0.0/02-eligibility.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/02-eligibility.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

## Purpose

This chapter defines **what is allowed to be part of a gradable schema**. Eligibility is the upstream gate: an endpoint that is not eligible MUST NOT appear in a schema. The maximalism principle in [`01-default-journey.md`](/grading/default-journey/) operates **inside** the eligibility boundary — "all admitted endpoints" means "all endpoints that pass the rules in this chapter".

---

## Read Focus (SHOULD)

The **core focus** of a FlowMCP schema is **reading data**. Write, update, and delete operations are not categorically forbidden, but they SHOULD NOT appear in a schema.

- Graders MUST NOT execute state-changing calls during grading. All grader-driven test invocations MUST be read-only.
- Schema authors SHOULD restrict the schema surface to read endpoints.

A schema that contains write/update/delete tools without an explicit, documented justification will be flagged under [Exclusion Criteria](#exclusion-criteria-must-not-appear-in-a-schema) below.

---

## Exclusion Criteria (MUST NOT appear in a schema)

The following endpoints MUST NOT be included in a gradable schema:

1. **Legally non-public endpoints** — endpoints that, by law or by the provider's published terms, are not permitted for public use.
2. **Non-general endpoints** — customer- or tenant-specific administration APIs (e.g. account-management endpoints scoped to a single tenant).
3. **Write/update/delete endpoints without justification** — write operations that lack a specific, documented reason for inclusion.
4. **Reachable but undocumented endpoints** — endpoints that are publicly reachable but **not actually documented**. These MAY indicate a provider-side defect (an endpoint that was unintentionally exposed) and MUST NOT be included on the assumption that "reachable = public-intent".

The **undocumented-endpoint exclusion** is a distinct, named exclusion ground. Reachability is not documentation.

---

### Empty-Context Convention (NEW in 1.1.0)

A grading is performed in an empty LLM context (`/clear` before start). This
obligation is **conventional** — it is not machine-checked, but is ensured
through the entry-point prompt (see [`20-entry-point-prompt.md`](/grading/entry-point-prompt/))
and the responsibility of the grader. By starting the prompt, the grader confirms
that no relevant prior context from earlier sessions is present.

Rationale: pre-loading the context (e.g. through prior research on the domain)
systematically biases the persona evaluation upward. Empty context is the
operational precondition for the persona Lens (see
[`12-personas-contract.md`](/grading/personas-contract/)) to evaluate genuinely
from the assigned persona rather than from the prior knowledge of the grader LLM.

| Aspect | Value |
|--------|-------|
| Obligation type | Convention (organisational, not technical) |
| Anchoring | Entry-point prompt in the grading repository ([`20-entry-point-prompt.md`](/grading/entry-point-prompt/)) |
| Checkable? | No — trust-based |
| Consequence of violation | Evaluation drift (the persona Lens escapes into the LLM's prior knowledge) |

Reference: [`20-entry-point-prompt.md`](/grading/entry-point-prompt/) (entry-point prompt template).

---

## Access Classes

A schema's endpoints fall into one of three access classes:

| Class | Status | Conditions |
|-------|--------|------------|
| Free, no API key | **Permitted** | Endpoint is callable without any credential. |
| API key (static) | **Permitted** | API key is passed at runtime start as a static parameter (e.g. `requiredServerParams`). |
| Commercial with free tier | **Permitted** | At least a partial free tier exists; otherwise the endpoint is treated as non-eligible. |

### OAuth — MUST NOT

**OAuth-based access is out of scope for `gradingSpec/1.0.0`.** Endpoints whose **only** access path is OAuth (interactive consent flow, user-bound tokens) MUST NOT be part of a gradable schema. This is a hard exclusion, not a soft "currently unsupported" — implementers MUST treat it as `MUST NOT` per BCP 14.

OAuth support MAY be introduced in a later spec version. Until then, no exception.

---

## Schema Splitting (MUST)

If a single API exposes both **freely accessible** and **API-key-only** endpoints, the freely accessible endpoints and the API-key-only endpoints **MUST be split into separate schemas**.

- One schema MUST NOT mix free and API-key-only endpoints.
- The split MUST be reflected in the schema metadata (e.g. distinct namespaces or distinct schema files).
- This split is independent of the maximalism principle: both schemas — the free schema and the API-key schema — MUST individually be maximalist under [`01-default-journey.md`](/grading/default-journey/).

The reason for the split is twofold: it lets the free schema be used without credentials, and it lets the grader run the free schema fully autonomously while gating the API-key schema on credential availability.

---

## Target Audience for Data Sources

The **primary** target audience for FlowMCP data sources is **public interfaces**:

- Public-sector authorities.
- Public institutions (universities, statistical offices, regulators).
- Private parties offering public data (open-data publishers).

The **secondary** target audience is **commercial providers with a free tier**.

Selection of data sources SHOULD reflect this priority order. Commercial APIs without a free tier do not belong in the FlowMCP corpus.

---

## Verification

The eligibility rules of [Exclusion Criteria](#exclusion-criteria-must-not-appear-in-a-schema)–[Target Audience for Data Sources](#target-audience-for-data-sources) are verified during the grading areas defined in [`04-phases-single.md`](/grading/phases-single/):

- [Exclusion Criteria](#exclusion-criteria-must-not-appear-in-a-schema) is enforced before the `single-test` area runs — the endpoint list MUST already be eligibility-classified.
- [Access Classes](#access-classes) and [Schema Splitting](#schema-splitting-must) are reflected in the `single-test` and `tools-aggregate-schema` areas.
- [Target Audience for Data Sources](#target-audience-for-data-sources) is a corpus-level guideline — verified by the maintainers, not by an automated grader.

The detailed verification method belongs to the grader implementation and is out of scope for this chapter.

---

## Cross-References

- [`00-overview.md`](/grading/overview/) — Conformance language.
- [`01-default-journey.md`](/grading/default-journey/) — The maximalism principle operates within the eligibility boundary defined here.
- [`04-phases-single.md`](/grading/phases-single/) — `single-test` and `tools-aggregate-schema` grading areas.

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/)
- **Related:** [`01-default-journey.md`](/grading/default-journey/), [`04-phases-single.md`](/grading/phases-single/), [`20-entry-point-prompt.md`](/grading/entry-point-prompt/)

