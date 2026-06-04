---
title: "Personas Contract"
description: "The Grading-Spec does NOT define personas of its own. It **references** the personas maintained in the sister repository `flowmcp-spec` at the path `repos/flowmcp-spec/personas/`. That folder is the..."
grading_version: "3.0.0"
spec_file: "12-personas-contract.md"
order: 12
section: "Grading"
normative: true
source_commit: "62b50d4"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/62b50d4/grading/3.0.0/12-personas-contract.md"
generated_at: "2026-06-04T13:49:20.413Z"
generated_from: "grading/3.0.0/12-personas-contract.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/12-personas-contract.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

## Source of Truth

The Grading-Spec does NOT define personas of its own. It **references** the personas maintained in the sister repository `flowmcp-spec` at the path `repos/flowmcp-spec/personas/`. That folder is the **single source of truth** for persona identity, goals, scenarios, and success criteria.

At this spec version, the personas folder contains **four generalised personas** plus a set of helper documents:

| Persona | Slug | Short description |
|---------|------|-------------------|
| AI Engineer | `ai-engineer` | A developer who integrates schemas into agent runtimes and cares about deterministic, machine-consumable contracts. |
| Decision Maker | `decision-maker` | A user who consumes the output of schemas to make a downstream decision (trade, route, escalation, purchase). |
| Hackathon Builder | `hackathon-builder` | A builder under time pressure who needs working primitives without deep documentation. |
| Schema Maintainer | `schema-maintainer` | A maintainer of one or several schemas who cares about test coverage, conventions, and grading feedback. |

Helper documents in the same folder are:

