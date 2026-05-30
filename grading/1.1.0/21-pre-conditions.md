# 21 — Universal Pre-Condition Requirement (§20)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`06-determinism-and-tier.md`](./06-determinism-and-tier.md), [`08-grading-model.md`](./08-grading-model.md), [`16-selection-lockfile.md`](./16-selection-lockfile.md) |
| Related | [`11-about-convention.md`](./11-about-convention.md), [`15-versioning-axes.md`](./15-versioning-axes.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs 1.0.0:** an entirely new section §20 (universal pre-condition requirement). The central anchoring point for a rule that is referenced in §11 and §19.

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §20 Pre-Conditions

This section is the **central anchoring point** for the pre-condition requirement. It was generalised from the Selection pre-condition into a **universal rule**: all aggregated checks (Selection gradings, about verifications) are blocked until all member schemas carry `gradingStatus: stable`.

### §20.1 Universal Rule

> Aggregated checks (all checks that operate across multiple schemas — namely Selection gradings and about verifications) are blocked until ALL member schemas in the current lockfile carry `gradingStatus: "stable"`.

This rule is universal. It is made concrete in §11.3 (Selection workflow step 0) and §19.3 (about verification step 0), but anchored here.

### §20.2 Stable Definition

A schema has `gradingStatus: "stable"` when the last operation in its `gradings/` folder was a `mode: "full"` grading with `aggregateGrade` in `{A, B}` (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8.2).

A schema bump (`schemaHash` changes, see [`15-versioning-axes.md`](./15-versioning-axes.md) §10) invalidates `stable` — the status falls back to `"pending"`. Rationale: a new `schemaHash` means, by definition, that the schema object has changed — the previous evaluation no longer applies.

| Condition | Result |
|-----------|--------|
| Last grading `mode=full` AND `aggregateGrade in {A,B}` | `stable` |
| Last grading `mode=full` AND `aggregateGrade in {C,D,F,REJECTED}` | `pending` |
| Last grading `mode=partial` (regardless of grade) | stays at the last Full status |
| `schemaHash` changed since the last Full | `pending` (invalidated) |
| No `mode=full` has ever run | `pending` |

### §20.3 Scope of Application

The pre-condition applies to **aggregated checks**, not to tier-level checks:

| Check | Pre-condition active? |
|-------|----------------------|
| Single grading | No (tier-level, no aggregation) |
| Selection grading | Yes (all members stable) |
| About verification (Namespace) | Yes (all `namespace.json` members stable) |
| About verification (Selection) | Yes (all `selection.lock.json` members stable) |

Four check classes, three of which require the pre-condition.

### §20.4 Block Behaviour

When the pre-condition is not met:

- The check is **aborted** (BLOCK)
- The list of `pending` members is printed (toolchain requirement)
- Recommended follow-up action: complete the missing Single gradings

Example output (toolchain):

```
PRE-CONDITION FAILED — selection-grading blocked
Selection: crypto-domain-full
Lockfile: selection/crypto-domain-full/selection.lock.json
Pending Members:
  - binance.ticker (schemaHash a1b2c3d4, last grading partial)
  - jupiter.swap (schemaHash c3d4e5f6, never graded as full)
Follow-up action: complete the Single gradings, then regenerate the lockfile.
```

### §20.5 Cross-References

- Tier-trim — Full vs Partial → [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8
- Selection workflow step 0 → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.3
- About verification step 0 → [`11-about-convention.md`](./11-about-convention.md) §19.3
- Version bump invalidates `stable` → [`15-versioning-axes.md`](./15-versioning-axes.md) §10.4
- Flywheel loop (pre-condition as a gate) → [`18-flywheel-loop.md`](./18-flywheel-loop.md) §16
- Pre-condition validator implementation (shared between the about and selection paths) → defined by the grader implementation
