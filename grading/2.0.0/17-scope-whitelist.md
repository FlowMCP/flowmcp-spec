# 17 — Scope Whitelist + Public-only Principle

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`02-eligibility.md`](./02-eligibility.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`05-phases-selection.md`](./05-phases-selection.md), [`19-folder-layout.md`](./19-folder-layout.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** entirely new [Scope](#scope) chapter (scope whitelist + public-only principle).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## Scope

### Scope Whitelist

This spec defines explicitly which FlowMCP constructs are covered by the grading system. The `about` markdown resource and Skills now have a clear grading methodology and are in-scope (graded by their dedicated areas). All other Resources, Prompts, and Procedures remain FlowMCP constructs without a clear grading methodology — they lie outside the current scope.

| Element | Status | Rationale |
|---------|--------|-----------|
| **Tools** | In-Scope (primary) | Most measurable unit |
| **Shared Lists** | In-Scope (secondary) | Best available |
| **`about` markdown resource** | In-Scope | The single gradable resource — carries the Domain-Knowledge; graded by the `about-namespace` and `about-selection` areas |
| **Skills** (`type` namespace / selection / agent) | In-Scope | Graded per-skill by the `namespace-skills` and `selection-skills-L1/L2/L3` areas |
| Resources other than `about` (local files) | Out-of-Scope (on-hold) | Not reproducible |
| Resources (local SQLite) | Out-of-Scope (on-hold) | Private DB |
| Resources (SQL in general) | Out-of-Scope (on-hold) | Connection complexity |
| Prompts | Out-of-Scope (on-hold) | Unclear how to test |
| Procedures | Out-of-Scope (on-hold) | Unclear how to test |

Nine entries in total. The `about` markdown resource and Skills are in-scope; all other Resources, Prompts, and Procedures remain on-hold. Adding a new element to the whitelist is a `gradingSpec` bump.

### Public-only Principle

> The FlowMCP grading system is designed exclusively for publicly accessible data sources. Schemas that address private or non-publicly reachable resources lie outside the standardisation scope. Responsibility for grading such schemas rests with the schema author and the end user.

This principle is the consequence of [`02-eligibility.md`](./02-eligibility.md) (target audience — public interfaces) and the data-source access-class taxonomy. It prevents the grading system from taking responsibility for schemas whose data source belongs to another party (internal API, private SQLite, non-public SQL) outside the reach of the standardisation process.

### Consequences

- **Provider areas are tool-centric** (matches the whitelist) — the `single-test`, `tools-aggregate-schema`, and `tools-aggregate-namespace` areas evaluate tool aspects (see [`08-grading-model.md`](./08-grading-model.md))
- **Tool-aspect checks match the whitelist** — the provider-side tool areas are tool-centric and fit the whitelist
- **Existing non-tool code that is not `about` or a Skill is marked on-hold** — code audit
- **The `n/a` convention** (see [`08-grading-model.md`](./08-grading-model.md)) is the standard answer for out-of-scope fields of an otherwise valid schema (e.g. a schema has tools + resources — tools are graded, resources `n/a`)

### Relationship to Exclusion Criteria and Access Classes

The exclusion criteria and access classes in [`02-eligibility.md`](./02-eligibility.md) govern what is permitted *within* a schema (read-only, OAuth prohibition, free-tier requirement). [Scope](#scope) governs *what at all* is graded:

- Exclusion criteria / access classes: microscope (which endpoints may be inside?)
- Scope: telescope (which FlowMCP constructs are covered at all?)

The two complement each other. A schema can satisfy the exclusion criteria and access classes perfectly and still contain out-of-scope constructs (e.g. Procedures) — the Procedures then receive `n/a`, the tools are graded in full.

### Cross-Refs

- Tool-centric grading areas (`single-test`, `tools-aggregate-schema`, `tools-aggregate-namespace`) → [`08-grading-model.md`](./08-grading-model.md)
- `n/a` pragma → [`08-grading-model.md`](./08-grading-model.md)
- Eligibility (read focus, OAuth prohibition) → [`02-eligibility.md`](./02-eligibility.md)
- Target audience (public interfaces) → [`02-eligibility.md`](./02-eligibility.md)
- Folder layout (tools vs. Shared Lists paths) → [`19-folder-layout.md`](./19-folder-layout.md)
