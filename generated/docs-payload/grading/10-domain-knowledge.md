---
title: "Domain Knowledge and Group Definition"
description: "A **topic group** — a selection composed of several namespaces — develops conventions, shared vocabularies, and provider-specific quirks that are invisible from any single namespace in isolation...."
grading_version: "3.0.0"
spec_file: "10-domain-knowledge.md"
order: 10
section: "Grading"
normative: true
source_commit: "55474a9"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/55474a9/grading/3.0.0/10-domain-knowledge.md"
generated_at: "2026-06-21T18:24:22.826Z"
generated_from: "grading/3.0.0/10-domain-knowledge.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/10-domain-knowledge.md."
---

A **topic group** — a selection composed of several namespaces — develops conventions, shared vocabularies, and provider-specific quirks that are invisible from any single namespace in isolation. Grading at the `group-bound` tier MUST be validated against the group's **Domain-Knowledge content**, and that content lives in the selection's **About Resource** rather than a separate document — a binding identity rather than a loose association. This chapter sets the two thresholds under which a selection counts as a group, lists the seven mandatory sections the content must carry, and traces how it feeds the `domainConformance` and `personaUseCaseFit` dimensions.

## Domain-Knowledge as the Selection's About Resource

A **topic group** (selection composed of several namespaces) develops conventions, shared vocabularies, and provider-specific quirks that are not visible from any single namespace in isolation. Grading at the `group-bound` tier (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/)) MUST be validated against the group's **Domain-Knowledge content** — and that content lives in the selection's **About Resource**, not in a separate document.

