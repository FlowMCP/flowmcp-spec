---
title: "10 — Domain Knowledge and Group Definition"
description: "A **topic group** (selection composed of several namespaces) develops conventions, shared vocabularies, and provider-specific quirks that are not visible from any single namespace in isolation...."
grading_version: "2.0.0"
spec_file: "10-domain-knowledge.md"
order: 10
section: "Grading"
normative: true
source_commit: "4a4d7c2"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/4a4d7c2/grading/2.0.0/10-domain-knowledge.md"
generated_at: "2026-05-31T16:52:18.836Z"
generated_from: "grading/2.0.0/10-domain-knowledge.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/10-domain-knowledge.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md), [`09-security-and-development.md`](./09-security-and-development.md) |
| Related | [`05-phases-selection.md`](./05-phases-selection.md), [`11-about-convention.md`](./11-about-convention.md), [`12-personas-contract.md`](./12-personas-contract.md), [`13-skills.md`](./13-skills.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## 1. Purpose

A **topic group** (selection composed of several namespaces) develops conventions, shared vocabularies, and provider-specific quirks that are not visible from any single namespace in isolation. Grading at the `group-bound` tier (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §3.2) MUST be validated against the group's **Domain-Knowledge content** — and that content lives in the selection's **About Resource**, not in a separate document.

This is a binding identity in this spec: the **Domain-Knowledge = the About Resource of the selection** (graded by the `about-selection` Area, see [`05-phases-selection.md`](./05-phases-selection.md) and [`11-about-convention.md`](./11-about-convention.md)). It is an **internal document**, written so that it carries the seven mandatory sections of §3 below. There is no second file.

Without Domain-Knowledge content for a group, the selection-side grader cannot produce a `group-bound` grading entry. The schemas in the selection MAY still be graded at the `autonomous` tier; those grading entries then carry `gradingTier = autonomous` and `maxAttainableGrade = B`.

The dimension that consumes the Domain-Knowledge content is `domainConformance` (carried by the `selection-aggregate` Area). It checks the **members against the document** — distinct from `about-selection`, which checks the **document quality**. The two checks are independent; there is no circularity.

---

## 2. Group Definition

A "group" — i.e. a selection deserving its own Domain-Knowledge content — is defined by **two thresholds** over the number of namespaces in the selection:

| Threshold | Condition | Effect |
|-----------|-----------|--------|
| **Soft** | ≥ **5** namespaces | A selection SHOULD be treated as a group. Selection skills MAY be created. The selection Areas (see [`05-phases-selection.md`](./05-phases-selection.md)) run with **reduced expectations**. `aggregateGrade = A` is NOT regularly attainable at this threshold. |
| **Hard** | ≥ **7** namespaces | Full group optimisation applies. `personaUseCaseFit` is fully scaled. `aggregateGrade = A` is **regularly attainable** at this threshold. |

A selection with **fewer than 5 namespaces** is explicitly **not a group in the narrow sense**. A 3-namespace selection MAY still be grouped for convenience (UI grouping, skill registration), but it does NOT trigger the group-bound grading path; entries derived from it carry `gradingTier = autonomous`.

### 2.1 Diversity Argument

> *"The more namespaces a selection contains, the better."*

This statement is the rationale behind the hard threshold of seven. Diversity of sources is the precondition for a meaningful persona-/domain-conformance evaluation: a selection that aggregates only two or three providers cannot reliably tell whether a given convention is a domain-wide standard or a single-provider quirk. The hard threshold encodes this preference structurally.

---

## 3. Mandatory Sections of the Domain-Knowledge Content

The Domain-Knowledge content (carried by the selection's About Resource) MUST contain the following **seven sections**. The document MAY add further sections; the seven below are the binding minimum. Content that lacks any of these sections is INVALID for the purpose of `domainConformance` grading and scores low on `about-selection`.

1. **Identity** — group identifier, human name, one-paragraph description.
2. **Shared Lists** — the list of Shared Lists the group adopts (e.g. the Shared Chain Name List), with a MUST-statement that schemas in the group use the Shared List in place of any provider-specific convention.
3. **Conventions** — naming, casing, ordering, aggregation strategy. The conventions the group has agreed upon and which schemas MUST follow.
4. **Forbidden Conventions** — explicitly listed **provider conventions** that schemas MUST NOT adopt. The crypto example below is the canonical illustration.
5. **Use Cases** — typical scenarios the group serves; the source of truth for `personaUseCaseFit` reasoning at the selection level.
6. **Personas Reference and Lens** — which of the four generalised base personas (see [`12-personas-contract.md`](./12-personas-contract.md)) apply to the group, including the group's **Lens definitions** (e.g. `crypto-trader` as a Lens over `decision-maker`).
7. **Aging Rule** — how long the content remains valid for grading purposes. Default: **90 days**. Once exceeded, the content MUST be re-reviewed; grading entries that referenced it MAY be marked `score = stale` per the aging rule in [`08-grading-model.md`](./08-grading-model.md) §9.

The aging rule for the Domain-Knowledge content itself is separate from the aging defaults for individual dimensions (`API_DAYS`, `TOS_DAYS`, `RETENTION_DAYS` — see [`08-grading-model.md`](./08-grading-model.md) §9). The 90-day default for Domain-Knowledge content is a SHOULD; groups MAY override.

---

## 4. Crypto Reference Example

The crypto domain is the canonical illustration of the Domain-Knowledge contract, and the **Forbidden Conventions** section is where the contract bites.

**Concrete conflict.** A widely-used third-party data provider uses the chain name `solana` in its API responses. The Shared Chain Name List — adopted by the crypto group as its canonical Shared List — uses `sol` for the same chain. A schema in the crypto selection that emits `solana` (the provider's convention) instead of `sol` (the Shared List) is in **direct conflict** with the group's Domain-Knowledge content.

**Grading consequence.** The grader records a Forbidden-Conventions violation in the `domainConformance` dimension. The violation is **a penalty, NOT a Categorical Veto** — it does not raise `aggregateGrade = REJECTED`. It IS a **strong score reduction** on `domainConformance` via a high `weight`. The high weight reflects the repeated experience of having to explain the Shared-List rule across multiple schema reviews.

The choice of "high weight, no veto" deliberately keeps the door open: a schema that violates a Forbidden Convention is **fixable** by remapping the value at the schema's output layer, and the grading should incentivise the fix rather than reject the schema outright.

---

## 5. Diversity Maxim — "More Namespaces, Better"

The maxim from §2.1 has a second concrete consequence beyond the hard threshold: **more namespaces in a group widen the basis** against which `domainConformance` can be evaluated. A 7-namespace crypto selection that draws from many distinct providers exposes provider quirks (e.g. one provider's `solana` vs. another's native chain identifier) to direct comparison; a 3-namespace selection cannot do this comparison at all.

The grading consequence is **indirect** — there is no dimension named "namespace diversity" — but the maxim is reflected in:

- the hard threshold of 7 (§2),
- the high weight on Forbidden-Conventions violations (§4),
- the binding obligation to list Shared Lists in the Domain-Knowledge content (§3 section 2).

Groups that aspire to `aggregateGrade = A` SHOULD aim for ≥ 7 namespaces and a comprehensive Forbidden-Conventions section.

---

## 6. Storage Location

The Domain-Knowledge content is the selection's **About Resource**. It is stored at:

```
selections/<selection>/resources/about/
```

as a markdown Resource (see [`11-about-convention.md`](./11-about-convention.md) and [`19-folder-layout.md`](./19-folder-layout.md)). It is graded by `about-selection`. There is no separate Domain-Knowledge file path — the selection's About Resource is the single internal document that carries the seven sections of §3.

A grading entry that uses Domain-Knowledge content records the resolved About Resource reference in its `selectionContext` (see [`08-grading-model.md`](./08-grading-model.md)).

---

## 7. Grading Effect

| Dimension | Tier | Effect |
|-----------|------|--------|
| `domainConformance` | `group-bound` | Score reflects alignment of the **members** with the group's Conventions and absence of Forbidden-Conventions violations. Without Domain-Knowledge content, `domainConformance` cannot be scored above `stale` / `n/a`. Carried by `selection-aggregate`. |
| `personaUseCaseFit` | `group-bound` | Reads the Personas Reference and Use Cases sections of the Domain-Knowledge content as ground truth. Carried by `selection-aggregate`. |

**Binding rule.** Without Domain-Knowledge content for a group, no `group-bound` grading entry can be produced, and `aggregateGrade = A` is consequently NOT attainable for the schemas in that selection. This rule is the **structural enforcement** of the diversity maxim: groups have to invest in their About Resource to unlock the top grade.

---

## 8. Cross-References

- [`05-phases-selection.md`](./05-phases-selection.md) — the `about-selection` and `selection-aggregate` Areas that consume the Domain-Knowledge content.
- [`08-grading-model.md`](./08-grading-model.md) — the `domainConformance` dimension and the `selectionContext` field.
- [`09-security-and-development.md`](./09-security-and-development.md) §7 — Shared-List enforcement is referenced from the security chapter.
- [`11-about-convention.md`](./11-about-convention.md) — About as a markdown schema Resource; the carrier of the Domain-Knowledge content.
- [`12-personas-contract.md`](./12-personas-contract.md) — the Personas Reference section consumes the persona slugs and Lens definitions.
- [`13-skills.md`](./13-skills.md) — selection-skill validation reads the group's Domain-Knowledge content as context.