- `overview.md` — index of the personas.
- `entry-points.md` — how personas enter the system.
- `persona-lens.md` — the Lens concept (see [Lens Concept](#lens-concept)).
- `_template.md` — the persona template (see [Persona Template](#persona-template-derived)).
- `diagramme-policy.md`, `tone-guide.md`, `vision.md` — style and tone references.

Implementers MUST read the personas in `repos/flowmcp-spec/personas/` before producing a `group-bound` grading entry. Any deviation from these four generalised personas requires a Lens (see [Lens Concept](#lens-concept)), not a new generalised persona.

---

## Persona Reference Contract for Grading Entries

A grading entry's `persona` field (see [`08-grading-model.md`](/grading/grading-model/)) carries a persona reference. The contract is the pair `{basePersonaId, lensId}`. Implementers MAY model the reference as the `basePersonaId` slug alone when no Lens applies.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `basePersonaId` | `string` | MUST | Slug as listed in [Source of Truth](#source-of-truth) (`ai-engineer`, `decision-maker`, `hackathon-builder`, `schema-maintainer`). The slug MUST be one of the four — new generalised slugs require a spec version bump. |
| `lensId` | `string` | SHOULD | The domain-specific Lens identifier (see [Lens Concept](#lens-concept)). When present, narrows the generalised base persona to the group's domain. |

The persona reference is attached to the **persona-bearing Areas** (see [`04-phases-single.md`](/grading/phases-single/) and [`05-phases-selection.md`](/grading/phases-selection/)): the `about-*`, `*-skills`, and `selection-aggregate` Areas carry a persona; the tool-level Areas (`single-test`, `tools-aggregate-*`, `namespace-description`) do not. The persona reference is **not coupled to the determinism axis** — a non-deterministic dimension does not by itself require a persona; the persona obligation follows the Area, not the determinism value.

The pair maps to the persona-template structure in `repos/flowmcp-spec/personas/_template.md`: **identity** (`basePersonaId`), **scenario** (the group / domain context provided by the Lens and the Domain-Knowledge content), **success criteria** (resolvable from the persona file + the Domain-Knowledge content's Use Cases section).

---

## Persona Template (Derived)

The persona-template structure (`_template.md`) is the source for the contract above. The template fields and their mapping to the grading contract:

| Template field | Maps to | Source |
|----------------|---------|--------|
| Identity | `basePersonaId` | `repos/flowmcp-spec/personas/<slug>.md` header |
| Goal | (resolved by aggregator) | Persona file + Domain-Knowledge content's Personas Reference |
| Scenario | `lensId` | Domain-Knowledge content; the Lens narrows the scenario to the domain |
| Success criteria | (resolved by aggregator) | Domain-Knowledge content's Use Cases + Personas Reference |

The mapping is the binding interpretation of the template. Implementers MUST NOT introduce additional persona fields without a `gradingSystem` bump.

---

## Lens Concept

The Lens concept — described in detail in `repos/flowmcp-spec/personas/persona-lens.md` — is the **hybrid generalisation model** of this spec. Two design choices live behind it:

1. **Generalised personas as the base.** The four personas in [Source of Truth](#source-of-truth) are deliberately abstract; they apply across every domain.
2. **Domain-specific Lenses as optional refinements.** A group's Domain-Knowledge content (see [`10-domain-knowledge.md`](/grading/domain-knowledge/), section 6) MAY define one or more Lenses, each narrowing a generalised base persona to a domain-specific shape.

A Lens is a **named refinement** identified by a slug (e.g. `crypto-trader`, `mobility-planner`). The Lens slug is carried in the optional `lensId` field of the persona reference contract (see [Persona Reference Contract](#persona-reference-contract-for-grading-entries)).

### Example — Crypto (`crypto-trader` Lens)

A crypto selection's Domain-Knowledge content defines a Lens `crypto-trader` over the base persona `decision-maker`. The Lens narrows the abstract decision-maker into someone who decides to buy, sell, or hold a token based on price, liquidity, and on-chain signals. A grading entry that uses this Lens carries:

```json
{
    "basePersonaId": "decision-maker",
    "lensId": "crypto-trader"
}
```

The Lens makes the persona's expectations concrete (price endpoints, slippage estimates) without inventing a fifth generalised persona.

### Example — Mobility (`mobility-planner` Lens)

The Mobility group's Domain-Knowledge content defines a Lens `mobility-planner` over the **same** base persona `decision-maker`. The Lens narrows the abstract decision-maker into someone who decides between transport options based on time, cost, and reliability:

```json
{
    "basePersonaId": "decision-maker",
    "lensId": "mobility-planner"
}
```

The two examples demonstrate the **re-use of the base persona** across domains. The Lens is what changes; the base persona slug remains `decision-maker` in both cases.

---

## Where Lenses are Defined

Lenses are defined in the **Domain-Knowledge content** of the relevant group, not in this spec and not in the personas folder of `flowmcp-spec`. The reasoning is:

- Lenses are domain-specific and change with domain knowledge — they belong with the rest of the group's conventions.
- The personas folder of `flowmcp-spec` is generalised and stable across domains.
- A new group can define its Lenses without coordinating a change in the Grading-Spec.

See [`10-domain-knowledge.md`](/grading/domain-knowledge/), section 6, for the binding obligation that the Domain-Knowledge content carries a Personas Reference section that lists the Lenses applicable to the group.

---

## Grading Effect

| Dimension | Determinism | Tier | Source (Area) |
|-----------|-------------|------|----------------|
| `personaUseCaseFit` | non-deterministic | group-bound | `selection-aggregate` |

**Binding rule.** A persona reference (`basePersonaId`, optionally narrowed by `lensId`) MUST be present for every **persona-bearing Area** (see [Persona Reference Contract](#persona-reference-contract-for-grading-entries)). The obligation follows the Area, not the determinism value: a persona-bearing Area without a `basePersonaId` is INVALID.

The Lens (`lensId`) when present refines the base persona but does NOT replace it. A grading entry MAY carry `basePersonaId` without a `lensId` when no domain Lens applies.

---

## Technical Schema-Persona Tier (added in 2.0.0)

> **Additive section — new in `gradingSpec/3.0.0`.** This tier is added on top of the existing
> base-persona contract ([Source of Truth](#source-of-truth)–[Grading Effect](#grading-effect)). The four generalised base personas and their Lens model remain
> unchanged and remain the single source of truth for `group-bound` (Selection / Task B) grading.
> This section introduces a **second, technical** persona tier used for autonomous schema
> preparation (Task A) grading.

### Definition

The spec recognises a tier of **technical Schema-Personas** that apply to the autonomous
provider-side Areas (`gradingTier = autonomous`). Unlike the four generalised base
personas — which describe end users and contributors of the corpus — technical Schema-Personas
describe the **review lenses** applied while a schema is being prepared for the corpus. They are
maintained at the repository level in `repos/flowmcp-grading/personas/`, not in
`repos/flowmcp-spec/personas/`.

| Schema-Persona | Slug | Review lens |
|----------------|------|-------------|
| Security Reviewer | `security-reviewer` | secrets, authentication, injection, data exposure |
| API Integration Engineer | `api-integration-engineer` | endpoint correctness, parameters, response handling ("does it actually work") |
| Documentation & DX Reviewer | `documentation-dx-reviewer` | descriptions, naming clarity, human-readable enums, about / skills text |

### Scope and Relationship to the Base Personas

- Technical Schema-Personas are used **only** for Task-A schema grading (`autonomous` tier, maximum
  grade B). They do **not** participate in the `group-bound` persona contract of [Persona Reference Contract](#persona-reference-contract-for-grading-entries) and [Grading Effect](#grading-effect) and do
  **not** satisfy the `selectionContext.personaIds[]` obligation, which still requires one of the
  four generalised base-persona slugs of [Source of Truth](#source-of-truth).
- The four generalised base personas ([Source of Truth](#source-of-truth)) and the Lens model ([Lens Concept](#lens-concept)–[Where Lenses are Defined](#where-lenses-are-defined)) are **unchanged**. New
  generalised base slugs still require a spec version bump (see [Persona Reference Contract](#persona-reference-contract-for-grading-entries)); the technical Schema-Personas are
  a distinct tier and do not extend the four generalised slugs.
- Conceptually, the technical Schema-Personas are closest to the base persona `schema-maintainer`,
  which already cares about test coverage, conventions, and grading feedback. They make that
  maintainer concern operational by splitting it into three review lenses.

### Ownership

The definitions of the technical Schema-Personas are owned by `repos/flowmcp-grading/personas/`
(see that folder's `README.md`). This spec recognises the tier and its three slugs; the persona
content (identity, review focus, sign-off / block criteria) lives in the grading repository.

---

## Cross-References

- `repos/flowmcp-spec/personas/` — the single source of truth for the four generalised personas and the Lens concept.
- `repos/flowmcp-spec/personas/persona-lens.md` — detailed description of the Lens concept.
- `repos/flowmcp-grading/personas/` — the technical Schema-Persona tier (see [Technical Schema-Persona Tier](#technical-schema-persona-tier-added-in-200)), owned by the grading repository.
- [`08-grading-model.md`](/grading/grading-model/) — the `persona` field and the persona obligation per Area.
- [`10-domain-knowledge.md`](/grading/domain-knowledge/), section 6 — Lens definition lives in the Domain-Knowledge content.
- [`13-skills.md`](/grading/skills/) — selection skills MUST carry persona focus on all three levels.

---

Technical Schema-Persona tier (see [Technical Schema-Persona Tier](#technical-schema-persona-tier-added-in-200)) added in `gradingSpec/3.0.0`.

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/), [`08-grading-model.md`](/grading/grading-model/), [`10-domain-knowledge.md`](/grading/domain-knowledge/)
- **Related:** Schemas-Spec sister-repo personas folder `repos/flowmcp-spec/personas/`, [`13-skills.md`](/grading/skills/)