This is a binding identity in this spec: the **Domain-Knowledge = the About Resource of the selection** (graded by the `about-selection` Area, see [`05-phases-selection.md`](/grading/phases-selection/) and [`11-about-convention.md`](/grading/about-convention/)). It is an **internal document**, written so that it carries the seven mandatory sections of [Mandatory Sections](#mandatory-sections-of-the-domain-knowledge-content) below. There is no second file.

Without Domain-Knowledge content for a group, the selection-side grader cannot produce a `group-bound` grading entry. The schemas in the selection MAY still be graded at the `autonomous` tier; those grading entries then carry `gradingTier = autonomous` and `maxAttainableGrade = B`.

The dimension that consumes the Domain-Knowledge content is `domainConformance` (carried by the `selection-aggregate` Area). It checks the **members against the document** — distinct from `about-selection`, which checks the **document quality**. The two checks are independent; there is no circularity.

---

## Group Definition

A "group" — i.e. a selection deserving its own Domain-Knowledge content — is defined by **two thresholds** over the number of namespaces in the selection:

| Threshold | Condition | Effect |
|-----------|-----------|--------|
| **Soft** | ≥ **5** namespaces | A selection SHOULD be treated as a group. Selection skills MAY be created. The selection Areas (see [`05-phases-selection.md`](/grading/phases-selection/)) run with **reduced expectations**. `aggregateGrade = A` is NOT regularly attainable at this threshold. |
| **Hard** | ≥ **7** namespaces | Full group optimisation applies. `personaUseCaseFit` is fully scaled. `aggregateGrade = A` is **regularly attainable** at this threshold. |

A selection with **fewer than 5 namespaces** is explicitly **not a group in the narrow sense**. A 3-namespace selection MAY still be grouped for convenience (UI grouping, skill registration), but it does NOT trigger the group-bound grading path; entries derived from it carry `gradingTier = autonomous`.

### Diversity Argument

> *"The more namespaces a selection contains, the better."*

This statement is the rationale behind the hard threshold of seven. Diversity of sources is the precondition for a meaningful persona-/domain-conformance evaluation: a selection that aggregates only two or three providers cannot reliably tell whether a given convention is a domain-wide standard or a single-provider quirk. The hard threshold encodes this preference structurally.

---

## Mandatory Sections of the Domain-Knowledge Content

The Domain-Knowledge content (carried by the selection's About Resource) MUST contain the following **seven sections**. The document MAY add further sections; the seven below are the binding minimum. Content that lacks any of these sections is INVALID for the purpose of `domainConformance` grading and scores low on `about-selection`.

1. **Identity** — group identifier, human name, one-paragraph description.
2. **Shared Lists** — the list of Shared Lists the group adopts (e.g. the Shared Chain Name List), with a MUST-statement that schemas in the group use the Shared List in place of any provider-specific convention.
3. **Conventions** — naming, casing, ordering, aggregation strategy. The conventions the group has agreed upon and which schemas MUST follow.
4. **Forbidden Conventions** — explicitly listed **provider conventions** that schemas MUST NOT adopt. The crypto example below is the canonical illustration.
5. **Use Cases** — typical scenarios the group serves; the source of truth for `personaUseCaseFit` reasoning at the selection level.
6. **Personas Reference and Lens** — which of the four generalised base personas (see [`12-personas-contract.md`](/grading/personas-contract/)) apply to the group, including the group's **Lens definitions** (e.g. `crypto-trader` as a Lens over `decision-maker`).
7. **Aging Rule** — how long the content remains valid for grading purposes. Default: **90 days**. Once exceeded, the content MUST be re-reviewed; grading entries that referenced it MAY be marked `score = stale` per the aging rule in [`08-grading-model.md`](/grading/grading-model/).

The aging rule for the Domain-Knowledge content itself is separate from the aging defaults for individual dimensions (`API_DAYS`, `TOS_DAYS`, `RETENTION_DAYS` — see [`08-grading-model.md`](/grading/grading-model/)). The 90-day default for Domain-Knowledge content is a SHOULD; groups MAY override.

---

## Crypto Reference Example

The crypto domain is the canonical illustration of the Domain-Knowledge contract, and the **Forbidden Conventions** section is where the contract bites.

**Concrete conflict.** A widely-used third-party data provider uses the chain name `solana` in its API responses. The Shared Chain Name List — adopted by the crypto group as its canonical Shared List — uses `sol` for the same chain. A schema in the crypto selection that emits `solana` (the provider's convention) instead of `sol` (the Shared List) is in **direct conflict** with the group's Domain-Knowledge content.

**Grading consequence.** The grader records a Forbidden-Conventions violation in the `domainConformance` dimension. The violation is **a penalty, NOT a Categorical Veto** — it does not raise `aggregateGrade = REJECTED`. It IS a **strong score reduction** on `domainConformance` via a high `weight`. The high weight reflects the repeated experience of having to explain the Shared-List rule across multiple schema reviews.

The choice of "high weight, no veto" deliberately keeps the door open: a schema that violates a Forbidden Convention is **fixable** by remapping the value at the schema's output layer, and the grading should incentivise the fix rather than reject the schema outright.

---

## Diversity Maxim — "More Namespaces, Better"

The maxim from [Diversity Argument](#diversity-argument) has a second concrete consequence beyond the hard threshold: **more namespaces in a group widen the basis** against which `domainConformance` can be evaluated. A 7-namespace crypto selection that draws from many distinct providers exposes provider quirks (e.g. one provider's `solana` vs. another's native chain identifier) to direct comparison; a 3-namespace selection cannot do this comparison at all.

The grading consequence is **indirect** — there is no dimension named "namespace diversity" — but the maxim is reflected in:

- the hard threshold of 7 (see [Group Definition](#group-definition)),
- the high weight on Forbidden-Conventions violations (see [Crypto Reference Example](#crypto-reference-example)),
- the binding obligation to list Shared Lists in the Domain-Knowledge content (see [Mandatory Sections](#mandatory-sections-of-the-domain-knowledge-content), section 2).

Groups that aspire to `aggregateGrade = A` SHOULD aim for ≥ 7 namespaces and a comprehensive Forbidden-Conventions section.

---

## Storage Location

The Domain-Knowledge content is the selection's **About Resource**. It is stored at:

```
selections/<selection>/resources/about/
```

as a markdown Resource (see [`11-about-convention.md`](/grading/about-convention/) and [`19-folder-layout.md`](/grading/folder-layout/)). It is graded by `about-selection`. There is no separate Domain-Knowledge file path — the selection's About Resource is the single internal document that carries the seven sections of [Mandatory Sections](#mandatory-sections-of-the-domain-knowledge-content).

A grading entry that uses Domain-Knowledge content records the resolved About Resource reference in its `selectionContext` (see [`08-grading-model.md`](/grading/grading-model/)).

---

## Grading Effect

| Dimension | Tier | Effect |
|-----------|------|--------|
| `domainConformance` | `group-bound` | Score reflects alignment of the **members** with the group's Conventions and absence of Forbidden-Conventions violations. Without Domain-Knowledge content, `domainConformance` cannot be scored above `stale` / `n/a`. Carried by `selection-aggregate`. |
| `personaUseCaseFit` | `group-bound` | Reads the Personas Reference and Use Cases sections of the Domain-Knowledge content as ground truth. Carried by `selection-aggregate`. |

**Binding rule.** Without Domain-Knowledge content for a group, no `group-bound` grading entry can be produced, and `aggregateGrade = A` is consequently NOT attainable for the schemas in that selection. This rule is the **structural enforcement** of the diversity maxim: groups have to invest in their About Resource to unlock the top grade.

## Related

- [`00-overview.md`](/grading/overview/) — how FlowMCP schemas and selections are evaluated and graded.
- [`08-grading-model.md`](/grading/grading-model/) — the grading entry data model, its veto power, and tier trim.
- [`09-security-and-development.md`](/grading/security-and-development/) — the security and development checks that carry high categorical-veto affinity.
- [`05-phases-selection.md`](/grading/phases-selection/) — the five selection-side areas that grade a curated group of namespaces.
- [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) — the two axes that decide reproducibility and the highest grade a dimension can reach.
- [`11-about-convention.md`](/grading/about-convention/) — the reserved About markdown Resource that describes what a namespace does.
- [`12-personas-contract.md`](/grading/personas-contract/) — how a grading entry references one of the four base personas and a lens.
- [`13-skills.md`](/grading/skills/) — how namespace skills and leveled selection skills are graded differently.

