---
title: "About Convention as a Schema Resource"
description: "The **About Resource** is a markdown Resource that describes what a namespace (or a selection) does, what it does not do, and which conventions it follows. It is a schema Resource — declared under..."
grading_version: "3.0.0"
spec_file: "11-about-convention.md"
order: 11
section: "Grading"
normative: true
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/grading/3.0.0/11-about-convention.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "grading/3.0.0/11-about-convention.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/11-about-convention.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

The **About Resource** is a markdown Resource that describes what a namespace (or a selection) does, what it does not do, and which conventions it follows. It is a schema Resource — declared under `main.resources` with the reserved name `about`, authored as markdown rather than a `.mjs` module — not a namespace route. It exists because consumers (LLM graders, skill authors, third-party tools, dashboards) repeatedly need one uniform way to ask *"what does this namespace do, what doesn't it do, which conventions does it follow?"* without reading the schema source first; this **guessability argument** is the deep reason the name `about` is reserved. The chapter has three parts: the declaration contract, the content contract, and the detection and grading of About on the namespace and selection levels.

## The About Resource as a Schema Resource

The About Resource is **a schema Resource**, not a namespace route. It is:

- declared in the schema as a Resource named `about` in `main.resources`,
- a markdown source (`.md`), **not** a `.mjs` module,
- stored under `resources/about/` of the primitive it belongs to (see [`19-folder-layout.md`](/grading/folder-layout/)).

The chapter has three parts:

