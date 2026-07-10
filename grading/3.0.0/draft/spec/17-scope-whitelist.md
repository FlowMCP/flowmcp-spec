# 17. Scope Allowlist + Public-only Principle

| Field | Value |
|---|---|
| Status | Normative |
| Depends on | [`00-overview.md`](./00-overview.md), [`02-eligibility.md`](./02-eligibility.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`02-eligibility.md`](./02-eligibility.md), [`08-grading-model.md`](./08-grading-model.md), [`05-phases-selection.md`](./05-phases-selection.md), [`19-folder-layout.md`](./19-folder-layout.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** entirely new [Scope](#scope) chapter (scope allowlist + public-only principle).

The grading system covers only an explicit allowlist of FlowMCP constructs: Tools, Shared Lists, the `about` markdown resource, and Skills are gradable, while all other Resources, Prompts, and Procedures stay on-hold because they lack a clear grading methodology. A second, orthogonal boundary applies on top of that allowlist — the public-only principle restricts grading to publicly accessible data sources, leaving private or non-public interfaces to the schema author. This chapter defines both boundaries and the consequences they have for which areas run and how out-of-scope fields are answered.

---

## Scope

### Scope Allowlist

The grading system covers an explicit allowlist of FlowMCP constructs. The `about` markdown resource and Skills have a clear grading methodology and are in-scope (graded by their dedicated areas). All other Resources, Prompts, and Procedures remain FlowMCP constructs without a clear grading methodology — they lie outside the current scope.

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

Nine entries in total. The `about` markdown resource and Skills are in-scope; all other Resources, Prompts, and Procedures remain on-hold. Adding a new element to the allowlist is a `gradingSpec` bump.

### Public-only Principle

> The FlowMCP grading system is designed exclusively for publicly accessible data sources. Schemas that address private or non-publicly reachable resources lie outside the standardisation scope. Responsibility for grading such schemas rests with the schema author and the end user.

This principle is the consequence of [`02-eligibility.md`](./02-eligibility.md) (target audience — public interfaces) and the data-source access-class taxonomy. It prevents the grading system from taking responsibility for schemas whose data source belongs to another party (internal API, private SQLite, non-public SQL) outside the reach of the standardisation process.

### Consequences

- **Provider areas are tool-centric** (matches the allowlist) — the `single-test`, `tools-aggregate-schema`, and `tools-aggregate-namespace` areas evaluate tool aspects (see [`08-grading-model.md`](./08-grading-model.md))
- **Existing non-tool code that is not `about` or a Skill is marked on-hold** — code audit
- **The `n/a` convention** (see [`08-grading-model.md`](./08-grading-model.md)) is the standard answer for out-of-scope fields of an otherwise valid schema (e.g. a schema has tools + resources — tools are graded, resources `n/a`)

### Relationship to Exclusion Criteria and Access Classes

The exclusion criteria and access classes in [`02-eligibility.md`](./02-eligibility.md) govern what is permitted *within* a schema (read-only, OAuth prohibition, free-tier requirement). [Scope](#scope) governs *what at all* is graded:

- Exclusion criteria / access classes: microscope (which endpoints may be inside?)
- Scope: telescope (which FlowMCP constructs are covered at all?)

The two complement each other. A schema can satisfy the exclusion criteria and access classes perfectly and still contain out-of-scope constructs (e.g. Procedures) — the Procedures then receive `n/a`, the tools are graded in full.


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./00-overview.md](./00-overview.md) — see chapter 00.
- [./02-eligibility.md](./02-eligibility.md) — see chapter 02.
- [./05-phases-selection.md](./05-phases-selection.md) — see chapter 05.
- [./08-grading-model.md](./08-grading-model.md) — see chapter 08.
- [./19-folder-layout.md](./19-folder-layout.md) — see chapter 19.
