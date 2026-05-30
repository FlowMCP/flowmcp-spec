# 17 — Scope Whitelist + Public-only Principle (§12)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`02-eligibility.md`](./02-eligibility.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`05-phases-selection.md`](./05-phases-selection.md), [`19-folder-layout.md`](./19-folder-layout.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** entirely new section §12 (scope whitelist + public-only principle).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §12 Scope

### §12.1 Scope Whitelist

`gradingSpec/1.1.0` defines explicitly which FlowMCP constructs are covered by the grading system. Resources, Prompts, and Procedures are FlowMCP constructs without a clear grading methodology — they lie outside the current scope.

| Element | Status | Rationale |
|---------|--------|-----------|
| **Tools** | In-Scope (primary) | Most measurable unit |
| **Shared Lists** | In-Scope (secondary) | Best available |
| Resources (local files) | Out-of-Scope (on-hold) | Not reproducible |
| Resources (local SQLite) | Out-of-Scope (on-hold) | Private DB |
| Resources (SQL in general) | Out-of-Scope (on-hold) | Connection complexity |
| Prompts | Out-of-Scope (on-hold) | Unclear how to test |
| Procedures | Out-of-Scope (on-hold) | Unclear how to test |

Seven entries in total. Adding a new element to the whitelist is a `gradingSpec` bump.

### §12.2 Public-only Principle

> The FlowMCP grading system is designed exclusively for publicly accessible data sources. Schemas that address private or non-publicly reachable resources lie outside the standardisation scope. Responsibility for grading such schemas rests with the schema author and the end user.

This principle is the consequence of [`02-eligibility.md`](./02-eligibility.md) §6 (target audience — public interfaces) and the data-source access-class taxonomy. It prevents the grading system from taking responsibility for schemas whose data source belongs to another party (internal API, private SQLite, non-public SQL) outside the reach of the standardisation process.

### §12.3 Consequences

- **Single phases are tool-centric** (matches the whitelist) — the 17 Single dimensions P1-P7 evaluate tool aspects (see [`08-grading-model.md`](./08-grading-model.md) §5.1.1)
- **§5.1 checks tool aspects** (matches) — the Single dimensions are tool-centric and fit the whitelist
- **Existing non-tool code is marked on-hold** — code audit
- **The `n/a` convention** (see [`08-grading-model.md`](./08-grading-model.md) §12) is the standard answer for out-of-scope fields of an otherwise valid schema (e.g. a schema has tools + resources — tools are graded, resources `n/a`)

### §12.4 Relationship to §3 (Exclusion Criteria) and §4 (Access Classes)

§3 and §4 in [`02-eligibility.md`](./02-eligibility.md) govern what is permitted *within* a schema (read-only, OAuth prohibition, free-tier requirement). §12 governs *what at all* is graded:

- §3/§4: microscope (which endpoints may be inside?)
- §12: telescope (which FlowMCP constructs are covered at all?)

The two complement each other. A schema can satisfy §3/§4 perfectly and still contain out-of-scope constructs (e.g. Procedures) — the Procedures then receive `n/a`, the tools are graded in full.

### §12.5 Cross-Refs

- Tool dimensions P1-P7 → [`08-grading-model.md`](./08-grading-model.md) §5.1.1
- `n/a` pragma → [`08-grading-model.md`](./08-grading-model.md) §12
- Eligibility (read focus, OAuth prohibition) → [`02-eligibility.md`](./02-eligibility.md) §3, §4
- Target audience (public interfaces) → [`02-eligibility.md`](./02-eligibility.md) §6
- Folder layout (tools vs. Shared Lists paths) → [`19-folder-layout.md`](./19-folder-layout.md) §17