1. The **declaration contract** — how About is declared in a schema (see [Declaration Contract](#declaration-contract)).
2. The **content contract** — what an About Resource MUST, SHOULD, and MAY carry (see [Content Contract](#content-contract)).
3. The **detection and grading** of About on the namespace and selection levels (see [Detection](#detection-deterministic)–[Selection-Level About](#selection-level-about--domain-knowledge)).

The About Resource exists because consumers — LLM graders, skill authors, third-party tools, dashboards — repeatedly need a uniform way to ask: *"What does this namespace do, what doesn't it do, which conventions does it follow?"* A single, conventionally named, declared Resource answers that question without the consumer having to read the schema source first. This is the **guessability argument**: it is the deep cause for reserving the name `about`; the content contract (see [Content Contract](#content-contract)) is what makes the reserved name worth asking against.

---

## Declaration Contract

The About Resource MUST be declared in the schema under `main.resources` with the reserved name `about`:

```text
resources.about = {
    source: 'markdown',
    origin: 'inline',
    name: '<namespace>-about.md',
    description: '<one-line summary>'
}
```

- `source: 'markdown'` — the Resource body is markdown.
- `origin: 'inline'` — the content is authored as part of the schema's resource set (inline-normalised on import).
- `name` — the logical file name; the versioned file lives in `resources/about/` (see [`19-folder-layout.md`](/grading/folder-layout/)). There is no flat `<namespace>-about.md`; only the versioned file exists, and the latest-resolution rule picks the newest.
- `description` — a one-line summary.

A Resource declared at the name `about` MUST conform to the content contract (see [Content Contract](#content-contract)). A schema MUST NOT use the name `about` for any Resource that is **not** an About Resource per this contract.

Only the `about` Resource is grading-relevant; **all other Resources are ignored** by the grader.

### Why a Schema Resource and Not a Namespace Route

A Resource technically never lives at namespace level — there is no namespace object to attach a Resource to, only schemas. About is therefore inserted into **one** schema of the namespace. The grader does not require a particular schema to carry it; the detector **searches namespace-wide** (see [Detection](#detection-deterministic)).

---

## Content Contract

The content of an About Resource is governed by the following MUST / SHOULD / MAY contract.

| Element | Required | Description |
|---------|----------|-------------|
| Capability summary — *what the namespace can do* | MUST | A short tool inventory in human-readable form: which tools are exposed, what each tool does at a glance. |
| Limitations — *what the namespace cannot do* | MUST | Explicit limitations. The user MUST be able to learn from the About Resource what they should NOT expect. |
| Tools with their conventions | MUST | Which tools follow which conventions (Shared Lists, naming, casing). A pointer to the relevant Domain-Knowledge content is sufficient. |
| Personas reference | MUST | Pointer to the personas (see [`12-personas-contract.md`](/grading/personas-contract/)) for which the namespace is built. The pointer MAY be a Lens identifier. |
| Use cases / application areas | MUST | Concrete scenarios in which the namespace adds value, written so that a decision-maker can read them without prior context. |
| Version / freshness metadata | SHOULD | Last-updated timestamp, source pointers for the inventory (test outputs, manual curation notes). |
| Background and motivation | MAY | History of the namespace, provider relationship, sponsorship. |

An About Resource that lacks any MUST element scores low on the **content (non-deterministic) sub-part**; the **deterministic sub-part** (the route-exists check) still passes as long as the declared Resource and its file exist.

---

## Detection (Deterministic)

The detector runs as the deterministic sub-part of the `about-namespace` Area (provider side) and `about-selection` Area (selection side). It performs two checks:

1. Is a Resource named `about` declared in **one** schema of the namespace (or in the selection definition)?
2. Does the backing markdown file exist under `resources/about/`?

If either check fails, the result is `about: false` and the dependent content grading does not run. For the provider side the detector searches **namespace-wide** — the About Resource may be declared in any one schema of the namespace.

---

## Consumers

The About Resource is consumed by three classes of actor:

| Consumer | Use |
|----------|-----|
| Skills (see [`13-skills.md`](/grading/skills/)) | A namespace skill MUST reference the namespace's About Resource. A selection skill MAY reference multiple About Resources. |
| Graders | The selection-side grader reads the About Resource as the source of truth for `personaUseCaseFit` reasoning, and as the Domain-Knowledge content for `domainConformance`. |
| Third parties | External tools (registry dashboards, agent runtimes, IDE plugins) can consume the About Resource as the *README of the namespace*. |

---

## Selection-Level About (= Domain-Knowledge)

Every selection SHOULD expose its own About Resource under `selections/<selection>/resources/about/`. On the selection level the About Resource **doubles as the Domain-Knowledge content** of the group: it carries the seven mandatory sections defined in [`10-domain-knowledge.md`](/grading/domain-knowledge/). It is graded by the `about-selection` Area.

**Score consequence.** Absence of a selection-level About Resource is **NOT** a Categorical Veto. It IS a score deduction at the `group-bound` level: a selection without its own About Resource cannot reach the top of the About grading even when each contained namespace has its own About Resource. Because the selection-level About also carries the Domain-Knowledge content, its absence additionally blocks `domainConformance` from being scored above `stale` / `n/a` (see [`10-domain-knowledge.md`](/grading/domain-knowledge/)).

### Why SHOULD and Not MUST

A MUST at the selection level would over-burden small selections. A selection composed of two tools and intended for ad-hoc use should not be forced to maintain its own About Resource — the cost outweighs the benefit.

### Why SHOULD and Not MAY

A MAY at the selection level would surrender the guessability argument from [Purpose](#purpose). A selection's About Resource is precisely what an agent asks for when entering the selection; if it MAY be present or absent without consequence, agents cannot rely on it. SHOULD preserves guessability (consumers can ask blind) while still allowing for the small-selection exception (no veto).

---

## Grading Effect

| Dimension | Determinism | Tier | Source (Area) |
|-----------|-------------|------|----------------|
| About Resource compliance (route-exists) | deterministic | autonomous | `about-namespace` |
| About Resource compliance (content quality) | non-deterministic | autonomous | `about-namespace` |
| About Resource compliance (selection content + Domain-Knowledge) | deterministic + non-deterministic | group-bound | `about-selection` |
| `personaUseCaseFit` (consumes About) | non-deterministic | group-bound | `selection-aggregate` |

The deterministic sub-part is binary: the declared `about` Resource and its file exist (pass) or they do not (fail). The non-deterministic sub-part scores the content against the contract (see [Content Contract](#content-contract)). The mixed-form handling rule from [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) applies.

---

## Relationship to the Schemas-Spec

The Schemas-Spec — particularly [`13-resources.md`](../../spec/v4.3.0/13-resources.md) — defines the Resource primitive. This Grading-Spec adds the **convention** that one Resource named `about` carries the content contract above. The reservation is a **forward-looking convention**, applied by graders that conform to this Grading-Spec. A schema-validator MUST NOT reject a schema for failing the About convention — the convention's enforcement lives entirely in the grader, not in the schema validator.

## Related

- [`00-overview.md`](/grading/overview/)
- [`08-grading-model.md`](/grading/grading-model/)
- [`13-resources.md`](../../spec/v4.3.0/13-resources.md)
- [`17-selections.md`](../../spec/v4.3.0/17-selections.md)
- [`10-domain-knowledge.md`](/grading/domain-knowledge/)
- [`12-personas-contract.md`](/grading/personas-contract/)
- [`13-skills.md`](/grading/skills/)
- [`19-folder-layout.md`](/grading/folder-layout/)
- [`21-pre-conditions.md`](/grading/pre-conditions/)

