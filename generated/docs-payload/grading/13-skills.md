---
title: "Skills: Namespace Skill vs. Selection Skill"
description: "A skill carries a `type` (§2). The L1/L2/L3 **level** semantics described in this chapter apply **only to selection skills** (`type: 'selection'`). Namespace skills (`type: 'namespace'`) are a..."
grading_version: "2.0.0"
spec_file: "13-skills.md"
order: 13
section: "Grading"
normative: true
source_commit: "5971378"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/5971378/grading/2.0.0/13-skills.md"
generated_at: "2026-05-31T17:32:40.771Z"
generated_from: "grading/2.0.0/13-skills.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/13-skills.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md), [`11-about-convention.md`](./11-about-convention.md), [`12-personas-contract.md`](./12-personas-contract.md) |
| Related | Schemas-Spec v4.2.0 [`14-skills.md`](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.2.0/14-skills.md), [`10-domain-knowledge.md`](./10-domain-knowledge.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## 1. Opening Clarification

A skill carries a `type` (§2). The L1/L2/L3 **level** semantics described in this chapter apply **only to selection skills** (`type: 'selection'`). Namespace skills (`type: 'namespace'`) are a separate, simpler category and do NOT carry a level.

The two categories cover different scopes (a namespace versus a selection of namespaces) and accordingly different tiers in the sense of [`06-determinism-and-tier.md`](./06-determinism-and-tier.md): namespace-skill validation is `autonomous` (no group context required); selection-skill validation is `group-bound` (Domain-Knowledge content is required — see [`10-domain-knowledge.md`](./10-domain-knowledge.md)).

---

## 2. Skill Type and the `level` Extension

### 2.1 `type` (Schemas-Spec field)

The Schemas-Spec v4.2.0 distinguishes the three skill scopes via the `type` field. The relevant definition is at `repos/flowmcp-spec/spec/v4.2.0/14-skills.md`:

```text
| `type` | `string` | One of: `'namespace'`, `'selection'`, `'agent'` | … |
```

This Grading-Spec makes the **validation consequences** of each type explicit:

- `type: 'namespace'` → skill validation runs `autonomous` (graded by `namespace-skills`).
- `type: 'selection'` → skill validation runs `group-bound` (graded by `selection-skills-L1` / `-L2` / `-L3`, with the level read from the `level` extension below).
- `type: 'agent'` → unchanged at this spec version.

The Schemas-Spec caps the number of skills per selection / agent registration scope at **4** via rule **`SKL018`**. This Grading-Spec does NOT change the cap.

### 2.2 `level` (Grading-Spec extension)

`level` is a **Grading-Spec extension field**, not a Schemas-Spec field. It is **stored in the skill** and the grading **reads** it; the grading does not assign it. Values:

| Level | Name | Meaning |
|-------|------|---------|
| `L1` | Signpost | A broad entry point — a wayfinding skill that points to the topics and to the deeper skills. |
| `L2` | Topic | A topic area — groups related usecases and names the deeper usecase skills. |
| `L3` | Usecase | A concrete application — the deepest expansion, bound to a persona and a usecase. |

The L-semantics are **Signpost / Topic / Usecase**. They are **NOT** derived from a namespace count. A skill is L1/L2/L3 because of the role it plays (wayfinding, topic, usecase), not because it spans a particular number of namespaces.

**No level prefix in the name.** The skill name MUST NOT encode the level (use `crypto-price-entry`, never `l1-crypto-price-entry`). The level lives only in the `level` field.

---

## 3. Category 1 — Namespace Skill (`type: 'namespace'`)

| Property | Value |
|----------|-------|
| Scope | Exactly one namespace, one-dimensional. |
| Tier | `autonomous` (validation does NOT require group context). |
| Level | None. The `level` extension does NOT apply to namespace skills. |
| Persona requirement | OPTIONAL — namespace skills MAY but do not have to focus on a single persona. |

### 3.1 Mandatory Content (MUST)

A namespace skill MUST contain:

1. The **tools** of the namespace, listed with a one-sentence purpose each.
2. The **limitations** of the namespace, listed explicitly. Implementers MUST NOT omit limitations — under-stating limitations is the single most common skill anti-pattern.
3. A **reference to the namespace's About Resource** (see [`11-about-convention.md`](./11-about-convention.md)). When the namespace declares an About Resource, the skill MUST link or embed the reference.

### 3.2 Validation Obligations

A grader validating a namespace skill MUST check:

1. **Description neutrality.** The skill's description avoids marketing language and does not over-promise.
2. **About reference presence.** The link to the About Resource is present and resolves to a Resource conformant to [`11-about-convention.md`](./11-about-convention.md) §4.
3. **Explicit limitations.** The limitations section exists and lists at least one limitation.

### 3.3 Grading

Namespace skills are graded **per skill** by the `namespace-skills` Area; each skill has its own `_gradings/` folder.

| Dimension | Determinism | Tier |
|-----------|-------------|------|
| `namespaceSkillValidity` | deterministic + non-deterministic | autonomous |

The deterministic sub-part scores About-reference presence and limitations existence. The non-deterministic sub-part scores description neutrality and the quality of the limitations text.

---

## 4. Category 2 — Selection Skill (`type: 'selection'`, L1/L2/L3)

A selection skill declares a `level` (§2.2). The level reflects the role of the skill, not difficulty: L1 is the broad signpost, L3 is the persona-bound usecase deep dive.

### 4.1 Levels

| Level | Role | Mandatory content |
|-------|------|-------------------|
| **L1 — Signpost** | Wayfinding entry point | Which topics exist, which domain specifics matter, which personas the skill set targets; **limitations prominent**; names the L2 topic skills. |
| **L2 — Topic** | Topic area | Which namespaces and tools belong to the topic, references to each namespace's About Resource, persona focus; names the L3 usecase skills it covers. |
| **L3 — Usecase** | Concrete usecase | Which tools with which parameters for which usecase, bound to a persona focus; the deepest expansion. |

### 4.2 Binding Statements (MUST)

The following statements are binding for every selection skill at every level:

1. **Persona focus is mandatory on ALL three levels.** A selection skill at L1, L2, or L3 without a persona reference is INVALID.
2. **Limitations MUST be explicit on every level.** Limitations are the single most important skill task; a selection skill MUST list them prominently. Hiding limitations behind an "ask for details" gesture is non-conformant.
3. **Anti-recursion.** An L3 skill SHOULD call only L2 and L1 skills, **never another L3 skill**. The rule prevents the runaway recursion that occurs when each level expands by referencing the next deepest level.

The skill quality standards (character counts, mandatory section ordering, fixed templates) are intentionally NOT fixed at this spec version — room for experimentation is preserved.

### 4.3 Per-Skill Grading and the Predecessor Chain

Selection skills are graded **per skill**, not per level cohort. Each skill has its own `_gradings/` folder and is graded by the Area matching its level (`selection-skills-L1` / `-L2` / `-L3`).

The grading entry MUST carry the `skillId` so that the per-skill result is addressable.

There is a **predecessor chain**: an L2 skill grading needs the grades of **its** L1 predecessors, and an L3 skill grading needs the grades of **its** L2 predecessors. A missing predecessor grade blocks the dependent skill's grading (recorded as a status reason, not a silent skip).

### 4.4 Grading Dimensions

| Dimension | Determinism | Tier | Source (Area) |
|-----------|-------------|------|----------------|
| `selectionSkillL1` | non-deterministic | group-bound | `selection-skills-L1` |
| `selectionSkillL2` | non-deterministic | group-bound | `selection-skills-L2` |
| `selectionSkillL3` | non-deterministic | group-bound | `selection-skills-L3` |
| `skillLimitationsExplicit` (per level) | deterministic + non-deterministic | group-bound | per-skill Area |
| `skillPersonaFocus` (per level) | non-deterministic | group-bound | per-skill Area |

All dimensions are `group-bound` — a selection-skill validation contributes to `aggregateGrade ≥ A` attainability (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §5 rule 4).

---

## 5. Cross-Reference Rules (deterministic)

Selection skills carry **deterministic cross-reference rules** that bind the level chain together. They are checked by a deterministic detector over the skills' content, description, and `whenToUse` text.

| Rule | Statement | Error code |
|------|-----------|------------|
| **Rule A** | Every **L1 (Signpost)** skill MUST name every **L2 (Topic)** skill verbatim. | `SKC-001` (Rule A violation) |
| **Rule B** | Every **L3 (Usecase)** skill MUST be named in **at least one L2 (Topic)** skill. | `SKC-002` (Rule B violation) |
| (chain integrity) | A named cross-reference target that does not resolve to an existing skill at the expected level. | `SKC-003` (dangling cross-reference) |

The codes `SKC-001` / `SKC-002` / `SKC-003` are registered in the grading `ErrorCodes` table. The rules are deterministic: a verbatim name match either exists or it does not.

---

## 6. Relationship Between the Two Categories

The guiding statement is:

> A namespace skill is the **stripped-down variant** of a selection skill.

A selection-skill validation can therefore be **conceptually** decomposed into several namespace-skill validations plus the group-level aspects (Domain-Knowledge alignment, persona focus, anti-recursion). The decomposition is a useful **implementation hint** for graders — it is NOT a mandatory implementation strategy.

The two categories share:

- The about-reference obligation (namespace skill MUST reference the namespace's About Resource; selection skill at L2 MUST reference its included namespaces' About Resources).
- The explicit-limitations obligation (§3.1 sec. 2; §4.2 sec. 2).

The two categories differ on:

- The persona obligation (OPTIONAL for namespace, MUST for selection at every level).
- The level (none for namespace, L1/L2/L3 for selection).
- The tier (autonomous for namespace, group-bound for selection).

---

## 7. Relationship to the Schemas-Spec v4.2.0

The Schemas-Spec v4.2.0 [`14-skills.md`](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.2.0/14-skills.md) declares the `type` field with values `'namespace'`, `'selection'`, `'agent'`. The tier consequences of these values are the binding interpretation of the `type` values for grading purposes (§2.1).

The `level` field (§2.2) is a **Grading-Spec extension** — it is not part of the Schemas-Spec skill object. A v4.2 schema-validator MUST NOT reject a skill for carrying or omitting `level`; the field is read only by the grader.

The Schemas-Spec rule `SKL018` (max 4 skills per selection / agent registration scope) is preserved without modification.

---

## 8. Cross-References

- Schemas-Spec v4.2.0 [`14-skills.md`](https://github.com/FlowMCP/flowmcp-spec/blob/main/spec/v4.2.0/14-skills.md) — the `type` field and the `SKL018` limit.
- [`11-about-convention.md`](./11-about-convention.md) — the About-Resource obligation that skills reference.
- [`12-personas-contract.md`](./12-personas-contract.md) — the persona contract that the persona focus draws from.
- [`10-domain-knowledge.md`](./10-domain-knowledge.md) — the soft 5 / hard 7 thresholds that determine whether a selection skill is allowed at full scope.
- [`05-phases-selection.md`](./05-phases-selection.md) — the `selection-skills-L1` / `-L2` / `-L3` Areas (per-skill grading).
- [`08-grading-model.md`](./08-grading-model.md) — the dimensions `namespaceSkillValidity`, `selectionSkillL1`, `selectionSkillL2`, `selectionSkillL3`.
